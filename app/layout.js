/**
 * Layout raíz de la aplicación (App Router).
 *
 * Este archivo envuelve TODAS las páginas del sitio. Acá se define:
 *  - Las fuentes tipográficas (cargadas y optimizadas por next/font).
 *  - Los metadatos globales (título, descripción, OpenGraph) para SEO.
 *  - Los Providers de estado global (tema, idioma y modo web/IA).
 *  - Los elementos fijos de la interfaz: fondo de estrellas (Starfield),
 *    la barra de navegación (Navbar) y el acceso secreto al admin
 *    (SecretAccess).
 */

// next/font/google descarga y optimiza las fuentes en build-time.
// Cada fuente se registra como variable CSS (--font-inter, etc.)
// para poder usarla en globals.css con font-family.
import { Inter, Space_Grotesk, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css"; // estilos globales + Tailwind
import { ThemeProvider } from "./context/ThemeProvider"; // tema dark/light
import { LanguageProvider } from "./context/LanguageContext"; // idioma es/en
import { ModeProvider } from "./context/ModeContext"; // modo web/ia
import Navbar from "./components/Navbar"; // barra de navegación fija
import Starfield from "./components/Starfield"; // fondo estelar animado
import SecretAccess from "./components/SecretAccess"; // atajo oculto al /admin

// Fuente principal del body (párrafos y UI general).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Fuente "display": se usa para títulos (h1-h5) vía globals.css.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

// Fuente monoespaciada: etiquetas técnicas, badges, código (`.font-mono`).
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Fuente alternativa para párrafos (registrada como --font-gotham aunque
// carga Poppins; usada explícitamente en algunos textos del hero).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-gotham",
});

// Metadatos globales del sitio (SEO y compartir en redes).
export const metadata = {
  title: "Lucio Ingargiola | Front End Developer",
  description:
    "Estudiante de Desarrollo de Aplicaciones Informáticas - Front End Developer especializado en React, Next.js, Angular y más.",
  keywords: [
    "Lucio Ingargiola",
    "Front End",
    "React",
    "Next.js",
    "Angular",
    "JavaScript",
    "HTML",
    "CSS",
  ],
  openGraph: {
    title: "Lucio Ingargiola | Front End Developer",
    description:
      "Desarrollador Front End y estudiante de Desarrollo de Aplicaciones Informáticas",
  },
};

// Componente raíz: recibe `children` (la página actual).
export default function RootLayout({ children }) {
  return (
    // `lang="es"` y la clase `dark` inicial (el ThemeProvider luego la
    // reemplaza según lo guardado en localStorage).
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} ${poppins.variable} dark`}
      suppressHydrationWarning // evita warnings de hidratación por el tema
    >
      <body className="text-[var(--ink)] antialiased overflow-x-hidden">
        {/* Providers: envuelven toda la app para compartir estado. */}
        <ThemeProvider>
          <LanguageProvider>
            <ModeProvider>
              {/* Elementos globales fijos */}
              <Starfield /> {/* fondo de estrellas detrás de todo */}
              <Navbar /> {/* menú superior */}
              {children} {/* aquí se renderiza la página actual */}
              <SecretAccess /> {/* candado oculto (tecleá "admin") */}
            </ModeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
