"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ExitoFooter from "@/components/ExitoFooter";
import HeaderAll from "@/components/HeaderAll";

export default function HomePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<number | null>(null);

  // Estado para estadísticas
  const [statistics, setStatistics] = useState({
    secretarias: 0,
    dependencias: 0,
    dependenciasActivas: null as number | null,
    documentos: 0 // Nuevo campo
  });

  const [loadingStats, setLoadingStats] = useState(true);

  // Obtener el rol y nombre del usuario al cargar la página
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const role = data.user.id_rol;
            setUserRole(role);

            if (role === 9) {
              router.push('/visitante');
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
      }
    };
    fetchUserInfo();
  }, [router]);

  // Obtener estadísticas
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch("/api/statistics");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStatistics(data.statistics);
          }
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStatistics();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b3b60]">
      <HeaderAll showMenuButton={true} showBackButton={false} />

      {/* Contenido principal */}
      <main className="flex-1 bg-[#0b3b60] p-4 pb-0">
        <div className="max-w-6xl mx-auto flex flex-col min-h-full">
          {/* Mensaje de bienvenida */}
          <div className="flex-1 flex flex-col justify-center py-8">
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Archivo Digital
              </h1>
              <p className="text-lg lg:text-xl text-white/90 px-5">
                Bienvenido al sistema de gestión de archivos digitales
              </p>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full px-4">

              {/* Tarjeta de Documentos - Color #e67425 */}
              <div
                className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200"
                style={{
                  background: 'linear-gradient(to bottom right, #e67425, #b85a1d)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  {loadingStats && (
                    <svg
                      className="animate-spin h-8 w-8"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                </div>
                <div className="text-5xl font-bold mb-2">
                  {loadingStats ? '...' : statistics.documentos}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  Documentos
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Total en archivo digital
                </div>
              </div>
              
              {/* Tarjeta de Secretarías - Color #0076aa */}
              <div
                className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200"
                style={{
                  background: 'linear-gradient(to bottom right, #0076aa, #005580)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {loadingStats && (
                    <svg
                      className="animate-spin h-8 w-8"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                </div>
                <div className="text-5xl font-bold mb-2">
                  {loadingStats ? '...' : statistics.secretarias}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  Secretarías
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Registradas en el sistema
                </div>
              </div>

              {/* Tarjeta de Dependencias - Color #00ae6f */}
              <div
                className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200"
                style={{
                  background: 'linear-gradient(to bottom right, #00ae6f, #008a56)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  {loadingStats && (
                    <svg
                      className="animate-spin h-8 w-8"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                </div>
                <div className="text-5xl font-bold mb-2">
                  {loadingStats ? '...' : statistics.dependencias}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  Dependencias
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Total registradas
                </div>
              </div>

              {/* Tarjeta de Dependencias Activas - Color #df1783 */}
              {statistics.dependenciasActivas !== null && (
                <div
                  className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200"
                  style={{
                    background: 'linear-gradient(to bottom right, #df1783, #b01268)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {loadingStats && (
                      <svg
                        className="animate-spin h-8 w-8"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <div className="text-5xl font-bold mb-2">
                    {loadingStats ? '...' : statistics.dependenciasActivas}
                  </div>
                  <div className="text-white/90 text-lg font-semibold">
                    Dependencias Activas
                  </div>
                  <div className="text-white/70 text-sm mt-2">
                    Actualmente habilitadas
                  </div>
                </div>
              )}

              
            </div>


          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <ExitoFooter />
      </footer>
    </div>
  );
}
