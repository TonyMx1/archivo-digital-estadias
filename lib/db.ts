// Archivo para la conexión a PostgreSQL
import { Pool } from 'pg';

// Validar que las variables de entorno estén definidas
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
  console.error('💡 Asegúrate de crear el archivo .env.local con todas las variables necesarias');
}

// Determinar configuración SSL
const dbSSL = process.env.DB_SSL;
const useSSL = dbSSL === 'true' || dbSSL === '1';
if (!useSSL && dbSSL && dbSSL !== 'false' && dbSSL !== '0') {
  console.warn(`⚠️ DB_SSL tiene un valor inesperado: "${dbSSL}". Usando SSL=false por defecto.`);
}

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  ssl: useSSL ? { rejectUnauthorized: false } : false,
};



// Pool de conexiones (se inicializará cuando se proporcione la configuración)
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
  }
  return pool;
}

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    const client = getPool();
    const result = await client.query('SELECT NOW()');
    console.log('Conexión a PostgreSQL exitosa:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    return false;
  }
}



// Función para autenticar usuario por CURP y contraseña
// NOTA: Esta función ya no se usa para autenticación principal.
// La autenticación se hace con la API del CUS. Se mantiene por compatibilidad.
export async function authenticateUser(curp: string, password: string) {
  try {
    const pool = getPool();
    
    // Buscar usuario por CURP
    // Tabla: usuarios con campos: id_usuarios, id_general, curp, id_rol
    // NOTA: La tabla usuarios ya no tiene campo contraseña, se valida en API del CUS
    const result = await pool.query(
      `SELECT id_usuarios, id_general, curp, id_rol 
       FROM usuarios 
       WHERE curp = $1`,
      [curp.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return null; // Usuario no encontrado
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    throw error;
  }
}

// Función para obtener información de usuario por CURP
export async function getUserByCurp(curp: string) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id_usuarios, id_general, curp, id_rol, nombre_usuario 
       FROM usuarios 
       WHERE curp = $1`,
      [curp.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

// Función para obtener información de usuario por id_usuarios
export async function getUserById(idUsuarios: number) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id_usuarios, id_general, curp, id_rol, nombre_usuario 
       FROM usuarios 
       WHERE id_usuarios = $1`,
      [idUsuarios]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    throw error;
  }
}

// Función para crear usuario si no existe
export async function createUserIfNotExists(userData: {
  curp: string;
  id_general: string;
  id_rol?: number;
  nombre_usuario?: string;
}) {
  try {
    const pool = getPool();
    const idRol = userData.id_rol || 7; // Rol de usuario por defecto
    const curpUpper = userData.curp.toUpperCase();
    
    // Primero verificar si el usuario ya existe
    const existingUser = await getUserByCurp(curpUpper);
    if (existingUser) {
      // Si existe, actualizar id_general y nombre_usuario si es diferente
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (existingUser.id_general !== userData.id_general) {
        updates.push(`id_general = $${paramIndex}`);
        values.push(userData.id_general);
        paramIndex++;
      }
      
      if (userData.nombre_usuario && existingUser.nombre_usuario !== userData.nombre_usuario) {
        updates.push(`nombre_usuario = $${paramIndex}`);
        values.push(userData.nombre_usuario);
        paramIndex++;
      }
      
      if (updates.length > 0) {
        values.push(curpUpper);
        await pool.query(
          `UPDATE usuarios SET ${updates.join(', ')} WHERE curp = $${paramIndex}`,
          values
        );
        return { 
          ...existingUser, 
          id_general: userData.id_general, 
          nombre_usuario: userData.nombre_usuario || existingUser.nombre_usuario 
        };
      }
      return existingUser;
    }
    
    // Si no existe, crear nuevo usuario
    const result = await pool.query(
      `INSERT INTO usuarios (curp, id_general, id_rol, nombre_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuarios, id_general, curp, id_rol, nombre_usuario`,
      [curpUpper, userData.id_general, idRol, userData.nombre_usuario || null]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    
    // Si es un error de constraint único, intentar obtener el usuario existente
    if (error.code === '23505') { // PostgreSQL unique violation
      return await getUserByCurp(userData.curp.toUpperCase());
    }
    
    throw error;
  }
}

// Función para actualizar el nombre del usuario
export async function updateUserName(idUsuarios: number, nombre_usuario: string) {
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE usuarios SET nombre_usuario = $1 WHERE id_usuarios = $2`,
      [nombre_usuario, idUsuarios]
    );
    return true;
  } catch (error) {
    console.error('Error al actualizar nombre del usuario:', error);
    throw error;
  }
}

// Función para obtener el rol de un usuario
export async function getUserRole(idRol: number) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id_roles, rol 
       FROM roles 
       WHERE id_roles = $1`,
      [idRol]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al obtener rol:', error);
    throw error;
  }
}

// Función para obtener todas las secretarías
export async function getSecretarias() {
  try {
    const pool = getPool();
    const candidateTables = [
      'public.secretaria',
      'secretaria',
      'public.secretarias',
      'secretarias',
    ];

    for (const tableName of candidateTables) {
      try {
        const result = await pool.query(
          `SELECT id_secretaria, nombre_secretaria, sec_nomcl
           FROM ${tableName}
           ORDER BY id_secretaria`
        );
        return result.rows;
      } catch (error: any) {
        if (error?.code === '42P01') {
          continue;
        }
        throw error;
      }
    }

    throw new Error('No existe una tabla de secretarías disponible');
  } catch (error) {
    console.error('Error al obtener secretarías:', error);
    throw error;
  }
}

// Función para obtener dependencias de una secretaría
export async function getDependenciasBySecretaria(idSecretaria: number) {
  try {
    const pool = getPool();
    const dependencyTable = await resolveDependenciasTable(pool);

    if (!dependencyTable) {
      throw new Error('No existe una tabla de dependencias disponible');
    }

    const nomclSelect = dependencyTable.nomclColumn
      ? `${dependencyTable.nomclColumn} AS dep_nomcl`
      : 'NULL AS dep_nomcl';
    
    // Intentar obtener el campo activo si existe
    let activoSelect = 'true AS activo'; // Por defecto todas están activas
    try {
      const [schema, table] = dependencyTable.tableName.includes('.')
        ? dependencyTable.tableName.split('.')
        : ['public', dependencyTable.tableName];
      
      const columnCheck = await pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_schema = $1 
         AND table_name = $2 
         AND column_name IN ('activo', 'estado', 'habilitado', 'enabled')`,
        [schema, table]
      );
      if (columnCheck.rows.length > 0) {
        activoSelect = `${columnCheck.rows[0].column_name} AS activo`;
      }
    } catch {
      // Si no existe el campo, usar true por defecto
    }
    
    const result = await pool.query(
      `SELECT id_dependencia,
              ${dependencyTable.secretariaColumn} AS id_secretaria,
              ${dependencyTable.nombreColumn} AS nombre_dependencia,
              ${nomclSelect},
              ${activoSelect}
       FROM ${dependencyTable.tableName}
       WHERE ${dependencyTable.secretariaColumn} = $1
       ORDER BY id_dependencia`,
      [idSecretaria]
    );
    return result.rows;
  } catch (error) {
    console.error('Error al obtener dependencias:', error);
    throw error;
  }
}

async function resolveDependenciasTable(pool: Pool): Promise<{
  tableName: string;
  secretariaColumn: string;
  nombreColumn: string;
  nomclColumn: string | null;
} | null> {
  const candidateTables = [
    'public.dependencias',
    'dependencias',
    'public.dependencia',
    'dependencia',
  ];
  const secretariaColumns = ['id_secretaria', 'id_secretar', 'secretaria_id'];
  const nombreColumns = [
    'nombre_dependencia',
    'nombre_dep',
    'nombre__dep',
    'nom_dependencia',
  ];
  const nomclColumns = [
    'dep_nomcl',
  ];

  for (const tableName of candidateTables) {
    const [schema, table] = tableName.includes('.')
      ? tableName.split('.')
      : ['public', tableName];
    const secretariaResult = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = $2
         AND column_name = ANY($3)`,
      [schema, table, secretariaColumns]
    );
    const nombreResult = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = $2
         AND column_name = ANY($3)`,
      [schema, table, nombreColumns]
    );
    const nomclResult = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = $2
         AND column_name = ANY($3)`,
      [schema, table, nomclColumns]
    );

    if (secretariaResult.rows.length > 0 && nombreResult.rows.length > 0) {
      return {
        tableName,
        secretariaColumn: secretariaResult.rows[0].column_name,
        nombreColumn: nombreResult.rows[0].column_name,
        nomclColumn: nomclResult.rows[0]?.column_name ?? null,
      };
    }
  }

  return null;
}

// Función para crear una dependencia
  export async function createDependencia(dependenciaData: {
  id_secretaria: number | null;
  nombre_dependencia: string;
  dep_nomcl?: string | null;
}) {
  try {
    const pool = getPool();
    const dependencyTable = await resolveDependenciasTable(pool);

    if (!dependencyTable) {
      throw new Error('No existe una tabla de dependencias disponible');
    }
    if (!dependencyTable.nomclColumn) {
      throw new Error('No existe columna de nomenclatura en dependencias');
    }

    // Verificar si existe el campo activo
    const [schema, table] = dependencyTable.tableName.includes('.')
      ? dependencyTable.tableName.split('.')
      : ['public', dependencyTable.tableName];
    
    let tieneCampoActivo = false;
    let campoActivo = 'activo';
    try {
      const columnCheck = await pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_schema = $1 
         AND table_name = $2 
         AND column_name IN ('activo', 'estado', 'habilitado', 'enabled')`,
        [schema, table]
      );
      if (columnCheck.rows.length > 0) {
        tieneCampoActivo = true;
        campoActivo = columnCheck.rows[0].column_name;
      }
    } catch {
      // Si no existe, intentar crearlo
      try {
        await pool.query(
          `ALTER TABLE ${dependencyTable.tableName} ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true`
        );
        tieneCampoActivo = true;
        campoActivo = 'activo';
      } catch {
        // Si no se puede crear, continuar sin el campo
      }
    }

    const columns = `${dependencyTable.secretariaColumn}, ${dependencyTable.nombreColumn}, ${dependencyTable.nomclColumn}${tieneCampoActivo ? `, ${campoActivo}` : ''}`;
    const values = `$1, $2, $3${tieneCampoActivo ? ', true' : ''}`;
    const returning = `id_dependencia,
                 ${dependencyTable.secretariaColumn} AS id_secretaria,
                 ${dependencyTable.nombreColumn} AS nombre_dependencia,
                 ${dependencyTable.nomclColumn} AS dep_nomcl${tieneCampoActivo ? `, ${campoActivo} AS activo` : ''}`;

                 const result = await pool.query(
                  `INSERT INTO ${dependencyTable.tableName} (${columns})
                   VALUES (${values})
                   RETURNING ${returning}`,
                  [
                    dependenciaData.id_secretaria,
                    dependenciaData.nombre_dependencia,
                    dependenciaData.dep_nomcl || null, // Permite que sea null si no se envía
                  ]
                );
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear dependencia:', error);
    throw error;
  }
}

// Función para actualizar una dependencia
export async function updateDependencia(dependenciaData: {
  id_dependencia: number;
  nombre_dependencia: string;
  dep_nomcl: string;
}) {
  try {
    const pool = getPool();
    const dependencyTable = await resolveDependenciasTable(pool);

    if (!dependencyTable) {
      throw new Error('No existe una tabla de dependencias disponible');
    }
    if (!dependencyTable.nomclColumn) {
      throw new Error('No existe columna de nomenclatura en dependencias');
    }

    const result = await pool.query(
      `UPDATE ${dependencyTable.tableName}
       SET ${dependencyTable.nombreColumn} = $1,
           ${dependencyTable.nomclColumn} = $2
       WHERE id_dependencia = $3
       RETURNING id_dependencia,
                 ${dependencyTable.secretariaColumn} AS id_secretaria,
                 ${dependencyTable.nombreColumn} AS nombre_dependencia,
                 ${dependencyTable.nomclColumn} AS dep_nomcl`,
      [
        dependenciaData.nombre_dependencia,
        dependenciaData.dep_nomcl,
        dependenciaData.id_dependencia,
      ]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al actualizar dependencia:', error);
    throw error;
  }
}

// Función para activar/desactivar una dependencia
export async function toggleEstadoDependencia(idDependencia: number, activo: boolean) {
  try {
    const pool = getPool();
    const dependencyTable = await resolveDependenciasTable(pool);

    if (!dependencyTable) {
      throw new Error('No existe una tabla de dependencias disponible');
    }

    // Intentar encontrar el campo de estado
    const [schema, table] = dependencyTable.tableName.includes('.')
      ? dependencyTable.tableName.split('.')
      : ['public', dependencyTable.tableName];
    
    const columnCheck = await pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_schema = $1 
       AND table_name = $2 
       AND column_name IN ('activo', 'estado', 'habilitado', 'enabled')`,
      [schema, table]
    );

    let estadoColumn = 'activo'; // Por defecto
    if (columnCheck.rows.length > 0) {
      estadoColumn = columnCheck.rows[0].column_name;
    } else {
      // Si no existe el campo, intentar crearlo
      try {
        await pool.query(
          `ALTER TABLE ${dependencyTable.tableName} ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true`
        );
        estadoColumn = 'activo';
      } catch (alterError: any) {
        // Si no se puede crear, usar un campo alternativo o lanzar error
        console.warn('No se pudo crear el campo activo, usando lógica alternativa');
        // Intentar con otros nombres comunes
        const altColumns = ['estado', 'habilitado', 'enabled'];
        for (const altCol of altColumns) {
          try {
            await pool.query(
              `ALTER TABLE ${dependencyTable.tableName} ADD COLUMN IF NOT EXISTS ${altCol} BOOLEAN DEFAULT true`
            );
            estadoColumn = altCol;
            break;
          } catch {
            continue;
          }
        }
      }
    }

    const result = await pool.query(
      `UPDATE ${dependencyTable.tableName}
       SET ${estadoColumn} = $1
       WHERE id_dependencia = $2
       RETURNING id_dependencia, ${estadoColumn} AS activo`,
      [activo, idDependencia]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error al cambiar estado de dependencia:', error);
    throw error;
  }
}

// Función para obtener los permisos de un rol
export async function getRolePermissions(idRol: number) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT p.id_permisos, p.nomb_permisos
       FROM permisos p
       INNER JOIN rol_permisos rp ON p.id_permisos = rp.id_permisos
       WHERE rp.id_rol = $1`,
      [idRol]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error al obtener permisos del rol:', error);
    throw error;
  }
}

// Función para obtener usuario completo con rol y permisos
export async function getUserWithPermissions(idUsuarios: number) {
  try {
    const user = await getUserById(idUsuarios);
    if (!user) {
      return null;
    }
    
    const role = await getUserRole(user.id_rol);
    const permissions = await getRolePermissions(user.id_rol);
    
    return {
      ...user,
      role: role,
      permissions: permissions,
    };
  } catch (error) {
    console.error('Error al obtener usuario con permisos:', error);
    throw error;
  }
}

// Función para obtener todos los tipos de documento
export async function getTiposDocumento() {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id_documento, nombre_documento, estatus_documento
       FROM tipo_documento
       ORDER BY nombre_documento`
    );
    return result.rows;
  } catch (error) {
    console.error('Error al obtener tipos de documento:', error);
    throw error;
  }
}

// Función para obtener todos los documentos con JOINs
export async function getDocumentos(filters?: {
  id_secre?: number;
  tipo_doc?: number;
  anio_doc?: string;
  estatus_doc?: string;
}) {
  try {
    const pool = getPool();
    let query = `
      SELECT 
        d.id_doc,
        d.nombre_doc,
        d.tipo_doc,
        td.nombre_documento AS nombre_tipo_documento,
        d.size_doc,
        d.anio_doc,
        d.comentario_doc,
        d.id_secre,
        s.nombre_secretaria,
        d.id_usu_alta,
        d.meta_doc,
        d.desc_doc,
        d.oficio_doc,
        d.expediente_doc,
        d.serie_doc,
        d.subserie_doc,
        d.cons_doc,
        d.confidencial_doc,
        d.fecha_doc,
        d.hora_doc,
        d.url_cons_doc,
        d.estatus_doc,
        d.motivo_baja_doc,
        d.version_doc
      FROM documentos d
      LEFT JOIN tipo_documento td ON d.tipo_doc = td.id_documento
      LEFT JOIN secretarias s ON d.id_secre = s.id_secretaria
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.id_secre) {
      query += ` AND d.id_secre = $${paramIndex}`;
      params.push(filters.id_secre);
      paramIndex++;
    }

    if (filters?.tipo_doc) {
      query += ` AND d.tipo_doc = $${paramIndex}`;
      params.push(filters.tipo_doc);
      paramIndex++;
    }

    if (filters?.anio_doc) {
      query += ` AND d.anio_doc = $${paramIndex}`;
      params.push(filters.anio_doc);
      paramIndex++;
    }

    if (filters?.estatus_doc) {
      query += ` AND d.estatus_doc = $${paramIndex}`;
      params.push(filters.estatus_doc);
      paramIndex++;
    }

    query += ` ORDER BY d.id_doc DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    throw error;
  }
}

// Función para obtener un documento por ID
export async function getDocumentoById(idDoc: number) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT 
        d.id_doc,
        d.nombre_doc,
        d.tipo_doc,
        td.nombre_documento AS nombre_tipo_documento,
        d.size_doc,
        d.anio_doc,
        d.comentario_doc,
        d.id_secre,
        s.nombre_secretaria,
        d.id_usu_alta,
        d.meta_doc,
        d.desc_doc,
        d.oficio_doc,
        d.expediente_doc,
        d.serie_doc,
        d.subserie_doc,
        d.cons_doc,
        d.confidencial_doc,
        d.fecha_doc,
        d.hora_doc,
        d.url_cons_doc,
        d.estatus_doc,
        d.motivo_baja_doc,
        d.version_doc
       FROM documentos d
       LEFT JOIN tipo_documento td ON d.tipo_doc = td.id_documento
       LEFT JOIN secretarias s ON d.id_secre = s.id_secretaria
       WHERE d.id_doc = $1`,
      [idDoc]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener documento por ID:', error);
    throw error;
  }
}

// Función para crear un nuevo documento
export async function createDocumento(documentoData: {
  nombre_doc: string;
  tipo_doc: number;
  id_secre: number;
  size_doc?: string;
  anio_doc?: string;
  comentario_doc?: string;
  id_usu_alta?: number;
  meta_doc?: string;
  desc_doc?: string;
  oficio_doc?: string;
  expediente_doc?: string;
  serie_doc?: string;
  subserie_doc?: string;
  cons_doc?: string;
  confidencial_doc?: boolean;
  fecha_doc?: string;
  hora_doc?: string;
  url_cons_doc?: string;
  estatus_doc?: string;
  version_doc?: number;
}) {
  try {
    const pool = getPool();
    
    if (!documentoData.nombre_doc || !documentoData.tipo_doc || !documentoData.id_secre) {
      throw new Error('Se requieren nombre_doc, tipo_doc e id_secre');
    }

    const result = await pool.query(
      `INSERT INTO documentos (
        nombre_doc, tipo_doc, id_secre, size_doc, anio_doc, comentario_doc,
        id_usu_alta, meta_doc, desc_doc, oficio_doc, expediente_doc,
        serie_doc, subserie_doc, cons_doc, confidencial_doc, fecha_doc,
        hora_doc, url_cons_doc, estatus_doc, version_doc
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *`,
      [
        documentoData.nombre_doc,
        documentoData.tipo_doc,
        documentoData.id_secre,
        documentoData.size_doc || null,
        documentoData.anio_doc || null,
        documentoData.comentario_doc || null,
        documentoData.id_usu_alta || null,
        documentoData.meta_doc || null,
        documentoData.desc_doc || null,
        documentoData.oficio_doc || null,
        documentoData.expediente_doc || null,
        documentoData.serie_doc || null,
        documentoData.subserie_doc || null,
        documentoData.cons_doc || null,
        documentoData.confidencial_doc || false,
        documentoData.fecha_doc || null,
        documentoData.hora_doc || null,
        documentoData.url_cons_doc || null,
        documentoData.estatus_doc || 'Activo',
        documentoData.version_doc || 1,
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear documento:', error);
    throw error;
  }
}

// Función para actualizar un documento
export async function updateDocumento(documentoData: {
  id_doc: number;
  nombre_doc?: string;
  tipo_doc?: number;
  id_secre?: number;
  size_doc?: string;
  anio_doc?: string;
  comentario_doc?: string;
  meta_doc?: string;
  desc_doc?: string;
  oficio_doc?: string;
  expediente_doc?: string;
  serie_doc?: string;
  subserie_doc?: string;
  cons_doc?: string;
  confidencial_doc?: boolean;
  fecha_doc?: string;
  hora_doc?: string;
  url_cons_doc?: string;
  estatus_doc?: string;
  version_doc?: number;
}) {
  try {
    const pool = getPool();
    
    if (!documentoData.id_doc) {
      throw new Error('Se requiere id_doc');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const camposPermitidos = [
      'nombre_doc', 'tipo_doc', 'id_secre', 'size_doc', 'anio_doc',
      'comentario_doc', 'meta_doc', 'desc_doc', 'oficio_doc', 'expediente_doc',
      'serie_doc', 'subserie_doc', 'cons_doc', 'confidencial_doc', 'fecha_doc',
      'hora_doc', 'url_cons_doc', 'estatus_doc', 'version_doc'
    ];

    for (const campo of camposPermitidos) {
      const valor = documentoData[campo as keyof typeof documentoData];
      if (valor !== undefined) {
        updates.push(`${campo} = $${paramIndex}`);
        values.push(valor);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(documentoData.id_doc);
    const result = await pool.query(
      `UPDATE documentos
       SET ${updates.join(', ')}
       WHERE id_doc = $${paramIndex}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    throw error;
  }
}

// Función para eliminar un documento (soft delete)
export async function deleteDocumento(idDoc: number, motivoBaja?: string) {
  try {
    const pool = getPool();
    const result = await pool.query(
      `UPDATE documentos
       SET estatus_doc = 'Inactivo',
           motivo_baja_doc = $1
       WHERE id_doc = $2
       RETURNING *`,
      [motivoBaja || null, idDoc]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    throw error;
  }
}

// Función para obtener estadísticas generales
export async function getStatistics() {
  try {
    const pool = getPool();
    
    const secretariasCount = await pool.query(
      `SELECT COUNT(*) as total FROM secretarias`
    );
    
    const dependenciasCount = await pool.query(
      `SELECT COUNT(*) as total FROM dependencias`
    );
    
    return {
      secretarias: parseInt(secretariasCount.rows[0].total),
      dependencias: parseInt(dependenciasCount.rows[0].total)
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}
