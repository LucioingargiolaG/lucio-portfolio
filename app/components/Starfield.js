/**
 * Fondo estelar neón global: cubre toda la página (fixed) y se muestra
 * detrás del contenido (z-index negativo).
 *
 * - Modo oscuro: estrellas cian/blancas que ASCIENDEN, estrellas fugaces
 *   y orbes de neón fríos.
 * - Modo claro: estrellas cálidas que FLOTAN suavemente (animación
 *   distinta) y orbes en tonos ámbar/naranja.
 *
 * Usa un RNG con semilla (mulberry32) para generar posiciones
 * deterministas: misma semilla → mismas estrellas en servidor y cliente
 * (sin error de hidratación, sin parpadeo).
 */
'use client';

import { useTheme } from '@/app/context/ThemeProvider';

// Generador aleatorio con semilla (mulberry32): produce valores
// deterministas a partir de una semilla numérica.
function mulberry32(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = (rng, min, max) => rng() * (max - min) + min;

// Pre-genera las estrellas para ambos temas usando semillas fijas.
// Se ejecuta UNA sola vez al cargar el módulo (no en cada render).
function generateStars(isLight, rng) {
  const count = isLight ? 100 : 140;
  return Array.from({ length: count }, (_, i) => {
    const base = {
      left: rand(rng, 0, 100),
      size: isLight ? rand(rng, 1.8, 3) : rand(rng, 1.2, 3),
      twinkleDuration: rand(rng, 1.5, 4),
      twinkleDelay: rand(rng, 0, 3),
      accent: isLight ? i % 3 !== 0 : i % 2 === 0,
    };
    return isLight
      ? {
          ...base,
          top: rand(rng, 0, 100),
          bobDuration: rand(rng, 4, 8),
          bobDelay: rand(rng, 0, 4),
        }
      : {
          ...base,
          top: 110,
          riseDuration: rand(rng, 16, 40),
          riseDelay: -rand(rng, 0, 40),
        };
  });
}

// Stars pre-generadas (se ejecuta al importar el módulo, una sola vez).
const DARK_STARS = generateStars(false, mulberry32(42));
const LIGHT_STARS = generateStars(true, mulberry32(99));

// Estrellas fugaces (mismas para ambos temas).
const SHOOTING = (() => {
  const rng = mulberry32(7);
  return Array.from({ length: 7 }, (_, i) => ({
    top: rand(rng, 5, 50),
    left: rand(rng, 10, 90),
    duration: rand(rng, 4, 7),
    delay: rand(rng, 1, 5) + i * 2,
  }));
})();

export default function Starfield() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Selecciona las estrellas pre-generadas según el tema.
  const stars = isLight ? LIGHT_STARS : DARK_STARS;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[var(--bg-page)]"
    >
      {/* Estrellas: ascienden (dark) o flotan (light) */}
      {stars.map((star, i) => {
        const animation = isLight
          ? `star-bob ${star.bobDuration}s ease-in-out ${star.bobDelay}s infinite, star-twinkle-soft ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`
          : `star-rise ${star.riseDuration}s linear ${star.riseDelay}s infinite, star-twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`;

        const colorClass = isLight
          ? star.accent
            ? 'bg-amber-400/90'
            : 'bg-white/80'
          : star.accent
            ? i % 3 === 0
              ? 'bg-green-400/80'
              : 'bg-emerald-500/80'
            : 'bg-white/40';

        const glow = isLight
          ? star.accent
            ? '0 0 8px rgba(251,191,36,0.95)'
            : '0 0 6px rgba(255,255,255,0.7)'
          : star.accent
            ? i % 3 === 0
              ? '0 0 6px rgba(74,222,128,0.9)'
              : '0 0 6px rgba(16,185,129,0.9)'
            : '0 0 3px rgba(255,255,255,0.25)';

        return (
          <span
            key={i}
            className={`absolute rounded-full ${colorClass}`}
            style={{
              left: `${star.left}%`,
              top: isLight ? `${star.top}%` : '110%',
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: glow,
              animation,
            }}
          />
        );
      })}

      {/* Estrellas fugaces */}
      {SHOOTING.map((s, i) => (
        <span
          key={`shoot-${i}`}
          className={`absolute h-px w-24 ${
            isLight
              ? 'bg-gradient-to-r from-amber-400 via-orange-400/50 to-transparent'
              : 'bg-gradient-to-r from-green-400 via-emerald-400/50 to-transparent'
          }`}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animation: `shoot ${s.duration}s ease-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Orbes de luz (solo light) */}
      {isLight && (
        <>
          <div className="absolute -top-20 left-[10%] w-72 h-72 rounded-full bg-amber-400/15 blur-3xl animate-[orb-float_26s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-orange-400/15 blur-3xl animate-[orb-float_30s_ease-in-out_2s_infinite]" />
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-rose-300/15 blur-3xl animate-[orb-float_28s_ease-in-out_1s_infinite]" />
        </>
      )}
    </div>
  );
}
