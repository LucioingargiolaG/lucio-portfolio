/**
 * Pie de página (Footer) de la home.
 *
 * Incluye:
 *  - Marca + redes sociales (GitHub, LinkedIn, Instagram, Email).
 *  - Contacto rápido (email y ubicación).
 *  - Carrusel infinito con el stack tecnológico (marquee).
 *  - Barra inferior: volver arriba, copyright, switch de idioma y sello.
 */
'use client';

import { ArrowUp, Mail, Heart } from 'lucide-react';
import {
  SiGithub,
  SiInstagram,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiHtml5,
  SiTailwindcss,
  SiMongodb,
} from 'react-icons/si';
import { useLanguage } from '@/app/context/LanguageContext';
import { useMode } from '@/app/context/ModeContext';
import { LanguageSwitch } from './Navbar';
import Logo from './Logo';

// Ícono de LinkedIn en SVG inline (no existe en lucide-react).
function LinkedinIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Stack que se muestra en el marquee del footer (label + ícono).
const techStack = [
  { label: 'React', Icon: SiReact },
  { label: 'Next.js', Icon: SiNextdotjs },
  { label: 'TypeScript', Icon: SiTypescript },
  { label: 'JavaScript', Icon: SiJavascript },
  { label: 'HTML5', Icon: SiHtml5 },
  { label: 'Tailwind CSS', Icon: SiTailwindcss },
  { label: 'MongoDB', Icon: SiMongodb },
];

export default function Footer() {
  const { t } = useLanguage();
  const { setMode } = useMode();

  // Igual que en el Navbar: hace scroll suave a la sección, y si no existe
  // (modo IA) cambia a modo web primero.
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    const scroll = () => target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (target) {
      scroll();
    } else {
      setMode('web');
      setTimeout(scroll, 120);
    }
  };

  const year = new Date().getFullYear(); // año dinámico del copyright

  // Clases reutilizables para los botones de redes y títulos de columna.
  const socialClass =
    'inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] text-[var(--ink-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-50 hover:text-accent hover:shadow-[0_0_20px_var(--neon-glow-soft)]';

  const colTitleClass =
    'font-mono mb-4 text-xs font-bold uppercase tracking-widest text-[var(--ink-strong)]';

  return (
    <footer className="relative border-t border-[var(--line)] bg-[var(--bg-section-glass)] px-4 pb-8 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Marca + redes */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-[var(--ink-strong)]">
              <a
                href="#inicio"
                onClick={(e) => handleNavClick(e, '#inicio')}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              >
                <Logo />
              </a>
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--ink-soft)]">
              {t.footer.tagline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex gap-3">
                {/* Redes sociales */}
                <a
                  href="https://github.com/LucioingargiolaG"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className={socialClass}
                >
                  <SiGithub size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/in/lucioingargiola/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className={socialClass}
                >
                  <LinkedinIcon />
                </a>
                <a
                  href="https://instagram.com/lucio.ingargiola"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={socialClass}
                >
                  <SiInstagram size={18} />
                </a>
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'tu@email.com'}`}
                  aria-label="Email"
                  className={socialClass}
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className={colTitleClass}>{t.contact.badge}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'tu@email.com'}`}
                  className="link-pretty flex items-center gap-3 text-[var(--ink-soft)] transition-colors duration-300 hover:text-[var(--accent)]"
                >
                  <Mail size={16} className="shrink-0 text-[var(--accent)]" />
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'tu@email.com'}
                </a>
              </li>
              {/* Ubicación */}
              <li className="flex items-center gap-3 text-[var(--ink-soft)]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-[var(--accent)]"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t.footer.location}
              </li>
            </ul>
            {/* Disponibilidad */}
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
              {t.footer.available}
            </p>
          </div>
        </div>

        {/* Carrusel de tecnologías (marquee infinito, se duplica el array) */}
        <div className="mt-12 border-t border-[var(--line)] pt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
            {[...techStack, ...techStack].map(({ label, Icon }, i) => (
              <span
                key={`${label}-${i}`}
                title={label}
                className="flex shrink-0 items-center gap-1.5 text-[var(--ink-faint)] opacity-60 transition-opacity duration-300 hover:opacity-100"
              >
                <Icon size={18} className="text-[var(--accent)]" />
                <span className="font-mono text-xs">{label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-8 border-t border-[var(--line)] pt-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Volver arriba */}
            <a
              href="#inicio"
              onClick={(e) => handleNavClick(e, '#inicio')}
              className="link-pretty group inline-flex items-center gap-2.5 text-xs font-semibold text-[var(--ink-soft)] transition-all duration-300 hover:text-[var(--accent)] cursor-pointer"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--bg-card)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent-50 group-hover:shadow-accent-sm">
                <ArrowUp size={14} />
              </span>
              {t.footer.backToTop}
            </a>

            {/* Copyright con año dinámico */}
            <p className="text-center text-xs text-[var(--ink-faint)]">
              &copy; {year}. {t.footer.rights}
            </p>

            {/* Switch de idioma */}
            <div className="flex justify-center sm:justify-end">
              <LanguageSwitch uid="footer" />
            </div>
          </div>
        </div>

        {/* Sello final */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[var(--ink-faint)]">
          {t.footer.built} <Heart size={11} className="text-[var(--accent)]" />
          <span className="mx-1 opacity-50">|</span>
          <span className="font-mono">v1.0</span>
          <span className="mx-1 opacity-50">|</span>
          <span className="font-mono">Next.js 16</span>
        </p>
      </div>
    </footer>
  );
}
