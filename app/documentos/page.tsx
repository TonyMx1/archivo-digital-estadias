"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDocumentos, Documento } from "@/hooks/useDocumentos";
import { useSecretarias } from "@/hooks/useSecretarias";
import ExitoFooter from "@/components/ExitoFooter";
import DocumentosModal from "@/components/DocumentosModal";
import HeaderAll from "@/components/HeaderAll";

interface TipoDocumento {
  id_documento: number;
  nombre_documento: string;
}

export default function DocumentosPage() {
  const { documentos, loading, error, fetchDocumentos, eliminarDocumento } = useDocumentos();
  const { secretarias } = useSecretarias();
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null);

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroSecretaria, setFiltroSecretaria] = useState<number | "">("");
  const [filtroTipo, setFiltroTipo] = useState<number | "">("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("Activo");
  const [showFilters, setShowFilters] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isViewer = currentUserRole === 10;

  // Cargar tipos de documento
  useEffect(() => {
    const loadTiposDocumento = async () => {
      try {
        const response = await fetch('/api/tipo-documento');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTiposDocumento(data.tiposDocumento || []);
          }
        }
      } catch (error) {
        console.error('Error al cargar tipos de documento:', error);
      }
    };

    loadTiposDocumento();
  }, []);

  // Cargar rol del usuario actual
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
          setCurrentUserRole(data.user.id_rol);
        }
      } catch (error) {
        console.error("Error al obtener rol de usuario:", error);
      }
    };

    loadUserRole();
  }, []);

  // Cargar documentos
  useEffect(() => {
    const filters: any = {};
    if (filtroSecretaria) filters.id_secre = Number(filtroSecretaria);
    if (filtroTipo) filters.tipo_doc = Number(filtroTipo);
    if (filtroAnio) filters.anio_doc = filtroAnio;
    if (filtroEstatus) filters.estatus_doc = filtroEstatus;

    fetchDocumentos(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroSecretaria, filtroTipo, filtroAnio, filtroEstatus]);

  // Filtrar documentos por búsqueda
  const documentosFiltrados = documentos.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.nombre_doc?.toLowerCase().includes(query) ||
      doc.nombre_tipo_documento?.toLowerCase().includes(query) ||
      doc.nombre_secretaria?.toLowerCase().includes(query) ||
      doc.anio_doc?.includes(query) ||
      doc.oficio_doc?.toLowerCase().includes(query) ||
      doc.expediente_doc?.toLowerCase().includes(query)
    );
  });

  // Paginación
  const totalPages = Math.ceil(documentosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const documentosPaginados = documentosFiltrados.slice(startIndex, endIndex);

  const handleNuevoDocumento = () => {
    setEditingDocumento(null);
    setModalOpen(true);
  };

  const handleEditarDocumento = (documento: Documento) => {
    setEditingDocumento(documento);
    setModalOpen(true);
  };

  const handleEliminarDocumento = async (idDoc: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este documento?")) {
      return;
    }

    const motivoBaja = prompt("Ingrese el motivo de la baja (opcional):");
    const result = await eliminarDocumento(idDoc, motivoBaja || undefined);

    if (result.success) {
      alert("Documento eliminado exitosamente");
    } else {
      alert(result.error || "Error al eliminar documento");
    }
  };

  const handleCloseModal = () => {
  setModalOpen(false);
  setEditingDocumento(null);
};

// ✅ NUEVA FUNCIÓN: Se ejecuta solo cuando se guarda exitosamente
const handleDocumentoGuardado = () => {
  // Recargar con los filtros actuales
  const filters: any = {};
  if (filtroSecretaria) filters.id_secre = Number(filtroSecretaria);
  if (filtroTipo) filters.tipo_doc = Number(filtroTipo);
  if (filtroAnio) filters.anio_doc = filtroAnio;
  if (filtroEstatus) filters.estatus_doc = filtroEstatus;
  
  console.log('✅ Recargando documentos después de guardar...');
  fetchDocumentos(filters);
};



  const limpiarFiltros = () => {
    setFiltroSecretaria("");
    setFiltroTipo("");
    setFiltroAnio("");
    setFiltroEstatus("Activo");
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (loading && documentos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b3b60]">
        <div className="flex flex-col items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
          <br></br>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa]"></div>
        </div>
      </div>
    );
  }

  if (error && documentos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b3b60] p-4">
        <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            ⬅️ Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b3b60] flex flex-col">
      <HeaderAll showMenuButton={true} />

      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Barra de búsqueda y filtros */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Búsqueda */}
              <div className="flex-1 w-full flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Búsqueda"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
                />
              </div>

              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span>Filtros</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                  />
                </svg>
              </button>

              {/* Botón Nuevo documento */}
              {!isViewer && (
                <button
                  onClick={handleNuevoDocumento}
                  className="px-4 py-2 bg-gradient-to-r from-[#00ae6f] to-[#408740] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#408740]/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 whitespace-nowrap"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  Nuevo documento
                </button>
              )}
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secretaría
                  </label>
                  <select
                    value={filtroSecretaria}
                    onChange={(e) => {
                      setFiltroSecretaria(e.target.value ? Number(e.target.value) : "");
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm"
                  >
                    <option value="">Todas</option>
                    {secretarias.map((sec) => (
                      <option key={sec.id_secretaria} value={sec.id_secretaria}>
                        {sec.nombre_secretaria}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => {
                      setFiltroTipo(e.target.value ? Number(e.target.value) : "");
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm"
                  >
                    <option value="">Todos</option>
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo.id_documento} value={tipo.id_documento}>
                        {tipo.nombre_documento}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input
                    type="text"
                    value={filtroAnio}
                    onChange={(e) => {
                      setFiltroAnio(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Ej: 2024"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estatus
                  </label>
                  <select
                    value={filtroEstatus}
                    onChange={(e) => {
                      setFiltroEstatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Archivado">Archivado</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grid de tarjetas de documentos */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-[#0b3b60] mb-6 pl-2">
              DOCUMENTOS
            </h2>

            {documentosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg">No hay documentos registrados</p>
                <p className="text-sm mt-2">Haz clic en "Nuevo documento" para agregar uno</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documentosPaginados.map((documento) => (
                    <div
                      key={documento.id_doc}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      {/* Icono y título */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-[#0076aa] bg-opacity-10 rounded-lg flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-[#0076aa]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#0b3b60] text-lg mb-1 truncate">
                            {documento.nombre_doc}
                          </h3>
                          {documento.confidencial_doc && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Confidencial
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Información del documento */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-semibold">Tipo:</span>
                          <span className="truncate">{documento.nombre_tipo_documento || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-semibold">Secretaría:</span>
                          <span className="truncate">{documento.nombre_secretaria || "-"}</span>
                        </div>
                        {documento.anio_doc && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-semibold">Año:</span>
                            <span>{documento.anio_doc}</span>
                          </div>
                        )}
                        {documento.fecha_doc && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-semibold">Fecha:</span>
                            <span>{new Date(documento.fecha_doc).toLocaleDateString('es-MX')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-600">Estatus:</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${documento.estatus_doc === "Activo"
                                ? "bg-green-100 text-green-800"
                                : documento.estatus_doc === "Inactivo"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {documento.estatus_doc || "Activo"}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        {documento.url_cons_doc && (
                          <a
                            href={documento.url_cons_doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Ver Archivo
                          </a>
                        )}

                        {/* Botón para abrir el modal (Ver detalles para visor, Editar para otros) */}
                        <button
                          onClick={() => handleEditarDocumento(documento)}
                          className="flex-1 px-3 py-2 bg-[#0076aa] text-white text-sm font-semibold rounded-lg hover:bg-[#005a85] transition-colors"
                        >
                          {isViewer ? "Detalles" : "Editar"}
                        </button>

                        {!isViewer && (
                          <button
                            onClick={() => documento.id_doc && handleEliminarDocumento(documento.id_doc)}
                            className="px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {startIndex + 1} - {Math.min(endIndex, documentosFiltrados.length)} de{" "}
                      {documentosFiltrados.length} documentos
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 font-semibold rounded-lg transition-colors ${currentPage === page
                              ? "bg-[#0076aa] text-white"
                              : "bg-white text-[#0b3b60] border-2 border-[#0b3b60] hover:bg-gray-50"
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <ExitoFooter />

      {/* Modal de documentos */}
      <DocumentosModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleDocumentoGuardado}
        documento={editingDocumento}
        isEditing={!!editingDocumento}
        isReadOnly={isViewer}
      />
    </div>
  );
}
