import { computeChart } from "@/lib/ephemeris";
import { SIGNS, PLANET_META } from "@/constants/astro";
import type {
  AspectType,
  AdditionalPointKey,
  BirthInput,
  NatalChart,
  PlanetKey,
} from "@/types/astro";

export const WORLD_LOCATION: BirthInput = {
  name: "World",
  date: "2000-01-01",
  time: "12:00",
  place: "Greenwich, London · UTC",
  lat: 0,
  lon: 0,
  tz: 0,
  tzName: "UTC",
  zodiac: "tropical",
};

export const DAILY_KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

export const ADDITIONAL_KEYS: AdditionalPointKey[] = [
  "chiron", "lilith", "northNode", "southNode",
];

const ASPECT_GLYPH: Record<AspectType, string> = {
  conjunction: "☌",
  sextile: "✶",
  square: "□",
  trine: "△",
  opposition: "☍",
};

export interface SkyEvent {
  id: string;
  title: string;
  detail: string;
  type: "aspect" | "ingress" | "moon";
  glyph?: string;
  orb?: number;
}

export interface WorldSky {
  date: string;
  chart: NatalChart;
  events: SkyEvent[];
  placements: string[];
}

export function computeWorldChart(
  date: string,
  zodiac: "tropical" | "sidereal",
): NatalChart {
  return computeChart({ ...WORLD_LOCATION, date, zodiac });
}

export function formatSkyDate(date: string, options: Intl.DateTimeFormatOptions = {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
}) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", options);
}

export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function placement(key: PlanetKey, chart: NatalChart) {
  const p = chart.positions[key];
  return `${SIGNS[p.signIndex].name} ${p.degree}°${String(p.minute).padStart(2, "0")}′`;
}

function worldEvents(chart: NatalChart): SkyEvent[] {
  const aspects = chart.aspects
    .map((aspect) => {
      const a = PLANET_META[aspect.a];
      const b = PLANET_META[aspect.b];
      return {
        id: `${aspect.a}-${aspect.b}-${aspect.type}`,
        title: `${a.name} ${aspect.type} ${b.name}`,
        detail: `${a.glyph} ${ASPECT_GLYPH[aspect.type]} ${b.glyph} · ${aspect.orb.toFixed(1)}° orb`,
        type: aspect.a === "moon" || aspect.b === "moon" ? "moon" as const : "aspect" as const,
        glyph: `${a.glyph} ${ASPECT_GLYPH[aspect.type]} ${b.glyph}`,
        orb: aspect.orb,
      };
    })
    .sort((a, b) => (a.orb ?? 99) - (b.orb ?? 99));

  const moon = chart.positions.moon;
  const moonEvent: SkyEvent = {
    id: "moon-placement",
    title: `Moon in ${SIGNS[moon.signIndex].name}`,
    detail: `${SIGNS[moon.signIndex].glyph} ${moon.degree}°${String(moon.minute).padStart(2, "0")}′ · ${moon.house}th sky house`,
    type: "moon",
    glyph: "☽",
  };

  return [moonEvent, ...aspects.slice(0, 8)];
}

export function computeWorldSky(
  date: string,
  zodiac: "tropical" | "sidereal",
): WorldSky {
  const chart = computeWorldChart(date, zodiac);
  return {
    date,
    chart,
    events: worldEvents(chart),
    placements: DAILY_KEYS.map((key) => `${PLANET_META[key].name} in ${SIGNS[chart.positions[key].signIndex].name}`),
  };
}

export function computeWeekSky(
  startDate: string,
  zodiac: "tropical" | "sidereal",
): WorldSky[] {
  return Array.from({ length: 7 }, (_, index) => computeWorldSky(shiftDate(startDate, index), zodiac));
}

export function eventLabel(event: SkyEvent) {
  return event.title.replace(/\s+/g, " ").trim();
}