import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { toggleEstadoDependencia, hasPermission } from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

type Params = { id: string };

// Activar/Desactivar una dependencia
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
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

    // Verificar permiso para desactivar dependencias
    const canToggle = await hasPermission(payload.id_rol, PERMISOS.DESACTIVAR_DEPENDENCIAS);
    if (!canToggle) {
      return NextResponse.json(
        { error: 'No tienes permisos para desactivar dependencias' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const idDependencia = parseInt(id);
    if (!idDependencia || isNaN(idDependencia)) {
      return NextResponse.json(
        { error: 'ID de dependencia inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { activo } = body;

    if (typeof activo !== 'boolean') {
      return NextResponse.json(
        { error: 'Se requiere el campo activo (boolean)' },
        { status: 400 }
      );
    }

    const updated = await toggleEstadoDependencia(idDependencia, activo);

    if (!updated) {
      return NextResponse.json(
        { error: 'Dependencia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: activo 
        ? 'Dependencia activada exitosamente' 
        : 'Dependencia desactivada exitosamente',
    });
  } catch (error: any) {
    console.error('Error al cambiar estado de dependencia:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cambiar estado de la dependencia' },
      { status: 500 }
    );
  }
}
