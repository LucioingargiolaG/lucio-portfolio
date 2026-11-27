/**
 * Contenido visual del detalle de un proyecto (client component).
 *
 * La página del servidor (page.js) se encarga de buscar el proyecto en
 * MongoDB y generar los metadatos SEO. Este componente solo recibe los datos
 * ya serializados y los muestra en el idioma activo (ES/EN).
 */
"use client";

import Image from "next/image";

import Link from "next/link";
import { ArrowLeft, FolderGit } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import FadeInUp from "../../components/FadeInUp";
import { featuredArchitecture, featuredDescription, featuredKey } from "@/lib/projectCopy";

export default function ProjectDetailContent({ project }) {
  const { t, lang } = useLanguage();
  const architecture = featuredArchitecture(project, lang);

  const isImage =
    typeof project.image === "string" &&
    (project.image.startsWith("/") || project.image.startsWith("http"));

  const isUtap = featuredKey(project) === "utap";

  return (
    <section className="mx-auto min-h-screen max-w-5xl px-6 py-32">
      <FadeInUp>
        <Link
          href="/proyectos"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-all duration-300 hover:gap-3"
        >
          <ArrowLeft size={16} />
          {t.projectDetail.back}
        </Link>
      </FadeInUp>

      {/* Panel visual */}
      <FadeInUp delay={100}>
        <div className="relative mb-10 flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[var(--bg-section-alt)] to-[var(--bg-section)]">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:18px_18px]" />
          {isImage ? (
            <Image
              src={project.image}
              fill
              sizes="(max-width: 1023px) calc(100vw - 48px), 976px"
              unoptimized={project.image !== "/proyectos/menu-utap.png"}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="absolute -inset-20 rounded-full bg-[var(--accent)]/10 blur-3xl" />
              <span className="relative text-[120px] drop-shadow-xl">
                {project.image}
              </span>
            </>
          )}
          <span className="absolute top-4 left-4 rounded-full border border-accent-20 bg-[var(--bg-card)]/70 px-3 py-1 text-xs font-semibold text-[var(--accent)] backdrop-blur-sm">
            {isUtap ? t.utap.used : (t.projects.category[project.category] ?? project.category)}
          </span>
        </div>
      </FadeInUp>

      {/* Contenido */}
      <div className="flex flex-col gap-6">
        <FadeInUp delay={200}>
          <h1 className="text-4xl font-extrabold text-[var(--ink-strong)] md:text-5xl">
            {project.title}
          </h1>
        </FadeInUp>

        <FadeInUp delay={300}>
          <p className="max-w-3xl text-lg leading-relaxed text-[var(--ink-soft)]">
            {featuredDescription(project, t)}
          </p>
        </FadeInUp>

        {isUtap && (
          <FadeInUp delay={350}>
            <div className="rounded-2xl border-l-4 border-accent bg-[var(--bg-section-glass)] p-6">
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                {t.utap.developmentTitle}
              </p>
              <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                {t.utap.development}
              </p>
            </div>
          </FadeInUp>
        )}

        {/* Arquitectura */}
        {architecture && (
          <FadeInUp delay={400}>
            <div className="rounded-2xl border-l-4 border-accent bg-[var(--bg-section-glass)] p-6">
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                {t.projectDetail.architecture}
              </p>
              <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                {architecture}
              </p>
            </div>
          </FadeInUp>
        )}

        {/* Tecnologías */}
        <FadeInUp delay={500}>
          <div>
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
              {t.projectDetail.technologies}
            </p>
            <div className="flex flex-wrap gap-2">
              {(project.technologies ?? []).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-accent-20 bg-accent-5 px-4 py-1.5 text-sm font-semibold text-[var(--accent)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* Enlaces */}
        <FadeInUp delay={600}>
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-accent-strong"
              >
                {t.projectDetail.viewLive}
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent px-6 py-3 text-sm font-bold text-[var(--accent)] transition-all duration-300 hover:bg-accent-10"
              >
                <FolderGit size={16} />
                {t.projectDetail.viewRepo}
              </a>
            )}
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
