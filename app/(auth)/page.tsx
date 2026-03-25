"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function HomePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<number | null>(null);

  // Estado para estadísticas
  const [statistics, setStatistics] = useState({
    secretarias: 0,
    dependencias: 0,
    dependenciasActivas: null as number | null,
    documentos: 0, // Nuevo campo
    archivosPrestadosActivos: 0,
    documentosPorSecretaria: [] as Array<{id_secretaria: number, nombre_secretaria: string, total_documentos: number}>
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
    <div className="max-w-6xl mx-auto flex flex-col min-h-full">
      {/* Mensaje de bienvenida */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="text-center space-y-4 mb-12">
          {/* <h1 className="text-3xl lg:text-4xl font-bold text-[#0b3b60]">
            Archivo Digital
          </h1> */}
          <p className="font-bold text-lg lg:text-xl text-[#0b3b60]/90 px-5">
            Bienvenido al sistema de gestión de archivos digitales
          </p>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto w-full px-4">
          {loadingStats ? (
            <>
              {/* Mostrar 5 esqueletos durante la carga */}
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {/* Tarjeta de Documentos - Color #e67425 */}
              <button
                onClick={() => router.push('/documentos')}
                className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200 text-left"
                style={{
                  background: '#e67425'
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
                </div>
                <div className="text-5xl font-bold mb-2">
                  {statistics.documentos}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  Documentos
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Total en archivo digital
                </div>
              </button>

              {/* Tarjeta de Archivos Prestados Activos - Color #faa21b */}
              <button
                onClick={() => router.push('/prestamo')}
                className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200 text-left"
                style={{
                  background: '#faa21b'
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />

                  </svg>
                </div>
                <div className="text-5xl font-bold mb-2">
                  {statistics.archivosPrestadosActivos}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  Archivos Prestados
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Actualmente activos
                </div>
              </button>
              {/* Tarjeta de Secretarías - Color #0b3b60 */}
              <button
                onClick={() => router.push('/secretarias')}
                className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200 text-left"
                style={{
                  background: '#0b3b60'
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
                </div>
                <div className="text-5xl font-bold mb-2">
                  {statistics.secretarias}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  Secretarías
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Registradas en el sistema
                </div>
              </button>

              {/* Tarjeta de Dependencias - Color #408740 */}
              <div
                className="rounded-xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-200"
                style={{
                  background: '#408740'
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
                </div>
                <div className="text-5xl font-bold mb-2">
                  {statistics.dependencias}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  Dependencias
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Registradas
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
                  </div>
                  <div className="text-5xl font-bold mb-2">
                    {statistics.dependenciasActivas}
                  </div>
                  <div className="text-white/90 text-lg font-semibold">
                    Dependencias Activas
                  </div>
                  <div className="text-white/70 text-sm mt-2">
                    Actualmente habilitadas
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Estadísticas por Secretaría */}
        {!loadingStats && statistics.documentosPorSecretaria.length > 0 && (
          <div className="mt-12 max-w-6xl mx-auto w-full px-4">
            <h2 className="text-2xl font-bold text-[#0b3b60] mb-6 text-center">
              Documentos por Secretaría
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.documentosPorSecretaria.map((secretaria) => (
                <div
                  key={secretaria.id_secretaria}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg mb-1">
                        {secretaria.nombre_secretaria}
                      </h3>
                      <p className="text-3xl font-bold text-[#0076aa]">
                        {secretaria.total_documentos}
                      </p>
                      <p className="text-sm text-gray-600">
                        documento{secretaria.total_documentos !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-[#0076aa] opacity-20">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

