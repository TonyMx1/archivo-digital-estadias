'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useLogin } from '@/hooks/useLogin';

type LoginFormProps = {
  onSuccess: () => void;
};

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    formData,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  } = useLogin({ onSuccess });

  const curpInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const curpLength = formData.curp.trim().length;

  // Manejo de foco según el tipo de error
  useEffect(() => {
    if (error) {
      const lower = error.toLowerCase();

      if (lower.includes('curp') || lower.includes('formato')) {
        curpInputRef.current?.focus();
      } else if (
        lower.includes('contraseña') ||
        lower.includes('credencial') ||
        lower.includes('incorrect')
      ) {
        passwordInputRef.current?.focus();
      }

      if (errorRef.current) {
        errorRef.current.setAttribute('role', 'alert');
        errorRef.current.setAttribute('aria-live', 'assertive');
      }
    }
  }, [error]);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Columna izquierda: branding / info */}
        <div className="relative hidden md:flex flex-col justify-between bg-[#0b3b60] text-white p-10">
          <div>
            <div className="flex items-center gap-3 mb-2 mt-2">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Archivo Digital
                </h1>
                <p className="text-md text-sky-100">
                  Sistema de gestión de archivos digitales
                </p>
              </div>
            </div>
             <br />

            <div className="mt-1">
              <div className="mt-4 flex items-end justify-center gap-6">
                <div className="relative h-36 w-36 shrink-0">
                  <Image
                    src="/logo_white.png"
                    alt="Logo del municipio"
                    fill
                    className="object-contain object-right"
                  />
                </div>
                <div className="relative h-36 w-40 shrink-0">
                  <Image
                    src="/legado.png"
                    alt="Logo legado"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-xs text-sky-100/80">
            <p>Tu información se protege bajo los lineamientos internos de seguridad y confidencialidad.</p>
          </div>
        </div>

        {/* Columna derecha: formulario */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {/* Header mobile */}
          <div className="md:hidden mb-6 flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo_dark.png"
                alt="Archivo Digital"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Archivo Digital
              </h1>
              <p className="text-xs text-gray-500">
                Sistema de gestión de archivos digitales
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Iniciar sesión
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Ingresa con tus credenciales de la CUS
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {/* CURP */}
            <div>
              <label
                htmlFor="curp"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                CURP
              </label>
              <div className="flex rounded-lg shadow-sm overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-[#0b3b60]">
                <span className="inline-flex items-center px-3 bg-gray-50 text-xs font-medium text-gray-500 border-r border-gray-200">
                  CURP
                </span>
                <input
                  id="curp"
                  name="curp"
                  type="text"
                  ref={curpInputRef}
                  value={formData.curp}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase();
                    e.target.value = upperValue;
                    handleChange(e);
                  }}
                  autoComplete="off"
                  style={{ textTransform: 'uppercase' }}
                  className={`block w-full min-w-0 px-4 py-2.5 bg-white text-gray-900 text-sm focus:outline-none placeholder:text-gray-500
                    ${
                      curpLength > 0 && curpLength !== 18
                        ? 'bg-red-50'
                        : 'bg-white'
                    }`}
                  placeholder="ABCD123456HDFGHI01"
                  maxLength={18}
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>

              {/* Validación de longitud de CURP */}
              {curpLength > 0 && curpLength !== 18 && (
                <p className="mt-1 text-xs text-red-600">
                  {curpLength < 18
                    ? `Faltan ${18 - curpLength} caracteres (requiere 18)`
                    : `Tiene ${curpLength - 18} carácter${
                        curpLength - 18 > 1 ? 'es' : ''
                      } de más (requiere 18)`}
                </p>
              )}

              {curpLength === 18 && (
                <p className="mt-1 text-xs text-emerald-600">
                  CURP válido
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  ref={passwordInputRef}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]"
                  placeholder="Ingresa tu contraseña"
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0b3b60] rounded-lg p-1 transition-colors"
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? (
                    // Ojo tachado
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-5 0-9.27-3.11-11-8 0-1.35.37-2.62 1.02-3.72" />
                      <path d="M6.1 6.1A9.95 9.95 0 0112 4c5 0 9.27 3.11 11 8-.51 1.47-1.3 2.8-2.3 3.93" />
                      <path d="M9.88 9.88A3 3 0 0114.12 14.12" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Ojo
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12S4 4 12 4s11 8 11 8-3 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error general */}
            {error && (
              <div
                ref={errorRef}
                id="login-error"
                className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700
               animate-[fadeInUp_150ms_ease-out]"
               role="alert"
               aria-live="assertive"
              >
                <span className="mt-0.5">
                  {error.toLowerCase().includes('incorrecta') ||
                  error.toLowerCase().includes('credencial') ? (
                    // Icono candado (error de credenciales)
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  ) : (
                    // Icono advertencia
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Botón submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b3b60] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0a3454] focus:outline-none focus:ring-2 focus:ring-[#0b3b60] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>

            {/* Enlace recuperar contraseña (placeholder) */}
            <div className="pt-1 text-right">
              <a
                href="https://cus.sanjuandelrio.gob.mx/tramites-sjr/public/forgot-password.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#0b3b60] hover:text-[#0a2c49]"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
