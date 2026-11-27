/**
 * Realce visual muy breve para cambios de estado que no navegan (idioma,
 * tema, modo WEB/IA). No bloquea la interacción, no remonta componentes y
 * respeta prefers-reduced-motion.
 *
 * Se anima <html> en lugar de envolver la app: envolverla con una key
 * resetearía el estado de formularios, filtros y reproductores al cambiar
 * de idioma o de modo.
 */
export function softRefresh(duration = 170) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof document.documentElement.animate !== "function") return;

  document.documentElement.animate(
    [{ opacity: 0.94 }, { opacity: 1 }],
    { duration, easing: "ease-out" }
  );
}
