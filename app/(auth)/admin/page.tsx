'use client';

import React, { useState, useEffect } from 'react';
import UsersTable from '@/components/UsersTable';
import PaginationControls from '@/components/PaginationControls';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { usePagination } from '@/hooks/usePagination';
import { PERMISOS } from '@/lib/permisos';

const USERS_PER_PAGE = 10;
type DependenciaOption = {
  id_dependencia?: number;
  nombre_dependencia: string;
};

const dependenciasCache = new Map<number, DependenciaOption[]>();
const dependenciasPendingRequests = new Map<number, Promise<DependenciaOption[]>>();

async function getDependenciasBySecretaria(secretariaId: number): Promise<DependenciaOption[]> {
  const cachedDependencias = dependenciasCache.get(secretariaId);
  if (cachedDependencias) {
    return cachedDependencias;
  }

  const pendingRequest = dependenciasPendingRequests.get(secretariaId);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = fetch(`/api/dependencias?secretariaId=${secretariaId}`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Error al cargar dependencias');
      }

      const data = (await response.json()) as {
        success?: boolean;
        dependencias?: DependenciaOption[];
        error?: string;
      };
      if (!data.success) {
        throw new Error(data.error || 'Error al cargar dependencias');
      }

      const dependencias = data.dependencias || [];
      dependenciasCache.set(secretariaId, dependencias);
      return dependencias;
    })
    .finally(() => {
      dependenciasPendingRequests.delete(secretariaId);
    });

  dependenciasPendingRequests.set(secretariaId, request);
  return request;
}

export default function AdminPage() {
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
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
  const [isAddUserByCurpOpen, setIsAddUserByCurpOpen] = useState(false);
  const [curpToLookup, setCurpToLookup] = useState('');
  const [isLookingUpCurp, setIsLookingUpCurp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserIdGeneral, setNewUserIdGeneral] = useState('');
  const [newUserNombre, setNewUserNombre] = useState('');
  const [newUserSecretaria, setNewUserSecretaria] = useState('');
  const [newUserDependencia, setNewUserDependencia] = useState('');
  const [newUserDependencias, setNewUserDependencias] = useState<DependenciaOption[]>([]);
  const [loadingNewUserDependencias, setLoadingNewUserDependencias] = useState(false);
  const [newUserRolId, setNewUserRolId] = useState<number | null>(null);

  const {
    users,
    roles,
    secretarias,
    loading,
    error,
    isAdmin,
    canEditSecretaria,
    updateUserRole,
    updateUserSecretaria,
    updateUserDependencia,
  } = useAdminUsers();
  const { currentItems, currentPage, totalPages, handlePageChange } = 
    usePagination(users, USERS_PER_PAGE);

  // Función helper para verificar permisos con ADMIN_TOTAL
  const hasPermission = (permission: string) => {
    return userPermissions.includes(PERMISOS.ADMIN_TOTAL) || userPermissions.includes(permission);
  };

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
    setNewUserIdGeneral('');
    setNewUserNombre('');
    setNewUserSecretaria('');
    setNewUserDependencia('');
    setNewUserDependencias([]);
    setLoadingNewUserDependencias(false);
    setNewUserRolId(null);
    setIsCreatingUser(false);
  };

  const closeAddUserByCurpModal = () => {
    setIsAddUserByCurpOpen(false);
    resetAddUserByCurpModal();
  };

  const getField = (value: unknown, field: string): unknown => {
    if (typeof value === 'object' && value !== null) {
      return (value as Record<string, unknown>)[field];
    }
    return undefined;
  };

  const extractCusFields = (raw: unknown) => {
    const root = getField(raw, 'data') ?? raw;
    const data = getField(root, 'data') ?? root;

    const idGeneralCandidate =
      getField(data, 'id_usuario_general') ??
      getField(data, 'id_general') ??
      getField(root, 'id_usuario_general') ??
      getField(root, 'id_general') ??
      '';

    const nombreCandidate =
      getField(data, 'nombre_completo') ??
      getField(data, 'nombre') ??
      getField(root, 'nombre_completo') ??
      getField(root, 'nombre') ??
      '';

    return {
      id_general: String(idGeneralCandidate || '').trim(),
      nombre_usuario: String(nombreCandidate || '').trim(),
    };
  };

  const handleLookupCurp = async () => {
    setLookupError(null);
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
        const details = data?.details ? `\n${String(data.details).slice(0, 1000)}` : '';
        throw new Error((data?.error || 'Error al consultar CURP') + details);
      }

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
    if (!newUserSecretaria) {
      setLookupError('Selecciona una secretaría');
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
          nom_secre: newUserSecretaria,
          nom_dependencia: newUserDependencia || undefined,
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

  useEffect(() => {
    let cancelled = false;

    const loadDependenciasForNewUser = async () => {
      if (!newUserSecretaria) {
        setNewUserDependencias([]);
        setNewUserDependencia('');
        setLoadingNewUserDependencias(false);
        return;
      }

      const secretaria = secretarias.find(
        (item) => item.nombre_secretaria === newUserSecretaria
      );

      if (!secretaria) {
        setNewUserDependencias([]);
        setNewUserDependencia('');
        setLoadingNewUserDependencias(false);
        return;
      }

      setLoadingNewUserDependencias(true);
      try {
        const dependencias = await getDependenciasBySecretaria(secretaria.id_secretaria);
        if (!cancelled) {
          setNewUserDependencias(dependencias);
          setNewUserDependencia((prev) =>
            dependencias.some((dep) => dep.nombre_dependencia === prev) ? prev : ''
          );
        }
      } catch (error) {
        console.error('Error al cargar dependencias para el nuevo usuario:', error);
        if (!cancelled) {
          setNewUserDependencias([]);
          setNewUserDependencia('');
        }
      } finally {
        if (!cancelled) {
          setLoadingNewUserDependencias(false);
        }
      }
    };

    loadDependenciasForNewUser();

    return () => {
      cancelled = true;
    };
  }, [newUserSecretaria, secretarias]);

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

  const handleSecretariaChange = async (userId: number, nomSecre: string | null) => {
    setUpdatingUserId(userId);
    try {
      await updateUserSecretaria(userId, nomSecre);
      showAlert('Secretaría actualizada exitosamente', 'success');
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error al actualizar la secretaría', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDependenciaChange = async (userId: number, nomDependencia: string) => {
    setUpdatingUserId(userId);
    try {
      await updateUserDependencia(userId, nomDependencia);
      showAlert('Dependencia actualizada exitosamente', 'success');
    } catch (error) {
      showAlert(error instanceof Error ? error.message : 'Error al actualizar la dependencia', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    showConfirm(
      `¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`,
      async () => {
        setDeletingUserId(userId);
        try {
          const response = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuarios: userId }),
          });

          const data = await response.json();
          if (!response.ok || !data?.success) {
            throw new Error(data?.error || 'Error al eliminar usuario');
          }

          showAlert('Usuario eliminado exitosamente', 'success', true);
        } catch (error) {
          showAlert(error instanceof Error ? error.message : 'Error al eliminar usuario', 'error');
        } finally {
          setDeletingUserId(null);
        }
      }
    );
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
        console.error('Error al cargar permisos del usuario:', error);
      }
    };

    loadUserPermissions();
  }, []);

  return (
    <div className="space-y-6 px-4 md:px-6">
      {/* Header Section */}
      <div className="bg-[#0076aa] rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-gray-300 mt-1">
              Administra usuarios del sistema, asigna roles, secretarías y dependencias.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddUserByCurpOpen(true)}
              disabled={!hasPermission(PERMISOS.EDITAR_USUARIOS)}
              className="rounded-lg bg-white text-[#0076aa] px-6 py-3 text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Añadir usuario
            </button>
            {isAdmin && (
              <button
                onClick={() => window.location.href = '/permisos'}
                className="rounded-lg bg-white text-[#0076aa] px-6 py-3 text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Permisos
              </button>
            )}
          </div>
          
        </div>
      </div>

      {/* Alert Section */}
      {(alertModal.message || error) && (
        <div className={`rounded-lg px-4 py-4 text-sm font-medium border-l-4 ${alertModal.type === 'error'
            ? "bg-red-50 border-red-500 text-red-700"
            : "bg-green-50 border-green-500 text-green-700"
          }`}>
          <div className="flex items-start gap-3">
            {alertModal.type === 'error' ? (
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414 1.414L11.414 10l1.293 1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span>{alertModal.message || error}</span>
          </div>
        </div>
      )}
      

      {/* Table Section */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 min-w-[180px]">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 min-w-[140px]">Rol</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 min-w-[200px]">Secretaría</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 min-w-[200px]">Dependencia</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 min-w-[80px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="max-w-sm animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="h-8 bg-gray-200 rounded-lg w-16 mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <UsersTable
          users={currentItems}
          roles={roles}
          secretarias={secretarias}
          isAdmin={isAdmin && hasPermission(PERMISOS.EDITAR_USUARIOS)}
          canEditSecretaria={canEditSecretaria && hasPermission(PERMISOS.EDITAR_USUARIOS)}
          updatingUserId={updatingUserId}
          deletingUserId={deletingUserId}
          onRoleChange={handleRoleChange}
          onSecretariaChange={handleSecretariaChange}
          onDependenciaChange={handleDependenciaChange}
          onDeleteUser={handleDeleteUser}
          canDeleteUsers={hasPermission(PERMISOS.ELIMINAR_USUARIOS)}
        />
      )}

      {/* Pagination */}
      {!loading && currentItems.length > 0 && (
        <div className="flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={users.length}
            itemsPerPage={USERS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modal para agregar usuario por CURP */}
      {isAddUserByCurpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0076aa] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Registrar nuevo usuario</h2>
                {/* <p className="text-blue-100 text-sm mt-1">Completa los datos del solicitante</p> */}
              </div>
              <button
                onClick={closeAddUserByCurpModal}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna izquierda: CURP y búsqueda */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CURP del solicitante
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={curpToLookup}
                        onChange={(e) => setCurpToLookup(e.target.value.toUpperCase())}
                        placeholder="Ej: ABCD123456EFGHJK01"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0076aa] focus:border-transparent"
                        disabled={isLookingUpCurp}
                      />
                      <button
                        onClick={handleLookupCurp}
                        disabled={isLookingUpCurp || !curpToLookup.trim()}
                        className="px-4 py-2 bg-[#0076aa] text-white rounded-lg hover:bg-[#005a85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0"
                      >
                        {isLookingUpCurp && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {isLookingUpCurp ? 'Buscando...' : 'Buscar'}
                      </button>
                    </div>
                  </div>

                  {lookupError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <p className="font-medium">{lookupError}</p>
                    </div>
                  )}

                  {newUserIdGeneral && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      <p className="font-medium">✅ Usuario encontrado: </p>
                      <p>{newUserNombre}</p>
                      <p className="text-sm mt-1">ID General: {newUserIdGeneral}</p>
                    </div>
                  )}
                </div>

                {/* Columna derecha: Formulario de registro */}
                {newUserIdGeneral && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol del usuario
                      </label>
                      <select
                        value={newUserRolId || ''}
                        onChange={(e) => setNewUserRolId(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0076aa] focus:border-transparent"
                      >
                        <option value="">Selecciona un rol</option>
                        {roles.map((role) => (
                          <option key={role.id_roles} value={role.id_roles}>
                            {role.rol}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secretaría
                      </label>
                      <select
                        value={newUserSecretaria}
                        onChange={(e) => {
                          setNewUserSecretaria(e.target.value);
                          setNewUserDependencia('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0076aa] focus:border-transparent"
                      >
                        <option value="">Selecciona una secretaría</option>
                        {secretarias.map((secretaria) => (
                          <option key={secretaria.id_secretaria} value={secretaria.nombre_secretaria}>
                            {secretaria.nombre_secretaria}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dependencia
                      </label>
                      <select
                        value={newUserDependencia}
                        onChange={(e) => setNewUserDependencia(e.target.value)}
                        disabled={!newUserSecretaria || loadingNewUserDependencias}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0076aa] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!newUserSecretaria
                            ? 'Selecciona primero una secretaría'
                            : loadingNewUserDependencias
                              ? 'Cargando dependencias...'
                              : 'Selecciona una dependencia'}
                        </option>
                        {newUserDependencias.map((dependencia) => (
                          <option
                            key={dependencia.id_dependencia ?? dependencia.nombre_dependencia}
                            value={dependencia.nombre_dependencia}
                          >
                            {dependencia.nombre_dependencia}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={closeAddUserByCurpModal}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateUserFromCurp}
                        disabled={isCreatingUser || !newUserRolId || !newUserSecretaria}
                        className="flex-1 px-4 py-2 bg-[#0076aa] text-white rounded-lg hover:bg-[#005a85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isCreatingUser && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {isCreatingUser ? 'Creando usuario...' : 'Crear usuario'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <div className={`flex items-center gap-3 mb-4 ${
              alertModal.type === 'success' ? 'text-green-600' :
              alertModal.type === 'error' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {alertModal.type === 'success' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {alertModal.type === 'error' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {alertModal.type === 'info' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p className={`font-medium ${
                alertModal.type === 'success' ? 'text-green-900' :
                alertModal.type === 'error' ? 'text-red-900' : 'text-blue-900'
              }`}>
                {alertModal.message}
              </p>
            </div>
            <button
              onClick={closeAlert}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-amber-900">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirm();
                }}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
