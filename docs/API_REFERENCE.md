# API Reference - Sistema de Archivo Digital

## Overview

Esta documentación describe todos los endpoints disponibles en la API del Sistema de Archivo Digital. La API sigue principios RESTful y utiliza JSON para el intercambio de datos.

## Base URL

```
Development: http://localhost:3000/api
Production: https://dominio-produccion.com/api
```

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT token.

### Headers Requeridos

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Obtener Token

```http
POST /api/auth/login
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Mensaje de error",
  "code": "ERROR_CODE"
}
```

---

## Autenticación Endpoints

### POST /api/auth/login

Autentica un usuario y devuelve un token JWT.

#### Request Body

```json
{
  "username": "string",
  "password": "string"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "rol": "ADMIN_TOTAL",
      "nombre": "Administrador",
      "activo": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Status Codes

- `200`: Autenticación exitosa
- `401`: Credenciales inválidas
- `500`: Error del servidor

---

### POST /api/auth/logout

Cierra la sesión del usuario (invalida el token).

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

#### Status Codes

- `200`: Logout exitoso
- `401`: Token inválido
- `500`: Error del servidor

---

### GET /api/auth/me

Obtiene información del usuario autenticado actual.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "rol": "ADMIN_TOTAL",
    "permisos": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "nombre": "Administrador del Sistema",
    "activo": true
  }
}
```

#### Status Codes

- `200`: Información obtenida exitosamente
- `401`: No autenticado
- `404`: Usuario no encontrado

---

## Documentos Endpoints

### GET /api/documentos

Obtiene un listado de documentos con filtros opcionales.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `search` | string | Búsqueda por texto en nombre o contenido | - |
| `secretaria_id` | number | Filtrar por secretaría | - |
| `dependencia_id` | number | Filtrar por dependencia | - |
| `tipo_documento_id` | number | Filtrar por tipo de documento | - |
| `anio` | number | Filtrar por año | - |
| `estatus` | string | Filtrar por estatus (activo/inactivo) | activo |
| `page` | number | Número de página | 1 |
| `limit` | number | Resultados por página | 6 |

#### Response

```json
{
  "success": true,
  "data": {
    "documentos": [
      {
        "id": 1,
        "nombre_archivo": "oficio_2024_001.pdf",
        "ruta_archivo": "/uploads/oficio_2024_001.pdf",
        "oficio": "OF-2024-001",
        "expediente": "EXP-2024-001",
        "serie": "SERIE_A",
        "subserie": "SUBSERIE_1",
        "confidencialidad": "publico",
        "texto_extraido": "Texto extraído del documento...",
        "tipo_documento": {
          "id": 1,
          "nombre": "Oficio"
        },
        "secretaria": {
          "id": 1,
          "nombre": "Secretaría de Gobierno"
        },
        "dependencia": {
          "id": 1,
          "nombre": "Dirección de Comunicación"
        },
        "version": 1,
        "estatus": "activo",
        "fecha_creacion": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 25,
      "itemsPerPage": 6
    }
  }
}
```

#### Status Codes

- `200`: Documentos obtenidos exitosamente
- `401`: No autorizado
- `500`: Error del servidor

---

### POST /api/documentos

Crea un nuevo documento en el sistema.

#### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

#### Request Body (multipart/form-data)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file` | File | Sí | Archivo del documento (PDF, DOCX, imagen) |
| `oficio` | string | No | Número de oficio |
| `expediente` | string | No | Número de expediente |
| `serie` | string | No | Serie documental |
| `subserie` | string | No | Subserie documental |
| `confidencialidad` | string | No | Nivel de confidencialidad |
| `tipo_documento_id` | number | Sí | ID del tipo de documento |
| `secretaria_id` | number | Sí | ID de la secretaría |
| `dependencia_id` | number | Sí | ID de la dependencia |

#### Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "nombre_archivo": "documento_subido.pdf",
    "ruta_archivo": "/uploads/documento_subido.pdf",
    "texto_extraido": "Texto extraído mediante OCR...",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Documento creado exitosamente"
}
```

#### Status Codes

- `201`: Documento creado exitosamente
- `400`: Datos inválidos o archivo no válido
- `401`: No autorizado
- `413`: Archivo demasiado grande (máximo 25MB)
- `500`: Error del servidor

---

### PUT /api/documentos/[id]

Actualiza un documento existente.

#### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

#### URL Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del documento a actualizar |

#### Request Body

Mismos campos que POST, pero todos son opcionales excepto el ID.

#### Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "updated_fields": ["oficio", "expediente"],
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "message": "Documento actualizado exitosamente"
}
```

#### Status Codes

- `200`: Documento actualizado exitosamente
- `400`: Datos inválidos
- `401`: No autorizado
- `404`: Documento no encontrado
- `500`: Error del servidor

---

### DELETE /api/documentos/[id]

Elimina un documento del sistema.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### URL Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del documento a eliminar |

#### Response

```json
{
  "success": true,
  "message": "Documento eliminado exitosamente"
}
```

#### Status Codes

- `200`: Documento eliminado exitosamente
- `401`: No autorizado
- `403`: Permisos insuficientes
- `404`: Documento no encontrado
- `500`: Error del servidor

---

### GET /api/documentos/[id]

Obtiene detalles de un documento específico.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### URL Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID del documento |

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_archivo": "oficio_2024_001.pdf",
    "ruta_archivo": "/uploads/oficio_2024_001.pdf",
    "oficio": "OF-2024-001",
    "expediente": "EXP-2024-001",
    "serie": "SERIE_A",
    "subserie": "SUBSERIE_1",
    "confidencialidad": "publico",
    "texto_extraido": "Texto completo extraído...",
    "tipo_documento": {
      "id": 1,
      "nombre": "Oficio",
      "descripcion": "Documentos oficiales de comunicación"
    },
    "secretaria": {
      "id": 1,
      "nombre": "Secretaría de Gobierno",
      "descripcion": "Secretaría principal del municipio"
    },
    "dependencia": {
      "id": 1,
      "nombre": "Dirección de Comunicación",
      "descripcion": "Área de comunicación interna"
    },
    "version": 1,
    "estatus": "activo",
    "fecha_creacion": "2024-01-15T10:30:00Z",
    "fecha_actualizacion": "2024-01-15T10:30:00Z"
  }
}
```

#### Status Codes

- `200`: Documento obtenido exitosamente
- `401`: No autorizado
- `404`: Documento no encontrado
- `500`: Error del servidor

---

## OCR Endpoints

### POST /api/ocr

Procesa un archivo mediante OCR para extraer texto.

#### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "filePath": "/uploads/documento.pdf",
  "fileType": "pdf"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "text": "Texto extraído del documento mediante OCR...",
    "processingTime": 2.5,
    "confidence": 0.95
  }
}
```

#### Status Codes

- `200`: Texto extraído exitosamente
- `400`: Archivo no válido o no encontrado
- `408`: Timeout en procesamiento (máximo 60 segundos)
- `500`: Error en procesamiento OCR

---

## Secretarías Endpoints

### GET /api/secretarias

Obtiene el listado de secretarías activas.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `include_inactive` | boolean | Incluir secretarías inactivas | false |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Secretaría de Gobierno",
      "descripcion": "Secretaría principal del municipio",
      "activo": true,
      "dependencias_count": 5,
      "documentos_count": 150
    },
    {
      "id": 2,
      "nombre": "Secretaría de Hacienda",
      "descripcion": "Administración financiera",
      "activo": true,
      "dependencias_count": 3,
      "documentos_count": 85
    }
  ]
}
```

#### Status Codes

- `200`: Secretarías obtenidas exitosamente
- `401`: No autorizado
- `500`: Error del servidor

---

### POST /api/secretarias

Crea una nueva secretaría (requiere rol de administrador).

#### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "nombre": "Nueva Secretaría",
  "descripcion": "Descripción de la secretaría"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 10,
    "nombre": "Nueva Secretaría",
    "descripcion": "Descripción de la secretaría",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Secretaría creada exitosamente"
}
```

#### Status Codes

- `201`: Secretaría creada exitosamente
- `400`: Datos inválidos
- `401`: No autorizado
- `403`: Permisos insuficientes
- `500`: Error del servidor

---

## Dependencias Endpoints

### GET /api/dependencias

Obtiene dependencias, opcionalmente filtradas por secretaría.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `secretaria_id` | number | Filtrar por secretaría | - |
| `include_inactive` | boolean | Incluir dependencias inactivas | false |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Dirección de Comunicación",
      "descripcion": "Área de comunicación interna y externa",
      "secretaria_id": 1,
      "secretaria_nombre": "Secretaría de Gobierno",
      "activo": true,
      "documentos_count": 45
    }
  ]
}
```

#### Status Codes

- `200`: Dependencias obtenidas exitosamente
- `401`: No autorizado
- `500`: Error del servidor

---

### POST /api/dependencias

Crea una nueva dependencia.

#### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "nombre": "Nueva Dependencia",
  "descripcion": "Descripción de la dependencia",
  "secretaria_id": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 20,
    "nombre": "Nueva Dependencia",
    "descripcion": "Descripción de la dependencia",
    "secretaria_id": 1,
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Dependencia creada exitosamente"
}
```

#### Status Codes

- `201`: Dependencia creada exitosamente
- `400`: Datos inválidos
- `401`: No autorizado
- `404`: Secretaría no encontrada
- `500`: Error del servidor

---

## Usuarios Endpoints

### GET /api/usuarios

Obtiene listado de usuarios (solo administradores).

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `rol` | string | Filtrar por rol | - |
| `activo` | boolean | Filtrar por estatus | - |
| `page` | number | Número de página | 1 |
| `limit` | number | Resultados por página | 10 |

#### Response

```json
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": 1,
        "username": "admin",
        "nombre": "Administrador",
        "rol": "ADMIN_TOTAL",
        "rol_nombre": "Administrador Total",
        "activo": true,
        "ultimo_login": "2024-01-15T09:00:00Z",
        "documentos_count": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

#### Status Codes

- `200`: Usuarios obtenidos exitosamente
- `401`: No autorizado
- `403`: Permisos insuficientes
- `500`: Error del servidor

---

### POST /api/usuarios

Crea un nuevo usuario (solo administradores).

#### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "username": "nuevo_usuario",
  "password": "password_seguro",
  "nombre": "Nombre del Usuario",
  "rol": "EDITOR"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 50,
    "username": "nuevo_usuario",
    "nombre": "Nombre del Usuario",
    "rol": "EDITOR",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Usuario creado exitosamente"
}
```

#### Status Codes

- `201`: Usuario creado exitosamente
- `400`: Datos inválidos o username duplicado
- `401`: No autorizado
- `403`: Permisos insuficientes
- `500`: Error del servidor

---

## Estadísticas Endpoints

### GET /api/statistics

Obtiene estadísticas generales del sistema.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": {
    "documentos": {
      "total": 1250,
      "activos": 1180,
      "inactivos": 70,
      "este_mes": 45
    },
    "secretarias": {
      "total": 8,
      "activas": 7,
      "inactivas": 1
    },
    "dependencias": {
      "total": 25,
      "activas": 22,
      "inactivas": 3
    },
    "usuarios": {
      "total": 50,
      "activos": 45,
      "administradores": 5,
      "editores": 20,
      "visores": 20
    },
    "actividad_reciente": {
      "documentos_creados_hoy": 3,
      "usuarios_activos_hoy": 12,
      "busqueras_realizadas_hoy": 85
    }
  }
}
```

#### Status Codes

- `200`: Estadísticas obtenidas exitosamente
- `401`: No autorizado
- `500`: Error del servidor

---

## Activity Endpoints

### GET /api/activity

Obtiene registro de actividades recientes.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `user_id` | number | Filtrar por usuario | - |
| `action` | string | Filtrar por tipo de acción | - |
| `limit` | number | Número de registros | 50 |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "username": "admin",
      "action": "documento_creado",
      "description": "Creó el documento OF-2024-001",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "username": "admin",
      "action": "login",
      "description": "Inició sesión",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

#### Status Codes

- `200`: Actividades obtenidas exitosamente
- `401`: No autorizado
- `500`: Error del servidor

---

## Tipos de Documento Endpoints

### GET /api/tipos-documento

Obtiene los tipos de documento disponibles.

#### Headers

```http
Authorization: Bearer <jwt_token>
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Oficio",
      "descripcion": "Documentos oficiales de comunicación",
      "activo": true
    },
    {
      "id": 2,
      "nombre": "Memo",
      "descripcion": "Memorándums internos",
      "activo": true
    },
    {
      "id": 3,
      "nombre": "Informe",
      "descripcion": "Informes y reportes",
      "activo": true
    }
  ]
}
```

#### Status Codes

- `200`: Tipos obtenidos exitosamente
- `401`: No autorizado
- `500`: Error del servidor

---

## Errores Comunes

### Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| `INVALID_TOKEN` | Token JWT inválido o expirado | Renovar token |
| `INSUFFICIENT_PERMISSIONS` | Permisos insuficientes | Contactar administrador |
| `RESOURCE_NOT_FOUND` | Recurso no encontrado | Verificar ID |
| `VALIDATION_ERROR` | Datos inválidos | Revisar formato de datos |
| `FILE_TOO_LARGE` | Archivo demasiado grande | Reducir tamaño (<25MB) |
| `UNSUPPORTED_FILE_TYPE` | Tipo de archivo no soportado | Usar PDF, DOCX o imágenes |
| `OCR_PROCESSING_ERROR` | Error en procesamiento OCR | Reintentar o verificar archivo |
| `DATABASE_ERROR` | Error en base de datos | Contactar soporte técnico |

### Ejemplos de Manejo de Errores

#### JavaScript/TypeScript

```typescript
try {
  const response = await fetch('/api/documentos', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (!data.success) {
    switch (data.code) {
      case 'INVALID_TOKEN':
        // Redirigir a login
        break;
      case 'INSUFFICIENT_PERMISSIONS':
        // Mostrar mensaje de error
        break;
      default:
        // Error genérico
    }
  }
} catch (error) {
  console.error('Error en API:', error);
}
```

---

## Rate Limiting

Para proteger la API, implementamos límites de uso:

- **Autenticación**: 5 intentos por minuto
- **OCR**: 3 procesamientos por minuto
- **Búsqueda**: 100 consultas por minuto
- **CRUD**: 60 operaciones por minuto

Exceder estos límites resultará en status code `429 Too Many Requests`.

---

## Versionamiento

La API utiliza versionamiento semántico en las URLs:

- Versión actual: `v1`
- URLs: `/api/v1/...`
- Cambios breaking: Nueva versión mayor
- Cambios no-breaking: Mismo número de versión

---

## Soporte

Para reportar problemas o solicitar asistencia con la API:

- **Documentation Issues**: GitHub Issues
- **Bug Reports**: Sistema de tickets interno
- **Security Issues**: Contactar directamente al equipo de seguridad

---

**Última actualización**: Enero 2026
**Versión**: v1.0.0
