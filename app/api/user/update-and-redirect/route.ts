import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { updateUserProfile, getUserById } from '@/lib/db';

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

    const userRole = payload.id_rol;
    let nombreCompleto = null;
    let nomSecre: string | undefined;

    // Si hay cusToken, intentar actualizar el nombre
    if (cusToken) {
      // Obtener X-API-KEY desde variables de entorno
      const apiKey = process.env.CUS_API_KEY?.trim().replace(/^["']|["']$/g, '') || '';
      
      if (!apiKey) {
        console.error('❌ CUS_API_KEY no está configurada o está vacía en las variables de entorno');
        return NextResponse.json(
          { error: 'CUS_API_KEY no está configurada' },
          { status: 500 }
        );
      }

      // Headers para la petición a la API externa
      const headers: HeadersInit = {
        'Authorization': `Bearer ${cusToken}`,
        'X-API-KEY': apiKey,
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'User-Agent': 'PostmanRuntime/7.51.0',
      };

      try {
        // Realizar la petición a la API externa
        const response = await fetch(INFO_API_URL, {
          method: 'POST',
          headers: headers,
        });

        if (response.ok) {
          const textResponse = await response.text();
          const trimmedResponse = textResponse.trim();
          const isActuallyJson = trimmedResponse.startsWith('{') || trimmedResponse.startsWith('[');
          
          if (isActuallyJson) {
            const responseData = JSON.parse(textResponse);
            nombreCompleto = responseData?.data?.nombre_completo;
            nomSecre = responseData?.data?.departamento
              ? String(responseData.data.departamento).trim()
              : undefined;

            if (nombreCompleto || nomSecre) {
              await updateUserProfile(payload.id_usuarios, {
                nombre_usuario: nombreCompleto,
                nom_secre: nomSecre,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener información del CUS:', error);
        // No fallamos completamente si no podemos obtener el nombre del CUS
      }
    }

    // Obtener información actualizada del usuario
    const user = await getUserById(payload.id_usuarios);

    return NextResponse.json({
      success: true,
      userRole: userRole,
      nombre_completo: nombreCompleto || user?.nombre_usuario || null,
      user: {
        id_usuarios: payload.id_usuarios,
        id_rol: userRole,
        nombre_usuario: user?.nombre_usuario || null,
        nom_secre: user?.nom_secre || null,
      },
    });

  } catch (error: unknown) {
    console.error('Error en el proceso combinado:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de autenticación' },
      { status: 500 }
    );
  }
}
