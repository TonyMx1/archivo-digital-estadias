import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import {
  createPrestamo,
  devolverPrestamo,
  getDocumentoById,
  getPrestamoById,
  getPrestamos,
  hasPermission,
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
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(fallbackMessage, error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallbackMessage },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token invalido" }, { status: 401 });
    }

    const canView = await hasPermission(payload.id_rol, PERMISOS.VER_DOCUMENTOS);
    if (!canView) {
      return NextResponse.json(
        { error: "No tienes permisos para ver prestamos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedSecretariaId = parsePositiveInt(searchParams.get("id_secre"));
    const idDoc = parsePositiveInt(searchParams.get("id_doc"));
    const estatusPrestamo = searchParams.get("estatus_prestamo") || undefined;
    const scope = await getDocumentScopeForUser(payload.id_usuarios, payload.id_rol);

    if (searchParams.get("id_secre") && !requestedSecretariaId) {
      return NextResponse.json({ error: "id_secre invalido" }, { status: 400 });
    }

    if (searchParams.get("id_doc") && !idDoc) {
      return NextResponse.json({ error: "id_doc invalido" }, { status: 400 });
    }

    const filters: {
      id_secre?: number;
      id_doc?: number;
      estatus_prestamo?: string;
    } = {};

    if (scope.restricted) {
      if (
        requestedSecretariaId &&
        requestedSecretariaId !== scope.allowedSecretariaId
      ) {
        return NextResponse.json(
          { error: "Solo puedes consultar prestamos de tu secretaria asignada" },
          { status: 403 }
        );
      }

      filters.id_secre = scope.allowedSecretariaId;
    } else if (requestedSecretariaId) {
      filters.id_secre = requestedSecretariaId;
    }

    if (idDoc) {
      filters.id_doc = idDoc;
    }

    if (estatusPrestamo) {
      filters.estatus_prestamo = estatusPrestamo;
    }

    const prestamos = await getPrestamos(filters);

    return NextResponse.json({
      success: true,
      prestamos,
    });
  } catch (error) {
    return handleScopedError(error, "Error al obtener prestamos");
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token invalido" }, { status: 401 });
    }

    const canCreate = await hasPermission(payload.id_rol, PERMISOS.CREAR_DOCUMENTOS);
    if (!canCreate) {
      return NextResponse.json(
        { error: "No tienes permisos para crear prestamos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const idDoc = Number(body?.id_doc);

    if (!Number.isInteger(idDoc) || idDoc <= 0) {
      return NextResponse.json({ error: "id_doc invalido" }, { status: 400 });
    }

    const documento = await getDocumentoById(idDoc);
    if (!documento) {
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
        documento.id_secre,
        scope.allowedSecretariaId
      )
    ) {
      return NextResponse.json(
        { error: "No puedes registrar prestamos de otra secretaria" },
        { status: 403 }
      );
    }

    const prestamo = await createPrestamo({
      id_doc: idDoc,
      nombre_solicitante: String(body?.nombre_solicitante || ""),
      curp_solicitante: String(body?.curp_solicitante || ""),
      area_solicitante: body?.area_solicitante
        ? String(body.area_solicitante)
        : undefined,
      motivo_prestamo: body?.motivo_prestamo
        ? String(body.motivo_prestamo)
        : undefined,
      observaciones: body?.observaciones
        ? String(body.observaciones)
        : undefined,
      fecha_prestamo: body?.fecha_prestamo
        ? String(body.fecha_prestamo)
        : undefined,
      fecha_limite_devolucion: String(body?.fecha_limite_devolucion || ""),
      vale_url: body?.vale_url ? String(body.vale_url) : undefined,
      id_usuario_registro: payload.id_usuarios,
    });

    return NextResponse.json({
      success: true,
      prestamo,
    });
  } catch (error) {
    return handleScopedError(error, "Error al crear prestamo");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getTokenFromCookies();
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token invalido" }, { status: 401 });
    }

    const canEdit = await hasPermission(payload.id_rol, PERMISOS.EDITAR_DOCUMENTOS);
    if (!canEdit) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar prestamos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const idPrestamo = Number(body?.id_prestamo);

    if (!Number.isInteger(idPrestamo) || idPrestamo <= 0) {
      return NextResponse.json(
        { error: "id_prestamo invalido" },
        { status: 400 }
      );
    }

    const prestamoActual = await getPrestamoById(idPrestamo);
    if (!prestamoActual) {
      return NextResponse.json(
        { error: "Prestamo no encontrado" },
        { status: 404 }
      );
    }

    const scope = await getDocumentScopeForUser(payload.id_usuarios, payload.id_rol);
    if (
      scope.restricted &&
      !canAccessDocumentSecretaria(
        payload.id_rol,
        prestamoActual.id_secre,
        scope.allowedSecretariaId
      )
    ) {
      return NextResponse.json(
        { error: "No puedes actualizar prestamos de otra secretaria" },
        { status: 403 }
      );
    }

    const prestamo = await devolverPrestamo({
      id_prestamo: idPrestamo,
      fecha_devolucion: String(body?.fecha_devolucion || ""),
      observaciones_devolucion: body?.observaciones_devolucion
        ? String(body.observaciones_devolucion)
        : undefined,
      id_usuario_devolucion: payload.id_usuarios,
    });

    return NextResponse.json({
      success: true,
      prestamo,
    });
  } catch (error) {
    return handleScopedError(error, "Error al devolver prestamo");
  }
}
