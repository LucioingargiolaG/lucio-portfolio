/**
 * Contexto de IDIOMA: 'es' | 'en'.
 *
 * Contiene TODAS las traducciones del sitio en un solo objeto:
 *  - `translations.es` → textos en español
 *  - `translations.en` → textos en inglés
 *
 * Cada sección del sitio (nav, hero, servicios, proyectos, UTAP, contacto,
 * footer...) tiene su bloque de textos. Los componentes leen `t` (traducción
 * del idioma activo) y los switchs cambian `lang`.
 *
 * La preferencia se guarda en localStorage y en el atributo lang de <html>.
 * Si no hay preferencia guardada, se detecta el idioma del navegador.
 */
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";
import { FEATURED_DESCRIPTIONS } from "@/lib/projectCopy";
import { softRefresh } from "@/lib/uiTransitions";

// Store mínimo del idioma: la fuente de verdad es <html lang>, que el boot
// script de layout.js ya resolvió (?lang → localStorage → navegador) antes
// del primer paint. useSyncExternalStore renderiza "es" en servidor (igual
// que el HTML) y toma el idioma real apenas hidrata, sin warning ni flash.
const LANG_EVENT = "lucio:langchange";

function subscribeLang(onChange) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LANG_EVENT, onChange);
  return () => window.removeEventListener(LANG_EVENT, onChange);
}

function getLangSnapshot() {
  return typeof document !== "undefined" &&
    document.documentElement.lang === "en"
    ? "en"
    : "es";
}

function getLangServerSnapshot() {
  return "es";
}

function writeLang(next) {
  if (next !== "es" && next !== "en") return;
  if (typeof window === "undefined") return;
  document.documentElement.lang = next;
  try {
    localStorage.setItem("lang", next);
  } catch {
    // localStorage puede estar bloqueado: el atributo lang sigue funcionando.
  }
  window.dispatchEvent(new Event(LANG_EVENT));
  softRefresh();
}

// Objeto con todas las traducciones (es y en).
const translations = {
  es: {
    nav: {
      home: "inicio",
      services: "Servicios",
      projects: "Proyectos",
      howIWork: "Experiencia",
      ai: "IA",
      contact: "Contacto",
      back: "Volver",
    },
    hero: {
      greeting: "Hola, soy",
      title: "Lucio Ingargiola",
      professionalTag: "DESARROLLO WEB · MARKETING DIGITAL",
      mainTitle: "Transformo ideas en experiencias digitales.",
      available: "Disponible para proyectos de pequeños negocios",
      description:
        "Desarrollo soluciones digitales que ayudan a los negocios a conectar con sus clientes, comunicar su valor y simplificar su gestión.",
      viewProjects: "Ver mi trabajo",
      cv: "CV",
      contact: "Hablemos",
      scroll: "Scroll",
      linkedin: "LinkedIn",
      github: "GitHub",
    },
    cv: {
      es: "CV - Español",
      en: "CV - Inglés",
    },
    services: {
      badge: "Servicios",
      title: "Lo que puedo",
      titleAccent: "hacer por tu negocio",
      description:
        "Desarrollo sitios web y piezas digitales para pequeños negocios que necesitan una presencia online clara, rápida y fácil de mantener.",
      items: [
        {
          icon: "layout",
          title: "Sitios web para negocios",
          text: "Sitios modernos y responsive que explican qué ofrecés y facilitan el contacto con tus clientes.",
        },
        {
          icon: "rocket",
          title: "Landing pages",
          text: "Páginas enfocadas en una campaña, un servicio o un lanzamiento, con llamadas a la acción claras.",
        },
        {
          icon: "qr",
          title: "Menús digitales con QR",
          text: "Cartas accesibles desde el celular, con panel privado para actualizar productos, precios y horarios.",
        },
        {
          icon: "chart",
          title: "Rendimiento, SEO y contenido",
          text: "Optimización de velocidad, metadatos y textos para que más personas encuentren tu negocio.",
        },
      ],
      cta: "¿No sabés por dónde empezar?",
      ctaText: "Escribime y te ayudo a definir el alcance de tu proyecto.",
      ctaButton: "Hablemos de tu proyecto",
    },
    utap: {
      badge: "Caso de estudio",
      title: "UTAP",
      titleAccent: "Menú digital",
      subtitle:
        "Un menú digital con QR y panel de administración, en uso real.",
      problemTitle: "El desafío",
      problem:
        "Digitalizar la carta de una hamburguesería para mejorar la experiencia de sus clientes y simplificar la gestión diaria del negocio.",
      solutionTitle: "La solución",
      solution:
        "Una plataforma web que permite consultar el menú desde cualquier dispositivo mediante un código QR, sin necesidad de descargar aplicaciones. Incluye un panel de administración desde el cual el negocio puede gestionar sus productos, precios y horarios de forma autónoma.",
      featuresTitle: "Funcionalidades principales",
      features: [
        "Menú público accesible por QR, sin login",
        "Navegación por categorías y filtros horizontales",
        "Productos con nombre, descripción, precio e imagen opcional",
        "Botón de pedido configurable hacia un sistema externo",
        "Panel privado para crear, editar y eliminar productos",
        "Gestión de categorías y su orden de aparición",
        "Activación/desactivación de productos y configuración de horarios",
        "Contraseña hasheada y sesión en cookie HttpOnly",
      ],
      technologiesTitle: "Tecnologías verificadas",
      decisionsTitle: "Decisiones de diseño y UX",
      decisions: [
        "Mobile-first: el menú se abre desde un QR y se usa principalmente en el celular.",
        "Cero fricción para el cliente: sin registro ni app; acceso directo a la carta.",
        "Separación clara entre menú público y panel privado.",
        "Actualización sin deploy: el dueño cambia el contenido y se refleja por revalidación.",
      ],
      currentTitle: "Uso actual",
      current:
        "Está funcionando en la hamburguesería UTAP. El menú se usa desde el local mediante un código QR y el panel permite mantener la carta al día.",
      note:
        "No incluyo métricas de ventas ni testimonios porque no cuento con datos verificables.",
      viewLive: "Ver menú en vivo",
      viewCode: "Ver código",
      viewCase: "Ver caso de estudio",
      used: "En uso real",
      developmentTitle: "Mi participación",
      development:
        "Diseñé y desarrollé la plataforma de principio a fin, desde la definición de las funcionalidades y el diseño de la interfaz hasta la implementación del sistema de administración, la integración con la base de datos y su puesta en producción.",
      exploreDetail: "Explorá el detalle del caso",
      contactCTA: "Hablemos",
    },
    projects: {
      badge: "Proyectos",
      title: "Proyectos",
      titleAccent: "destacados",
      description:
        "Una selección de proyectos en los que combino desarrollo, diseño y estrategia para resolver necesidades reales y crear experiencias digitales funcionales.",
      carouselTitle: "Proyectos destacados",
      carouselDesc:
        "Una selección de proyectos en los que combino desarrollo, diseño y estrategia para resolver necesidades reales y crear experiencias digitales funcionales.",
      talkSubtitle: "¿Tenés un proyecto en mente?",
      talkText: "Contame qué necesita tu negocio y vemos cómo resolverlo.",
      namePlaceholder: "Tu nombre",
      viewAll: "Ver todos los proyectos",
      viewCaseStudy: "Conocer el caso UTAP",
      // Copia aprobada de los dos proyectos destacados (v1.0). Se aplica
      // desde lib/projectCopy.js para no modificar datos de producción.
      featured: {
        utapDescription: FEATURED_DESCRIPTIONS.es.utap,
        portfolioDescription: FEATURED_DESCRIPTIONS.es.portfolio,
        utapInUse: "En uso real",
      },
      filters: {
        all: "Todos",
        web: "Web Apps",
        landing: "Landing Pages",
        marketing: "Marketing",
      },
      viewArchitecture: "▶ Ver arquitectura",
      hideArchitecture: "▼ Ocultar arquitectura",
      architectureTitle: "Arquitectura",
      github: "Ver repositorio →",
      demo: "Ver proyecto →",
      empty: "Aún no hay proyectos publicados. ¡Muy pronto habrá novedades!",
      category: {
        web: "Web App",
        landing: "Landing Page",
        marketing: "Marketing",
      },
    },
    projectDetail: {
      back: "Volver a proyectos",
      architecture: "Arquitectura",
      technologies: "Tecnologías",
      viewLive: "Ver proyecto en internet",
      viewRepo: "Ver repositorio en GitHub",
      notFound: "Proyecto no encontrado",
    },
    howIWork: {
      badge: "Cómo Trabajo",
      title: "Mi enfoque de",
      titleAccent: "desarrollo",
      pillars: [
        {
          icon: "bolt",
          title: "Código Limpio",
          text: "Escribo código mantenible y legible siguiendo buenas prácticas, para que el proyecto pueda crecer sin volverse frágil.",
        },
        {
          icon: "rocket",
          title: "Rendimiento",
          text: "Cuido la velocidad de carga y la experiencia en celulares, porque una web lenta pierde clientes.",
        },
        {
          icon: "palette",
          title: "UX / UI",
          text: "Diseño interfaces claras y accesibles que priorizan lo que el usuario necesita hacer.",
        },
        {
          icon: "book",
          title: "Aprendizaje Continuo",
          text: "Sigo formándome y aplicando lo que aprendo en proyectos concretos, no solo en ejercicios.",
        },
      ],
    },
    ai: {
      badge: "Inteligencia Artificial",
      title: "También trabajo con",
      titleAccent: "inteligencia artificial",
      desc1:
        "Aplico inteligencia artificial generativa de forma práctica en mis proyectos: asistencia de código con IA, automatización de tareas y apoyo para crear contenido para web y redes sociales.",
      desc2:
        "Diseño prompts, integro APIs de IA en flujos concretos y reviso siempre los resultados con criterio propio: la herramienta acelera, la validación humana decide. En 2026 curso la Capacitación en Inteligencia Artificial en el CFL N.º 401 de Azul.",
      skills: [
        "ChatGPT",
        "Claude",
        "GitHub Copilot",
        "Cursor",
        "Prompt Engineering",
        "Asistentes de código",
        "Automatización con IA",
        "APIs de IA",
      ],
    },
    marketing: {
      badge: "Marketing Digital",
      cvEditing: "CV de edición",
      cvEditingEs: "CV Edición - Español",
      cvEditingEn: "CV Edición - Inglés",
      title: "Marketing",
      titleAccent: "digital",
      description:
        "Complemento mi perfil técnico con marketing digital y creación de contenido audiovisual. Desarrollo estrategias y edito piezas visuales enfocadas en el crecimiento de los proyectos.",
      services: [
        {
          icon: "rocket",
          title: "Landing Pages",
          text: "Páginas de aterrizaje optimizadas para transformar visitas en clientes.",
        },
        {
          icon: "trending",
          title: "SEO & Rendimiento",
          text: "Posicionamiento web y velocidad de carga para destacar en los buscadores.",
        },
        {
          icon: "file",
          title: "Contenido & Copywriting",
          text: "Mensajes claros y textos persuasivos que comunican tu marca.",
        },
        {
          icon: "share",
          title: "Redes Sociales",
          text: "Estrategia y piezas visuales para hacer crecer tu presencia online.",
        },
        {
          icon: "mail",
          title: "Email & Automatización",
          text: "Campañas y flujos automáticos que fidelizan y venden.",
        },
        {
          icon: "chart",
          title: "Analítica & Reportes",
          text: "Métricas claras y reportes accionables para medir resultados.",
        },
      ],
      cta: "¿Tenés un proyecto o una campaña en mente?",
      ctaButton: "Hablemos",
      viewPortfolio: "Ver Portafolio Digital",
    },
    portfolioDigital: {
      badge: "Portafolio Digital",
      title: "Edición",
      titleAccent: "audiovisual",
      subtitle:
        "Historias que conectan. Contenido que comunica.",
      description:
        "Contenido audiovisual pensado para potenciar la identidad de cada marca, transmitir su mensaje y conectar con su audiencia.",
      back: "Volver al inicio",
      categories: "Categorías",
      filterAll: "Todos",
      play: "Reproducir",
      playerTitle: "Reproductor de video",
      close: "Cerrar",
      openDrive: "Ver en Google Drive",
      folderLabel: "Carpeta completa",
      folderAria: "carpeta completa en Google Drive",
      cta: "Hablemos de mis trabajos",
      noVideos: "Sin videos disponibles en esta categoría.",
    },
    recruiter: {
      badge: "Para Reclutadores",
      title: "Skills & ",
      titleAccent: "Keywords",
      description:
        "Un vistazo rápido a mi stack técnico. Todo el detalle de tecnologías y herramientas para evaluar si mi perfil encaja con la posición.",
      profile: {
        name: "Lucio Ingargiola",
        role: "Desarrollador Web · Front End",
        note: "Abierto a oportunidades laborales y proyectos freelance.",
        items: [
          {
            label: "Experiencia",
            value: "Formación + proyectos reales",
          },
          {
            label: "Formación",
            value:
              "Estudiante de la Tecnicatura en Desarrollo de Aplicaciones Informáticas",
          },
          { label: "Stack principal", value: "React · Next.js · JavaScript" },
          { label: "También", value: "Angular · Node.js · Marketing Digital" },
        ],
      },
      groups: [
        {
          title: "Lenguajes & Web",
          skills: ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript"],
        },
        {
          title: "Frameworks & Librerías",
          skills: [
            "React",
            "Next.js",
            "Angular",
            "Node.js",
            "Tailwind CSS",
            "Framer Motion",
          ],
        },
        {
          title: "Datos & Backend",
          skills: [
            "MongoDB",
            "Mongoose",
            "Prisma",
            "Express",
            "Firebase",
            "REST APIs",
            "JWT",
          ],
        },
        {
          title: "Herramientas & Workflows",
          skills: [
            "Git & GitHub",
            "Vite",
            "Postman",
            "Figma",
            "Canva",
            "Webpack",
          ],
        },
        {
          title: "Editor & Audiovisual",
          skills: ["CapCut", "Premiere Pro", "Canva"],
        },
        {
          title: "Inteligencia Artificial",
          skills: [
            "ChatGPT",
            "Claude",
            "GitHub Copilot",
            "Cursor",
            "Prompt Engineering",
            "OpenAI API",
          ],
        },
        {
          title: "Habilidades Profesionales",
          skills: [
            "Responsive Design",
            "UI/UX",
            "SEO",
            "Performance",
            "Accesibilidad",
            "Trabajo en equipo",
          ],
        },
      ],
    },
    contact: {
      badge: "Contacto",
      title: "Hablemos",
      titleAccent: "de tu proyecto",
      description:
        "Contame qué necesitás. Puedo ayudarte con un sitio nuevo, una landing page o un menú digital para tu negocio.",
      email: "Email",
      direct: "También podés escribirme directo a",
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      phone: "Teléfono",
      phonePlaceholder: "Tu teléfono (opcional)",
      message: "Mensaje",
      messagePlaceholder:
        "Contame sobre tu negocio y qué te gustaría lograr con el sitio...",
      send: "Enviar Mensaje",
      sending: "Enviando...",
      success: "¡Mensaje enviado correctamente!",
      successTitle: "¡Mensaje enviado!",
      successDesc: "Gracias por escribirme. Te respondo lo antes posible.",
      sendAnother: "Enviar otro mensaje",
      error:
        "No se pudo enviar el mensaje. Revisá tu conexión o escribime directo por email.",
      configError:
        "El formulario no está configurado en este entorno. Escribime directo a",
      privacyError:
        "Necesitás aceptar el consentimiento para poder enviar el mensaje.",
      privacy:
        "Acepto que mis datos sean usados para responder esta consulta.",
    },
    recruitment: {
      badge: "Vista para Reclutamiento e IA",
      title: "Vista para reclutamiento e IA",
      subtitle: "Perfil listo para IA",
      description:
        "Versión preparada para que reclutadores, empresas y sistemas de IA puedan revisar, resumir y comparar el portfolio con menos ruido visual y más señal útil.",
      copy: "Copiar perfil en markdown",
      copied: "¡Copiado!",
    },
    footer: {
      downloadCv: "Descargar mi CV técnico",
      navigation: "Navegación",
      location: "Azul, Buenos Aires, Argentina",
      available: "Disponible para proyectos de pequeños negocios.",
      backToTop: "Volver arriba",
      rights: "Todos los derechos reservados.",
      built: "Desarrollado con",
      tagline:
        "Sitios rápidos, accesibles y con una estética cuidada para pequeños negocios.",
    },
  },
  // ---------- Traducciones en inglés ----------
  en: {
    nav: {
      home: "main",
      services: "Services",
      projects: "Work",
      howIWork: "Experience",
      ai: "AI",
      contact: "Contact",
      back: "Back",
    },
    hero: {
      greeting: "Hi, I'm",
      title: "Lucio Ingargiola",
      professionalTag: "WEB DEVELOPMENT · DIGITAL MARKETING",
      mainTitle: "I turn ideas into digital experiences.",
      available: "Available for small business projects",
      description:
        "I develop digital solutions that help businesses connect with their customers, communicate their value, and simplify their operations.",
      viewProjects: "View My Work",
      cv: "CV",
      contact: "Let's Talk",
      scroll: "Scroll",
      linkedin: "LinkedIn",
      github: "GitHub",
    },
    cv: {
      es: "CV - Spanish",
      en: "CV - English",
    },
    services: {
      badge: "Services",
      title: "What I can",
      titleAccent: "do for your business",
      description:
        "I build websites and digital assets for small businesses that need a clear, fast, and easy-to-maintain online presence.",
      items: [
        {
          icon: "layout",
          title: "Business websites",
          text: "Modern, responsive websites that explain what you offer and make it easy for customers to contact you.",
        },
        {
          icon: "rocket",
          title: "Landing pages",
          text: "Focused pages for a campaign, service, or launch, with clear calls to action.",
        },
        {
          icon: "qr",
          title: "QR digital menus",
          text: "Mobile-friendly menus with a private dashboard to update products, prices, and opening hours.",
        },
        {
          icon: "chart",
          title: "Performance, SEO & content",
          text: "Speed, metadata, and copy improvements so more people can find your business.",
        },
      ],
      cta: "Not sure where to start?",
      ctaText: "Tell me what you need and I'll help you define the scope.",
      ctaButton: "Let's talk about your project",
    },
    utap: {
      badge: "Case study",
      title: "UTAP",
      titleAccent: "Digital Menu",
      subtitle:
        "A QR digital menu with an admin dashboard, running in a real business.",
      problemTitle: "The challenge",
      problem:
        "Digitize the menu of a burger restaurant to improve the customer experience and simplify the day-to-day management of the business.",
      solutionTitle: "The solution",
      solution:
        "A web platform that lets customers open the menu on any device by scanning a QR code, with no app download required. It also includes an admin dashboard where the business can manage products, prices, and opening hours independently.",
      featuresTitle: "Main features",
      features: [
        "Public menu accessible by QR, no login required",
        "Category navigation with horizontal filters",
        "Products with name, description, price, and optional image",
        "Configurable order button linking to an external system",
        "Private dashboard to create, edit, and delete products",
        "Category management and display order",
        "Product activation/deactivation and opening-hours settings",
        "Hashed password and HttpOnly cookie session",
      ],
      technologiesTitle: "Verified technologies",
      decisionsTitle: "Design and UX decisions",
      decisions: [
        "Mobile-first: the menu is opened from a QR code and used mainly on phones.",
        "Zero friction for customers: no sign-up or app, just direct access to the menu.",
        "A clear separation between the public menu and the private dashboard.",
        "Updates without a deploy: the owner edits content and revalidation reflects it.",
      ],
      currentTitle: "Current use",
      current:
        "It is running at the UTAP burger restaurant. Customers use the menu in the restaurant through a QR code, and the dashboard keeps the menu up to date.",
      note:
        "I don't include sales metrics or testimonials because I don't have verifiable data.",
      viewLive: "View live menu",
      viewCode: "View code",
      viewCase: "View case study",
      used: "In real use",
      developmentTitle: "My role",
      development:
        "I designed and developed the platform end to end, from defining the functionality and designing the interface to implementing the admin system, integrating the database, and taking it to production.",
      exploreDetail: "Explore the case in detail",
      contactCTA: "Let's talk",
    },
    projects: {
      badge: "Work",
      title: "Featured",
      titleAccent: "projects",
      description:
        "A selection of projects in which I combine development, design and strategy to solve real needs and create functional digital experiences.",
      carouselTitle: "Featured projects",
      carouselDesc:
        "A selection of projects in which I combine development, design and strategy to solve real needs and create functional digital experiences.",
      talkSubtitle: "Have a project in mind?",
      talkText: "Tell me what your business needs and let's find a way to solve it.",
      namePlaceholder: "Your name",
      viewAll: "View all projects",
      viewCaseStudy: "See the UTAP case study",
      // Approved copy for the two featured projects (v1.0).
      featured: {
        utapDescription: FEATURED_DESCRIPTIONS.en.utap,
        portfolioDescription: FEATURED_DESCRIPTIONS.en.portfolio,
        utapInUse: "In real use",
      },
      filters: {
        all: "All",
        web: "Web Apps",
        landing: "Landing Pages",
        marketing: "Marketing",
      },
      viewArchitecture: "▶ View architecture",
      hideArchitecture: "▼ Hide architecture",
      architectureTitle: "Architecture",
      github: "View repository →",
      demo: "View project →",
      empty: "No published projects yet. More coming soon!",
      category: {
        web: "Web App",
        landing: "Landing Page",
        marketing: "Marketing",
      },
    },
    projectDetail: {
      back: "Back to projects",
      architecture: "Architecture",
      technologies: "Technologies",
      viewLive: "View live project",
      viewRepo: "View GitHub repository",
      notFound: "Project not found",
    },
    howIWork: {
      badge: "How I Work",
      title: "My approach to",
      titleAccent: "development",
      pillars: [
        {
          icon: "bolt",
          title: "Clean Code",
          text: "I write maintainable, readable code following good practices so the project can grow without becoming fragile.",
        },
        {
          icon: "rocket",
          title: "Performance",
          text: "I care about load speed and the mobile experience, because a slow site loses customers.",
        },
        {
          icon: "palette",
          title: "UX / UI",
          text: "I design clear, accessible interfaces that prioritize what the user needs to do.",
        },
        {
          icon: "book",
          title: "Continuous Learning",
          text: "I keep learning and apply what I learn to real projects, not just exercises.",
        },
      ],
    },
    ai: {
      badge: "Artificial Intelligence",
      title: "I also work with",
      titleAccent: "artificial intelligence",
      desc1:
        "I put generative AI to practical use in my projects: AI-assisted coding, task automation and support for creating web and social media content.",
      desc2:
        "I write prompts, integrate AI APIs into real workflows and always review the results with my own judgment: the tool speeds things up, human validation decides. In 2026 I am taking the Artificial Intelligence course at CFL N.º 401, Azul.",
      skills: [
        "ChatGPT",
        "Claude",
        "GitHub Copilot",
        "Cursor",
        "Prompt Engineering",
        "AI coding assistants",
        "AI automation",
        "AI APIs",
      ],
    },
    marketing: {
      badge: "Digital Marketing",
      cvEditing: "Editing CV",
      cvEditingEs: "Editing CV - Spanish",
      cvEditingEn: "Editing CV - English",
      title: "Marketing",
      titleAccent: "digital",
      description:
        "I complement my technical profile with digital marketing and audiovisual content creation. I develop strategies and edit visual pieces focused on project growth.",
      services: [
        {
          icon: "rocket",
          title: "Landing Pages",
          text: "Conversion-optimized landing pages that turn visitors into customers.",
        },
        {
          icon: "trending",
          title: "SEO & Performance",
          text: "Web positioning and load speed to stand out in search engines.",
        },
        {
          icon: "file",
          title: "Content & Copywriting",
          text: "Clear messages and persuasive copy that communicates your brand.",
        },
        {
          icon: "share",
          title: "Social Media",
          text: "Strategy and visual assets to grow your online presence.",
        },
        {
          icon: "mail",
          title: "Email & Automation",
          text: "Campaigns and automated flows that retain and sell.",
        },
        {
          icon: "chart",
          title: "Analytics & Reports",
          text: "Clear metrics and actionable reports to measure results.",
        },
      ],
      cta: "Got a project or campaign in mind?",
      ctaButton: "Let's talk",
      viewPortfolio: "View Digital Portfolio",
    },
    portfolioDigital: {
      badge: "Digital Portfolio",
      title: "Audiovisual",
      titleAccent: "Editing",
      subtitle:
        "Stories that connect. Content that communicates.",
      description:
        "Audiovisual content designed to strengthen each brand’s identity, communicate its message, and connect with its audience.",
      back: "Back to home",
      categories: "Categories",
      filterAll: "All",
      play: "Play",
      playerTitle: "Video player",
      close: "Close",
      openDrive: "View on Google Drive",
      folderLabel: "Full folder",
      folderAria: "full folder on Google Drive",
      cta: "Let's talk about my work",
      noVideos: "No videos available in this category.",
    },
    recruiter: {
      badge: "For Recruiters",
      title: "Skills & ",
      titleAccent: "Keywords",
      description:
        "A quick look at my technical stack. All the technology and tooling details to evaluate whether I fit the role.",
      profile: {
        name: "Lucio Ingargiola",
        role: "Web Developer · Front End",
        note: "Open to job opportunities and freelance projects.",
        items: [
          {
            label: "Experience",
            value: "Education + real projects",
          },
          {
            label: "Education",
            value: "IT Application Development student",
          },
          { label: "Main stack", value: "React · Next.js · JavaScript" },
          { label: "Also", value: "Angular · Node.js · Digital Marketing" },
        ],
      },
      groups: [
        {
          title: "Languages & Web",
          skills: ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript"],
        },
        {
          title: "Frameworks & Libraries",
          skills: [
            "React",
            "Next.js",
            "Angular",
            "Node.js",
            "Tailwind CSS",
            "Framer Motion",
          ],
        },
        {
          title: "Data & Backend",
          skills: [
            "MongoDB",
            "Mongoose",
            "Prisma",
            "Express",
            "Firebase",
            "REST APIs",
            "JWT",
          ],
        },
        {
          title: "Tools & Workflows",
          skills: [
            "Git & GitHub",
            "Vite",
            "Postman",
            "Figma",
            "Canva",
            "Webpack",
          ],
        },
        {
          title: "Editing & Audiovisual",
          skills: ["CapCut", "Premiere Pro", "Canva"],
        },
        {
          title: "Artificial Intelligence",
          skills: [
            "ChatGPT",
            "Claude",
            "GitHub Copilot",
            "Cursor",
            "Prompt Engineering",
            "OpenAI API",
          ],
        },
        {
          title: "Professional Skills",
          skills: [
            "Responsive Design",
            "UI/UX",
            "SEO",
            "Performance",
            "Accessibility",
            "Teamwork",
          ],
        },
      ],
    },
    contact: {
      badge: "Contact",
      title: "Let's talk",
      titleAccent: "about your project",
      description:
        "Tell me what you need. I can help with a new website, a landing page, or a digital menu for your business.",
      email: "Email",
      direct: "You can also email me directly at",
      name: "Name",
      namePlaceholder: "Your name",
      phone: "Phone",
      phonePlaceholder: "Your phone (optional)",
      message: "Message",
      messagePlaceholder:
        "Tell me about your business and what you'd like the website to achieve...",
      send: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully!",
      successTitle: "Message sent!",
      successDesc:
        "Thanks for reaching out. I'll get back to you as soon as possible.",
      sendAnother: "Send another message",
      error:
        "The message could not be sent. Check your connection or email me directly.",
      configError:
        "The form is not configured in this environment. Email me directly at",
      privacyError:
        "You must accept the consent to be able to send the message.",
      privacy:
        "I agree that my data may be used to respond to this inquiry.",
    },
    recruitment: {
      badge: "Recruitment & AI View",
      title: "Recruitment & AI view",
      subtitle: "AI-ready profile",
      description:
        "A prepared version so recruiters, companies and AI systems can review, summarize and compare the portfolio with less visual noise and more useful signal.",
      copy: "Copy profile as markdown",
      copied: "Copied!",
    },
    footer: {
      downloadCv: "Download my technical CV",
      navigation: "Navigation",
      location: "Azul, Buenos Aires, Argentina",
      available: "Available for small business projects.",
      backToTop: "Back to top",
      rights: "All rights reserved.",
      built: "Built with",
      tagline:
        "Fast, accessible websites with a polished look for small businesses.",
    },
  },
};

// Valor por defecto del contexto (español).
const LanguageContext = createContext({
  lang: "es",
  t: translations.es,
  toggleLanguage: () => {},
  setLang: () => {},
});

// Provider: expone el idioma actual, sus traducciones y las funciones
// para cambiar de idioma.
export function LanguageProvider({ children }) {
  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getLangServerSnapshot
  );

  // Cambia el idioma, lo guarda y notifica a todos los switches.
  const setLang = useCallback((next) => writeLang(next), []);

  // Alterna entre es y en (versión toggle).
  const toggleLanguage = useCallback(
    () => writeLang(lang === "es" ? "en" : "es"),
    [lang]
  );

  return (
    <LanguageContext.Provider
      // `t` es el objeto de traducciones del idioma activo.
      value={{ lang, t: translations[lang], toggleLanguage, setLang }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Hook para leer el idioma y las traducciones desde cualquier componente.
export function useLanguage() {
  return useContext(LanguageContext);
}
