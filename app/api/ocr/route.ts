import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar que sea un PDF
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un PDF' },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extraer texto del PDF
    let pdfText = '';
    try {
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text;
    } catch (error) {
      console.error('Error al parsear PDF:', error);
      return NextResponse.json(
        { error: 'Error al procesar el PDF. Asegúrate de que el archivo no esté corrupto.' },
        { status: 500 }
      );
    }

    // Si el PDF tiene texto extraíble, retornarlo
    if (pdfText.trim().length > 0) {
      return NextResponse.json({
        success: true,
        text: pdfText,
        method: 'pdf-parse',
        message: 'Texto extraído exitosamente del PDF'
      });
    }

    // Si no hay texto extraíble, retornar mensaje
    // Nota: Para OCR completo de PDFs escaneados, necesitarías convertir el PDF a imágenes primero
    // usando una librería como pdf2pic. Por ahora, retornamos el texto extraído del PDF.
    return NextResponse.json({
      success: true,
      text: pdfText || 'No se pudo extraer texto del PDF. El archivo puede estar escaneado o protegido.',
      method: 'pdf-parse',
      message: pdfText ? 'Texto extraído del PDF' : 'PDF procesado pero sin texto extraíble. Se requiere OCR de imágenes (funcionalidad en desarrollo).'
    });

  } catch (error: any) {
    console.error('Error en API de OCR:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para búsqueda de texto en PDFs procesados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Parámetro de búsqueda requerido' },
        { status: 400 }
      );
    }

    // Por ahora, retornamos un mensaje indicando que la búsqueda está en desarrollo
    // En el futuro, aquí buscarías en una base de datos de PDFs procesados
    return NextResponse.json({
      success: true,
      query: query,
      results: [],
      message: 'Búsqueda realizada (funcionalidad en desarrollo)'
    });

  } catch (error: any) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
