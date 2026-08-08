/**
 * Script de "seed" (siembra de datos) para MongoDB.
 *
 * BORRA todos los proyectos existentes y los reemplaza con la lista de
 * `seedProjects` de abajo. Sirve para inicializar la base de datos con
 * contenido de ejemplo.
 *
 * Cómo correrlo:
 *   npm run seed
 *   (requiere que MongoDB esté corriendo y MONGODB_URI en .env.local)
 *
 * ¡OJO! deleteMany({}) borra todo: NO lo corras si no querés perder datos.
 */

import { connectToDatabase } from "../lib/mongodb.js";
import Project from "../models/Project.js";

// Datos de ejemplo que se insertan (6 proyectos de distintas categorías).
const seedProjects = [
  {
    title: "E-Commerce App",
    description:
      "Plataforma de comercio electrónico con carrito de compras, autenticación JWT y panel de administración completo.",
    technologies: ["React", "Node.js", "MongoDB", "JWT"],
    githubUrl: "https://github.com/LucioingargiolaG",
    category: "web",
    architecture:
      "Frontend en React con Context API para estado global. Backend en Node.js + Express con arquitectura MVC. Rutas protegidas mediante middleware JWT. Base de datos MongoDB con Mongoose para modelado de usuarios, productos y órdenes.",
    image: "🛒",
  },
  {
    title: "Dashboard Analytics",
    description:
      "Panel de administración con gráficos interactivos, filtros dinámicos y visualización de datos en tiempo real.",
    technologies: ["Next.js", "Chart.js", "Tailwind CSS"],
    githubUrl: "https://github.com/LucioingargiolaG",
    category: "web",
    architecture:
      "Next.js con App Router. Renderizado del lado del servidor para datos iniciales. Chart.js para gráficos con actualización vía WebSockets. Diseño responsive con Tailwind CSS y modo oscuro.",
    image: "📊",
  },
  {
    title: "App de Tareas",
    description:
      "Aplicación CRUD para gestión de tareas con drag & drop, filtros personalizados y autenticación.",
    technologies: ["Angular", "TypeScript", "Firebase"],
    githubUrl: "https://github.com/LucioingargiolaG",
    category: "web",
    architecture:
      "Frontend en Angular 18 con módulos lazy-loaded. RxJS para manejo de estado reactivo. Firebase Auth para autenticación y Firestore como base de datos en tiempo real. Drag & drop con Angular CDK.",
    image: "✅",
  },
  {
    title: "Landing Page Moderna",
    description:
      "Landing page responsiva con animaciones CSS, diseño moderno y optimización SEO para un cliente real.",
    technologies: ["HTML5", "CSS3", "JavaScript"],
    githubUrl: "https://github.com/LucioingargiolaG",
    category: "landing",
    architecture:
      "HTML semántico con meta tags OG para SEO. CSS Grid y Flexbox para layout responsive. Animaciones con CSS keyframes y IntersectionObserver para lazy loading de secciones. Sin frameworks para máxima performance.",
    image: "🌐",
  },
  {
    title: "Sistema de Gestión",
    description:
      "Sistema web completo para gestión de inventarios con reportes, exportación a PDF y control de usuarios.",
    technologies: ["Java", "Spring Boot", "MySQL", "Thymeleaf"],
    githubUrl: "https://github.com/LucioingargiolaG",
    category: "web",
    architecture:
      "Backend en Spring Boot con arquitectura en capas (Controller, Service, Repository). Spring Security para autenticación y autorización por roles. MySQL con JPA/Hibernate. Frontend con Thymeleaf y Bootstrap. Exportación con JasperReports.",
    image: "📦",
  },
  {
    title: "Video Promocional",
    description:
      "Edición de video promocional corporativo con animaciones, transiciones y efectos visuales profesionales.",
    technologies: ["Premiere Pro", "After Effects", "Canva"],
    githubUrl: "https://github.com/LucioingargiolaG",
    category: "marketing",
    architecture:
      "Flujo de trabajo: pre-producción con guión gráfico, grabación con cámara profesional, edición en Adobe Premiere Pro con multicámara, gráficos animados en After Effects con expresiones JavaScript, color grading y exportación optimizada para web y redes sociales.",
    image: "🎬",
  },
];

// Función principal del seed.
async function seed() {
  try {
    // 1. Conectamos a la base de datos.
    await connectToDatabase();
    // 2. Borramos todo (¡cuidado!).
    await Project.deleteMany({});
    // 3. Insertamos los proyectos de ejemplo.
    const result = await Project.insertMany(seedProjects);
    console.log(`✅ ${result.length} proyectos insertados correctamente.`);
  } catch (err) {
    console.error("❌ Error al insertar datos:", err.message);
  }
  // 4. Terminamos el proceso (sino quedaría colgado esperando).
  process.exit(0);
}

// Ejecutamos el seed.
seed();
