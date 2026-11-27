/**
 * Página de detalle de un proyecto — ruta "/proyectos/[id]".
 *
 * Es un Server Component: busca el proyecto en MongoDB y genera los
 * metadatos SEO. La parte visual (con textos en ES/EN) vive en
 * ProjectDetailContent, un Client Component que usa LanguageContext.
 */

import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { featuredDescriptionForLang } from "@/lib/projectCopy";
import ProjectDetailContent from "./ProjectDetailContent";

export async function generateMetadata({ params, searchParams }) {
  const { id } = await params;
  // Los metadatos se generan en servidor: siguen ?lang= cuando viene en la
  // URL y usan español como default (el cliente resuelve además localStorage
  // y el idioma del navegador).
  const { lang } = (await searchParams) ?? {};
  const seoLang = lang === "en" ? "en" : "es";
  let project = null;
  try {
    await connectToDatabase();
    project = await Project.findById(id).lean();
  } catch {}

  if (!project) return { title: "Proyecto no encontrado" };

  const description = featuredDescriptionForLang(project, seoLang);

  return {
    title: project.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/proyectos/${id}`,
      languages: {
        es: `${SITE_URL}/proyectos/${id}?lang=es`,
        en: `${SITE_URL}/proyectos/${id}?lang=en`,
      },
    },
    openGraph: {
      title: `${project.title} | Lucio Ingargiola`,
      description,
      locale: seoLang === "en" ? "en_US" : "es_AR",
      url: `${SITE_URL}/proyectos/${id}`,
      images: project.image?.startsWith("/") ? [project.image] : undefined,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  let project = null;

  try {
    await connectToDatabase();
    const doc = await Project.findById(id).lean();
    if (doc) {
      project = {
        _id: String(doc._id),
        title: doc.title,
        description: doc.description,
        technologies: doc.technologies ?? [],
        githubUrl: doc.githubUrl,
        demoUrl: doc.demoUrl ?? "",
        category: doc.category,
        architecture: doc.architecture,
        image: doc.image ?? "🛒",
      };
    }
  } catch (err) {
    console.warn("Error al cargar proyecto:", err.message);
  }

  if (!project) notFound();

  return <ProjectDetailContent project={project} />;
}
