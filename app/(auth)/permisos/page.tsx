'use client';

import React, { useState, useEffect } from 'react';
import { PERMISOS } from '@/lib/permisos';

interface RolConPermisos {
  id_rol: number;
  nombre_rol: string;
  permisos: string[];
}

// Skeleton component para roles
function RolesSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function RolesPage() {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [rolesConPermisos, setRolesConPermisos] = useState<RolConPermisos[]>([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [selectedRol, setSelectedRol] = useState<number | null>(null);
  const [updatingPermiso, setUpdatingPermiso] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isOpen: boolean;
    reloadOnClose?: boolean;
  }>({ message: '', type: 'info', isOpen: false, reloadOnClose: false });
  const [alertVisible, setAlertVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    isOpen: boolean;
    onConfirm: () => void;
  }>({ message: '', isOpen: false, onConfirm: () => {} });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  const showAlert = (message: string, type: 'success' | 'error' | 'info', reloadOnClose = false) => {
    setAlertModal({ message, type, isOpen: true, reloadOnClose });
    setAlertVisible(false);
    setTimeout(() => setAlertVisible(true), 100);
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

  const resetAddRoleModal = () => {
    setNewRoleName('');
    setShowAddRoleForm(false);
  };

  const loadPermisosRoles = async () => {
    setLoadingPermisos(true);
    try {
      const response = await fetch('/api/admin/roles');
      let data: { success?: boolean; roles?: RolConPermisos[]; error?: string } | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.error || `Error al cargar roles y permisos (HTTP ${response.status})`);
      }

      if (data?.success) {
        setRolesConPermisos(data.roles || []);
      } else {
        throw new Error(data?.error || 'Error al cargar roles y permisos');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar roles y permisos';
      console.error('Error al cargar roles y permisos:', message);
      showAlert(message, 'error');
    } finally {
      setLoadingPermisos(false);
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
        setRolesConPermisos(prev => 
          prev.map(rol => 
            rol.id_rol === idRol 
              ? { ...rol, permisos: data.permisos || [] }
              : rol
          )
        );
        showAlert(
          tienePermiso 
            ? 'Permiso desactivado exitosamente' 
            : 'Permiso activado exitosamente', 
          'success'
        );
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

  const getPermisosPorCategoria = () => {
    const todosLosPermisos = Object.values(PERMISOS);
    const categorias: { [key: string]: string[] } = {};

    todosLosPermisos.forEach(permiso => {
      const categoria = permiso.split('_')[0];
      if (!categorias[categoria]) {
        categorias[categoria] = [];
      }
      categorias[categoria].push(permiso);
    });

    return categorias;
  };

  const getRolBadgeColor = (idRol: number) => {
    switch (idRol) {
      case 1:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-green-100 text-green-800';
      case 4:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolBadgeLabel = (idRol: number) => {
    switch (idRol) {
      case 1:
        return 'ADMIN TOTAL';
      case 2:
        return 'SUPERUSUARIO';
      case 3:
        return 'OPERADOR';
      case 4:
        return 'CONSULTOR';
      default:
        return 'SIN ROL';
    }
  };

  // Función helper para verificar permisos con ADMIN_TOTAL
  const hasPermission = (permission: string) => {
    return userPermissions.includes(PERMISOS.ADMIN_TOTAL) || userPermissions.includes(permission);
  };

  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserPermissions(data.user.permisos || []);
          }
        }
      } catch (error) {
        console.error('Error al cargar permisos del usuario:', error);
      }
    };

    loadUserPermissions();
    loadPermisosRoles();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f4f7fb] to-[#e9f0f8] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl border border-[#d1e5f0] overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-[#0076aa] to-[#005a85] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-center text-2xl font-bold text-white ">Gestión de Roles y Permisos</h1>
                {/* <p className="text-blue-100 text-sm mt-1">Administra los roles del sistema y sus permisos asignados</p> */}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Botón para agregar nuevo rol */}
            <div className="mb-6 flex justify-between items-center">
              {/* <h2 className="text-xl font-semibold text-gray-800">Roles del Sistema</h2> */}
              <button
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2 px-4 py-2 bg-[#0076aa] text-white rounded-lg hover:bg-[#005a85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Volver a Usuarios
              </button>
            </div>

            {/* Tabla de Roles y Permisos */}
            <div className="relative overflow-x-auto bg-[#f4f7fb] shadow-xs rounded-base border border-default">
              <table className="w-full text-sm text-left rtl:text-right text-body">
                <thead className="text-sm bg-[#0b3b60] text-white border-b rounded-base border-default">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">ID</th>
                    <th scope="col" className="px-6 py-3 font-medium">Nombre del Rol</th>
                    <th scope="col" className="px-6 py-3 font-medium">Permisos Asignados</th>
                    {/* <th scope="col" className="px-6 py-3 font-medium">Tipo</th> */}
                    <th scope="col" className="px-6 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPermisos ? (
                    <RolesSkeleton />
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
                          {/* <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getRolBadgeColor(rol.id_rol)}`}>
                              {getRolBadgeLabel(rol.id_rol)}
                            </span>
                          </td> */}
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
          </div>
        </div>

        {/* Modal para agregar nuevo rol */}
        {showAddRoleForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Agregar Nuevo Rol</h3>
                <button
                  onClick={resetAddRoleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Nombre del rol"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0076aa] focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={resetAddRoleModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddRole}
                  disabled={isSubmittingRole}
                  className="flex-1 px-4 py-2 bg-[#0076aa] text-white rounded-lg hover:bg-[#005a85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmittingRole && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isSubmittingRole ? 'Guardando...' : 'Guardar'}
                </button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                )}
                {alertModal.type === 'error' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                )}
                {alertModal.type === 'info' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
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
      </div>
    </div>
  );
}
