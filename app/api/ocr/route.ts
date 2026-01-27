import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const OCR_TIMEOUT_MS = 60_000;

function truncateText(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

function getTesseractWorkerPath() {
  // En Next/Turbopack, `require.resolve()` puede devolver rutas con placeholders tipo "[project]"
  // que NO son rutas reales en disco y fallan con ERR_WORKER_PATH / MODULE_NOT_FOUND.
  // Preferimos construir una ruta real desde el root del proyecto.
  const projectRoot = process.cwd();

  const candidates = [
    path.join(projectRoot, 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js'),
  ];

  for (const abs of candidates) {
    if (fs.existsSync(abs)) return abs;
  }

  // Fallback: intentar resolver por Node y normalizar si viene con "[project]".
  try {
    const require = createRequire(import.meta.url);
    const pkgPath = require.resolve('tesseract.js/package.json');
    const pkgDir = path.dirname(pkgPath);
    const absPath = path.join(pkgDir, 'src', 'worker-script', 'node', 'index.js');

    const normalized = absPath.replace(/\[project\]/gi, projectRoot);
    if (fs.existsSync(normalized)) return normalized;
    if (fs.existsSync(absPath)) return absPath;
  } catch {
    // ignore
  }

  throw new Error('No se pudo localizar el worker de Tesseract.js en node_modules');
}

async function extractPdfTextWithPdfjs(buffer: Buffer) {
  const pdfjs: any = pdfjsLib as any;
  try {
    // En Next/Turbopack a veces intenta levantar "fake worker" aunque disableWorker sea true.
    // Forzamos a no usar worker.
    if (pdfjs?.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = '';
      pdfjs.GlobalWorkerOptions.workerPort = null;
    }
  } catch {
    // ignore
  }

  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const doc = await loadingTask.promise;

  let text = '';
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = (content.items || [])
      .map((it: any) => (typeof it?.str === 'string' ? it.str : ''))
      .filter(Boolean);
    if (strings.length) {
      text += strings.join(' ') + '\n';
    }
  }

  return text;
}

async function withTimeout<T>(promise: Promise<T>, ms: number) {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Tiempo de espera agotado')), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const archivo = formData.get('archivo') as File | null;

    if (!archivo) {
      return NextResponse.json({ error: 'Falta archivo' }, { status: 400 });
    }

    if (archivo.size > MAX_FILE_SIZE) {
      const sizeInMB = (archivo.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `El archivo es demasiado grande (${sizeInMB} MB). Máximo permitido: 25 MB.` },
        { status: 413 }
      );
    }

    const tipo = archivo.type || '';
    const nombre = archivo.name || '';

    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let textoExtraido = '';
    let metodo: 'pdfjs-dist' | 'mammoth' | 'tesseract' | 'none' = 'none';

    if (tipo === 'application/pdf' || nombre.toLowerCase().endsWith('.pdf')) {
      try {
        const extractedTextRaw = await withTimeout(extractPdfTextWithPdfjs(buffer), OCR_TIMEOUT_MS);
        const extractedText = extractedTextRaw
          .replace(/\u0000/g, '')
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

        console.log('📄 OCR/PDF pdfjs:', {
          nombre,
          tipo,
          rawLength: extractedTextRaw.length,
          cleanedLength: extractedText.length,
        });

        if (extractedText.trim().length > 0) {
          textoExtraido = extractedText;
          metodo = 'pdfjs-dist';
        }
      } catch (error: any) {
        console.error('❌ Error pdfjs-dist:', {
          nombre,
          tipo,
          mensaje: error?.message,
        });
      }

      if (!textoExtraido.trim()) {
        // OCR de PDFs escaneados requiere convertir páginas a imagen. En esta implementación
        // inicial devolvemos texto vacío para no bloquear el flujo.
        metodo = 'none';
      }
    } else if (
      tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      nombre.toLowerCase().endsWith('.docx')
    ) {
      const result = await withTimeout(mammoth.extractRawText({ buffer }), OCR_TIMEOUT_MS);
      textoExtraido = result?.value || '';
      metodo = 'mammoth';
    } else if (tipo.startsWith('image/')) {
      const workerPath = getTesseractWorkerPath();
      console.log('🧠 OCR/Tesseract workerPath:', workerPath);

      const worker: any = await withTimeout(
        // tesseract.js@7: createWorker(langs?, oem?, options?)
        (createWorker as any)(['spa'], undefined, {
          workerPath,
        }),
        OCR_TIMEOUT_MS
      );

      try {
        const result: any = await withTimeout(worker.recognize(buffer), OCR_TIMEOUT_MS);
        textoExtraido = result?.data?.text || '';
        metodo = 'tesseract';
      } finally {
        try {
          await worker.terminate();
        } catch {
          // ignore
        }
      }
    }

    textoExtraido = truncateText(textoExtraido, 200_000);

    return NextResponse.json({
      success: true,
      texto_extraido: textoExtraido,
      metodo,
      tipo,
      nombre,
    });
  } catch (error: any) {
    console.error('💥 Error en /api/ocr:', error);
    return NextResponse.json(
      { error: 'Error interno en OCR', mensaje: error.message },
      { status: 500 }
    );
  }
}
