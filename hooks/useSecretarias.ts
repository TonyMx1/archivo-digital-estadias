import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Secretaria {
  id_secretaria: number;
  nombre_secretaria: string;
  sec_nomcl: string | null;
}

export function useSecretarias() {
  const router = useRouter();
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.user?.id_rol === 9) {
            router.push('/visitante');
            return;
          }
        }

        const response = await fetch('/api/secretarias');
        if (!response.ok) {
          setError('No se pudieron cargar las secretarías');
          return;
        }

        const data = await response.json();
        if (data.success) {
          setSecretarias(data.secretarias || []);
        } else {
          setError('No se pudieron cargar las secretarías');
        }
      } catch (error) {
        console.error('Error al cargar secretarías:', error);
        setError('Error al cargar las secretarías');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  return { secretarias, loading, error };
}
