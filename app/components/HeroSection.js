/**
 * Sección Hero (portada) de la home.
 *
 * Jerarquía del Hero (actualizada):
 *  - Avatar (foto de perfil) — protagonista.
 *  - Saludo ("Hola, soy").
 *  - Nombre (identidad): "Lucio Ingargiola" — apellido en neón.
 *  - Etiqueta profesional (línea ligera debajo del nombre):
 *    "DESARROLLO WEB · MARKETING DIGITAL".
 *  - Título principal comercial: "Transformo ideas en experiencias digitales."
 *  - Descripción breve, tipografía regular, menos peso visual.
 *  - Botones: contacto, ver mi trabajo, CV (ES/EN).
 *  - "Ver caso de estudio".
 *  - Carrusel (marquee) de skills — solo modo web, menos densidad visual.
 *
 * Comportamiento:
 *  - Respeta prefers-reduced-motion: sin animaciones del hero al cargar
 *    (framer-motion `useReducedMotion`).
 *  - iconos decorativos marcados `aria-hidden` (WCAG 2.2 AA).
 *  - Menú de CV con portal a `document.body` (fuera del flujo del layout).
 *  - Escritura en Responsive: vertical en mobile, misma jerarquía en desktop.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Download, Send, ChevronDown, Hand, ArrowRight, FileDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import SkillsMarquee from './SkillsMarquee';

// Clases de animación estáticas (requeridas por el escáner de Tailwind v4).
const anim = {
  badge: 'animate-[fade-up_0.7s_ease-out_both]',
  greeting: 'animate-[fade-up_0.7s_ease-out_0.1s_both]',
  name: 'animate-[fade-up_0.7s_ease-out_0.2s_both]',
  professionalTag: 'animate-[fade-up_0.7s_ease-out_0.13s_both]',
  mainTitle: 'animate-[fade-up_0.7s_ease-out_0.25s_both]',
  description: 'animate-[fade-up_0.7s_ease-out_0.3s_both]',
  marquee: 'animate-[fade-up_0.7s_ease-out_0.5s_both]',
  buttons: 'animate-[fade-up_0.7s_ease-out_0.6s_both]',
  avatarFloat: 'animate-[float_6s_ease-in-out_infinite]',
  ringSpin: 'animate-[spin-slow_9s_linear_infinite]',
  radar: 'animate-[ring-pulse_3.5s_ease-out_infinite]',
  radarSoft: 'animate-[ring-pulse_3.5s_ease-out_1.75s_infinite]',
};

export default function HeroSection() {
  const { t } = useLanguage(); // textos según idioma
  const { mode, setMode } = useMode(); // modo web/ia

  // Respeta prefers-reduced-motion.
  const reduced = useReducedMotion();

  // Devuelve la clase de animación, o '' cuando el sistema pide movimiento
  // reducido (prefers-reduced-motion).
  const on = (cls) => (reduced ? '' : cls);

  // Ancla "Ver caso de estudio": si la sección no existe (modo IA), primero
  // activa el modo web y después desplaza. Usamos scrollIntoView para que se
  // respete el scroll-margin-top de la sección y el título no quede debajo
  // del navbar fijo.
  const handleCaseStudy = (e) => {
    e.preventDefault();
    history.replaceState(null, '', '#caso-utap');
    const scrollToCase = () =>
      document
        .getElementById('caso-utap')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (document.getElementById('caso-utap')) {
      scrollToCase();
    } else {
      setMode('web');
      setTimeout(scrollToCase, 150);
    }
  };

  // Separamos el nombre en nombre (primera palabra) y apellido (resto)
  // para poder resaltar el apellido con color neón.
  const [firstName, ...rest] = t.hero.title.split(' ');
  const lastName = rest.join(' ');

  // Menú de descarga de CV (abierto/cerrado y posición en pantalla).
  const [cvOpen, setCvOpen] = useState(false);
  const [cvPos, setCvPos] = useState(null); // {left, top} donde aparece el menú
  const cvRef = useRef(null);
  const cvMenuRef = useRef(null); // menú portal: no se cierra al hacer clic en él

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
      // El menú vive en un portal (document.body): ignorar sus clicks para
      // que no se desmonte el <a download> antes de iniciar la descarga.
      if (cvRef.current?.contains(e.target)) return;
      if (cvMenuRef.current?.contains(e.target)) return;
      setCvOpen(false);
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
    'link-pretty flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--neon)] hover:bg-[var(--bg-glass)] transition-colors cursor-pointer';

  return (
    <section
      id="inicio"
      // El Navbar fijo (top-6, altura ~60px) cubre el inicio de la página:
      // scroll-margin-top hace que el ancla #inicio deje la sección abajo del
      // menú al hacer scroll a la cima. No cambia el diseño, solo el anclado.
      className="relative min-h-screen flex flex-col items-center justify-start md:justify-center bg-[var(--bg-section-glass)] text-[var(--ink-strong)] px-6 pt-20 pb-16 md:py-20 overflow-hidden scroll-mt-[64px] lg:scroll-mt-[84px]"
    >
      {/* Brillo ambiental central + línea de horizonte neón */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon)]/40 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full min-w-0 max-w-4xl mx-auto">
        {/* Avatar flotante con anillo de neón rotatorio y pulso radar */}
        <div id="profile-avatar" className={`relative mt-6 mb-4 ${on(anim.avatarFloat)}`}>
          {/* Halo de luz detrás del avatar */}
          <div className="absolute -inset-6 rounded-full bg-[var(--neon-warm-halo)] blur-3xl" />
          {/* Anillo cónico de neón girando (rojo + amarillo) */}
          <div
            className={`absolute -inset-2.5 rounded-full bg-[conic-gradient(from_0deg,transparent,var(--neon),transparent_30%,var(--neon-warm),transparent_60%,var(--neon-strong),transparent_78%)] blur-[3px] ${on(anim.ringSpin)}`}
          />
          {/* Pulsos radar: ondas circulares que se expanden y desaparecen */}
          <div
            className={`absolute -inset-1 rounded-full border-2 border-[var(--neon-ring)] ${on(anim.radar)}`}
          />
          <div
            className={`absolute -inset-1 rounded-full border-2 border-[var(--neon-ring-soft)] ${on(anim.radarSoft)}`}
          />
          {/* Foto circular (next/image con prioridad = carga temprana) */}
          <div className="relative rounded-full p-1 border border-[var(--neon-line)] bg-[var(--bg-card)]/60 backdrop-blur-sm">
            <Image
              src="/profile.webp"
              alt={t.hero.title}
              width={192}
              height={192}
              priority
              className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-2 border-[var(--neon-line-strong)] shadow-[0_0_35px_var(--neon-glow)]"
            />
          </div>
        </div>

        {/* Badge de disponibilidad */}
        <span className={`${on(anim.badge)} font-mono inline-flex items-center gap-2 bg-[var(--neon-badge-bg)] border border-[var(--neon-line)] text-[var(--neon)] rounded-full px-4 py-1.5 text-xs mb-2`}>
          <span className="w-2 h-2 rounded-full bg-[var(--neon-warm)] animate-pulse" aria-hidden="true" />
          {t.hero.available}
        </span>

        {/* Saludo */}
        <p className={`${on(anim.greeting)} flex items-center gap-2.5 text-[var(--ink-soft)] text-sm md:text-base mb-0`}>
          <Hand size={18} className="text-[var(--neon)]" aria-hidden="true" />
          {t.hero.greeting}
        </p>

        {/* Nombre como titular principal (apellido en neón con glow) */}
        <h1 className={`${on(anim.name)} text-3xl md:text-7xl font-bold leading-tight tracking-tight mb-2`}>
          {firstName}{' '}
          <span className="text-[var(--neon)] [text-shadow:0_0_20px_var(--neon-glow),0_0_40px_var(--neon-glow-soft)]">
            {lastName}
          </span>
        </h1>

        {/* Etiqueta profesional (línea ligera justo debajo del nombre) */}
        <p className={`${on(anim.professionalTag)} font-mono text-[var(--ink-strong)] font-semibold text-xs md:text-sm uppercase tracking-[0.2em] mb-3`}>
          {t.hero.professionalTag}
        </p>

        {/* Título principal comercial */}
        <h2 className={`${on(anim.mainTitle)} text-lg md:text-4xl font-bold leading-tight tracking-tight max-w-2xl mb-2 text-[var(--ink-strong)]`}>
          {t.hero.mainTitle}
        </h2>

        {/* Descripción: tipografía regular, menos peso visual */}
        <p
          className={`${on(anim.description)} font-normal text-[var(--ink-soft)] text-sm md:text-base leading-relaxed max-w-2xl mb-8`}
        >
          {t.hero.description}
        </p>

        {/* Botones */}
        <div className={`${on(anim.buttons)} flex flex-wrap items-center justify-center gap-4`}>
          {/* Botón principal de contacto */}
          <a
            href="#contacto"
            className="bg-[var(--neon)] hover:bg-[var(--neon-strong)] text-black shadow-[0_0_20px_var(--neon-glow)] hover:shadow-[0_0_35px_var(--neon-glow)] rounded-full px-6 py-3 flex items-center gap-2 text-sm font-bold transition-all duration-300"
          >
            <Send size={16} aria-hidden="true" />
            {t.hero.contact}
          </a>

          {/* Link secundario a la página /proyectos */}
          <Link
            href="/proyectos"
            className="border border-[var(--neon-line-strong)] hover:border-[var(--neon)] text-[var(--ink)] rounded-full px-6 py-3 flex items-center gap-2 text-sm font-semibold transition-all duration-300"
          >
            {t.hero.viewProjects}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          {/* Menú CV con portal a document.body para evitar recortes */}
          <div className="relative" ref={cvRef}>
            <button
              type="button"
              onClick={toggleCv}
              aria-haspopup="menu"
              aria-expanded={cvOpen}
              className="text-[var(--ink-soft)] hover:text-[var(--neon)] rounded-full px-4 py-3 flex items-center gap-2 text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              <Download size={16} className="text-[var(--neon)]" aria-hidden="true" />
              {t.hero.cv}
              <ChevronDown
                size={14}
                aria-hidden="true"
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
                      ref={cvMenuRef}
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
                        href="/CV_Desarrollo_ES.pdf"
                        download
                        onClick={() => setCvOpen(false)}
                        role="menuitem"
                        className={cvItemClass}
                      >
                        <FileDown size={15} className="text-[var(--neon)]" aria-hidden="true" />
                        {t.cv.es}
                      </a>
                      {/* Descarga CV en inglés */}
                      <a
                        href="/CV_Development_EN.pdf"
                        download
                        onClick={() => setCvOpen(false)}
                        role="menuitem"
                        className={cvItemClass}
                      >
                        <FileDown size={15} className="text-[var(--neon)]" aria-hidden="true" />
                        {t.cv.en}
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body
              )}
          </div>
        </div>

        {/* Stack técnico por categorías en marquee (más abajo, después de los CTA) */}
        {mode === 'web' && (
          <div className={`${on(anim.marquee)} w-full mb-6`}>
            <SkillsMarquee />
          </div>
        )}

        {/* Prueba social verificable: el proyecto real que ya está en uso */}
        <a
          href="#caso-utap"
          onClick={handleCaseStudy}
          className="link-pretty group mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)] transition-colors duration-300 hover:text-[var(--neon)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)]" aria-hidden="true" />
          {t.utap.viewCase}
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>
      </div>

      {/* Indicador inferior de scroll */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[var(--ink-faint)] text-xs tracking-widest uppercase">
          {t.hero.scroll}
        </span>
        <ChevronDown
          size={16}
          className={`text-[var(--ink-faint)] ${reduced ? '' : 'animate-bounce'}`}
        />
      </div>
    </section>
  );
}
