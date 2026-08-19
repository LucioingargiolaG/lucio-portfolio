/**
 * Página principal (home) — ruta "/".
 *
 * Es un Server Component (async): se renderiza en el servidor y por eso
 * puede leer de la base de datos directamente.
 *
 * Flujo:
 *  1. Intenta conectar a MongoDB y traer los proyectos de la colección.
 *  2. Si MongoDB no está disponible, el sitio NO se rompe: avisa por
 *     consola y pasa una lista vacía (los componentes muestran "fallbacks").
 *  3. Renderiza las secciones de la landing en orden.
 */

import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import HeroSection from "./components/HeroSection";
import HowIWorkSection from "./components/HowIWorkSection";
import MarketingSection from "./components/MarketingSection";
import RecruitmentView from "./components/RecruitmentView";
import ProjectsSection from "./components/ProjectsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

// Revalida cada 60 s: sirve la versión estática cacheada y la regenera
// en background cuando expira (mucho más rápido que force-dynamic).
export const revalidate = 60;

export default async function Home() {
  let projects = [];

  try {
    // Conectamos y traemos todos los proyectos, del más nuevo al más viejo.
    // `.lean()` devuelve objetos JS simples (más rápido, sin métodos de Mongoose).
    await connectToDatabase();
    const docs = await Project.find({}).sort({ createdAt: -1 }).lean();
    // Mapeamos a objetos planos serializables para pasarlos al cliente
    // (los ObjectId de Mongo no son JSON serializables directamente).
    projects = docs.map((p) => ({
      _id: String(p._id),
      title: p.title,
      description: p.description,
      technologies: p.technologies ?? [],
      githubUrl: p.githubUrl,
      category: p.category,
      architecture: p.architecture,
      image: p.image ?? "🛒",
    }));
  } catch (err) {
    // Si no hay base de datos, no tumbamos la página: logueamos y seguimos.
    console.warn(
      "MongoDB no disponible. " +
        "Configura MONGODB_URI en .env.local para conectar.",
      err.message
    );
  }

  return (
    <>
      <HeroSection /> {/* portada con foto, CV y stack */}
      <ProjectsSection projects={projects} /> {/* carrusel de proyectos */}
      <HowIWorkSection /> {/* metodología / pilares */}
      <MarketingSection /> {/* servicios de marketing digital */}
      <RecruitmentView /> {/* vista para reclutadores e IA (solo modo IA) */}
      <ContactSection /> {/* formulario de contacto + redes */}
      <Footer /> {/* pie de página */}
    </>
  );
}
