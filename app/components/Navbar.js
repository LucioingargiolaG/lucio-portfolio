/**
 * Barra de navegación principal (fija, flotante arriba).
 *
 * Responsabilidades:
 *  - Navegación por anclas a las secciones de la home (#hero, #projects...).
 *  - Switch WEB / IA (cambia el modo de la página).
 *  - Switch de idioma ES / EN (con píldora animada) + botón de tema.
 *  - Menú móvil (hamburguesa) con las mismas opciones.
 *
 * Es un Client Component ('use client') porque usa estado (menú móvil),
 * useEffect (scroll-spy) e interactividad (clicks).
 */
'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/context/ThemeProvider';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';

// Rutas de navegación. El orden determina cuál se muestra de izquierda a derecha.
const navLinks = [
  { key: 'home', href: '#hero' },
  { key: 'projects', href: '#projects' },
  { key: 'howIWork', href: '#how-i-work' },
  { key: 'contact', href: '#contact' },
];

/**
 * Switch WEB / IA.
 * Píldora oscura con "MODO" y resaltado amarillo para la opción activa.
 */
function ModeSwitch() {
  const { mode, setMode } = useMode();

  // Clases para la opción activa (fondo acento + sombra) e inactiva.
  const activeClass =
    'bg-accent text-black rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition-all duration-300 shadow-accent';
  const inactiveClass =
    'text-[var(--ink-soft)] hover:text-[var(--ink-strong)] rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all duration-300';

  return (
    <div className="bg-[var(--bg-pill)] backdrop-blur-md border border-accent-30 rounded-full p-1 flex items-center gap-1.5 shadow-inner">
      {/* Etiqueta "MODO" con puntito animado */}
      <span className="flex items-center gap-1.5 pl-2 pr-1 font-mono text-[10px] font-bold tracking-widest text-accent">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        MODO
      </span>
      {/* Separador vertical */}
      <span className="h-4 w-px bg-[var(--line-medium)]" aria-hidden="true" />
      {/* Botón modo WEB */}
      <button
        type="button"
        onClick={() => setMode('web')}
        className={mode === 'web' ? activeClass : inactiveClass}
        aria-pressed={mode === 'web'}
      >
        WEB
      </button>
      {/* Botón modo IA */}
      <button
        type="button"
        onClick={() => setMode('ia')}
        className={mode === 'ia' ? activeClass : inactiveClass}
        aria-pressed={mode === 'ia'}
      >
        IA
      </button>
    </div>
  );
}

/**
 * Switch ES / EN.
 * Píldora con indicador animado que se desliza entre los dos idiomas.
 * `uid` es un sufijo único para que el layoutId de framer-motion no
 * colisione cuando hay varios switches en pantalla (desktop, móvil, footer).
 */
export function LanguageSwitch({ uid = 'desktop' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className="bg-[var(--bg-pill)] backdrop-blur-md border border-accent-30 rounded-full p-1 flex items-center gap-1 shadow-inner">
      {(['es', 'en']).map((code) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className="relative px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors duration-300"
            aria-pressed={isActive}
          >
            {/* Píldora animada que se mueve al idioma activo */}
            {isActive && (
              <motion.span
                layoutId={`lang-pill-${uid}`}
                className="absolute inset-0 bg-accent rounded-full shadow-accent-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {/* Texto del idioma (por encima de la píldora) */}
            <span
              className={`relative z-10 uppercase transition-colors duration-300 ${
                isActive
                  ? 'text-black font-bold'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink-strong)]'
              }`}
            >
              {code}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Controles de la derecha: selector de idioma y botón de tema.
 */
function Controls() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  // Clase base para los botones tipo "pill" de la derecha.
  const hoverClass =
    'flex items-center gap-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--ink-strong)] rounded-full px-3 py-1.5 cursor-pointer transition-all duration-300 hover:bg-[var(--bg-glass)] hover:scale-105';

  return (
    <>
      <LanguageSwitch />

      {/* Botón de tema: si está oscuro muestra un sol (para ir a light) */}
      <button
        type="button"
        onClick={toggleTheme}
        className={hoverClass}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </>
  );
}

// Componente principal de la barra de navegación.
export default function Navbar() {
  const { t } = useLanguage(); // textos según idioma actual
  const { theme, toggleTheme } = useTheme(); // tema dark/light
  const { setMode } = useMode(); // modo web/ia

  const [mobileOpen, setMobileOpen] = useState(false); // menú móvil abierto?
  const [active, setActive] = useState(navLinks[0].key); // sección visible

  // Navegación inteligente: si la sección no existe en el DOM (p.ej. modo IA),
  // cambia a modo WEB para que aparezca y hace scroll suave.
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    const scroll = () => target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (target) {
      scroll();
    } else {
      setMode('web'); // forzamos modo web (donde existen las secciones)
      if (window.location.pathname !== '/') {
        // En otra página (p.ej. /projects): navegamos a la home con el ancla.
        window.location.href = `/${href}`;
        return;
      }
      // Retraso mínimo para que React aplique el modo web antes del scroll.
      setTimeout(scroll, 120);
    }
    setMobileOpen(false);
  };

  // Bloquea el scroll del body cuando el menú móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Scroll-spy: resalta el enlace de la sección visible en pantalla.
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter(Boolean);

    // IntersectionObserver avisa cuándo una sección entra en el viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = navLinks.find(
              (link) => link.href.slice(1) === entry.target.id
            );
            if (match) setActive(match.key);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' } // detecta el tercio central de pantalla
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const isDark = theme === 'dark';

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-6xl md:w-auto">
      <nav className="bg-[var(--bg-nav)] backdrop-blur-md border-[var(--line-soft)] rounded-full px-6 py-3 flex items-center justify-between md:justify-center gap-8 shadow-lg shadow-black/40">
        {/* Logo */}
        <a
          href="#hero"
          className="text-[var(--ink-strong)] font-bold whitespace-nowrap transition-all duration-300 hover:opacity-80 cursor-pointer"
          onClick={(e) => handleNavClick(e, '#hero')}
        >
          <span className="text-accent">&lt;/&gt;</span> lucio.dev
        </a>

        {/* Enlaces centrales (solo desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = active === link.key;
            return (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink-strong)]'
                }`}
              >
                {t.nav[link.key]}
              </a>
            );
          })}
        </div>

        {/* Controles de la derecha (solo desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <ModeSwitch />
          <Controls />
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[var(--ink-strong)] cursor-pointer p-1 rounded-full transition-all duration-300 hover:bg-[var(--bg-glass)]"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] bg-[var(--bg-nav-solid)] backdrop-blur-md border-[var(--line-soft)] rounded-3xl p-4 space-y-1 shadow-xl shadow-black/40">
          {navLinks.map((link) => {
            const isActive = active === link.key;
            return (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block px-3 py-2.5 text-sm font-bold rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent)] bg-[var(--bg-glass)]'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink-strong)] hover:bg-[var(--bg-glass)]'
                }`}
              >
                {t.nav[link.key]}
              </a>
            );
          })}
          {/* Controles dentro del menú móvil */}
          <div className="flex items-center justify-between pt-3">
            <ModeSwitch />
            <div className="flex items-center gap-3">
              <LanguageSwitch uid="mobile" />
              <button
                type="button"
                onClick={toggleTheme}
                className="text-[var(--ink-soft)] hover:text-[var(--ink-strong)] cursor-pointer rounded-full p-2 transition-all duration-300 hover:bg-[var(--bg-glass)]"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
