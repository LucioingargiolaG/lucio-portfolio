/**
 * Página "Próximamente" del Portafolio Digital.
 *
 * Placeholder con la estética del sitio (badge, ícono flotante de claqueta,
 * título y botón de vuelta) mientras no existe el contenido real de la
 * sección audiovisual. Los textos salen de las traducciones.
 */
'use client';

import Link from 'next/link';
import { Clapperboard, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function ComingSoon() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg-section-glass)] px-6 py-24 text-center">
      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        {/* Badge "Próximamente" */}
        <span className="animate-[fade-up_0.7s_ease-out_both] inline-flex items-center gap-2 rounded-full border border-accent-20 bg-accent-5 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          {t.portfolioDigital.badge}
        </span>

        {/* Ícono flotante de claqueta */}
        <div className="animate-[float_6s_ease-in-out_infinite] mt-10 mb-6">
          <span className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-accent-10 border border-accent-30 text-[var(--accent)] shadow-accent-xl">
            <Clapperboard size={44} />
          </span>
        </div>

        {/* Título */}
        <h1 className="animate-[fade-up_0.7s_ease-out_0.1s_both] text-4xl md:text-6xl font-extrabold text-[var(--ink-strong)]">
          {t.portfolioDigital.title}{' '}
          <span className="text-[var(--accent)]">{t.portfolioDigital.titleAccent}</span>
        </h1>

        {/* Subtítulo explicativo */}
        <p className="animate-[fade-up_0.7s_ease-out_0.2s_both] mt-6 max-w-xl leading-relaxed text-[var(--ink-soft)] text-base md:text-lg">
          {t.portfolioDigital.subtitle}
        </p>

        {/* Botón de vuelta al inicio */}
        <Link
          href="/"
          className="animate-[fade-up_0.7s_ease-out_0.3s_both] group mt-10 inline-flex items-center gap-2 rounded-full border border-[var(--neon-line-strong)] px-6 py-3 text-sm font-bold text-[var(--ink)] transition-all duration-300 hover:border-[var(--neon)] hover:text-[var(--neon)]"
        >
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          {t.portfolioDigital.back}
        </Link>
      </div>
    </section>
  );
}
