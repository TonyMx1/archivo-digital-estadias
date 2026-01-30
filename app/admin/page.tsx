'use client';

import { useState, useEffect } from 'react';
import ExitoFooter from '@/components/ExitoFooter';
// import AdminMenu from '@/components/AdminMenu';
// import AdminHeader from '@/components/AdminHeader';
import HeaderAll from '@/components/HeaderAll';
import UsersTable from '@/components/UsersTable';
import PaginationControls from '@/components/PaginationControls';
import LoadingState from '@/components/LoadingState';
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
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

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
        alert('Usuario eliminado exitosamente');
        // Recargar la página para actualizar la lista
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar usuario');
    } finally {
      setDeletingUserId(null);
    }
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
      alert('Rol actualizado exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar el rol');
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
        alert(data.error || 'Error al actualizar permiso');
      }
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
      alert('Error al actualizar permiso');
    } finally {
      setUpdatingPermiso(null);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      alert('Por favor ingresa un nombre para el rol');
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
        alert('Rol agregado exitosamente');
        // Recargar la página para actualizar la lista de roles
        window.location.reload();
      } else {
        alert('Error al agregar el rol: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al agregar rol:', error);
      alert('Error al agregar el rol');
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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-[#0b3b60] relative overflow-x-hidden">
      <HeaderAll showMenuButton={true} />

        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Tabs de navegación */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
                  activeTab === 'usuarios'
                    ? 'bg-white text-[#0b3b60]'
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
                    ? 'bg-white text-[#0b3b60]'
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

            {/* Contenido de la pestaña Usuarios */}
            {activeTab === 'usuarios' && (
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

            {/* Contenido de la pestaña Roles y Permisos */}
            {activeTab === 'roles' && (
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#0b3b60]">Gestión de Roles y Permisos</h2>
                  {/* <button
                    onClick={() => setShowAddRoleForm(true)}
                    className="px-4 py-2 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] transition-all shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Rol
                  </button> */}
                </div>

                {/* Formulario para agregar nuevo rol */}
                {showAddRoleForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Nuevo Rol</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="Nombre del nuevo rol"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b2e2] text-gray-900 bg-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
                      />
                      <button
                        onClick={handleAddRole}
                        disabled={isSubmittingRole}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmittingRole ? 'Agregando...' : 'Agregar'}
                      </button>
                      <button
                        onClick={() => { setShowAddRoleForm(false); setNewRoleName(''); }}
                        className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {loadingPermisos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa] mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando permisos...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Lista de roles */}
                    {rolesConPermisos.map((rol) => (
                      <div key={rol.id_rol} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header del rol */}
                        <button
                          onClick={() => setSelectedRol(selectedRol === rol.id_rol ? null : rol.id_rol)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#0b3b60] text-white rounded-full text-sm font-semibold">
                              {rol.id_rol}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">{rol.nombre_rol}</p>
                              <p className="text-sm text-gray-500">{rol.permisos.length} permisos asignados</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRolBadgeColor(rol.id_rol)}`}>
                              {getRolBadgeLabel(rol.id_rol)}
                            </span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${selectedRol === rol.id_rol ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Panel de permisos expandible */}
                        {selectedRol === rol.id_rol && (
                          <div className="p-4 border-t border-gray-200 bg-white">
                            <p className="text-sm text-gray-600 mb-4">
                              Activa o desactiva los permisos para este rol. Los cambios se aplican inmediatamente.
                            </p>
                            
                            {Object.entries(getPermisosPorCategoria()).map(([categoria, permisos]) => (
                              permisos.length > 0 && (
                                <div key={categoria} className="mb-4">
                                  <h4 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                                    {categoria}
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {permisos.map((permiso) => {
                                      const tienePermiso = rol.permisos.includes(permiso);
                                      const isUpdating = updatingPermiso === permiso;
                                      
                                      return (
                                        <label
                                          key={permiso}
                                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                            tienePermiso
                                              ? 'bg-green-50 border-green-300'
                                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                          } ${isUpdating ? 'opacity-50' : ''}`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={tienePermiso}
                                            onChange={() => handleTogglePermiso(rol.id_rol, permiso, tienePermiso)}
                                            disabled={isUpdating}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
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
                        )}
                      </div>
                    ))}

                    {rolesConPermisos.length === 0 && !loadingPermisos && (
                      <div className="text-center py-8 text-gray-500">
                        No hay roles disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <ExitoFooter />
      </div>
    
  );
}
