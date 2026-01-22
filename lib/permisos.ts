// Constantes de permisos para usar en toda la aplicación
// Estos nombres deben coincidir con los valores en la tabla rol_permisos.nombre_permiso

export const PERMISOS = {
  // Permisos de visualización
  VER_DOCUMENTOS: 'ver_documentos',
  VER_SECRETARIAS: 'ver_secretarias',
  VER_DEPENDENCIAS: 'ver_dependencias',
  VER_USUARIOS: 'ver_usuarios',
  VER_ADMIN: 'ver_admin',
  
  // Permisos de edición
  EDITAR_DOCUMENTOS: 'editar_documentos',
  EDITAR_DEPENDENCIAS: 'editar_dependencias',
  EDITAR_USUARIOS: 'editar_usuarios',
  
  // Permisos de creación
  CREAR_DOCUMENTOS: 'crear_documentos',
  CREAR_DEPENDENCIAS: 'crear_dependencias',
  CREAR_USUARIOS: 'crear_usuarios',
  
  // Permisos de eliminación/desactivación
  ELIMINAR_DOCUMENTOS: 'eliminar_documentos',
  DESACTIVAR_DEPENDENCIAS: 'desactivar_dependencias',
  ELIMINAR_USUARIOS: 'eliminar_usuarios',
  
  // Permisos especiales
  SUBIR_ARCHIVOS: 'subir_archivos',
  DESCARGAR_ARCHIVOS: 'descargar_archivos',
  ADMIN_TOTAL: 'admin_total',
} as const;

export type PermisoKey = keyof typeof PERMISOS;
export type PermisoValue = typeof PERMISOS[PermisoKey];

// Grupos de permisos para facilitar asignaciones
export const GRUPOS_PERMISOS = {
  SOLO_LECTURA: [
    PERMISOS.VER_DOCUMENTOS,
    PERMISOS.VER_SECRETARIAS,
    PERMISOS.VER_DEPENDENCIAS,
  ],
  EDITOR: [
    PERMISOS.VER_DOCUMENTOS,
    PERMISOS.VER_SECRETARIAS,
    PERMISOS.VER_DEPENDENCIAS,
    PERMISOS.EDITAR_DOCUMENTOS,
    PERMISOS.CREAR_DOCUMENTOS,
    PERMISOS.SUBIR_ARCHIVOS,
    PERMISOS.DESCARGAR_ARCHIVOS,
  ],
  ADMIN: [
    PERMISOS.ADMIN_TOTAL,
  ],
} as const;
