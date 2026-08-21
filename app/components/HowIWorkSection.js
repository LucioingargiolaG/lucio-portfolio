/**
 * Sección "Cómo trabajo" de la home.
 *
 * Muestra los 4 pilares de trabajo (código limpio, rendimiento, UX/UI,
 * aprendizaje continuo) como tarjetas con efecto 3D al hover, más una fila
 * de estadísticas. El contenido (títulos, pilares y stats) sale de las
 * traducciones en LanguageContext.
 *
 * Solo se muestra en modo WEB (si mode !== 'web' devuelve null).
 */
'use client';

import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

  return { ref, inView };
}

// Componente que aplica el fade-up a su contenido.
function FadeInUp({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInViewFade();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
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
    <section id="como-trabajo" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-section-glass)] relative">
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-12 text-[var(--ink-strong)]">
            {t.howIWork.title}{' '}
            <span className="text-[var(--accent)]">{t.howIWork.titleAccent}</span>
          </h2>
        </FadeInUp>

        {/* Tarjetas de los pilares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
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

        {/* Fila de estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {t.howIWork.stats.map((s, i) => (
            <FadeInUp key={s.label} delay={100 * i + 300}>
              <div className="rounded-xl p-5 text-center bg-[var(--bg-card)] border-[var(--line)] transition-all duration-300 hover:border-accent-40">
                <strong className="text-3xl font-extrabold block text-[var(--accent)]">
                  {s.value}
                </strong>
                <span className="text-xs mt-1 block text-[var(--ink-muted)]">{s.label}</span>
              </div>
            </FadeInUp>
          ))}
        </div>
      </div>

      {/* Botón volver */}
      <Volver />
    </section>
  );
}
