'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface HeaderAllProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;

  pageTitle?: string;
  pageSubtitle?: string;
  showLogo?: boolean;
  showMenuButton?: boolean;
}

const HeaderAll: React.FC<HeaderAllProps> = ({
  showBackButton = true,
  backHref = "/",
  backText = "Volver",

  pageTitle = "Sistema de gestión de archivos digitales",
  pageSubtitle = "Administración documental electrónica",
  showLogo = true,
  showMenuButton = false,
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserName(data.user.nombre_usuario);
            setRoleName(data.user.nombre_rol);
            setRoleId(data.user.id_rol);
          }
        }
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-profile-menu="container"]')) return;
      setIsProfileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

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

  const menuItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: (
        <svg className="w-5 h-5"
          fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/documentos',
      label: 'Documentos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/secretarias',
      label: 'Secretarías',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  if (roleId === 1 || roleId === 2) {
    menuItems.splice(2, 0, {
      href: '/admin',
      label: 'Administración',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    });
  }

  return (
    <>
      {/* Menú lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#0076aa] shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col flex-center h-full">
          {/* Encabezado del menú */}
          <div className="bg-[#0076aa] px-4 py-5">
            <div className="flex flex-col items-center gap-3">
              <div className="text-center">
                {/* <h2 className="text-white font-bold text-sm">Archivo Digital</h2> */}

              </div>
              {/* <Image
                src="/legado.png"
                alt="SJR Legado de Bien Común"
                width={140}
                height={140}
                className="object-contain"
                priority
              /> */}
              <p className="text-white/70 text-xs">Menú de navegación</p>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4 text-white p-2 hover:bg-[#005a85] rounded-lg transition-colors"
                aria-label="Cerrar menú"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido del menú */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer del menú */}
          <div className="border-t border-[#005a85] pt-4 mt-auto p-4">
            {/* Información del usuario */}
            {(userName || roleName) && (
              <div className="mb-4 pb-4 border-b border-[#005a85]">
                {userName && (
                  <div className="flex flex-row items-center gap-2 mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-7 h-7 text-white flex-shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    <p className="text-white font-medium text-sm">
                      {userName}
                    </p>
                  </div>
                )}
                {roleName && (
                  <p className="text-white/70 text-sm pl-7">{roleName}</p>
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

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[55]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-[#0076aa] shadow-md w-full sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Botón hamburguesa */}
            {showMenuButton && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 hover:bg-[#005a85] rounded-lg transition-colors flex-shrink-0"
                aria-label="Menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Botón Volver
            {!showMenuButton && showBackButton && (
              <Link
                href={backHref}
                className="flex items-center gap-2 text-white px-3 py-2 rounded-md hover:bg-[#005a85] transition-colors duration-200 flex-shrink-0"
                aria-label={backText}
              >
                <span className="text-lg"><Image src="/volver-flecha.png" alt="Arrow Left" width={25} height={25} /></span>
                <span className="font-medium text-sm sm:text-base">{backText}</span>
              </Link>
            )} */}



            {/* Logo + Título */}
            <div className="flex items-center justify-center gap-3 flex-1 min-w-0">
              {showLogo && (
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logo_2.png"
                    alt="Logo del Sistema"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    priority={true}
                  />
                </div>
              )}

              <div className={`text-center ${showLogo ? 'sm:text-left' : 'text-center'} min-w-0`}>
                <h1 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <p className="text-white/70 text-xs sm:text-sm hidden sm:block truncate">
                    {pageSubtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="w-16 flex-shrink-0 flex justify-end" data-profile-menu="container">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="text-white p-2 hover:bg-[#005a85] rounded-lg transition-colors"
                  aria-label="Menú de usuario"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  {/* <Image
                    src="/icons/user-circle.svg"
                    alt='User'
                    width={20}
                    height={20}
                    className='w-8 h-8'
                  /> */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9"
                  >
                    <circle
                      opacity="0.5"
                      cx="12"
                      cy="9"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      opacity="0.5"
                      d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-black/10 overflow-hidden"
                    role="menu"
                  >
                    {(userName || roleName) && (
                      <div className="px-4 py-3 border-b border-black/10">
                        {userName && (
                          <p className="text-sm font-semibold text-[#0b3b60] whitespace-normal break-words">
                            {userName}
                          </p>
                        )}
                        {roleName && (
                          <p className="text-xs text-black/60 whitespace-normal break-words">
                            {roleName}
                          </p>
                        )}
                      </div>


                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="w-full px-4 py-3 text-left text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      role="menuitem"
                    >
                      {isLoggingOut ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
                )}
              </div>
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderAll;
