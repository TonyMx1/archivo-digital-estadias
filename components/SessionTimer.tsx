'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SessionTimerProps {
  warningTime?: number; // Tiempo en minutos antes de mostrar advertencia (default: 2)
  sessionTimeout?: number; // Tiempo total en minutos (default: 30)
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ 
  warningTime = 2, 
  sessionTimeout = 30 
}) => {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number>(sessionTimeout * 60); // en segundos
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Prevenir múltiples logouts

  // Actualizar última actividad
  const updateLastActivity = useCallback(() => {
    // No actualizar la actividad si el modal está visible (el usuario está interactuando con la advertencia)
    if (showWarning && isVisible) return;
    
    setLastActivity(new Date());
    if (showWarning) {
      setShowWarning(false);
      setIsVisible(false);
    }
  }, [showWarning, isVisible]);

  const [isSessionActive, setIsSessionActive] = useState(false);

  // Verificar si hay sesión activa
  const hasActiveSession = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    try {
      const response = await fetch('/api/user');
      // Si es 401, simplemente no hay sesión - no es un error
      if (response.status === 401) return false;
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  // Cerrar sesión
  const handleLogout = useCallback(async () => {
    // Prevenir múltiples llamadas al logout
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    router.push('/login');
  }, [router, isLoggingOut]);

  // Extender sesión
  const extendSession = useCallback(async () => {
    try {
      await fetch('/api/activity', { method: 'POST' });
      // Forzar actualización de actividad y cerrar modal
      setLastActivity(new Date());
      setShowWarning(false);
      setIsVisible(false);
    } catch (error) {
      console.error('Error al extender sesión:', error);
    }
  }, []);

  // Verificar sesión al montar
  useEffect(() => {
    const checkSession = async () => {
      const active = await hasActiveSession();
      setIsSessionActive(active);
    };
    checkSession();
  }, [hasActiveSession]);

  useEffect(() => {
    if (!isSessionActive) return;

    // Eventos de actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isSessionActive, updateLastActivity]);

  useEffect(() => {
    if (!isSessionActive || isLoggingOut) return;

    const interval = setInterval(() => {
      // Si ya está en proceso de logout, detener el intervalo
      if (isLoggingOut) return;
      
      const now = new Date();
      const inactiveSeconds = Math.floor((now.getTime() - lastActivity.getTime()) / 1000);
      const remainingSeconds = Math.max(0, (sessionTimeout * 60) - inactiveSeconds);
      
      setTimeRemaining(remainingSeconds);

      // Mostrar advertencia cuando queden warningTime minutos
      if (remainingSeconds <= warningTime * 60 && remainingSeconds > 0) {
        if (!showWarning) {
          setShowWarning(true);
          // Pequeño delay para que aparezca suavemente
          setTimeout(() => setIsVisible(true), 100);
        }
      }

      // Cerrar sesión cuando se acabe el tiempo
      if (remainingSeconds === 0) {
        // Cerrar el modal antes de hacer logout
        setShowWarning(false);
        setIsVisible(false);
        handleLogout();
        return; // Salir temprano para evitar más ejecuciones
      }
    }, 1000); // Actualizar cada segundo

    return () => {
      clearInterval(interval);
    };
  }, [isSessionActive, isLoggingOut, lastActivity, sessionTimeout, warningTime, showWarning, handleLogout]);

  // Formatear tiempo restante
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !isSessionActive) return null;

  // Prevenir que los eventos del modal se propaguen al documento
  const handleModalInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleLogout} // Cerrar modal si se hace clic fuera
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={handleModalInteraction} // Evitar que se cierre al hacer clic dentro
        onMouseMove={handleModalInteraction} // Evitar que se cierre al mover mouse dentro
      >
        <div className="text-center">
          {/* Icono de advertencia */}
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-amber-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tu sesión está por expirar
          </h2>
          
          <p className="text-gray-600 mb-6">
            Tu sesión se cerrará automáticamente en <span className="font-bold text-amber-600">{formatTime(timeRemaining)}</span> por inactividad.
          </p>

          <div className="space-y-3">
            <button
              onClick={extendSession}
              className="w-full px-6 py-3 bg-[#0076aa] text-white font-semibold rounded-lg hover:bg-[#005a85] focus:outline-none focus:ring-2 focus:ring-[#0076aa] focus:ring-offset-2 transition-all duration-200 shadow-lg"
            >
              Extender sesión
            </button>
            
            {/* <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cerrar sesión ahora
            </button> */}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;
