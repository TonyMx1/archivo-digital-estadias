import { useEffect, useState } from 'react';

export interface Secretaria {
  id_secretaria: number;
  nombre_secretaria: string;
  sec_nomcl: string | null;
}

let secretariasCache: Secretaria[] | null = null;
let secretariasRequest: Promise<Secretaria[]> | null = null;

async function fetchSecretariasCatalogo() {
  if (secretariasCache) {
    return secretariasCache;
  }

  if (!secretariasRequest) {
    secretariasRequest = (async () => {
      const response = await fetch('/api/secretarias');
      if (!response.ok) {
        throw new Error('No se pudieron cargar las secretarías');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('No se pudieron cargar las secretarías');
      }

      secretariasCache = data.secretarias || [];
      return secretariasCache ?? [];
    })().finally(() => {
      secretariasRequest = null;
    });
  }

  return secretariasRequest;
}

export function useSecretarias() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>(secretariasCache || []);
  const [loading, setLoading] = useState(!secretariasCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(!secretariasCache);
        setError(null);

        const data = await fetchSecretariasCatalogo();
        if (!cancelled) {
          setSecretarias(data);
        }
      } catch (error) {
        console.error('Error al cargar secretarías:', error);
        if (!cancelled) {
          setError('Error al cargar las secretarías');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { secretarias, loading, error };
}
