import { useState } from 'react';
import DependenciasModal from '@/components/DependenciasModal';

type Secretaria = {
  id_secretaria: number;
  nombre_secretaria: string;
  sec_nomcl: string | null;
};

type SecretariasTableProps = {
  secretarias: Secretaria[];
  loading?: boolean;
};

const TableRowSkeleton = () => (
  <tr>
    {[1, 2, 3, 4].map((col) => (
      <td key={col} className="px-6 py-3">
        <div className="h-4 w-full max-w-30 animate-pulse rounded bg-gray-200" />
      </td>
    ))}
  </tr>
);

export default function SecretariasTable({
  secretarias,
  loading = false,
}: SecretariasTableProps) {
  const [selectedSecretaria, setSelectedSecretaria] =
    useState<Secretaria | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = secretarias.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSecretarias = secretarias.slice(startIndex, endIndex);

  const openModal = (secretaria: Secretaria) => {
    setSelectedSecretaria(secretaria);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSecretaria(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header tabla + selector */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">
            {/* Secretarías */}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[5, 10, secretarias.length].map((num) => (
                <option key={num} value={num}>
                  {num === secretarias.length ? 'Todos' : num}
                </option>
              ))}
            </select>
            <span>por página</span>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 text-right">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Nombre
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Nomenclatura
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 text-center">
                  Ver
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : paginatedSecretarias.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No hay secretarías registradas
                  </td>
                </tr>
              ) : (
                paginatedSecretarias.map((secretaria, index) => (
                  <tr
                    key={secretaria.id_secretaria}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-6 py-3 text-sm text-gray-700 text-right">
                      {secretaria.id_secretaria}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {secretaria.nombre_secretaria}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {secretaria.sec_nomcl || 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      <button
                        type="button"
                        onClick={() => openModal(secretaria)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#408740] text-white rounded-lg text-sm font-medium hover:bg-[#367335] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#408740] focus:ring-offset-2"
                        aria-label={`Ver dependencias de ${secretaria.nombre_secretaria}`}
                      >
                        Ver Dependencias
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: info y paginación */}
        <div className="flex flex-col gap-3 px-6 py-3 border-t bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            {totalItems === 0 ? (
              '0 secretarías'
            ) : (
              <>
                Mostrando{' '}
                <span className="font-medium">
                  {startIndex + 1}
                </span>{' '}
                -{' '}
                <span className="font-medium">
                  {Math.min(endIndex, totalItems)}
                </span>{' '}
                de{' '}
                <span className="font-medium">
                  {totalItems}
                </span>{' '}
                secretarías
              </>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              {/* Botón Anterior */}
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                  }`}
                aria-label="Página anterior"
              >
                Anterior
              </button>

              {/* Números de página (simple, todos los números) */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => goToPage(pageNum)}
                    disabled={currentPage === pageNum}
                    className={`min-w-10 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum
                        ? 'bg-linear-to-r from-[#0076aa] to-[#005a87] text-white shadow-md cursor-default'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-[#0076aa] hover:text-[#0076aa]'
                      }`}
                    aria-label={`Ir a página ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              {/* Botón Siguiente */}
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                  }`}
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedSecretaria && (
        <DependenciasModal
          isOpen={isModalOpen}
          onClose={closeModal}
          secretariaId={selectedSecretaria.id_secretaria}
          secretariaNombre={selectedSecretaria.nombre_secretaria}
        />
      )}
    </>
  );
}