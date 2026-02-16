# Documentación Técnica - Sistema de Archivo Digital

## Tabla de Contenido

1. [Arquitectura General](#arquitectura-general)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Base de Datos](#base-de-datos)
5. [API Endpoints](#api-endpoints)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [Procesamiento OCR](#procesamiento-ocr)
8. [Componentes Principales](#componentes-principales)
9. [Hooks Personalizados](#hooks-personalizados)
10. [Desarrollo y Despliegue](#desarrollo-y-despliegue)

---

## Arquitectura General

### Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Node.js
- **Base de Datos**: PostgreSQL
- **Estilos**: TailwindCSS + Radix UI
- **OCR**: Tesseract.js + PDF.js + Mammoth
- **Autenticación**: JWT (jose)

### Flujo de Arquitectura

```
Usuario → Frontend (Next.js) → API Routes → PostgreSQL
                ↓
            OCR Processing → Text Extraction → Search Index
```

---

## Configuración del Entorno

### Variables de Entorno Requeridas

Crear archivo `.env.local`:

```env
# Base de Datos PostgreSQL
DB_HOST=sanjuandelrio.sytes.net
DB_PORT=5432
DB_NAME=archivodigital_practicante
DB_USER=user_flota
DB_PASSWORD=flota_2024!
DB_SSL=false

# JWT Authentication
JWT_SECRET=tu-secret-key-muy-segura-y-aleatoria-aqui-cambiar-en-produccion

# API Externa (CUS)
CUS_API_URL=https://sanjuandelrio.gob.mx/tramites-sjr/Api/principal/login
```

### Generación de JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Estructura del Proyecto

### Directorios Principales

```
archivo-digital/
├── app/                     # Next.js App Router
│   ├── admin/              # Panel de administración
│   ├── api/                # API Routes
│   │   ├── activity/       # Tracking de actividad
│   │   ├── admin/          # Gestión de administradores
│   │   ├── auth/           # Autenticación
│   │   ├── dependencias/   # Gestión de dependencias
│   │   ├── documentos/     # CRUD documentos
│   │   ├── ocr/            # Procesamiento OCR
│   │   ├── secretarias/    # Gestión de secretarías
│   │   └── usuarios/       # Gestión de usuarios
│   ├── documentos/         # Interfaz de documentos
│   ├── exito/             # Página de éxito
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Dashboard
├── components/            # Componentes React
│   ├── ui/                # Componentes UI base
│   ├── ActivityTracker.tsx
│   ├── DependenciasModal.tsx
│   ├── DocumentosModal.tsx
│   └── ...
├── hooks/                 # Hooks personalizados
│   ├── useActivity.ts
│   ├── useAdminUsers.ts
│   ├── useDependencias.ts
│   └── useDocumentos.ts
├── lib/                   # Utilidades
│   ├── auth-permisos.ts   # Lógica de permisos
│   ├── auth-server.ts     # Configuración auth servidor
│   ├── auth.ts            # Utilidades auth
│   └── cus-api.ts         # Cliente API CUS
└── public/                # Archivos estáticos
```

---

## Base de Datos

### Esquema Principal

#### Tablas Principales

```sql
-- Usuarios y autenticación
usuarios
├── id (serial, primary key)
├── username (varchar, unique)
├── password (varchar)
├── rol_id (integer, foreign key)
└── activo (boolean)

-- Roles del sistema
roles
├── id (serial, primary key)
├── nombre (varchar, unique)
└── descripcion (text)

-- Permisos por rol
rol_permisos
├── rol_id (integer, foreign key)
├── permiso_id (integer)
└── concedido (boolean)

-- Estructura organizacional
secretarias
├── id (serial, primary key)
├── nombre (varchar, unique)
├── descripcion (text)
└── activo (boolean)

dependencias
├── id (serial, primary key)
├── nombre (varchar)
├── secretaria_id (integer, foreign key)
├── activo (boolean)
└── descripcion (text)

-- Gestión documental
documentos
├── id (serial, primary key)
├── nombre_archivo (varchar)
├── ruta_archivo (varchar)
├── texto_extraido (text)
├── oficio (varchar)
├── expediente (varchar)
├── serie (varchar)
├── subserie (varchar)
├── confidencialidad (varchar)
├── tipo_documento_id (integer, foreign key)
├── secretaria_id (integer, foreign key)
├── dependencia_id (integer, foreign key)
├── fecha_creacion (timestamp)
├── version (integer)
└── estatus (varchar)

-- Tipos de documentos
tipo_documento
├── id (serial, primary key)
├── nombre (varchar, unique)
└── descripcion (text)
```

---

## API Endpoints

### Autenticación

#### `POST /api/auth/login`
**Descripción**: Autentica usuarios y genera JWT token

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "rol": "ADMIN_TOTAL"
  },
  "token": "jwt_token_here"
}
```

#### `POST /api/auth/logout`
**Descripción**: Cierra sesión del usuario

### Gestión de Documentos

#### `GET /api/documentos`
**Descripción**: Obtiene listado de documentos con filtros

**Query Parameters**:
- `search` (string): Búsqueda por texto
- `secretaria` (number): Filtrar por secretaría
- `tipo` (number): Filtrar por tipo de documento
- `anio` (number): Filtrar por año
- `estatus` (string): Filtrar por estatus
- `page` (number): Número de página (default: 1)

#### `POST /api/documentos`
**Descripción**: Crea un nuevo documento

**Request Body** (multipart/form-data):
- `file`: Archivo (PDF, DOCX, imagen)
- `oficio`: String
- `expediente`: String
- `serie`: String
- `subserie`: String
- `confidencialidad`: String
- `tipo_documento_id`: Number
- `secretaria_id`: Number
- `dependencia_id`: Number

#### `POST /api/ocr`
**Descripción**: Procesa OCR de un archivo

**Request Body**:
```json
{
  "filePath": "string",
  "fileType": "pdf|docx|image"
}
```

**Response**:
```json
{
  "success": true,
  "text": "texto_extraido_aqui"
}
```

### Gestión Organizacional

#### `GET /api/secretarias`
**Descripción**: Obtiene listado de secretarías activas

#### `GET /api/dependencias`
**Descripción**: Obtiene dependencias por secretaría

**Query Parameters**:
- `secretaria_id` (number): ID de la secretaría

---

## Autenticación y Seguridad

### Sistema de Roles

#### Roles Definidos

1. **ADMIN_TOTAL (1)**: Acceso completo
2. **EDITOR (2)**: Creación y edición
3. **SOLO_LECTURA (3)**: Solo visualización
4. **VISITANTE (9)**: Acceso restringido

#### Permisos del Sistema

```typescript
const PERMISOS = {
  VER_DOCUMENTOS: 1,
  CREAR_DOCUMENTOS: 2,
  EDITAR_DOCUMENTOS: 3,
  ELIMINAR_DOCUMENTOS: 4,
  VER_SECRETARIAS: 5,
  GESTIONAR_SECRETARIAS: 6,
  VER_USUARIOS: 7,
  GESTIONAR_USUARIOS: 8,
  VER_ESTADISTICAS: 9,
  ACCESO_ADMIN: 10,
  DESCARGAR_DOCUMENTOS: 11
};
```

### Middleware de Autenticación

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Verificar token JWT
  // Validar permisos por ruta
  // Redirigir según rol
}
```

### Flujo de Autenticación

1. **Login**: Usuario envía credenciales
2. **Validación**: Verificar contra base de datos
3. **Token**: Generar JWT con payload de usuario
4. **Storage**: Guardar token en cookie HTTP-only
5. **Verification**: Middleware verifica token en cada request

---

## Procesamiento OCR

### Arquitectura de Procesamiento

```
Archivo Subido → Identificar Tipo → Procesador Específico → Extraer Texto → Almacenar
```

### Procesadores Disponibles

#### 1. PDF (PDF.js)
```typescript
async function extractTextFromPDF(filePath: string): Promise<string> {
  const pdfDocument = await pdfjsLib.getDocument(filePath).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}
```

#### 2. Word (Mammoth)
```typescript
async function extractTextFromDOCX(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}
```

#### 3. Imágenes (Tesseract.js)
```typescript
async function extractTextFromImage(filePath: string): Promise<string> {
  const worker = await createWorker('spa');
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}
```

### Configuración OCR

- **Timeout**: 60 segundos por procesamiento
- **Idioma**: Español ('spa')
- **Límite de tamaño**: 25MB por archivo
- **Formatos soportados**: PDF, DOCX, PNG, JPG, JPEG

---

## Componentes Principales

### DocumentosModal.tsx
**Propósito**: Modal para crear/editar documentos

**Features**:
- Formulario completo con validación
- Upload de archivos
- Selectores dinámicos de secretaría/dependencia
- Estados de carga y error

### ActivityTracker.tsx
**Propósito**: Monitoreo de actividad en tiempo real

**Features**:
- WebSocket connection (simulado)
- Lista de actividades recientes
- Filtros por tipo de acción

### DependenciasModal.tsx
**Propósito**: Gestión de dependencias por secretaría

**Features**:
- CRUD operations
- Validación de duplicados
- Toggle de estatus activo/inactivo

---

## Hooks Personalizados

### useDocumentos.ts
```typescript
interface UseDocumentosReturn {
  documentos: Documento[];
  loading: boolean;
  error: string | null;
  crearDocumento: (data: FormData) => Promise<void>;
  actualizarDocumento: (id: number, data: FormData) => Promise<void>;
  eliminarDocumento: (id: number) => Promise<void>;
  buscarDocumentos: (filtros: SearchFilters) => Promise<void>;
}
```

### useActivity.ts
```typescript
interface UseActivityReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
  subscribeToUpdates: () => void;
}
```

### useDependencias.ts
```typescript
interface UseDependenciasReturn {
  dependencias: Dependencia[];
  loading: boolean;
  crearDependencia: (data: DependenciaData) => Promise<void>;
  actualizarDependencia: (id: number, data: Partial<DependenciaData>) => Promise<void>;
  toggleEstatus: (id: number) => Promise<void>;
}
```

---

## Desarrollo y Despliegue

### Scripts Disponibles

```json
{
  "dev": "next dev -H 0.0.0.0 -p 3000",
  "build": "next build",
  "start": "next start -H 0.0.0.0 -p 3000",
  "lint": "eslint"
}
```

### Configuración de Desarrollo

1. **Instalación**:
```bash
npm install
# o
yarn install
```

2. **Configurar variables de entorno** (ver sección [Configuración del Entorno](#configuración-del-entorno))

3. **Ejecutar en desarrollo**:
```bash
npm run dev
```

4. **Acceder**: http://localhost:3000

### Build para Producción

```bash
npm run build
npm start
```

### Consideraciones de Despliegue

- **Base de Datos**: PostgreSQL debe estar accesible
- **Almacenamiento**: Directorio uploads debe tener permisos de escritura
- **Environment**: Variables de entorno configuradas
- **SSL**: Configurar HTTPS en producción
- **CORS**: Ajustar según dominios permitidos

---

## Buenas Prácticas

### Seguridad
- Nunca exponer JWT_SECRET en código
- Usar cookies HTTP-only para tokens
- Validar todos los inputs del usuario
- Implementar rate limiting en endpoints críticos

### Performance
- Implementar paginación en listados grandes
- Usar memoization en componentes pesados
- Optimizar imágenes y archivos
- Configurar caching adecuado

### Código
- Seguir convenciones de TypeScript
- Componentes reutilizables y modulares
- Manejo adecuado de errores
- Logging de operaciones importantes

---

## Troubleshooting

### Problemas Comunes

#### OCR no funciona
- Verificar que el archivo no exceda 25MB
- Confirmar que el formato sea soportado
- Revisar logs del servidor para errores de Tesseract

#### Login fallido
- Verificar conexión a base de datos
- Confirmar variables de entorno
- Revisar que el usuario esté activo

#### Archivos no se suben
- Verificar permisos del directorio uploads
- Confirmar tamaño máximo permitido
- Revisar configuración de multipart/form-data

---

## Contacto y Soporte

Para soporte técnico o reporte de issues, contactar al equipo de desarrollo del Municipio de San Juan del Río.

---

**Última actualización**: Enero 2026
**Versión**: 0.1.0
