import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Datos recibidos (tamaño del file):', body.file?.length || 0);
    
    const { file, sistema, rutaRelativa, nombreOriginal } = body;
    
    if (!file || !sistema || !rutaRelativa) {
      return NextResponse.json(
        { error: 'Faltan datos: necesito file, sistema y rutaRelativa' },
        { status: 400 }
      );
    }

    // Verificar tamaño del archivo (20 MB = 20 * 1024 * 1024 bytes)
    const base64Data = file.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4; // Tamaño aproximado del archivo
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    console.log('📊 Tamaño del archivo:', sizeInMB.toFixed(2), 'MB');
    
    if (sizeInMB > 20) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande (${sizeInMB.toFixed(2)} MB). El límite es 20 MB.` },
        { status: 413 }
      );
    }
    
    // Convertir de base64 a bytes
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer]);
    
    // Usar el nombre original si viene, si no, generar uno
    let fileName = nombreOriginal || 'documento';
    
    // Si no tiene extensión, extraerla del tipo MIME
    if (!fileName.includes('.')) {
      const mimeType = file.split(',')[0].split(':')[1].split(';')[0];
      let extension = '.pdf';
      
      if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) extension = '.jpg';
      else if (mimeType.includes('image/png')) extension = '.png';
      else if (mimeType.includes('application/msword')) extension = '.doc';
      else if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) extension = '.docx';
      
      fileName = `${fileName}-${Date.now()}${extension}`;
    }
    
    console.log('📄 Nombre del archivo:', fileName);

    // Preparar FormData
    const formData = new FormData();
    formData.append('archivo', blob, fileName);
    formData.append('sistema', sistema);
    formData.append('rutaRelativa', rutaRelativa);

    console.log('📤 Enviando al servidor externo...');

    // Enviar al servidor externo con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de timeout

    try {
      const uploadResponse = await fetch(
        'https://sanjuandelrio.sytes.net:3030/upload',
        {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      // Leer la respuesta como texto primero para debugging
      const responseText = await uploadResponse.text();
      console.log('📥 Respuesta del servidor:', responseText);

      if (!uploadResponse.ok) {
        console.error('❌ Error del servidor (status):', uploadResponse.status);
        console.error('❌ Error del servidor (texto):', responseText);
        
        return NextResponse.json(
          { 
            error: 'El servidor externo no pudo procesar el archivo',
            detalles: `Status: ${uploadResponse.status}`,
            respuesta: responseText.substring(0, 500) // Solo los primeros 500 caracteres
          },
          { status: uploadResponse.status }
        );
      }

      // Intentar parsear como JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ La respuesta no es JSON válido');
        return NextResponse.json(
          { error: 'El servidor devolvió una respuesta inválida' },
          { status: 500 }
        );
      }

      console.log('✅ Archivo subido exitosamente:', result);
      return NextResponse.json(result);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Timeout: El servidor tardó demasiado en responder');
        return NextResponse.json(
          { error: 'El servidor tardó demasiado en responder (timeout de 60 segundos)' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('💥 Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        mensaje: error.message,
        tipo: error.name
      },
      { status: 500 }
    );
  }
}