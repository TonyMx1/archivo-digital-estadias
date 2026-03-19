import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getUserById, getUserRole, getRolePermissions } from '@/lib/db';

// Obtener información del usuario actual (incluyendo rol y nombre)
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

    // Obtener información completa del usuario desde la BD
    const user = await getUserById(payload.id_usuarios);
    const role = user ? await getUserRole(user.id_rol) : null;
    const permisos = await getRolePermissions(payload.id_rol);

    return NextResponse.json({
      success: true,
      user: {
        id_usuarios: payload.id_usuarios,
        curp: payload.curp,
        id_rol: payload.id_rol,
        id_general: payload.id_general,
        nombre_usuario: user?.nombre_usuario || null,
        nom_secre: user?.nom_secre || null,
        nombre_rol: role?.rol || null,
        permisos,
      },
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del usuario' },
      { status: 500 }
    );
  }
}
