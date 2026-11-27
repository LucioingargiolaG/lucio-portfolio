/**
 * Caso de estudio UTAP — sección destacada de la home.
 *
 * Presentación profesional orientada a convertir (designer/dev para streams):
 *  - Badge "Caso de estudio" + título + descripción breve del proyecto.
 *  - Imagen auténtica del menú público (menu-utap.png — captura real).
 *  - CTA "Ver menú en vivo" (UTAP en vivo) + CTA "Explorá el detalle del caso"
 *    (página de detalle de UTAP, si existe — enlace verificado en la ejecución
 *    de auditoría: el carrusel de la home enlaza a /proyectos/6a8cb62c4ad2001b725f9783).
 *  - El desafío.
 *  - La solución.
 *  - Mi participación.
 *  - Funcionalidades verificadas.
 *  - Tecnologías verificadas.
 *  - Decisiones de diseño y UX.
 *  - Uso actual + CTA de contacto.
 *
 * Solo se muestra en modo WEB. Respeta prefers-reduced-motion.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CheckCircle2, ChevronRight, Info, Send } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useMode } from "@/app/context/ModeContext";
import { LINKS } from "@/lib/site";

// ID del proyecto UTAP en la base — verificado en la ejecución de auditoría.
const UTAP_DETAIL_PATH = "/proyectos/6a8cb62c4ad2001b725f9783";

// Tecnologías comprobadas en el repositorio público de UTAP.
const UTAP_TECHNOLOGIES = [
  "Next.js 16",
  "TypeScript",
  "React 19",
  "Tailwind CSS 4",
  "Prisma",
  "MongoDB Atlas",
  "bcryptjs",
  "jose",
];

// FadeIn local: igual que FadeInUp pero respeta prefers-reduced-motion.
function FadeIn({ children, delay = 0, className = "" }) {
  const reduced = useReducedMotion();
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
      { threshold: 0.1, rootMargin: "-80px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function UtapCaseStudy() {
  const { t } = useLanguage();
  const { mode } = useMode();

  if (mode !== "web") return null;

  return (
    <section id="caso-utap" tabIndex={-1} className="scroll-mt-[64px] lg:scroll-mt-[84px] relative bg-[var(--bg-section-alt-glass)] px-6 py-32 sm:px-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Encabezado: badge + título + descripción breve */}
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--neon-line)] bg-[var(--neon-badge-bg)] px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--neon)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)]" aria-hidden="true" />
            {t.utap.badge}
          </span>
        </FadeIn>

        <FadeIn delay={100}>
          <h2 className="mt-6 text-3xl font-extrabold text-[var(--ink-strong)] sm:text-4xl lg:text-5xl">
            {t.utap.title} <span className="text-[var(--accent)]">{t.utap.titleAccent}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
            {t.utap.subtitle}
          </p>
        </FadeIn>

        {/* Grid principal: imagen (izq, desktop) + contenido (der) */}
        <div className="mt-10 grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
          {/* Columna izquierda: imagen auténtica del menú público + CTAs */}
          <FadeIn delay={200}>
            <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl">
              <Image
                src="/proyectos/menu-utap.png"
                alt={`${t.utap.title} — ${t.utap.titleAccent}`}
                width={2160}
                height={1290}
                sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) calc(100vw - 64px), (max-width: 1216px) 40vw, 465px"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 rounded-full border border-[var(--neon-line)] bg-[var(--neon-badge-bg)] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--neon)] backdrop-blur-sm">
                {t.utap.used}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={LINKS.utapDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--neon-line)] px-5 py-2.5 text-sm font-bold text-[var(--neon)] transition-all duration-300 hover:border-[var(--neon)] hover:bg-[var(--neon-badge-bg)]"
              >
                {t.utap.viewLive}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <Link
                href={UTAP_DETAIL_PATH}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--neon-line)] px-5 py-2.5 text-sm font-bold text-[var(--neon)] transition-all duration-300 hover:border-[var(--neon)] hover:bg-[var(--neon-badge-bg)]"
              >
                {t.utap.exploreDetail}
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </FadeIn>

          {/* Columna derecha: contenido del caso */}
          <div className="space-y-8">
            {/* El desafío */}
            <FadeIn delay={300}>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  {t.utap.problemTitle}
                </h3>
                <p className="text-[var(--ink-soft)] leading-relaxed text-sm">{t.utap.problem}</p>
              </div>
            </FadeIn>

            {/* Solución */}
            <FadeIn delay={400}>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  {t.utap.solutionTitle}
                </h3>
                <p className="text-[var(--ink-soft)] leading-relaxed text-sm">{t.utap.solution}</p>
              </div>
            </FadeIn>

            {/* Mi participación */}
            <FadeIn delay={500}>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  {t.utap.developmentTitle}
                </h3>
                <p className="text-[var(--ink-soft)] leading-relaxed text-sm">{t.utap.development}</p>
              </div>
            </FadeIn>

            {/* Funcionalidades verificadas */}
            <FadeIn delay={600}>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  {t.utap.featuresTitle}
                </h3>
                <ul className="space-y-2">
                  {t.utap.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--ink-soft)]"
                    >
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Tecnologías verificadas */}
            <FadeIn delay={700}>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  {t.utap.technicalTitle}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-[var(--ink-soft)]">{t.utap.technical}</p>
                <div className="flex flex-wrap gap-2">
                  {UTAP_TECHNOLOGIES.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[var(--neon-line)] bg-[var(--neon-badge-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--neon)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Decisiones de diseño y UX */}
            <FadeIn delay={800}>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  {t.utap.decisionsTitle}
                </h3>
                <ul className="space-y-2">
                  {t.utap.decisions.map((decision) => (
                    <li
                      key={decision}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--ink-soft)]"
                    >
                      <span className="flex h-[1.625em] w-1 shrink-0 items-center justify-center" aria-hidden="true">
                        <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                      </span>
                      {decision}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Uso actual + CTA de contacto */}
            <FadeIn delay={900}>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  {t.utap.currentTitle}
                </h3>
                <p className="mb-6 text-[var(--ink-soft)] text-sm leading-relaxed">{t.utap.current}</p>
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-[var(--accent-strong)]"
                >
                  <Send size={16} aria-hidden="true" />
                  {t.utap.contactCTA}
                </a>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Transparencia sobre los datos */}
        <FadeIn delay={1000}>
          <p className="mt-10 flex items-start gap-2.5 text-sm leading-relaxed text-[var(--ink-muted)]">
            <Info size={16} className="mt-0.5 shrink-0 text-[var(--ink-muted)]" aria-hidden="true" />
            {t.utap.note}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
