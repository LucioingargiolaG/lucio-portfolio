/**
 * Sección Hero (portada) de la home.
 *
 * Contiene:
 *  - Avatar flotante con anillo de neón giratorio y pulsos radar.
 *  - Badge de disponibilidad, saludo, nombre, rol y descripción.
 *  - Carrusel (marquee) de skills (solo en modo web).
 *  - Botón CV con menú desplegable para descargar CV ES/EN (usando portal
 *    de React para renderizarlo fuera del flujo del layout).
 *  - Botón de contacto y link a la página de proyectos.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Download, Send, ChevronDown, Hand, ArrowRight, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import SkillsMarquee from './SkillsMarquee';

export default function HeroSection() {
  const { t } = useLanguage(); // textos según idioma
  const { mode } = useMode(); // modo web/ia

  // Separamos el nombre en nombre (primera palabra) y apellido (resto)
  // para poder resaltar el apellido con color neón.
  const [firstName, ...rest] = t.hero.title.split(' ');
  const lastName = rest.join(' ');

  // Menú de descarga de CV (abierto/cerrado y posición en pantalla).
  const [cvOpen, setCvOpen] = useState(false);
  const [cvPos, setCvPos] = useState(null); // {left, top} donde aparece el menú
  const cvRef = useRef(null);

  // Alterna el menú de CV. Cuando se abre, calcula la posición del botón
  // (con getBoundingClientRect) para anclar el desplegable justo debajo.
  const toggleCv = () => {
    if (cvOpen) {
      setCvOpen(false);
      return;
    }
    if (cvRef.current) {
      const r = cvRef.current.getBoundingClientRect();
      setCvPos({ left: r.left + r.width / 2, top: r.bottom });
    }
    setCvOpen(true);
  };

  // Cierra el menú de CV con Escape, click afuera, scroll o resize.
  useEffect(() => {
    if (!cvOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setCvOpen(false);
    };
    const onClick = (e) => {
      if (cvRef.current && !cvRef.current.contains(e.target)) setCvOpen(false);
    };
    const onScroll = () => setCvOpen(false);
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [cvOpen]);

  // Clase compartida por los ítems del menú de CV.
  const cvItemClass =
    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--neon)] hover:bg-[var(--bg-glass)] transition-colors cursor-pointer';

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-start md:justify-center bg-[var(--bg-section-glass)] text-[var(--ink-strong)] px-6 pt-28 pb-16 md:py-20 overflow-hidden"
    >
      {/* Brillo ambiental central + línea de horizonte neón */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon)]/40 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Avatar flotante con anillo de neón rotatorio y pulso radar */}
        <div id="profile-avatar" className="relative mt-8 mb-4 animate-[float_6s_ease-in-out_infinite]">
          {/* Halo de luz detrás del avatar */}
          <div className="absolute -inset-6 rounded-full bg-[var(--neon-warm-halo)] blur-3xl" />
          {/* Anillo cónico de neón girando (rojo + amarillo) */}
          <div className="absolute -inset-2.5 rounded-full bg-[conic-gradient(from_0deg,transparent,var(--neon),transparent_30%,var(--neon-warm),transparent_60%,var(--neon-strong),transparent_78%)] blur-[3px] animate-[spin-slow_9s_linear_infinite]" />
          {/* Pulsos radar: ondas circulares que se expanden y desaparecen */}
          <div className="absolute -inset-1 rounded-full border-2 border-[var(--neon-ring)] animate-[ring-pulse_3.5s_ease-out_infinite]" />
          <div className="absolute -inset-1 rounded-full border-2 border-[var(--neon-ring-soft)] animate-[ring-pulse_3.5s_ease-out_1.75s_infinite]" />
          {/* Foto circular (next/image con prioridad = carga temprana) */}
          <div className="relative rounded-full p-1 border border-[var(--neon-line)] bg-[var(--bg-card)]/60 backdrop-blur-sm">
            <Image
              src="/profile.jpg"
              alt={t.hero.title}
              width={192}
              height={192}
              priority
              className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border-2 border-[var(--neon-line-strong)] shadow-[0_0_35px_var(--neon-glow)]"
            />
          </div>
        </div>

        {/* Badge de disponibilidad */}
        <span className="animate-[fade-up_0.7s_ease-out_both] font-mono inline-flex items-center gap-2 bg-[var(--neon-badge-bg)] border border-[var(--neon-line)] text-[var(--neon)] rounded-full px-4 py-1.5 text-xs mb-5">
          <span className="w-2 h-2 rounded-full bg-[var(--neon-warm)] animate-pulse" />
          {t.hero.available}
        </span>

        {/* Saludo */}
        <p className="animate-[fade-up_0.7s_ease-out_0.1s_both] flex items-center gap-2.5 text-[var(--ink-soft)] text-sm md:text-base mb-2">
          <Hand size={18} className="text-[var(--neon)]" />
          {t.hero.greeting}
        </p>

        {/* Nombre como titular principal (apellido en neón con glow) */}
        <h1 className="animate-[fade-up_0.7s_ease-out_0.2s_both] text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-4">
          {firstName}{' '}
          <span className="text-[var(--neon)] [text-shadow:0_0_20px_var(--neon-glow),0_0_40px_var(--neon-glow-soft)]">
            {lastName}
          </span>
        </h1>

        {/* Rol con acento neón */}
        <h2 className="animate-[fade-up_0.7s_ease-out_0.3s_both] font-mono text-[var(--neon)] font-semibold uppercase tracking-[0.3em] text-sm md:text-base mb-6">
          {t.hero.role}
        </h2>

        {/* Descripción */}
        <p
          className="animate-[fade-up_0.7s_ease-out_0.4s_both] font-bold text-[var(--ink-soft)] text-base md:text-lg leading-relaxed max-w-2xl mb-8"
          style={{ fontFamily: 'var(--font-gotham)' }}
        >
          {t.hero.description}
        </p>

        {/* Stack técnico por categorías en marquee (solo modo web) */}
        {mode === 'web' && (
          <div className="animate-[fade-up_0.7s_ease-out_0.5s_both] w-full mb-10">
            <SkillsMarquee />
          </div>
        )}

        {/* Botones */}
        <div className="animate-[fade-up_0.7s_ease-out_0.6s_both] flex flex-wrap items-center justify-center gap-4">
          {/* Menú CV con portal a document.body para evitar recortes */}
          <div className="relative" ref={cvRef}>
            <button
              type="button"
              onClick={toggleCv}
              aria-haspopup="menu"
              aria-expanded={cvOpen}
              className="border border-[var(--neon-line-strong)] hover:border-[var(--neon)] text-[var(--ink)] rounded-full px-6 py-3 flex items-center gap-2 text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              <Download size={16} className="text-[var(--neon)]" />
              {t.hero.cv}
              <ChevronDown
                size={14}
                className={`text-[var(--ink-faint)] transition-transform duration-300 ${
                  cvOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* createPortal renderiza el menú dentro de document.body,
                anclado en la posición del botón. AnimatePresence anima
                la entrada y salida. */}
            {typeof document !== 'undefined' &&
              createPortal(
                <AnimatePresence>
                  {cvOpen && cvPos && (
                    <motion.div
                      initial={{ opacity: 0, x: '-50%', y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: '-50%', y: -8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      role="menu"
                      style={{
                        position: 'fixed',
                        left: cvPos.left,
                        top: cvPos.top + 12,
                        zIndex: 50,
                      }}
                      className="w-56 rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-nav-solid)] backdrop-blur-md p-2 shadow-xl shadow-black/40"
                    >
                      {/* Descarga CV en español */}
                      <a
                        href="/cv-es.pdf"
                        download
                        onClick={() => setCvOpen(false)}
                        role="menuitem"
                        className={cvItemClass}
                      >
                        <FileDown size={15} className="text-[var(--neon)]" />
                        {t.cv.es}
                      </a>
                      {/* Descarga CV en inglés */}
                      <a
                        href="/cv-en.pdf"
                        download
                        onClick={() => setCvOpen(false)}
                        role="menuitem"
                        className={cvItemClass}
                      >
                        <FileDown size={15} className="text-[var(--neon)]" />
                        {t.cv.en}
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body
              )}
          </div>

          {/* Botón principal de contacto */}
          <a
            href="#contact"
            className="bg-[var(--neon)] hover:bg-[var(--neon-strong)] text-black shadow-[0_0_20px_var(--neon-glow)] hover:shadow-[0_0_35px_var(--neon-glow)] rounded-full px-6 py-3 flex items-center gap-2 text-sm font-bold transition-all duration-300"
          >
            <Send size={16} />
            {t.hero.contact}
          </a>

          {/* Link secundario a la página /projects */}
          <Link
            href="/projects"
            className="group flex items-center gap-2 text-sm text-[var(--ink-soft)] hover:text-[var(--neon)] transition-colors duration-300"
          >
            {t.hero.viewProjects}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Indicador inferior de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[var(--ink-faint)] text-xs tracking-widest uppercase">
          {t.hero.scroll}
        </span>
        <ChevronDown size={16} className="text-[var(--ink-faint)] animate-bounce" />
      </div>
    </section>
  );
}
