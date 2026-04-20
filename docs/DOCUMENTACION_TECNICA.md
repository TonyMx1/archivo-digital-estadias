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

- **Frontend**: Next.js 16.1.1 + React 19.2.3 + TypeScript 5
- **Backend**: Next.js API Routes + Node.js
- **Base de Datos**: PostgreSQL (pg 8.16.3)
- **Estilos**: TailwindCSS 4 + Radix UI + Flowbite React
- **OCR**: Tesseract.js 7.0.0 + PDF.js 5.4.296 + Mammoth 1.11.0 + pdf-parse 2.4.5
- **Autenticación**: JWT (jose 6.1.3)
- **UI Components**: Lucide React 0.563.0 + Skeleton Labs 4.12.1
- **Fechas**: date-fns 4.1.0 + react-datepicker 9.1.0 + react-day-picker 9.13.0

### Flujo de Arquitectura

```
Usuario → Frontend (Next.js) → API Routes → PostgreSQL
                ↓
            OCR Processing → Text Extraction → Search Index
                ↓
    Document Access Control → Permission Validation → Response
```

---

## Configuración del Entorno

### Variables de Entorno Requeridas

> ⚠️ **Nota de Seguridad**: Nunca subas el archivo `.env.local` con credenciales reales a GitHub. Este archivo debe mantenerse local y agregarse al `.gitignore`.

Crear archivo `.env.local`:

```env
# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_base_datos
DB_USER=usuario
DB_PASSWORD=contraseña_segura
DB_SSL=false

# JWT Authentication
JWT_SECRET=genera_un_secreto_seguro_de_32_bytes

# API Externa (CUS)
CUS_API_URL=https://api.ejemplo.gob.mx/login
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
│   ├── (auth)/             # Rutas de autenticación
│   ├── admin/              # Panel de administración
│   ├── api/                # API Routes
│   │   ├── activity/       # Tracking de actividad
│   │   ├── admin/          # Gestión de administradores
│   │   ├── cus/            # API externa CUS
│   │   ├── dependencias/   # Gestión de dependencias
│   │   ├── documentos/     # CRUD documentos
│   │   ├── login/          # Autenticación
│   │   ├── logout/         # Cierre de sesión
│   │   ├── ocr/            # Procesamiento OCR
│   │   ├── prestamos/      # Gestión de préstamos
│   │   ├── secretarias/    # Gestión de secretarías
│   │   ├── statistics/     # Estadísticas del sistema
│   │   ├── tipo-documento/ # Tipos de documento
│   │   ├── upload/         # Subida de archivos
│   │   └── user/           # Usuario actual
│   ├── acerca-de/          # Página acerca de
│   ├── documentos/         # Interfaz de documentos
│   ├── login/              # Página de login
│   ├── visitante/          # Vista de visitante
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal
│   └── page.tsx           # Dashboard
├── components/            # Componentes React
│   ├── ui/                # Componentes UI base
│   ├── ActivityTracker.tsx
│   ├── DependenciasModal.tsx
│   ├── DocumentosModal.tsx
│   ├── ErrorState.tsx
│   ├── ExitoFooter.tsx
│   ├── HeaderAll.tsx
│   ├── LoadingState.tsx
│   ├── LoginAndVisitanteFooter.tsx
│   ├── LoginForm.tsx
│   ├── PaginationControls.tsx
│   ├── PermissionGuard.tsx
│   ├── SecretariasTable.tsx
│   ├── SessionTimer.tsx
│   ├── SkeletonCard.tsx
│   └── UsersTable.tsx
├── hooks/                 # Hooks personalizados
│   ├── useActivity.ts
│   ├── useAdminUsers.ts
│   ├── useCurrentUser.ts
│   ├── useDependencias.ts
│   ├── useDocumentos.ts
│   ├── useLogin.ts
│   ├── usePagination.ts
│   ├── usePermisos.tsx
│   ├── usePrestamos.ts
│   └── useSecretarias.ts
├── lib/                   # Utilidades
│   ├── auth-permisos.ts   # Lógica de permisos
│   ├── auth-server.ts     # Configuración auth servidor
│   ├── auth.ts            # Utilidades auth
│   ├── cus-api.ts         # Cliente API CUS
│   ├── db.ts              # Conexión base de datos
│   ├── document-access.ts # Control acceso documentos
│   ├── permisos.ts        # Definición permisos
│   └── utils.ts           # Utilidades generales
├── public/                # Archivos estáticos
├── types/                 # Definiciones TypeScript
└── docs/                  # Documentación
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

-- Gestión de préstamos
prestamos_documentos
├── id_prestamo (serial, primary key)
├── id_doc (integer, foreign key → documentos.id_doc)
├── nombre_solicitante (varchar)
├── curp_solicitante (varchar)
├── area_solicitante (varchar)
├── motivo_prestamo (text)
├── observaciones (text)
├── fecha_prestamo (timestamp)
├── fecha_limite_devolucion (timestamp)
├── fecha_devolucion (timestamp, nullable)
├── estatus_prestamo (varchar: 'Prestado' | 'Vencido' | 'Devuelto' | 'Cancelado')
├── vale_url (varchar, nullable)
├── id_usuario_registro (integer, foreign key → usuarios.id)
├── id_usuario_devolucion (integer, foreign key → usuarios.id, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## API Endpoints

### Autenticación

#### `POST /api/login`
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
    "id_usuarios": 1,
    "username": "admin",
    "id_rol": 1,
    "nombre_rol": "ADMIN_TOTAL"
  },
  "token": "jwt_token_here"
}
```

#### `POST /api/logout`
**Descripción**: Cierra sesión del usuario

#### `GET /api/user`
**Descripción**: Obtiene información del usuario actual

**Response**:
```json
{
  "success": true,
  "user": {
    "id_usuarios": 1,
    "curp": "ABC123456",
    "id_rol": 1,
    "id_general": "ADMIN001",
    "nombre_usuario": "Administrador",
    "nom_secre": "Secretaría General",
    "nombre_rol": "ADMIN_TOTAL",
    "permisos": ["VER_DOCUMENTOS", "CREAR_DOCUMENTOS", ...]
  }
}
```

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

#### `POST /api/upload`
**Descripción**: Sube archivos al servidor

**Request Body** (multipart/form-data):
- `file`: Archivo (PDF, DOCX, imagen)

**Response**:
```json
{
  "success": true,
  "filePath": "/uploads/filename.pdf",
  "fileName": "filename.pdf"
}
```

### Gestión de Préstamos

#### `GET /api/prestamos`
**Descripción**: Obtiene listado de préstamos con filtros

**Query Parameters**:
- `id_doc` (number): Filtrar por documento
- `id_secre` (number): Filtrar por secretaría
- `estatus_prestamo` (string): Filtrar por estatus ('Prestado', 'Vencido', 'Devuelto', 'Cancelado')

**Response**:
```json
{
  "success": true,
  "prestamos": [
    {
      "id_prestamo": 1,
      "id_doc": 123,
      "nombre_doc": "Documento Ejemplo",
      "nombre_solicitante": "Juan Pérez",
      "curp_solicitante": "ABC123456",
      "fecha_prestamo": "2026-01-15T10:00:00Z",
      "fecha_limite_devolucion": "2026-01-22T10:00:00Z",
      "estatus_prestamo": "Prestado"
    }
  ]
}
```

#### `POST /api/prestamos`
**Descripción**: Crea un nuevo préstamo

**Request Body**:
```json
{
  "id_doc": 123,
  "nombre_solicitante": "Juan Pérez",
  "curp_solicitante": "ABC123456",
  "area_solicitante": "Dirección General",
  "motivo_prestamo": "Revisión interna",
  "observaciones": "Entregado en buenas condiciones",
  "fecha_limite_devolucion": "2026-01-22"
}
```

#### `PUT /api/prestamos`
**Descripción**: Registra la devolución de un préstamo

**Request Body**:
```json
{
  "id_prestamo": 1,
  "fecha_devolucion": "2026-01-20T15:30:00Z",
  "observaciones_devolucion": "Devuelto en buen estado"
}
```

### Estadísticas del Sistema

#### `GET /api/statistics`
**Descripción**: Obtiene estadísticas generales del sistema

**Response**:
```json
{
  "success": true,
  "statistics": {
    "total_secretarias": 15,
    "total_dependencias": 45,
    "total_documentos": 1250,
    "archivos_prestados_activos": 23,
    "documentos_por_secretaria": [
      {
        "id_secretaria": 1,
        "nombre_secretaria": "Secretaría General",
        "total_documentos": 150
      }
    ]
  }
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

## Control de Acceso y Permisos por Documento

### Sistema de Alcance de Documentos

El sistema implementa un control de acceso granular que restringe la visibilidad de los documentos según el rol y la asignación organizacional del usuario.

#### Roles con Acceso Global
```typescript
const GLOBAL_DOCUMENT_ACCESS_ROLE_IDS = new Set([1, 2]); // ADMIN_TOTAL, EDITOR
```

- **ADMIN_TOTAL (1)**: Acceso completo a todos los documentos
- **EDITOR (2)**: Acceso completo a todos los documentos
- **SOLO_LECTURA (3)**: Acceso restringido a su secretaría/dependencia
- **VISITANTE (9)**: Acceso mínimo

#### Validación de Alcance

```typescript
// lib/document-access.ts
export async function getDocumentScopeForUser(idUsuarios: number, idRol: number) {
  if (hasGlobalDocumentAccess(idRol)) {
    return {
      restricted: false,
      allowedSecretariaId: null,
      allowedSecretariaName: null,
      allowedDependenciaId: null,
      allowedDependenciaName: null,
    };
  }
  
  // Para usuarios con acceso restringido
  const user = await getUserById(idUsuarios);
  const allowedSecretaria = secretarias.find(s => 
    matchesSecretariaName(s, user.nom_secre)
  );
  
  return {
    restricted: true,
    allowedSecretariaId: allowedSecretaria.id_secretaria,
    allowedSecretariaName: allowedSecretaria.nombre_secretaria,
    allowedDependenciaId: allowedDependencia?.id_dependencia,
    allowedDependenciaName: allowedDependencia?.nombre_dependencia,
  };
}
```

#### Funciones de Validación

```typescript
// Verificar acceso a secretaría
export function canAccessDocumentSecretaria(
  idRol: number,
  documentoSecretariaId: number,
  allowedSecretariaId: number | null
) {
  if (hasGlobalDocumentAccess(idRol)) return true;
  return Number(documentoSecretariaId) === Number(allowedSecretariaId);
}

// Verificar acceso a dependencia
export function canAccessDocumentDependencia(
  idRol: number,
  documentoDependenciaId: number,
  allowedDependenciaId: number | null
) {
  if (hasGlobalDocumentAccess(idRol)) return true;
  if (!allowedDependenciaId) return true; // Solo secretaría
  return Number(documentoDependenciaId) === Number(allowedDependenciaId);
}
```

### Implementación en API Routes

Las rutas API aplican automáticamente el control de acceso:

```typescript
// GET /api/documentos
export async function GET(request: NextRequest) {
  const scope = await getDocumentScopeForUser(payload.id, payload.idRol);
  
  if (scope.restricted) {
    // Aplicar filtros de secretaría/dependencia
    query += ` AND d.id_secre = $${paramIndex++}`;
    params.push(scope.allowedSecretariaId);
    
    if (scope.allowedDependenciaId) {
      query += ` AND d.id_depen = $${paramIndex++}`;
      params.push(scope.allowedDependenciaId);
    }
  }
}
```

### Componente PermissionGuard

Protección de componentes UI basada en permisos:

```typescript
<PermissionGuard permiso="CREAR_DOCUMENTOS">
  <Button>Crear Documento</Button>
</PermissionGuard>

<PermissionGuard permisos={["VER_DOCUMENTOS", "EDITAR_DOCUMENTOS"]} requireAll={false}>
  <DocumentActions />
</PermissionGuard>
```

### Manejo de Errores de Alcance

```typescript
export class DocumentScopeError extends Error {
  status: number;
  
  constructor(message: string, status = 403) {
    super(message);
    this.name = "DocumentScopeError";
    this.status = status;
  }
}
```

---

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
- Integración con OCR

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

### PermissionGuard.tsx
**Propósito**: Componente de protección por permisos

**Features**:
- Validación de permisos específicos
- Soporte para múltiples permisos
- Fallback personalizado
- Estados de carga

### SessionTimer.tsx
**Propósito**: Gestión de sesión de usuario

**Features**:
- Temporizador de inactividad
- Alerta de expiración
- Logout automático
- Persistencia de estado

### UsersTable.tsx
**Propósito**: Tabla de gestión de usuarios

**Features**:
- Paginación integrada
- Búsqueda y filtros
- Acciones masivas
- Estados de carga

### SecretariasTable.tsx
**Propósito**: Tabla de gestión de secretarías

**Features**:
- CRUD operations inline
- Validación de duplicados
- Toggle estatus
- Estadísticas integradas

### HeaderAll.tsx
**Propósito**: Navegación principal del sistema

**Features**:
- Menú contextual por rol
- Indicador de sesión activa
- Accesos rápidos
- Responsive design

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

### useCurrentUser.ts
```typescript
interface CurrentUser {
  id_usuarios: number;
  curp: string;
  id_rol: number;
  id_general: string;
  nombre_usuario: string | null;
  nom_secre: string | null;
  nombre_rol: string | null;
  permisos: string[];
}

interface UseCurrentUserReturn {
  user: CurrentUser | null;
  loading: boolean;
}
```

### usePrestamos.ts
```typescript
interface PrestamoDocumento {
  id_prestamo: number;
  id_doc: number;
  nombre_doc: string;
  nombre_solicitante: string;
  curp_solicitante: string;
  area_solicitante?: string;
  motivo_prestamo?: string;
  observaciones?: string;
  fecha_prestamo: string;
  fecha_limite_devolucion: string;
  fecha_devolucion?: string;
  estatus_prestamo: "Prestado" | "Vencido" | "Devuelto" | "Cancelado";
  // ... otros campos
}

interface UsePrestamosReturn {
  prestamos: PrestamoDocumento[];
  loading: boolean;
  error: string | null;
  fetchPrestamos: (filters?: PrestamosFilters) => Promise<void>;
  crearPrestamo: (prestamo: PrestamoData) => Promise<{success: boolean, error?: string}>;
  devolverPrestamo: (payload: DevolucionPayload) => Promise<{success: boolean, error?: string}>;
}
```

### usePermisos.tsx
```typescript
interface UsePermisosReturn {
  hasPermission: (permiso: string) => boolean;
  hasAnyPermission: (permisos: string[]) => boolean;
  hasAllPermissions: (permisos: string[]) => boolean;
  loading: boolean;
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

### useLogin.ts
```typescript
interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<{success: boolean, error?: string}>;
  loading: boolean;
  error: string | null;
}
```

### usePagination.ts
```typescript
interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setTotalItems: (total: number) => void;
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

## Nuevas Funcionalidades (v0.1.0)

### Sistema de Préstamos de Documentos

- **Gestión completa**: Crear, consultar y devolver préstamos
- **Control de estatus**: Prestado, Vencido, Devuelto, Cancelado
- **Validación de acceso**: Solo usuarios autorizados pueden gestionar préstamos
- **Integración documental**: Vinculación directa con documentos del sistema
- **Reportes**: Generación de vales y seguimiento de historial

### Panel de Estadísticas

- **Métricas en tiempo real**: Conteo de secretarías, dependencias, documentos
- **Préstamos activos**: Seguimiento de documentos prestados
- **Análisis por secretaría**: Distribución de documentos por área
- **Dashboard administrativo**: Vista general del estado del sistema

### Mejoras en la Experiencia de Usuario

- **Temporizador de sesión**: Gestión automática de inactividad
- **Caching inteligente**: Mejora de rendimiento con caché por hooks
- **Estados de carga**: Indicadores visuales durante operaciones
- **Manejo de errores**: Mensajes descriptivos y recuperación de errores

### Control de Acceso Granular

- **Alcance por documento**: Restricción basada en secretaría/dependencia
- **Validación automática**: Filtros aplicados en API routes
- **Componentes protegidos**: PermissionGuard para UI condicional
- **Normalización de catálogos**: Matching flexible de nombres

### Optimizaciones Técnicas

- **TypeScript estricto**: Mejor tipado y seguridad
- **Componentes modulares**: Arquitectura reutilizable
- **Hooks personalizados**: Lógica compartida y cacheo
- **Middleware mejorado**: Validación de rutas y permisos

---

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

**Última actualización**: Abril 2026
**Versión**: 0.1.0
**Estado**: Activo en producción
