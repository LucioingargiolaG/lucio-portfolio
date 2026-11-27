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
import { SITE_URL } from "@/lib/site";
import { featuredRank } from "@/lib/projectCopy";
import ProjectsContent from "./ProjectsContent";

export const metadata = {
  title: "Proyectos web y casos de estudio",
  description:
    "Proyectos de desarrollo web de Lucio Ingargiola. Incluye UTAP, un menú QR con panel de administración en uso en una hamburguesería.",
  alternates: {
    canonical: `${SITE_URL}/proyectos`,
  },
  openGraph: {
    title: "Proyectos web y casos de estudio",
    description:
      "Proyectos de desarrollo web de Lucio Ingargiola. Incluye UTAP, un menú QR con panel de administración en uso en una hamburguesería.",
    url: `${SITE_URL}/proyectos`,
    type: "website",
    locale: "es_AR",
    images: ["/profile.webp"],
  },
  twitter: {
    card: "summary",
    title: "Proyectos web y casos de estudio",
    description:
      "Proyectos de desarrollo web de Lucio Ingargiola. Incluye UTAP, un menú QR con panel de administración en uso en una hamburguesería.",
  },
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
      demoUrl: p.demoUrl ?? "",
      category: p.category,
      architecture: p.architecture,
      image: p.image ?? "🛒",
    }));
    // Orden editorial: UTAP primero, Portfolio Personal segundo y el resto
    // por antigüedad. Array.prototype.sort es estable en Node, así que los
    // proyectos empatados conservan el orden por fecha.
    projects.sort((a, b) => featuredRank(a) - featuredRank(b));
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
