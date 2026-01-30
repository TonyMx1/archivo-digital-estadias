import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import {
  getDependenciasBySecretaria,
  createDependencia,
  toggleEstadoDependencia,
  updateDependencia,
  hasPermission,
} from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

// Obtener dependencias de una secretaría
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    // Verificar permiso para ver dependencias
    const canView = await hasPermission(payload.id_rol, PERMISOS.VER_DEPENDENCIAS);
    if (!canView) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver dependencias' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const secretariaId = searchParams.get('secretariaId');

    if (!secretariaId) {
      return NextResponse.json(
        { error: 'Se requiere secretariaId' },
        { status: 400 }
      );
    }

    const dependencias = await getDependenciasBySecretaria(parseInt(secretariaId));

    return NextResponse.json({
      success: true,
      dependencias,
    });
  } catch (error: any) {
    console.error('Error al obtener dependencias:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener dependencias' },
      { status: 500 }
    );
  }
}

// Crear una nueva dependencia
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

    // Verificar permiso para crear dependencias
    const canCreate = await hasPermission(payload.id_rol, PERMISOS.CREAR_DEPENDENCIAS);
    if (!canCreate) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear dependencias' },
        { status: 403 }
      );
    }
    
    // En el método POST
    const body = await request.json();
    // Extraemos los campos (aceptamos ambos formatos de nombre por seguridad)
    const id_secretaria = body.id_secretaria || body.secretariaId;
    const nombre_dependencia = body.nombre_dependencia || body.nombre_dep || body.nombre;
    const dep_nomcl = body.dep_nomcl || body.nomenclatura;

    // Solo validamos como obligatorios id_secretaria y nombre_dependencia
    if (!id_secretaria || !nombre_dependencia) {
      return NextResponse.json(
        { error: 'Se requieren el ID de secretaría y el nombre de la dependencia' },
        { status: 400 }
      );
    }

    const dependencia = await createDependencia({
      id_secretaria: Number(id_secretaria),
      nombre_dependencia: String(nombre_dependencia).trim(),
      dep_nomcl: dep_nomcl ? String(dep_nomcl).trim() : null, // Ahora es opcional
    });

    return NextResponse.json({
      success: true,
      dependencia,
    });
  } catch (error: any) {
    console.error('Error al crear dependencia:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear dependencia' },
      { status: 500 }
    );
  }
}

// Actualizar una dependencia
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

    // Verificar permiso para editar dependencias
    const canEdit = await hasPermission(payload.id_rol, PERMISOS.EDITAR_DEPENDENCIAS);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar dependencias' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_dependencia, nombre_dependencia, dep_nomcl } = body;

    if (!id_dependencia || !nombre_dependencia || !dep_nomcl) {
      return NextResponse.json(
        { error: 'Se requieren id_dependencia, nombre_dependencia y dep_nomcl' },
        { status: 400 }
      );
    }

    const dependencia = await updateDependencia({
      id_dependencia,
      nombre_dependencia,
      dep_nomcl,
    });

    if (!dependencia) {
      return NextResponse.json(
        { error: 'Dependencia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dependencia,
    });
  } catch (error: any) {
    console.error('Error al actualizar dependencia:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar dependencia' },
      { status: 500 }
    );
  }
}

