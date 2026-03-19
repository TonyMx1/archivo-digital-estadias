'use client';

import React, { useState, useEffect } from 'react';
import UsersTable from '@/components/UsersTable';
import PaginationControls from '@/components/PaginationControls';
import ErrorState from '@/components/ErrorState';
import { useAdminUsers, Role } from '@/hooks/useAdminUsers';
import { usePagination } from '@/hooks/usePagination';
import { PERMISOS } from '@/lib/permisos';

const USERS_PER_PAGE = 10;

// Lista de todos los permisos disponibles para asignar
const TODOS_LOS_PERMISOS = Object.values(PERMISOS);

interface RolConPermisos {
  id_rol: number;
  nombre_rol: string;
  permisos: string[];
}

export default function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles'>('usuarios');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [alertModal, setAlertModal] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isOpen: boolean;
    reloadOnClose?: boolean;
  }>({ message: '', type: 'info', isOpen: false, reloadOnClose: false });
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    isOpen: boolean;
    onConfirm: () => void;
  }>({ message: '', isOpen: false, onConfirm: () => {} });
  const [alertVisible, setAlertVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isAddUserByCurpOpen, setIsAddUserByCurpOpen] = useState(false);
  const [curpToLookup, setCurpToLookup] = useState('');
  const [isLookingUpCurp, setIsLookingUpCurp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupRawData, setLookupRawData] = useState<any>(null);
  const [newUserIdGeneral, setNewUserIdGeneral] = useState('');
  const [newUserNombre, setNewUserNombre] = useState('');
  const [newUserRolId, setNewUserRolId] = useState<number | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  // Estado para gestión de roles y permisos
  const [rolesConPermisos, setRolesConPermisos] = useState<RolConPermisos[]>([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [selectedRol, setSelectedRol] = useState<number | null>(null);
  const [updatingPermiso, setUpdatingPermiso] = useState<string | null>(null);
  
  // Estado para agregar nuevo rol
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  
  const { users, roles, loading, error, isAdmin, updateUserRole } = useAdminUsers();
  const { currentItems, currentPage, totalPages, handlePageChange } = 
    usePagination(users, USERS_PER_PAGE);

  // Función helper para verificar permisos con ADMIN_TOTAL
  const hasPermission = (permission: string) => {
    return userPermissions.includes(PERMISOS.ADMIN_TOTAL) || userPermissions.includes(permission);
  };

  useEffect(() => {
    if (alertModal.isOpen) {
      const frame = requestAnimationFrame(() => setAlertVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setAlertVisible(false);
  }, [alertModal.isOpen]);

  useEffect(() => {
    if (confirmModal.isOpen) {
      const frame = requestAnimationFrame(() => setConfirmVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setConfirmVisible(false);
  }, [confirmModal.isOpen]);

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info', reloadOnClose = false) => {
    setAlertModal({ message, type, isOpen: true, reloadOnClose });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ message, isOpen: true, onConfirm });
  };

  const closeAlert = () => {
    const shouldReload = Boolean(alertModal.reloadOnClose);
    setAlertModal({ message: '', type: 'info', isOpen: false, reloadOnClose: false });
    if (shouldReload) {
      window.location.reload();
    }
  };

  const closeConfirm = () => {
    setConfirmModal({ message: '', isOpen: false, onConfirm: () => {} });
  };

  const resetAddUserByCurpModal = () => {
    setCurpToLookup('');
    setIsLookingUpCurp(false);
    setLookupError(null);
    setLookupRawData(null);
    setNewUserIdGeneral('');
    setNewUserNombre('');
    setNewUserRolId(null);
    setIsCreatingUser(false);
  };

  const closeAddUserByCurpModal = () => {
    setIsAddUserByCurpOpen(false);
    resetAddUserByCurpModal();
  };

  const extractCusFields = (raw: any) => {
    const root = raw?.data ?? raw;
    const data = root?.data ?? root;

    const idGeneralCandidate =
      data?.id_usuario_general ??
      data?.id_general ??
      root?.id_usuario_general ??
      root?.id_general ??
      '';

    const nombreCandidate =
      data?.nombre_completo ??
      data?.nombre ??
      root?.nombre_completo ??
      root?.nombre ??
      '';

    return {
      id_general: String(idGeneralCandidate || '').trim(),
      nombre_usuario: String(nombreCandidate || '').trim(),
    };
  };

  const handleLookupCurp = async () => {
    setLookupError(null);
    setLookupRawData(null);
    setNewUserIdGeneral('');
    setNewUserNombre('');

    const curp = curpToLookup.trim().toUpperCase();
    if (!curp) {
      setLookupError('Ingresa una CURP');
      return;
    }

    setIsLookingUpCurp(true);
    try {
      const response = await fetch('/api/cus/curp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ curp }),
      });

      const data = await response.json();
      if (!response.ok) {
        setLookupRawData(data);
        const details = data?.details ? `\n${String(data.details).slice(0, 1000)}` : '';
        throw new Error((data?.error || 'Error al consultar CURP') + details);
      }

      setLookupRawData(data?.data ?? data);
      const extracted = extractCusFields(data?.data ?? data);
      setNewUserIdGeneral(extracted.id_general);
      setNewUserNombre(extracted.nombre_usuario);

      // Default role: 9 (visitante) si existe, si no el primero
      const defaultRole = roles.find(r => r.id_roles === 9) || roles[0];
      setNewUserRolId(defaultRole ? defaultRole.id_roles : null);
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Error al consultar CURP');
    } finally {
      setIsLookingUpCurp(false);
    }
  };

  const handleCreateUserFromCurp = async () => {
    setLookupError(null);
    const curp = curpToLookup.trim().toUpperCase();

    if (!curp) {
      setLookupError('CURP es requerida');
      return;
    }
    if (!newUserIdGeneral.trim()) {
      setLookupError('id_general es requerido');
      return;
    }
    if (!newUserRolId) {
      setLookupError('Selecciona un rol');
      return;
    }

    setIsCreatingUser(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          curp,
          id_general: newUserIdGeneral.trim(),
          nombre_usuario: newUserNombre.trim() || undefined,
          id_rol: newUserRolId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Error al crear usuario');
      }

      showAlert('Usuario agregado exitosamente', 'success', true);
      closeAddUserByCurpModal();
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Error al crear usuario');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Cargar permisos del usuario actual
  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const response = await fetch("/api/user/permisos");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserPermissions(data.permisos || []);
          }
        }
      } catch (error) {
        console.error("Error al cargar permisos:", error);
      }
    };

    loadUserPermissions();
  }, []);

  // Función para eliminar usuario
  const handleDeleteUser = async (userId: number, userName: string) => {
    showConfirm(
      `¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`,
      async () => {
        setDeletingUserId(userId);
        try {
          const response = await fetch(`/api/admin/users`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_usuarios: userId }),
          });

          if (response.ok) {
            showAlert('Usuario eliminado exitosamente', 'success', true);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar usuario');
          }
        } catch (error) {
          showAlert(error instanceof Error ? error.message : 'Error al eliminar usuario', 'error');
        } finally {
          setDeletingUserId(null);
        }
      }
    );
  };

  // Cargar permisos de todos los roles
  const loadPermisosRoles = async () => {
    setLoadingPermisos(true);
    try {
      // Cargar permisos para cada rol
      const permisosPromises = roles.map(async (rol) => {
        const response = await fetch(`/api/admin/permisos?id_rol=${rol.id_roles}`);
        if (response.ok) {
          const data = await response.json();
          return {
            id_rol: rol.id_roles,
            nombre_rol: rol.rol,
            permisos: data.permisos?.map((p: { nombre_permiso: string }) => p.nombre_permiso) || [],
          };
        }
        return {
          id_rol: rol.id_roles,
          nombre_rol: rol.rol,
          permisos: [],
        };
      });

      const resultados = await Promise.all(permisosPromises);
      setRolesConPermisos(resultados);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    } finally {
      setLoadingPermisos(false);
    }
  };

  useEffect(() => {
    if (roles.length > 0 && activeTab === 'roles') {
      loadPermisosRoles();
    }
  }, [roles, activeTab]);

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRoleId);
      showAlert('Rol actualizado exitosamente', 'success');
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error al actualizar el rol', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleTogglePermiso = async (idRol: number, nombrePermiso: string, tienePermiso: boolean) => {
    setUpdatingPermiso(nombrePermiso);
    try {
      const method = tienePermiso ? 'DELETE' : 'POST';
      const response = await fetch('/api/admin/permisos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rol: idRol, nombre_permiso: nombrePermiso }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Actualizar estado local
        setRolesConPermisos(prev => prev.map(rol => {
          if (rol.id_rol === idRol) {
            return {
              ...rol,
              permisos: tienePermiso
                ? rol.permisos.filter(p => p !== nombrePermiso)
                : [...rol.permisos, nombrePermiso],
            };
          }
          return rol;
        }));
      } else {
        showAlert(data.error || 'Error al actualizar permiso', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
      showAlert('Error al actualizar permiso', 'error');
    } finally {
      setUpdatingPermiso(null);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      showAlert('Por favor ingresa un nombre para el rol', 'error');
      return;
    }

    setIsSubmittingRole(true);
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: newRoleName.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Agregar el nuevo rol a la lista de roles con permisos
        setRolesConPermisos(prev => [...prev, {
          id_rol: data.id,
          nombre_rol: newRoleName.trim(),
          permisos: [],
        }]);
        setNewRoleName('');
        setShowAddRoleForm(false);
        showAlert('Rol agregado exitosamente', 'success', true);
        // Recargar la página para actualizar la lista de roles
      } else {
        showAlert('Error al agregar el rol: ' + (data.error || 'Error desconocido'), 'error');
      }
    } catch (error) {
      console.error('Error al agregar rol:', error);
      showAlert('Error al agregar el rol', 'error');
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const getRolBadgeColor = (idRol: number) => {
    switch (idRol) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 7: return 'bg-blue-100 text-blue-800';
      case 9: return 'bg-green-100 text-green-800';
      case 10: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolBadgeLabel = (idRol: number) => {
    switch (idRol) {
      case 1: return 'Administrador';
      case 2: return 'Superusuario';
      case 7: return 'Usuario Regular';
      case 9: return 'Visitante';
      case 10: return 'Visor';
      default: return 'Rol Personalizado';
    }
  };

  // Agrupar permisos por categoría
  const getPermisosPorCategoria = () => {
    const categorias: Record<string, string[]> = {
      'Visualización': TODOS_LOS_PERMISOS.filter(p => p.startsWith('ver_')),
      'Edición': TODOS_LOS_PERMISOS.filter(p => p.startsWith('editar_')),
      'Creación': TODOS_LOS_PERMISOS.filter(p => p.startsWith('crear_')),
      'Eliminación': TODOS_LOS_PERMISOS.filter(p => p.startsWith('eliminar_')),
      'Otros': TODOS_LOS_PERMISOS.filter(p => 
        !p.startsWith('ver_') && 
        !p.startsWith('editar_') && 
        !p.startsWith('crear_') && 
        !p.startsWith('eliminar_')
      ),
    };
    return categorias;
  };

  // Skeleton components
  const UserTableSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const RolesSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden animate-pulse">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return <ErrorState error={error} />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Tabs de navegación */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
                    activeTab === 'usuarios'
                      ? 'bg-[#0b3b60] text-primary'
                      : 'bg-[#0076aa] text-white hover:bg-[#005a85]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Usuarios
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
                    activeTab === 'roles'
                      ? 'bg-[#0b3b60] text-primary'
                      : 'bg-[#0076aa] text-white hover:bg-[#005a85]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Roles y Permisos
                  </div>
                </button>
              </div>

              {activeTab === 'usuarios' && hasPermission(PERMISOS.EDITAR_USUARIOS) && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsAddUserByCurpOpen(true)}
                    className="px-4 py-2 bg-[#00ae6f] text-white font-semibold rounded-lg hover:bg-[#408740] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Añadir usuario por CURP
                  </button>
                </div>
              )}
            </div>

            {/* Contenido de la pestaña Usuarios */}
            {activeTab === 'usuarios' && (
              <>
                {loading ? (
                  <UserTableSkeleton />
                ) : (
                  <>
                    <UsersTable
                      users={currentItems}
                      roles={roles}
                      isAdmin={isAdmin}
                      updatingUserId={updatingUserId}
                      deletingUserId={deletingUserId}
                      onRoleChange={handleRoleChange}
                      onDeleteUser={handleDeleteUser}
                      canDeleteUsers={hasPermission(PERMISOS.ELIMINAR_USUARIOS)}
                    />

                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={users.length}
                      itemsPerPage={USERS_PER_PAGE}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </>
            )}

            {isAddUserByCurpOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
                  <div className="bg-[#0076aa] text-white px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Añadir usuario por CURP</h2>
                      <p className="text-sm text-white/90">Consulta la CUS y registra en el sistema</p>
                    </div>
                    <button
                      onClick={closeAddUserByCurpModal}
                      className="text-white hover:bg-[#005a85] rounded-lg p-2 transition-colors"
                      aria-label="Cerrar"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {lookupError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {lookupError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={curpToLookup}
                        onChange={(e) => setCurpToLookup(e.target.value)}
                        placeholder="CURP"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:!text-gray-500 placeholder:!opacity-100 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                        disabled={isLookingUpCurp || isCreatingUser}
                      />
                      <button
                        onClick={handleLookupCurp}
                        disabled={isLookingUpCurp || isCreatingUser}
                        type="button"
                        className="px-4 py-2 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLookingUpCurp && (
                          <svg
                            className="w-5 h-5 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              d="M4 12a8 8 0 018-8"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                        {isLookingUpCurp ? 'Consultando...' : 'Consultar'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">ID General</label>
                        <input
                          type="text"
                          value={newUserIdGeneral}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
               bg-gray-100 text-gray-500 cursor-not-allowed 
               focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={newUserNombre}
                          readOnly
                          onChange={(e) => setNewUserNombre(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
               bg-gray-100 text-gray-500 cursor-not-allowed 
               focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                          disabled={isCreatingUser}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Asignar Rol</label>
                        <select
                          value={newUserRolId ?? ''}
                          onChange={(e) => setNewUserRolId(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0076aa] text-sm text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isCreatingUser}
                        >
                          <option value="" disabled>Selecciona un rol</option>
                          {roles.map((role) => (
                            <option key={role.id_roles} value={role.id_roles}>
                              {role.rol}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {lookupRawData && (
                      <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-700">Ver respuesta del CUS</summary>
                        <pre className="mt-2 text-xs text-gray-700 overflow-auto max-h-60">{JSON.stringify(lookupRawData, null, 2)}</pre>
                      </details>
                    )}

                    <div className="flex gap-3 justify-end pt-2">
                      {/* <button
                        onClick={closeAddUserByCurpModal}
                        disabled={isCreatingUser || isLookingUpCurp}
                        className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button> */}
                      <button
                        onClick={handleCreateUserFromCurp}
                        disabled={isCreatingUser || isLookingUpCurp}
                        className="px-4 py-2 bg-[#00ae6f] text-white font-semibold rounded-lg hover:bg-[#408740] transition-colors disabled:opacity-50"
                      >
                        {isCreatingUser ? 'Guardando...' : 'Agregar usuario'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {alertModal.isOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
                <div
                  className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${
                    alertVisible
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 translate-y-2"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          alertModal.type === 'success'
                            ? 'bg-green-100'
                            : alertModal.type === 'error'
                              ? 'bg-red-100'
                              : 'bg-blue-100'
                        }`}
                      >
                        {alertModal.type === 'success' ? (
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        ) : alertModal.type === 'error' ? (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold ${
                            alertModal.type === 'success'
                              ? 'text-green-800'
                              : alertModal.type === 'error'
                                ? 'text-red-800'
                                : 'text-blue-800'
                          }`}
                        >
                          {alertModal.type === 'success'
                            ? 'Éxito'
                            : alertModal.type === 'error'
                              ? 'Error'
                              : 'Información'}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">{alertModal.message}</p>
                    <button
                      onClick={closeAlert}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        alertModal.type === 'success'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : alertModal.type === 'error'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {confirmModal.isOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
                <div
                  className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${
                    confirmVisible
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 translate-y-2"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Confirmar Acción</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={closeConfirm}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          confirmModal.onConfirm();
                          closeConfirm();
                        }}
                        className="flex-1 px-4 py-2 bg-[#0076aa] text-white font-medium rounded-lg hover:bg-[#005a85] transition-colors"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido de la pestaña Roles y Permisos */}
            {activeTab === 'roles' && (
              <div className="relative overflow-x-auto bg-[#f4f7fb] shadow-xs rounded-base border border-default">
                <table className="w-full text-sm text-left rtl:text-right text-body">
                  <thead className="text-sm bg-[#0b3b60] text-white border-b rounded-base border-default">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">ID</th>
                      <th scope="col" className="px-6 py-3 font-medium">Nombre del Rol</th>
                      <th scope="col" className="px-6 py-3 font-medium">Permisos Asignados</th>
                      <th scope="col" className="px-6 py-3 font-medium">Tipo</th>
                      <th scope="col" className="px-6 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPermisos ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8">
                          <RolesSkeleton />
                        </td>
                      </tr>
                    ) : rolesConPermisos.length === 0 ? (
                      <tr className="bg-[#f4f7fb] border-b border-default">
                        <td colSpan={5} className="px-6 py-4 text-center">
                          No hay roles disponibles
                        </td>
                      </tr>
                    ) : (
                      rolesConPermisos.map((rol) => (
                        <React.Fragment key={rol.id_rol}>
                          <tr
                            className="bg-[#f4f7fb] border-b border-default hover:bg-[#e9f0f8] transition-colors"
                          >
                            <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                              {rol.id_rol}
                            </th>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{rol.nombre_rol}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-[#0076aa] text-white rounded text-xs font-semibold">
                                {rol.permisos.length} permisos
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getRolBadgeColor(rol.id_rol)}`}>
                                {getRolBadgeLabel(rol.id_rol)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedRol(selectedRol === rol.id_rol ? null : rol.id_rol)}
                                className="px-3 py-1 bg-[#0076aa] text-white rounded text-sm font-medium hover:bg-[#005a85] transition-colors flex items-center gap-2"
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${selectedRol === rol.id_rol ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                {selectedRol === rol.id_rol ? 'Ocultar' : 'Gestionar'} Permisos
                              </button>
                            </td>
                          </tr>
                          
                          {/* Fila expandida con permisos */}
                          {selectedRol === rol.id_rol && (
                            <tr className="bg-[#e9f0f8]">
                              <td colSpan={5} className="px-6 py-4">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-[#0076aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
                                    </svg>
                                    <p className="text-sm text-gray-600 font-medium">
                                      Activa o desactiva los permisos para el rol: <span className="font-bold text-[#0076aa]">{rol.nombre_rol}</span>
                                    </p>
                                  </div>
                                  
                                  {Object.entries(getPermisosPorCategoria()).map(([categoria, permisos]) => (
                                    permisos.length > 0 && (
                                      <div key={categoria} className="bg-white rounded-lg p-4 border border-gray-200">
                                        <h4 className="font-semibold text-[#0b3b60] mb-3 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
                                          {categoria}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {permisos.map((permiso) => {
                                            const tienePermiso = rol.permisos.includes(permiso);
                                            const isUpdating = updatingPermiso === permiso;
                                            
                                            return (
                                              <label
                                                key={permiso}
                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                  tienePermiso
                                                    ? 'bg-green-50 border-green-300 hover:bg-green-100'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                } ${isUpdating ? 'opacity-50' : ''}`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={tienePermiso}
                                                  onChange={() => handleTogglePermiso(rol.id_rol, permiso, tienePermiso)}
                                                  disabled={isUpdating}
                                                  className="w-4 h-4 text-[#0076aa] rounded focus:ring-[#0076aa] focus:ring-2"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">
                                                  {permiso.replace(/_/g, ' ')}
                                                </span>
                                                {isUpdating && (
                                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0076aa] ml-auto"></div>
                                                )}
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  );
}
