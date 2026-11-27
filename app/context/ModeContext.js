/**
 * Contexto de MODO: 'web' | 'ia'.
 *
 * El sitio tiene dos vistas:
 *  - 'web': la landing completa (hero, proyectos, marketing, contacto...).
 *  - 'ia': una vista optimizada para reclutadores y sistemas de IA
 *    (RecruitmentView con el perfil en markdown).
 *
 * El estado vive en este Provider y se consume con useMode() desde
 * cualquier componente (Navbar, HeroSection, ProjectsSection, etc.).
 *
 * El cambio de modo usa un realce visual breve (softRefresh) en lugar de
 * remontar la página: así no se pierde el estado de formularios ni se
 * bloquea la navegación. Respeta prefers-reduced-motion.
 */
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { softRefresh } from '@/lib/uiTransitions';

// Valor por defecto (para que useMode() no explote fuera del Provider).
const ModeContext = createContext({
  mode: 'web',
  setMode: () => {},
  toggleMode: () => {},
});

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState('web'); // arranca en modo web

  // Cambia el modo y mantiene el atributo del documento sincronizado.
  const setMode = useCallback((next) => {
    if (next !== 'web' && next !== 'ia') return;
    if (typeof document !== 'undefined' && document.documentElement.dataset.mode === next) return;
    setModeState(next);
    if (typeof document !== 'undefined') document.documentElement.dataset.mode = next;
    softRefresh();
  }, []);

  // Alterna entre web e ia.
  const toggleMode = useCallback(() => {
    setMode(mode === 'web' ? 'ia' : 'web');
  }, [mode, setMode]);

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
}

// Hook para leer/editar el modo desde cualquier componente.
export function useMode() {
  return useContext(ModeContext);
}
