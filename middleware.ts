import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Rutas que no requieren autenticación
const publicRoutes = ['/login', '/api/login', '/api/logout'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Obtener token de las cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirigir a login si no hay token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar token JWT (sin consultar BD - compatible con Edge Runtime)
  const payload = await verifyToken(token);

  if (!payload) {
    // Token inválido o expirado, limpiar cookie y redirigir
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('auth-token');
    return response;
  }

  // Verificar si el token expiró según su exp claim
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Token expirado' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('auth-token');
    return response;
  }

  // Si el usuario es visitante (rol 9), solo permitir acceso a /visitante
  if (payload.id_rol === 9) {
    if (pathname !== '/visitante' && !pathname.startsWith('/api/user') && pathname !== '/api/logout') {
      return NextResponse.redirect(new URL('/visitante', request.url));
    }
  }

  // Agregar información del usuario a los headers para uso en el servidor
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.id_usuarios.toString());
  response.headers.set('x-user-curp', payload.curp);
  response.headers.set('x-user-rol', payload.id_rol.toString());

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
