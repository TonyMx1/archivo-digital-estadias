# Archivo Digital Municipal

Sistema web para gestion documental del Municipio de San Juan del Rio, con autenticacion contra CUS, control de acceso por permisos y administracion de documentos/prestamos.

- Version actual: `0.1.0`
- Stack principal: `Next.js 16 + React 19 + TypeScript + PostgreSQL`
- Ultima actualizacion de este README: `25 de marzo de 2026`

## Que hace el sistema

- Inicio de sesion con CUS y alta automatica de usuario local.
- Control de sesion (cookie JWT + tabla de sesiones + timeout por inactividad).
- Gestion de documentos con metadatos archivisticos.
- OCR para extraer texto de PDF, DOCX e imagenes.
- Gestion de prestamos de documentos (alta, consulta y devolucion).
- Catalogos de secretarias y dependencias.
- Modulo de administracion de usuarios, roles y permisos.
- Rol visitante (`id_rol = 9`) con redireccion obligatoria a `/visitante`.

## Tecnologias

- `next@16.1.1`
- `react@19.2.3`
- `typescript@5`
- `tailwindcss@4` + `flowbite-react`
- `pg` (PostgreSQL)
- `jose` (JWT)
- `pdfjs-dist`, `mammoth`, `tesseract.js` (OCR/extraccion)

## Arquitectura resumida

```text
app/
  login/                     # Pantalla de acceso
  visitante/                 # Pantalla restringida para rol visitante (9)
  (auth)/
    page.tsx                 # Dashboard principal
    documentos/              # Modulo documental
    prestamo/                # Modulo de prestamos
    secretarias/             # Consulta de secretarias/dependencias
    admin/                   # Administracion de usuarios
    permisos/                # Administracion de roles/permisos
  api/
    login/logout/user/...    # Auth y perfil
    documentos/...           # CRUD documental
    prestamos                # CRUD de prestamos (GET/POST/PUT)
    admin/users|roles|permisos
    secretarias|dependencias
    ocr|upload
lib/
  db.ts                      # Capa de acceso a PostgreSQL
  auth.ts                    # JWT
  auth-server.ts             # Sesiones en BD
  document-access.ts         # Alcance por secretaria/dependencia
  permisos.ts                # Constantes de permisos
hooks/
  useDocumentos, usePrestamos, usePermisos, useAdminUsers, etc.
```

## Control de acceso y alcance de datos

- Los permisos se gestionan en la tabla `rol_permisos` y constantes en [`lib/permisos.ts`](./lib/permisos.ts).
- Roles con acceso global a documentos/prestamos: `id_rol` `1` y `2`.
- Para otros roles, el backend limita acceso por:
  - `nom_secre` del usuario.
  - `nom_dependencia` (si existe) del usuario.
- El alcance se aplica en:
  - `GET/POST/PUT/DELETE /api/documentos`
  - `GET/POST/PUT /api/prestamos`
  - `GET /api/documentos/[id_doc]/archivo`

## Flujo de autenticacion

1. `POST /api/login` valida credenciales contra CUS.
2. Si el usuario no existe en BD local, se crea con rol visitante (`id_rol = 9`).
3. Se crea cookie `auth-token` (JWT, expira en 30 minutos).
4. Se crea/actualiza sesion en tabla `sesiones` (una sesion activa por usuario).
5. El frontend sincroniza nombre y redireccion con `POST /api/user/update-and-redirect`.
6. `proxy.ts` protege rutas y redirige visitantes a `/visitante`.

## Modulos funcionales

### Documentos

- Alta/edicion/baja logica de documentos.
- Filtros por secretaria, dependencia, tipo, fecha y estatus.
- Metadatos: oficio, expediente, serie, subserie, confidencialidad, caja, ubicacion, estante, etc.
- Descarga/visualizacion de archivo por `GET /api/documentos/[id_doc]/archivo`.
- OCR:
  - PDF: `pdfjs-dist` (texto nativo).
  - DOCX: `mammoth`.
  - Imagenes: `tesseract.js`.
  - Limite: `25 MB`.

### Prestamos

- Registro de prestamo con CURP y fecha limite.
- Carga opcional de vale (`pdf`/imagen).
- Estatus de prestamo: `Prestado`, `Vencido`, `Devuelto`, `Cancelado`.
- Devolucion por `PUT /api/prestamos`.

### Administracion

- Usuarios (`/admin`): asignacion de rol, secretaria, dependencia y eliminacion.
- Alta de usuario por CURP desde CUS (`POST /api/cus/curp` + `POST /api/admin/users`).
- Roles y permisos (`/permisos`): alta de roles y activacion/desactivacion de permisos.

## API principal

| Endpoint | Metodos | Uso |
|---|---|---|
| `/api/login` | `POST` | Login con CUS + sesion local |
| `/api/logout` | `POST` | Cierre de sesion |
| `/api/user` | `GET` | Usuario actual + permisos |
| `/api/user/permisos` | `GET` | Lista de permisos del rol actual |
| `/api/user/update-name` | `POST` | Actualiza nombre usando token CUS |
| `/api/user/update-and-redirect` | `POST` | Sincroniza perfil y retorna rol para redireccion |
| `/api/documentos` | `GET/POST/PUT/DELETE` | CRUD documental |
| `/api/documentos/[id_doc]/archivo` | `GET` | Proxy/stream de archivo del documento |
| `/api/prestamos` | `GET/POST/PUT` | Consulta, alta y devolucion de prestamos |
| `/api/secretarias` | `GET` | Catalogo de secretarias |
| `/api/dependencias` | `GET/POST/PUT` | Catalogo de dependencias |
| `/api/dependencias/[id]/estado` | `PATCH` | Activar/desactivar dependencia |
| `/api/admin/users` | `GET/POST/PUT/DELETE` | Administracion de usuarios |
| `/api/admin/roles` | `GET/POST` | Consulta/alta de roles |
| `/api/admin/permisos` | `GET/POST/DELETE` | Consulta/edicion de permisos por rol |
| `/api/ocr` | `POST` | Extraccion de texto |
| `/api/upload` | `POST` | Subida a servidor de archivos externo |
| `/api/cus/curp` | `POST` | Consulta de CURP en CUS (modulo admin) |
| `/api/statistics` | `GET` | Estadisticas del dashboard |
| `/api/activity` | `POST` | Keep-alive de actividad de sesion |

## Variables de entorno

Configura `.env.local` con al menos:

```env
# PostgreSQL (requeridas por lib/db.ts)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=archivo_digital
DB_USER=postgres
DB_PASSWORD=postgres

# Opcionales para pool/SSL
DB_SSL=false
DB_POOL_MAX=20
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT_MS=10000
DB_POOL_CONNECTION_TIMEOUT_MS=10000
DB_POOL_MAX_LIFETIME_SECONDS=300

# JWT
JWT_SECRET=coloca_un_secreto_seguro

# Integraciones CUS
CUS_API_URL=https://...
CUS_URL_CURP=https://...
CUS_API_KEY=...
INFO_API_URL=https://...
```

## Instalacion y ejecucion local

### Requisitos

- `Node.js 20+` recomendado.
- `npm` 10+.
- PostgreSQL accesible con las variables anteriores.

### Pasos

```bash
npm install
npm run dev
```

Servidor local:

- `http://localhost:3000`
- `http://<tu-ip-local>:3000` (el script `dev` escucha en `0.0.0.0`)

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notas operativas

- La tabla `sesiones` se crea automaticamente si no existe al crear una sesion.
- El endpoint `/api/upload` reenvia archivos al servicio externo:
  - `https://sanjuandelrio.sytes.net:3030/upload`
- `proxy.ts` protege practicamente toda la app excepto rutas publicas (`/login`, `/api/login`, `/api/logout` y assets estaticos).

## Documentacion adicional

- [INDEX.md](./docs/INDEX.md)
- [DOCUMENTACION_TECNICA.md](./docs/DOCUMENTACION_TECNICA.md)
- [API_REFERENCE.md](./docs/API_REFERENCE.md)
- [GUIA_DESARROLLADOR.md](./docs/GUIA_DESARROLLADOR.md)
- [DOCUMENTACION_USUARIO.md](./docs/DOCUMENTACION_USUARIO.md)
- [CHANGELOG.md](./docs/CHANGELOG.md)
