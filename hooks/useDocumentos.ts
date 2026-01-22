import { useState } from 'react';

export interface Documento {
  id_doc?: number;
  nombre_doc: string;
  tipo_doc: number;
  nombre_tipo_documento?: string;
  size_doc?: string;
  anio_doc?: string;
  comentario_doc?: string;
  id_secre: number;
  nombre_secretaria?: string;
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
  motivo_baja_doc?: string;
  version_doc?: number;
}

interface DocumentosFilters {
  id_secre?: number;
  tipo_doc?: number;
  anio_doc?: string;
  estatus_doc?: string;
}

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = async (filters?: DocumentosFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.id_secre) params.append('id_secre', filters.id_secre.toString());
      if (filters?.tipo_doc) params.append('tipo_doc', filters.tipo_doc.toString());
      if (filters?.anio_doc) params.append('anio_doc', filters.anio_doc);
      if (filters?.estatus_doc) params.append('estatus_doc', filters.estatus_doc);

      const url = `/api/documentos${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al cargar documentos');
      }

      const data = await response.json();
      if (data.success) {
        setDocumentos(data.documentos || []);
      } else {
        throw new Error(data.error || 'Error al cargar documentos');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar documentos');
      console.error('Error al cargar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const crearDocumento = async (
    documento: Omit<Documento, 'id_doc' | 'nombre_tipo_documento' | 'nombre_secretaria'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documento),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear documento');
      }

      const data = await response.json();
      if (data.success) {
        await fetchDocumentos(); // Recargar la lista
        return { success: true, documento: data.documento };
      } else {
        throw new Error(data.error || 'Error al crear documento');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear documento');
      console.error('Error al crear documento:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const actualizarDocumento = async (documento: Partial<Documento> & { id_doc: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documentos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documento),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar documento');
      }

      const data = await response.json();
      if (data.success) {
        await fetchDocumentos(); // Recargar la lista
        return { success: true, documento: data.documento };
      } else {
        throw new Error(data.error || 'Error al actualizar documento');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar documento');
      console.error('Error al actualizar documento:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const eliminarDocumento = async (idDoc: number, motivoBaja?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('id_doc', idDoc.toString());
      if (motivoBaja) params.append('motivo_baja', motivoBaja);

      const response = await fetch(`/api/documentos?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar documento');
      }

      const data = await response.json();
      if (data.success) {
        await fetchDocumentos(); // Recargar la lista
        return { success: true };
      } else {
        throw new Error(data.error || 'Error al eliminar documento');
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar documento');
      console.error('Error al eliminar documento:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 📤 NUEVA FUNCIÓN: Subir archivo físico al servidor
  const subirArchivo = async (
  file: File,
  sistema: string,
  rutaRelativa: string
) => {
  setLoading(true);
  setError(null);

  try {
    // 1️⃣ Validar tamaño (20 MB)
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 20) {
      throw new Error(
        `El archivo es demasiado grande (${sizeInMB.toFixed(2)} MB). Máximo 20 MB.`
      );
    }

    console.log('📤 Archivo a subir:', {
      nombre: file.name,
      tamaño: sizeInMB.toFixed(2) + ' MB',
      tipo: file.type,
    });

    // 2️⃣ Crear FormData (ARCHIVO REAL)
    const formData = new FormData();

    // 🔴 IMPORTANTE: primero sistema y ruta
    formData.append('sistema', sistema);
    formData.append('rutaRelativa', rutaRelativa);

    // 🔴 Después el archivo
    formData.append('archivo', file, file.name);

    // 3️⃣ Enviar al API interno
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData, // ❌ SIN headers
    });

    // 4️⃣ Leer respuesta de forma segura
    const responseText = await response.text();

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        'El servidor devolvió una respuesta inválida (no JSON)'
      );
    }

    if (!response.ok) {
      throw new Error(data.error || 'Error al subir archivo');
    }

    console.log('✅ Respuesta del servidor:', data);

    // 5️⃣ Validar respuesta esperada
    if (data.status === 'ok' && data.archivos && data.archivos.length > 0) {
      return {
        success: true,
        url: data.archivos[0].url_publica,
        rutaFisica: data.archivos[0].ruta_fisica,
        nombreArchivo: data.archivos[0].filename,
      };
    }

    throw new Error('Respuesta inesperada del servidor');

  } catch (err: any) {
    setError(err.message || 'Error al subir archivo');
    console.error('❌ Error completo:', err);
    return {
      success: false,
      error: err.message,
    };
  } finally {
    setLoading(false);
  }
};



  return {
    documentos,
    loading,
    error,
    fetchDocumentos,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento,
    subirArchivo,
  };
}
