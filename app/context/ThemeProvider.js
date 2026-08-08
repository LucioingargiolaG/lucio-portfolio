/**
 * Contexto de TEMA: 'dark' | 'light'.
 *
 * Gestiona el tema oscuro/claro de toda la app:
 *  - Lee el tema guardado en localStorage (si existe).
 *  - Aplica la clase `dark` o `light` en <html> y <body> (los estilos CSS
 *    de globals.css reaccionan a esas clases).
 *  - Guarda la preferencia en localStorage para recordarla.
 *
 * `mounted` evita un flash/error de hidratación: antes del montaje renderiza
 * un wrapper oscuro y solo después aplica el tema real.
 */
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Valor por defecto.
const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Al montar, leemos el tema guardado del usuario.
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
    }
  }, []);

  // Aplicamos el tema al DOM y lo guardamos. Se ejecuta al cambiar `theme`.
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Antes de montar devolvemos el children con tema oscuro fijo para evitar
  // diferencias entre el HTML del servidor y el cliente (hidratación).
  if (!mounted) {
    return <div className="dark">{children}</div>;
  }

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
