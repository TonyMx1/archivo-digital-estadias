import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { updateSessionActivity, getSessionByUserId } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const payload = await verifyToken(token);

    if (!payload || !payload.id_usuarios) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar que la sesión existe y está activa en la BD
    const session = await getSessionByUserId(payload.id_usuarios);
    
    if (!session) {
      // Sesión expirada o no existe
      const response = NextResponse.json(
        { error: 'Sesión expirada' },
        { status: 401 }
      );
      response.cookies.delete('auth-token');
      return response;
    }

    // Actualizar última actividad usando id_usuarios
    await updateSessionActivity(payload.id_usuarios);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
