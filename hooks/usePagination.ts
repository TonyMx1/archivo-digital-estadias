import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll al inicio de la tabla
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    startIndex,
    endIndex,
    handlePageChange,
  };
}
