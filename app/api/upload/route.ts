import { NextRequest, NextResponse } from 'next/server';

// Límite máximo de archivo en bytes (25 MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Leer FormData entrante (desde el hook)
    const formData = await req.formData();

    const archivo = formData.get('archivo') as File | null;
    const sistema = formData.get('sistema')?.toString();
    const rutaRelativa = formData.get('rutaRelativa')?.toString();

    // 2️⃣ Validaciones básicas
    if (!archivo || !sistema || !rutaRelativa) {
      return NextResponse.json(
        { error: 'Faltan datos: archivo, sistema o rutaRelativa' },
        { status: 400 }
      );
    }

    // 2.5️⃣ Validar tamaño del archivo
    if (archivo.size > MAX_FILE_SIZE) {
      const sizeInMB = (archivo.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `El archivo es demasiado grande (${sizeInMB} MB). Máximo permitido: 25 MB.` },
        { status: 413 }
      );
    }

    console.log('📄 Archivo recibido:', {
      nombre: archivo.name,
      tipo: archivo.type,
      size: archivo.size,
    });
    console.log('📂 Sistema:', sistema);
    console.log('📁 Ruta:', rutaRelativa);

    // 3️⃣ Preparar FormData para el servidor externo
    const uploadForm = new FormData();

    // 🔴 IMPORTANTE: primero sistema y ruta
    uploadForm.append('sistema', sistema);
    uploadForm.append('rutaRelativa', rutaRelativa);

    // 🔴 Después el archivo
    uploadForm.append('archivo', archivo, archivo.name);

    // 4️⃣ Enviar al servidor externo
    const response = await fetch(
      'https://sanjuandelrio.sytes.net:3030/upload',
      {
        method: 'POST',
        body: uploadForm,
      }
    );

    // 5️⃣ Leer respuesta como TEXTO (no JSON directo)
    const responseText = await response.text();
    const contentType = response.headers.get('content-type');

    console.log(
      '📥 Respuesta servidor externo:',
      responseText.substring(0, 500)
    );

    // 6️⃣ Si el servidor externo falló
    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Error del servidor externo',
          status: response.status,
          respuesta: responseText.substring(0, 500),
        },
        { status: response.status }
      );
    }

    // 7️⃣ Verificar que realmente sea JSON
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        {
          error: 'El servidor externo no devolvió JSON',
          respuesta: responseText.substring(0, 500),
        },
        { status: 500 }
      );
    }

    // 8️⃣ Parsear JSON con seguridad
    const data = JSON.parse(responseText);

    console.log('✅ Archivo subido correctamente:', data);

    // 9️⃣ Responder al frontend
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('💥 Error en /api/upload:', error);
    return NextResponse.json(
      {
        error: 'Error interno en el API de subida',
        mensaje: error.message,
      },
      { status: 500 }
    );
  }
}
