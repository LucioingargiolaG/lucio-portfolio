/**
 * Datos públicos del sitio.
 *
 * Centralizamos acá la URL canónica y los enlaces que se repiten en varios
 * archivos (layout, sitemap, footer, caso de estudio, etc.). Así, si cambia
 * un enlace, se actualiza en un solo lugar.
 *
 * IMPORTANTE: este archivo NO debe contener credenciales. Solo información
 * pública (URLs, redes y correo de contacto).
 */

export const SITE_URL = "https://lucio-portfolio-theta.vercel.app";

export const LINKS = {
  github: "https://github.com/LucioingargiolaG",
  linkedin: "https://www.linkedin.com/in/lucioingargiola/",
  instagram: "https://www.instagram.com/lucioingargiola/",
  utapDemo: "https://menu-digital-utap.vercel.app",
  utapRepo: "https://github.com/LucioingargiolaG/menu-digital-utap",
  portfolioRepo: "https://github.com/LucioingargiolaG/lucio-portfolio",
};

/**
 * Correo público de contacto.
 *
 * Por qué existe esta función:
 * En producción la variable NEXT_PUBLIC_CONTACT_EMAIL llegó a estar cargada
 * con el texto completo "NEXT_PUBLIC_CONTACT_EMAIL=correo@..." en lugar de
 * solo "correo@...". Al leerla directamente, el sitio mostraba el prefijo
 * como parte del correo.
 *
 * Esta función limpia el valor sin importar cómo se haya cargado la variable
 * (con prefijo, con comillas o con espacios). La causa de fondo igual hay que
 * corregirla en el panel de Vercel, pero el código queda a prueba de ese error.
 */
function readContactEmail() {
  // Normalizamos en varios pasos porque el valor puede venir con espacios,
  // con el nombre de la variable pegado y/o con comillas alrededor.
  const cleaned = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "")
    .trim()
    // Quita comillas simples o dobles exteriores.
    .replace(/^["']+|["']+$/g, "")
    // Quita un posible prefijo "NEXT_PUBLIC_CONTACT_EMAIL=".
    .replace(/^\s*NEXT_PUBLIC_CONTACT_EMAIL\s*=\s*/, "")
    // Vuelve a quitar comillas por si quedaron dentro del prefijo.
    .replace(/^["']+|["']+$/g, "")
    .trim();

  return (
    cleaned ||
    // Fallback público: si la variable no existe, el correo sigue visible.
    "lucioingargiola1@gmail.com"
  );
}

export const CONTACT_EMAIL = readContactEmail();
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
