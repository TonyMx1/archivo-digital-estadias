import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = getPool();
    
    // Contar secretarías
    const secretariasQuery = await pool.query(
      `SELECT COUNT(*) as total FROM secretarias`
    );
    
    // Contar dependencias
    const dependenciasQuery = await pool.query(
      `SELECT COUNT(*) as total FROM dependencias`
    );
    
    // Contar documentos
    const documentosQuery = await pool.query(
      `SELECT COUNT(*) as total FROM documentos`
    );
    
    // También puedes contar dependencias activas si tienes ese campo
    let dependenciasActivas = null;
    try {
      const activasQuery = await pool.query(
        `SELECT COUNT(*) as total FROM dependencias WHERE activo = true`
      );
      dependenciasActivas = parseInt(activasQuery.rows[0].total);
    } catch {
      // Si no existe el campo activo, ignorar
    }
    
    return NextResponse.json({
      success: true,
      statistics: {
        secretarias: parseInt(secretariasQuery.rows[0].total),
        dependencias: parseInt(dependenciasQuery.rows[0].total),
        dependenciasActivas: dependenciasActivas,
        documentos: parseInt(documentosQuery.rows[0].total)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
