// app/api/auth/login/route.ts (o la ruta que estés usando)

import { NextRequest, NextResponse } from 'next/server';
import { getUserByCurp, createUserIfNotExists } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { createSession, hasActiveSession } from '@/lib/auth-server';
import { loginCUS } from '@/lib/cus-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { curp, password } = body;

    // Validación básica
    if (!curp || !password) {
      return NextResponse.json(
        { error: 'CURP y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Paso 1: Autenticar con la API del CUS
    const cusLoginResult = await loginCUS(curp, password);

    if (!cusLoginResult) {
      // Error de conexión o configuración
      return NextResponse.json(
        { 
          error: 'No se pudo conectar con el sistema de autenticación. Por favor, verifica tu conexión a internet e intenta de nuevo.',
          code: 'CONNECTION_ERROR'
        },
        { status: 503 }
      );
    }

    if (!cusLoginResult.success) {
      // Error de credenciales o respuesta inválida
      const statusCode = cusLoginResult.status === 401 || cusLoginResult.status === 403 ? 401 : 503;
      return NextResponse.json(
        { 
          error: cusLoginResult.error || 'Credenciales incorrectas. Verifica tu CURP y contraseña.',
          code: statusCode === 401 ? 'INVALID_CREDENTIALS' : 'CONNECTION_ERROR'
        },
        { status: statusCode }
      );
    }

    // Paso 2: Buscar o crear usuario en la BD local de tu sistema
    // NOTA: Asegúrate que el curp venga limpio
    const cleanCurp = curp.trim().toUpperCase();
    let user = await getUserByCurp(cleanCurp);

    if (!user) {
      user = await createUserIfNotExists({
        curp: cleanCurp,
        // Aquí conectamos el ID que viene de la respuesta JSON que mostraste
        id_general: cusLoginResult.id_usuario_general, 
        id_rol: 7, // Rol de usuario por defecto
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Error al registrar usuario localmente' },
          { status: 500 }
        );
      }
    } else {
      // Actualización de ID si cambió en el sistema externo
      if (user.id_general !== cusLoginResult.id_usuario_general) {
         // Aquí deberías llamar a una función updateUser(user.id, { id_general: ... })
         // Para mantener sincronizado tu sistema con el de San Juan
      }
    }

    // Paso 3: Verificar sesión activa (GateGuard style)
    // Nota: El nombre del usuario se actualizará desde el cliente usando el token del CUS en sessionStorage
    const hasSession = await hasActiveSession(user.id_usuarios);
    
    if (hasSession) {
      return NextResponse.json(
        { 
          error: 'Ya tienes una sesión activa.',
          code: 'SESSION_EXISTS'
        },
        { status: 403 }
      );
    }

    // Paso 5: Crear token JWT interno (para tu app)
    const token = await createToken({
      id_usuarios: user.id_usuarios,
      curp: user.curp,
      id_rol: user.id_rol,
      // Opcional: Puedes meter el id_general al token si lo usas en el frontend
      id_general: user.id_general 
    });

    // Paso 6: Crear sesión en BD (sin guardar el token por seguridad)
    await createSession(user.id_usuarios);

    const response = NextResponse.json(
      { 
        success: true, 
        user: {
          id_usuarios: user.id_usuarios,
          curp: user.curp,
          id_rol: user.id_rol,
          id_general: user.id_general,
        },
        cusToken: cusLoginResult.token, // Token del CUS para guardar en sessionStorage
        message: 'Login exitoso' 
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Error en API route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}