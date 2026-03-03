"use client";

import { useState } from "react";
import Link from "next/link";
import { useSecretarias } from "@/hooks/useSecretarias";
import ExitoFooter from "@/components/ExitoFooter";
import HeaderAll from "@/components/HeaderAll";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center justify-center">
          <div className="text-black text-xl">Cargando...</div>
          <br></br>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa]"></div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-primary flex flex-col">
      <HeaderAll showMenuButton={true} />

      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0b3b60] rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-primary mb-6 pl-8">
              SECRETARÍAS
            </h2>

            <SecretariasTable secretarias={secretarias} />
          </div>
        </div>
      </main>

      <ExitoFooter />
    </div>
  );
}
