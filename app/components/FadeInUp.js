/**
 * Wrapper reutilizable de animación al hacer scroll.
 *
 * Revela su contenido con un fade + slide hacia arriba cuando entra en
 * pantalla, y solo UNA vez (el observer se desconecta tras el primer
 * intersect). Se usa en varias secciones (marketing, projects, contacto).
 *
 * RESPETA prefers-reduced-motion (F2): con reduce, el contenido se muestra
 * sin animación. La condición se resuelve en CSS (.fade-in-up dentro del
 * media query en globals.css) para que el HTML del servidor y el del cliente
 * sean idénticos también con reduced motion (sin error de hidratación).
 *
 * Props:
 *  - children: contenido a animar
 *  - delay: retraso en milisegundos (para animaciones en cascada)
 *  - className: clases extra aplicadas al wrapper
 */
'use client';

import { useEffect, useRef, useState } from 'react';

export default function FadeInUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null); // referencia al div para observarlo
  const [inView, setInView] = useState(false); // ¿ya entró en pantalla?

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Con reduce no observamos: el CSS ya fuerza opacity 1 / transform none.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // Sin disconnect: al volver a entrar vuelve a señalar visible.
        }
      },
      { threshold: 0.1, rootMargin: '-80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Si la pestaña está oculta: mostramos el contenido (no lo dejamos invisible).
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setInView(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in-up ${className}`.trim()}
      style={{
        // Estos valores son los mismos en servidor y cliente: el cambio a
        // visible ocurre después de hidratar, cuando el observer lo detecta.
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        // Transición CSS (no requiere librerías externas).
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
