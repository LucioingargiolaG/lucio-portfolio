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

import { useEffect } from 'react';
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
  const count = isLight ? 72 : 84;
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

// Cada capa rasteriza puntos estáticos y anima solo su transform y opacidad.
// El mosaico oscuro repite un alto de viewport para ascender sin saltos.
const LAYER_COUNT = 6;

function groupStars(stars, light) {
  const groups = Array.from({ length: LAYER_COUNT }, () => []);
  stars.forEach((star, index) => {
    const group = groups[index % LAYER_COUNT];
    const x = star.left.toFixed(2);
    const phase = ((-star.riseDelay / star.riseDuration) % 1 + 1) % 1;
    const y = light ? star.top : (210 - phase * 120) % 100;
    const spread = (star.size / 2).toFixed(2);
    const fill = light
      ? (star.accent ? "rgb(251 191 36 / 0.85)" : "rgb(255 255 255 / 0.75)")
      : (star.accent ? "rgb(74 222 128 / 0.75)" : "rgb(255 255 255 / 0.38)");
    for (const top of light ? [y] : [y, y + 100]) {
      group.push(x + "vw " + top.toFixed(2) + "vh 0 " + spread + "px " + fill);
    }
  });
  return groups.map((points, index) => ({
    boxShadow: points.join(","),
    animation: light
      ? "star-bob " + (5 + index * 0.6) + "s ease-in-out " + (-index) + "s infinite, star-twinkle-soft " + (3 + index * 0.3) + "s ease-in-out " + (-index) + "s infinite"
      : "star-rise " + (22 + index * 3) + "s linear " + (-index * 2) + "s infinite, star-twinkle " + (3 + index * 0.3) + "s ease-in-out " + (-index) + "s infinite",
  }));
}

const DARK_LAYERS = groupStars(DARK_STARS, false);
const LIGHT_LAYERS = groupStars(LIGHT_STARS, true);

// Estrellas fugaces (mismas para ambos temas).
// Solo DOS elementos: eso garantiza que nunca haya más de dos fugaces a la
// vez. Cada ciclo es largo y la "visibilidad" ocupa apenas un tramo corto,
// con fases distintas para que aparezcan escalonadas y no al unísono.
const SHOOTING = (() => {
  const rng = mulberry32(7);
  return Array.from({ length: 2 }, (_, i) => ({
    top: rand(rng, 5, 35),
    left: rand(rng, 48, 86),
    duration: i === 0 ? 11 : 17,
    delay: i === 0 ? 2 : 8,
  }));
})();

export default function Starfield() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Optimización de recursos: al ocultar la pestaña solo se marca el
  // documento con `data-tab-hidden` y globals.css pausa todas las
  // animaciones (animation-play-state). ANTES se desmontaba el componente,
  // lo que al volver reproducía las estrellas desde cero (salto/parpadeo).
  // Así las estrellas siguen continuas y no hay re-renders innecesarios.
  useEffect(() => {
    const syncVisibility = () => {
      document.documentElement.dataset.tabHidden = document.hidden
        ? 'true'
        : 'false';
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      delete document.documentElement.dataset.tabHidden;
    };
  }, []);

  // Selecciona las estrellas pre-generadas según el tema.
  const layers = isLight ? LIGHT_LAYERS : DARK_LAYERS;

  return (
    <div
      aria-hidden="true"
      data-starfield
      data-star-count={isLight ? LIGHT_STARS.length : DARK_STARS.length}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[var(--bg-page)] [contain:paint]"
    >
      {layers.map((layer, index) => (
        <span
          key={index}
          data-star-layer
          className="absolute top-0 left-0 size-px rounded-full"
          style={layer}
        />
      ))}

      {/* Estrellas fugaces: se ocultan con reduced motion desde CSS. */}
      {SHOOTING.map((s, i) => (
        <span
          key={`shoot-${i}`}
          data-motion-decorative
          className={`absolute h-px w-24 opacity-0 ${
            isLight
              ? 'bg-gradient-to-r from-amber-400 via-orange-400/50 to-transparent'
              : 'bg-gradient-to-r from-green-400 via-emerald-400/50 to-transparent'
          }`}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            // `both` es clave: aplica el primer keyframe (opacity 0) DURANTE
            // el delay. Sin eso, el span se veía como una línea horizontal
            // estática antes de que empezara la animación.
            rotate: '-35deg',
            animation: `shoot ${s.duration}s linear ${s.delay}s infinite both`,
          }}
        />
      ))}

      {/* Orbes de luz (solo light): se ocultan con reduced motion desde CSS. */}
      {isLight && (
        <>
          <div
            data-motion-decorative
            className="absolute -top-20 left-[10%] w-72 h-72 rounded-full bg-amber-400/15 blur-3xl animate-[orb-float_26s_ease-in-out_infinite]"
          />
          <div
            data-motion-decorative
            className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-orange-400/15 blur-3xl animate-[orb-float_30s_ease-in-out_2s_infinite]"
          />
          <div
            data-motion-decorative
            className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-rose-300/15 blur-3xl animate-[orb-float_28s_ease-in-out_1s_infinite]"
          />
        </>
      )}
    </div>
  );
}
