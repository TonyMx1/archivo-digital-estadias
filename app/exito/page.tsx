'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ExitoFooter from '@/components/ExitoFooter';
import './page.css';

export default function ExitoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // AbortController para cancelar peticiones pendientes
    const abortController = new AbortController();
    let timer: NodeJS.Timeout | null = null;
    let progressTimer: NodeJS.Timeout | null = null;

    // Simular barra de progreso
    const startProgress = () => {
      let currentProgress = 0;
      progressTimer = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          if (progressTimer) clearInterval(progressTimer);
        }
      }, 300);
    };

    // Función combinada para actualizar nombre y verificar rol
    const updateUserAndRedirect = async () => {
      try {
        if (typeof window === 'undefined') return;

        const cusToken = sessionStorage.getItem('cusToken');
        
        // Llamada combinada a la API
        const response = await fetch('/api/user/update-and-redirect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cusToken: cusToken,
          }),
          signal: abortController.signal,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Proceso completado:', data);
          
          // Redirigir según el rol después de 3 segundos
          timer = setTimeout(() => {
            const redirectTarget = data.userRole === 9 ? '/visitante' : '/';
            router.push(redirectTarget);
          }, 3000);
        } else {
          throw new Error('Error en el proceso de autenticación');
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error en el proceso:', error);
          setError('Ocurrió un error durante el proceso. Serás redirigido al inicio...');
          
          // Redirección de fallback
          timer = setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      }
    };

    // Iniciar procesos
    startProgress();
    updateUserAndRedirect();

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
      if (progressTimer) clearInterval(progressTimer);
      abortController.abort();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3b60] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 text-center">
          {/* Icono de éxito animado */}
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center">
              <svg
                className="w-20 h-20 text-green-500 animate-checkmark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Checkmark de éxito"
              >
                <circle
                  className="animate-circle"
                  cx="12"
                  cy="12"
                  r="10"
                  strokeWidth="2"
                />
                <path
                  className="animate-path"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Mensaje de éxito */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#0b3b60]">
              Login exitoso
            </h1>
            <p className="text-gray-600">
              Has iniciado sesión correctamente. Serás redirigido en unos segundos...
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#0076aa] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso de redirección"
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        <ExitoFooter />
      </div>
    </div>
  );
}
