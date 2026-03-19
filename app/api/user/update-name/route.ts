import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { updateUserProfile } from '@/lib/db';

const INFO_API_URL = `${process.env.INFO_API_URL}`;

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario esté autenticado
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.id_usuarios) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener el token del CUS del body
    const body = await request.json();
    const { cusToken } = body;

    if (!cusToken) {
      return NextResponse.json(
        { error: 'Token del CUS requerido' },
        { status: 400 }
      );
    }

    // Llamar a la API de info_general para obtener el nombre_completo
    // Configuración basada en Postman que funciona correctamente
    // Obtener X-API-KEY desde variables de entorno
    // Limpiar y obtener la API key (eliminar comillas y espacios)
    const apiKey = process.env.CUS_API_KEY?.trim().replace(/^["']|["']$/g, '') || '';
    
    if (!apiKey) {
      console.error('❌ CUS_API_KEY no está configurada o está vacía en las variables de entorno');
      console.error('💡 Verifica que CUS_API_KEY esté en la línea 9 de tu .env.local');
      return NextResponse.json(
        { error: 'CUS_API_KEY no está configurada' },
        { status: 500 }
      );
    }

    // Headers exactos como en Postman (incluyendo Content-Length: 0)
    const headers: HeadersInit = {
      'Authorization': `Bearer ${cusToken}`,
      'X-API-KEY': apiKey,
      'Content-Length': '0',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'User-Agent': 'PostmanRuntime/7.51.0', // Simular Postman para compatibilidad
    };

    // Realizar la petición GET
    // Nota: El servidor PHP puede tener problemas con Content-Length en GET
    // Probamos sin Content-Length primero, ya que Node.js lo maneja automáticamente
    const headersForRequest = new Headers(headers);
    headersForRequest.delete('Content-Length');
    
    const response = await fetch(INFO_API_URL, {
      method: 'POST',
      headers: headersForRequest,
      // No incluir body en GET
    });

    // Verificar el Content-Type antes de procesar
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      // Intentar obtener el mensaje de error
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          // Si no es JSON, leer como texto para ver qué devolvió
          await response.text();
          errorMessage = `Error ${response.status}. La API devolvió un formato inesperado.`;
        }
      } catch {
        // Error al leer respuesta
      }
      return NextResponse.json(
        { error: `Error al obtener información del usuario: ${errorMessage}` },
        { status: response.status }
      );
    }

    // Leer la respuesta como texto primero para verificar si realmente es JSON
    const textResponse = await response.text();
    
    // Verificar si realmente es JSON (debe empezar con { o [)
    const trimmedResponse = textResponse.trim();
    const isActuallyJson = trimmedResponse.startsWith('{') || trimmedResponse.startsWith('[');
    
    if (!isActuallyJson) {
      // Si la respuesta contiene un error de PHP, informar al usuario
      if (textResponse.includes('Fatal error') || textResponse.includes('Warning')) {
        console.error('⚠️ La API externa está devolviendo un error de PHP. Esto puede ser un problema temporal del servidor.');
        return NextResponse.json(
          { 
            error: 'La API externa está experimentando problemas técnicos. Por favor, intenta más tarde.',
            details: 'Error del servidor de la API externa'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'La API devolvió un formato inesperado (no JSON). Verifica el token del CUS y la API key.' },
        { status: 500 }
      );
    }

    // Si es JSON, parsearlo
    let responseData;
    try {
      responseData = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('Error al parsear JSON de la respuesta:', parseError);
      console.error('Respuesta que falló al parsear (primeros 500 caracteres):', textResponse.substring(0, 500));
      return NextResponse.json(
        { error: 'Error al procesar la respuesta de la API (JSON inválido)' },
        { status: 500 }
      );
    }
    
    // Extraer nombre_completo de data.nombre_completo
    const nombreCompleto = responseData?.data?.nombre_completo;
    const nomSecre = responseData?.data?.departamento
      ? String(responseData.data.departamento).trim()
      : undefined;

    if (!nombreCompleto && !nomSecre) {
      return NextResponse.json(
        { error: 'No se pudo obtener información del usuario desde CUS' },
        { status: 400 }
      );
    }

    // Actualizar datos sincronizados desde CUS
    await updateUserProfile(payload.id_usuarios, {
      nombre_usuario: nombreCompleto,
      nom_secre: nomSecre,
    });

    return NextResponse.json({
      success: true,
      nombre_completo: nombreCompleto,
      nom_secre: nomSecre,
      message: 'Datos del usuario actualizados exitosamente',
    });

  } catch (error: unknown) {
    console.error('Error al actualizar nombre del usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el nombre del usuario' },
      { status: 500 }
    );
  }
}
