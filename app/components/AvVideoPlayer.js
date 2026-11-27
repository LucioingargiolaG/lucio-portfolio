/**
 * Reproductor de trabajos audiovisual: intento de reproducción embebida
 * de Google Drive (iframe del preview público del video). Si el video no
 * permite reproducción embebida, se ofrece siempre un enlace alternativo
 * directo a Drive ("Ver en Google Drive").
 *
 * Montado bajo demanda: se renderiza solo al hacer clic en una tarjeta
 * (carga diferida de los reproductores). Dialog con Escape y click afuera.
 *
 * ACCESIBILIDAD (F1): focus trap dentro del dialog y restitución del foco
 * a la tarjeta que abrió el reproductor al cerrar (closeAndRestore).
 */

"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

function driveIdFromUrl(url) {
  const match = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : "";
}

export default function AvVideoPlayer({ project, onClose, triggerRef }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const closeRef = useRef(null);

  const driveId = driveIdFromUrl(project.videoUrl);
  // Google Drive public preview URL: viable para archivos públicos.
  const embedUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : "";

  useEffect(() => {
    // 1) Escape a nivel de ventana (funciona incluso con foco dentro del
    //    iframe de Drive, que no es accesible mediante keydown en el padre).
    const onKeyWindow = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyWindow);

    // 2) Focus trap: recorre los elementos focusables del dialog
    //    (iframe es accesible por tabIndex lo suficiente; inputs/botones
    //    también). Al estar en el último y presionar Tab, volvemos al
    //    primero; al estar en el primero y Shift+Tab, al último.
    const el = containerRef.current;
    if (el) {
      const onKeyDown = (e) => {
        if (e.key !== "Tab") return;
        const items = Array.from(
          el.querySelectorAll(
            'button, a[href], input, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (items.length === 0) return;
        const idx = items.indexOf(document.activeElement);
        if (e.shiftKey && (idx <= 0 || idx === -1)) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && (idx >= items.length - 1 || idx === -1)) {
          e.preventDefault();
          items[0].focus();
        }
      };
      el.addEventListener("keydown", onKeyDown);
      // Enfocamos la X al abrir el reproductor.
      const t = setTimeout(() => closeRef.current?.focus(), 150);
      return () => {
        el.removeEventListener("keydown", onKeyDown);
        clearTimeout(t);
        window.removeEventListener("keydown", onKeyWindow);
      };
    }
    return () => window.removeEventListener("keydown", onKeyWindow);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.portfolioDigital.playerTitle}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado: título + cerrar */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-4">
          <span className="min-w-0 truncate text-sm font-bold text-[var(--ink-strong)]">
            {project.title}
          </span>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            aria-label={t.portfolioDigital.close}
            className="rounded-full p-2 text-[var(--ink-muted)] transition-all duration-300 hover:bg-[var(--bg-glass)] hover:text-[var(--ink-strong)]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Reproductor */}
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={project.title}
            className="w-full bg-black"
            style={{ height: "min(70vh, 480px)" }}
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="flex min-h-[260px] items-center justify-center p-8">
            <a
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-[var(--accent-strong)]"
            >
              {t.portfolioDigital.openDrive}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        )}

        {/* Enlace alternativo siempre disponible */}
        <a
          href={project.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full border-t border-[var(--line)] p-4 text-center text-sm font-bold text-[var(--accent)] transition-all duration-300 hover:bg-[var(--accent-5)] hover:underline"
        >
          {t.portfolioDigital.openDrive} →
        </a>
      </div>
    </div>
  );
}
