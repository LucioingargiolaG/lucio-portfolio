/**
 * Transición de página liviana: el template se remonta en cada navegación
 * (API de App Router), así que una animación CSS de entrada se reproduce
 * sola, sin observers, sin JS extra y sin retrasar el commit de la ruta.
 *
 * Solo opacidad: evitar transform evita crear contextos de apilamiento que
 * puedan interferir con el navbar/estrellas fijos.
 */
export default function Template({ children }) {
  return <div className="page-transition">{children}</div>;
}
