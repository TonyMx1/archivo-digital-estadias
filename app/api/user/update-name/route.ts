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

    const apiKey = process.env.CUS_API_KEY?.trim().replace(/^["']|["']$/g, '') || '';

    if (!apiKey) {
      console.error('CUS_API_KEY no está configurada o está vacía en las variables de entorno');
      return NextResponse.json(
        { error: 'CUS_API_KEY no está configurada' },
        { status: 500 }
      );
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${cusToken}`,
      'X-API-KEY': apiKey,
      'Content-Length': '0',
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'User-Agent': 'PostmanRuntime/7.51.0',
    };

    const headersForRequest = new Headers(headers);
    headersForRequest.delete('Content-Length');

    const response = await fetch(INFO_API_URL, {
      method: 'POST',
      headers: headersForRequest,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          await response.text();
          errorMessage = `Error ${response.status}. La API devolvió un formato inesperado.`;
        }
      } catch {
        // Ignorar errores al leer el body de error
      }

      return NextResponse.json(
        { error: `Error al obtener información del usuario: ${errorMessage}` },
        { status: response.status }
      );
    }

    const textResponse = await response.text();
    const trimmedResponse = textResponse.trim();
    const isActuallyJson = trimmedResponse.startsWith('{') || trimmedResponse.startsWith('[');

    if (!isActuallyJson) {
      if (textResponse.includes('Fatal error') || textResponse.includes('Warning')) {
        return NextResponse.json(
          {
            error: 'La API externa está experimentando problemas técnicos. Por favor, intenta más tarde.',
            details: 'Error del servidor de la API externa',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'La API devolvió un formato inesperado (no JSON). Verifica el token del CUS y la API key.' },
        { status: 500 }
      );
    }

    let responseData: { data?: { nombre_completo?: string } };
    try {
      responseData = JSON.parse(textResponse) as { data?: { nombre_completo?: string } };
    } catch (parseError) {
      console.error('Error al parsear JSON de la respuesta:', parseError);
      console.error('Respuesta que falló al parsear (primeros 500 caracteres):', textResponse.substring(0, 500));
      return NextResponse.json(
        { error: 'Error al procesar la respuesta de la API (JSON inválido)' },
        { status: 500 }
      );
    }

    const nombreCompleto = responseData?.data?.nombre_completo;

    if (!nombreCompleto) {
      return NextResponse.json(
        { error: 'No se pudo obtener información del usuario desde CUS' },
        { status: 400 }
      );
    }

    await updateUserProfile(payload.id_usuarios, {
      nombre_usuario: nombreCompleto,
    });

    return NextResponse.json({
      success: true,
      nombre_completo: nombreCompleto,
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
