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

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Rocket, TrendingUp, FileText, Share2, Mail, BarChart3, ArrowRight, Clapperboard, FileDown, ChevronDown } from 'lucide-react';
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

  const [cvOpen, setCvOpen] = useState(false);
  const [cvPos, setCvPos] = useState(null);
  const cvRef = useRef(null);

  const toggleCv = () => {
    if (cvOpen) { setCvOpen(false); return; }
    if (cvRef.current) {
      const r = cvRef.current.getBoundingClientRect();
      setCvPos({ left: r.left + r.width / 2, top: r.bottom });
    }
    setCvOpen(true);
  };

  useEffect(() => {
    if (!cvOpen) return;
    const close = () => setCvOpen(false);
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [cvOpen]);

  const cvItemClass =
    'link-pretty flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--accent)] hover:bg-[var(--bg-glass)] transition-colors cursor-pointer';

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
            <div className="relative" ref={cvRef}>
              <button
                type="button"
                onClick={toggleCv}
                aria-haspopup="menu"
                aria-expanded={cvOpen}
                className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--ink-soft)] border border-[var(--line)] bg-[var(--bg-card)] rounded-full px-4 py-1.5 transition-all duration-300 hover:border-accent-50 hover:text-[var(--accent)] hover:-translate-y-0.5 cursor-pointer"
              >
                <FileDown size={14} className="text-[var(--accent)]" />
                {t.marketing.cvEditing}
                <ChevronDown size={12} className={`transition-transform duration-300 ${cvOpen ? 'rotate-180' : ''}`} />
              </button>

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
                          top: cvPos.top + 8,
                          zIndex: 50,
                        }}
                        className="w-60 rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-nav-solid)] backdrop-blur-md p-2 shadow-xl shadow-black/40"
                      >
                        <a
                          href="/cv-edicion.pdf"
                          download
                          onClick={() => setCvOpen(false)}
                          role="menuitem"
                          className={cvItemClass}
                        >
                          <FileDown size={15} className="text-[var(--accent)]" />
                          {t.marketing.cvEditingEs}
                        </a>
                        <a
                          href="/cv-edicion-en.pdf"
                          download
                          onClick={() => setCvOpen(false)}
                          role="menuitem"
                          className={cvItemClass}
                        >
                          <FileDown size={15} className="text-[var(--accent)]" />
                          {t.marketing.cvEditingEn}
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
            </div>
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
