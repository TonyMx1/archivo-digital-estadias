import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getSecretarias, hasPermission } from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

// Obtener todas las secretarías
export async function GET() {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar permiso para ver secretarías
    const canView = await hasPermission(payload.id_rol, PERMISOS.VER_SECRETARIAS);
    if (!canView) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver secretarías' },
        { status: 403 }
      );
    }

    const secretarias = await getSecretarias();

    return NextResponse.json({
      success: true,
      secretarias,
    });
  } catch (error) {
    console.error('Error al obtener secretarías:', error);
    return NextResponse.json(
      { error: 'Error al obtener secretarías' },
      { status: 500 }
    );
  }
}
