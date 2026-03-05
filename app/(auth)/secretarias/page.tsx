"use client";

import { useState } from "react";
import Link from "next/link";
import { useSecretarias } from "@/hooks/useSecretarias";
import SecretariasTable from "@/components/SecretariasTable";

export default function SecretariasPage() {
  const { secretarias, loading, error } = useSecretarias();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSecretaria, setSelectedSecretaria] = useState<{
    id: number;
    nombre: string;
  } | null>(null);

  const handleVerDependencias = (id: number, nombre: string) => {
    setSelectedSecretaria({ id, nombre });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSecretaria(null);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center">
          {/* Icono de candado */}
          <div className="flex justify-center mb-4">
            <div className="bg-amber-100 p-4 rounded-full">
              <svg
                className="w-12 h-12 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Acceso Denegado
          </h2>

          {/* Mensaje */}
          <p className="text-gray-600 mb-6">
            No tienes los permisos necesarios para acceder a esta sección.
            Contacta al administrador si crees que esto es un error.
          </p>

          {/* Botón de retorno */}
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-[#094a75] transition-colors shadow-md"
          >
            ⬅️ Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="bg-[#0b3b60] rounded-2xl shadow-2xl p-6">
            <h1 className="text-2xl font-semibold text-primary text-center mb-6 pl-8">
              SECRETARÍAS
            </h1>

            <SecretariasTable secretarias={secretarias} loading={loading} />
          </div>
      </div>
    </div>
  );
}
