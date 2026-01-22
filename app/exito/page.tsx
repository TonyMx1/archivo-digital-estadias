'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ExitoFooter from '@/components/ExitoFooter';

export default function ExitoPage() {
  const router = useRouter();

  useEffect(() => {
    // Obtener el token del CUS de sessionStorage y actualizar el nombre
    const updateUserName = async () => {
      try {
        if (typeof window !== 'undefined') {
          const cusToken = sessionStorage.getItem('cusToken');
          
          if (cusToken) {
            // Llamar a la API para actualizar el nombre usando el token del CUS
            const response = await fetch('/api/user/update-name', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cusToken: cusToken,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              console.log('Nombre actualizado:', data.nombre_completo);
            } else {
              console.error('Error al actualizar nombre:', await response.text());
            }
          }
        }
      } catch (error) {
        console.error('Error al actualizar nombre del usuario:', error);
        // No bloquear el flujo si falla la actualización del nombre
      }
    };

    updateUserName();

    // Verificar el rol del usuario y redirigir según corresponda
    let timer: NodeJS.Timeout | null = null;
    
    const checkUserRoleAndRedirect = async () => {
      try {
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success) {
            const userRole = userData.user.id_rol;
            
            // Redirigir según el rol después de 3 segundos
            timer = setTimeout(() => {
              if (userRole === 9) {
                // Visitantes van a la página de espera
                router.push('/visitante');
              } else {
                // Otros usuarios van al home
                router.push('/');
              }
            }, 3000);
          }
        } else {
          // Si no se puede obtener el usuario, redirigir al home por defecto
          timer = setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Error al verificar rol:', error);
        // Si hay error, redirigir al home por defecto
        timer = setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    checkUserRoleAndRedirect();

    // Limpiar el timer si el componente se desmonta
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3b60] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 text-center">
          {/* Icono de éxito */}
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center">
            <img
              src="https://media.tenor.com/AWKzZ19awFYAAAAi/checkmark-transparent.gif"
              alt="Éxito"
              className="w-20 h-20 object-contain"
            />
            </div>
          </div>

          {/* Mensaje de éxito */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#0b3b60]">
              Login exitoso
            </h1>
            <p className="text-gray-600">
              Has iniciado sesión correctamente. Serás redirigido en unos momentos...
            </p>
          </div>

          {/* Spinner de carga */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa]"></div>
          </div>
        </div>

        <ExitoFooter />
      </div>
    </div>
  );
}
