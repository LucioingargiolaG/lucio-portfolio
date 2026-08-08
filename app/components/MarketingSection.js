/**
 * Sección de Marketing Digital de la home.
 *
 * Muestra servicios de marketing (landing pages, SEO, contenido, redes,
 * email y analítica) como tarjetas, un enlace destacado al Portafolio
 * Digital y un CTA final de contacto. Incluye un botón para descargar el
 * "CV de edición" (cv-edicion.pdf).
 *
 * Solo se muestra en modo WEB.
 */
'use client';

import Link from 'next/link';
import { Rocket, TrendingUp, FileText, Share2, Mail, BarChart3, ArrowRight, Clapperboard, FileDown } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import FadeInUp from './FadeInUp';
import Volver from './Volver';

// Mapeo de iconos declarados en las traducciones a componentes lucide-react
const icons = {
  rocket: Rocket,
  trending: TrendingUp,
  file: FileText,
  share: Share2,
  mail: Mail,
  chart: BarChart3,
};

export default function MarketingSection() {
  const { t } = useLanguage();
  const { mode } = useMode();

  if (mode !== 'web') return null;

  return (
    <section
      id="marketing"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-section-glass)] relative"
    >
      <div className="max-w-6xl mx-auto">
        {/* Encabezado: badge de sección + descarga del CV de edición */}
        <FadeInUp>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--accent)] border border-accent-20 bg-accent-5 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              {t.marketing.badge}
            </span>
            <a
              href="/cv-edicion.pdf"
              download
              className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--ink-soft)] border border-[var(--line)] bg-[var(--bg-card)] rounded-full px-4 py-1.5 transition-all duration-300 hover:border-accent-50 hover:text-[var(--accent)] hover:-translate-y-0.5"
            >
              <FileDown size={14} className="text-[var(--accent)]" />
              {t.marketing.cvEditing}
            </a>
          </div>
        </FadeInUp>

        {/* Título */}
        <FadeInUp delay={150}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-4 text-[var(--ink-strong)]">
            {t.marketing.title}{' '}
            <span className="text-[var(--accent)]">{t.marketing.titleAccent}</span>
          </h2>
        </FadeInUp>

        {/* Descripción */}
        <FadeInUp delay={250}>
          <p className="text-[var(--ink-soft)] text-base sm:text-lg max-w-2xl mb-12 leading-relaxed">
            {t.marketing.description}
          </p>
        </FadeInUp>

        {/* Grilla de servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {t.marketing.services.map((service, i) => {
            const Icon = icons[service.icon]; // ícono según la traducción
            return (
              <FadeInUp key={service.title} delay={100 * i + 200} className="h-full">
                <article className="h-full bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl p-6 transition-all duration-300 hover:border-accent-40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-accent-10 rounded-xl mb-4 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                    <Icon size={22} />
                  </span>
                  <h3 className="text-[var(--ink-strong)] text-lg font-bold mb-2">
                    {service.title}
                  </h3>
                  <p className="text-[var(--ink-soft)] text-sm leading-relaxed">{service.text}</p>
                </article>
              </FadeInUp>
            );
          })}
        </div>

        {/* Apartado Portafolio Digital */}
        <FadeInUp delay={150}>
          <Link
            href="/portfolio-digital"
            className="group flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl p-6 md:p-8 border border-accent-20 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-section-alt)] shadow-lg transition-all duration-300 hover:border-accent-50 hover:shadow-accent-lg mb-12"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-10 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                <Clapperboard size={26} />
              </span>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--ink-strong)]">
                  {t.marketing.viewPortfolio}
                </h3>
                <p className="text-sm text-[var(--ink-soft)] mt-1">
                  {t.portfolioDigital.badge}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
              {t.marketing.viewPortfolio}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </FadeInUp>

        {/* CTA final */}
        <FadeInUp delay={200}>
          <div className="rounded-2xl p-8 md:p-10 text-center border border-accent-20 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-section-alt)] shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--ink-strong)] mb-6">
              {t.marketing.cta}
            </h3>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-strong text-black font-bold rounded-full px-8 py-3 text-sm transition-all duration-300 shadow-accent-lg hover:shadow-accent-xl"
            >
              {t.marketing.ctaButton}
            </a>
          </div>
        </FadeInUp>
      </div>

      {/* Botón volver */}
      <Volver />
    </section>
  );
}
