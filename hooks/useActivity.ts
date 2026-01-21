'use client';

import { useEffect, useCallback, useRef } from 'react';

// Hook para detectar actividad del usuario y mantener la sesión activa
export function useActivity() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateActivity = useCallback(async () => {
    try {
      // Verificar si hay cookie de sesión antes de hacer la petición
      const hasAuthToken = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('auth-token=')
      );

      if (!hasAuthToken) {
        return; // No hay sesión, no hacer nada
      }

      // Llamar a un endpoint que actualice la última actividad
      await fetch('/api/activity', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // Ignorar errores silenciosamente (puede ser que la sesión expiró)
      });
    } catch (error) {
      // Ignorar errores
    }
  }, []);

  useEffect(() => {
    // Verificar si hay sesión al montar
    const hasAuthToken = document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('auth-token=')
    );

    if (!hasAuthToken) {
      return; // No hay sesión, no agregar listeners
    }

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Función para actualizar actividad con debounce (máximo una vez cada 30 segundos)
    const handleActivity = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        updateActivity();
      }, 30000); // Esperar 30 segundos antes de actualizar
    };

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Actualizar actividad periódicamente (cada 5 minutos como respaldo)
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    // Limpiar listeners al desmontar
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(interval);
    };
  }, [updateActivity]);
}
