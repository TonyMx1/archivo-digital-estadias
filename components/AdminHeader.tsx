import Image from 'next/image';

interface AdminHeaderProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export default function AdminHeader({ isMenuOpen, onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="bg-[#0076aa] shadow-md w-full sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Botón hamburguesa */}
          <button
            onClick={onMenuToggle}
            className="text-white p-2 hover:bg-[#005a85] rounded-lg transition-colors"
            aria-label="Menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Logo y texto */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-12 h-12 flex-shrink-0">
              <Image
                src="/logo_white.png"
                alt="Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority={true}
              />
            </div>
            <p className="text-white text-xs sm:text-base md:text-lg font-medium">
              Sistema de gestión de archivos digitales
            </p>
          </div>

          {/* Espaciador para mantener el botón hamburguesa a la izquierda */}
          <div className="w-20"></div>
        </div>
      </div>
    </header>
  );
}
