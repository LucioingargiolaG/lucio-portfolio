/**
 * Copia aprobada de los proyectos destacados (cierre v1.0).
 *
 * Los proyectos viven en MongoDB y NO se modifican (los datos de producción
 * quedan intactos). Esta capa de presentación hace dos cosas:
 *
 *  1. Identifica los dos proyectos destacados por su título o su `_id`
 *     (UTAP y Portfolio Personal), sin depender de posiciones ni de
 *     `createdAt`.
 *  2. Devuelve la descripción aprobada en el idioma activo (ES/EN), de modo
 *     que en inglés no quede texto en español.
 *
 * Cualquier otro proyecto conserva sus campos tal como vienen de la base.
 */

/**
 * Copia aprobada de los dos destacados. Vive acá (módulo sin directivas de
 * cliente) para que puedan usarla tanto la UI como los metadatos del servidor
 * sin duplicar textos. LanguageContext la reutiliza en su diccionario.
 */
export const FEATURED_DESCRIPTIONS = {
  es: {
    utap:
      "Solución digital desarrollada para una hamburguesería, que permite a sus clientes consultar el menú mediante un código QR y al negocio gestionar sus productos y precios de manera centralizada.",
    portfolio:
      "Plataforma personal desarrollada desde cero para presentar mis servicios, proyectos y experiencia profesional. Cuenta con una interfaz bilingüe, diseño adaptable y un panel de administración para gestionar contenidos dinámicamente.",
  },
  en: {
    utap:
      "Digital solution developed for a burger restaurant: customers check the menu with a QR code, while the business manages its products and prices from one place.",
    portfolio:
      "Personal platform built from scratch to present my services, projects and professional experience. It features a bilingual interface, a responsive design and an admin panel to manage content dynamically.",
  },
};

/** Clave de proyecto destacado: "utap" | "portfolio" | null. */
export function featuredKey(project) {
  if (!project) return null;
  const id = String(project._id ?? "").toLowerCase();
  const title = String(project.title ?? "").toLowerCase();
  if (id.includes("utap") || title.includes("utap")) return "utap";
  if (id.includes("portfolio") || title.includes("portfolio")) return "portfolio";
  return null;
}

/**
 * Descripción a usar en la UI: la aprobada (traducida) para los destacados,
 * o el texto de la base para el resto.
 */
export function featuredDescription(project, t) {
  const key = featuredKey(project);
  const copy = t?.projects?.featured;
  if (key && copy?.[`${key}Description`]) return copy[`${key}Description`];
  return project?.description ?? "";
}

/**
 * Descripción para metadatos (Server Component): no depende del contexto de
 * idioma del cliente. Respeta el `?lang=` de la URL; por defecto, español.
 */
export function featuredDescriptionForLang(project, lang = "es") {
  const key = featuredKey(project);
  const copy = FEATURED_DESCRIPTIONS[lang === "en" ? "en" : "es"];
  if (key && copy?.[key]) return copy[key];
  return project?.description ?? "";
}

/**
 * Orden de presentación: UTAP primero, Portfolio Personal segundo y el resto
 * por fecha de creación (más recientes primero).
 */
export function featuredRank(project) {
  const key = featuredKey(project);
  if (key === "utap") return 0;
  if (key === "portfolio") return 1;
  return 2;
}
