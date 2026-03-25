"use client";

import { useEffect, useMemo, useState } from "react";
import { useDocumentos, Documento } from "@/hooks/useDocumentos";
import { usePrestamos, PrestamoDocumento } from "@/hooks/usePrestamos";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSecretarias } from "@/hooks/useSecretarias";
import { PERMISOS } from "@/lib/permisos";
import PaginationControls from "@/components/PaginationControls";
import { Datepicker, Select } from "flowbite-react";

const CURP_REGEX = /^[A-Z0-9]{18}$/;

function parseLocalDate(value: string | null | undefined) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatLocalDateISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";

  const parsedLocalDate = parseLocalDate(value);
  const date = parsedLocalDate ?? new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function PrestamoPage() {
  const { prestamos, loading: loadingPrestamos, error: prestamosError, fetchPrestamos, crearPrestamo, devolverPrestamo } = usePrestamos();
  const { documentos, loading: loadingDocumentos, error: documentosError, fetchDocumentos, subirArchivo } = useDocumentos();
  const { user: currentUser, loading: loadingCurrentUser } = useCurrentUser();
  const { secretarias, loading: loadingSecretarias } = useSecretarias();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | "">("");
  const [nombreSolicitante, setNombreSolicitante] = useState("");
  const [curpSolicitante, setCurpSolicitante] = useState("");
  const [areaSolicitante, setAreaSolicitante] = useState("");
  const [areaSolicitanteOtra, setAreaSolicitanteOtra] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [vale, setVale] = useState<File | null>(null);

  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [modalError, setModalError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"" | "Prestado" | "Vencido" | "Devuelto" | "Cancelado">("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasPermission = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.permisos.includes(PERMISOS.ADMIN_TOTAL) || currentUser.permisos.includes(PERMISOS.CREAR_DOCUMENTOS);
  }, [currentUser]);

  const canReturn = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.permisos.includes(PERMISOS.ADMIN_TOTAL) || currentUser.permisos.includes(PERMISOS.EDITAR_DOCUMENTOS);
  }, [currentUser]);

  const isLoading = loadingPrestamos || loadingDocumentos || loadingSecretarias;

  useEffect(() => {
    if (loadingCurrentUser) return;
    fetchPrestamos();
    fetchDocumentos({ estatus_doc: "Activo" });
  }, [loadingCurrentUser, fetchPrestamos, fetchDocumentos]);

  useEffect(() => {
    if (prestamosError) setError(prestamosError);
    else if (documentosError) setError(documentosError);
    else setError("");
  }, [prestamosError, documentosError]);

  const prestamosFiltrados = useMemo(() => {
    if (!filterStatus) return prestamos;
    return prestamos.filter((p) => p.estatus_prestamo === filterStatus);
  }, [filterStatus, prestamos]);

  const totalItems = prestamosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, prestamos]);

  const prestamosPaginados = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return prestamosFiltrados.slice(start, start + itemsPerPage);
  }, [currentPage, itemsPerPage, prestamosFiltrados]);

  const clearForm = () => {
    setSelectedDocId("");
    setNombreSolicitante("");
    setCurpSolicitante("");
    setAreaSolicitante("");
    setAreaSolicitanteOtra("");
    setMotivo("");
    setObservaciones("");
    setFechaLimite("");
    setVale(null);
    setModalError("");
    setMessage("");
    setError("");
  };

  const onOpenNew = () => {
    clearForm();
    setIsNewModalOpen(true);
  };

  const onCloseNew = () => {
    setIsNewModalOpen(false);
  };

  const handleValeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setVale(file);
  };

  const handleCreate = async () => {
    setModalError("");
    setMessage("");

    if (!selectedDocId) {
      setModalError("Selecciona un documento para préstamo.");
      return;
    }

    if (!nombreSolicitante.trim()) {
      setModalError("Ingresa el nombre del solicitante.");
      return;
    }

    if (!curpSolicitante.trim() || !CURP_REGEX.test(curpSolicitante.trim().toUpperCase())) {
      setModalError("CURP inválida. Debe tener 18 caracteres alfanuméricos.");
      return;
    }

    if (!fechaLimite) {
      setModalError("Selecciona fecha límite de devolución.");
      return;
    }

    setSubmitting(true);

    try {
      let valeUrl: string | undefined;
      if (vale) {
        const uploadResult = await subirArchivo(vale, "prestamos", "prestamos");
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "No fue posible subir el vale de préstamo");
        }

        valeUrl = uploadResult.url;
      }

      const selectedArea =
        areaSolicitante === "OTRA"
          ? areaSolicitanteOtra.trim() || undefined
          : areaSolicitante.trim() || undefined;

      const createResult = await crearPrestamo({
        id_doc: Number(selectedDocId),
        nombre_solicitante: nombreSolicitante.trim(),
        curp_solicitante: curpSolicitante.trim().toUpperCase(),
        area_solicitante: selectedArea,
        motivo_prestamo: motivo.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
        fecha_prestamo: formatLocalDateISO(new Date()),
        fecha_limite_devolucion: fechaLimite,
        vale_url: valeUrl,
      });

      if (!createResult.success) {
        throw new Error(createResult.error || "No se pudo crear el préstamo");
      }

      setMessage("Préstamo registrado correctamente.");
      onCloseNew();
      await fetchPrestamos();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear préstamo";
      setModalError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevolver = async (prestamo: PrestamoDocumento) => {
    if (!canReturn) {
      setError("No tienes permiso para devolver el préstamo.");
      return;
    }

    const confirm = window.confirm(`Marcar el préstamo #${prestamo.id_prestamo} como devuelto?`);
    if (!confirm) return;

    setSubmitting(true);
    try {
      const result = await devolverPrestamo({
        id_prestamo: prestamo.id_prestamo,
        fecha_devolucion: formatLocalDateISO(new Date()),
      });

      if (!result.success) {
        throw new Error(result.error || "No se pudo registrar devolución");
      }

      setMessage("Préstamo devuelto correctamente.");
      await fetchPrestamos();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al devolver préstamo";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-6">
      {/* Header Section */}
      <div className="bg-[#0076aa] rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Préstamo de documentos</h1>
            <p className="text-gray-300 mt-1">
              Gestiona préstamos activos, histórico y registra nuevos movimientos
            </p>
          </div>
          <button
            onClick={onOpenNew}
            disabled={!hasPermission}
            className="rounded-lg bg-white text-[#0076aa] px-6 py-3 text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            Nuevo préstamo
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <span>Filtrar por estatus:</span>
          <Select
            id="filterStatus"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as "" | "Prestado" | "Vencido" | "Devuelto" | "Cancelado")}
            className="rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all"
          >
            <option value="">Todos</option>
            <option value="Prestado">Prestado</option>
            <option value="Vencido">Vencido</option>
            <option value="Devuelto">Devuelto</option>
            <option value="Cancelado">Cancelado</option>
          </Select>
        </label>
      </div>

      {/* Alert Section */}
      {(error || message) && (
        <div className={`rounded-lg px-4 py-4 text-sm font-medium border-l-4 ${error
            ? "bg-red-50 border-red-500 text-red-700"
            : "bg-green-50 border-green-500 text-green-700"
          }`}>
          <div className="flex items-start gap-3">
            {error ? (
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span>{error || message}</span>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Documento</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Solicitante</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">CURP</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Préstamo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Límite</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estatus</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Vale</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="h-8 bg-gray-200 rounded-lg w-20 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : prestamosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>No hay préstamos encontrados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                prestamosPaginados.map((p) => (
                  <tr key={p.id_prestamo} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">#{p.id_prestamo}</td>
                    <td className="px-4 py-3 text-slate-700">{p.nombre_doc || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{p.nombre_solicitante}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.curp_solicitante}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(p.fecha_prestamo)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(p.fecha_limite_devolucion)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.estatus_prestamo === "Prestado" ? "bg-blue-100 text-blue-800" :
                          p.estatus_prestamo === "Vencido" ? "bg-red-100 text-red-800" :
                            p.estatus_prestamo === "Devuelto" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"
                        }`}>
                        {p.estatus_prestamo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.vale_url ? (
                        <a href={p.vale_url} target="_blank" rel="noreferrer" className="text-[#0076aa] hover:text-[#005a85] font-medium transition-colors flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>

                          </svg>
                          Ver
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDevolver(p)}
                        disabled={!canReturn || p.estatus_prestamo !== "Prestado"}
                        className={`inline-flex items-center gap-1 font-medium text-sm px-4 py-2.5 rounded-base focus:outline-none transition-colors ${!canReturn || p.estatus_prestamo !== "Prestado"
                            ? "text-fg-disabled bg-disabled box-border border border-default-medium shadow-xs cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Devolver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-[#0076aa] to-[#005a85] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Registrar nuevo préstamo</h2>
                <p className="text-blue-100 text-sm mt-1">Completa los datos del solicitante y documento</p>
              </div>
              <button
                onClick={onCloseNew}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Modal Alert */}
                {modalError && (
                  <div className="rounded-lg px-4 py-4 text-sm font-medium border-l-4 bg-red-50 border-red-500 text-red-700">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{modalError}</span>
                    </div>
                  </div>
                )}

                {/* Document Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Documento *</label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all"
                  >
                    <option value="">Selecciona un documento</option>
                    {documentos.map((doc: Documento) => (
                      <option key={doc.id_doc} value={doc.id_doc}>{doc.nombre_doc} ({doc.expediente_doc || "sin expediente"})</option>
                    ))}
                  </select>
                </div>

                {/* Requester Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del solicitante *</label>
                  <input
                    value={nombreSolicitante}
                    onChange={(e) => setNombreSolicitante(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all"
                    placeholder="Ej: Juan Pérez García"
                  />
                </div>

                {/* CURP */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CURP *</label>
                  <input
                    value={curpSolicitante}
                    onChange={(e) => setCurpSolicitante(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all font-mono uppercase"
                    placeholder="XXXXXXXXXXXXXXXX"
                    maxLength={18}
                  />
                  <p className="text-xs text-slate-500 mt-1">18 caracteres alfanuméricos</p>
                </div>

                {/* Area Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Secretaría/Área</label>
                  <select
                    value={areaSolicitante}
                    onChange={(e) => {
                      setAreaSolicitante(e.target.value);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all"
                  >
                    <option value="">Selecciona una Secretaría</option>
                    {secretarias.map((sec) => (
                      <option key={sec.id_secretaria} value={sec.nombre_secretaria}>
                        {sec.nombre_secretaria}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Motive */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Motivo del préstamo</label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all"
                    rows={2}
                    placeholder="Describir el motivo del préstamo"
                  />
                </div>

                {/* Observations */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Observaciones</label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all"
                    rows={2}
                    placeholder="Notas adicionales"
                  />
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha límite de devolución *</label>
                  <Datepicker
                    language="es"
                    id="datepicker-autohide"
                    value={parseLocalDate(fechaLimite)}
                    onChange={(date: Date | null) => setFechaLimite(date ? formatLocalDateISO(date) : "")}
                    className="w-full rounded-lg border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#0076aa] focus:border-transparent transition-all"
                  />
                </div>

                {/* Vale Upload */}
                <div>
                  <label className="block mb-2.5 text-sm font-medium text-heading" htmlFor="file_input">Vale de préstamo (opcional)</label>
                  <input className="cursor-pointer bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body" id="file_input" type="file" accept="application/pdf,image/*" onChange={handleValeChange} />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={onCloseNew}
                disabled={submitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="rounded-lg bg-[#0076aa] px-6 py-2 text-sm font-semibold text-white hover:bg-[#005a85] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Guardar préstamo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
