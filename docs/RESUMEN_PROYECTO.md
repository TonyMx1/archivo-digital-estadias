# Resumen del Proyecto - Archivo Digital Municipal

## Estado Actual del Proyecto

**Versión:** 0.1.0  
**Fecha:** 30 de marzo de 2026  
**Stack Tecnológico:** Next.js 16 + React 19 + TypeScript + PostgreSQL

## ¿Qué Hace Actualmente el Proyecto?

### Visión General del Sistema

El Archivo Digital Municipal es una solución integral que transforma la gestión documental tradicional en un proceso digital eficiente y seguro. El sistema automatiza tareas manuales, proporciona acceso controlado a la información y mantiene un registro completo de todas las actividades, garantizando la integridad y confidencialidad de los documentos municipales.

### Flujo de Operación del Sistema

#### 1. **Autenticación y Acceso**
- **Inicio de Sesión**: Los usuarios ingresan con credenciales del sistema CUS
- **Validación Central**: El sistema verifica credenciales contra el servidor CUS
- **Alta Automática**: Si el usuario no existe localmente, se crea automáticamente con rol visitante
- **Asignación de Rol**: Los administradores pueden asignar roles específicos según el puesto
- **Redirección Inteligente**: Según el rol, se redirige al dashboard principal o a vista de visitante

#### 2. **Gestión Documental Diaria**
- **Ingreso de Documentos**: Los usuarios autorizados cargan documentos con metadatos archivísticos completos
- **Procesamiento Automático OCR**: El sistema extrae texto automáticamente de PDF, DOCX e imágenes
- **Indexación de Contenido**: El texto extraído se indexa para búsquedas全文
- **Control de Acceso por Secretaría/Dependencia**: Los usuarios están dados de alta por secretaría y dependencia, y basado en eso solo pueden visualizar los documentos a los que estén asignados. Roles globales (1, 2) tienen acceso completo a todas las secretarías y dependencias.
- **Búsqueda y Filtros**: Consulta avanzada por texto contenido, metadatos, fechas y estatus

#### 3. **Control de Préstamos**
- **Solicitud de Préstamo**: Registro con CURP del solicitante y fecha de devolución
- **Vales Digitales**: Opcionalmente se adjunta comprobante digital del préstamo
- **Seguimiento de Estatus**: Control automático de préstamos vencidos y devueltos
- **Notificaciones**: El sistema alerta sobre préstamos próximos a vencer
- **Historial**: Registro completo de préstamos y devoluciones por documento

#### 4. **Administración del Sistema**
- **Gestión de Usuarios**: Los administradores pueden crear, modificar y eliminar usuarios
- **Consulta CURP**: Integración con CUS para obtener datos de nuevos usuarios
- **Configuración de Roles**: Definición de roles y asignación de permisos específicos
- **Mantenimiento de Catálogos**: Actualización de secretarías y dependencias
- **Monitoreo de Sesiones**: Control de usuarios activos y sesiones abiertas

#### 5. **Experiencia del Usuario**
- **Dashboard Principal**: Vista con estadísticas en tiempo real y accesos rápidos
- **Navegación Fluida**: Header y footer persistentes sin recargas innecesarias
- **Advertencias de Sesión**: Aviso 2 minutos antes del cierre por inactividad
- **Extensión Automática**: La sesión se extiende con la actividad del usuario
- **Responsive**: Funcionalidad completa en dispositivos móviles y desktop

### Procesos Automatizados

#### **Procesamiento de Documentos**
1. El usuario carga un archivo (PDF, DOCX o imagen)
2. El sistema valida tamaño y formato
3. Se inicia procesamiento OCR según tipo:
   - PDF: Extracción de texto nativo
   - DOCX: Conversión con Mammoth
   - Imágenes: OCR con Tesseract.js
4. El texto extraído se almacena en base de datos
5. El documento queda disponible para búsqueda

#### **Control de Sesiones**
1. El usuario inicia actividad (mouse, teclado, scroll)
2. El sistema monitorea tiempo de inactividad
3. A los 28 minutos muestra advertencia modal
4. El usuario puede extender sesión o cerrar
5. Sin actividad, la sesión cierra automáticamente a los 30 minutos

#### **Validación de Acceso**
1. Cada petición API valida token JWT
2. El sistema verifica rol y permisos
3. Para datos documentales, filtra por secretaría/dependencia
4. Roles globales (1, 2) tienen acceso completo
5. Visitantes (9) solo acceden a vista restringida

### Casos de Uso Actuales

#### **Para Visitantes (Rol 9)**
- Acceso limitado a consulta básica mientras espera autorización
- Vista restringida según políticas de seguridad
- Sin capacidad de modificación ni solicitud de préstamos
- Requiere asignación de rol superior para funcionalidad completa

#### **Para Visores (Rol de solo lectura)**
- Visualizar documentos de su secretaría y dependencia asignada
- Buscar por contenido o metadatos dentro de su ámbito
- No puede editar, subir documentos ni solicitar préstamos
- Acceso exclusivo de consulta

#### **Para Usuarios Regulares**
- Consultar documentos de su secretaría y dependencia asignada
- Subir documentos exclusivamente a su secretaría asignada
- Buscar por contenido o metadatos dentro de su ámbito
- Solicitar préstamos de documentos disponibles en su área
- Ver historial de sus préstamos personales

#### **Para Superusuarios**
- Ver todas las secretarías y dependencias sin restricción
- Agregar documentos a cualquier secretaría del sistema
- Gestionar préstamos y devoluciones en todo el sistema
- Agregar nuevos usuarios al sistema
- Acceso completo a todos los módulos excepto eliminación

#### **Para Administradores**
- Control total del sistema incluyendo eliminación de usuarios
- Cambiar roles y permisos de cualquier usuario
- Configurar todos los aspectos del sistema
- Monitorear actividad y sesiones
- Acceso ilimitado a todas las funcionalidades

## Descripción General

Sistema web completo para gestión documental del Municipio de San Juan del Río, integrado con el sistema CUS para autenticación y gestión de usuarios. Incluye control de acceso granular, procesamiento OCR, y gestión de préstamos de documentos.

## Módulos Implementados

### 🔐 Autenticación y Seguridad
- **Login con CUS**: Validación contra sistema central y alta automática de usuarios
- **Control de Sesión**: JWT con expiración de 30 minutos + timeout por inactividad
- **Sesión Activa**: Una sesión por usuario en base de datos con monitoreo de actividad
- **Advertencia de Sesión**: Notificación 2 minutos antes del cierre por inactividad
- **Roles y Permisos**: Sistema granular con 4 roles y 11 permisos configurables

### 📁 Gestión Documental
- **CRUD Completo**: Alta, edición, consulta y baja lógica de documentos
- **Metadatos Archivísticos**: Oficio, expediente, serie, subserie, confidencialidad, ubicación física
- **Filtros Avanzados**: Por secretaría, dependencia, tipo, fecha y estatus
- **Control de Acceso**: Alcance por secretaría/dependencia según rol del usuario
- **Visualización**: Descarga y vista previa de archivos

### 🔍 Procesamiento OCR y Búsqueda
- **OCR Multi-formato**:
  - PDF: `pdfjs-dist` (texto nativo)
  - DOCX: `mammoth` 
  - Imágenes: `tesseract.js`
- **Búsqueda Inteligente**: Índice de texto extraído para búsquedas全文
- **Límites**: 25MB por archivo, timeout de 60 segundos

### 📚 Gestión de Préstamos
- **Registro de Préstamos**: CURP, fecha límite, estatus
- **Vales Digitales**: Carga opcional de PDF/imágenes como comprobante
- **Estatus**: Prestado, Vencido, Devuelto, Cancelado
- **Control de Devoluciones**: Actualización automática de estatus

### 👥 Administración
- **Gestión de Usuarios**: Asignación de rol, secretaría, dependencia
- **Alta por CURP**: Consulta CUS y creación automática de usuarios
- **Roles y Permisos**: Configuración dinámica de permisos por rol
- **Catálogos**: Secretarías y dependencias con estado activo/inactivo

### 🎨 Interfaz de Usuario
- **Diseño Moderno**: TailwindCSS + Flowbite React
- **Layout Estático**: Header y Footer persistentes para mejor rendimiento
- **Responsive**: Adaptado para dispositivos móviles y desktop
- **Componentes Reutilizables**: Sistema de componentes modulares

## Características Técnicas Recientes

### Optimización de Rendimiento
- **Layout Estático**: Implementación de `app/(auth)/layout.tsx` para evitar re-renderizados
- **Componentes Persistentes**: HeaderAll y ExitoFooter no se recargan en navegación

### Sistema de Sesiones Mejorado
- **SessionTimer**: Componente que monitorea actividad del usuario
- **Advertencia Automática**: Modal con cuenta regresiva 2 minutos antes del cierre
- **Extensión de Sesión**: Reactiva a actividad del usuario (mouse, teclado, scroll)
- **Keep-alive**: Endpoint `/api/activity` para mantener sesión activa

## Arquitectura de Archivos

```
app/
├── (auth)/                    # Rutas protegidas con layout estático
│   ├── page.tsx              # Dashboard principal
│   ├── documentos/           # Módulo documental
│   ├── prestamo/             # Gestión de préstamos
│   ├── secretarias/          # Catálogo de secretarías
│   ├── admin/                # Administración de usuarios
│   └── permisos/             # Administración de roles/permisos
├── login/                    # Pantalla de acceso
├── visitante/                # Acceso restringido rol visitante
└── api/                      # Endpoints REST

components/
├── HeaderAll.tsx             # Header persistente
├── ExitoFooter.tsx           # Footer persistente
├── SessionTimer.tsx          # Control de sesión
└── [otros componentes]

lib/
├── db.ts                     # Acceso a PostgreSQL
├── auth.ts                   # Manejo de JWT
├── auth-server.ts            # Sesiones en BD
├── document-access.ts        # Control de alcance
└── permisos.ts               # Constantes de permisos
```

## API Principal

| Endpoint | Método | Funcionalidad |
|---|---|---|
| `/api/login` | POST | Autenticación CUS + sesión local |
| `/api/user/update-and-redirect` | POST | Sincronización de perfil |
| `/api/documentos` | CRUD | Gestión documental completa |
| `/api/documentos/[id]/archivo` | GET | Descarga de archivos |
| `/api/prestamos` | CRUD | Gestión de préstamos |
| `/api/admin/users` | CRUD | Administración de usuarios |
| `/api/admin/roles` | CRUD | Gestión de roles |
| `/api/ocr` | POST | Procesamiento OCR |
| `/api/activity` | POST | Keep-alive de sesión |

## Base de Datos

- **PostgreSQL** como motor principal
- **Tablas principales**: usuarios, roles, permisos, documentos, prestamos, sesiones
- **Control de acceso**: Alcance por `nom_secre` y `nom_dependencia`
- **Sesiones activas**: Una por usuario con timestamp de última actividad

## Seguridad Implementada

- **JWT Tokens**: Con expiración automática
- **Cookies HTTP-Only**: Para almacenamiento seguro de tokens
- **Middleware de Protección**: `proxy.ts` para validación de rutas
- **Control de Alcance**: Limitación de datos por rol del usuario
- **Auditoría**: Registro de actividades importantes

## Estado de Desarrollo

### ✅ Completado
- Sistema de autenticación completo
- Gestión documental con OCR
- Control de préstamos
- Administración de usuarios y permisos
- Interfaz de usuario moderna
- Optimización de rendimiento

### 🔄 En Mejora Continua
- Optimización de consultas a base de datos
- Mejoras en experiencia de usuario
- Actualizaciones de seguridad

### 📋 Planeado
- Migración a Next.js 17
- Sistema de notificaciones en tiempo real
- Integración con almacenamiento en la nube
- Módulo de reportes avanzados

## Configuración Actual

- **Node.js**: 20+
- **Next.js**: 16.1.1
- **React**: 19.2.3
- **TypeScript**: 5
- **PostgreSQL**: Conexión local configurable
- **Entorno**: Variables `.env.local` para base de datos y JWT

## Beneficios y Valor del Sistema

### 🎯 Beneficios Operativos
- **Reducción de Tiempos**: Búsqueda instantánea vs. búsqueda física que toma horas
- **Acceso Remoto**: Consulta de documentos desde cualquier lugar con conexión
- **Disponibilidad 24/7**: Acceso continuo sin restricciones de horario
- **Backup Automático**: Protección contra pérdida de información física
- **Auditoría Completa**: Registro de cada acceso y modificación

### 🔒 Beneficios de Seguridad
- **Control de Acceso**: Solo usuarios autorizados ven información sensible
- **Trazabilidad**: Registro completo de quién accedió a qué y cuándo
- **Integridad**: Los documentos no pueden ser alterados sin registro
- **Confidencialidad**: Protección por niveles y áreas de responsabilidad
- **Cumplimiento**: Adherencia a normativas de gestión documental

### 💰 Beneficios Económicos
- **Ahorro de Espacio**: Eliminación de archivos físicos y almacenamiento
- **Reducción de Costos**: Menos tiempo perdido en búsquedas manuales
- **Productividad**: Los empleados encuentran información rápidamente
- **Escalabilidad**: Crecimiento sin necesidad de más espacio físico
- **Sostenibilidad**: Reducción de consumo de papel y recursos

## Puntos Fuertes del Sistema

1. **Integración CUS**: Autenticación centralizada con alta automática
2. **Control de Acceso Granular**: Por secretaría/dependencia
3. **OCR Avanzado**: Multi-formato con búsqueda inteligente
4. **Sesiones Seguras**: Con timeout y advertencias
5. **Rendimiento Optimizado**: Layout estático y componentes persistentes
6. **Escalabilidad**: Arquitectura modular y API REST

## Próximos Pasos Recomendados

1. **Testing**: Implementación de pruebas unitarias y E2E
2. **Monitorización**: Sistema de logs y métricas
3. **Documentación**: Actualización continua de la documentación técnica
4. **Performance**: Optimización de consultas y caché
5. **Seguridad**: Auditoría de seguridad y pentesting

---

*Este documento refleja el estado actual del proyecto al 30 de marzo de 2026*
