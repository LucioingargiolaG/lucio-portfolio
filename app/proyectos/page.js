/**
 * Página de proyectos — ruta "/proyectos".
 *
 * Es un Server Component async: trae los proyectos de MongoDB en el
 * servidor y se los pasa a `ProjectsContent` (componente cliente) para
 * renderizarlos. Si MongoDB no está disponible, muestra la vista vacía.
 *
 * Muy similar a la lógica de app/page.js pero con su propia metadata.
 */

import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import ProjectsContent from "./ProjectsContent";

export const metadata = {
  title: "Proyectos | Lucio Ingargiola",
  description:
    "Portafolio de proyectos de desarrollo front-end y marketing digital de Lucio Ingargiola.",
};

// Revalida cada 60 s: sirve la versión cacheada y regenera en background.
export const revalidate = 60;

export default async function ProjectsPage() {
  let projects = [];

  try {
    // Traemos todos los proyectos, más recientes primero.
    await connectToDatabase();
    const docs = await Project.find({}).sort({ createdAt: -1 }).lean();
    // Serializamos a objetos planos (los ObjectId deben convertirse a string).
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
    // Sin DB no rompemos la página: logueamos y mostramos estado vacío.
    console.warn(
      "MongoDB no disponible. " +
        "Configura MONGODB_URI en .env.local para conectar.",
      err.message
    );
  }

  return <ProjectsContent projects={projects} />;
}
