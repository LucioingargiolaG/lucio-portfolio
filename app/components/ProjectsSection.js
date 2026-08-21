/**
 * Sección de proyectos (carrusel lineal) de la home.
 *
 * Muestra los proyectos como tarjetas en una fila deslizable horizontal
 * (scroll-snap): el usuario arrastra o usa las flechas ◀ ▶ para avanzar.
 * Cada tarjeta queda centrada al hacer snap.
 *
 * Si no llegan proyectos desde MongoDB (lista vacía), usa `fallbackProjects`
 * para que la sección nunca quede vacía.
 *
 * Solo se muestra en modo WEB.
 */
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import Volver from './Volver';

// Proyectos de respaldo cuando MongoDB no tiene datos o no está conectado.
const fallbackProjects = [
  {
    _id: 'fallback-1',
    title: 'E-commerce Store',
    description: 'Tienda online con carrito y checkout.',
    technologies: ['Next.js', 'Tailwind', 'Stripe'],
    image: '🛒',
  },
  {
    _id: 'fallback-2',
    title: 'Landing Page',
    description: 'Landing optimizada para conversión.',
    technologies: ['React', 'Framer Motion'],
    image: '🚀',
  },
  {
    _id: 'fallback-3',
    title: 'Dashboard Analytics',
    description: 'Panel con gráficos en tiempo real.',
    technologies: ['Angular', 'Node.js', 'Chart.js'],
    image: '📊',
  },
];

export default function ProjectsSection({ projects }) {
  const { t } = useLanguage();
  const { mode } = useMode();
  const items = projects.length > 0 ? projects : fallbackProjects;
  const trackRef = useRef(null); // ref al contenedor deslizable del carrusel

  if (mode !== 'web') return null;

  // Desplaza el carrusel una tarjeta hacia la izquierda (dir=-1) o
  // derecha (dir=1). Calcula el paso midiendo el ancho real de una tarjeta.
  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const step = card ? card.offsetWidth + 24 : 364; // ancho + gap de 24px
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <>
      <section
        id="proyectos"
        className="bg-[var(--bg-section-glass)] grid grid-cols-1 md:grid-cols-12 gap-12 items-center max-w-7xl mx-auto px-6 py-24"
      >
      {/* Carrusel (columna izquierda, 7/12 del ancho) */}
      <div className="md:col-span-7 relative">
        <div
          ref={trackRef}
          className="no-scrollbar flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 py-2"
        >
          {items.map((project) => (
            <div
              key={project._id}
              data-card
              className="snap-center shrink-0 w-[300px] md:w-[340px] flex"
            >
              <Link href="/proyectos" className="block w-full">
                <article className="group relative w-full overflow-hidden rounded-2xl border border-[var(--neon-line)] bg-[var(--bg-card)] flex flex-col transition-all duration-300 hover:border-[var(--neon)] hover:shadow-[0_0_40px_var(--neon-glow)]">
                  {/* Panel visual: fondo con patrón de puntos + emoji del proyecto */}
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--bg-section-alt)] to-[var(--bg-section)]">
                    {/* Grid de puntos decorativo */}
                    <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(var(--neon)_1px,transparent_1px)] [background-size:16px_16px]" />
                    {/* Halo de neón detrás del emoji */}
                    <div className="absolute -inset-8 rounded-full bg-[var(--neon-ambient)] blur-3xl transition-all duration-500 group-hover:bg-[var(--neon-halo)]" />
                    {/* Emoji como "imagen" del proyecto */}
                    <span className="relative text-7xl drop-shadow-[0_0_20px_var(--neon-glow)] transition-transform duration-500 group-hover:scale-110">
                      {project.image}
                    </span>
                    {/* Badge de categoría */}
                    {project.category && (
                      <span className="absolute top-3 left-3 rounded-full border border-[var(--neon-line)] bg-[var(--bg-card)]/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--neon)] backdrop-blur-sm">
                        {t.projects.category[project.category] ?? project.category}
                      </span>
                    )}
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="text-lg font-bold text-[var(--ink-strong)] transition-colors duration-300 group-hover:text-[var(--neon)]">
                      {project.title}
                    </h3>
                    {/* Descripción (máx. 2 líneas) */}
                    {project.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-[var(--ink-soft)]">
                        {project.description}
                      </p>
                    )}
                    {/* Chips de tecnologías (primeras 3 + "+N") */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {(project.technologies ?? []).slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-[var(--neon-line)] bg-[var(--bg-section)] px-2 py-0.5 text-[10px] font-medium text-[var(--neon)]"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.technologies?.length ?? 0) > 3 && (
                        <span className="text-[10px] font-semibold text-[var(--neon)]">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                    {/* CTA "Ver proyectos" */}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-bold text-[var(--neon)]">
                      {t.hero.viewProjects}
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>

        {/* Flecha anterior */}
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Anterior"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white opacity-70 hover:opacity-100 rounded-full p-2 transition-all cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        {/* Flecha siguiente */}
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Siguiente"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white opacity-70 hover:opacity-100 rounded-full p-2 transition-all cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Texto explicativo (columna derecha, 5/12) */}
      <div className="md:col-span-5">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--ink-strong)] mb-6 tracking-tight">
          {t.projects.carouselTitle}
        </h2>
        <p className="text-[var(--ink-soft)] mb-6 leading-relaxed">
          {t.projects.carouselDesc}
        </p>
        <h3 className="text-2xl font-semibold text-[var(--ink-strong)] mb-1">
          {t.projects.talkSubtitle}
        </h3>
        <p className="text-[var(--ink-soft)] mb-8">{t.projects.talkText}</p>
        {/* Input decorativo de "tu nombre" (sin funcionalidad real aún) */}
        <input
          type="text"
          placeholder={t.projects.namePlaceholder}
          className="w-full bg-transparent border-b border-[var(--line-medium)] pb-3 text-sm text-[var(--ink-strong)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      </section>
      {/* Botón volver */}
      <Volver />
    </>
  );
}
