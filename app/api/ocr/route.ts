import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';

export const runtime = 'nodejs';

function parsePositiveEnvInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const OCR_TIMEOUT_MS = parsePositiveEnvInt(process.env.OCR_TIMEOUT_MS, 180_000);
const MAX_OCR_TEXT_CHARS = parsePositiveEnvInt(process.env.OCR_MAX_TEXT_CHARS, 200_000);

function truncateText(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

function getTesseractWorkerPath() {
  const projectRoot = process.cwd();
  const candidates = [
    path.join(projectRoot, 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js'),
  ];

  for (const abs of candidates) {
    if (fs.existsSync(abs)) return abs;
  }

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

function getTesseractLanguageOptions(langCode: string) {
  const projectRoot = process.cwd();
  const trainedDataCandidates = [
    path.join(projectRoot, `${langCode}.traineddata`),
    path.join(projectRoot, 'ocr', `${langCode}.traineddata`),
    path.join(projectRoot, 'public', 'ocr', `${langCode}.traineddata`),
  ];
  const localTrainedData = trainedDataCandidates.find((candidate) => fs.existsSync(candidate));

  if (!localTrainedData) {
    return {};
  }

  return {
    langPath: path.dirname(localTrainedData),
    gzip: false,
  };
}

async function extractPdfTextWithPdfjs(buffer: Buffer) {
  const pdfjs: any = pdfjsLib as any;
  try {
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
        { error: `El archivo es demasiado grande (${sizeInMB} MB). Maximo permitido: 25 MB.` },
        { status: 413 }
      );
    }

    const tipo = archivo.type || '';
    const nombre = archivo.name || '';
    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let textoExtraido = '';
    let ocrError: string | null = null;
    let metodo: 'pdfjs-dist' | 'mammoth' | 'tesseract' | 'none' = 'none';

    if (tipo === 'application/pdf' || nombre.toLowerCase().endsWith('.pdf')) {
      try {
        const extractedTextRaw = await withTimeout(extractPdfTextWithPdfjs(buffer), OCR_TIMEOUT_MS);
        const extractedText = extractedTextRaw
          .replace(/\u0000/g, '')
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

        if (extractedText.trim().length > 0) {
          textoExtraido = extractedText;
          metodo = 'pdfjs-dist';
        } else {
          ocrError =
            'PDF sin capa de texto detectable. Si el archivo es escaneado, se requiere OCR por imagen.';
        }
      } catch (error: any) {
        ocrError = error?.message || 'Fallo la extraccion con PDF.js';
      }
    } else if (
      tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      nombre.toLowerCase().endsWith('.docx')
    ) {
      try {
        const result = await withTimeout(mammoth.extractRawText({ buffer }), OCR_TIMEOUT_MS);
        textoExtraido = result?.value || '';
        metodo = 'mammoth';
      } catch (error: any) {
        ocrError = error?.message || 'Fallo la extraccion con Mammoth';
      }
    } else if (tipo.startsWith('image/')) {
      const workerPath = getTesseractWorkerPath();
      const languageOptions = getTesseractLanguageOptions('spa');
      const cachePath = path.join(process.cwd(), '.cache', 'tesseract');
      fs.mkdirSync(cachePath, { recursive: true });

      let worker: any = null;

      try {
        worker = await withTimeout(
          (createWorker as any)(['spa'], undefined, {
            workerPath,
            cachePath,
            cacheMethod: 'write',
            ...languageOptions,
          }),
          OCR_TIMEOUT_MS
        );

        const result: any = await withTimeout(worker.recognize(buffer), OCR_TIMEOUT_MS);
        textoExtraido = result?.data?.text || '';
        metodo = 'tesseract';
      } catch (error: any) {
        ocrError = error?.message || 'Fallo OCR con Tesseract';
      } finally {
        if (worker) {
          try {
            await worker.terminate();
          } catch {
            // ignore
          }
        }
      }
    }

    textoExtraido = truncateText(textoExtraido, MAX_OCR_TEXT_CHARS);

    return NextResponse.json({
      success: true,
      texto_extraido: textoExtraido,
      metodo,
      tipo,
      nombre,
      ocr_error: ocrError,
    });
  } catch (error: any) {
    console.error('Error en /api/ocr:', error);
    return NextResponse.json(
      { error: 'Error interno en OCR', mensaje: error.message },
      { status: 500 }
    );
  }
}
