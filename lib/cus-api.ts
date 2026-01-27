// Utilidades para interactuar con la API del CUS

// Limpiar y obtener la URL de la variable de entorno
const CUS_API_URL = process.env.CUS_API_URL?.trim().replace(/^["']|["']$/g, '') || '';

if (!CUS_API_URL) {
  console.warn('⚠️ CUS_API_URL no está configurada en las variables de entorno');
}

/**
 * Autentica un usuario con la API del CUS
 * @param curp - CURP del usuario (se usa como username)
 * @param password - Contraseña del usuario
 * @returns Objeto con success, token, id_usuario_general, sub o null/error si falla
 */
export async function loginCUS(curp: string, password: string): Promise<{
  success: true;
  token: string;
  id_usuario_general: string;
  sub: string;
} | {
  success: false;
  error: string;
  status?: number;
} | null> {
  // Verificar que la URL esté configurada
  if (!CUS_API_URL) {
    console.error('Error: CUS_API_URL no está configurada en las variables de entorno');
    return null;
  }

  // Validar que sea una URL válida
  let apiUrl: string;
  try {
    // Intentar crear un objeto URL para validar
    new URL(CUS_API_URL);
    apiUrl = CUS_API_URL;
  } catch (urlError) {
    console.error('Error: CUS_API_URL no es una URL válida:', CUS_API_URL);
    return {
      success: false,
      error: 'URL de API del CUS no válida',
    };
  }

  // Crear AbortController con timeout de 30 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

  try {
    // Preparar el body
    const bodyData = {
      username: curp.toUpperCase(),
      password: password,
    };
    const bodyString = JSON.stringify(bodyData);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: bodyString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Error en login CUS:', response.status, response.statusText);
      
      // Intentar obtener el mensaje de error del body si existe
      let errorMessage = 'Error en la autenticación';
      try {
        const errorData = await response.json();
        console.error('Detalles del error:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear el JSON, usar el status
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Credenciales incorrectas';
        }
      }
      
      // Retornar objeto con información del error
      return {
        success: false,
        error: errorMessage,
        status: response.status,
      };
    }

    const data = await response.json();
    
    // Verificar que la respuesta sea exitosa
    if (data.success === true && data.id_usuario_general) {
      return {
        success: true,
        token: data.token,
        id_usuario_general: data.id_usuario_general,
        sub: data.sub,
      };
    }
    
    // Si la respuesta no tiene success o id_usuario_general
    return {
      success: false,
      error: 'Respuesta inválida de la API del CUS',
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Manejar diferentes tipos de errores
    if (error.name === 'AbortError') {
      console.error('Error: Timeout al conectar con la API del CUS (30 segundos)');
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.code === 'ECONNREFUSED') {
      console.error('Error: No se pudo conectar con la API del CUS. Verifica tu conexión a internet.');
    } else if (error.message?.includes('fetch failed')) {
      console.error('Error: Fallo en la petición a la API del CUS:', error.message);
    } else {
      console.error('Error al llamar a la API del CUS:', error);
    }
    
    return null;
  }
}

/**
 * Obtiene el id_general desde la API del CUS mediante login
 * @param curp - CURP del usuario
 * @param password - Contraseña del usuario
 * @returns id_usuario_general o null si no se puede obtener
 */
export async function getIdGeneralFromCUS(curp: string, password: string): Promise<string | null> {
  try {
    const loginResult = await loginCUS(curp, password);
    if (loginResult && loginResult.success) {
      return loginResult.id_usuario_general;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener id_general del CUS:', error);
    return null;
  }
}

/**
 * Obtiene la información general del usuario desde la API del CUS
 * @param cusToken - Token del CUS obtenido del login
 * @param apiKey - API Key opcional (X-API-KEY)
 * @returns Información del usuario o null si falla
 */
export async function getUserInfoFromCUS(
  cusToken: string,
  apiKey?: string
): Promise<{
  success: true;
  nombre_completo?: string;
  data?: any;
  [key: string]: any;
} | {
  success: false;
  error: string;
} | null> {
  // Usar la misma URL validada que loginCUS
  if (!CUS_API_URL) {
    console.error('Error: CUS_API_URL no está configurada en las variables de entorno');
    return null;
  }

  const INFO_API_URL = CUS_API_URL;

  // Crear AbortController con timeout de 30 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${cusToken}`,
      'Content-Length': '0',
    };

    // Agregar X-API-KEY si está disponible
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
    }

    const response = await fetch(INFO_API_URL, {
      method: 'GET',
      headers: headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Error al obtener información del usuario:', response.status, response.statusText);
      return {
        success: false,
        error: `Error ${response.status}: ${response.statusText}`,
      };
    }

    const responseData = await response.json();
    
    // Extraer nombre_completo de data.nombre_completo
    const nombreCompleto = responseData?.data?.nombre_completo || null;
    
    return {
      success: true,
      nombre_completo: nombreCompleto,
      data: responseData.data,
      ...responseData,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('Error: Timeout al conectar con la API de información (30 segundos)');
    } else {
      console.error('Error al llamar a la API de información:', error);
    }
    
    return null;
  }
}
