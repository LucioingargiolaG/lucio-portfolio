/**
 * Sección de SERVICIOS para pequeños negocios.
 *
 * Traduce las capacidades técnicas a problemas concretos de negocio. Es la
 * sección que responde rápido a "¿qué puede hacer por mí?" antes de mostrar
 * el detalle técnico de los proyectos.
 *
 * Solo se muestra en modo WEB.
 */
"use client";

import Link from "next/link";
import {
  LayoutTemplate,
  Rocket,
  QrCode,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useMode } from "@/app/context/ModeContext";
import FadeInUp from "./FadeInUp";

// Mapea el nombre del ícono guardado en las traducciones al componente real.
const ICONS = {
  layout: LayoutTemplate,
  rocket: Rocket,
  qr: QrCode,
  chart: BarChart3,
};

export default function ServicesSection() {
  const { t } = useLanguage();
  const { mode } = useMode();

  if (mode !== "web") return null;

  return (
    <section
      id="servicios" tabIndex={-1}
      className="scroll-mt-[64px] lg:scroll-mt-[84px] relative bg-[var(--bg-section-glass)] px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <FadeInUp>
          <span className="font-mono inline-flex items-center gap-2 rounded-full border border-accent-20 bg-accent-5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {t.services.badge}
          </span>
        </FadeInUp>

        <FadeInUp delay={100}>
          <h2 className="mt-4 mb-4 text-3xl font-extrabold text-[var(--ink-strong)] sm:text-4xl lg:text-5xl">
            {t.services.title}{" "}
            <span className="text-[var(--accent)]">
              {t.services.titleAccent}
            </span>
          </h2>
        </FadeInUp>

        <FadeInUp delay={180}>
          <p className="mb-12 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
            {t.services.description}
          </p>
        </FadeInUp>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {t.services.items.map((service, index) => {
            const Icon = ICONS[service.icon];
            return (
              <FadeInUp key={service.title} delay={120 * index + 200}>
                <article className="h-full rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-40 hover:shadow-2xl hover:shadow-black/50">
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-10 text-[var(--accent)]">
                    {Icon && <Icon size={22} />}
                  </span>
                  <h3 className="mb-2 text-lg font-bold text-[var(--ink-strong)]">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                    {service.text}
                  </p>
                </article>
              </FadeInUp>
            );
          })}
        </div>

        <FadeInUp delay={300}>
          <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-accent-20 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-section-alt)] p-6 text-center shadow-lg sm:flex-row sm:text-left md:p-8">
            <div>
              <h3 className="text-xl font-bold text-[var(--ink-strong)] md:text-2xl">
                {t.services.cta}
              </h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {t.services.ctaText}
              </p>
            </div>
            <Link
              href="#contacto"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-accent-strong hover:shadow-accent-lg"
            >
              {t.services.ctaButton}
              <ArrowRight size={16} />
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
