'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ExitoFooter from '@/components/ExitoFooter';

interface Role {
  id_roles: number;
  rol: string;
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar permisos y cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener rol del usuario actual
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          router.push('/');
          return;
        }

        const userData = await userResponse.json();
        if (!userData.success) {
          router.push('/');
          return;
        }

        const role = userData.user.id_rol;
        setCurrentUserRole(role);

        // Solo administrador (1) y superusuario (2) pueden ver esta página
        if (role !== 1 && role !== 2) {
          router.push('/');
          return;
        }

        // Cargar roles
        const adminResponse = await fetch('/api/admin/users');
        if (!adminResponse.ok) {
          setError('No tienes permisos para acceder a esta página');
          setLoading(false);
          return;
        }

        const adminData = await adminResponse.json();
        if (adminData.success) {
          setRoles(adminData.roles);
        } else {
          setError('Error al cargar los datos');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      alert('Por favor ingresa un nombre para el rol');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rol: newRoleName.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Agregar el nuevo rol a la lista
        setRoles([...roles, { id_roles: data.id, rol: newRoleName.trim() }]);
        setNewRoleName('');
        setShowAddRoleForm(false);
        alert('Rol agregado exitosamente');
      } else {
        alert('Error al agregar el rol: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al agregar rol:', error);
      alert('Error al agregar el rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#0b3b60] text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Menú lateral deslizante desde la izquierda */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0076aa] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          {/* Encabezado del menú */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Menú</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white p-2 hover:bg-[#005a85] rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido del menú */}
          <div className="flex-1 space-y-4">
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 bg-[#0b3b60] text-white font-semibold rounded-lg hover:bg-[#094d73] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all shadow-lg text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Usuarios</span>
            </Link>
            
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 bg-[#0b3b60] text-white font-semibold rounded-lg hover:bg-[#094d73] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all shadow-lg text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenedor principal que se desplaza cuando el menú está abierto */}
      <div
        className={`flex flex-col min-h-screen w-full transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-80" : "translate-x-0"
        }`}
      >
        {/* Header con fondo #0076aa */}
        <header className="bg-[#0076aa] shadow-md w-full sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Botón hamburguesa (visible en todas las pantallas) */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 hover:bg-[#005a85] rounded-lg transition-colors"
                aria-label="Menú"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {/* Logo y texto */}
              <div className="flex items-center gap-3 flex-1 justify-center">
                <div className="w-12 h-12 flex-shrink-0">
                  <Image
                    src="/logo_white.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                    priority={true}
                  />
                </div>
                <p className="text-white text-xs sm:text-base md:text-lg font-medium">
                  Sistema de gestión de archivos digitales
                </p>
              </div>

              {/* Espaciador para mantener el botón hamburguesa a la izquierda */}
              <div className="w-12"></div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Información de roles - Ahora en formato de lista */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0b3b60]">Roles Disponibles</h2>
                <button
                  onClick={() => setShowAddRoleForm(true)}
                  className="px-4 py-2 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all shadow-lg flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Agregar Rol</span>
                </button>
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:border-transparent transition-all text-gray-900 bg-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
                    />
                    <button
                      onClick={handleAddRole}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Agregando...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Agregar</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRoleForm(false);
                        setNewRoleName('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {roles.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No hay roles disponibles
                </div>
              ) : (
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div 
                      key={role.id_roles} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Número del rol */}
                        <div className="flex items-center justify-center w-8 h-8 bg-[#0b3b60] text-white rounded-full text-sm font-semibold">
                          {role.id_roles}
                        </div>
                        
                        {/* Nombre del rol */}
                        <div>
                          <p className="font-semibold text-gray-900">{role.rol}</p>
                        </div>
                      </div>
                      
                      {/* Etiqueta del tipo de rol */}
                      <div>
                        {role.id_roles === 1 && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            Administrador
                          </span>
                        )}
                        {role.id_roles === 2 && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            Superusuario
                          </span>
                        )}
                        {role.id_roles === 7 && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            Usuario Regular
                          </span>
                        )}
                        {role.id_roles === 9 && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Visitante
                          </span>
                        )}
                        {![1, 2, 7, 9].includes(role.id_roles) && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                            Rol Personalizado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <ExitoFooter />
      </div>
    </div>
  );
}