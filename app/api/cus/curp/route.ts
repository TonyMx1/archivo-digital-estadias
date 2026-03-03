import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/db';
import { PERMISOS } from '@/lib/permisos';

const CUS_URL_CURP = process.env.CUS_URL_CURP?.trim().replace(/^['"]|['"]$/g, '') || '';

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

    const canViewAdmin = await hasPermission(payload.id_rol, PERMISOS.VER_ADMIN);
    if (!canViewAdmin) {
      return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
    }

    if (!CUS_URL_CURP) {
      return NextResponse.json({ error: 'CUS_URL_CURP no está configurada' }, { status: 500 });
    }

    const apiKey = process.env.CUS_API_KEY?.trim().replace(/^['"]|['"]$/g, '') || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'CUS_API_KEY no está configurada' }, { status: 500 });
    }

    const body = await request.json();
    const curp = String(body?.curp || '').trim().toUpperCase();

    if (!curp) {
      return NextResponse.json({ error: 'CURP es requerido' }, { status: 400 });
    }

    const baseHeaders: HeadersInit = {
      'X-API-KEY': apiKey,
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'User-Agent': 'PostmanRuntime/7.51.0',
    };

    const doRequest = async (contentType: 'json' | 'form') => {
      const headers: HeadersInit = {
        ...baseHeaders,
        'Content-Type': contentType === 'json'
          ? 'application/json'
          : 'application/x-www-form-urlencoded',
      };

      const payload = { identificador: curp, curp };

      const requestBody = contentType === 'json'
        ? JSON.stringify(payload)
        : new URLSearchParams(payload).toString();

      return fetch(CUS_URL_CURP, {
        method: 'POST',
        headers,
        body: requestBody,
      });
    };

    const attemptInfo: Array<{ contentType: 'json' | 'form'; status: number; statusText: string; body: string }> = [];

    let response = await doRequest('json');
    let textResponse = await response.text();
    attemptInfo.push({
      contentType: 'json',
      status: response.status,
      statusText: response.statusText,
      body: textResponse?.slice(0, 2000) || '',
    });

    // Muchos endpoints PHP devuelven 400 si no llega el body en el formato esperado.
    // Reintentar con x-www-form-urlencoded.
    if (response.status === 400) {
      response = await doRequest('form');
      textResponse = await response.text();
      attemptInfo.push({
        contentType: 'form',
        status: response.status,
        statusText: response.statusText,
        body: textResponse?.slice(0, 2000) || '',
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Error al consultar CURP en CUS: ${response.status} ${response.statusText}`,
          details: textResponse?.slice(0, 2000) || null,
          attempts: attemptInfo,
        },
        { status: response.status }
      );
    }

    const trimmed = (textResponse || '').trim();
    const isJson = trimmed.startsWith('{') || trimmed.startsWith('[');

    if (!isJson) {
      return NextResponse.json(
        {
          error: 'La API devolvió un formato inesperado (no JSON)',
          details: trimmed.slice(0, 2000) || null,
        },
        { status: 502 }
      );
    }

    let data: any;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      return NextResponse.json(
        { error: 'Error al procesar la respuesta de la API (JSON inválido)' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error en /api/cus/curp:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
