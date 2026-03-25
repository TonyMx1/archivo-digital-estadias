import { useCallback, useState } from 'react';

export interface Dependencia {
  id_dependencia?: number;
  id_secretaria: number;
  nombre_dependencia: string;
  dep_nomcl?: string;
  activo?: boolean;
}

const dependenciasCache = new Map<number, Dependencia[]>();
const dependenciasPendingRequests = new Map<number, Promise<Dependencia[]>>();

export function useDependencias(secretariaId: number) {
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDependencias = useCallback(async (forceRefresh = false) => {
    if (!secretariaId) {
      setDependencias([]);
      return [];
    }

    if (forceRefresh) {
      dependenciasCache.delete(secretariaId);
    } else {
      const cached = dependenciasCache.get(secretariaId);
      if (cached) {
        setDependencias(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const pending = dependenciasPendingRequests.get(secretariaId);
      const request =
        pending ??
        fetch(`/api/dependencias?secretariaId=${secretariaId}`)
          .then(async (response) => {
            if (!response.ok) {
              throw new Error('Error al cargar dependencias');
            }
            const data = await response.json();
            if (!data.success) {
              throw new Error(data.error || 'Error al cargar dependencias');
            }
            return data.dependencias || [];
          })
          .finally(() => {
            dependenciasPendingRequests.delete(secretariaId);
          });

      if (!pending) {
        dependenciasPendingRequests.set(secretariaId, request);
      }

      const result = await request;
      dependenciasCache.set(secretariaId, result);
      setDependencias(result);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar dependencias';
      setError(message);
      console.error('Error al cargar dependencias:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [secretariaId]);

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
        dependenciasCache.delete(secretariaId);
        await fetchDependencias(true); // Recargar la lista
        return { success: true, dependencia: data.dependencia };
      } else {
        throw new Error(data.error || 'Error al agregar dependencia');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al agregar dependencia';
      setError(message);
      console.error('Error al agregar dependencia:', err);
      return { success: false, error: message };
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
        dependenciasCache.delete(secretariaId);
        await fetchDependencias(true); // Recargar la lista
        return { success: true, dependencia: data.dependencia };
      } else {
        throw new Error(data.error || 'Error al actualizar dependencia');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar dependencia';
      setError(message);
      console.error('Error al actualizar dependencia:', err);
      return { success: false, error: message };
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
        dependenciasCache.delete(secretariaId);
        await fetchDependencias(true); // Recargar la lista
        return { success: true };
      } else {
        throw new Error(data.error || 'Error al cambiar estado de la dependencia');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado de la dependencia';
      setError(message);
      console.error('Error al cambiar estado de la dependencia:', err);
      return { success: false, error: message };
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
