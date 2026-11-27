/**
 * Contenido de la página /proyectos (client component).
 *
 * Recibe `projects` (obtenidos en el servidor por projects/page.js) y los
 * muestra como lista de tarjetas expandidas:
 *  - Panel visual con el emoji del proyecto.
 *  - Título, descripción y bloque de arquitectura.
 *  - Chips de tecnologías.
 *  - Link a GitHub (si tiene).
 *  - Alterna el orden visual en desktop (zig-zag: par → imagen a la
 *    izquierda, impar → imagen a la derecha).
 */
'use client';

import Link from 'next/link';
import { FolderGit, CircleCheck } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { featuredKey, featuredDescription } from '@/lib/projectCopy';
import FadeInUp from '../components/FadeInUp';
import Volver from '../components/Volver';

// Detecta si el campo `image` guarda una imagen real (ruta local o URL)
// en lugar de un emoji.
const isImagePath = (v) =>
  typeof v === 'string' && (v.startsWith('/') || v.startsWith('http'));

export default function ProjectsContent({ projects }) {
  const { t } = useLanguage();

  return (
    <section className="min-h-screen py-32 px-6 max-w-6xl mx-auto">
      {/* Badge de la sección */}
      <FadeInUp>
        <span className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--accent)] border border-accent-20 bg-accent-5 rounded-full px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          {t.projects.badge}
        </span>
      </FadeInUp>

      {/* Título */}
      <FadeInUp delay={150}>
        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4 text-[var(--ink-strong)]">
          {t.projects.title} <span className="text-[var(--accent)]">{t.projects.titleAccent}</span>
        </h1>
      </FadeInUp>

      {/* Descripción de la sección (sin contador: se pidió eliminarlo) */}
      <FadeInUp delay={250}>
        <div className="mb-12">
          <p className="text-[var(--ink-soft)] text-base md:text-lg max-w-2xl leading-relaxed">
            {t.projects.description}
          </p>
        </div>
      </FadeInUp>

      {/* Si no hay proyectos, muestra un estado vacío */}
      {projects.length === 0 ? (
        <FadeInUp>
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-[var(--ink-strong)] mb-2">
              {t.projects.empty}
            </h2>
          </div>
        </FadeInUp>
      ) : (
        <div className="space-y-10">
          {projects.map((project) => {
            const key = featuredKey(project);
            return (
              <FadeInUp key={project._id} delay={100}>
                <article className="group grid overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl transition-all duration-300 hover:border-accent-40 hover:shadow-2xl hover:shadow-black/50 md:grid-cols-[1fr_1.6fr]">
                  {/* Panel visual (imagen o emoji) — siempre a la izquierda */}
                  <a
                    href={project.demoUrl || `/proyectos/${project._id}`}
                    target={project.demoUrl ? "_blank" : undefined}
                    rel={project.demoUrl ? "noopener noreferrer" : undefined}
                    className="relative flex min-h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--bg-section-alt)] to-[var(--bg-section)] p-10"
                  >
                    {/* Patrón de puntos de fondo */}
                    <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:18px_18px]" />
                    {isImagePath(project.image) ? (
                      /* Imagen real: cubre todo el panel */
                      <img
                        src={project.image}
                        alt={project.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        {/* Halo de acento detrás del emoji */}
                        <div className="absolute -inset-10 rounded-full bg-[var(--accent)]/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                        <span className="relative text-8xl drop-shadow-xl transition-transform duration-500 group-hover:scale-110">
                          {project.image}
                        </span>
                      </>
                    )}
                    {/* Badge de categoría */}
                    <span className="absolute top-4 left-4 text-xs font-semibold text-[var(--accent)] border border-accent-20 bg-[var(--bg-card)]/70 backdrop-blur-sm rounded-full px-3 py-1">
                      {t.projects.category[project.category] ?? project.category}
                    </span>
                  </a>

                  {/* Contenido */}
                  <div className="flex flex-col gap-4 p-8 md:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--ink-strong)]">
                        {project.title}
                      </h3>
                      {/* UTAP: proyecto en uso real (cierre v1.0) */}
                      {key === 'utap' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-20 bg-accent-5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                          <CircleCheck size={14} aria-hidden="true" />
                          {t.projects.featured.utapInUse}
                        </span>
                      )}
                    </div>

                    <p className="text-[var(--ink-soft)] leading-relaxed">
                      {featuredDescription(project, t)}
                    </p>

                    {/* Bloque de arquitectura (borde izquierdo de acento) */}
                    {project.architecture && (
                      <div className="rounded-2xl border-l-4 border-accent bg-[var(--bg-section-glass)] p-4 md:p-5">
                        <p className="mb-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                          {t.projects.architectureTitle}
                        </p>
                        <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                          {project.architecture}
                        </p>
                      </div>
                    )}

                    {/* Chips de tecnologías */}
                    <div className="flex flex-wrap gap-2">
                      {(project.technologies ?? []).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-accent-20 bg-accent-5 px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Enlaces al proyecto y al repositorio */}
                    <div className="mt-auto flex flex-wrap items-center gap-4">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)] transition-all duration-300 hover:gap-3"
                        >
                          {t.projects.demo}
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)] transition-all duration-300 hover:gap-3"
                        >
                          <FolderGit size={16} />
                          {t.projects.github}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </FadeInUp>
            );
          })}
        </div>
      )}

      {/* Botón volver */}
      <Volver href="/" />
    </section>
  );
}
