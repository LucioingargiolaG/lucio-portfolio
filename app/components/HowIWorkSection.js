/**
 * Sección "Cómo trabajo" de la home.
 *
 * Muestra los 4 pilares de trabajo (código limpio, rendimiento, UX/UI,
 * aprendizaje continuo) como tarjetas con efecto 3D al hover, más una fila
 * de estadísticas. El contenido (títulos y pilares) sale de las
 * traducciones en LanguageContext.
 *
 * Solo se muestra en modo WEB (si mode !== 'web' devuelve null).
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import Link from 'next/link';
import { Bolt, Rocket, Palette, BookOpen } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import Volver from './Volver';

// Mapea el nombre de icono (guardado en las traducciones) al componente.
const PILLAR_ICONS = { bolt: Bolt, rocket: Rocket, palette: Palette, book: BookOpen };

// Hook local de fade-on-scroll (equivalente al componente FadeInUp,
// reimplementado acá para no depender de otro archivo).
function useInViewFade() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion(); // prefers-reduced-motion (F2)

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return; // con reduce: sin animación, visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return { ref, inView, reduced };
}

// Componente que aplica el fade-up a su contenido.
function FadeInUp({ children, delay = 0, className = '' }) {
  const { ref, inView, reduced } = useInViewFade();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView || reduced ? 1 : 0,
        transform: reduced ? 'none' : inView ? 'translateY(0)' : 'translateY(30px)',
        transition: reduced
          ? 'none'
          : `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HowIWorkSection() {
  const { t } = useLanguage();
  const { mode } = useMode();

  if (mode !== 'web') return null; // esta sección solo existe en modo web

  return (
    <section id="como-trabajo" tabIndex={-1} className="scroll-mt-[64px] lg:scroll-mt-[84px] py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-section-glass)] relative">
      <div className="max-w-6xl mx-auto">
        {/* Badge de sección */}
        <FadeInUp>
          <span className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--accent)] border border-accent-20 bg-accent-5 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            {t.howIWork.badge}
          </span>
        </FadeInUp>

        {/* Título */}
        <FadeInUp delay={150}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-7 text-[var(--ink-strong)]">
            {t.howIWork.title}{' '}
            <span className="text-[var(--accent)]">{t.howIWork.titleAccent}</span>
          </h2>
        </FadeInUp>

        <FadeInUp className="mb-8 rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6">
          <h3 className="text-xl font-bold text-[var(--ink-strong)]">{t.recruiter.profile.role}</h3>
          <p className="mt-2 text-[var(--ink-soft)]">{t.recruiter.profile.note}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.recruiter.profile.items.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-sm font-semibold text-[var(--ink-strong)]">{label}</dt>
                <dd className="mt-0.5 text-sm text-[var(--ink-soft)]">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[var(--accent)]">
            <Link className="link-pretty" href="/proyectos" prefetch={false}>{t.howIWork.projects}</Link>
            <a className="link-pretty" href="#cv-tecnico">{t.howIWork.cv}</a>
          </div>
        </FadeInUp>

        {/* Tarjetas de los pilares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.howIWork.pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[p.icon];
            return (
            <FadeInUp key={p.title} delay={100 * i + 200} className="[perspective:1200px]">
              {/* Efecto 3D al hover: rota levemente en X e Y + escala */}
              <article
                className="[transform-style:preserve-3d] transition-all duration-500 hover:rotate-y-6 hover:rotate-x-2 hover:scale-105 bg-[var(--bg-card)] border-[var(--line)] rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-black/50"
              >
                {/* Ícono del pilar */}
                <span className="inline-flex items-center justify-center w-12 h-12 bg-accent-10 rounded-xl mb-4 text-[var(--accent)]">
                  {Icon && <Icon size={22} />}
                </span>
                <h3 className="text-[var(--ink-strong)] text-lg font-bold mb-2">{p.title}</h3>
                <p className="text-[var(--ink-soft)] text-sm leading-relaxed">{p.text}</p>
              </article>
            </FadeInUp>
            );
          })}
        </div>

      </div>

      {/* Botón volver */}
      <Volver />
    </section>
  );
}
