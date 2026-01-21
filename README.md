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

- **Gestión documental completa**: Carga, organización, búsqueda y descarga de archivos digitales
- **Sistema de roles y permisos**: Control granular de acceso según el tipo de usuario
- **Interfaz intuitiva**: Diseño moderno y fácil de usar para todos los niveles de experiencia
- **Búsqueda avanzada**: Filtros y búsqueda por múltiples criterios para localizar documentos rápidamente
- **Historial de actividades**: Registro detallado de modificaciones y accesos a documentos
- **Almacenamiento seguro**: Base de datos robusta con cifrado de información sensible
- **Responsive design**: Accesible desde computadoras, tablets y dispositivos móviles

## Seguridad

El sistema implementa múltiples capas de seguridad para proteger la información municipal:

### Autenticación y Autorización
- **Inicio de sesión obligatorio**: Acceso restringido únicamente a usuarios autorizados
- **Sistema de roles**: Tres niveles de acceso con permisos diferenciados:
  - **Administrador**: Control total del sistema, gestión de usuarios, visualización y modificación de todos los archivos
  - **Usuario**: Visualización, edición y carga de archivos asignados o permitidos
  - **Visor**: Solo lectura, sin permisos de modificación o eliminación

### Protección de Datos
- **Sesiones seguras**: Tokens de autenticación con expiración automática
- **Validación de permisos**: Verificación en cada operación para prevenir accesos no autorizados
- **Contraseñas cifradas**: Almacenamiento seguro mediante algoritmos de hash
- **Auditoría**: Registro de todas las acciones realizadas en el sistema

## Tecnologías Utilizadas

| Tecnología | Descripción | Icono |
|------------|-------------|-------|
| **Next.js** | Framework de React para aplicaciones web de última generación | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) |
| **React** | Biblioteca para construir interfaces de usuario interactivas | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) |
| **TypeScript** | Superset de JavaScript que añade tipado estático | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| **PostgreSQL** | Sistema de base de datos relacional robusto y escalable | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Node.js** | Entorno de ejecución de JavaScript | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) |
| **Git** | Control de versiones del código fuente | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) |

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

1. Acceder al sistema con las credenciales proporcionadas
2. Seleccionar el rol correspondiente (Administrador, Usuario o Visor)
3. Navegar por las secciones según los permisos asignados
4. Utilizar las funciones de búsqueda, carga o edición según corresponda

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contactar al equipo de desarrollo del municipio.

---

**Desarrollado para el Municipio de San Juan del Río**