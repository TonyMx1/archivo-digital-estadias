'use client';

import { useState } from 'react';
import ExitoFooter from '@/components/ExitoFooter';
import AdminMenu from '@/components/AdminMenu';
import AdminHeader from '@/components/AdminHeader';
import UsersTable from '@/components/UsersTable';
import PaginationControls from '@/components/PaginationControls';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { usePagination } from '@/hooks/usePagination';

const USERS_PER_PAGE = 10;

export default function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  
  const { users, roles, loading, error, isAdmin, updateUserRole } = useAdminUsers();
  const { currentItems, currentPage, totalPages, startIndex, endIndex, handlePageChange } = 
    usePagination(users, USERS_PER_PAGE);

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRoleId);
      alert('Rol actualizado exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar el rol');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-[#0b3b60] relative overflow-x-hidden">
      <AdminMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Contenedor principal que se desplaza cuando el menú está abierto */}
      <div
        className={`flex flex-col min-h-screen w-full transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-80" : "translate-x-0"
        }`}
      >
        <AdminHeader 
          isMenuOpen={isMenuOpen} 
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
        />

        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <UsersTable
              users={currentItems}
              roles={roles}
              isAdmin={isAdmin}
              updatingUserId={updatingUserId}
              onRoleChange={handleRoleChange}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={users.length}
              itemsPerPage={USERS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        </main>

        <ExitoFooter />
      </div>
    </div>
  );
}
