/**
 * Tarjeta de un trabajo audiovisual (rediseño editorial):
 * miniatura real del video (thumbnail de Google Drive), overlay de
 * reproducción, título y categoría debajo, hover sutil.
 *
 * FORMATO UNIFORME (cierre v1.0): todas las tarjetas comparten un
 * contenedor de miniatura 9:16. El encuadre original se respeta con
 * `object-fit: contain` y el espacio sobrante se completa con una copia
 * desenfocada de la misma miniatura (`object-fit: cover` + blur), de modo
 * que no hay recortes ni deformaciones y el grid queda alineado.
 *
 * Al hacer clic: abre AvVideoPlayer (modal) que reproduce el video
 * embebido de Google Drive si es posible, ofreciendo siempre un enlace
 * alternativo directo a Drive. Montado bajo demanda (carga diferida).
 * El preview de Google Drive conserva la proporción original del video.
 */

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import FadeInUp from "./FadeInUp";
import AvVideoPlayer from "./AvVideoPlayer";

// Proporción única de todas las miniaturas (contenedor 9:16).
const THUMB_RATIO = "9 / 16";

export default function AvProjectCard({ project, categoryName, delay = 0 }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  // Restituye el foco a la tarjeta que abrió el reproductor al cerrarlo (F1).
  const closeAndRestore = () => {
    setOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 50);
  };

  return (
    <>
      <FadeInUp delay={delay}>
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setOpen(true)}
          aria-label={`${t.portfolioDigital.play}: ${project.title}`}
          className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] text-left transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xl"
        >
          {/* Miniatura del video: contenedor 9:16 uniforme */}
          <div
            className="relative overflow-hidden bg-black"
            style={{ aspectRatio: THUMB_RATIO }}
          >
            {project.thumbnailUrl ? (
              <>
                {/* Fondo: la misma miniatura desenfocada y ampliada, para
                    completar el espacio que deja el encuadre original. */}
                <Image
                  src={project.thumbnailUrl}
                  alt=""
                  aria-hidden="true"
                  fill
                  unoptimized
                  loading="lazy"
                  decoding="async"
                  className="scale-125 object-cover opacity-70 blur-2xl"
                />
                {/* Miniatura original: contenida, sin deformar ni recortar */}
                <Image
                  src={project.thumbnailUrl}
                  alt={project.title}
                  fill
                  unoptimized
                  loading="lazy"
                  decoding="async"
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Play
                  size={28}
                  fill="currentColor"
                  className="text-[var(--ink-muted)]"
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Overlay cinematográfico + botón de reproducción superpuesto */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-black">
                <Play size={18} fill="currentColor" aria-hidden="true" />
              </span>
            </div>
          </div>

          {/* Título + categoría debajo de la miniatura (jerarquía editorial) */}
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <h2 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--ink-strong)] transition-colors duration-300 group-hover:text-[var(--accent)]">
              {project.title}
            </h2>
            {categoryName && (
              <span className="mt-auto font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                {categoryName}
              </span>
            )}
          </div>
        </button>
      </FadeInUp>
      {open && <AvVideoPlayer project={project} onClose={closeAndRestore} />}
    </>
  );
}
