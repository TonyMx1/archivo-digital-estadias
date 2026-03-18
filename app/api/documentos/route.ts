import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import {
  getDocumentos,
  getDocumentoById,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  hasPermission,
} from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

// Obtener documentos (con filtros opcionales)
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

    // Verificar permiso para ver documentos
    const canView = await hasPermission(payload.id_rol, PERMISOS.VER_DOCUMENTOS);
    if (!canView) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver documentos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idDoc = searchParams.get('id_doc');
    const idSecre = searchParams.get('id_secre');
    const tipoDoc = searchParams.get('tipo_doc');
    const fechaDoc = searchParams.get('fecha_doc');
    const estatusDoc = searchParams.get('estatus_doc');

    // Si se especifica id_doc, obtener un documento específico
    if (idDoc) {
      const documento = await getDocumentoById(parseInt(idDoc));
      if (!documento) {
        return NextResponse.json(
          { error: 'Documento no encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        documento,
      });
    }

    // Obtener todos los documentos con filtros opcionales
    const filters: {
      id_secre?: number;
      tipo_doc?: number;
      fecha_doc?: string;
      estatus_doc?: string;
    } = {};

    if (idSecre) {
      filters.id_secre = parseInt(idSecre);
    }
    if (tipoDoc) {
      filters.tipo_doc = parseInt(tipoDoc);
    }
    if (fechaDoc) {
      filters.fecha_doc = fechaDoc;
    }
    if (estatusDoc) {
      filters.estatus_doc = estatusDoc;
    }

    const documentos = await getDocumentos(filters);

    return NextResponse.json({
      success: true,
      documentos,
    });
  } catch (error: any) {
    console.error('Error al obtener documentos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener documentos' },
      { status: 500 }
    );
  }
}

// Crear un nuevo documento
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

    // Rol visor (10) solo puede consultar, no actualizar
    if (payload.id_rol === 10) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar documentos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nombre_doc,
      tipo_doc,
      id_secre,
      size_doc,
      anio_doc,
      comentario_doc,
      id_usu_alta,
      meta_doc,
      desc_doc,
      oficio_doc,
      expediente_doc,
      serie_doc,
      subserie_doc,
      cons_doc,
      confidencial_doc,
      fecha_doc,
      hora_doc,
      url_cons_doc,
      estatus_doc,
      version_doc,
      id_dep,
      num_caja,
      ubicacion_doc,
      estante_doc,
    } = body;

    if (!nombre_doc || !tipo_doc || !id_secre) {
      return NextResponse.json(
        { error: 'Se requieren nombre_doc, tipo_doc e id_secre' },
        { status: 400 }
      );
    }

    const documento = await createDocumento({
      nombre_doc,
      tipo_doc,
      id_secre,
      size_doc,
      anio_doc,
      comentario_doc,
      id_usu_alta: id_usu_alta || payload.id_usuarios,
      meta_doc,
      desc_doc,
      oficio_doc,
      expediente_doc,
      serie_doc,
      subserie_doc,
      cons_doc,
      confidencial_doc,
      fecha_doc,
      hora_doc,
      url_cons_doc,
      estatus_doc,
      version_doc,
      id_dep,
      num_caja,
      ubicacion_doc,
      estante_doc,
    });

    return NextResponse.json({
      success: true,
      documento,
    });
  } catch (error: any) {
    console.error('Error al crear documento:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear documento' },
      { status: 500 }
    );
  }
}

// Actualizar un documento existente
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

    // Rol visor (10) solo puede consultar, no eliminar
    if (payload.id_rol === 10) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar documentos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_doc, ...updateData } = body;

    if (!id_doc) {
      return NextResponse.json(
        { error: 'Se requiere id_doc' },
        { status: 400 }
      );
    }

    const documento = await updateDocumento({
      id_doc,
      ...updateData,
    });

    if (!documento) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      documento,
    });
  } catch (error: any) {
    console.error('Error al actualizar documento:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar documento' },
      { status: 500 }
    );
  }
}

// Eliminar un documento (soft delete)
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

    const { searchParams } = new URL(request.url);
    const idDoc = searchParams.get('id_doc');
    const motivoBaja = searchParams.get('motivo_baja');

    if (!idDoc) {
      return NextResponse.json(
        { error: 'Se requiere id_doc' },
        { status: 400 }
      );
    }

    const documento = await deleteDocumento(parseInt(idDoc), motivoBaja || undefined);

    if (!documento) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      documento,
    });
  } catch (error: any) {
    console.error('Error al eliminar documento:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar documento' },
      { status: 500 }
    );
  }
}
