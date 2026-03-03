import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import { getDocumentoById, hasPermission } from "@/lib/db";
import { PERMISOS } from "@/lib/permisos";

function isAllowedUpstreamUrl(url: string): boolean {
  try {
    const u = new URL(url);

    if (u.protocol !== "https:") return false;

    if (u.hostname !== "sanjuandelrio.sytes.net") return false;

    if (u.port && u.port !== "3030") return false;

    if (!u.pathname.startsWith("/public/")) return false;

    return true;
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id_doc: string }> }
) {
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

    const { id_doc } = await context.params;
    const idDoc = Number(id_doc);

    if (!Number.isFinite(idDoc)) {
      return NextResponse.json({ error: "id_doc inválido" }, { status: 400 });
    }

    const documento = await getDocumentoById(idDoc);

    if (!documento) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    const fileUrl = documento.url_cons_doc;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "El documento no tiene archivo asociado" },
        { status: 404 }
      );
    }

    if (!isAllowedUpstreamUrl(fileUrl)) {
      return NextResponse.redirect(fileUrl);
    }

    const upstreamRes = await fetch(fileUrl);

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          error: "No se pudo obtener el archivo",
          status: upstreamRes.status,
        },
        { status: 502 }
      );
    }

    const contentType = upstreamRes.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstreamRes.headers.get("content-length");

    let filename = "archivo";
    try {
      filename = decodeURIComponent(new URL(fileUrl).pathname.split("/").pop() || "archivo");
    } catch {
      filename = "archivo";
    }

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `inline; filename="${filename}"`);
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(upstreamRes.body, { status: 200, headers });
  } catch (error: any) {
    console.error("Error al servir archivo de documento:", error);
    return NextResponse.json(
      { error: error?.message || "Error al servir archivo" },
      { status: 500 }
    );
  }
}
