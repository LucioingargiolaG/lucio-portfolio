/**
 * Fondo estelar neón global: cubre toda la página (fixed) y se muestra
 * detrás del contenido (z-index negativo).
 *
 * - Modo oscuro: estrellas cian/blancas que ASCIENDEN, estrellas fugaces
 *   y orbes de neón fríos.
 * - Modo claro: estrellas cálidas que FLOTAN suavemente (animación
 *   distinta) y orbes en tonos ámbar/naranja.
 *
 * Las posiciones y duraciones se generan con Math.random (una sola vez por
 * tema gracias a useMemo) para que cada carga sea distinta.
 */
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeProvider';

export default function Starfield() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Las estrellas se generan con Math.random, que da valores distintos en el
  // servidor y en el cliente. Para evitar el error de hidratación, no se
  // renderizan hasta después del montaje (mounted): así el HTML del servidor
  // y el primer render del cliente coinciden (sin estrellas).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Genera las estrellas según el tema. `isLight` en las dependencias:
  // si cambia el tema, se regeneran (animaciones y colores acordes).
  const stars = useMemo(() => {
    const rand = (min, max) => Math.random() * (max - min) + min;
    return Array.from({ length: isLight ? 100 : 140 }, (_, i) => {
      const base = {
        left: rand(0, 100), // posición horizontal %
        size: isLight ? rand(1.8, 3) : rand(1.2, 3), // tamaño en px
        twinkleDuration: rand(1.5, 4), // velocidad de parpadeo
        twinkleDelay: rand(0, 3), // retraso del parpadeo
        accent: isLight ? i % 3 !== 0 : i % 2 === 0, // ¿estrella "acento"?
      };
      return isLight
        ? {
            // Modo claro: estrellas repartidas por toda la pantalla que flotan.
            ...base,
            top: rand(0, 100),
            bobDuration: rand(4, 8), // duración del flote
            bobDelay: rand(0, 4),
          }
        : {
            // Modo oscuro: estrellas que nacen abajo y ascienden sin fin.
            ...base,
            top: 110, // arrancan debajo de la pantalla
            riseDuration: rand(16, 40), // cuánto tarda en subir
            riseDelay: -rand(0, 40), // negativo para repartirlas a mitad de camino
          };
    });
  }, [isLight]);

  // Estrellas fugaces (en ambos modos, con colores del tema).
  const shooting = useMemo(() => {
    const rand = (min, max) => Math.random() * (max - min) + min;
    return Array.from({ length: 7 }, (_, i) => ({
      top: rand(5, 50),
      left: rand(10, 90),
      duration: rand(4, 7),
      delay: rand(1, 5) + i * 2, // escalonadas para que no crucen todas juntas
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[var(--bg-page)]"
    >
      {mounted && (
        <>
      {/* Estrellas: ascienden (dark) o flotan (light) */}
      {stars.map((star, i) => {
        // Combinación de animaciones CSS (definidas en globals.css):
        //  - dark:  star-rise (subir) + star-twinkle (parpadear fuerte)
        //  - light: star-bob (flotar) + star-twinkle-soft (sin apagarse)
        const animation = isLight
          ? `star-bob ${star.bobDuration}s ease-in-out ${star.bobDelay}s infinite, star-twinkle-soft ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`
          : `star-rise ${star.riseDuration}s linear ${star.riseDelay}s infinite, star-twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`;

        // Color según tema y si la estrella es "acento".
        const colorClass = isLight
          ? star.accent
            ? 'bg-amber-400/90'
            : 'bg-white/80'
          : star.accent
            ? i % 3 === 0
              ? 'bg-green-400/80'
              : 'bg-emerald-500/80'
            : 'bg-white/40';

        // Brillo (box-shadow) según el color.
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
              top: isLight ? `${star.top}%` : '110%', // dark: nacen abajo
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: glow,
              animation,
            }}
          />
        );
      })}

      {/* Estrellas fugaces (ambos modos, con colores del tema) */}
      {shooting.map((s, i) => (
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

      {/* Orbes de luz (solo light, para no teñir el fondo negro del dark) */}
      {isLight && (
        <>
          <div className="absolute -top-20 left-[10%] w-72 h-72 rounded-full bg-amber-400/15 blur-3xl animate-[orb-float_26s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-orange-400/15 blur-3xl animate-[orb-float_30s_ease-in-out_2s_infinite]" />
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-rose-300/15 blur-3xl animate-[orb-float_28s_ease-in-out_1s_infinite]" />
        </>
      )}
        </>
      )}
    </div>
  );
}
