/**
 * El template del root no se remonta al navegar dentro de /proyectos
 * (ej. listado → detalle). Este template anidado cubre ese caso con la
 * misma transición CSS, sin cambiar el diseño ni el estado global.
 */
export default function ProjectsTemplate({ children }) {
  return <div className="page-transition">{children}</div>;
}
