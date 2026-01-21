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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0076aa] text-white">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">NOMENCLATURA</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">Dependencias</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSecretarias.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No hay secretarías registradas
                </td>
              </tr>
            ) : (
              paginatedSecretarias.map((secretaria) => (
                <tr key={secretaria.id_secretaria} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {secretaria.id_secretaria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {secretaria.nombre_secretaria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {secretaria.sec_nomcl || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => openModal(secretaria)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#408740] to-[#00ae6f] text-white rounded-lg text-xs hover:opacity-90 transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#408740] focus:ring-opacity-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span className="font-medium">Ver</span>
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
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Anterior */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded text-sm ${currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Anterior
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {/* Primera página */}
              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className="px-1">...</span>}
                </>
              )}

              {/* Páginas alrededor de la actual */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${currentPage === pageNum
                        ? 'bg-[#0076aa] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Última página */}
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <span className="px-1">...</span>}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded text-sm ${currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Siguiente
            </button>
          </div>
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