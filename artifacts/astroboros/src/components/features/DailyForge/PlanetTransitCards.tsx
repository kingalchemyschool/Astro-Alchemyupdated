import type { NatalChart, PlanetKey, PlanetPosition } from "@/types/astro";
import { HOUSE_DOMAIN, HOUSE_WORK, PLANET_META, SIGNS, SIGN_QUALITY } from "@/constants/astro";

const PLANET_KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

type TransitChart = Pick<NatalChart, "positions">;

interface Props {
  chart: TransitChart;
  title: string;
  subtitle: string;
  mode?: "personal" | "world" | "natal";
}

const PLANET_APPLICATIONS: Record<PlanetKey, string> = {
  sun: "Choose one visible priority and give it your clearest attention.",
  moon: "Notice what your body and mood are asking for before you commit your energy.",
  mercury: "Write the message, ask the question, or make the small connection that moves the work forward.",
  venus: "Put care into the exchange: refine the offer, relationship, space, or resource in front of you.",
  mars: "Take one direct, bounded action instead of scattering effort across several fronts.",
  jupiter: "Make room for growth by teaching, sharing, researching, or taking the wider view.",
  saturn: "Strengthen the container: define the limit, schedule the work, or finish the responsibility.",
  uranus: "Try the unexpected route and leave enough flexibility for a useful interruption.",
  neptune: "Protect quiet and discernment; let imagination inform the work without letting it blur the next step.",
  pluto: "Name what is ready to change, then remove one outdated layer rather than forcing a total overhaul.",
};

function ordinal(house: number) {
  const suffix = house === 1 ? "st" : house === 2 ? "nd" : house === 3 ? "rd" : "th";
  return `${house}${suffix}`;
}

function meaningFor(key: PlanetKey, position: PlanetPosition, mode: "personal" | "world" | "natal") {
  const meta = PLANET_META[key];
  const domain = HOUSE_DOMAIN[position.house - 1] ?? "the arena of lived experience";
  const quality = SIGN_QUALITY[position.signIndex] ?? "distinctive and ready to be worked with";
  if (mode === "world") {
    return `${meta.name} carries ${meta.fn.toLowerCase()} through ${domain}. In ${SIGNS[position.signIndex].name}, the collective field is ${quality}.`;
  }
  if (mode === "natal") {
    return `Your natal ${meta.name} encodes ${meta.fn.toLowerCase()} through ${domain}. In ${SIGNS[position.signIndex].name}, this part of your blueprint is ${quality}.`;
  }
  return `${meta.name} carries ${meta.fn.toLowerCase()} through ${domain}. In ${SIGNS[position.signIndex].name}, your attention is shaped by being ${quality}.`;
}

export default function PlanetTransitCards({ chart, title, subtitle, mode = "personal" }: Props) {
  return (
    <section className="rounded-2xl border border-[#3B4B8C]/35 bg-[#080B18] p-4 sm:p-5">
      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B9EE8]">Planet transits</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-[#E8E4D8]">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#6B7A99]">{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {PLANET_KEYS.map((key) => {
          const position = chart.positions[key];
          const meta = PLANET_META[key];
          const sign = SIGNS[position.signIndex];
          return (
            <article key={key} className="rounded-xl border border-[#263152] bg-[#060810] p-4 transition-colors hover:border-[#5368a5]/70">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8B9EE8]/30 bg-[#131b36] font-serif text-xl text-[#d8b86a]">
                    {meta.glyph}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-semibold text-[#E8E4D8]">{meta.name}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B9EE8]">
                      {sign.glyph} {sign.name} · {position.degree}°{String(position.minute).padStart(2, "0")}′
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-[#d8b86a]/30 bg-[#d8b86a]/[0.07] px-2.5 py-1 font-mono text-[10px] text-[#d8b86a]">
                  {ordinal(position.house)} house
                </span>
              </div>
              <div className="mt-4 grid gap-3 border-t border-[#1E2640] pt-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#6B7A99]">Meaning</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#B5BDD2]">{meaningFor(key, position, mode)}</p>
                </div>
                <div className="rounded-lg border border-[#3B4B8C]/35 bg-[#0b1020] p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8B9EE8]">Daily application</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#E8E4D8]">
                    {PLANET_APPLICATIONS[key]} {HOUSE_WORK[position.house - 1] ? `Favor ${HOUSE_WORK[position.house - 1]}.` : ""}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}