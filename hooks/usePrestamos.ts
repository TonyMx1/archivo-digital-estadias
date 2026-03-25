import { useState } from "react";

export interface PrestamoDocumento {
  id_prestamo: number;
  id_doc: number;
  nombre_doc: string;
  expediente_doc?: string | null;
  oficio_doc?: string | null;
  id_secre?: number | null;
  nombre_secretaria?: string | null;
  nombre_dependencia?: string | null;
  num_caja?: string | null;
  ubicacion_doc?: string | null;
  estante_doc?: string | null;
  nombre_solicitante: string;
  curp_solicitante: string;
  area_solicitante?: string | null;
  motivo_prestamo?: string | null;
  observaciones?: string | null;
  fecha_prestamo: string;
  fecha_limite_devolucion: string;
  fecha_devolucion?: string | null;
  estatus_prestamo: "Prestado" | "Vencido" | "Devuelto" | "Cancelado";
  vale_url?: string | null;
  id_usuario_registro: number;
  id_usuario_devolucion?: number | null;
  created_at?: string;
  updated_at?: string;
  nombre_usuario_registro?: string | null;
  nombre_usuario_devolucion?: string | null;
}

interface PrestamosFilters {
  id_doc?: number;
  id_secre?: number;
  estatus_prestamo?: string;
}

const prestamosCache = new Map<string, PrestamoDocumento[]>();
const pendingPrestamosRequests = new Map<string, Promise<PrestamoDocumento[]>>();

function buildPrestamosCacheKey(filters?: PrestamosFilters) {
  return JSON.stringify({
    id_doc: filters?.id_doc ?? null,
    id_secre: filters?.id_secre ?? null,
    estatus_prestamo: filters?.estatus_prestamo ?? null,
  });
}

function clearPrestamosCache() {
  prestamosCache.clear();
  pendingPrestamosRequests.clear();
}

async function getApiErrorMessage(response: Response, fallbackMessage: string) {
  if (response.status === 401) {
    return "Tu sesión expiró o no es válida. Inicia sesión nuevamente.";
  }

  try {
    const data = await response.json();
    return data?.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function usePrestamos() {
  const [prestamos, setPrestamos] = useState<PrestamoDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrestamos = async (filters?: PrestamosFilters) => {
    const cacheKey = buildPrestamosCacheKey(filters);
    const cachedPrestamos = prestamosCache.get(cacheKey);

    if (cachedPrestamos) {
      setPrestamos(cachedPrestamos);
      setLoading(false);
      setError(null);
      return cachedPrestamos;
    }

    setLoading(true);
    setError(null);

    try {
      if (!pendingPrestamosRequests.has(cacheKey)) {
        const request = (async () => {
          const params = new URLSearchParams();
          if (filters?.id_doc) params.append("id_doc", filters.id_doc.toString());
          if (filters?.id_secre) params.append("id_secre", filters.id_secre.toString());
          if (filters?.estatus_prestamo) {
            params.append("estatus_prestamo", filters.estatus_prestamo);
          }

          const url = `/api/prestamos${params.toString() ? `?${params.toString()}` : ""}`;
          const response = await fetch(url, { credentials: "include" });

          if (!response.ok) {
            throw new Error(
              await getApiErrorMessage(response, "Error al cargar prestamos")
            );
          }

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || "Error al cargar prestamos");
          }

          const prestamosResult = data.prestamos || [];
          prestamosCache.set(cacheKey, prestamosResult);
          return prestamosResult;
        })().finally(() => {
          pendingPrestamosRequests.delete(cacheKey);
        });

        pendingPrestamosRequests.set(cacheKey, request);
      }

      const prestamosResult = await pendingPrestamosRequests.get(cacheKey)!;
      setPrestamos(prestamosResult);
      return prestamosResult;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Error al cargar prestamos");
      setError(errorMessage);
      console.error("Error al cargar prestamos:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const crearPrestamo = async (
    prestamo: Omit<
      PrestamoDocumento,
      | "id_prestamo"
      | "nombre_doc"
      | "expediente_doc"
      | "oficio_doc"
      | "id_secre"
      | "nombre_secretaria"
      | "nombre_dependencia"
      | "num_caja"
      | "ubicacion_doc"
      | "estante_doc"
      | "estatus_prestamo"
      | "id_usuario_registro"
      | "id_usuario_devolucion"
      | "created_at"
      | "updated_at"
      | "nombre_usuario_registro"
      | "nombre_usuario_devolucion"
    >
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prestamos", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prestamo),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Error al crear prestamo")
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Error al crear prestamo");
      }

      clearPrestamosCache();
      await fetchPrestamos();
      return { success: true, prestamo: data.prestamo as PrestamoDocumento };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Error al crear prestamo");
      setError(errorMessage);
      console.error("Error al crear prestamo:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const devolverPrestamo = async (payload: {
    id_prestamo: number;
    fecha_devolucion: string;
    observaciones_devolucion?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prestamos", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Error al devolver prestamo")
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Error al devolver prestamo");
      }

      clearPrestamosCache();
      await fetchPrestamos();
      return { success: true, prestamo: data.prestamo as PrestamoDocumento };
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Error al devolver prestamo");
      setError(errorMessage);
      console.error("Error al devolver prestamo:", err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    prestamos,
    loading,
    error,
    fetchPrestamos,
    crearPrestamo,
    devolverPrestamo,
  };
}
