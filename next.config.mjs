/**
 * Configuración de Next.js.
 * Archivo .mjs = JavaScript con módulos ES (import/export), no hace falta
 * configurarlo como "type": "module" en package.json.
 *
 * Nota: este proyecto usa Next.js 16 (App Router). Ver la carpeta
 * node_modules/next/dist/docs/ antes de escribir código de Next.js nuevo.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [{ pathname: "/proyectos/menu-utap.png", search: "" }],
  },
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
      ],
    }];
  },
  async redirects() {
    return [
      // La página de proyectos se llama /proyectos; los links viejos con
      // /projects (compartidos antes del renombre) siguen funcionando.
      { source: '/projects', destination: '/proyectos', permanent: true },
    ];
  },
};

// Exportamos la configuración por defecto para que Next.js la lea.
export default nextConfig;
