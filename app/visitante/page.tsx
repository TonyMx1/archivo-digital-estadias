'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginAndVisitanteFooter from '@/components/LoginAndVisitanteFooter';

export default function VisitantePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar que el usuario tenga rol de visitante (9)
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user.id_rol !== 9) {
            // Si no es visitante, redirigir a la página principal
            router.push('/');
          }
        } else {
          // Si no está autenticado, redirigir a login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error al verificar rol:', error);
        router.push('/login');
      }
    };

    checkUserRole();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      } else {
        alert('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-primary">
              Archivo Digital
            </h1>
            <div className="pt-4">
              <div className="bg-blue-50 border-l-4 border-[#0076aa] p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-[#0076aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-[#0076aa]">
                      ¡Bienvenido!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje principal */}
          <div className="space-y-4 text-center">
            <p className="text-lg text-gray-700 font-medium">
              Espera autorización para visitar el Archivo Digital
            </p>
            <p className="text-md text-gray-600">
              Tu solicitud de acceso está siendo procesada. Por favor, espera a que un administrador autorice tu acceso al sistema.
            </p>
          </div>

          {/* Spinner de carga */}
          {/* <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa]"></div>
          </div> */}
        

          {/* Botón de cerrar sesión */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#005a85] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all shadow-lg"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Footer */}
        <LoginAndVisitanteFooter />
      </div>
    </div>
  );
}
