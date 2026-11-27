/**
 * Barra de navegación principal (fija, flotante arriba).
 *
 * Responsabilidades:
 *  - Navegación por anclas a las secciones de la home (#main, #projects...).
 *  - Switch WEB / IA (cambia el modo de la página).
 *  - Switch de idioma ES / EN (con píldora animada) + botón de tema.
 *  - Menú móvil (hamburguesa) con las mismas opciones.
 *
 * Es un Client Component ('use client') porque usa estado (menú móvil),
 * useEffect (scroll-spy) e interactividad (clicks).
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeProvider';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import Logo from './Logo';

// Rutas de navegación. El orden determina cuál se muestra de izquierda a derecha.
const navLinks = [
  { key: 'services', href: '#servicios' },
  { key: 'projects', href: '#proyectos' },
  { key: 'howIWork', href: '#como-trabajo' },
  { key: 'contact', href: '#contacto' },
];

// Anclas viejas (en inglés) → nuevas (en español). Así los links compartidos
// antes del renombre (ej. sitio.com/#contact) siguen llevando a su sección.
const legacyAnchors = {
  main: 'inicio',
  projects: 'proyectos',
  'how-i-work': 'como-trabajo',
  contact: 'contacto',
};

/**
 * Switch WEB / IA.
 * Píldora oscura con "MODO" y resaltado amarillo para la opción activa.
 */
function ModeSwitch() {
  const { mode, setMode } = useMode();
  const { t } = useLanguage();

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
        {t.nav.mode}
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
        {t.nav.ai}
      </button>
    </div>
  );
}

/**
 * Switch ES / EN.
 * Píldora con indicador animado que se desliza entre los dos idiomas.
 */
export function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div data-language-switch className="relative isolate flex shrink-0 rounded-full border border-accent-30 bg-[var(--bg-pill)] p-1 shadow-inner backdrop-blur-md">
      <span aria-hidden="true" className={'language-pill absolute inset-y-1 left-1 z-0 w-10 rounded-full bg-accent shadow-accent-lg transition-transform duration-200 motion-reduce:transition-none' + (lang === 'en' ? ' translate-x-full' : '')} />
      {(['es', 'en']).map((code) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className="relative z-10 w-10 shrink-0 rounded-full py-1 text-xs font-semibold cursor-pointer transition-colors duration-300"
            aria-pressed={isActive}
          >
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
  const { t } = useLanguage();

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
        aria-label={t.nav.theme}
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
  const { mode, setMode } = useMode();

  const [mobileOpen, setMobileOpen] = useState(false); // menú móvil abierto?
  const [active, setActive] = useState(null);
  const menuButton = useRef(null);
  const menuPanel = useRef(null);

  // Navegación inteligente: si la sección no existe en el DOM (p.ej. modo IA),
  // cambia a modo WEB para que aparezca y hace scroll suave.
  const handleNavClick = (e, href) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.location.pathname !== '/') {
      setMode('web');
      return;
    }
    e.preventDefault();
    // Refleja la sección en la URL sin recargar ni ensuciar el historial.
    history.replaceState(null, '', href);
    const scroll = () => {
      const target = document.getElementById(href.slice(1));
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
      target?.focus({ preventScroll: true });
      if (href === '#inicio') {
        // "Inicio" siempre vuelve a la parte superior real de la página.
        window.scrollTo({ top: 0, behavior });
        return;
      }
      target?.scrollIntoView({ behavior, block: 'start' });
    };
    if (document.getElementById(href.slice(1))) {
      scroll();
    } else {
      setMode('web'); // forzamos modo web (donde existen las secciones)
      // Retraso mínimo para que React aplique el modo web antes del scroll.
      setTimeout(scroll, 120);
    }
    setMobileOpen(false);
  };

  // Bloquea el scroll del body cuando el menú móvil está abierto.
  useEffect(() => {
    if (!mobileOpen) return;
    const desktop = window.matchMedia('(min-width: 64rem)');
    const closeOnDesktop = (event) => { if (event.matches) setMobileOpen(false); };
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setMobileOpen(false);
      menuButton.current?.focus();
    };
    menuPanel.current?.querySelector('a')?.focus();
    desktop.addEventListener('change', closeOnDesktop);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      desktop.removeEventListener('change', closeOnDesktop);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

  // Al montar en la home: si la URL no tiene ancla, mostramos #inicio.
  // Si trae una ancla vieja (en inglés), la migramos a la nueva y scrolleamos.
  useEffect(() => {
    if (window.location.pathname !== '/') return;
    const raw = window.location.hash.slice(1);
    if (!raw) {
      history.replaceState(null, '', '#inicio');
      return;
    }
    const mapped = legacyAnchors[raw];
    if (mapped) {
      history.replaceState(null, '', `#${mapped}`);
      setTimeout(
        () =>
          document
            .getElementById(mapped)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        300
      );
    }
  }, []);

  // Scroll-spy: resalta el enlace de la sección visible en pantalla y
  // mantiene el ancla de la URL sincronizada con lo que se está viendo.
  useEffect(() => {
    if (window.location.pathname !== '/') return;
    // Incluimos #inicio para que, al volver arriba, la URL también acompañe.
    const ids = ['inicio', 'caso-utap', ...navLinks.map((link) => link.href.slice(1))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    // IntersectionObserver avisa cuándo una sección entra en el viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (window.location.hash !== `#${entry.target.id}`) {
              history.replaceState(null, '', `#${entry.target.id}`);
            }
            const match = navLinks.find(
              (link) => link.href.slice(1) === entry.target.id
            );
            setActive(match?.key ?? null);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' } // detecta el tercio central de pantalla
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [mode]);

  const isDark = theme === 'dark';

  return (
    <>
      <a className="skip-to-content" href="#contenido">{t.nav.skip}</a>
      {/* Backdrop a nivel de pantalla: cerrar tocando fuera del menú.
          Va FUERA del header porque el header tiene transform (-translate-x-1/2)
          y eso haría que "fixed" se posicione respecto al header, no a la pantalla. */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => { setMobileOpen(false); menuButton.current?.focus(); }}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-[max(0.5rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-6xl lg:top-6 lg:w-auto">
      {/* Barra: en móvil usa padding vertical mínimo (py-1.5) para que quede
          lo más arriba y lo más baja posible, sin tapar la foto del Hero. */}
      <nav className="bg-[var(--bg-nav)] backdrop-blur-md border-[var(--line-soft)] rounded-full px-4 py-1.5 flex items-center justify-between lg:justify-center lg:gap-8 lg:px-6 lg:py-3 shadow-lg shadow-black/40">
        {/* Logo */}
        <Link
          href="/#inicio"
          prefetch={false}
          aria-label={t.nav.homeLabel}
          className="text-[var(--ink-strong)] font-bold whitespace-nowrap transition-all duration-300 hover:opacity-80 cursor-pointer"
          onClick={(e) => handleNavClick(e, '#inicio')}
        >
          <Logo />
        </Link>

        {/* Enlaces centrales (solo desktop) */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = active === link.key;
            return (
              <a
                key={link.key}
                href={'/' + link.href}
                aria-current={isActive ? 'location' : undefined}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`link-pretty text-sm font-bold transition-all duration-300 cursor-pointer ${
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
        <div className="hidden lg:flex items-center gap-4">
          <ModeSwitch />
          <Controls />
        </div>

        {/* Tema + botón hamburguesa (móvil): targets de 34–36 px */}
        <div className="lg:hidden flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-[var(--ink-soft)] hover:text-[var(--ink-strong)] cursor-pointer p-2 rounded-full transition-all duration-300 hover:bg-[var(--bg-glass)]"
            aria-label={t.nav.theme}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            ref={menuButton}
            onClick={() => setMobileOpen((open) => !open)}
            className="text-[var(--ink-strong)] cursor-pointer p-2 rounded-full transition-all duration-300 hover:bg-[var(--bg-glass)]"
            aria-label={t.nav.menu}
            aria-controls="mobile-navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Menú móvil desplegable (pegado a la barra, sin espacio).
          Sin backdrop-blur: el panel ya usa un fondo casi opaco
          (--bg-nav-solid) y el blur sobre un fondo animado (estrellas) cuesta
          un recálculo por frame justo al abrir el menú. */}
        <nav id="mobile-navigation" ref={menuPanel} hidden={!mobileOpen} aria-label={t.nav.mobile} onBlur={(event) => {
          const next = event.relatedTarget;
          if (next && !event.currentTarget.contains(next) && next !== menuButton.current) setMobileOpen(false);
        }} className="lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto absolute top-full left-1/2 -translate-x-1/2 w-full bg-[var(--bg-nav-solid)] border-[var(--line-soft)] rounded-3xl p-4 space-y-1 shadow-xl shadow-black/40">
          {navLinks.map((link) => {
            const isActive = active === link.key;
            return (
              <a
                key={link.key}
                href={'/' + link.href}
                aria-current={isActive ? 'location' : undefined}
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
            <LanguageSwitch />
          </div>
        </nav>
      </header>
    </>
  );
}
