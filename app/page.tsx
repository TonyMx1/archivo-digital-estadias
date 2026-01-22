"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import HomeHeader from "@/components/HomeHeader";
import ExitoFooter from "@/components/ExitoFooter";

export default function HomePage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);

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
            setUserName(data.user.nombre_usuario);
            setRoleName(data.user.nombre_rol);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
      } else {
        alert("Error al cerrar sesión");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b3b60]">
      <HomeHeader
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menú lateral deslizante desde la izquierda */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0076aa] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          {/* Encabezado del menú */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Menú</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white p-2 hover:bg-[#005a85] rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido del menú */}
          <div className="flex-1">
            {/* Botón para acceder a Documentos */}
            <div className="mb-6">
              <Link
                href="/documentos"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-[#0b3b60] text-white font-semibold rounded-lg hover:bg-[#094d73] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all shadow-lg text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Documentos</span>
              </Link>
            </div>

            {/* Enlace de administración (solo para administrador o superusuario) */}
            {(userRole === 1 || userRole === 2) && (
              <div className="mb-6">
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 bg-[#0b3b60] text-white font-semibold rounded-lg hover:bg-[#094d73] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all shadow-lg text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                  <span>Administración</span>
                </Link>
              </div>
            )}

            <div className="mb-6">
              <Link
                href="/secretarias"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-[#0b3b60] text-white font-semibold rounded-lg hover:bg-[#094d73] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all shadow-lg text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                  />
                </svg>
                <span>Secretarías</span>
              </Link>
            </div>
          </div>

          {/* Información del usuario y botón de cerrar sesión al final del menú */}
          <div className="border-t border-[#005a85] pt-4 mt-auto">
            {/* Información del usuario */}
            {(userName || roleName) && (
              <div className="mb-4 pb-4 border-b border-[#005a85]">
                {userName && (
                  <p className="text-white font-medium text-sm mb-1">
                    {userName}
                  </p>
                )}
                {roleName && (
                  <p className="text-white/70 text-sm">{roleName}</p>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoggingOut ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                  <span>Cerrando...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Cerrar sesión</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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
