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
  const itemsPerPage = 6;
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
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-[#0076aa]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z"
                      clipRule="evenodd"
                    />
                    <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 break-words">DOCUMENTOS</h2>
                  {/* <p className="text-gray-600 text-sm">Gestión documental del sistema</p> */}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {documentosFiltrados.length} documentos
                </p>
                <p className="text-sm text-gray-600">
                  Mostrando {documentosPaginados.length} por página
                </p>
              </div>
            </div>

            {documentosFiltrados.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-white rounded-full shadow-lg">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay documentos registrados</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Comienza agregando documentos al sistema para organizar la información
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {documentosPaginados.map((documento) => (
                    <div
                      key={documento.id_doc}
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Encabezado con ícono y etiquetas */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-6 h-6 text-blue-600"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z"
                                clipRule="evenodd"
                              />
                              <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 leading-tight">
                              {documento.nombre_doc}
                            </h3>
                            {documento.confidencial_doc && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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

                        {/* Estatus con badge */}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${documento.estatus_doc === "Activo"
                          ? "bg-green-100 text-green-800"
                          : documento.estatus_doc === "Inactivo"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                          }`}>
                          {documento.estatus_doc || "-"}
                        </span>
                      </div>

                      {/* Información del documento */}
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Tipo</p>
                            <p className="text-gray-900 font-semibold">{documento.nombre_tipo_documento || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Año</p>
                            <p className="text-gray-900 font-semibold">{documento.anio_doc || "-"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 font-medium mb-1">Secretaría</p>
                          <p className="text-gray-900 break-words whitespace-normal leading-relaxed">
                            {documento.nombre_secretaria || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 font-medium mb-1">Fecha</p>
                          <p className="text-gray-900 font-medium">
                            {documento.fecha_doc
                              ? new Date(documento.fecha_doc).toLocaleDateString('es-MX')
                              : "-"
                            }
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <button
                          onClick={() => documento.url_cons_doc && window.open(documento.url_cons_doc, "_blank")}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Ver Archivo
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditarDocumento(documento)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => documento.id_doc && handleEliminarDocumento(documento.id_doc)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Versión simplificada que siempre funciona */}
                {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-gray-200 [border-left:none] [border-right:none]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {startIndex + 1}-{Math.min(endIndex, documentosFiltrados.length)}
                        </span>{" "}
                        de{" "}
                        <span className="font-semibold text-gray-900">
                          {documentosFiltrados.length}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Página <span className="font-semibold text-[#0076aa]">{currentPage}</span> de{" "}
                        <span className="font-semibold">{totalPages}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Primera página"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                        className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Anterior"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-9 h-9 flex items-center justify-center text-sm rounded-md transition-colors ${currentPage === pageNum
                                ? "bg-[#0076aa] text-white font-semibold"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Siguiente"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Última página"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
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
