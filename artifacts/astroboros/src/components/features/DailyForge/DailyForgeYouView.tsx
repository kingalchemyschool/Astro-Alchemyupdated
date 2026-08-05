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
import { houseOf } from "@/lib/houses";
import { computeChart } from "@/lib/ephemeris";
import ForgeReportView from "@/components/features/DailyForge/ForgeReport";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const natal = reading.chart;

  const entries = useMemo(
    () => buildTransitEntries(transitData, natal),
    [transitData, natal],
  );

  return (
    <div className="space-y-5">
      <ForgeReportView
        report={report}
        cached={false}
        zodiac={zodiac}
        onToggleZodiac={onToggleZodiac}
        transitLocationLabel={transitLocationLabel}
        showMoon={false}
        showCelestialField={false}
        showDailyApplication={false}
      />

      <section className="mx-auto max-w-2xl space-y-3">
        <div className="rounded-2xl border border-[#8B9EE8]/25 bg-gradient-to-br from-[#0D1220] to-[#080B18] px-7 py-5 shadow-[0_0_30px_rgba(59,75,140,0.12)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B9EE8]">Your daily transits</p>
          <h2 className="mt-2 font-serif text-xl font-semibold text-[#E8E4D8]">The sky in contact with your blueprint</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#9AA3B8]">
            Open any aspect to see the exact geometry, houses, degrees, decans, and a practical way to work with it today.
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
          <div className="rounded-2xl border border-[#8B9EE8]/20 bg-[#080B18] px-5 py-4 text-sm text-[#6B7285]">
            No current personal contacts are within the active orb.
          </div>
        )}
      </section>

      <p className="px-2 pb-2 text-center font-mono text-[10px] uppercase tracking-widest text-[#3A4460]">
        Daily Forge · {zodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"} · {transitLocationLabel}
      </p>
    </div>
  );
}

interface TransitEntry {
  id: string;
  aspect: DetailAspect;
  title: string;
  timing: string;
  durationDays: number;
  glyphs: string;
  houseLabel: string;
  transitSign: string;
  natalPlacement: string;
  transitDecan: string;
  natalDecan: string;
  aspectDetail: string;
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
    <div className={`overflow-hidden rounded-xl border transition-colors ${expanded ? "border-[#8B9EE8]/50 bg-[#0D1220]" : "border-[#8B9EE8]/25 bg-[#3B4B8C]/10 hover:border-[#8B9EE8]/55"}`}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onClick}
        className="w-full px-5 py-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#8B9EE8]">{entry.timing}</p>
          <span className="font-serif text-xl tracking-wide text-[#E8E4D8]">{entry.glyphs}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h3 className={`${compact ? "text-[15px]" : "text-[18px]"} font-serif font-semibold text-[#E8E4D8]`}>{entry.title}</h3>
          {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-[#8B9EE8]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[#8B9EE8]" />}
        </div>
        {!expanded && (
          <p className="mt-2 text-[11px] uppercase tracking-widest text-[#A8B4D4]">
            {entry.transitSign} · {entry.houseLabel} · Tap to learn more
          </p>
        )}
      </button>
      {expanded && (
        <div className="border-t border-[#8B9EE8]/20 px-5 pb-5 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailBlock label="Transit placement" text={`${entry.transitSign} · ${entry.houseLabel}`} />
            <DetailBlock label="Natal contact" text={entry.natalPlacement} />
            <DetailBlock label="Decans" text={`Transit: ${entry.transitDecan} · Natal: ${entry.natalDecan}`} />
            <DetailBlock label="Aspect geometry" text={entry.aspectDetail} />
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
      if (entry.aspect.transitPlanet === "moon" || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .sort((a, b) => {
      return a.durationDays - b.durationDays || b.aspect.score - a.aspect.score;
    });
}

function makeEntry(aspect: DetailAspect, transitData: TransitData, natal: NatalChart): TransitEntry {
  const transit = transitData.positions[aspect.transitPlanet];
  const transitMeta = PLANET_META[aspect.transitPlanet];
  const transitSign = `${transitMeta.name} in ${SIGNS[transit.signIndex].name} at ${degreeLabel(transit.degree, transit.minute)}${transit.retrograde ? " · retrograde" : ""}`;
  let title = "";
  let houseLabel = `${ordinal(transit.house)} house · ${HOUSE_SHORT[transit.house]}`;
  let natalPlacement = "";
  let natalDecan = "Not applicable";
  let targetName = "";
  let targetSign = "";
  let targetHouse: number | undefined;

  if ("natalPlanet" in aspect) {
    const natalPosition = natal.positions[aspect.natalPlanet];
    const natalMeta = PLANET_META[aspect.natalPlanet];
    targetName = natalMeta.name;
    targetSign = `${SIGNS[natalPosition.signIndex].name} ${degreeLabel(natalPosition.degree, natalPosition.minute)}`;
    targetHouse = natalPosition.house;
    natalPlacement = `Natal ${natalMeta.name} · ${targetSign} · ${ordinal(natalPosition.house)} house`;
    natalDecan = decanLabel(natalPosition.degree, SIGNS[natalPosition.signIndex].name);
    title = `${transitMeta.name} ${ASPECT_LABEL[aspect.type].toLowerCase()} your ${natalMeta.name}`;
  } else if ("natalPoint" in aspect) {
    targetName = additionalLabel(aspect.natalPoint);
    const point = natal.additionalPoints[aspect.natalPoint];
    targetSign = `${SIGNS[point.signIndex].name} ${degreeLabel(point.degree, point.minute)}`;
    targetHouse = houseOf(point.longitude, natal.cusps);
    natalPlacement = `Natal ${targetName} · ${targetSign} · ${ordinal(targetHouse)} house`;
    natalDecan = decanLabel(point.degree, SIGNS[point.signIndex].name);
    title = `${transitMeta.name} ${ASPECT_LABEL[aspect.type].toLowerCase()} your ${targetName}`;
    houseLabel = `${ordinal(targetHouse)} house · ${HOUSE_SHORT[targetHouse]}`;
  } else {
    targetName = angleLabel(aspect.natalAngle);
    const angle = natal.angles[aspect.natalAngle];
    targetSign = `${SIGNS[angle.signIndex].name} ${degreeLabel(angle.degree, angle.minute)}`;
    targetHouse = { ascendant: 1, midheaven: 10, descendant: 7, imumCoeli: 4 }[aspect.natalAngle];
    natalPlacement = `Natal ${targetName} · ${targetSign}`;
    natalDecan = decanLabel(angle.degree, SIGNS[angle.signIndex].name);
    title = `${transitMeta.name} ${ASPECT_LABEL[aspect.type].toLowerCase()} your ${targetName}`;
    houseLabel = `${ordinal(targetHouse)} house · ${HOUSE_SHORT[targetHouse]}`;
  }

  const domain = targetHouse ? HOUSE_DOMAIN[targetHouse - 1] : HOUSE_DOMAIN[transit.house - 1];
  const quality = SIGN_QUALITY[transit.signIndex];
  const meaning = `${transitMeta.name} brings ${transitMeta.fn.toLowerCase()} into ${domain}. The ${ASPECT_LABEL[aspect.type].toLowerCase()} contact makes that process more noticeable through ${targetName || targetSign}; in ${SIGNS[transit.signIndex].name}, the tone is ${quality}.`;
  const application = `${planetApplication(aspect.transitPlanet)} ${HOUSE_WORK[(targetHouse ?? transit.house) - 1] ? `Favor ${HOUSE_WORK[(targetHouse ?? transit.house) - 1]}.` : ""}`;
  const aspectDetail = `${ASPECT_LABEL[aspect.type]} ${ASPECT_GLYPH[aspect.type]} · ${aspect.orb.toFixed(1)}° from exact`;
  const durationDays = daysRemaining(aspect, transitData, natal);
  const id = "natalPlanet" in aspect
    ? `${aspect.transitPlanet}-${aspect.natalPlanet}-${aspect.type}`
    : "natalPoint" in aspect
      ? `${aspect.transitPlanet}-${aspect.natalPoint}-${aspect.type}`
      : `${aspect.transitPlanet}-${aspect.natalAngle}-${aspect.type}`;

  return {
    id,
    aspect,
    title,
    timing: timingLabel(durationDays),
    durationDays,
    glyphs: `${transitMeta.glyph} ${ASPECT_GLYPH[aspect.type]} ${targetGlyph(aspect, natal)}`,
    houseLabel,
    transitSign,
    natalPlacement,
    transitDecan: decanLabel(transit.degree, SIGNS[transit.signIndex].name),
    natalDecan,
    aspectDetail,
    meaning,
    application,
    transitHouse: transit.house,
    targetHouse,
    orb: aspect.orb,
  };
}

function timingLabel(days: number) {
  return `${days} ${days === 1 ? "day" : "days"} left`;
}

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

function daysRemaining(
  aspect: DetailAspect,
  transitData: TransitData,
  natal: NatalChart,
) {
  const positionCache = new Map<number, NatalChart>();
  const step = ["sun", "mercury", "venus", "mars"].includes(aspect.transitPlanet) ? 1 : 3;
  const maxDays = 1460;

  const chartAt = (days: number) => {
    const cached = positionCache.get(days);
    if (cached) return cached;
    const chart = computeChart({
      date: addDays(transitData.date, days),
      time: "12:00",
      place: transitData.location.label,
      lat: transitData.location.lat,
      lon: transitData.location.lon,
      tz: transitData.location.tz,
      tzName: transitData.location.tzName,
      zodiac: transitData.zodiac,
    });
    positionCache.set(days, chart);
    return chart;
  };

  const activeAt = (days: number) => {
    const chart = chartAt(days);
    const transitLongitude = chart.positions[aspect.transitPlanet].longitude;
    const natalLongitude = "natalPlanet" in aspect
      ? natal.positions[aspect.natalPlanet].longitude
      : "natalPoint" in aspect
        ? natal.additionalPoints[aspect.natalPoint].longitude
        : natal.angles[aspect.natalAngle].longitude;
    let separation = Math.abs(transitLongitude - natalLongitude);
    if (separation > 180) separation = 360 - separation;
    return Math.abs(separation - ASPECT_ANGLES[aspect.type]) <= 3;
  };

  for (let probe = step; probe <= maxDays; probe += step) {
    if (!activeAt(probe)) {
      for (let day = Math.max(1, probe - step + 1); day <= probe; day += 1) {
        if (!activeAt(day)) return day;
      }
    }
  }

  return maxDays;
}

function addDays(date: string, amount: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, "0"),
    String(next.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function degreeLabel(degree: number, minute: number) {
  return `${degree}°${String(minute).padStart(2, "0")}′`;
}

function decanLabel(degree: number, sign: string) {
  const decan = Math.min(3, Math.floor(degree / 10) + 1);
  return `${decan}${decan === 1 ? "st" : decan === 2 ? "nd" : "rd"} decan of ${sign}`;
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