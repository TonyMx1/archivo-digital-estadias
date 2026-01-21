import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getPool } from '@/lib/db';

// Obtener todos los usuarios con sus roles
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

    // Verificar que el usuario sea administrador (id_rol = 1) o superusuario (id_rol = 2)
    if (payload.id_rol !== 1 && payload.id_rol !== 2) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      );
    }

    const pool = getPool();
    
    // Obtener todos los usuarios con sus roles
    const usersResult = await pool.query(`
      SELECT 
        u.id_usuarios,
        u.curp,
        u.id_general,
        u.id_rol,
        u.nombre_usuario,
        r.rol as nombre_rol
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_roles
      ORDER BY u.id_usuarios
    `);

    // Obtener todos los roles disponibles
    const rolesResult = await pool.query(`
      SELECT id_roles, rol
      FROM roles
      ORDER BY id_roles
    `);

    return NextResponse.json({
      success: true,
      users: usersResult.rows,
      roles: rolesResult.rows,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// Actualizar el rol de un usuario (solo administrador)
export async function PUT(request: NextRequest) {
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

    // Solo el administrador (id_rol = 1) puede modificar roles
    if (payload.id_rol !== 1) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden modificar roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_usuarios, id_rol } = body;

    if (!id_usuarios || !id_rol) {
      return NextResponse.json(
        { error: 'Se requieren id_usuarios e id_rol' },
        { status: 400 }
      );
    }

    const pool = getPool();
    
    // Verificar que el rol existe
    const roleCheck = await pool.query(
      'SELECT id_roles FROM roles WHERE id_roles = $1',
      [id_rol]
    );

    if (roleCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'El rol especificado no existe' },
        { status: 400 }
      );
    }

    // Actualizar el rol del usuario
    await pool.query(
      'UPDATE usuarios SET id_rol = $1 WHERE id_usuarios = $2',
      [id_rol, id_usuarios]
    );

    return NextResponse.json({
      success: true,
      message: 'Rol actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el rol del usuario' },
      { status: 500 }
    );
  }
}
