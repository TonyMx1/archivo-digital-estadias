import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getPool } from '@/lib/db';

// Crear nuevo rol
export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Solo administrador (1) y superusuario (2) pueden crear roles
    if (payload.id_rol !== 1 && payload.id_rol !== 2) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para crear roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rol } = body as { rol?: string };

    if (!rol || typeof rol !== 'string' || !rol.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del rol es obligatorio' },
        { status: 400 }
      );
    }

    const pool = getPool();

    const result = await pool.query(
      'INSERT INTO roles (rol) VALUES ($1) RETURNING id_roles',
      [rol.trim()]
    );

    const newId = result.rows[0]?.id_roles;

    return NextResponse.json({
      success: true,
      id: newId,
      message: 'Rol creado exitosamente',
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el rol' },
      { status: 500 }
    );
  }
}

