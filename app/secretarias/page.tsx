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
      <div className="min-h-screen flex items-center justify-center bg-[#0b3b60]">
        <div className="flex flex-col items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
          <br></br>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa]"></div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-[#0b3b60] mb-6 pl-8">
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
