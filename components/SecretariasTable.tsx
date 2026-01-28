import { useState } from 'react';
import DependenciasModal from '@/components/DependenciasModal';

type Secretaria = {
  id_secretaria: number;
  nombre_secretaria: string;
  sec_nomcl: string | null;
};

type SecretariasTableProps = {
  secretarias: Secretaria[];
};

export default function SecretariasTable({ secretarias }: SecretariasTableProps) {
  const [selectedSecretaria, setSelectedSecretaria] = useState<Secretaria | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Puedes cambiar a 5 si prefieres

  const openModal = (secretaria: Secretaria) => {
    setSelectedSecretaria(secretaria);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSecretaria(null);
  };

  // Calcular datos paginados
  const totalPages = Math.ceil(secretarias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSecretarias = secretarias.slice(startIndex, endIndex);

  // Manejar cambio de página
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Resetear a la primera página
  };

  return (
    <>
      {/* Selector de items por página - COMENTADO */}
      {/*
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">resultados por página</span>
        </div>
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1} - {Math.min(endIndex, secretarias.length)} de {secretarias.length} secretarías
        </div>
      </div>
      */}

      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="w-full table-auto">
          <thead className="bg-gradient-to-r from-[#0076aa] to-[#005a87] text-white">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Nomenclatura
              </th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                VER
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSecretarias.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="text-sm font-medium">No hay secretarías registradas</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSecretarias.map((secretaria, index) => (
                <tr
                  key={secretaria.id_secretaria}
                  className={`
              hover:bg-blue-50 transition-colors duration-150 
              ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            `}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {secretaria.id_secretaria}
                  </td>
                  <td className="px-6 py-4 text-base text-gray-700">
                    {secretaria.nombre_secretaria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {secretaria.sec_nomcl || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => openModal(secretaria)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#408740] to-[#00ae6f] text-white rounded-lg text-sm font-medium hover:from-[#367335] hover:to-[#009960] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#408740] focus:ring-offset-2"
                      aria-label={`Ver dependencias de ${secretaria.nombre_secretaria}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>Ver Dependencias</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-200 pt-4">
          {/* Información de página */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Página {currentPage}</span>
            <span>de</span>
            <span className="font-medium text-gray-900">{totalPages}</span>
          </div>

          {/* Controles de navegación */}
          <nav className="flex items-center gap-2" aria-label="Paginación">
            {/* Botón Anterior */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                }
        `}
              aria-label="Página anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  disabled={currentPage === pageNum}
                  className={`
              min-w-[40px] h-[40px] rounded-lg text-sm font-medium
              transition-all duration-200
              ${currentPage === pageNum
                      ? 'bg-gradient-to-r from-[#0076aa] to-[#005a87] text-white shadow-md cursor-default'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-[#0076aa] hover:text-[#0076aa]'
                    }
            `}
                  aria-label={`Ir a página ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                }
        `}
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}

      <DependenciasModal
        isOpen={isModalOpen}
        onClose={closeModal}
        secretariaId={selectedSecretaria?.id_secretaria ?? 0}
        secretariaNombre={selectedSecretaria?.nombre_secretaria ?? ''}
      />
    </>
  );
}