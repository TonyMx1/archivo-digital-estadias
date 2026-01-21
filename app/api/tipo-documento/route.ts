import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getTiposDocumento } from '@/lib/db';

// Obtener todos los tipos de documento
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

    const tiposDocumento = await getTiposDocumento();

    return NextResponse.json({
      success: true,
      tiposDocumento,
    });
  } catch (error) {
    console.error('Error al obtener tipos de documento:', error);
    return NextResponse.json(
      { error: 'Error al obtener tipos de documento' },
      { status: 500 }
    );
  }
}
