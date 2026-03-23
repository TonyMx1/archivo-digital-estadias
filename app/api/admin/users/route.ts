import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { createUserIfNotExists, getPool, getSecretarias, hasPermission } from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

// Obtener todos los usuarios con sus roles
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

    const canViewUsers = await hasPermission(payload.id_rol, PERMISOS.VER_ADMIN);
    if (!canViewUsers) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      );
    }

    const pool = getPool();
    const usersResult = await pool.query(`
      SELECT
        u.id_usuarios,
        u.curp,
        u.id_general,
        u.id_rol,
        u.nombre_usuario,
        u.nom_secre,
        r.rol as nombre_rol
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_roles
      ORDER BY u.id_usuarios
    `);

    const rolesResult = await pool.query(`
      SELECT id_roles, rol
      FROM roles
      ORDER BY id_roles
    `);

    const secretarias = await getSecretarias();

    return NextResponse.json({
      success: true,
      users: usersResult.rows,
      roles: rolesResult.rows,
      secretarias,
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
    const nom_secre = body?.nom_secre ? String(body.nom_secre).trim() : undefined;

    if (!curp || !id_general) {
      return NextResponse.json(
        { error: 'Se requieren curp e id_general' },
        { status: 400 }
      );
    }

    if (!nom_secre) {
      return NextResponse.json(
        { error: 'Se requiere seleccionar una secretaría' },
        { status: 400 }
      );
    }

    if (id_rol && Number.isNaN(id_rol)) {
      return NextResponse.json(
        { error: 'id_rol inválido' },
        { status: 400 }
      );
    }

    const secretarias = await getSecretarias();
    const secretariaExists = secretarias.some(
      (secretaria) => secretaria.nombre_secretaria === nom_secre
    );

    if (!secretariaExists) {
      return NextResponse.json(
        { error: 'La secretaría seleccionada no existe' },
        { status: 400 }
      );
    }

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
      nom_secre,
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

// Actualizar el rol y/o la secretaría de un usuario
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

    const canEditUsers = await hasPermission(payload.id_rol, PERMISOS.EDITAR_USUARIOS);
    if (!canEditUsers) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar usuarios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_usuarios } = body;
    const hasRoleChange = body?.id_rol !== undefined;
    const hasSecretariaChange = Object.prototype.hasOwnProperty.call(body, 'nom_secre');
    const id_rol = hasRoleChange ? Number(body.id_rol) : undefined;
    const nom_secre =
      !hasSecretariaChange || body.nom_secre === null || body.nom_secre === ''
        ? null
        : String(body.nom_secre).trim();

    if (!id_usuarios || (!hasRoleChange && !hasSecretariaChange)) {
      return NextResponse.json(
        { error: 'Se requiere id_usuarios y al menos un cambio a guardar' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const updates: string[] = [];
    const values: Array<number | string | null> = [];
    let paramIndex = 1;

    if (hasRoleChange) {
      if (id_rol === undefined || Number.isNaN(id_rol)) {
        return NextResponse.json(
          { error: 'El rol especificado es inválido' },
          { status: 400 }
        );
      }

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

      updates.push(`id_rol = $${paramIndex}`);
      values.push(id_rol);
      paramIndex++;
    }

    if (hasSecretariaChange) {
      if (nom_secre) {
        const secretarias = await getSecretarias();
        const secretariaExists = secretarias.some(
          (secretaria) => secretaria.nombre_secretaria === nom_secre
        );

        if (!secretariaExists) {
          return NextResponse.json(
            { error: 'La secretaría seleccionada no existe' },
            { status: 400 }
          );
        }
      }

      updates.push(`nom_secre = $${paramIndex}`);
      values.push(nom_secre);
      paramIndex++;
    }

    values.push(Number(id_usuarios));
    await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id_usuarios = $${paramIndex}`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
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

    if (id_usuarios === payload.id_usuarios) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      );
    }

    const pool = getPool();
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
