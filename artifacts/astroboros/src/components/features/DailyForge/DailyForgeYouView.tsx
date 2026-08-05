import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Heart,
  Leaf,
  Sparkles,
  UserRound,
  UsersRound,
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

type CategoryKey = "self" | "health" | "work" | "love" | "money" | "family";
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

const CATEGORY_META: Array<{
  key: CategoryKey;
  label: string;
  icon: typeof UserRound;
  color: string;
  houses: number[];
  description: string;
}> = [
  { key: "self", label: "Self", icon: UserRound, color: "#E8E4D8", houses: [1, 5, 9], description: "identity, confidence, and personal direction" },
  { key: "health", label: "Health", icon: Leaf, color: "#9FC9A5", houses: [1, 6, 12], description: "body, rhythm, recovery, and sustainable effort" },
  { key: "work", label: "Work", icon: BriefcaseBusiness, color: "#D8B86A", houses: [2, 6, 10, 11], description: "craft, contribution, visibility, and useful alliances" },
  { key: "love", label: "Love", icon: Heart, color: "#D88AA4", houses: [5, 7, 8], description: "desire, partnership, intimacy, and creative exchange" },
  { key: "money", label: "Money", icon: CircleDollarSign, color: "#D8B86A", houses: [2, 8, 10, 11], description: "resources, value, shared power, and long-term security" },
  { key: "family", label: "Family", icon: UsersRound, color: "#8BC6C8", houses: [3, 4, 7], description: "home, roots, communication, and relational care" },
];

interface Props {
  reading: { chart: NatalChart };
  report: ForgeReport;
  transitData: TransitData;
  zodiac: "tropical" | "sidereal";
  locationMode: "birth" | "current";
  transitLocationLabel: string;
  onToggleZodiac: () => void;
}

export default function DailyForgeYouView({
  reading,
  report,
  transitData,
  zodiac,
  locationMode,
  transitLocationLabel,
  onToggleZodiac,
}: Props) {
  const [category, setCategory] = useState<CategoryKey>("self");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const natal = reading.chart;
  const categoryMeta = CATEGORY_META.find((item) => item.key === category) ?? CATEGORY_META[0];

  const shortTerm = useMemo(
    () => buildTransitEntries(transitData, natal, "short", categoryMeta.houses),
    [transitData, natal, categoryMeta.houses],
  );
  const longTerm = useMemo(
    () => buildTransitEntries(transitData, natal, "long", categoryMeta.houses),
    [transitData, natal, categoryMeta.houses],
  );
  const primary = shortTerm[0]?.aspect ?? longTerm[0]?.aspect;
  const categoryReport = useMemo(
    () => tailorReport(report, categoryMeta, primary, natal),
    [report, categoryMeta, primary, natal],
  );

  return (
    <div className="space-y-5">
      <CategoryTabs category={category} onChange={(next) => { setCategory(next); setExpandedId(null); }} />

      <DailySummaryCard
        category={category}
        report={report}
        primary={primary}
        natal={natal}
        zodiac={zodiac}
        locationMode={locationMode}
        transitLocationLabel={transitLocationLabel}
        onToggleZodiac={onToggleZodiac}
        categoryDescription={categoryMeta.description}
      />

      <TransitGroup
        label={`${categoryMeta.label} · short-term transits`}
        entries={shortTerm}
        expandedId={expandedId}
        onExpand={setExpandedId}
        emptyText={`No short-term contacts currently activate ${categoryMeta.description}.`}
      />

      <TransitGroup
        label={`${categoryMeta.label} · long-term transits`}
        entries={longTerm}
        expandedId={expandedId}
        onExpand={setExpandedId}
        emptyText={`No long-term contacts currently activate ${categoryMeta.description}.`}
      />

      <ForgeReportView
        report={categoryReport}
        cached={false}
        zodiac={zodiac}
        onToggleZodiac={onToggleZodiac}
        transitLocationLabel={transitLocationLabel}
        showMoon={false}
        showCelestialField={false}
        lifeArea={categoryMeta.label}
      />

      <p className="px-2 pb-2 text-center font-mono text-[10px] uppercase tracking-widest text-[#3A4460]">
        {categoryMeta.label} view · {zodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"} · {transitLocationLabel}
      </p>
    </div>
  );
}

function CategoryTabs({ category, onChange }: { category: CategoryKey; onChange: (category: CategoryKey) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-0.5 pb-1 scrollbar-none">
      {CATEGORY_META.map(({ key, label, icon: Icon, color }) => {
        const active = key === category;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
              active
                ? "border-[#E8E4D8] bg-[#E8E4D8] text-[#11131D]"
                : "border-[#3C4355] bg-[#10131D] text-[#C4CADC] hover:border-[#8B9EE8]/60"
            }`}
          >
            <Icon className="h-4 w-4" style={{ color: active ? "#11131D" : color }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DailySummaryCard({
  category,
  report,
  primary,
  natal,
  zodiac,
  locationMode,
  transitLocationLabel,
  onToggleZodiac,
  categoryDescription,
}: {
  category: CategoryKey;
  report: ForgeReport;
  primary?: DetailAspect;
  natal: NatalChart;
  zodiac: "tropical" | "sidereal";
  locationMode: "birth" | "current";
  transitLocationLabel: string;
  onToggleZodiac: () => void;
  categoryDescription: string;
}) {
  const meta = CATEGORY_META.find((item) => item.key === category) ?? CATEGORY_META[0];
  const title = summaryTitle(category, primary, natal);
  const body = summaryBody(category, primary, natal, report, categoryDescription);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#535B70] bg-[#101113] px-5 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.16)] sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 bottom-0 h-20 opacity-60"
        style={{ backgroundImage: "radial-gradient(#E8E4D8 0.8px, transparent 0.8px)", backgroundSize: "5px 5px", maskImage: "linear-gradient(to top, black, transparent)" }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#E8E4D8]">Your day · {meta.label}</p>
          <h1 className="mt-7 max-w-[19rem] font-serif text-[29px] font-semibold leading-[1.05] text-[#F0EADB] sm:text-3xl">{title}</h1>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Sparkles className="h-10 w-10 text-[#F0EADB]" />
          <button
            type="button"
            onClick={onToggleZodiac}
            className="rounded-full border border-[#8B9EE8]/35 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-[#8B9EE8]"
          >
            {zodiac === "sidereal" ? "Sidereal" : "Tropical"}
          </button>
        </div>
      </div>
      <p className="relative mt-5 max-w-[38rem] text-[16px] leading-[1.35] text-[#D0D2D8]">{body}</p>
      <p className="relative mt-4 text-[10px] uppercase tracking-widest text-[#6B7285]">
        Transit location · {locationMode === "current" ? "Current" : "Birth"} · {transitLocationLabel}
      </p>
    </section>
  );
}

function TransitGroup({
  label,
  entries,
  expandedId,
  onExpand,
  emptyText,
}: {
  label: string;
  entries: TransitEntry[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  emptyText: string;
}) {
  return (
    <section>
      <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C4CADC]">{label}</p>
      <div className="space-y-3">
        {entries.length > 0 ? entries.map((entry) => (
          <TransitDetailCard
            key={entry.id}
            entry={entry}
            expanded={expandedId === entry.id}
            onClick={() => onExpand(expandedId === entry.id ? null : entry.id)}
          />
        )) : (
          <div className="rounded-2xl border border-[#263152] bg-[#101113] px-5 py-4 text-sm text-[#6B7285]">{emptyText}</div>
        )}
      </div>
    </section>
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
  group: "short" | "long",
  focusHouses: number[],
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
      const relevant = focusHouses.includes(entry.transitHouse)
        || (entry.targetHouse !== undefined && focusHouses.includes(entry.targetHouse));
      const keep = entry.aspect.transitPlanet !== "moon"
        && (group === "long" ? long || angle : !long && !angle);
      if (!keep || !relevant || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .slice(0, group === "short" ? 6 : 8);
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

function summaryTitle(category: CategoryKey, primary: DetailAspect | undefined, natal: NatalChart) {
  const targetHouse = primary && "natalPlanet" in primary ? natal.positions[primary.natalPlanet].house : natal.ascendant ? 1 : 1;
  const area = HOUSE_SHORT[targetHouse].toLowerCase();
  const planet = primary ? PLANET_META[primary.transitPlanet].name : "The sky";
  const aspect = primary && "type" in primary ? ASPECT_LABEL[primary.type].toLowerCase() : "steady";
  const categoryTitles: Record<CategoryKey, string> = {
    self: `${planet} ${aspect} through your ${area} life`,
    health: `A steadier rhythm for body and recovery`,
    work: `A clearer ${area} move through structure`,
    love: `Tender connection with a reality-check edge`,
    money: `Clarity and control around what you value`,
    family: `Emotional charge at home with a stabilizing undercurrent`,
  };
  return categoryTitles[category];
}

function summaryBody(category: CategoryKey, primary: DetailAspect | undefined, natal: NatalChart, report: ForgeReport, categoryDescription: string) {
  const theme = report.todaysTheme || report.forge || "The sky is asking for a deliberate response.";
  if (primary && "natalPlanet" in primary) {
    const target = natal.positions[primary.natalPlanet];
    return `Your inner and outer timing meet through ${PLANET_META[primary.transitPlanet].name} ${ASPECT_LABEL[primary.type].toLowerCase()} your natal ${PLANET_META[primary.natalPlanet].name} in the ${ordinal(target.house)} house. ${theme} Read the day through ${categoryDescription}, then make one specific adjustment.`;
  }
  return `${theme} The most useful ${category} move today is to notice the signal, name the arena it belongs to, and make one deliberate adjustment before adding more effort.`;
}

function tailorReport(
  report: ForgeReport,
  category: (typeof CATEGORY_META)[number],
  primary: DetailAspect | undefined,
  natal: NatalChart,
): ForgeReport {
  const house = primary && "natalPlanet" in primary ? natal.positions[primary.natalPlanet].house : category.houses[0];
  const area = category.description;
  const planet = primary ? PLANET_META[primary.transitPlanet].name : "The current sky";
  return {
    ...report,
    dominantArena: {
      house,
      label: category.label,
      description: `This reading is filtered through ${area}. ${planet} gives the focus a specific timing signal rather than a general forecast.`,
    },
    todaysTheme: `${category.label}: ${report.todaysTheme || `work with ${area}`}`,
    forge: `For ${category.label.toLowerCase()}, ${report.forge || report.celestialState || `stay attentive to ${area}`}`,
    whatIsBeingRefined: report.whatIsBeingRefined || report.alchemicalProcess || `Your relationship with ${area}.`,
    forgePrinciple: `${category.label}: ${report.forgePrinciple}`,
    journalPrompt: `${report.journalPrompt} How does this change when you look specifically at ${area}?`,
    dailyApplication: `${report.dailyApplication}\n\nPRACTICE: Apply this to ${area} before extending the lesson to anything else.`,
    closingReflection: `${report.closingReflection} Return to ${area} as the place where the reading becomes real.`,
  };
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