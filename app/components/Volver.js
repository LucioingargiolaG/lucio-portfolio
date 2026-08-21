/**
 * Botón "Volver" que aparece al pie de cada sección y lleva de vuelta
 * al inicio (o al href indicado, útil en páginas como /proyectos).
 *
 * Es un ancla simple con animación hover (flecha que sube).
 */
'use client';

import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Volver({ href = '#inicio' }) {
  const { t } = useLanguage();

  return (
    <div className="mt-12 flex justify-center">
      <a
        href={href}
        className="group inline-flex items-center gap-2.5 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors duration-300"
      >
        {/* Círculo con flecha hacia arriba (se eleva al hover) */}
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--bg-card)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent-50 group-hover:shadow-accent-sm">
          <ArrowUp size={15} />
        </span>
        {t.nav.back}
      </a>
    </div>
  );
}
