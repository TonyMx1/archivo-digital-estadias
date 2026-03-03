// Utilidades de autenticación que requieren acceso a la base de datos
// Estas funciones solo deben usarse en Server Components o API Routes (Node.js runtime)

import { getPool } from './db';

// Verificar sesión en la base de datos por id_usuarios
export async function getSessionByUserId(idUsuarios: number) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT * FROM sesiones 
       WHERE id_usuarios = $1 
       AND fecha_expiracion > NOW() 
       AND ultima_actividad > NOW() - INTERVAL '30 minutes'`,
      [idUsuarios]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return null;
  } finally {
    client.release();
  }
}

// Actualizar última actividad de la sesión
export async function updateSessionActivity(idUsuarios: number) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query(
      `UPDATE sesiones 
       SET ultima_actividad = NOW() 
       WHERE id_usuarios = $1 
       AND fecha_expiracion > NOW()`,
      [idUsuarios]
    );
    return true;
  } catch (error) {
    console.error('Error al actualizar actividad de sesión:', error);
    return false;
  } finally {
    client.release();
  }
}

// Verificar si existe una sesión activa para el usuario
export async function hasActiveSession(idUsuarios: number): Promise<boolean> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT * FROM sesiones 
       WHERE id_usuarios = $1 
       AND fecha_expiracion > NOW() 
       AND ultima_actividad > NOW() - INTERVAL '30 minutes'`,
      [idUsuarios]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error al verificar sesión activa:', error);
    return false;
  } finally {
    client.release();
  }
}

// Eliminar sesión por id_usuarios
export async function deleteSession(idUsuarios: number) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query(
      `DELETE FROM sesiones WHERE id_usuarios = $1`,
      [idUsuarios]
    );
    return true;
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    return false;
  } finally {
    client.release();
  }
}

// Eliminar sesión por id_usuarios
export async function deleteSessionByUserId(idUsuarios: number) {
  try {
    const pool = getPool();
    await pool.query(
      `DELETE FROM sesiones WHERE id_usuarios = $1`,
      [idUsuarios]
    );
    return true;
  } catch (error) {
    console.error('Error al eliminar sesión por usuario:', error);
    return false;
  }
}

// Crear sesión en la base de datos (sin guardar el token por seguridad)
export async function createSession(idUsuarios: number) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    
    // Primero, eliminar cualquier sesión existente para este usuario (una sesión activa por usuario)
    await client.query(
      `DELETE FROM sesiones WHERE id_usuarios = $1`,
      [idUsuarios]
    );
    
    // Crear nueva sesión (sin token, solo id_usuarios y fechas)
    await client.query(
      `INSERT INTO sesiones (id_usuarios, fecha_creacion, fecha_expiracion, ultima_actividad)
       VALUES ($1, NOW(), $2, NOW())`,
      [idUsuarios, expiresAt]
    );
    
    return true;
  } catch (error) {
    console.error('Error al crear sesión:', error);
    // Si la tabla no existe, intentar crearla
    if (error instanceof Error && error.message.includes('does not exist')) {
      await createSessionsTable();
      return createSession(idUsuarios);
    }
    throw error;
  } finally {
    client.release();
  }
}

// Limpiar sesiones expiradas
export async function cleanExpiredSessions() {
  try {
    const pool = getPool();
    await pool.query(
      `DELETE FROM sesiones 
       WHERE fecha_expiracion < NOW() 
       OR ultima_actividad < NOW() - INTERVAL '30 minutes'`
    );
    return true;
  } catch (error) {
    console.error('Error al limpiar sesiones expiradas:', error);
    return false;
  }
}

// Crear tabla de sesiones si no existe (sin columna token por seguridad)
async function createSessionsTable() {
  try {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id_sesion SERIAL PRIMARY KEY,
        id_usuarios INTEGER NOT NULL REFERENCES usuarios(id_usuarios) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_expiracion TIMESTAMP NOT NULL,
        ultima_actividad TIMESTAMP DEFAULT NOW(),
        UNIQUE(id_usuarios)
      );
      
      CREATE INDEX IF NOT EXISTS idx_sesiones_id_usuarios ON sesiones(id_usuarios);
      CREATE INDEX IF NOT EXISTS idx_sesiones_expiracion ON sesiones(fecha_expiracion);
    `);
    console.log('Tabla de sesiones creada exitosamente');
  } catch (error) {
    console.error('Error al crear tabla de sesiones:', error);
    throw error;
  }
}
