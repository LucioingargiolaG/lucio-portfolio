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
import { LINKS } from '@/lib/site';
import Volver from './Volver';

/**
 * Markdown del perfil que se copia al portapapeles. Hay una versión por
 * idioma y solo incluye información verificable (sin años de experiencia
 * inventados ni métricas de resultados).
 */
const PROFILE_MARKDOWN_ES = `# Lucio Ingargiola

## Estudiante de Desarrollo de Aplicaciones Informáticas | Desarrollador Web

Desarrollador web en formación, con foco en Front End y experiencia construyendo proyectos reales. Combina desarrollo con conocimientos de marketing digital y edición de contenido.

## Sobre Mí

Estudiante de la Tecnicatura en Desarrollo de Aplicaciones Informáticas en Azul, Buenos Aires. Trabajo con React, Next.js, JavaScript y TypeScript.

Complementa su perfil técnico con marketing digital, creación de contenido y edición de video (Premiere Pro, CapCut, Canva).

## Proyecto destacado

**UTAP — Menú Digital**: menú digital con QR y panel de administración para una hamburguesería. Está en uso real. Stack: Next.js 16, TypeScript, Tailwind CSS 4, Prisma y MongoDB Atlas.

## Cómo trabajo

- Código limpio y mantenible
- Enfoque en rendimiento y buena experiencia de usuario
- Atención al detalle visual (UX/UI)
- Aprendizaje continuo aplicado a proyectos concretos

## Inteligencia artificial

Uso inteligencia artificial generativa de forma práctica: asistencia de código, automatización de tareas y apoyo para crear contenido, revisando siempre los resultados con validación humana. En 2026 curso la Capacitación en Inteligencia Artificial en el CFL N.º 401, Azul.

## Tecnologías

- Front End: HTML5, CSS, JavaScript, React, Next.js, Angular
- Backend básico: Node.js, PHP, Java
- Datos: MongoDB, Mongoose, Prisma, Firebase
- Diseño y contenido: Figma, Adobe Premiere, CapCut, Canva
- Otras: Git, GitHub, Tailwind CSS

## Keywords

HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Angular, Node.js, Tailwind CSS, Framer Motion, MongoDB, Mongoose, Prisma, Express, Firebase, REST APIs, JWT, Git, GitHub, Vite, Postman, Figma, Canva, Webpack, SEO, UI/UX, Responsive Design, Performance, Accessibility, Teamwork, AI-assisted development, Prompt engineering, AI automation

## Enlaces

- Portfolio: https://lucio-portfolio-theta.vercel.app
- UTAP (menú en vivo): ${LINKS.utapDemo}
- GitHub: ${LINKS.github}
- LinkedIn: ${LINKS.linkedin}`;

const PROFILE_MARKDOWN_EN = `# Lucio Ingargiola

## IT Application Development Student | Web Developer

Web developer in training, focused on Front End and experienced in building real projects. Combines web development with digital marketing and content editing skills.

## About Me

IT Application Development student based in Azul, Buenos Aires, Argentina. I work with React, Next.js, JavaScript and TypeScript.

I complement my technical profile with digital marketing, content creation and video editing (Premiere Pro, CapCut, Canva).

## Featured project

**UTAP — Digital Menu**: a QR digital menu with an admin dashboard for a burger restaurant. It is running in a real business. Stack: Next.js 16, TypeScript, Tailwind CSS 4, Prisma and MongoDB Atlas.

## How I work

- Clean, maintainable code
- Focus on performance and a good user experience
- Attention to visual detail (UX/UI)
- Continuous learning applied to real projects

## Artificial intelligence

I use generative AI in a practical way: AI-assisted coding, task automation and support for content creation, always reviewing the results with human validation. In 2026 I am taking the Artificial Intelligence course at CFL N.º 401, Azul.

## Technologies

- Front End: HTML5, CSS, JavaScript, React, Next.js, Angular
- Basic backend: Node.js, PHP, Java
- Data: MongoDB, Mongoose, Prisma, Firebase
- Design and content: Figma, Adobe Premiere, CapCut, Canva
- Other: Git, GitHub, Tailwind CSS

## Keywords

HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Angular, Node.js, Tailwind CSS, Framer Motion, MongoDB, Mongoose, Prisma, Express, Firebase, REST APIs, JWT, Git, GitHub, Vite, Postman, Figma, Canva, Webpack, SEO, UI/UX, Responsive Design, Performance, Accessibility, Teamwork, AI-assisted development, Prompt engineering, AI automation

## Links

- Portfolio: https://lucio-portfolio-theta.vercel.app
- UTAP (live menu): ${LINKS.utapDemo}
- GitHub: ${LINKS.github}
- LinkedIn: ${LINKS.linkedin}`;

export default function RecruitmentView() {
  const { t, lang } = useLanguage();
  const { mode } = useMode();
  const [copied, setCopied] = useState(false); // ¿se copió hace un momento?

  if (mode !== 'ia') return null; // solo se renderiza en modo IA

  const profileMarkdown = lang === 'en' ? PROFILE_MARKDOWN_EN : PROFILE_MARKDOWN_ES;

  // Copia el markdown al portapapeles (API del navegador) y muestra "¡Copiado!"
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar el perfil:', err);
    }
  };

  return (
    <section
      id="ai"
      className="scroll-mt-[64px] lg:scroll-mt-[84px] py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-section-alt-glass)]"
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
            {profileMarkdown}
          </pre>
        </div>
      </div>

      {/* Botón volver */}
      <Volver />
    </section>
  );
}
