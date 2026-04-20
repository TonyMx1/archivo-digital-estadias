# Changelog - Sistema de Archivo Digital

Todos los cambios notables a este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Migración a Next.js 17
- Implementación de WebSockets para tiempo real
- Sistema de notificaciones push
- Integración con almacenamiento en la nube (AWS S3)
- Firma digital integrada
- App móvil (React Native)
- Analytics avanzados y reportes

### Next Release (0.3.0) - Q3 2026

#### Features
- **Notificaciones en tiempo real**
  - WebSocket integration
  - Push notifications mobile/web
  - Dashboard de notificaciones
  - Email notifications configurables

- **Sistema de aprobación workflow**
  - Múltiples niveles de aprobación
  - Comentarios y anotaciones
  - Historial de cambios completo
  - Estados personalizados por organización

- **Firma digital**
  - Integración con firma electrónica
  - Validación de certificados digitales
  - Sello digital oficial
  - Compatibilidad con SAT

#### Technical
- **Performance mejorada**
  - Redis caching avanzado
  - Database optimization
  - CDN para archivos estáticos
  - Lazy loading optimizado

- **Escalabilidad**
  - Horizontal scaling support
  - Load balancing configuration
  - Database connection pooling
  - Microservices architecture preparation

---

## [0.2.0] - 2026-04-20

### Added
- **Sistema completo de préstamos de documentos**
  - Gestión completa de préstamos (crear, consultar, devolver)
  - Ciclo de vida completo: Solicitado → Prestado → Vencido → Devuelto → Cancelado
  - Formulario completo con CURP, área, motivo, observaciones
  - Control de fechas límite y vencimientos automáticos
  - Generación de vales y seguimiento de historial
  - Filtros por documento, secretaría y estatus

- **Control de acceso granular por documento**
  - Sistema de alcance basado en secretaría/dependencia del usuario
  - Roles con acceso global: ADMIN_TOTAL, EDITOR
  - Roles con acceso restringido: SOLO_LECTURA, VISITANTE
  - Validación automática en API routes
  - Componente PermissionGuard para protección de UI
  - Normalización de catálogos para matching flexible

- **Temporizador de sesión y manejo de inactividad**
  - Detección automática de inactividad del usuario
  - Alerta visual 5 minutos antes de cerrar sesión
  - Cierre automático por seguridad
  - Indicador de tiempo restante en dashboard
  - Persistencia de estado y recuperación

- **Panel de estadísticas mejorado**
  - Métricas en tiempo real del sistema
  - Conteo de préstamos activos
  - Distribución de documentos por secretaría
  - Dashboard administrativo con indicadores clave
  - Endpoint `/api/statistics` con datos consolidados

- **Nuevos componentes UI**
  - `PermissionGuard`: Protección por permisos
  - `SessionTimer`: Gestión de sesión con alertas
  - `UsersTable`: Gestión completa de usuarios
  - `SecretariasTable`: CRUD inline de secretarías
  - `HeaderAll`: Navegación contextual por rol
  - Estados de carga y manejo de errores mejorados

- **Hooks personalizados mejorados**
  - `useCurrentUser`: Gestión de usuario actual con caché
  - `usePrestamos`: Gestión completa de préstamos con caché
  - `usePermisos`: Validación de permisos granular
  - `useLogin`: Manejo optimizado de autenticación
  - Caching inteligente en todos los hooks principales

- **Endpoints API expandidos**
  - `GET/POST/PUT /api/prestamos`: Gestión de préstamos
  - `GET /api/statistics`: Estadísticas del sistema
  - `GET /api/user`: Información del usuario actual
  - `POST /api/upload`: Subida de archivos dedicada
  - `GET /api/tipo-documento`: Tipos de documento
  - `GET /api/cus`: Integración con API externa CUS

### Changed
- **Autenticación**: Migración de `/api/auth/*` a `/api/login`, `/api/logout`, `/api/user`
- **Base de datos**: Nueva tabla `prestamos_documentos` con relaciones completas
- **Permisos**: Refactorización a sistema granular por documento
- **UI**: Componentes actualizados con nuevo sistema de diseño
- **Performance**: Implementación de caché a nivel de hooks y API

### Technical Updates
- **Frontend**: Actualización a Next.js 16.1.1, React 19.2.3
- **Librerías nuevas**: Flowbite React 0.12.17, Skeleton Labs 4.12.1
- **OCR**: Actualización a Tesseract.js 7.0.0, PDF.js 5.4.296
- **Tipado**: TypeScript 5 con interfaces completas para todas las entidades
- **Build**: Optimización de bundle y code splitting mejorado

### Security Enhancements
- **Document Scope**: Validación de acceso por secretaría/dependencia
- **Session Management**: Timeout automático y alertas de seguridad
- **Input Validation**: Validación estricta en todos los endpoints
- **Error Handling**: Manejo específico para errores de permisos
- **Audit Trail**: Registro completo de operaciones de préstamos

---

## [0.1.0] - 2024-01-15

### Added
- **Sistema completo de gestión documental**
  - Dashboard principal con estadísticas en tiempo real
  - CRUD completo de documentos
  - Sistema de búsqueda avanzada con filtros
  - Gestión de secretarías y dependencias

- **Procesamiento OCR avanzado**
  - Soporte para PDF con PDF.js
  - Soporte para documentos Word con Mammoth
  - OCR de imágenes con Tesseract.js
  - Extracción automática de texto para búsqueda inteligente
  - Timeout de 60 segundos para procesamiento
  - Límite de 25MB por archivo

- **Sistema de autenticación y seguridad**
  - JWT tokens con expiración automática
  - Middleware de protección de rutas
  - Sistema de roles granular (4 niveles)
  - 11 permisos específicos configurables
  - Cookies HTTP-only para tokens
  - Auditoría de actividades

- **Interfaz de usuario moderna**
  - Diseño responsive con TailwindCSS
  - Componentes con Radix UI
  - Animaciones fluidas y microinteracciones
  - Estados de carga y manejo de errores
  - Modales interactivos para formularios

- **Base de datos PostgreSQL**
  - Esquema completo con 7 tablas principales
  - Relaciones entre entidades
  - Sistema de versionado de documentos
  - Tracking de actividad del sistema

- **API RESTful completa**
  - 15+ endpoints documentados
  - Manejo estándar de errores
  - Validación de inputs
  - Rate limiting implementado

### Features

#### Gestión Documental
- **Carga de archivos**: PDF, DOCX, PNG, JPG, JPEG
- **Metadatos completos**: oficio, expediente, serie, subserie, confidencialidad
- **Versionado**: Control automático de versiones
- **Búsqueda full-text**: Dentro del contenido de documentos
- **Filtros avanzados**: Por secretaría, tipo, año, estatus
- **Paginación**: 6 documentos por página

#### Organización
- **Secretarías**: Administración completa
- **Dependencias**: Gestión por secretaría con estatus activo/inactivo
- **Jerarquía**: Relación secretarías-dependencias
- **Vista detallada**: Modal con información completa

#### Usuarios y Roles
- **Administrador (ADMIN_TOTAL)**: Acceso completo
- **Editor (EDITOR)**: Creación y edición
- **Visor (SOLO_LECTURA)**: Solo visualización
- **Visitante (ROL 9)**: Acceso restringido

#### Seguridad
- **Autenticación JWT**: Tokens seguros con expiración
- **Middleware**: Verificación automática en cada request
- **Permisos granulares**: 11 permisos específicos
- **Auditoría**: Registro completo de actividades

### Technical Implementation

#### Frontend Stack
- **Next.js 16**: Framework React de última generación
- **React 19**: Última versión con hooks mejorados
- **TypeScript**: Tipado estático completo
- **TailwindCSS**: Framework CSS utility-first
- **Radix UI**: Componentes accesibles

#### Backend Stack
- **Next.js API Routes**: Backend serverless
- **PostgreSQL**: Base de datos relacional
- **JWT (jose)**: Autenticación segura
- **Tesseract.js**: OCR para imágenes
- **PDF.js**: Procesamiento de PDF
- **Mammoth**: Procesamiento de Word

#### Development Tools
- **ESLint**: Calidad de código
- **Prettier**: Formato consistente
- **TypeScript**: Tipado estricto
- **Git**: Control de versiones

### Database Schema

#### Tablas Principales
- `usuarios`: Información de usuarios y autenticación
- `roles`: Definición de roles del sistema
- `rol_permisos`: Asignación de permisos a roles
- `secretarias`: Secretarías municipales
- `dependencias`: Dependencias organizacionales
- `documentos`: Metadatos de documentos
- `tipo_documento`: Tipos de documentos disponibles

#### Relaciones
- Usuarios → Roles (1:N)
- Roles → Permisos (N:M)
- Secretarías → Dependencias (1:N)
- Documentos → Secretarías/Dependencias (N:1)

### API Endpoints

#### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/me` - Información del usuario

#### Documentos
- `GET /api/documentos` - Listado con filtros
- `POST /api/documentos` - Crear documento
- `PUT /api/documentos/[id]` - Actualizar documento
- `DELETE /api/documentos/[id]` - Eliminar documento
- `GET /api/documentos/[id]` - Detalles del documento

#### OCR
- `POST /api/ocr` - Procesamiento OCR

#### Organización
- `GET /api/secretarias` - Listado de secretarías
- `POST /api/secretarias` - Crear secretaría
- `GET /api/dependencias` - Listado de dependencias
- `POST /api/dependencias` - Crear dependencia

#### Usuarios
- `GET /api/usuarios` - Listado de usuarios
- `POST /api/usuarios` - Crear usuario

#### Estadísticas
- `GET /api/statistics` - Estadísticas del sistema
- `GET /api/activity` - Registro de actividades

### Performance Optimizations

- **Pagination**: Control eficiente de grandes volúmenes
- **Debounced search**: Búsqueda optimizada
- **Lazy loading**: Carga progresiva de componentes
- **Caching**: Almacenamiento de datos frecuentes
- **Code splitting**: División automática de código

### Security Features

- **Input validation**: Validación estricta de datos
- **SQL injection protection**: Queries parameterizadas
- **XSS protection**: Sanitización de inputs
- **CSRF protection**: Tokens CSRF en formularios
- **Rate limiting**: Límites de uso por endpoint

### UI/UX Features

- **Responsive design**: Adaptación a todos los dispositivos
- **Loading states**: Indicadores durante operaciones
- **Error boundaries**: Manejo elegante de errores
- **Smooth animations**: Transiciones fluidas
- **Accessibility**: Componentes accesibles
- **Dark mode**: Soporte para tema oscuro (planeado)

### File Handling

- **Upload progress**: Indicadores de progreso
- **File validation**: Validación de tipo y tamaño
- **Preview system**: Vista previa de imágenes
- **Download system**: Descarga segura de archivos
- **Storage management**: Gestión eficiente de archivos

### Configuration

#### Environment Variables
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` - Clave secreta para tokens
- `CUS_API_URL` - API externa de autenticación

#### Development Scripts
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm start` - Servidor de producción
- `npm run lint` - Análisis de código

### Documentation

- **README.md**: Documentación principal del proyecto
- **DOCUMENTACION_TECNICA.md**: Guía técnica completa
- **GUIA_DESARROLLADOR.md**: Guía para nuevos desarrolladores
- **API_REFERENCE.md**: Referencia completa de la API
- **CHANGELOG.md**: Registro de cambios (este archivo)

### Testing Strategy

- **Unit Tests**: Para funciones puras y hooks
- **Integration Tests**: Para API endpoints
- **E2E Tests**: Para flujos críticos (planeado)
- **Manual Testing**: Proceso de QA completo

### Deployment

#### Development
- Entorno local con Docker Compose
- Base de datos PostgreSQL local
- Hot reload en desarrollo

#### Production
- Servidor dedicado con PM2
- PostgreSQL en producción
- Nginx como reverse proxy
- SSL/TLS configurado

### Known Issues

- **OCR timeout**: Documentos muy grandes pueden exceder timeout de 60s
- **Memory usage**: Procesamiento OCR intensivo en memoria
- **File size limit**: 25MB puede ser insuficiente para algunos casos

### Future Roadmap

#### Version 0.2.0 (Q2 2024)
- [ ] Sistema de notificaciones
- [ ] Workflow de aprobación de documentos
- [ ] Firma digital integrada
- [ ] Backup automático de documentos

#### Version 0.3.0 (Q3 2024)
- [ ] Móvil app (React Native)
- [ ] Integración con otros sistemas municipales
- [ ] Analytics avanzados
- [ ] Multi-tenant support

#### Version 1.0.0 (Q4 2024)
- [ ] Estabilidad completa
- [ ] Documentación extendida
- [ ] SLA y soporte 24/7
- [ ] Certificación de seguridad

---

## [0.0.1] - 2023-12-01

### Added
- **Initial project setup**
  - Next.js 16 configuration
  - TypeScript setup
  - TailwindCSS integration
  - Basic project structure

- **Database schema design**
  - PostgreSQL integration
  - Initial table definitions
  - Relationship modeling

- **Authentication foundation**
  - JWT implementation
  - Basic middleware
  - Role system design

---

## Cambios Futuros Planeados

### Próximo Release (0.2.0)

#### Nuevas Funcionalidades
- **Sistema de Notificaciones**
  - Notificaciones push en tiempo real
  - Email notifications para eventos importantes
  - Dashboard de notificaciones

- **Workflow de Aprobación**
  - Múltiples niveles de aprobación
  - Comentarios y anotaciones
  - Historial de cambios

- **Firma Digital**
  - Integración con firma electrónica
  - Validación de firmas
  - Sello digital

#### Mejoras Técnicas
- **Performance**
  - Caching avanzado con Redis
  - Optimización de consultas SQL
  - CDN para archivos estáticos

- **Escalabilidad**
  - Horizontal scaling准备
  - Load balancing
  - Database sharding

### Roadmap 2024

#### Q1 2024
- [x] Sistema básico completo
- [x] OCR y búsqueda inteligente
- [x] Roles y permisos granular
- [ ] Testing suite completo
- [ ] Documentación extendida

#### Q2 2024
- [ ] Notificaciones y alertas
- [ ] Workflow de aprobación
- [ ] Firma digital
- [ ] API pública para terceros

#### Q3 2024
- [ ] App móvil
- [ ] Integración sistemas municipales
- [ ] Analytics y reportes avanzados
- [ ] Multi-tenant architecture

#### Q4 2024
- [ ] Versión 1.0 estable
- [ ] Certificación de seguridad
- [ ] SLA y soporte enterprise
- [ ] Expansión a otros municipios

---

## Política de Versionado

Este proyecto sigue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios breaking incompatibles
- **MINOR**: Nuevas funcionalidades compatibles
- **PATCH**: Correcciones de bugs compatibles

### Tipos de Cambios

#### 🚀 Breaking Changes
- Cambios en API endpoints
- Modificaciones en esquema de base de datos
- Cambios en configuración requerida

#### ✨ New Features
- Nuevos endpoints
- Nuevas funcionalidades de UI
- Nuevos tipos de documentos soportados

#### 🐛 Bug Fixes
- Corrección de errores en lógica
- Fixes de seguridad
- Mejoras de performance

#### 📝 Documentation
- Actualización de README
- Nuevas guías
- Mejoras en documentación de API

#### 🎨 UI/UX
- Mejoras visuales
- Nuevos componentes
- Mejoras de accesibilidad

---

## Contribución al Changelog

Los desarrolladores deben:

1. **Documentar cambios**: Agregar entrada al changelog
2. **Seguir formato**: Usar categorías estándar
3. **Ser descriptivo**: Explicar qué cambió y por qué
4. **Incluir breaking changes**: Destacar cambios incompatibles

### Plantilla para Entradas

```markdown
### Added
- **Descripción de nueva funcionalidad**
  - Detalles técnicos importantes
  - Impacto en usuarios

### Changed
- **Descripción de cambio existente**
  - Razón del cambio
  - Migration guide si aplica

### Fixed
- **Descripción de bug corregido**
  - Causa del problema
  - Solución implementada

### Deprecated
- **Funcionalidad deprecada**
  - Alternativa recomendada
  - Fecha de remoción planeada

### Security
- **Mejora de seguridad**
  - Vulnerabilidad abordada
  - Impacto del cambio
```

---

## Contacto

Para preguntas sobre cambios o roadmap:

- **Product Manager**: [Contacto]
- **Tech Lead**: [Contacto]
- **Development Team**: [Slack/Teams]

---

**Notas:**
- Este changelog se actualiza continuamente
- Las fechas son estimadas y pueden cambiar
- Para cambios urgentes, revisar las release notes en GitHub

---

**Última actualización**: Abril 2026
**Versión actual**: 0.2.0
**Próxima versión planeada**: 0.3.0 (Q3 2026)
