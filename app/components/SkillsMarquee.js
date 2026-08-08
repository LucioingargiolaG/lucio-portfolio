/**
 * Marquee (carrusel infinito) de grupos de skills.
 *
 * Toma los grupos de habilidades definidos en las traducciones
 * (t.recruiter.groups, en LanguageContext.js) y los muestra como tarjetas
 * que se desplazan horizontalmente sin fin.
 *
 * Truco del marquee infinito: el array se duplica (groups + groups) y la
 * animación CSS `marquee` mueve el contenedor exactamente -50%, de modo que
 * al llegar al final el scroll "reinicia" sin que se note.
 */
'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { SkillChip } from './skillIcons';

// Tarjeta con el título del grupo y sus chips de skills.
function GroupCard({ group }) {
  return (
    <div className="w-72 shrink-0 rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 shadow-lg transition-colors hover:border-accent-40">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
        {group.title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {group.skills.map((skill) => (
          <SkillChip key={skill} name={skill} />
        ))}
      </div>
    </div>
  );
}

export default function SkillsMarquee() {
  const { t } = useLanguage();
  const groups = t.recruiter.groups; // lista de grupos (según idioma)

  // Duplicamos para lograr el loop infinito (ver comentario del archivo).
  const track = [...groups, ...groups];

  return (
    <div className="marquee-mask relative overflow-hidden py-2">
      {/* .animate-marquee = keyframes marquee de globals.css (45s loop).
          hover:[animation-play-state:paused] pausa al pasar el mouse. */}
      <div className="animate-marquee flex w-max items-stretch gap-5 py-2 pr-5 hover:[animation-play-state:paused]">
        {track.map((group, i) => (
          <GroupCard key={`${group.title}-${i}`} group={group} />
        ))}
      </div>
    </div>
  );
}
