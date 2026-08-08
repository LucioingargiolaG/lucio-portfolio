/**
 * Configuración de PostCSS.
 *
 * PostCSS es la herramienta que procesa el CSS. Acá lo único que usamos es
 * el plugin de Tailwind CSS v4, que se encarga de compilar las clases
 * utilitarias (bg-accent, flex, grid, etc.) que se usan en los componentes.
 *
 * @tailwindcss/postcss lee el archivo app/globals.css (que importa
 * 'tailwindcss') y genera el CSS final que se envía al navegador.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
