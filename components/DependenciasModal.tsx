"use client";

import { useEffect, useState } from "react";
import { useDependencias, Dependencia } from "@/hooks/useDependencias";
import { usePermisos } from "@/hooks/usePermisos";
import { PERMISOS } from "@/lib/permisos";

interface DependenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
  secretariaId: number;
  secretariaNombre: string;
}

export default function DependenciasModal({
  isOpen,
  onClose,
  secretariaId,
  secretariaNombre,
}: DependenciasModalProps) {
  const {
    dependencias,
    loading,
    error,
    fetchDependencias,
    agregarDependencia,
    actualizarDependencia,
    toggleEstadoDependencia,
  } = useDependencias(secretariaId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [nombreDependencia, setNombreDependencia] = useState("");
  const [nomenclaturaDependencia, setNomenclaturaDependencia] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [editingDependencia, setEditingDependencia] =
    useState<Dependencia | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editNomenclatura, setEditNomenclatura] = useState("");

  // Estados para modales
  const [alertModal, setAlertModal] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isOpen: boolean;
  }>({ message: '', type: 'info', isOpen: false });

  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    isOpen: boolean;
    onConfirm: () => void;
  }>({ message: '', isOpen: false, onConfirm: () => { } });

  // Estados para animación de modales
  const [alertVisible, setAlertVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Animación para modal de alerta
  useEffect(() => {
    if (alertModal.isOpen) {
      const frame = requestAnimationFrame(() => setAlertVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setAlertVisible(false);
    }
  }, [alertModal.isOpen]);

  // Animación para modal de confirmación
  useEffect(() => {
    if (confirmModal.isOpen) {
      const frame = requestAnimationFrame(() => setConfirmVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setConfirmVisible(false);
    }
  }, [confirmModal.isOpen]);
  
  // Usar el nuevo sistema de permisos
  const { hasPermission, loading: loadingPermisos } = usePermisos();
  const esAdminTotal = hasPermission(PERMISOS.ADMIN_TOTAL);
  const puedeCrear = esAdminTotal || hasPermission(PERMISOS.CREAR_DEPENDENCIAS);
  const puedeEditar = esAdminTotal || hasPermission(PERMISOS.EDITAR_DEPENDENCIAS);

  useEffect(() => {
    if (isOpen && secretariaId) {
      fetchDependencias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, secretariaId]);

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // Funciones para manejar modales
  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertModal({ message, type, isOpen: true });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ message, isOpen: true, onConfirm });
  };

  const closeAlert = () => {
    setAlertModal({ message: '', type: 'info', isOpen: false });
  };

  const closeConfirm = () => {
    setConfirmModal({ message: '', isOpen: false, onConfirm: () => { } });
  };


  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreDependencia.trim() || !nomenclaturaDependencia.trim()) {
      showAlert("Por favor ingresa nombre y nomenclatura de la dependencia", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await agregarDependencia({
      id_secretaria: secretariaId,
      nombre_dependencia: nombreDependencia.trim(),
      dep_nomcl: nomenclaturaDependencia.trim(),
    });

    if (result.success) {
      setNombreDependencia("");
      setNomenclaturaDependencia("");
      setShowAddForm(false);
      showAlert("Dependencia agregada exitosamente", "success");
    } else {
      showAlert(result.error || "Error al agregar dependencia", "error");
    }
    setIsSubmitting(false);
  };

  const handleEditar = (dependencia: Dependencia) => {
    setEditingDependencia(dependencia);
    setEditNombre(dependencia.nombre_dependencia || "");
    setEditNomenclatura(dependencia.dep_nomcl || "");
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDependencia?.id_dependencia) {
      return;
    }
    if (!editNombre.trim() || !editNomenclatura.trim()) {
      showAlert("Por favor ingresa nombre y nomenclatura de la dependencia", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await actualizarDependencia({
      id_dependencia: editingDependencia.id_dependencia,
      nombre_dependencia: editNombre.trim(),
      dep_nomcl: editNomenclatura.trim(),
    });

    if (result.success) {
      setEditingDependencia(null);
      setEditNombre("");
      setEditNomenclatura("");
      showAlert("Dependencia actualizada exitosamente", "success");
    } else {
      showAlert(result.error || "Error al actualizar dependencia", "error");
    }
    setIsSubmitting(false);
  };

  const handleToggleEstado = async (idDependencia: number, activoActual: boolean) => {
    const accion = activoActual ? 'desactivar' : 'activar';
    showConfirm(
      `¿Estás seguro de que deseas ${accion} esta dependencia?`,
      async () => {
        const nuevoEstado = !activoActual;
        const result = await toggleEstadoDependencia(idDependencia, nuevoEstado);
        if (result.success) {
          showAlert(`Dependencia ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`, "success");
        } else {
          showAlert(result.error || `Error al ${accion} dependencia`, "error");
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col transform transition-all duration-200 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
      >
        {/* Header del modal */}
        <div className="bg-[#0076aa] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Dependencias</h2>
            <p className="text-sm text-white/90">{secretariaNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-[#005a85] rounded-lg p-2 transition-colors"
            aria-label="Cerrar"
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

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Botón para agregar */}
          {puedeCrear && !showAddForm && (
            <div className="mb-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#00ae6f] text-white font-semibold rounded-lg hover:bg-[#408740] transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Agregar Dependencia
              </button>
            </div>
          )}

          {/* Formulario para agregar */}
          {puedeCrear && showAddForm && (
            <form
              onSubmit={handleAgregar}
              className="mb-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nombreDependencia}
                  onChange={(e) => setNombreDependencia(e.target.value)}
                  placeholder="Nombre de la dependencia"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
           bg-white text-gray-800
           placeholder:text-gray-500! placeholder:opacity-100!
           focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={nomenclaturaDependencia}
                  onChange={(e) => setNomenclaturaDependencia(e.target.value)}
                  placeholder="Nomenclatura"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
           bg-white text-gray-800
           placeholder:!text-gray-500 placeholder:!opacity-100
           focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNombreDependencia("");
                    setNomenclaturaDependencia("");
                  }}
                  className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {puedeEditar && editingDependencia && (
            <form
              onSubmit={handleActualizar}
              className="mb-4 p-4 bg-blue-50 rounded-lg"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  placeholder="Nombre de la dependencia"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
           bg-white text-gray-800
           placeholder:!text-gray-500 placeholder:!opacity-100
           focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={editNomenclatura}
                  onChange={(e) => setEditNomenclatura(e.target.value)}
                  placeholder="Nomenclatura"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
           bg-white text-gray-800
           placeholder:!text-gray-500 placeholder:!opacity-100
           focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDependencia(null);
                    setEditNombre("");
                    setEditNomenclatura("");
                  }}
                  className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Tabla de dependencias */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa] mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando dependencias...</p>
            </div>
          ) : dependencias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay dependencias registradas para esta secretaría
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0076aa] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase w-6/12">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase w-2/12">Nomenclatura</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase w-2/12">Estado</th>
                    {puedeEditar && (
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase w-2/12">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dependencias.map((dependencia) => {
                    const estaActiva = dependencia.activo !== false;
                    return (
                      <tr
                        key={dependencia.id_dependencia}
                        className={`hover:bg-gray-50 ${!estaActiva ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 break-words min-w-[300px]">
                          {dependencia.nombre_dependencia}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dependencia.dep_nomcl || "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${estaActiva
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {estaActiva ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        {puedeEditar && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-center min-w-[200px]">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditar(dependencia)}
                                className="px-2 py-1 bg-[#408740] text-white text-xs font-semibold rounded hover:bg-[#336b33] transition-colors disabled:opacity-50"
                                disabled={loading || !estaActiva}
                                title={!estaActiva ? 'Debe estar activa para editar' : 'Editar'}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleEstado(dependencia.id_dependencia!, estaActiva)
                                }
                                className={`px-2 py-1 text-xs font-semibold rounded transition-colors disabled:opacity-50 ${estaActiva
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                disabled={loading}
                              >
                                {estaActiva ? 'Desactivar' : 'Activar'}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Alerta */}
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
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  alertModal.type === 'success' ? 'bg-green-100' :
                  alertModal.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    alertModal.type === 'success' ? 'text-green-800' :
                    alertModal.type === 'error' ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {alertModal.type === 'success' ? 'Éxito' :
                     alertModal.type === 'error' ? 'Error' : 'Información'}
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{alertModal.message}</p>
              <button
                onClick={closeAlert}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  alertModal.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  alertModal.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
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
    </div>
  );
}
