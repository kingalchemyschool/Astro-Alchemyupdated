import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Globe2, Moon, Orbit, Sparkles, UserRound } from "lucide-react";
import { Link } from "wouter";
import ChartWheel from "@/components/features/ChartWheel";
import DailyForgeYouView from "@/components/features/DailyForge/DailyForgeYouView";
import PlanetTransitCards from "@/components/features/DailyForge/PlanetTransitCards";
import type { Reading, AdditionalPointKey, PlanetKey } from "@/types/astro";
import type { ForgeReport as ForgeReportType } from "@/types/forge";
import {
  computeTransits,
  type TransitData,
  type TransitLocation,
} from "@/lib/transits";
import {
  ADDITIONAL_KEYS,
  computeWorldSky,
  DAILY_KEYS,
  formatSkyDate,
  shiftDate,
  type SkyEvent,
  type WorldSky,
} from "@/lib/dailySky";
import { PLANET_META, SIGNS } from "@/constants/astro";

type View = "you" | "world" | "natal";

interface DailyForgeSurfaceProps {
  reading: Reading;
  report: ForgeReportType;
  cached: boolean;
  zodiac: "tropical" | "sidereal";
  today: string;
  locationMode: "birth" | "current";
  currentLocation: TransitLocation | null;
  onToggleZodiac: () => void;
  transitLocationLabel: string;
}

const VIEW_OPTIONS: Array<{ key: View; label: string; icon: typeof UserRound }> = [
  { key: "you", label: "You", icon: UserRound },
  { key: "world", label: "World", icon: Globe2 },
  { key: "natal", label: "Natal", icon: Orbit },
];

export default function DailyForgeSurface({
  reading,
  report,
  cached,
  zodiac,
  today,
  locationMode,
  currentLocation,
  onToggleZodiac,
  transitLocationLabel,
}: DailyForgeSurfaceProps) {
  const [view, setView] = useState<View>("you");
  const transitData = useMemo(
    () => computeTransits(
      reading.chart,
      zodiac,
      today,
      currentLocation ?? undefined,
    ),
    [reading.chart, zodiac, today, currentLocation],
  );
  const world = useMemo(() => computeWorldSky(today, zodiac), [today, zodiac]);

  return (
    <div className="space-y-5">
      <ForgeTopBar
        name={reading.chart.input.name || "Your sky"}
        date={today}
        view={view}
        onView={setView}
      />

      {view === "you" && (
        <DailyForgeYouView
          reading={reading}
          report={report}
          transitData={transitData}
          zodiac={zodiac}
          locationMode={locationMode}
          transitLocationLabel={transitLocationLabel}
          onToggleZodiac={onToggleZodiac}
        />
      )}

      {view === "world" && (
        <WorldView world={world} zodiac={zodiac} today={today} />
      )}

      {view === "natal" && (
        <NatalView reading={reading} />
      )}
    </div>
  );
}

function ForgeTopBar({
  name,
  date,
  view,
  onView,
}: {
  name: string;
  date: string;
  view: View;
  onView: (view: View) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8B9EE8]">Daily Forge</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#E8E4D8]">{name}</h1>
          <p className="mt-0.5 text-sm text-[#6B7A99]">{formatSkyDate(date)}</p>
        </div>
        <Link
          to="/daily-forge/calendar"
          className="flex items-center gap-2 rounded-xl border border-[#3B4B8C]/45 bg-[#0D1220] px-3 py-2 text-xs font-medium text-[#A8B4D4] transition-colors hover:border-[#8B9EE8]/50 hover:text-[#E8E4D8]"
        >
          <CalendarDays className="h-4 w-4 text-[#8B9EE8]" />
          <span className="hidden sm:inline">Calendar</span>
        </Link>
      </div>
      <div className="grid grid-cols-3 rounded-full border border-[#252d4b] bg-[#0a0d18] p-1">
        {VIEW_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onView(key)}
            className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
              view === key
                ? "bg-[#545468] text-[#f0ead9] shadow-[0_0_18px_rgba(139,158,232,0.12)]"
                : "text-[#6B7A99] hover:text-[#E8E4D8]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonalSkySummary({
  transitData,
  reading,
  zodiac,
  onToggleZodiac,
  locationMode,
}: {
  transitData: TransitData;
  reading: Reading;
  zodiac: "tropical" | "sidereal";
  onToggleZodiac: () => void;
  locationMode: "birth" | "current";
}) {
  const entries = [
    ...transitData.aspects.slice(0, 6).map((aspect) => ({
      id: `${aspect.transitPlanet}-${aspect.natalPlanet}-${aspect.type}`,
      title: `${PLANET_META[aspect.transitPlanet].name} ${aspect.type} your natal ${PLANET_META[aspect.natalPlanet].name}`,
      detail: `${PLANET_META[aspect.transitPlanet].glyph} · ${aspect.orb.toFixed(1)}° orb · ${reading.chart.positions[aspect.natalPlanet].house}th house`,
      kind: "planet" as const,
    })),
    ...transitData.additionalAspects.slice(0, 3).map((aspect) => ({
      id: `${aspect.transitPlanet}-${aspect.natalPoint}-${aspect.type}`,
      title: `${PLANET_META[aspect.transitPlanet].name} ${aspect.type} your ${additionalLabel(aspect.natalPoint)}`,
      detail: `${PLANET_META[aspect.transitPlanet].glyph} · ${aspect.orb.toFixed(1)}° orb`,
      kind: "point" as const,
    })),
    ...transitData.angleAspects.slice(0, 3).map((aspect) => ({
      id: `${aspect.transitPlanet}-${aspect.natalAngle}-${aspect.type}`,
      title: `${PLANET_META[aspect.transitPlanet].name} ${aspect.type} your ${angleLabel(aspect.natalAngle)}`,
      detail: `${PLANET_META[aspect.transitPlanet].glyph} · ${aspect.orb.toFixed(1)}° orb · chart angle`,
      kind: "angle" as const,
    })),
  ].slice(0, 8);

  const moon = transitData.positions.moon;
  return (
    <section className="rounded-2xl border border-[#3B4B8C]/35 bg-[#080B18] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B9EE8]">Your day</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#E8E4D8]">
            {SIGNS[moon.signIndex].name} Moon through your blueprint
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#9AA3B8]">
            The live sky is moving through {SIGNS[moon.signIndex].name} at {moon.degree}° and activating your natal chart from the {locationMode === "current" ? "current" : "birth"} location.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleZodiac}
          className="shrink-0 rounded-full border border-[#8B9EE8]/25 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-[#8B9EE8]"
        >
          {zodiac === "sidereal" ? "Sidereal" : "Tropical"}
        </button>
      </div>
      <div className="mt-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#6B7A99]">Transits affecting you</p>
        <div className="space-y-2">
          {entries.length ? entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#1E2640]/70 bg-[#060810] px-4 py-3">
              <div>
                <p className="font-serif text-base font-semibold text-[#E8E4D8]">{entry.title}</p>
                <p className="mt-1 text-[11px] text-[#6B7A99]">{entry.detail}</p>
              </div>
              <Sparkles className={`h-4 w-4 shrink-0 ${entry.kind === "point" ? "text-[#d6a7e8]" : entry.kind === "angle" ? "text-[#e8e4d8]" : "text-[#d8b86a]"}`} />
            </div>
          )) : (
            <p className="rounded-xl border border-[#1E2640]/70 bg-[#060810] px-4 py-4 text-sm text-[#6B7A99]">
              No tight personal contacts are exact at today’s reference time. The transit chart above still shows the full moving sky.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function WorldView({ world, zodiac, today }: { world: WorldSky; zodiac: "tropical" | "sidereal"; today: string }) {
  const moon = world.chart.positions.moon;
  return (
    <div className="space-y-5">
      <ChartWheel
        chart={world.chart}
        title="World chart · today"
        subtitle="The mundane sky cast for Greenwich at 12:00 UTC"
        compact
      />
      <section className="rounded-2xl border border-[#3B4B8C]/35 bg-[#080B18] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B9EE8]">World transits</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#E8E4D8]">
              {SIGNS[moon.signIndex].name} Moon · {moon.degree}°
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#9AA3B8]">
              The collective atmosphere is read from the sky itself: planetary relationships, sign movement, and the angles that frame the day.
            </p>
          </div>
          <Moon className="mt-1 h-8 w-8 shrink-0 text-[#e8e4d8]" />
        </div>
        <div className="mt-5 space-y-2">
          {world.events.map((event) => <SkyEventCard key={event.id} event={event} />)}
        </div>
      </section>
      <PlanetTransitCards
        chart={world.chart}
        title="Every planet, in the world"
        subtitle="The collective sky translated into the arenas of the Greenwich world chart."
        mode="world"
      />
      <section className="rounded-2xl border border-[#1E2640]/80 bg-[#080B18] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7A99]">Planets in signs</p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-[#E8E4D8]">The sky’s current placements</h3>
          </div>
          <Link to="/daily-forge/calendar" className="text-xs text-[#8B9EE8] hover:text-[#E8E4D8]">View calendar →</Link>
        </div>
        <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
          {DAILY_KEYS.map((key) => {
            const position = world.chart.positions[key];
            return (
              <div key={key} className="flex items-center justify-between border-b border-[#1E2640]/60 py-3">
                <span className="flex items-center gap-2 text-sm text-[#C4CADC]">
                  <span className="glyph text-[#d8b86a]">{PLANET_META[key].glyph}</span>{PLANET_META[key].name}
                </span>
                <span className="font-mono text-[10px] text-[#6B7A99]">{SIGNS[position.signIndex].name} {position.degree}°</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[10px] font-mono uppercase tracking-widest text-[#4A5470]">{zodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"} · {today}</p>
      </section>
    </div>
  );
}

function NatalView({ reading }: { reading: Reading }) {
  return (
    <div className="space-y-5">
      <ChartWheel
        chart={reading.chart}
        title={`${reading.chart.input.name || "Your"} natal chart`}
        subtitle={`${reading.chart.input.place} · ${reading.chart.input.date} · the fixed blueprint beneath the moving sky`}
        compact
      />
      <PlanetTransitCards
        chart={reading.chart}
        title="Your natal planets"
        subtitle="The fixed blueprint: each planet’s sign, house, meaning, and the kind of daily practice it supports."
        mode="natal"
      />
      <section className="rounded-2xl border border-[#1E2640]/80 bg-[#080B18] p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B7A99]">Natal points</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ADDITIONAL_KEYS.map((key) => {
            const point = reading.chart.additionalPoints[key];
            return (
              <div key={key} className="flex items-center justify-between rounded-xl border border-[#1E2640]/60 bg-[#060810] px-4 py-3">
                <span className="text-sm text-[#C4CADC]">{additionalLabel(key)}</span>
                <span className="font-mono text-[10px] text-[#9AA3B8]">{SIGNS[point.signIndex].glyph} {SIGNS[point.signIndex].name} {point.degree}°{String(point.minute).padStart(2, "0")}′</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SkyEventCard({ event }: { event: SkyEvent }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1E2640]/70 bg-[#060810] px-4 py-3">
      <div>
        <p className="font-serif text-base font-semibold text-[#E8E4D8]">{eventLabel(event)}</p>
        <p className="mt-1 text-[11px] text-[#6B7A99]">{event.detail}</p>
      </div>
      <span className="font-mono text-lg text-[#d8b86a]">{event.glyph || "✦"}</span>
    </div>
  );
}

function additionalLabel(key: AdditionalPointKey) {
  return {
    chiron: "Chiron",
    lilith: "Black Moon Lilith",
    northNode: "North Node",
    southNode: "South Node",
  }[key];
}

function angleLabel(key: "ascendant" | "midheaven" | "descendant" | "imumCoeli") {
  return {
    ascendant: "Ascendant",
    midheaven: "Midheaven",
    descendant: "Descendant",
    imumCoeli: "Imum Coeli",
  }[key];
}

function eventLabel(event: SkyEvent) {
  return event.title;
}

export function DailyForgeCalendar({ zodiac, name }: { zodiac: "tropical" | "sidereal"; name: string }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [monthDate, setMonthDate] = useState(() => new Date(`${today}T12:00:00`));
  const [selectedDate, setSelectedDate] = useState(today);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
    return { date, sky: computeWorldSky(date, zodiac) };
  });
  const selected = monthDays.find((day) => day.date === selectedDate)?.sky ?? computeWorldSky(selectedDate, zodiac);

  function moveMonth(delta: number) {
    setMonthDate((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1, 12));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8B9EE8]">Daily Forge calendar</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#E8E4D8]">{name}</h1>
          <p className="mt-0.5 text-sm text-[#6B7A99]">The world sky, day by day</p>
        </div>
        <Link to="/daily-forge" className="rounded-xl border border-[#3B4B8C]/45 bg-[#0D1220] px-3 py-2 text-xs text-[#A8B4D4] hover:text-[#E8E4D8]">Back to Forge</Link>
      </div>
      <section className="rounded-2xl border border-[#1E2640]/80 bg-[#060810] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => moveMonth(-1)} className="rounded-full border border-[#1E2640] p-2 text-[#A8B4D4] hover:border-[#8B9EE8]/50"><ChevronLeft className="h-4 w-4" /></button>
          <h2 className="font-serif text-2xl font-semibold text-[#E8E4D8]">{monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
          <button type="button" onClick={() => moveMonth(1)} className="rounded-full border border-[#1E2640] p-2 text-[#A8B4D4] hover:border-[#8B9EE8]/50"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] uppercase tracking-widest text-[#6B7A99]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="pb-2">{day}</div>)}
          {Array.from({ length: firstDay }, (_, index) => <div key={`blank-${index}`} className="min-h-[82px]" />)}
          {monthDays.map(({ date, sky }) => {
            const active = selectedDate === date;
            const isToday = date === today;
            return (
              <button key={date} type="button" onClick={() => setSelectedDate(date)} className={`min-h-[82px] rounded-lg border p-1.5 text-left transition-colors ${active ? "border-[#d8b86a]/70 bg-[#d8b86a]/10" : "border-[#1E2640]/60 bg-[#080B18] hover:border-[#3B4B8C]/60"}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-sm ${isToday ? "bg-[#d95e68] text-white" : active ? "text-[#f0ead9]" : "text-[#A8B4D4]"}`}>{Number(date.slice(-2))}</span>
                <div className="mt-1 space-y-0.5">
                  {sky.events.slice(0, 2).map((event) => <p key={event.id} className="truncate text-[8px] leading-tight text-[#9aa3b8]">{event.title}</p>)}
                  {sky.events.length > 2 && <p className="text-[8px] text-[#d8b86a]">+{sky.events.length - 2} sky events</p>}
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <section className="space-y-5">
        <ChartWheel chart={selected.chart} title={`${formatSkyDate(selectedDate, { month: "long", day: "numeric" })} · world chart`} subtitle="Select another day above to move the sky field" compact />
        <PlanetTransitCards
          chart={selected.chart}
          title={`Planet transits · ${formatSkyDate(selectedDate, { month: "long", day: "numeric" })}`}
          subtitle="Select a day above to see every planetary placement, house, meaning, and application."
          mode="world"
        />
        <div className="rounded-2xl border border-[#3B4B8C]/35 bg-[#080B18] p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B9EE8]">Sky events</p>
          <div className="mt-3 space-y-2">{selected.events.map((event) => <SkyEventCard key={event.id} event={event} />)}</div>
        </div>
      </section>
    </div>
  );
}