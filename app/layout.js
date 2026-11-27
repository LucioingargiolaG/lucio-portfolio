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
import {
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
  Poppins,
} from "next/font/google";
import "./globals.css"; // estilos globales + Tailwind
import { ThemeProvider } from "./context/ThemeProvider"; // tema dark/light
import { LanguageProvider } from "./context/LanguageContext"; // idioma es/en
import { ModeProvider } from "./context/ModeContext"; // modo web/ia
import Navbar from "./components/Navbar"; // barra de navegación fija
import Starfield from "./components/Starfield"; // fondo estelar animado
import SecretAccess from "./components/SecretAccess"; // atajo oculto al /admin
import { SITE_URL, LINKS } from "@/lib/site";

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
// El título de la home está en inglés porque el objetivo principal son
// clientes internacionales; las páginas internas usan la plantilla.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lucio Ingargiola — Web Developer for Small Businesses",
    template: "%s | Lucio Ingargiola",
  },
  description:
    "I build fast, modern, and user-friendly websites for small businesses, combining web development with digital marketing strategy. Based in Argentina, working with clients worldwide.",
  keywords: [
    "Lucio Ingargiola",
    "web developer",
    "small business websites",
    "landing pages",
    "React",
    "Next.js",
    "QR digital menu",
    "SEO",
    "desarrollo web",
    "Argentina",
  ],
  authors: [{ name: "Lucio Ingargiola", url: SITE_URL }],
  creator: "Lucio Ingargiola",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lucio Ingargiola — Web Developer for Small Businesses",
    description:
      "Fast, modern websites for small businesses, combining web development with digital marketing strategy.",
    url: SITE_URL,
    siteName: "Lucio Ingargiola",
    images: [
      {
        url: "/profile.webp",
        width: 192,
        height: 192,
        alt: "Lucio Ingargiola",
      },
    ],
    locale: "en_US",
    alternateLocale: ["es_AR"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Lucio Ingargiola — Web Developer for Small Businesses",
    description:
      "Fast, modern websites for small businesses, combining web development with digital marketing strategy.",
    images: ["/profile.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Configuración de viewport y tema del navegador. El theme-color evita que
// el navegador muestre bordes blancos (barra de dirección/overscroll) en
// móvil, ya que el fondo del sitio es oscuro.
export const viewport = {
  themeColor: "#000000",
};

// Datos estructurados para buscadores (schema.org).
// Solo incluimos información verificable: no hay reseñas ni métricas inventadas.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Lucio Ingargiola",
  url: SITE_URL,
  image: `${SITE_URL}/profile.webp`,
  jobTitle: "Web Developer",
  description:
    "Web developer focused on fast, modern websites for small businesses, combining development with digital marketing strategy.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Azul",
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
  sameAs: [LINKS.github, LINKS.linkedin, LINKS.instagram],
  knowsAbout: [
    "Web Development",
    "React",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "Tailwind CSS",
    "MongoDB",
    "SEO",
    "Digital Marketing",
  ],
};

/**
 * Boot script sincronizado con el parseo del HTML: aplica idioma y tema
 * guardados ANTES del primer paint. Así no hay flash de español para quien
 * eligió inglés, ni de tema oscuro para quien eligió claro.
 * Los providers leen las mismas claves (lang/theme) en useLayoutEffect.
 */
const BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var p=new URLSearchParams(location.search).get('lang');var l=(p==='es'||p==='en')?p:localStorage.getItem('lang');if(l!=='es'&&l!=='en'){l=(navigator.language||'').toLowerCase().indexOf('es')===0?'es':'en'}d.lang=l;var t=localStorage.getItem('theme');d.classList.remove('dark','light');d.classList.add(t==='light'?'light':'dark')}catch(e){}})();`;

// Componente raíz: recibe `children` (la página actual).
export default function RootLayout({ children }) {
  return (
    // `lang="es"` y la clase `dark` inicial (el ThemeProvider luego la
    // reemplaza según lo guardado en localStorage).
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} ${poppins.variable} dark`}
      suppressHydrationWarning // el boot script cambia lang/clases antes de hidratar
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="text-[var(--ink)] antialiased overflow-x-hidden">
        {/* Datos estructurados visibles para buscadores, no para el usuario */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

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
