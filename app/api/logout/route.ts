import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { deleteSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = await getTokenFromCookies();

    if (token) {
      // Verificar token para obtener información del usuario
      const payload = await verifyToken(token);
      
      // Eliminar sesión de la base de datos usando id_usuarios
      if (payload && payload.id_usuarios) {
        await deleteSession(payload.id_usuarios);
      }
    }

    // Crear respuesta
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Sesión cerrada exitosamente' 
      },
      { status: 200 }
    );

    // Eliminar cookie
    response.cookies.delete('auth-token');

    return response;

  } catch (error: any) {
    console.error('Error en API de logout:', error);
    
    // Aún así, eliminar la cookie
    const response = NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
    
    response.cookies.delete('auth-token');
    return response;
  }
}
