import Link from 'next/link';

interface AdminMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminMenu({ isOpen, onClose }: AdminMenuProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0076aa] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full p-6 overflow-y-auto">
        {/* Encabezado del menú */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Menú</h2>
          <button
            onClick={onClose}
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
        <div className="flex-1 space-y-4">
          <Link
            href="/"
            onClick={onClose}
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
