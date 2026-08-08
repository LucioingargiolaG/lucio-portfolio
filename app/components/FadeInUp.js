/**
 * Wrapper reutilizable de animación al hacer scroll.
 *
 * Revela su contenido con un fade + slide hacia arriba cuando entra en
 * pantalla, y solo UNA vez (el observer se desconecta tras el primer
 * intersect). Se usa en varias secciones (marketing, projects, contacto).
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

    // IntersectionObserver: detecta cuando el elemento entra en el viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // solo animamos una vez
        }
      },
      { threshold: 0.1, rootMargin: '-80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        // Antes de entrar: invisible y 30px más abajo.
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
