import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderAllProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  showLogo?: boolean;
}

const HeaderAll: React.FC<HeaderAllProps> = ({
  showBackButton = true,
  backHref = "/",
  backText = "Volver",
  pageTitle = "Sistema de gestión de archivos digitales",
  pageSubtitle = "Administración documental electrónica",
  showLogo = true,
}) => {
  return (
    <header className="bg-[#0076aa] shadow-md w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Botón Volver - Izquierda (condicional) */}
          {showBackButton && (
            <Link
              href={backHref}
              className="flex items-center gap-2 text-white px-3 py-2 rounded-md hover:bg-[#005a85] transition-colors duration-200 flex-shrink-0"
              aria-label={backText}
            >
              <span className="text-lg"><Image src="/volver-flecha.png" alt="Arrow Left" width={25} height={25} /></span>
              <span className="font-medium text-sm sm:text-base">{backText}</span>
            </Link>
          )}

          {/* Espacio si no hay botón de volver */}
          {!showBackButton && <div className="w-24"></div>}

          {/* Logo + Título - Centro */}
          <div className="flex items-center justify-center gap-3 flex-1 min-w-0">
            {showLogo && (
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo_white.png"
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

          {/* Espacio Derecho - Para balance (se puede reemplazar con acciones) */}
          <div className="w-16 flex-shrink-0">
            {/* Aquí puedes agregar íconos de usuario, notificaciones, etc. */}
            {/* <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
              <span className="text-xl">👤</span>
            </button> */}
          </div>

        </div>
      </div>
    </header>
  );
};

export default HeaderAll;