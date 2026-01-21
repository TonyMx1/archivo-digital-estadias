import { useState } from 'react';

export interface Dependencia {
  id_dependencia?: number;
  id_secretaria: number;
  nombre_dependencia: string;
  dep_nomcl?: string;
  activo?: boolean;
}

export function useDependencias(secretariaId: number) {
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDependencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dependencias?secretariaId=${secretariaId}`);
      if (!response.ok) {
        throw new Error('Error al cargar dependencias');
      }
      const data = await response.json();
      if (data.success) {
        setDependencias(data.dependencias || []);
      } else {
        throw new Error(data.error || 'Error al cargar dependencias');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar dependencias');
      console.error('Error al cargar dependencias:', err);
    } finally {
      setLoading(false);
    }
  };

  const agregarDependencia = async (
    dependencia: Omit<Dependencia, 'id_dependencia'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dependencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dependencia),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar dependencia');
      }

      const data = await response.json();
      if (data.success) {
        await fetchDependencias(); // Recargar la lista
        return { success: true, dependencia: data.dependencia };
      } else {
        throw new Error(data.error || 'Error al agregar dependencia');
      }
    } catch (err: any) {
      setError(err.message || 'Error al agregar dependencia');
      console.error('Error al agregar dependencia:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const actualizarDependencia = async (dependencia: {
    id_dependencia: number;
    nombre_dependencia: string;
    dep_nomcl: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dependencias', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dependencia),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar dependencia');
      }

      const data = await response.json();
      if (data.success) {
        await fetchDependencias(); // Recargar la lista
        return { success: true, dependencia: data.dependencia };
      } else {
        throw new Error(data.error || 'Error al actualizar dependencia');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar dependencia');
      console.error('Error al actualizar dependencia:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoDependencia = async (idDependencia: number, activo: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dependencias/${idDependencia}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar estado de la dependencia');
      }

      const data = await response.json();
      if (data.success) {
        await fetchDependencias(); // Recargar la lista
        return { success: true };
      } else {
        throw new Error(data.error || 'Error al cambiar estado de la dependencia');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado de la dependencia');
      console.error('Error al cambiar estado de la dependencia:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    dependencias,
    loading,
    error,
    fetchDependencias,
    agregarDependencia,
    actualizarDependencia,
    toggleEstadoDependencia,
  };
}
