import { BookOpen, Target, Flame, Zap, Globe2, Sparkles, Moon } from "lucide-react";
import type { ForgeReport } from "@/types/forge";

const ASPECT_LABEL: Record<string, string> = {
  conjunction: "Conjunct",
  sextile:     "Sextile",
  square:      "Square",
  trine:       "Trine",
  opposition:  "Opposition",
};

const HOUSE_SHORT: Record<number, string> = {
  1: "Identity", 2: "Value", 3: "Communication", 4: "Foundations",
  5: "Creativity", 6: "Refinement", 7: "Relationships", 8: "Transformation",
  9: "Expansion", 10: "Contribution", 11: "Networks", 12: "Integration",
};

function houseOrd(n: number) {
  const s = ["", "1st", "2nd", "3rd", "4th", "5th", "6th",
    "7th", "8th", "9th", "10th", "11th", "12th"];
  return s[n] ?? `${n}th`;
}

interface Props {
  report: ForgeReport;
  cached?: boolean;
  zodiac?: "tropical" | "sidereal";
  onToggleZodiac?: () => void;
  transitLocationLabel?: string;
  showMoon?: boolean;
  showCelestialField?: boolean;
  lifeArea?: string;
}

export default function ForgeReport({
  report,
  cached,
  zodiac = "tropical",
  onToggleZodiac,
  transitLocationLabel,
  showMoon = true,
  showCelestialField = true,
  lifeArea,
}: Props) {
  const { primaryTransit: pt } = report;

  const dateLabel = new Date(report.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Celestial field: use new structured data if available, fall back to legacy single transit
  const celestialField = report.celestialField?.length
    ? report.celestialField
    : [{
        planetaryAspect: `${pt.transitPlanet} ${ASPECT_LABEL[pt.aspect] ?? pt.aspect} Natal ${pt.natalPlanet}`,
        transitPlacement: "",
        natalPlacement: `${houseOrd(pt.house)} House`,
        houseActivation: HOUSE_SHORT[pt.house] ?? "",
        coreFunctionActivated: `Transit ${pt.aspect} your natal ${pt.natalPlanet} — ${HOUSE_SHORT[pt.house] ?? "Life"} area active.`,
      }];

  // Backward compat: whatIsBeingRefined may be absent on old cached reports
  const whatIsBeingRefined = report.whatIsBeingRefined ?? report.alchemicalProcess ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* ── Header: Today's Forge ── */}
      <div className="rounded-2xl border border-[#3B4B8C]/40 bg-[#080B18] px-7 py-6 shadow-[0_0_40px_rgba(59,75,140,0.1)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B9EE8] mb-1">
              Today's Forge
            </p>
            <h1 className="font-serif text-2xl font-semibold text-[#E8E4D8]">{dateLabel}</h1>
            <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#6B7A99]">
              {zodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"} · {report.referenceTime ?? "Daily reference"}
            </p>
            {transitLocationLabel && (
              <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#4A5470]">
                Transit location · {transitLocationLabel}
              </p>
            )}
            {lifeArea && (
              <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[#d8b86a]">
                Focused life area · {lifeArea}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <button
              onClick={onToggleZodiac}
              title={`Switch to ${zodiac === "sidereal" ? "tropical" : "sidereal"} transits`}
              className={`rounded-full border px-3 py-1 text-[10px] font-mono tracking-widest uppercase transition-colors cursor-pointer ${
                zodiac === "sidereal"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                  : "border-[#8B9EE8]/30 bg-[#3B4B8C]/10 text-[#8B9EE8] hover:bg-[#3B4B8C]/20"
              }`}
            >
              {zodiac === "sidereal" ? "⇄ Sidereal · Lahiri" : "⇄ Tropical"}
            </button>
            {cached && (
              <span className="rounded-full border border-[#3B4B8C]/40 bg-[#3B4B8C]/10 px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-[#6B7A99]">
                Cached
              </span>
            )}
          </div>
        </div>

        {/* Current Moon */}
        {showMoon && report.currentMoon && (
          <div className="mt-5 rounded-xl border border-[#8B9EE8]/20 bg-[#0D1220]/70 px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="h-4 w-4 text-[#8B9EE8]" />
              <p className="font-mono text-[9px] tracking-widest uppercase text-[#6B7A99]">
                Current Moon
              </p>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-[#E8E4D8]">
                ☽ {report.currentMoon.sign} {report.currentMoon.degree}°{String(report.currentMoon.minute).padStart(2, "0")}′
              </h2>
              <span className="font-mono text-[9px] tracking-widest uppercase text-[#8B9EE8] shrink-0">
                {report.currentMoon.phase}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-[#6B7A99]">
              {houseOrd(report.currentMoon.house)} House · {HOUSE_SHORT[report.currentMoon.house] ?? "Life"}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#9AA3B8]">
              {report.currentMoon.description}
            </p>
          </div>
        )}

        {/* Dominant Arena */}
        {report.dominantArena && (
          <div className="mt-5 rounded-xl border border-[#8B9EE8]/20 bg-[#0D1220]/70 px-4 py-4">
            <p className="font-mono text-[9px] tracking-widest uppercase text-[#6B7A99] mb-2">
              Dominant Arena
            </p>
            <h2 className="font-serif text-lg font-semibold text-[#E8E4D8]">
              {houseOrd(report.dominantArena.house)} House · {report.dominantArena.label}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[#9AA3B8]">
              {report.dominantArena.description}
            </p>
          </div>
        )}

        {/* Celestial Field */}
        {showCelestialField && <div className="mt-5">
          <p className="font-mono text-[9px] tracking-widest uppercase text-[#6B7A99] mb-3">
            Celestial Field
          </p>
          <div className="space-y-2">
            {celestialField.map((entry, i) => (
              <div
                key={i}
                className={`rounded-xl border px-4 py-3 ${
                  i === 0
                    ? "border-[#8B9EE8]/25 bg-[#3B4B8C]/10"
                    : "border-[#1E2640]/60 bg-[#060810]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm text-[#E8E4D8]">
                    {entry.planetaryAspect}
                  </div>
                  {i === 0 && (
                    <span className="font-mono text-[9px] tracking-widest uppercase text-[#8B9EE8] shrink-0 mt-0.5">
                      Primary
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[12px] text-[#A8B4D4]">
                  {entry.transitPlacement && <span>{entry.transitPlacement}</span>}
                  {entry.transitPlacement && <span className="text-[#2A3450]">·</span>}
                  <span>{entry.natalPlacement}</span>
                  {entry.houseActivation && (
                    <>
                      <span className="text-[#2A3450]">·</span>
                      <span className="text-[#A8B4D4]">{entry.houseActivation}</span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#7A8499]">
                  {entry.coreFunctionActivated}
                </p>
              </div>
            ))}
          </div>
        </div>}

        {/* Today's Theme */}
        {report.todaysTheme && (
          <div className="mt-5 border-l-2 border-[#8B9EE8]/40 pl-4">
            <p className="font-mono text-[9px] tracking-widest uppercase text-[#6B7A99] mb-1">Today's Theme</p>
            <p className="text-[15px] font-medium leading-relaxed text-[#B8C0DC] italic">
              {report.todaysTheme}
            </p>
          </div>
        )}
      </div>

      {/* ── The Forge ── */}
      <Section
        icon={<Globe2 className="h-4 w-4" />}
        kicker="Today's Energy"
        title="The Forge"
        body={report.forge ?? report.celestialState ?? ""}
        multiParagraph
      />

      {/* ── What Is Being Refined ── */}
      <Section
        icon={<Flame className="h-4 w-4" />}
        kicker="What Is Being Refined"
        title="Alchemical Process"
        body={whatIsBeingRefined}
      />

      {/* ── Forge Principle ── */}
      <div className="rounded-2xl border border-[#8B9EE8]/25 bg-gradient-to-br from-[#0D1220] to-[#080B18] px-7 py-6 shadow-[0_0_30px_rgba(59,75,140,0.15)]">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-4 w-4 text-[#8B9EE8]" />
          <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B9EE8]">
            Forge Principle
          </p>
        </div>
        <blockquote className="font-serif text-xl font-medium leading-relaxed text-[#E8E4D8]">
          "{report.forgePrinciple}"
        </blockquote>
      </div>

      {/* ── Journal Prompt ── */}
      <div className="rounded-2xl border border-[#3B4B8C]/30 bg-[#080B18] px-7 py-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-[#8B9EE8]" />
          <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B9EE8]">
            Journal Prompt
          </p>
        </div>
        <p className="text-[15px] leading-relaxed text-[#C4CADC] italic">
          {report.journalPrompt}
        </p>
      </div>

      {/* ── Daily Application: DO / AVOID / PRACTICE ── */}
      <DailyApplicationSection body={report.dailyApplication} />

      {/* ── Closing Reflection ── */}
      {report.closingReflection && (
        <div className="rounded-2xl border border-[#1E2640]/50 bg-[#060810] px-7 py-6">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="h-4 w-4 text-[#6B7A99]" />
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#6B7A99]">
              Closing Reflection
            </p>
          </div>
          <p className="text-[14px] leading-relaxed text-[#6B7A99]">
            {report.closingReflection}
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-[11px] text-[#3A4460] pb-4">
        Report generated for {report.date} · Refreshes daily at midnight
      </p>
    </div>
  );
}

// ─── Daily Application — DO / AVOID / PRACTICE ──────────────────────────────

const APPLICATION_CONFIG = [
  { key: "DO",       label: "Do",       color: "text-[#8B9EE8]", border: "border-[#8B9EE8]/30", bg: "bg-[#8B9EE8]/8" },
  { key: "AVOID",    label: "Avoid",    color: "text-[#C4726A]", border: "border-[#C4726A]/30", bg: "bg-[#C4726A]/8" },
  { key: "PRACTICE", label: "Practice", color: "text-[#7EB89A]", border: "border-[#7EB89A]/30", bg: "bg-[#7EB89A]/8" },
] as const;

function DailyApplicationSection({ body }: { body: string }) {
  const items = parseApplicationItems(body);

  return (
    <div className="rounded-2xl border border-[#3B4B8C]/50 bg-[#0A0D1A] px-7 py-6">
      <div className="flex items-center gap-2 mb-5">
        <Target className="h-4 w-4 text-[#8B9EE8]" />
        <p className="font-mono text-[10px] tracking-widest uppercase text-[#6B7A99]">
          Daily Application
        </p>
      </div>

      {items.length === 3 ? (
        <div className="space-y-4">
          {items.map(({ label, text }, i) => {
            const cfg = APPLICATION_CONFIG[i];
            return (
              <div key={label} className={`rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-4`}>
                <p className={`font-mono text-[9px] tracking-widest uppercase ${cfg.color} mb-2`}>
                  {cfg.label}
                </p>
                <p className="text-[14px] leading-relaxed text-[#A8B4D4]">{text}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[14px] leading-relaxed text-[#9AA3B8]">{body}</p>
      )}
    </div>
  );
}

function parseApplicationItems(text: string): { label: string; text: string }[] {
  const labels = ["DO", "AVOID", "PRACTICE"];
  const result: { label: string; text: string }[] = [];

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const startIdx = text.indexOf(label + ":");
    if (startIdx === -1) return [];
    const afterColon = startIdx + label.length + 1;
    const nextLabel = labels[i + 1];
    const endIdx = nextLabel ? text.indexOf("\n\n" + nextLabel + ":") : text.length;
    result.push({ label, text: text.slice(afterColon, endIdx === -1 ? text.length : endIdx).trim() });
  }
  return result;
}

// ─── Generic section ─────────────────────────────────────────────────────────

function Section({
  icon, kicker, title, body, multiParagraph,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  multiParagraph?: boolean;
}) {
  const paragraphs = multiParagraph ? body.split('\n\n').filter(Boolean) : [body];

  return (
    <div className="rounded-2xl border border-[#1E2640]/80 bg-[#080B18] px-7 py-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#8B9EE8]">{icon}</span>
        <p className="font-mono text-[10px] tracking-widest uppercase text-[#6B7A99]">{kicker}</p>
      </div>
      <h3 className="font-serif text-base font-semibold text-[#E8E4D8] mb-3">{title}</h3>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className={`text-[15px] leading-relaxed ${i === 0 ? "text-[#9AA3B8]" : "text-[#7A8499]"}`}>{p}</p>
        ))}
      </div>
    </div>
  );
}
