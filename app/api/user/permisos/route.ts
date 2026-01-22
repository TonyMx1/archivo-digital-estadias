import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getRolePermissions } from '@/lib/db';

// Obtener permisos del usuario actual
export async function GET(request: NextRequest) {
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

    const permisos = await getRolePermissions(payload.id_rol);

    return NextResponse.json({
      success: true,
      permisos,
      id_rol: payload.id_rol,
    });
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return NextResponse.json(
      { error: 'Error al obtener permisos del usuario' },
      { status: 500 }
    );
  }
}
