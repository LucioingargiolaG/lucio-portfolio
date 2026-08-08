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
    // Las imágenes se sirven sin optimización (sin el servicio de
    // optimización de Next). Útil para exportaciones estáticas (out/)
    // o cuando se despliega en plataformas sin soporte de optimización
    // de imágenes (por ej. hosting estático o Netlify).
    unoptimized: true,
  },
};

// Exportamos la configuración por defecto para que Next.js la lea.
export default nextConfig;
