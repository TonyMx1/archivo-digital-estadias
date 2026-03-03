import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { createUserIfNotExists, getPool, hasPermission } from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

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

    // Verificar permiso para ver usuarios
    const canViewUsers = await hasPermission(payload.id_rol, PERMISOS.VER_ADMIN);
    if (!canViewUsers) {
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

// Crear un usuario (p.ej. alta por CURP desde Admin)
export async function POST(request: NextRequest) {
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

    // Verificar permiso para crear/editar usuarios
    const canEditUsers = await hasPermission(payload.id_rol, PERMISOS.EDITAR_USUARIOS);
    if (!canEditUsers) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear usuarios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const curp = String(body?.curp || '').trim().toUpperCase();
    const id_general = String(body?.id_general || '').trim();
    const nombre_usuario = body?.nombre_usuario ? String(body.nombre_usuario).trim() : undefined;
    const id_rol = body?.id_rol ? Number(body.id_rol) : undefined;

    if (!curp || !id_general) {
      return NextResponse.json(
        { error: 'Se requieren curp e id_general' },
        { status: 400 }
      );
    }

    if (id_rol && Number.isNaN(id_rol)) {
      return NextResponse.json(
        { error: 'id_rol inválido' },
        { status: 400 }
      );
    }

    // Si viene rol, validar que exista
    if (id_rol) {
      const pool = getPool();
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
    }

    const user = await createUserIfNotExists({
      curp,
      id_general,
      id_rol,
      nombre_usuario,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
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

    // Verificar permiso para editar usuarios
    const canEditUsers = await hasPermission(payload.id_rol, PERMISOS.EDITAR_USUARIOS);
    if (!canEditUsers) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar roles' },
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

// Eliminar un usuario
export async function DELETE(request: NextRequest) {
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

    // Verificar permiso para eliminar usuarios
    const canDelete = await hasPermission(payload.id_rol, PERMISOS.ELIMINAR_USUARIOS);
    if (!canDelete) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar usuarios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_usuarios } = body;

    if (!id_usuarios) {
      return NextResponse.json(
        { error: 'Se requiere el id_usuarios' },
        { status: 400 }
      );
    }

    // Prevenir que un usuario se elimine a sí mismo
    if (id_usuarios === payload.id_usuarios) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      );
    }

    const pool = getPool();
    
    // Eliminar el usuario
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id_usuarios = $1 RETURNING id_usuarios',
      [id_usuarios]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  }
}
