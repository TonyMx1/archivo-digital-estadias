import { NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from '@/lib/auth';
import { getSecretarias } from '@/lib/db';

// Obtener todas las secretarías
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

    const secretarias = await getSecretarias();

    return NextResponse.json({
      success: true,
      secretarias,
    });
  } catch (error) {
    console.error('Error al obtener secretarías:', error);
    return NextResponse.json(
      { error: 'Error al obtener secretarías' },
      { status: 500 }
    );
  }
}
