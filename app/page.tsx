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
            
            // Si el usuario es visitante (rol 9), redirigir a la página de visitante
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
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0076aa] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
                    strokeWidth={2}
                    d="M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2m-2 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7m4 4h6m-6 4h6"
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
                  <p className="text-white/70 text-xs">
                    {roleName}
                  </p>
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

      {/* Contenido principal con fondo oscuro */}
      <main className="flex-1 bg-[#0b3b60] p-4 pb-0">
        <div className="max-w-6xl mx-auto flex flex-col min-h-full">
          {/* Contenido - Mensaje de bienvenida */}
          <div className="flex-1 flex flex-col justify-center py-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Archivo Digital
              </h1>
              <p className="text-lg lg:text-xl text-white/90 px-5">
                Bienvenido al sistema de gestión de archivos digitales
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer  */}
      <footer>
        <ExitoFooter />
      </footer>
    </div>
  );
}