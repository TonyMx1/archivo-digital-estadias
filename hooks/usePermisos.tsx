'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface PermisosState {
  permisos: string[];
  id_rol: number | null;
  loading: boolean;
  error: string | null;
}

interface PermisosContextType extends PermisosState {
  hasPermission: (permiso: string) => boolean;
  hasAnyPermission: (permisos: string[]) => boolean;
  hasAllPermissions: (permisos: string[]) => boolean;
  refetch: () => Promise<void>;
}

const PermisosContext = createContext<PermisosContextType | null>(null);

export function usePermisos() {
  const context = useContext(PermisosContext);
  
  // Si no hay contexto, usar el hook directamente
  if (!context) {
    return usePermisosInternal();
  }
  
  return context;
}

function usePermisosInternal(): PermisosContextType {
  const [state, setState] = useState<PermisosState>({
    permisos: [],
    id_rol: null,
    loading: true,
    error: null,
  });

  const fetchPermisos = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/user/permisos');
      
      if (!response.ok) {
        if (response.status === 401) {
          setState({
            permisos: [],
            id_rol: null,
            loading: false,
            error: 'No autorizado',
          });
          return;
        }
        throw new Error('Error al obtener permisos');
      }

      const data = await response.json();
      
      setState({
        permisos: data.permisos || [],
        id_rol: data.id_rol || null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching permisos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, []);

  useEffect(() => {
    fetchPermisos();
  }, [fetchPermisos]);

  const hasPermission = useCallback((permiso: string): boolean => {
    return state.permisos.includes(permiso);
  }, [state.permisos]);

  const hasAnyPermission = useCallback((permisos: string[]): boolean => {
    return permisos.some(p => state.permisos.includes(p));
  }, [state.permisos]);

  const hasAllPermissions = useCallback((permisos: string[]): boolean => {
    return permisos.every(p => state.permisos.includes(p));
  }, [state.permisos]);

  return {
    ...state,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchPermisos,
  };
}

// Provider para compartir permisos en toda la app
export function PermisosProvider({ children }: { children: React.ReactNode }) {
  const permisos = usePermisosInternal();
  
  return (
    <PermisosContext.Provider value={permisos}>
      {children}
    </PermisosContext.Provider>
  );
}

// Hook para usar en componentes que necesitan el provider
export function usePermisosContext() {
  const context = useContext(PermisosContext);
  if (!context) {
    throw new Error('usePermisosContext debe usarse dentro de PermisosProvider');
  }
  return context;
}
