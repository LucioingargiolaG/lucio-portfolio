import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap dinámico: incluye las páginas fijas y el detalle de cada proyecto
 * guardado en MongoDB. Si la base no está disponible, devolvemos igual las
 * páginas principales para no romper el sitemap.
 *
 * Se revalida cada hora: los proyectos nuevos aparecen sin necesidad de un
 * nuevo deploy.
 */
export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();

  const pages = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/proyectos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/portfolio-digital`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  try {
    await connectToDatabase();
    const projects = await Project.find({})
      .select("_id updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return [
      ...pages,
      ...projects.map((project) => ({
        url: `${SITE_URL}/proyectos/${project._id}`,
        lastModified: project.updatedAt ?? now,
        changeFrequency: "monthly",
        priority: 0.7,
      })),
    ];
  } catch (err) {
    console.warn("Sitemap: MongoDB no disponible.", err.message);
    return pages;
  }
}
