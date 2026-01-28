# Sistema de Archivo Digital - Municipio de San Juan del Río

## Descripción

Sistema integral de gestión documental desarrollado para el Municipio de San Juan del Río, diseñado para digitalizar y modernizar la administración de archivos municipales. Esta plataforma permite abandonar los procesos basados en papel y migrar hacia una solución completamente digital, optimizando la gestión, búsqueda y almacenamiento de documentos oficiales.

## Ventajas

- **Reducción de costos**: Elimina gastos en papel, impresión, almacenamiento físico y mantenimiento de archivos
- **Acceso instantáneo**: Búsqueda y recuperación de documentos en segundos desde cualquier ubicación
- **Espacio optimizado**: Liberación de espacios físicos destinados al archivo tradicional
- **Trazabilidad completa**: Registro de todas las acciones realizadas sobre los documentos
- **Seguridad mejorada**: Respaldos automáticos y protección contra pérdida o deterioro de documentos
- **Colaboración eficiente**: Múltiples usuarios pueden acceder simultáneamente a la información
- **Sostenibilidad ambiental**: Contribución a la reducción del consumo de papel y huella ecológica

## Características Principales

### 🏠 Dashboard Principal
- **Panel de estadísticas en tiempo real**: Visualización de documentos, secretarías, dependencias y dependencias activas
- **Diseño responsive**: Interfaz moderna con tarjetas interactivas y animaciones fluidas
- **Navegación intuitiva**: Menú contextual según el rol del usuario

### 📄 Gestión Documental Avanzada
- **Carga de documentos**: Soporte para PDF, Word (.docx) y archivos de imagen
- **OCR integrado**: Extracción automática de texto mediante Tesseract.js para búsqueda inteligente
- **Búsqueda por contenido**: Encuentra documentos por texto extraído, no solo por nombre
- **Metadatos completos**: Gestión de oficio, expediente, serie, subserie, confidencialidad
- **Versionado de documentos**: Control de versiones con numeración automática
- **Vista previa de imágenes**: Previsualización instantánea para archivos gráficos
- **Descarga directa**: Acceso rápido a los archivos originales

### 🔍 Sistema de Búsqueda Inteligente
- **Búsqueda full-text**: Busca dentro del contenido de documentos usando OCR
- **Filtros avanzados**: Por secretaría, tipo de documento, año y estatus
- **Búsqueda combinada**: Texto libre + filtros específicos simultáneamente
- **Resultados paginados**: Navegación eficiente con 6 documentos por página

### 🏢 Gestión Organizacional
- **Secretarías**: Administración de secretarías municipales
- **Dependencias**: Gestión de dependencias con estatus activo/inactivo
- **Jerarquía organizacional**: Relación secretarías-dependencias
- **Vista detallada**: Modal con información completa de dependencias por secretaría

### 👥 Gestión de Usuarios y Roles
- **Sistema de roles granular**: Tres niveles principales con permisos diferenciados
- **Control de acceso basado en permisos**: 11 permisos específicos asignables
- **Administración de usuarios**: Gestión completa de usuarios y roles
- **Rol de visitante**: Acceso limitado para consultas públicas

### 🔐 Seguridad y Autenticación
- **JWT tokens**: Autenticación segura con expiración automática
- **Middleware de protección**: Verificación de token en cada solicitud
- **Sesiones seguras**: Cookies HTTP-only con tokens cifrados
- **Redirección automática**: Manejo inteligente de accesos no autorizados
- **Auditoría**: Registro de actividades del sistema

### 📊 Estadísticas y Reportes
- **Contadores en tiempo real**: Documentos, secretarías, dependencias activas
- **Indicadores visuales**: Tarjetas coloridas con iconos representativos
- **Carga asíncrona**: Experiencia de usuario fluida con estados de carga

### 🎨 Interfaz de Usuario
- **Diseño moderno**: TailwindCSS con componentes personalizados
- **Responsive design**: Adaptación perfecta a móviles, tablets y desktop
- **Animaciones fluidas**: Transiciones suaves y microinteracciones
- **Modales interactivos**: Formularios elegantes con validación
- **Estados de carga**: Indicadores visuales durante operaciones asíncronas
- **Manejo de errores**: Estados de error con opciones de recuperación

## Roles y Permisos

### 🏛️ Administrador (ADMIN_TOTAL)
- Acceso completo a todas las funcionalidades
- Gestión de usuarios y roles
- Creación, edición y eliminación de documentos
- Administración de secretarías y dependencias
- Configuración del sistema

### 👤 Usuario (EDITOR)
- Visualización de documentos asignados
- Creación y edición de documentos
- Búsqueda y filtrado avanzado
- Descarga de archivos
- Sin acceso a administración

### 👁️ Visor (SOLO_LECTURA)
- Solo visualización de documentos
- Búsqueda básica
- Descarga de archivos públicos
- Sin permisos de modificación

### 🌐 Visitante (ROL 9)
- Acceso restringido a sección especial
- Funcionalidades limitadas
- Redirección automática a /visitante

## Tecnologías Utilizadas

| Tecnología | Descripción | Icono |
|------------|-------------|-------|
| **Next.js 16** | Framework de React para aplicaciones web de última generación | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) |
| **React 19** | Biblioteca para construir interfaces de usuario interactivas | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) |
| **TypeScript** | Superset de JavaScript que añade tipado estático | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| **PostgreSQL** | Sistema de base de datos relacional robusto y escalable | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) |
| **TailwindCSS** | Framework CSS para diseño rápido y personalizable | ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) |
| **Tesseract.js** | OCR para extracción de texto de imágenes y PDFs | ![Tesseract.js](https://img.shields.io/badge/Tesseract.js-000000?style=for-the-badge&logo=tesseract&logoColor=white) |
| **PDF.js** | Librería para procesamiento y extracción de texto de PDFs | ![PDF.js](https://img.shields.io/badge/PDF.js-FF0000?style=for-the-badge&logo=adobe&logoColor=white) |
| **Mammoth** | Extracción de texto de documentos Word (.docx) | ![Mammoth](https://img.shields.io/badge/Mammoth-2B579A?style=for-the-badge&logo=microsoftword&logoColor=white) |
| **Node.js** | Entorno de ejecución de JavaScript | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) |
| **JWT** | Tokens web JSON para autenticación | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) |
| **Git** | Control de versiones del código fuente | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) |

## Arquitectura del Sistema

### 📁 Estructura de Proyecto
```
archivo-digital/
├── app/                    # Páginas y rutas de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/               # Endpoints de la API
│   │   ├── documentos/   # Gestión de documentos
│   │   ├── ocr/           # Procesamiento OCR
│   │   ├── secretarias/   # Gestión de secretarías
│   │   ├── usuarios/      # Gestión de usuarios
│   │   └── auth/          # Autenticación
│   ├── documentos/        # Gestión documental
│   ├── secretarias/       # Administración de secretarías
│   ├── visitante/         # Portal de visitantes
│   └── login/             # Página de inicio de sesión
├── components/            # Componentes React reutilizables
├── hooks/                 # Hooks personalizados de React
├── lib/                   # Utilidades y configuración
└── public/                # Archivos estáticos
```

### 🔌 API Endpoints
- **POST /api/login**: Autenticación de usuarios
- **POST /api/logout**: Cierre de sesión
- **GET /api/user**: Información del usuario actual
- **GET /api/documentos**: Listado de documentos con filtros
- **POST /api/documentos**: Creación de nuevos documentos
- **PUT /api/documentos/:id**: Actualización de documentos
- **DELETE /api/documentos/:id**: Eliminación de documentos
- **POST /api/ocr**: Procesamiento OCR de archivos
- **GET /api/secretarias**: Listado de secretarías
- **GET /api/dependencias**: Listado de dependencias
- **GET /api/statistics**: Estadísticas del sistema

### 🗄️ Base de Datos
- **usuarios**: Información de usuarios y autenticación
- **roles**: Definición de roles del sistema
- **rol_permisos**: Asignación de permisos a roles
- **secretarias**: Secretarías municipales
- **dependencias**: Dependencias organizacionales
- **documentos**: Metadatos de documentos
- **tipo_documento**: Tipos de documentos disponibles

## Instalación

### Prerrequisitos

- Node.js (versión 18 o superior)
- PostgreSQL (versión 14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd archivo-digital
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/archivo_digital"
NEXTAUTH_SECRET="tu-secreto-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar la base de datos**

Crear la base de datos en PostgreSQL:

```bash
createdb archivo_digital
```

Ejecutar las migraciones (si aplica):

```bash
npm run migrate
# o seguir las instrucciones específicas de tu ORM
```

5. **Ejecutar el proyecto en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

6. **Acceder a la aplicación**

Abrir el navegador en: `http://localhost:3000`

### Compilación para Producción

```bash
npm run build
npm start
```

## Uso

### 🔑 Inicio de Sesión
1. Acceder al sistema con las credenciales proporcionadas
2. El sistema redirigirá automáticamente según el rol asignado

### 📋 Navegación por Secciones
- **Dashboard**: Vista principal con estadísticas y acceso rápido
- **Documentos**: Gestión completa de archivos con búsqueda avanzada
- **Secretarías**: Administración de secretarías municipales
- **Administración**: Gestión de usuarios y roles (solo administradores)

### 📄 Gestión de Documentos
1. **Crear documento**: Click en "Nuevo documento" y completar formulario
2. **Subir archivo**: Seleccionar archivo PDF, Word o imagen
3. **OCR automático**: El sistema extrae texto automáticamente
4. **Buscar documentos**: Usar barra de búsqueda y filtros avanzados
5. **Ver/Editar**: Click en los botones de acción de cada documento

### 🔍 Búsqueda Inteligente
- Busca por nombre del documento
- Busca dentro del contenido (OCR)
- Filtra por secretaría, tipo, año o estatus
- Combinación de múltiples criterios

## Características Técnicas Destacadas

### 🧠 OCR y Procesamiento de Documentos
- **Tesseract.js**: OCR para imágenes con soporte de español
- **PDF.js**: Extracción de texto de PDFs nativos
- **Mammoth**: Procesamiento de documentos Word (.docx)
- **Timeout control**: 60 segundos máximo por procesamiento
- **Límite de tamaño**: Máximo 25MB por archivo

### 🔐 Seguridad Implementada
- **JWT middleware**: Verificación automática de tokens
- **Role-based access control**: Control granular de permisos
- **Route protection**: Middleware para rutas protegidas
- **Token expiration**: Manejo automático de sesiones expiradas
- **Secure cookies**: Cookies HTTP-only para tokens

### 🎨 Experiencia de Usuario
- **Loading states**: Indicadores durante operaciones asíncronas
- **Error boundaries**: Manejo elegante de errores
- **Responsive design**: Adaptación a todos los dispositivos
- **Smooth animations**: Transiciones fluidas con CSS y React
- **Modal interactions**: Diálogos modales para formularios

### 📊 Optimizaciones
- **Pagination**: Control eficiente de grandes volúmenes de datos
- **Debounced search**: Búsqueda optimizada para mejor rendimiento
- **Lazy loading**: Carga progresiva de componentes
- **Caching strategy**: Almacenamiento en caché de datos frecuentes

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contactar al equipo de desarrollo del municipio.

---

**Desarrollado para el Municipio de San Juan del Río**