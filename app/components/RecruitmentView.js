/**
 * Vista para Reclutamiento e IA — se muestra en MODO IA (switch WEB/IA).
 *
 * En lugar de la landing llena de animaciones, esta vista muestra el perfil
 * como un documento Markdown limpio que los reclutadores y los sistemas de
 * IA pueden copiar directamente (botón "copiar al portapapeles") para
 * resumir, comparar o analizar.
 *
 * Solo se muestra cuando mode === 'ia'; en modo web devuelve null.
 */
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import Volver from './Volver';

/**
 * Markdown completo del perfil que se copia al portapapeles.
 * Texto fijo en español, preparado para ATS, reclutadores y sistemas de IA.
 */
const PROFILE_MARKDOWN = `# Lucio Ingargiola

## Estudiante de Desarrollo de Aplicaciones Informáticas | Front End Developer

Estudiante de Desarrollo de Aplicaciones Informáticas con fuerte orientación a Front End. Combina desarrollo web moderno con conocimientos de marketing digital y edición de video.

## Sobre Mí

Estudiante de Desarrollo de Aplicaciones Informáticas en Tandil, Buenos Aires. Especializado en desarrollo Front End con tecnologías como React, Next.js, JavaScript y TypeScript. 

Complementa su perfil técnico con habilidades en marketing digital, creación de contenido y edición de videos (Adobe Premiere, CapCut, Canva).

Busca oportunidades donde pueda aplicar sus conocimientos de desarrollo y aportar también desde la mirada de marketing y contenido.

## Cómo trabajo

- Código limpio y mantenible
- Enfoque en rendimiento y buena experiencia de usuario
- Atención al detalle visual (UX/UI)
- Aprendizaje continuo y adaptación rápida a nuevas tecnologías

## Tecnologías

- Front End: HTML5, CSS Avanzado, JavaScript, React, Next.js, Angular
- Backend básico: Node.js, PHP, Java
- Herramientas de diseño y contenido: Figma, Adobe Premiere, CapCut, Canva
- Otras: Git, Tailwind CSS

## Keywords

HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Angular, Node.js, Tailwind CSS, Framer Motion, MongoDB, Express, Firebase, REST APIs, JWT, Git, GitHub, Vite, Postman, Figma, Canva, Webpack, SEO, UI/UX, Responsive Design, Performance, Accessibility, Teamwork

## Enlaces

- GitHub: https://github.com/LucioingargiolaG
- LinkedIn: https://www.linkedin.com/in/lucioingargiola/`;

export default function RecruitmentView() {
  const { t } = useLanguage();
  const { mode } = useMode();
  const [copied, setCopied] = useState(false); // ¿se copió hace un momento?

  if (mode !== 'ia') return null; // solo se renderiza en modo IA

  // Copia el markdown al portapapeles (API del navegador) y muestra "¡Copiado!"
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_MARKDOWN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar el perfil:', err);
    }
  };

  return (
    <section
      id="ai"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-section-alt-glass)]"
    >
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <span className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--neon)] border-[var(--neon-line)] bg-[var(--neon-badge-bg)] rounded-full px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
          {t.recruitment.badge}
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-2 text-[var(--ink-strong)] tracking-tight">
          {t.recruitment.title}
        </h2>

        <p className="text-[var(--neon)] font-semibold mb-4">{t.recruitment.subtitle}</p>

        <p className="text-[var(--ink-soft)] text-base sm:text-lg leading-relaxed mb-10 max-w-2xl">
          {t.recruitment.description}
        </p>

        {/* Tarjeta con el markdown */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl overflow-hidden">
          {/* Barra superior estilo editor: nombre de archivo + botón copiar */}
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[var(--line)]">
            <span className="font-mono text-xs text-[var(--ink-faint)]">
              perfil-lucio.md
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 text-sm font-bold rounded-full px-5 py-2 transition-all duration-300 cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[var(--neon)] hover:bg-[var(--neon-strong)] text-black shadow-[0_0_15px_var(--neon-glow)] hover:shadow-[0_0_25px_var(--neon-glow)]'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t.recruitment.copied : t.recruitment.copy}
            </button>
          </div>

          {/* Contenido del markdown (pre = texto plano con scroll si excede) */}
          <pre className="p-6 overflow-auto max-h-[480px] font-mono text-[13px] leading-relaxed text-[var(--ink-soft)] whitespace-pre">
            {PROFILE_MARKDOWN}
          </pre>
        </div>
      </div>

      {/* Botón volver */}
      <Volver />
    </section>
  );
}
