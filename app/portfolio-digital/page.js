/**
 * Página "Portafolio Digital" — ruta "/portfolio-digital".
 *
 * Trabajos de edición audiovisual (trabajos de edición/creación digital).
 * Reemplaza al anterior placeholder (ComingSoon). Los videos están
 * alojados en Google Drive y se presentan por categorías; los reproductores
 * montan bajo demanda con enlaces alternativos a Drive.
 */

import PortfolioDigitalContent from "./PortfolioDigitalContent";
import { AV_PROJECTS } from "@/lib/av-projects";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Portafolio Digital — Trabajos de Edición y Creación Audiovisual",
  description:
    "Selección de mis trabajos de edición de video y contenido digital realizados por Lucio Ingargiola.",
  alternates: { canonical: `${SITE_URL}/portfolio-digital` },
  openGraph: {
    title: "Portafolio Digital — Trabajos de Edición y Creación Audiovisual",
    description:
      "Selección de mis trabajos de edición de video y contenido digital realizados por Lucio Ingargiola.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Portafolio Digital — Trabajos de Edición y Creación Audiovisual",
    description:
      "Selección de mis trabajos de edición de video y contenido digital realizados por Lucio Ingargiola.",
  },
};

export default function PortfolioDigitalPage() {
  return <PortfolioDigitalContent projects={AV_PROJECTS} />;
}
