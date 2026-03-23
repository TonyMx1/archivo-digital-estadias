import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import {
  createDocumento,
  deleteDocumento,
  getDocumentoById,
  getDocumentos,
  hasPermission,
  updateDocumento,
} from "@/lib/db";
import {
  canAccessDocumentSecretaria,
  DocumentScopeError,
  getDocumentScopeForUser,
} from "@/lib/document-access";
import { PERMISOS } from "@/lib/permisos";

function parsePositiveInt(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function handleScopedError(error: unknown, fallbackMessage: string) {
  if (error instanceof DocumentScopeError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  console.error(fallbackMessage, error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallbackMessage },
    { status: 500 }
  );
}

// Obtener documentos (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const canView = await hasPermission(payload.id_rol, PERMISOS.VER_DOCUMENTOS);
    if (!canView) {
      return NextResponse.json(
        { error: "No tienes permisos para ver documentos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idDoc = parsePositiveInt(searchParams.get("id_doc"));
    const requestedSecretariaId = parsePositiveInt(searchParams.get("id_secre"));
    const tipoDoc = parsePositiveInt(searchParams.get("tipo_doc"));
    const fechaDoc = searchParams.get("fecha_doc");
    const estatusDoc = searchParams.get("estatus_doc");
    const scope = await getDocumentScopeForUser(payload.id_usuarios, payload.id_rol);

    if (searchParams.get("id_doc") && !idDoc) {
      return NextResponse.json({ error: "id_doc inválido" }, { status: 400 });
    }

    if (searchParams.get("id_secre") && !requestedSecretariaId) {
      return NextResponse.json({ error: "id_secre inválido" }, { status: 400 });
    }

    if (searchParams.get("tipo_doc") && !tipoDoc) {
      return NextResponse.json({ error: "tipo_doc inválido" }, { status: 400 });
    }

    if (idDoc) {
      const documento = await getDocumentoById(idDoc);

      if (!documento) {
        return NextResponse.json(
          { error: "Documento no encontrado" },
          { status: 404 }
        );
      }

      if (
        scope.restricted &&
        !canAccessDocumentSecretaria(
          payload.id_rol,
          documento.id_secre,
          scope.allowedSecretariaId
        )
      ) {
        return NextResponse.json(
          { error: "No puedes acceder a documentos de otra secretaría" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        documento,
      });
    }

    const filters: {
      id_secre?: number;
      tipo_doc?: number;
      fecha_doc?: string;
      estatus_doc?: string;
    } = {};

    if (scope.restricted) {
      if (
        requestedSecretariaId &&
        requestedSecretariaId !== scope.allowedSecretariaId
      ) {
        return NextResponse.json(
          { error: "Solo puedes consultar documentos de tu secretaría asignada" },
          { status: 403 }
        );
      }

      filters.id_secre = scope.allowedSecretariaId;
    } else if (requestedSecretariaId) {
      filters.id_secre = requestedSecretariaId;
    }

    if (tipoDoc) {
      filters.tipo_doc = tipoDoc;
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
  } catch (error) {
    return handleScopedError(error, "Error al obtener documentos");
  }
}

// Crear un nuevo documento
export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    if (payload.id_rol === 10) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar documentos" },
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

    const secretariaId = Number(id_secre);
    const tipoDocumentoId = Number(tipo_doc);
    const scope = await getDocumentScopeForUser(payload.id_usuarios, payload.id_rol);

    if (!nombre_doc || !tipoDocumentoId || !secretariaId) {
      return NextResponse.json(
        { error: "Se requieren nombre_doc, tipo_doc e id_secre" },
        { status: 400 }
      );
    }

    if (
      scope.restricted &&
      secretariaId !== scope.allowedSecretariaId
    ) {
      return NextResponse.json(
        { error: "Solo puedes crear documentos dentro de tu secretaría asignada" },
        { status: 403 }
      );
    }

    const documento = await createDocumento({
      nombre_doc,
      tipo_doc: tipoDocumentoId,
      id_secre: secretariaId,
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
  } catch (error) {
    return handleScopedError(error, "Error al crear documento");
  }
}

// Actualizar un documento existente
export async function PUT(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    if (payload.id_rol === 10) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar documentos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id_doc, ...updateData } = body;

    if (!id_doc) {
      return NextResponse.json({ error: "Se requiere id_doc" }, { status: 400 });
    }

    const documentoActual = await getDocumentoById(Number(id_doc));
    if (!documentoActual) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    const scope = await getDocumentScopeForUser(payload.id_usuarios, payload.id_rol);
    if (
      scope.restricted &&
      !canAccessDocumentSecretaria(
        payload.id_rol,
        documentoActual.id_secre,
        scope.allowedSecretariaId
      )
    ) {
      return NextResponse.json(
        { error: "No puedes modificar documentos de otra secretaría" },
        { status: 403 }
      );
    }

    if (updateData.id_secre !== undefined) {
      const nextSecretariaId = Number(updateData.id_secre);

      if (!Number.isInteger(nextSecretariaId) || nextSecretariaId <= 0) {
        return NextResponse.json({ error: "id_secre inválido" }, { status: 400 });
      }

      if (
        scope.restricted &&
        nextSecretariaId !== scope.allowedSecretariaId
      ) {
        return NextResponse.json(
          { error: "No puedes mover documentos a otra secretaría" },
          { status: 403 }
        );
      }

      updateData.id_secre = nextSecretariaId;
    }

    const documento = await updateDocumento({
      id_doc: Number(id_doc),
      ...updateData,
    });

    if (!documento) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      documento,
    });
  } catch (error) {
    return handleScopedError(error, "Error al actualizar documento");
  }
}

// Eliminar un documento (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idDoc = parsePositiveInt(searchParams.get("id_doc"));
    const motivoBaja = searchParams.get("motivo_baja");

    if (!idDoc) {
      return NextResponse.json({ error: "Se requiere id_doc" }, { status: 400 });
    }

    const documentoActual = await getDocumentoById(idDoc);
    if (!documentoActual) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    const scope = await getDocumentScopeForUser(payload.id_usuarios, payload.id_rol);
    if (
      scope.restricted &&
      !canAccessDocumentSecretaria(
        payload.id_rol,
        documentoActual.id_secre,
        scope.allowedSecretariaId
      )
    ) {
      return NextResponse.json(
        { error: "No puedes eliminar documentos de otra secretaría" },
        { status: 403 }
      );
    }

    const documento = await deleteDocumento(idDoc, motivoBaja || undefined);

    if (!documento) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      documento,
    });
  } catch (error) {
    return handleScopedError(error, "Error al eliminar documento");
  }
}
