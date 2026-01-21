// Utilidades para autenticación con JWT (compatible con Edge Runtime)
// Las funciones que requieren BD están en auth-server.ts

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'tu-secret-key-muy-segura-cambiar-en-produccion';

// Crear token JWT
export async function createToken(payload: { id_usuarios: number; curp: string; id_rol: number; id_general?: string | number }) {
  const secret = new TextEncoder().encode(SECRET_KEY);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m') // 30 minutos
    .sign(secret);

  return token;
}

// Verificar token JWT
export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id_usuarios: number; curp: string; id_rol: number; id_general?: string | number; iat: number; exp: number };
  } catch (error) {
    return null;
  }
}

// Obtener token de las cookies
export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}
