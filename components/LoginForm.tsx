'use client';

import Image from 'next/image';
import { useLogin } from '@/hooks/useLogin';
import LoginAndVisitanteFooter from './LoginAndVisitanteFooter';
import { useEffect, useRef } from 'react';

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

  const curpInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const curpLength = formData.curp.trim().length;

  // 👇 Aquí va el efecto para manejar el focus
  useEffect(() => {
    if (error) {
      // Si hay un error relacionado con CURP, enfocar el campo CURP
      if (error.toLowerCase().includes('curp') || error.toLowerCase().includes('formato')) {
        curpInputRef.current?.focus();
      }
      // Si es error de contraseña o credenciales, enfocar el campo de contraseña
      else if (error.toLowerCase().includes('contraseña') ||
        error.toLowerCase().includes('credencial') ||
        error.toLowerCase().includes('incorrect')) {
        passwordInputRef.current?.focus();
      }

      // También anunciar el error para lectores de pantalla
      if (errorRef.current) {
        errorRef.current.setAttribute('role', 'alert');
        errorRef.current.setAttribute('aria-live', 'assertive');
      }
    }
  }, [error]);

  const handleBlockClipboard = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const handleBlockContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/95 rounded-2xl shadow-2xl p-8 space-y-6 ring-1 ring-white/10 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0b3b60] text-white flex items-center justify-center font-bold">
              AD
            </div>
            <h1 className="text-3xl font-bold text-[#0b3b60]">Archivo Digital</h1>
          </div>
          <p className="text-md text-gray-500">
            Bienvenido, ingresa con tus credenciales de la CUS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="curp"
              className="block text-lg font-medium text-[#0b3b60] mb-2 pl-4"
            >
              CURP
            </label>
            <input
              ref={curpInputRef}
              autoComplete='username'
              disabled={isLoading}
              type="text"
              id="curp"
              name="curp"
              value={formData.curp}
              onChange={handleChange}
              onCopy={handleBlockClipboard}
              onPaste={handleBlockClipboard}
              onCut={handleBlockClipboard}
              onContextMenu={handleBlockContextMenu}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:border-transparent transition-all uppercase text-gray-900 ${curpLength > 0 && curpLength !== 18
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-white'
                }`}
              placeholder="ABCD123456HDFGHI01"
              maxLength={18}
              required
            />
            {curpLength > 0 && curpLength !== 18 && (
              <p className="mt-1 text-sm text-red-600 text-center" aria-live="polite">
                {curpLength < 18
                  ? `Faltan ${18 - curpLength} caracteres (requiere 18 caracteres)`
                  : `Tiene ${curpLength - 18} carácter${curpLength - 18 > 1 ? 'es' : ''} de más (requiere 18 caracteres)`}
              </p>
            )}
            {curpLength === 18 && (
              <p className="mt-1 text-sm text-center text-green-600">CURP válido ✅</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium text-[#0b3b60] mb-2 pl-4"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                ref={passwordInputRef}
                autoComplete='current-password'
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onCopy={handleBlockClipboard}
                onPaste={handleBlockClipboard}
                onCut={handleBlockClipboard}
                onContextMenu={handleBlockContextMenu}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="••••••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              ref={errorRef}
              className={`
    ${error.includes('incorrecta') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}
    px-4 py-3 rounded-lg text-sm text-left break-words animate-shake flex items-start gap-2
  `}
            >
              {/* Icono de candado para errores de credenciales */}
              {error.includes('incorrecta') ? (
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                /* Icono de advertencia para otros errores */
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="flex-1">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0076aa] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#005a85] focus:outline-none focus:ring-2 focus:ring-[#00b2e2] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          <a
            href="https://cus.sanjuandelrio.gob.mx/tramites-sjr/public/forgot-password.html"
            className="text-sm text-[#0076aa] hover:text-[#00b2e2] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      <LoginAndVisitanteFooter />

    </div>
  );
}
