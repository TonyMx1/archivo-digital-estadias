import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getPool, hasPermission } from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

// Obtener todos los roles con sus permisos
export async function GET() {
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
        { success: false, error: 'Token invalido' },
        { status: 401 }
      );
    }

    const canViewRolesByPermission = await hasPermission(payload.id_rol, PERMISOS.VER_ADMIN);
    const canViewRolesByLegacyRole = payload.id_rol === 1 || payload.id_rol === 2;
    if (!canViewRolesByPermission && !canViewRolesByLegacyRole) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver roles' },
        { status: 403 }
      );
    }

    const pool = getPool();
    const result = await pool.query(
      `SELECT
         r.id_roles AS id_rol,
         r.rol AS nombre_rol,
         COALESCE(
           array_agg(rp.nombre_permiso ORDER BY rp.nombre_permiso)
           FILTER (WHERE rp.nombre_permiso IS NOT NULL),
           '{}'::text[]
         ) AS permisos
       FROM roles r
       LEFT JOIN rol_permisos rp ON rp.id_rol = r.id_roles
       GROUP BY r.id_roles, r.rol
       ORDER BY r.id_roles`
    );

    return NextResponse.json({
      success: true,
      roles: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener roles y permisos' },
      { status: 500 }
    );
  }
}

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

