interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationControlsProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="w-full mt-8 border-t border-gray-200 pt-4">
      {/* Información de paginación y estado */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-gray-900">{totalItems}</span>
        </div>
        <div className="text-sm text-gray-600">
          Página <span className="font-semibold text-[#0076aa]">{Math.max(1, currentPage)}</span> de <span className="font-semibold">{Math.max(1, totalPages)}</span>
        </div>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] transition-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Anterior
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar solo algunas páginas alrededor de la actual
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-none ${
                      currentPage === page
                        ? 'bg-[#0076aa] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] transition-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
