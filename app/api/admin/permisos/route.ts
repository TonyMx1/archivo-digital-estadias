import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getPool } from '@/lib/db';

// Obtener todos los permisos de un rol específico o todos los permisos por rol
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Solo administrador (1) puede ver permisos
    if (payload.id_rol !== 1) {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idRol = searchParams.get('id_rol');

    const pool = getPool();

    if (idRol) {
      // Obtener permisos de un rol específico
      const result = await pool.query(
        `SELECT id_rol_permisos, id_rol, nombre_permiso
         FROM rol_permisos
         WHERE id_rol = $1
         ORDER BY nombre_permiso`,
        [parseInt(idRol)]
      );

      return NextResponse.json({
        success: true,
        permisos: result.rows,
      });
    } else {
      // Obtener todos los permisos agrupados por rol
      const result = await pool.query(
        `SELECT rp.id_rol_permisos, rp.id_rol, rp.nombre_permiso, r.rol as nombre_rol
         FROM rol_permisos rp
         LEFT JOIN roles r ON rp.id_rol = r.id_roles
         ORDER BY rp.id_rol, rp.nombre_permiso`
      );

      // Agrupar por rol
      const permisosPorRol: Record<number, { id_rol: number; nombre_rol: string; permisos: string[] }> = {};
      
      for (const row of result.rows) {
        if (!permisosPorRol[row.id_rol]) {
          permisosPorRol[row.id_rol] = {
            id_rol: row.id_rol,
            nombre_rol: row.nombre_rol || `Rol ${row.id_rol}`,
            permisos: [],
          };
        }
        permisosPorRol[row.id_rol].permisos.push(row.nombre_permiso);
      }

      return NextResponse.json({
        success: true,
        permisosPorRol: Object.values(permisosPorRol),
      });
    }
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return NextResponse.json(
      { error: 'Error al obtener permisos' },
      { status: 500 }
    );
  }
}

// Agregar un permiso a un rol
export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Solo administrador (1) puede modificar permisos
    if (payload.id_rol !== 1) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden modificar permisos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_rol, nombre_permiso } = body;

    if (!id_rol || !nombre_permiso) {
      return NextResponse.json(
        { error: 'Se requieren id_rol y nombre_permiso' },
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

    // Verificar si el permiso ya existe para este rol
    const existingPermiso = await pool.query(
      'SELECT id_rol_permisos FROM rol_permisos WHERE id_rol = $1 AND nombre_permiso = $2',
      [id_rol, nombre_permiso]
    );

    if (existingPermiso.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este permiso ya existe para el rol' },
        { status: 400 }
      );
    }

    // Insertar el nuevo permiso
    const result = await pool.query(
      'INSERT INTO rol_permisos (id_rol, nombre_permiso) VALUES ($1, $2) RETURNING id_rol_permisos',
      [id_rol, nombre_permiso]
    );

    return NextResponse.json({
      success: true,
      id_rol_permisos: result.rows[0].id_rol_permisos,
      message: 'Permiso agregado exitosamente',
    });
  } catch (error) {
    console.error('Error al agregar permiso:', error);
    return NextResponse.json(
      { error: 'Error al agregar permiso' },
      { status: 500 }
    );
  }
}

// Eliminar un permiso de un rol
export async function DELETE(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Solo administrador (1) puede eliminar permisos
    if (payload.id_rol !== 1) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar permisos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_rol, nombre_permiso } = body;

    if (!id_rol || !nombre_permiso) {
      return NextResponse.json(
        { error: 'Se requieren id_rol y nombre_permiso' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Eliminar el permiso
    const result = await pool.query(
      'DELETE FROM rol_permisos WHERE id_rol = $1 AND nombre_permiso = $2 RETURNING id_rol_permisos',
      [id_rol, nombre_permiso]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'El permiso no existe para este rol' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Permiso eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    return NextResponse.json(
      { error: 'Error al eliminar permiso' },
      { status: 500 }
    );
  }
}
