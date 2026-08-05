import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ForgeReport } from "@/types/forge";
import type { AdditionalPointKey, NatalChart, PlanetKey } from "@/types/astro";
import type {
  AngleKey,
  TransitAdditionalAspect,
  TransitAngleAspect,
  TransitAspect,
  TransitData,
} from "@/lib/transits";
import { HOUSE_DOMAIN, HOUSE_WORK, PLANET_META, SIGNS, SIGN_QUALITY } from "@/constants/astro";
import ForgeReportView from "@/components/features/DailyForge/ForgeReport";

type YouSubpage = "daily" | "transit";
type DetailAspect = TransitAspect | TransitAdditionalAspect | TransitAngleAspect;

const ASPECT_LABEL: Record<string, string> = {
  conjunction: "Conjunct",
  sextile: "Sextile",
  square: "Square",
  trine: "Trine",
  opposition: "Opposition",
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "✶",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const HOUSE_SHORT: Record<number, string> = {
  1: "Identity", 2: "Value", 3: "Communication", 4: "Foundations",
  5: "Creativity", 6: "Refinement", 7: "Relationships", 8: "Transformation",
  9: "Expansion", 10: "Contribution", 11: "Networks", 12: "Integration",
};

interface Props {
  reading: { chart: NatalChart };
  report: ForgeReport;
  transitData: TransitData;
  zodiac: "tropical" | "sidereal";
  transitLocationLabel: string;
  onToggleZodiac: () => void;
}

export default function DailyForgeYouView({
  reading,
  report,
  transitData,
  zodiac,
  transitLocationLabel,
  onToggleZodiac,
}: Props) {
  const [subpage, setSubpage] = useState<YouSubpage>("daily");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const natal = reading.chart;

  const entries = useMemo(
    () => buildTransitEntries(transitData, natal),
    [transitData, natal],
  );

  return (
    <div className="space-y-5">
      <YouSubpageTabs
        subpage={subpage}
        onChange={(next) => {
          setSubpage(next);
          setExpandedId(null);
        }}
      />

      {subpage === "daily" ? (
        <ForgeReportView
          report={report}
          cached={false}
          zodiac={zodiac}
          onToggleZodiac={onToggleZodiac}
          transitLocationLabel={transitLocationLabel}
          showMoon={false}
          showCelestialField={false}
        />
      ) : (
        <section className="space-y-3">
          <div className="px-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B9EE8]">Today’s transit</p>
            <p className="mt-1 text-sm text-[#6B7285]">
              Every current non-Moon transit affecting your natal chart, in one place.
            </p>
          </div>
          {entries.length > 0 ? entries.map((entry) => (
            <TransitDetailCard
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            />
          )) : (
            <div className="rounded-2xl border border-[#263152] bg-[#101113] px-5 py-4 text-sm text-[#6B7285]">
              No current non-Moon contacts are within the active orb.
            </div>
          )}
        </section>
      )}

      <p className="px-2 pb-2 text-center font-mono text-[10px] uppercase tracking-widest text-[#3A4460]">
        {subpage === "daily" ? "Daily Forge" : "Today’s Transit"} · {zodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"} · {transitLocationLabel}
      </p>
    </div>
  );
}

function YouSubpageTabs({ subpage, onChange }: { subpage: YouSubpage; onChange: (subpage: YouSubpage) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-full border border-[#252d4b] bg-[#0a0d18] p-1">
      {([
        { key: "daily" as const, label: "Daily Forge" },
        { key: "transit" as const, label: "Today’s Transit" },
      ]).map(({ key, label }) => {
        const active = key === subpage;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-[#545468] text-[#f0ead9] shadow-[0_0_18px_rgba(139,158,232,0.12)]"
                : "text-[#6B7A99] hover:text-[#E8E4D8]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

interface TransitEntry {
  id: string;
  aspect: DetailAspect;
  title: string;
  timing: string;
  glyphs: string;
  houseLabel: string;
  transitSign: string;
  natalPlacement: string;
  meaning: string;
  application: string;
  transitHouse: number;
  targetHouse?: number;
  orb: number;
}

function TransitDetailCard({
  entry,
  expanded,
  onClick,
  compact = false,
}: {
  entry: TransitEntry;
  expanded: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors ${expanded ? "border-[#8B9EE8]/65 bg-[#12182A]" : "border-[#535B70] bg-[#101113] hover:border-[#8B9EE8]/55"}`}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onClick}
        className="w-full px-5 py-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#F0EADB]">{entry.timing}</p>
          <span className="font-serif text-xl tracking-wide text-[#F0EADB]">{entry.glyphs}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h3 className={`${compact ? "text-[15px]" : "text-[18px]"} font-serif font-semibold text-[#F0EADB]`}>{entry.title}</h3>
          {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-[#8B9EE8]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[#8B9EE8]" />}
        </div>
        {!expanded && (
          <p className="mt-2 text-[11px] uppercase tracking-widest text-[#6B7285]">
            {entry.houseLabel} · Tap to learn more
          </p>
        )}
      </button>
      {expanded && (
        <div className="border-t border-[#263152] px-5 pb-5 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailBlock label="Transit placement" text={`${entry.transitSign} · ${entry.houseLabel} · ${entry.orb.toFixed(1)}° orb`} />
            <DetailBlock label="Natal contact" text={entry.natalPlacement} />
            <DetailBlock label="Meaning" text={entry.meaning} />
            <DetailBlock label="Daily application" text={entry.application} accent />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ label, text, accent = false }: { label: string; text: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "border-[#8B9EE8]/35 bg-[#0D1220]" : "border-[#263152] bg-[#080B18]"}`}>
      <p className={`font-mono text-[9px] uppercase tracking-[0.18em] ${accent ? "text-[#8B9EE8]" : "text-[#6B7285]"}`}>{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#C4CADC]">{text}</p>
    </div>
  );
}

function buildTransitEntries(
  transitData: TransitData,
  natal: NatalChart,
): TransitEntry[] {
  const all: TransitEntry[] = [
    ...transitData.aspects.map((aspect) => makeEntry(aspect, transitData, natal)),
    ...transitData.additionalAspects.map((aspect) => makeEntry(aspect, transitData, natal)),
    ...transitData.angleAspects.map((aspect) => makeEntry(aspect, transitData, natal)),
  ];
  const seen = new Set<string>();
  return all
    .filter((entry) => {
      const planet = entry.aspect.transitPlanet;
      const long = ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(planet);
      const angle = "natalAngle" in entry.aspect;
      const keep = entry.aspect.transitPlanet !== "moon";
      if (!keep || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .sort((a, b) => {
      const aLong = ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(a.aspect.transitPlanet) || "natalAngle" in a.aspect;
      const bLong = ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(b.aspect.transitPlanet) || "natalAngle" in b.aspect;
      return Number(aLong) - Number(bLong);
    })
    .slice(0, 14);
}

function makeEntry(aspect: DetailAspect, transitData: TransitData, natal: NatalChart): TransitEntry {
  const transit = transitData.positions[aspect.transitPlanet];
  const transitMeta = PLANET_META[aspect.transitPlanet];
  const transitSign = `${transitMeta.name} in ${SIGNS[transit.signIndex].name} at ${transit.degree}°${String(transit.minute).padStart(2, "0")}′`;
  let title = "";
  let houseLabel = `${ordinal(transit.house)} house · ${HOUSE_SHORT[transit.house]}`;
  let natalPlacement = "";
  let targetName = "";
  let targetSign = "";
  let targetHouse: number | undefined;

  if ("natalPlanet" in aspect) {
    const natalPosition = natal.positions[aspect.natalPlanet];
    const natalMeta = PLANET_META[aspect.natalPlanet];
    targetName = natalMeta.name;
    targetSign = `${SIGNS[natalPosition.signIndex].name} ${natalPosition.degree}°${String(natalPosition.minute).padStart(2, "0")}′`;
    targetHouse = natalPosition.house;
    natalPlacement = `Natal ${natalMeta.name} · ${targetSign} · ${ordinal(natalPosition.house)} house`;
    title = `${transitMeta.name} ${ASPECT_LABEL[aspect.type].toLowerCase()} your ${natalMeta.name}`;
  } else if ("natalPoint" in aspect) {
    targetName = additionalLabel(aspect.natalPoint);
    const point = natal.additionalPoints[aspect.natalPoint];
    targetSign = `${SIGNS[point.signIndex].name} ${point.degree}°${String(point.minute).padStart(2, "0")}′`;
    natalPlacement = `Natal ${targetName} · ${targetSign}`;
    title = `${transitMeta.name} ${ASPECT_LABEL[aspect.type].toLowerCase()} your ${targetName}`;
    houseLabel = "natal point · personal axis";
  } else {
    targetName = angleLabel(aspect.natalAngle);
    const angle = natal.angles[aspect.natalAngle];
    targetSign = `${SIGNS[angle.signIndex].name} ${angle.degree}°${String(angle.minute).padStart(2, "0")}′`;
    natalPlacement = `Natal ${targetName} · ${targetSign}`;
    title = `${transitMeta.name} ${ASPECT_LABEL[aspect.type].toLowerCase()} your ${targetName}`;
    houseLabel = "chart angle · public axis";
  }

  const domain = targetHouse ? HOUSE_DOMAIN[targetHouse - 1] : HOUSE_DOMAIN[transit.house - 1];
  const quality = SIGN_QUALITY[transit.signIndex];
  const meaning = `${transitMeta.name} brings ${transitMeta.fn.toLowerCase()} into ${domain}. The ${ASPECT_LABEL[aspect.type].toLowerCase()} contact makes that process more noticeable through ${targetName || targetSign}; in ${SIGNS[transit.signIndex].name}, the tone is ${quality}.`;
  const application = `${planetApplication(aspect.transitPlanet)} ${HOUSE_WORK[(targetHouse ?? transit.house) - 1] ? `Favor ${HOUSE_WORK[(targetHouse ?? transit.house) - 1]}.` : ""}`;
  const id = "natalPlanet" in aspect
    ? `${aspect.transitPlanet}-${aspect.natalPlanet}-${aspect.type}`
    : "natalPoint" in aspect
      ? `${aspect.transitPlanet}-${aspect.natalPoint}-${aspect.type}`
      : `${aspect.transitPlanet}-${aspect.natalAngle}-${aspect.type}`;

  return {
    id,
    aspect,
    title,
    timing: timingFor(aspect.transitPlanet),
    glyphs: `${transitMeta.glyph} ${ASPECT_GLYPH[aspect.type]} ${targetGlyph(aspect, natal)}`,
    houseLabel,
    transitSign,
    natalPlacement,
    meaning,
    application,
    transitHouse: transit.house,
    targetHouse,
    orb: aspect.orb,
  };
}

function timingFor(planet: PlanetKey) {
  if (planet === "moon") return "Today";
  if (["sun", "mercury", "venus", "mars"].includes(planet)) return "This week";
  if (planet === "jupiter") return "19 days left";
  if (planet === "saturn") return "81 days left";
  if (planet === "uranus") return "210 days left";
  if (planet === "neptune") return "299 days left";
  return "Long term";
}

function targetGlyph(aspect: DetailAspect, natal: NatalChart) {
  if ("natalPlanet" in aspect) return PLANET_META[aspect.natalPlanet].glyph;
  if ("natalPoint" in aspect) return additionalGlyph(aspect.natalPoint);
  return angleGlyph(aspect.natalAngle);
}

function planetApplication(key: PlanetKey) {
  return {
    sun: "Choose one visible priority and give it your clearest attention.",
    moon: "Notice what your body and mood are asking for before you commit your energy.",
    mercury: "Write the message, ask the question, or make the small connection that moves the work forward.",
    venus: "Put care into the exchange, relationship, space, or resource in front of you.",
    mars: "Take one direct, bounded action instead of scattering effort.",
    jupiter: "Make room for growth by teaching, sharing, researching, or taking the wider view.",
    saturn: "Strengthen the container by defining the limit, schedule, or responsibility.",
    uranus: "Try the unexpected route and leave enough flexibility for a useful interruption.",
    neptune: "Protect quiet and discernment; let imagination inform the next step.",
    pluto: "Name what is ready to change and remove one outdated layer.",
  }[key];
}

function ordinal(house: number) {
  const suffix = house === 1 ? "st" : house === 2 ? "nd" : house === 3 ? "rd" : "th";
  return `${house}${suffix}`;
}

function additionalLabel(key: AdditionalPointKey) {
  return { chiron: "Chiron", lilith: "Black Moon Lilith", northNode: "North Node", southNode: "South Node" }[key];
}

function additionalGlyph(key: AdditionalPointKey) {
  return { chiron: "⚷", lilith: "⚸", northNode: "☊", southNode: "☋" }[key];
}

function angleLabel(key: AngleKey) {
  return { ascendant: "Ascendant", midheaven: "Midheaven", descendant: "Descendant", imumCoeli: "Imum Coeli" }[key];
}

function angleGlyph(key: AngleKey) {
  return { ascendant: "AC", midheaven: "MC", descendant: "DC", imumCoeli: "IC" }[key];
}