/**
 * Logo / marca del sitio: monograma "LI" en un cuadrito con glow neón.
 */
export default function Logo() {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--neon-badge-bg)] border border-[var(--neon-line)] text-[var(--neon)] font-black text-sm tracking-tight shadow-[0_0_15px_var(--neon-glow-soft)] transition-all duration-300 hover:shadow-[0_0_25px_var(--neon-glow)]">
      LI
    </span>
  );
}
