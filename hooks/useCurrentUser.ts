import { useEffect, useState } from "react";

export interface CurrentUser {
  id_usuarios: number;
  curp: string;
  id_rol: number;
  id_general: string;
  nombre_usuario: string | null;
  nom_secre: string | null;
  nombre_rol: string | null;
  permisos: string[];
}

let currentUserCache: CurrentUser | null = null;
let currentUserRequest: Promise<CurrentUser | null> | null = null;

async function fetchCurrentUser() {
  if (currentUserCache) {
    return currentUserCache;
  }

  if (!currentUserRequest) {
    currentUserRequest = (async () => {
      const response = await fetch("/api/user");
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data.success) {
        return null;
      }

      currentUserCache = data.user ?? null;
      return currentUserCache;
    })().finally(() => {
      currentUserRequest = null;
    });
  }

  return currentUserRequest;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(currentUserCache);
  const [loading, setLoading] = useState(!currentUserCache);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      try {
        setLoading(!currentUserCache);
        const currentUser = await fetchCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error al obtener usuario actual:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
