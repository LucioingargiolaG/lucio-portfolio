/**
 * Contexto de IDIOMA: 'es' | 'en'.
 *
 * Contiene TODAS las traducciones del sitio en un solo objeto:
 *  - `translations.es` → textos en español
 *  - `translations.en` → textos en inglés
 *
 * Cada sección del sitio (nav, hero, howIWork, projects, marketing,
 * contact, footer...) tiene su bloque de textos. Los componentes leen
 * `t` (traducción del idioma activo) y los switchs cambian `lang`.
 *
 * La preferencia se guarda en localStorage y en el atributo lang de <html>.
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Objeto con todas las traducciones (es y en).
const translations = {
  es: {
    nav: {
      home: "Inicio",
      howIWork: "Experiencia",
      ai: "IA",
      projects: "Portfolio",
      contact: "Contacto",
      back: "Volver",
    },
    hero: {
      greeting: "Hola, soy",
      title: "Lucio Ingargiola",
      role: "Front End Developer",
      available: "Disponible para proyectos",
      description:
        "Estudiante de la Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas. Front-End Developer & Estratega de Marketing Digital.",
      descStrong1: "Desarrollo de Aplicaciones Informáticas",
      descStrong2: "Front End Developer",
      highlights: [
        "HTML, CSS, JavaScript, React y Next.js",
        "Diseño responsive y rendimiento",
        "Colaboración con equipos multidisciplinarios",
      ],
      viewProjects: "Ver Proyectos",
      cv: "CV",
      contact: "Contactar",
      scroll: "Scroll",
      linkedin: "LinkedIn",
      github: "GitHub",
    },
    cv: {
      es: "CV - Español",
      en: "CV - Inglés",
    },
    howIWork: {
      badge: "Cómo Trabajo",
      title: "Mi enfoque de",
      titleAccent: "desarrollo",
      pillars: [
        {
          icon: "bolt",
          title: "Código Limpio",
          text: "Escribo código mantenible y escalable siguiendo las mejores prácticas y principios SOLID.",
        },
        {
          icon: "rocket",
          title: "Rendimiento",
          text: "Optimizo aplicaciones para lograr cargas rápidas y experiencias de usuario fluidas.",
        },
        {
          icon: "palette",
          title: "UX / UI",
          text: "Diseño interfaces intuitivas y accesibles que priorizan la experiencia del usuario.",
        },
        {
          icon: "book",
          title: "Aprendizaje Continuo",
          text: "Siempre actualizándome con las últimas tecnologías y tendencias del desarrollo web.",
        },
      ],
      stats: [
        { value: "1+", label: "Año de experiencia" },
        { value: "10+", label: "Proyectos realizados" },
        { value: "5+", label: "Tecnologías dominadas" },
        { value: "100%", label: "Dedicación y pasión" },
      ],
    },
    ai: {
      badge: "Inteligencia Artificial",
      title: "También trabajo con",
      titleAccent: "inteligencia artificial",
      desc1:
        "Además del desarrollo web, integro herramientas de inteligencia artificial en mis flujos de trabajo: desde asistentes de código hasta automatización de tareas y generación de contenido.",
      desc2:
        "Diseño prompts efectivos, entreno agentes y aprovecho APIs de IA para crear soluciones más rápidas, inteligentes y productivas.",
      skills: [
        "ChatGPT",
        "Claude",
        "GitHub Copilot",
        "Cursor",
        "Prompt Engineering",
        "Automatización",
        "OpenAI API",
        "RAG",
      ],
    },
    projects: {
      badge: "Proyectos",
      title: "Mis",
      titleAccent: "proyectos",
      description:
        "Aquí algunos de los trabajos que he realizado. Cada proyecto representa un desafío diferente y una oportunidad de aprendizaje.",
      carouselTitle: "Portafolio Técnico",
      carouselDesc:
        "He desarrollado plataformas web y proyectos front-end orientados a rendimiento, estética y escalabilidad.",
      talkSubtitle: "Hablemos",
      talkText: "Construyamos algo escalable",
      namePlaceholder: "Tu Nombre",
      filters: {
        all: "Todos",
        web: "Web Apps",
        landing: "Landing Pages",
        marketing: "Marketing",
      },
      viewArchitecture: "▶ Ver arquitectura",
      hideArchitecture: "▼ Ocultar arquitectura",
      architectureTitle: "Arquitectura",
      github: "Ver proyecto →",
      empty: "Aún no hay proyectos publicados. ¡Muy pronto habrá novedades!",
      category: {
        web: "Web App",
        landing: "Landing Page",
        marketing: "Marketing",
      },
    },
    marketing: {
      badge: "Marketing Digital",
      cvEditing: "CV de edición",
      title: "Marketing",
      titleAccent: "digital",
      description:
        "Además del desarrollo, me dedico al mundo del contenido audiovisual: edito videos y creo piezas que ayudan a las marcas a conectar con su audiencia.",
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
          text: "Métricas claras y reportes accionables para medir resultados reales.",
        },
      ],
      cta: "¿Tenés un proyecto o una campaña en mente?",
      ctaButton: "Hablemos",
      viewPortfolio: "Ver Portafolio Digital",
    },
    portfolioDigital: {
      badge: "Próximamente",
      title: "Portafolio",
      titleAccent: "digital",
      subtitle:
        "Estoy preparando una selección de mis trabajos audiovisuales y de edición. Muy pronto vas a poder verlos acá.",
      back: "Volver al inicio",
    },
    recruiter: {
      badge: "Para Reclutadores",
      title: "Skills & ",
      titleAccent: "Keywords",
      description:
        "Un vistazo rápido a mi stack técnico. Todo el detalle de tecnologías y herramientas para evaluar si mi perfil encaja con la posición.",
      profile: {
        name: "Lucio Ingargiola",
        role: "Front End Developer",
        note: "Abierto a nuevas oportunidades laborales.",
        items: [
          { label: "Experiencia", value: "1+ año desarrollando" },
          {
            label: "Formación",
            value: "Técnico en Desarrollo de Aplicaciones Informáticas",
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
      titleAccent: "juntos",
      description: "¿Tenés un proyecto en mente? No dudes en consultarme.",
      email: "Email",
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      phone: "Teléfono",
      phonePlaceholder: "Tu teléfono (opcional)",
      message: "Mensaje",
      messagePlaceholder: "Escribí tu mensaje...",
      send: "Enviar Mensaje",
      sending: "Enviando...",
      success: "¡Mensaje enviado correctamente!",
      successTitle: "¡Mensaje enviado!",
      successDesc: "Gracias por escribirme. Te respondo lo antes posible.",
      sendAnother: "Enviar otro mensaje",
      error: "Hubo un error. Intentá de nuevo.",
      privacyError:
        "Necesitás aceptar el consentimiento para poder enviar el mensaje.",
      privacy: "Acepto que mis datos sean usados para responder esta consulta.",
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
      location: "Azul , Buenos Aires, Argentina",
      available: "Disponible para proyectos y colaboraciones.",
      backToTop: "Volver arriba",
      rights: "Todos los derechos reservados.",
      built: "Desarrollado con",
      tagline:
        "Experiencias web rápidas, accesibles y con una estética cuidada.",
    },
  },
  // ---------- Traducciones en inglés ----------
  en: {
    nav: {
      home: "Home",
      howIWork: "Experience",
      ai: "AI",
      projects: "Portfolio",
      contact: "Contact",
      back: "Back",
    },
    hero: {
      greeting: "Hi, I'm",
      title: "Lucio Ingargiola",
      role: "Front End Developer",
      available: "Available for projects",
      description:
        "Student of the University Technician in IT Application Development. Front-End Developer & Digital Marketing Strategist.",
      descStrong1: "Information Technology",
      descStrong2: "Front End Developer",
      highlights: [
        "HTML, CSS, JavaScript, React and Next.js",
        "Responsive design and performance",
        "Collaboration with multidisciplinary teams",
      ],
      viewProjects: "View Projects",
      cv: "CV",
      contact: "Contact",
      scroll: "Scroll",
      linkedin: "LinkedIn",
      github: "GitHub",
    },
    cv: {
      es: "CV - Spanish",
      en: "CV - English",
    },
    howIWork: {
      badge: "How I Work",
      title: "My approach to",
      titleAccent: "development",
      pillars: [
        {
          icon: "bolt",
          title: "Clean Code",
          text: "I write maintainable and scalable code following best practices and SOLID principles.",
        },
        {
          icon: "rocket",
          title: "Performance",
          text: "I optimize applications to achieve fast loads and smooth user experiences.",
        },
        {
          icon: "palette",
          title: "UX / UI",
          text: "I design intuitive and accessible interfaces that prioritize user experience.",
        },
        {
          icon: "book",
          title: "Continuous Learning",
          text: "Always updating myself with the latest technologies and web development trends.",
        },
      ],
      stats: [
        { value: "1+", label: "Year of experience" },
        { value: "10+", label: "Projects completed" },
        { value: "5+", label: "Technologies mastered" },
        { value: "100%", label: "Dedication and passion" },
      ],
    },
    ai: {
      badge: "Artificial Intelligence",
      title: "I also work with",
      titleAccent: "artificial intelligence",
      desc1:
        "Beyond web development, I integrate artificial intelligence tools into my workflows: from coding assistants to task automation and content generation.",
      desc2:
        "I design effective prompts, train agents and leverage AI APIs to build faster, smarter and more productive solutions.",
      skills: [
        "ChatGPT",
        "Claude",
        "GitHub Copilot",
        "Cursor",
        "Prompt Engineering",
        "Automation",
        "OpenAI API",
        "RAG",
      ],
    },
    projects: {
      badge: "Projects",
      title: "My",
      titleAccent: "projects",
      description:
        "Here are some of the works I have done. Each project represents a different challenge and a learning opportunity.",
      carouselTitle: "Technical Portfolio",
      carouselDesc:
        "I have developed web platforms and front-end projects focused on performance, aesthetics and scalability.",
      talkSubtitle: "Let's talk",
      talkText: "Let's build something scalable",
      namePlaceholder: "Your Name",
      filters: {
        all: "All",
        web: "Web Apps",
        landing: "Landing Pages",
        marketing: "Marketing",
      },
      viewArchitecture: "▶ View architecture",
      hideArchitecture: "▼ Hide architecture",
      architectureTitle: "Architecture",
      github: "GitHub →",
      empty: "No published projects yet. More coming soon!",
      category: {
        web: "Web App",
        landing: "Landing Page",
        marketing: "Marketing",
      },
    },
    marketing: {
      badge: "Digital Marketing",
      cvEditing: "Editing CV",
      title: "Marketing",
      titleAccent: "digital",
      description:
        "Beyond development, I also work in the audiovisual content world: I edit videos and create pieces that help brands connect with their audience.",
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
          text: "Clear metrics and actionable reports to measure real results.",
        },
      ],
      cta: "Got a project or campaign in mind?",
      ctaButton: "Let's talk",
      viewPortfolio: "View Digital Portfolio",
    },
    portfolioDigital: {
      badge: "Coming soon",
      title: "Digital",
      titleAccent: "portfolio",
      subtitle:
        "I'm preparing a selection of my audiovisual and editing work. You'll be able to see it here very soon.",
      back: "Back to home",
    },
    recruiter: {
      badge: "For Recruiters",
      title: "Skills & ",
      titleAccent: "Keywords",
      description:
        "A quick look at my technical stack. All the technology and tooling details to evaluate whether I fit the role.",
      profile: {
        name: "Lucio Ingargiola",
        role: "Front End Developer",
        note: "Open to new job opportunities.",
        items: [
          { label: "Experience", value: "1+ year building" },
          {
            label: "Education",
            value: "IT Application Development Technician",
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
      title: "Let's",
      titleAccent: "talk",
      description: "Have a project in mind? Don't hesitate to ask me.",
      email: "Email",
      name: "Name",
      namePlaceholder: "Your name",
      phone: "Phone",
      phonePlaceholder: "Your phone (optional)",
      message: "Message",
      messagePlaceholder: "Write your message...",
      send: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully!",
      successTitle: "Message sent!",
      successDesc:
        "Thanks for reaching out. I'll get back to you as soon as possible.",
      sendAnother: "Send another message",
      error: "There was an error. Please try again.",
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
      available: "Open to projects and collaborations.",
      backToTop: "Back to top",
      rights: "All rights reserved.",
      built: "Built with",
      tagline: "Fast, accessible web experiences with a polished aesthetic.",
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
  const [lang, setLangState] = useState("es");

  // Al cargar, recupera el idioma guardado (si lo hay) y lo aplica al <html>.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("lang");
    if (saved === "es" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  // Cambia el idioma, lo guarda en localStorage y actualiza el atributo lang.
  const setLang = useCallback((next) => {
    if (next !== "es" && next !== "en") return; // solo permite es/en
    setLangState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", next);
      document.documentElement.lang = next;
    }
  }, []);

  // Alterna entre es y en (versión toggle).
  const toggleLanguage = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "es" ? "en" : "es";
      if (typeof window !== "undefined") {
        localStorage.setItem("lang", next);
        document.documentElement.lang = next;
      }
      return next;
    });
  }, []);

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
