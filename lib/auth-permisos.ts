// Helper para verificar permisos en API routes
import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies, verifyToken } from './auth';
import { hasPermission, hasAnyPermission, hasAllPermissions } from './db';

interface AuthResult {
  authorized: boolean;
  payload: {
    id_usuarios: number;
    curp: string;
    id_rol: number;
    id_general?: string | number;
  } | null;
  error?: string;
}

// Verificar autenticación básica
export async function checkAuth(): Promise<AuthResult> {
  const token = await getTokenFromCookies();
  
  if (!token) {
    return { authorized: false, payload: null, error: 'No autorizado' };
  }

  const payload = await verifyToken(token);
  
  if (!payload) {
    return { authorized: false, payload: null, error: 'Token inválido' };
  }

  return { authorized: true, payload };
}

// Verificar que el usuario tiene un permiso específico
export async function requirePermission(
  nombrePermiso: string
): Promise<{ authorized: boolean; payload: AuthResult['payload']; response?: NextResponse }> {
  const auth = await checkAuth();
  
  if (!auth.authorized || !auth.payload) {
    return {
      authorized: false,
      payload: null,
      response: NextResponse.json({ error: auth.error }, { status: 401 }),
    };
  }

  const tienePermiso = await hasPermission(auth.payload.id_rol, nombrePermiso);
  
  if (!tienePermiso) {
    return {
      authorized: false,
      payload: auth.payload,
      response: NextResponse.json(
        { error: 'No tienes permiso para realizar esta acción' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, payload: auth.payload };
}

// Verificar que el usuario tiene al menos uno de los permisos
export async function requireAnyPermission(
  permisos: string[]
): Promise<{ authorized: boolean; payload: AuthResult['payload']; response?: NextResponse }> {
  const auth = await checkAuth();
  
  if (!auth.authorized || !auth.payload) {
    return {
      authorized: false,
      payload: null,
      response: NextResponse.json({ error: auth.error }, { status: 401 }),
    };
  }

  const tienePermiso = await hasAnyPermission(auth.payload.id_rol, permisos);
  
  if (!tienePermiso) {
    return {
      authorized: false,
      payload: auth.payload,
      response: NextResponse.json(
        { error: 'No tienes permiso para realizar esta acción' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, payload: auth.payload };
}

// Verificar que el usuario tiene todos los permisos especificados
export async function requireAllPermissions(
  permisos: string[]
): Promise<{ authorized: boolean; payload: AuthResult['payload']; response?: NextResponse }> {
  const auth = await checkAuth();
  
  if (!auth.authorized || !auth.payload) {
    return {
      authorized: false,
      payload: null,
      response: NextResponse.json({ error: auth.error }, { status: 401 }),
    };
  }

  const tienePermisos = await hasAllPermissions(auth.payload.id_rol, permisos);
  
  if (!tienePermisos) {
    return {
      authorized: false,
      payload: auth.payload,
      response: NextResponse.json(
        { error: 'No tienes todos los permisos necesarios para esta acción' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, payload: auth.payload };
}
