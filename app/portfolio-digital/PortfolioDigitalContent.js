/**
 * Contenido de la página "Portafolio Digital" (trabajos de edición
 * audiovisual y contenido digital): encabezado editorial, filtro por
 * categorías con botones de selección, grid de tarjetas de videos
 * (lazy), cartera de categorías completas (Google Drive) y CTA de contacto.
 * Componente client (filtro + reproductores).
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { AV_CATEGORIES, AV_PROJECTS } from "@/lib/av-projects";
import AvProjectCard from "@/app/components/AvProjectCard";
import FadeInUp from "@/app/components/FadeInUp";
import Volver from "@/app/components/Volver";

export default function PortfolioDigitalContent() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all"); // "all" | categoryId

  const categoryName = (id) =>
    AV_CATEGORIES.find((c) => c.id === id)?.name;
  const filtered =
    filter === "all"
      ? AV_PROJECTS
      : AV_PROJECTS.filter((p) => p.categoryId === filter);

  return (
    <section
      id="portafolio-digital"
      className="relative min-h-screen bg-[var(--bg-section-glass)] px-6 py-24 sm:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* Encabezado editorial: título + descripción */}
        <FadeInUp>
          <h1 className="text-4xl font-extrabold leading-tight text-[var(--ink-strong)] sm:text-5xl lg:text-6xl">
            {t.portfolioDigital.title}{" "}
            <span className="text-[var(--accent)]">
              {t.portfolioDigital.titleAccent}
            </span>
          </h1>
        </FadeInUp>

        <FadeInUp delay={100}>
          <p className="mt-4 text-base text-[var(--ink-soft)] sm:text-lg">
            {t.portfolioDigital.subtitle}
          </p>
        </FadeInUp>

        <FadeInUp delay={150}>
          <p className="mt-3 max-w-2xl text-sm text-[var(--ink-soft)]">
            {t.portfolioDigital.description}
          </p>
        </FadeInUp>

        {/* Filtros por categorías (chips ARIA) */}
        <FadeInUp delay={200}>
          <div
            className="mt-10 flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t.portfolioDigital.categories}
          >
            <button
              type="button"
              aria-pressed={filter === "all"}
              aria-controls="audiovisual-results"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                filter === "all"
                  ? "bg-[var(--accent)] text-black shadow-accent"
                  : "border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)]"
              }`}
            >
              {t.portfolioDigital.filterAll}
            </button>
            {AV_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={filter === cat.id}
                aria-controls="audiovisual-results"
                onClick={() => setFilter(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  filter === cat.id
                    ? "bg-[var(--accent)] text-black shadow-accent"
                    : "border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FadeInUp>

        {/* Grid de tarjetas (lazy, editorial, miniaturas 9:16 uniformes) */}
        <div id="audiovisual-results" className="mt-8 grid grid-cols-2 items-stretch gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-[var(--ink-soft)]">
              {t.portfolioDigital.noVideos}
            </p>
          ) : (
            filtered.map((project, index) => (
              <AvProjectCard
                key={project.id}
                project={project}
                categoryName={categoryName(project.categoryId)}
                delay={300 + index * 50}
              />
            ))
          )}
        </div>

        {/* Carpeta completa de cada categoría (Google Drive) */}
        <FadeInUp delay={500}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              {t.portfolioDigital.folderLabel}
            </span>
            {AV_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={cat.folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--accent)] transition-all duration-300 hover:underline"
                aria-label={`${cat.name} — ${t.portfolioDigital.folderAria}`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </FadeInUp>

        {/* CTA de contacto */}
        <FadeInUp delay={550}>
          <div className="mt-12 flex justify-center">
            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 text-sm font-bold text-black shadow-accent transition-all duration-300 hover:bg-[var(--accent-strong)] hover:shadow-accent-lg"
            >
              {t.portfolioDigital.cta}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </FadeInUp>

        <Volver />
      </div>
    </section>
  );
}
