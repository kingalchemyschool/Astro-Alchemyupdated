import { computeChart } from "@/lib/ephemeris";
import { SIGNS } from "@/constants/astro";
import type {
  NatalChart,
  PlanetKey,
  PlanetPosition,
  BirthInput,
  AspectType,
} from "@/types/astro";

export interface TransitAspect {
  transitPlanet: PlanetKey;
  natalPlanet: PlanetKey;
  type: AspectType;
  orb: number;
  score: number; // higher = more significant
}

export interface TransitData {
  date: string;
  zodiac: "tropical" | "sidereal";
  positions: Record<PlanetKey, PlanetPosition>;
  aspects: TransitAspect[];
}

const ALL_KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

// Transit planet priority for a daily report. Faster-moving planets are
// intentionally weighted ahead of slower ones, while the server separately
// preserves room for deep outer-planet contacts.
const PLANET_PRIORITY: Record<PlanetKey, number> = {
  moon:    14,
  sun:     11,
  mercury: 10,
  venus:   9,
  mars:    8,
  jupiter: 6,
  saturn:  5,
  uranus:  4,
  neptune: 3,
  pluto:   2,
};

// Aspect type priority: conjunction highest, sextile lowest
const ASPECT_PRIORITY: Record<AspectType, number> = {
  conjunction: 5,
  opposition: 4,
  square: 3,
  trine: 2,
  sextile: 1,
};

const ASPECT_DEFS: { type: AspectType; angle: number; orb: number }[] = [
  // Match the Astro-Seek reference used by Daily Forge: the report is
  // limited to aspects under 3° orb, rather than broad natal-style orbs.
  { type: "conjunction", angle: 0, orb: 3 },
  { type: "sextile", angle: 60, orb: 3 },
  { type: "square", angle: 90, orb: 3 },
  { type: "trine", angle: 120, orb: 3 },
  { type: "opposition", angle: 180, orb: 3 },
];

function separation(a: number, b: number): number {
  let diff = Math.abs(a - b);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

export function todayDateString(): string {
  // Use the browser's local calendar day. `toISOString()` converts to UTC,
  // which can make the forge show yesterday or tomorrow near midnight for
  // users outside UTC.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Return noon on the selected calendar date in the chart's location.
 *
 * Daily Forge is a day-level report, not a live-clock report. Using the
 * current instant here could cross a date boundary while the report date
 * remains yesterday/tomorrow, and makes the same Daily Forge disagree with
 * a daily transit chart such as Astro-Seek. Noon also avoids most DST
 * transition edge cases while keeping the calculation deterministic.
 */
function dailyTransitTime(): string {
  return "12:00";
}

/** Compute today's transit chart against the user's natal chart.
 *  Uses the user's birth location so house assignments are meaningful.
 *  The zodiac system is explicit so transit positions always match the
 *  currently displayed natal chart. */
export function computeTransits(
  natal: NatalChart,
  zodiac: "tropical" | "sidereal" = natal.zodiac,
  date = todayDateString(),
): TransitData {
  const transitInput: BirthInput = {
    date,
    // Use a stable daily reference time rather than the current clock. The
    // date and time together identify the same daily sky for every refresh.
    time: dailyTransitTime(),
    place: natal.input.place,
    lat: natal.input.lat,
    lon: natal.input.lon,
    tz: natal.input.tz,
    tzName: natal.input.tzName,
    zodiac,
  };

  const transitChart = computeChart(transitInput);

  // Compute transit-to-natal aspects and score each for relevance
  const aspects: TransitAspect[] = [];
  for (const tp of ALL_KEYS) {
    for (const np of ALL_KEYS) {
      const tLon = transitChart.positions[tp].longitude;
      const nLon = natal.positions[np].longitude;
      const diff = separation(tLon, nLon);
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          // Score = planet weight + aspect weight + orb tightness
          const score =
            PLANET_PRIORITY[tp] * 3 +
            ASPECT_PRIORITY[def.type] * 2 +
            (def.orb - orb);
          aspects.push({
            transitPlanet: tp,
            natalPlanet: np,
            type: def.type,
            orb: Math.round(orb * 10) / 10,
            score: Math.round(score * 10) / 10,
          });
          break;
        }
      }
    }
  }

  // Sort by score descending — highest relevance first
  aspects.sort((a, b) => b.score - a.score);

  // Keep several lunar contacts available for the daily layer. The server
  // still reserves room for the deeper outer-planet contacts.
  let moonCount = 0;
  const balanced = aspects.filter(a => {
    if (a.transitPlanet === "moon") {
      if (moonCount >= 3) return false;
      moonCount++;
    }
    return true;
  });

  return {
    date,
    zodiac,
    positions: transitChart.positions,
    aspects: balanced.slice(0, 24),
  };
}

/** Return the sign name for a given sign index */
export function signName(index: number): string {
  return SIGNS[index]?.name ?? "Unknown";
}

/** House ordinal label */
export function houseLabel(n: number): string {
  const suffixes = ["", "1st", "2nd", "3rd", "4th", "5th", "6th",
    "7th", "8th", "9th", "10th", "11th", "12th"];
  return suffixes[n] ?? `${n}th`;
}
