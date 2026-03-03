"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDocumentos, Documento } from "@/hooks/useDocumentos";
import { useSecretarias } from "@/hooks/useSecretarias";
import { DatePicker } from "react-datepicker"
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";

// Registrar locale español
registerLocale('es', es);
setDefaultLocale('es');

interface TipoDocumento {
  id_documento: number;
  nombre_documento: string;
  estatus_documento?: string;
}

interface DocumentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onShowAlert?: (message: string, type: 'success' | 'error' | 'info') => void;
  documento?: Documento | null;
  isEditing?: boolean;
  isReadOnly?: boolean;
}

export default function DocumentosModal({
  isOpen,
  onClose,
  onSuccess,
  onShowAlert,
  documento,
  isEditing = false,
  isReadOnly = false,
}: DocumentosModalProps) {
  const { crearDocumento, actualizarDocumento, subirArchivo } = useDocumentos();
  const { secretarias } = useSecretarias();
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchSecretaria, setSearchSecretaria] = useState("");
  const [showSecretariaDropdown, setShowSecretariaDropdown] = useState(false);
  const [filteredSecretarias, setFilteredSecretarias] = useState(secretarias);

  // Estados del formulario
  const [nombreDoc, setNombreDoc] = useState("");
  const [tipoDoc, setTipoDoc] = useState<number | "">("");
  const [idSecre, setIdSecre] = useState<number | "">("");
  const [sizeDoc, setSizeDoc] = useState("");
  const [anioDoc, setAnioDoc] = useState("");
  const [comentarioDoc, setComentarioDoc] = useState("");
  const [metaDoc, setMetaDoc] = useState("");
  const [descDoc, setDescDoc] = useState("");
  const [oficioDoc, setOficioDoc] = useState("");
  const [expedienteDoc, setExpedienteDoc] = useState("");
  const [serieDoc, setSerieDoc] = useState("");
  const [subserieDoc, setSubserieDoc] = useState("");
  const [consDoc, setConsDoc] = useState("");
  const [confidencialDoc, setConfidencialDoc] = useState(false);
  const [fechaDoc, setFechaDoc] = useState("");
  const [horaDoc, setHoraDoc] = useState("");
  const [urlConsDoc, setUrlConsDoc] = useState("");
  const [estatusDoc, setEstatusDoc] = useState("Activo");
  const [versionDoc, setVersionDoc] = useState(1);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'camera'>('file');


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);

      // Autocompletar el campo de tamaño
      const fileSizeKB = (file.size / 1024).toFixed(2);
      setSizeDoc(`${fileSizeKB} KB`);

      // Crear preview si es una imagen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const removeFile = () => {
    setArchivo(null);
    setPreviewUrl(null);
  };


  // Cargar tipos de documento con memoización
  useEffect(() => {
    const loadTiposDocumento = async () => {
      setLoadingTipos(true);
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
      } finally {
        setLoadingTipos(false);
      }
    };

    if (isOpen && tiposDocumento.length === 0) {
      loadTiposDocumento();
    }
  }, [isOpen, tiposDocumento.length]);

  // HTML5 Date Input - Sin dependencias externas

  // Inicializar formulario con useCallback para optimización
  const initializeForm = useCallback(() => {
    if (isEditing && documento) {
      setNombreDoc(documento.nombre_doc || "");
      setTipoDoc(documento.tipo_doc || "");
      setIdSecre(documento.id_secre || "");
      setSizeDoc(documento.size_doc || "");
      setAnioDoc(documento.anio_doc || "");
      setComentarioDoc(documento.comentario_doc || "");
      setMetaDoc(documento.meta_doc || "");
      setDescDoc(documento.desc_doc || "");
      setOficioDoc(documento.oficio_doc || "");
      setExpedienteDoc(documento.expediente_doc || "");
      setSerieDoc(documento.serie_doc || "");
      setSubserieDoc(documento.subserie_doc || "");
      setConsDoc(documento.cons_doc || "");
      setConfidencialDoc(documento.confidencial_doc || false);
      setFechaDoc(documento.fecha_doc || "");
      setHoraDoc(documento.hora_doc || "");
      setUrlConsDoc(documento.url_cons_doc || "");
      setEstatusDoc(documento.estatus_doc || "Activo");
      setVersionDoc(documento.version_doc || 1);
    } else {
      // Resetear formulario para nuevo documento
      setNombreDoc("");
      setTipoDoc("");
      setIdSecre("");
      setSizeDoc("");
      setAnioDoc("");
      setComentarioDoc("");
      setMetaDoc("");
      setDescDoc("");
      setOficioDoc("");
      setExpedienteDoc("");
      setSerieDoc("");
      setSubserieDoc("");
      setConsDoc("");
      setConfidencialDoc(false);
      setFechaDoc("");
      setHoraDoc("");
      setUrlConsDoc("");
      setEstatusDoc("Activo");
      setVersionDoc(1);
    }
  }, [isEditing, documento]);

  useEffect(() => {
    if (isOpen) {
      initializeForm();
    }
  }, [isOpen, initializeForm]);

  // Memoizar opciones de selectores para optimizar renderizado
  const tiposDocumentoOptions = useMemo(() =>
    tiposDocumento.map((tipo) => (
      <option key={tipo.id_documento} value={tipo.id_documento}>
        {tipo.nombre_documento}
      </option>
    )), [tiposDocumento]);

  const secretariasOptions = useMemo(() =>
    secretarias.map((sec) => (
      <option key={sec.id_secretaria} value={sec.id_secretaria}>
        {sec.nombre_secretaria}
      </option>
    )), [secretarias]);

  // Filtrar secretarías basadas en la búsqueda
  useEffect(() => {
    if (searchSecretaria.trim() === "") {
      setFilteredSecretarias(secretarias);
    } else {
      const filtered = secretarias.filter(sec =>
        sec.nombre_secretaria.toLowerCase().includes(searchSecretaria.toLowerCase())
      );
      setFilteredSecretarias(filtered);
    }
  }, [searchSecretaria, secretarias]);

  // Manejar selección de secretaría existente
  const handleSecretariaSelect = (secretaria: any) => {
    setIdSecre(secretaria.id_secretaria);
    setSearchSecretaria(secretaria.nombre_secretaria);
    setShowSecretariaDropdown(false);
  };

  // Inicializar búsqueda cuando se carga una secretaría existente
  useEffect(() => {
    if (idSecre && secretarias.length > 0) {
      const secretaria = secretarias.find(sec => sec.id_secretaria === idSecre);
      if (secretaria) {
        setSearchSecretaria(secretaria.nombre_secretaria);
      }
    } else if (!idSecre) {
      setSearchSecretaria("");
    }
  }, [idSecre, secretarias]);

  // Manejar cambios en el input de URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Siempre permitir edición normal
    setUrlConsDoc(newValue);
  };


  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // PASO 1: Validar campos requeridos
    if (!nombreDoc.trim() || !tipoDoc || !idSecre || !fechaDoc) {
      onShowAlert?.("Por favor completa los campos requeridos: Nombre, Tipo de documento, Secretaría y Fecha del documento", "error");
      return;
    }

    setIsSubmitting(true);
    let finalUrlConsDoc = urlConsDoc;
    let metaDocFinal: string | undefined = metaDoc.trim() || undefined;

    // PASO 2: Si hay un archivo, subirlo primero usando nuestra función
    if (archivo) {
      try {
        console.log('📤 Subiendo archivo...', archivo.name);

        // ✅ USAR LA FUNCIÓN subirArchivo del hook
        const uploadResult = await subirArchivo(
          archivo,                                              // El archivo
          "ARCHIVO_DIGITAL",                                    // Nombre del sistema
          `documentos/${anioDoc || new Date().getFullYear()}`   // Carpeta: documentos/2026
        );

        console.log('📥 Resultado de subida:', uploadResult);

        // Verificar si la subida fue exitosa
        if (uploadResult.success && uploadResult.url) {
          finalUrlConsDoc = uploadResult.url;  // ✅ Guardar la URL pública
          setUrlConsDoc(finalUrlConsDoc);
          console.log('✅ Archivo subido correctamente:', finalUrlConsDoc);
        } else {
          throw new Error(uploadResult.error || 'Error al subir archivo');
        }

        try {
          const ocrForm = new FormData();
          ocrForm.append('archivo', archivo, archivo.name);

          const ocrResponse = await fetch('/api/ocr', {
            method: 'POST',
            body: ocrForm,
          });

          if (ocrResponse.ok) {
            const ocrData = await ocrResponse.json();
            if (ocrData?.success && typeof ocrData?.texto_extraido === 'string') {
              let metaObj: any = {};
              const raw = metaDoc.trim();

              if (raw) {
                try {
                  const parsed = JSON.parse(raw);
                  if (parsed && typeof parsed === 'object') {
                    metaObj = parsed;
                  } else {
                    metaObj = { meta_usuario: raw };
                  }
                } catch {
                  metaObj = { meta_usuario: raw };
                }
              }

              metaObj.texto_extraido = ocrData.texto_extraido;
              metaObj.fecha_ocr = new Date().toISOString();
              metaObj.metodo_extraccion = ocrData.metodo;
              metaObj.nombre_archivo = archivo.name;
              metaObj.tipo_mime = archivo.type;
              metaObj.url_cons_doc = finalUrlConsDoc;

              metaDocFinal = JSON.stringify(metaObj);
              setMetaDoc(metaDocFinal);
            }
          }
        } catch (error: any) {
          console.error('❌ Error al extraer OCR:', error);
        }

      } catch (error: any) {
        console.error("❌ Error al subir archivo:", error);
        onShowAlert?.("Error al subir el archivo físico: " + error.message, "error");
        setIsSubmitting(false);
        return; // Detener el proceso si falla la subida
      }
    }

    // PASO 3: Preparar los datos para guardar en la base de datos
    const documentoData: any = {
      nombre_doc: nombreDoc.trim(),
      tipo_doc: Number(tipoDoc),
      id_secre: Number(idSecre),
      size_doc: archivo
        ? `${(archivo.size / 1024).toFixed(2)} KB`
        : (sizeDoc.trim() || undefined),
      anio_doc: anioDoc.trim() || undefined,
      comentario_doc: comentarioDoc.trim() || undefined,
      meta_doc: metaDocFinal,
      desc_doc: descDoc.trim() || undefined,
      oficio_doc: oficioDoc.trim() || undefined,
      expediente_doc: expedienteDoc.trim() || undefined,
      serie_doc: serieDoc.trim() || undefined,
      subserie_doc: subserieDoc.trim() || undefined,
      cons_doc: consDoc.trim() || undefined,
      confidencial_doc: confidencialDoc,
      fecha_doc: fechaDoc || undefined,
      hora_doc: horaDoc || undefined,
      url_cons_doc: finalUrlConsDoc.trim() || undefined, // ✅ URL del archivo subido
      estatus_doc: estatusDoc,
      version_doc: versionDoc,
    };

    // PASO 4: Crear o actualizar el documento en la base de datos
    try {
      let result;
      if (isEditing && documento?.id_doc) {
        result = await actualizarDocumento({
          id_doc: documento.id_doc,
          ...documentoData,
        });
      } else {
        result = await crearDocumento(documentoData);
      }

      // PASO 5: Mostrar resultado
      if (result.success) {
        onShowAlert?.(isEditing ? "Documento actualizado exitosamente" : "Documento creado exitosamente", "success");

        // ✅ Llamar a onSuccess ANTES de cerrar
        if (onSuccess) {
          onSuccess();
        }

        onClose();
      } else {
        onShowAlert?.(result.error || `Error al ${isEditing ? 'actualizar' : 'crear'} documento`, "error");
      }
    } catch (error: any) {
      console.error("❌ Error al guardar documento:", error);
      onShowAlert?.("Error al guardar el documento: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        id="modal-container"
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col transform transition-all duration-200 ease-out overflow-hidden relative ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
      >
        {/* Header del modal */}
        <div className="bg-[#0076aa] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold pl-6">
              {isEditing ? "Editar Documento" : "Nuevo Documento"}
            </h2>
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

        {/* Nota de campos obligatorios */}
        <div className="px-6 py-2 bg-gray-300 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Los campos con <span className="text-red-500 font-bold text-base">*</span> son obligatorios
          </p>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombreDoc}
                  onChange={(e) => setNombreDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de documento <span className="text-red-500">*</span>
                </label>
                <select
                  value={tipoDoc}
                  onChange={(e) => setTipoDoc(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  required
                  disabled={isSubmitting || loadingTipos}
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposDocumentoOptions}
                </select>
              </div>

              {/* Secretaría */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secretaría <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchSecretaria}
                    onChange={(e) => {
                      setSearchSecretaria(e.target.value);
                      setShowSecretariaDropdown(true);
                    }}
                    onFocus={() => setShowSecretariaDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSecretariaDropdown(false), 200)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                    placeholder="Buscar secretaría..."
                    required
                    disabled={isSubmitting}
                  />
                  
                  {/* Dropdown de resultados */}
                  {showSecretariaDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSecretarias.length > 0 ? (
                        filteredSecretarias.map((secretaria) => (
                          <div
                            key={secretaria.id_secretaria}
                            onClick={() => handleSecretariaSelect(secretaria)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {secretaria.nombre_secretaria}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          {searchSecretaria.trim() ? 
                            "No se encontraron secretarías" : 
                            "Escribe para buscar secretarías..."
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fecha del documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de expedición del documento <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full focus-within:text-[#0076aa]">
                  <DatePicker
                    selected={fechaDoc && fechaDoc.match(/^\d{4}-\d{2}-\d{2}$/) ? new Date(fechaDoc + 'T00:00:00') : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFechaDoc(`${year}-${month}-${day}`);
                      } else {
                        setFechaDoc("");
                      }
                    }}
                    className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                    // NO MOVER wrapperClassName - es necesario para el estilo del datepicker
                    wrapperClassName="w-full"
                    required
                    disabled={isSubmitting}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/AAAA"
                    locale="es"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors pointer-events-none">
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
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Fila de Año, Hora y Estatus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Año
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={anioDoc}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[0-9]*$/.test(value)) {
                      setAnioDoc(value);
                    }
                  }}
                  maxLength={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                  placeholder="2024"
                />
              </div> */}

              {/* Hora del documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora del documento
                </label>
                <input
                  type="time"
                  value={horaDoc}
                  onChange={(e) => setHoraDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>

              {/* Estatus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estatus
                </label>
                <select
                  value={estatusDoc}
                  onChange={(e) => setEstatusDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Archivado">Archivado</option>
                </select>
              </div>
            </div>

            {/* Fila de Oficio y Expediente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Oficio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oficio
                </label>
                <input
                  type="text"
                  value={oficioDoc}
                  onChange={(e) => setOficioDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>

              {/* Expediente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expediente
                </label>
                <input
                  type="text"
                  value={expedienteDoc}
                  onChange={(e) => setExpedienteDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serie
                </label>
                <input
                  type="text"
                  value={serieDoc}
                  onChange={(e) => setSerieDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subserie
                </label>
                <input
                  type="text"
                  value={subserieDoc}
                  onChange={(e) => setSubserieDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conservación
                </label>
                <input
                  type="text"
                  value={consDoc}
                  onChange={(e) => setConsDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Versión
                </label>
                <input
                  type="number"
                  value={versionDoc}
                  onChange={(e) => setVersionDoc(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Campos de texto largo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario
                </label>
                <textarea
                  value={comentarioDoc}
                  onChange={(e) => setComentarioDoc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={descDoc}
                  onChange={(e) => setDescDoc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de consulta
              </label>
              <input
                type="text"
                value={urlConsDoc}
                onChange={handleUrlChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                disabled={isSubmitting}
                placeholder="https://drive.google.com/file/d/1a2B3c4D5e6F7g8H9/view"
              />
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <span>Llenar en caso de subir un archivo mediante Google Drive o enlace similar</span>
              </p>
            </div>


            {/* Sección de carga de archivo */}
            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {/* Método de carga de archivo */}
              </label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${uploadMethod === 'file'
                    ? 'bg-[#0076aa] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  disabled={isSubmitting}
                >
                  📁 Seleccionar archivo
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('camera')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${uploadMethod === 'camera'
                    ? 'bg-[#0076aa] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  disabled={isSubmitting}
                >
                  📷 Tomar foto
                </button>
              </div>

              {uploadMethod === 'file' ? (
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,.doc,.docx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              ) : (
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                />
              )}

              {archivo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{archivo.name}</p>
                      <p className="text-sm text-gray-500">
                        Tamaño: {(archivo.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="flex-shrink-0 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      disabled={isSubmitting}
                    >
                      ❌
                    </button>
                  </div>

                  {previewUrl && (
                    <div className="mt-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tamaño y Checkbox confidencial en la misma fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Tamaño */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño <span className="text-gray-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={sizeDoc}
                  onChange={(e) => setSizeDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0076aa]"
                  disabled={isSubmitting}
                  placeholder="Ej: 1.2 MB - Se autocompleta al subir archivo"
                />
              </div>

              {/* Checkbox confidencial */}
              <div className="flex items-center h-[42px]">
                <input
                  type="checkbox"
                  id="confidencial"
                  checked={confidencialDoc}
                  onChange={(e) => setConfidencialDoc(e.target.checked)}
                  className="w-4 h-4 border border-default-medium rounded-xs bg-white-secondary-medium focus:ring-2 focus:ring-brand-soft"
                  disabled={isSubmitting}
                />
                <label htmlFor="confidencial" className="select-none ms-2 text-sm font-medium text-heading">
                  Documento confidencial
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className={`${isReadOnly ? 'w-full' : 'flex-1'} px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors`}
                disabled={isSubmitting}
              >
                {isReadOnly ? "Cerrar" : "Cancelar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
