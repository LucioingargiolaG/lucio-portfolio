/**
 * Utilidades de iconos para las skills.
 *
 * getSkillIcon(nombre) devuelve el ícono + color de una tecnología a partir
 * de su nombre (por ejemplo "React" → logo de React, "SEO" → ícono de
 * crecimiento). Si no encuentra coincidencia, usa un Sparkles genérico.
 *
 * Busca coincidencias en dos mapas:
 *  - BRAND_MAP: tecnologías con logo oficial (react-icons/si).
 *  - UI_MAP: habilidades conceptuales (lucide-react).
 */
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiAngular,
  SiNodedotjs,
  SiTailwindcss,
  SiFramer,
  SiMongodb,
  SiMongoose,
  SiExpress,
  SiFirebase,
  SiJsonwebtokens,
  SiGit,
  SiGithub,
  SiVite,
  SiPostman,
  SiFigma,
  SiCanvas,
  SiWebpack,
  SiAnthropic,
  SiCursor,
} from 'react-icons/si';
import {
  Globe,
  Wand2,
  MonitorSmartphone,
  Palette,
  TrendingUp,
  Gauge,
  Accessibility,
  Users,
  Sparkles,
} from 'lucide-react';

// Logo de OpenAI como SVG (react-icons no trae uno oficial bueno).
const OPENAI_PATH =
  'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z';

function OpenAIIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={OPENAI_PATH} />
    </svg>
  );
}

// Tecnologías con logo oficial. Cada entrada mapea una lista de "términos"
// que aparecen en el nombre de la skill al componente y color de marca.
const BRAND_MAP = [
  { m: ['html5'], Icon: SiHtml5, color: '#E34F26' },
  { m: ['css', 'css3'], Icon: SiCss, color: '#1572B6' },
  { m: ['javascript'], Icon: SiJavascript, color: '#F7DF1E' },
  { m: ['typescript'], Icon: SiTypescript, color: '#3178C6' },
  { m: ['react'], Icon: SiReact, color: '#61DAFB' },
  { m: ['next'], Icon: SiNextdotjs, color: '#FFFFFF' },
  { m: ['angular'], Icon: SiAngular, color: '#DD0031' },
  { m: ['node'], Icon: SiNodedotjs, color: '#5FA04E' },
  { m: ['tailwind'], Icon: SiTailwindcss, color: '#38BDF8' },
  { m: ['framer'], Icon: SiFramer, color: '#0055FF' },
  { m: ['mongodb'], Icon: SiMongodb, color: '#47A248' },
  { m: ['mongoose'], Icon: SiMongoose, color: '#880000' },
  { m: ['express'], Icon: SiExpress, color: '#FFFFFF' },
  { m: ['firebase'], Icon: SiFirebase, color: '#DD2C00' },
  { m: ['jwt'], Icon: SiJsonwebtokens, color: '#FFFFFF' },
  { m: ['github'], Icon: SiGithub, color: '#FFFFFF' },
  { m: ['git'], Icon: SiGit, color: '#F05032' },
  { m: ['vite'], Icon: SiVite, color: '#646CFF' },
  { m: ['postman'], Icon: SiPostman, color: '#FF6C37' },
  { m: ['figma'], Icon: SiFigma, color: '#F24E1E' },
  { m: ['canva', 'canvas'], Icon: SiCanvas, color: '#00C4CC' },
  { m: ['webpack'], Icon: SiWebpack, color: '#8DD6F9' },
  { m: ['chatgpt', 'openai'], Icon: OpenAIIcon, color: '#10A37F' },
  { m: ['claude', 'anthropic'], Icon: SiAnthropic, color: '#D97757' },
  { m: ['cursor'], Icon: SiCursor, color: '#FFFFFF' },
];

// Habilidades conceptuales (sin logo) con íconos de lucide.
const UI_MAP = [
  { m: ['rest'], Icon: Globe },
  { m: ['prompt'], Icon: Wand2 },
  { m: ['responsive'], Icon: MonitorSmartphone },
  { m: ['ui', 'ux'], Icon: Palette },
  { m: ['seo'], Icon: TrendingUp },
  { m: ['performance', 'rendimiento'], Icon: Gauge },
  { m: ['accesib'], Icon: Accessibility },
  { m: ['equipo', 'team'], Icon: Users },
];

// Busca la primera coincidencia de un nombre normalizado dentro de un mapa.
// Ordena por largo del término para que coincidan antes las palabras
// específicas (p.ej. "jsonwebtokens" antes que "webpack").
function findMatch(norm, map) {
  const sorted = [...map].sort((a, b) => b.m[0].length - a.m[0].length);
  return sorted.find((entry) => entry.m.some((key) => norm.includes(key)));
}

/**
 * Devuelve { Icon, color } para una skill dada.
 * Normaliza el nombre (minúsculas, sin caracteres raros) y busca en
 * BRAND_MAP primero y luego en UI_MAP. Si nada coincide → Sparkles.
 */
export function getSkillIcon(name) {
  const norm = name.toLowerCase().replace(/[^a-z0-9+&]/g, '');
  const brand = findMatch(norm, BRAND_MAP);
  const ui = brand ? null : findMatch(norm, UI_MAP);
  return {
    Icon: brand ? brand.Icon : ui ? ui.Icon : Sparkles,
    color: brand ? brand.color : 'var(--accent)',
  };
}

/**
 * Chip (pill) que muestra una skill con su ícono y nombre.
 */
export function SkillChip({ name, className = '' }) {
  const { Icon, color } = getSkillIcon(name);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-accent-20 bg-accent-5 px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
      {name}
    </span>
  );
}
