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

    // Contar archivos prestados activos
    let archivosPrestadosActivos = 0;
    try {
      const prestamosActivosQuery = await pool.query(
        `SELECT COUNT(*) as total
         FROM prestamos_documentos
         WHERE estatus_prestamo IN ('Prestado', 'Vencido')`
      );
      archivosPrestadosActivos = parseInt(prestamosActivosQuery.rows[0].total);
    } catch {
      // Si no existe la tabla de préstamos, ignorar
    }
    
    // Contar documentos por secretaría
    const documentosPorSecretariaQuery = await pool.query(
      `SELECT s.id_secretaria, s.nombre_secretaria, COUNT(d.id_doc) as total_documentos
       FROM secretarias s
       LEFT JOIN documentos d ON s.id_secretaria = d.id_secre
       GROUP BY s.id_secretaria, s.nombre_secretaria
       ORDER BY total_documentos DESC`
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
        documentos: parseInt(documentosQuery.rows[0].total),
        archivosPrestadosActivos,
        documentosPorSecretaria: documentosPorSecretariaQuery.rows
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
