/**
 * Contexto de TEMA: 'dark' | 'light'.
 *
 * Gestiona el tema oscuro/claro de toda la app:
 *  - El boot script de layout.js aplica el tema guardado ANTES del primer
 *    paint (sin flash). Acá solo sincronizamos el estado de React con el DOM.
 *  - Guarda la preferencia en localStorage para recordarla.
 *
 * Se mantiene el Provider montado siempre: reemplazarlo por un wrapper
 * distinto al hidratar remontaba toda la app y reiniciaba el estado de
 * idioma, filtros y formularios.
 */
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Valor por defecto (coincide con el HTML del servidor).
const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [hydrated, setHydrated] = useState(false);

  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    let saved = null;
    try {
      saved = localStorage.getItem('theme');
    } catch {
      // Si localStorage no está disponible, mantenemos el tema oscuro.
    }
    const initial = saved === 'light' ? 'light' : 'dark';
    setTheme(initial);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(initial);
    setHydrated(true);
  }, []);

  // Aplica el tema al DOM y lo guarda. Se saltea el primer pase para no
  // sobrescribir lo que ya puso el boot script ni escribir antes de leer.
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Tema activo en memoria aunque no se pueda persistir.
    }
  }, [theme, hydrated]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para leer/cambiar el tema desde cualquier componente.
export function useTheme() {
  return useContext(ThemeContext);
}
