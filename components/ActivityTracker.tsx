'use client';

import { useEffect } from 'react';
import { useActivity } from '@/hooks/useActivity';

export function ActivityTracker() {
  // Siempre llamar al hook (regla de hooks)
  useActivity();
  
  return null; // Este componente no renderiza nada
}
