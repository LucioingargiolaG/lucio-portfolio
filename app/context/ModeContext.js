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
 */
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// Valor por defecto (para que useMode() no explote fuera del Provider).
const ModeContext = createContext({
  mode: 'web',
  setMode: () => {},
});

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('web'); // arranca en modo web

  // Alterna entre web e ia.
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'web' ? 'ia' : 'web'));
  }, []);

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
