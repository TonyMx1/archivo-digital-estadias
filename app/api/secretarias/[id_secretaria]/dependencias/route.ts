import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getDependenciasBySecretaria, createDependencia} from '@/lib/db';

type RouteParams = {
  params: {
    id_secretaria: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Rol visor (10) solo puede consultar, no crear
    if (payload.id_rol === 10) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear dependencias' },
        { status: 403 }
      );
    }

    const idSecretaria = Number(params.id_secretaria);
    if (!Number.isFinite(idSecretaria)) {
      return NextResponse.json({ error: 'ID de secretaría inválido' }, { status: 400 });
    }

    const dependencias = await getDependenciasBySecretaria(idSecretaria);
    return NextResponse.json({ success: true, dependencias });
  } catch (error) {
    console.error('Error al obtener dependencias:', error);
    return NextResponse.json({ error: 'Error al obtener dependencias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const idSecretaria = Number(params.id_secretaria);
    if (!Number.isFinite(idSecretaria)) {
      return NextResponse.json({ error: 'ID de secretaría inválido' }, { status: 400 });
    }

    const body = await request.json();
    const nombreDep = String(body?.nombre_dep || '').trim();
    const depNomcl = body?.dep_nomcl ? String(body.dep_nomcl).trim() : null;

    if (!nombreDep) {
      return NextResponse.json({ error: 'El nombre de la dependencia es requerido' }, { status: 400 });
    }

    const dependencia = await createDependencia({
      id_secretaria: idSecretaria,
      nombre_dependencia: nombreDep,
      dep_nomcl: depNomcl || null,
    });
    return NextResponse.json({ success: true, dependencia });
  } catch (error) {
    console.error('Error al crear dependencia:', error);
    return NextResponse.json({ error: 'Error al crear dependencia' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const idSecretaria = Number(params.id_secretaria);
    if (!Number.isFinite(idSecretaria)) {
      return NextResponse.json({ error: 'ID de secretaría inválido' }, { status: 400 });
    }

    const body = await request.json();
    const idDependencia = Number(body?.id_dependencia);

    if (!Number.isFinite(idDependencia)) {
      return NextResponse.json({ error: 'ID de dependencia inválido' }, { status: 400 });
    }

    const deleted = await deleteDependencia(idSecretaria, idDependencia);
    if (!deleted) {
      return NextResponse.json({ error: 'Dependencia no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar dependencia:', error);
    return NextResponse.json({ error: 'Error al eliminar dependencia' }, { status: 500 });
  }
}
