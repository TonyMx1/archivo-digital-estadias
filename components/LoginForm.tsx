'use client';

import Image from 'next/image';
import { useLogin } from '@/hooks/useLogin';
import LoginAndVisitanteFooter from './LoginAndVisitanteFooter';

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

  const curpLength = formData.curp.trim().length;

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
            
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="curp"
              className="block text-sm font-medium text-[#0b3b60] mb-2"
            >
              CURP
            </label>
            <input
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
              <p className="mt-1 text-sm text-red-600">
                {curpLength < 18
                  ? `Faltan ${18 - curpLength} caracteres (requiere 18 caracteres)`
                  : `Tiene ${curpLength - 18} carácter${curpLength - 18 > 1 ? 'es' : ''} de más (requiere 18 caracteres)`}
              </p>
            )}
            {curpLength === 18 && (
              <p className="mt-1 text-sm text-green-600">CURP válido</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#0b3b60] mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-left break-words">
              {error}
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
