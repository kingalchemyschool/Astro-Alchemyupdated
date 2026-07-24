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
  positions: Record<PlanetKey, PlanetPosition>;
  aspects: TransitAspect[];
}

const ALL_KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

// Transit planet priority: Moon first (daily driver), then personal, social, outer
const PLANET_PRIORITY: Record<PlanetKey, number> = {
  moon: 10,
  sun: 8,
  mercury: 7,
  venus: 7,
  mars: 7,
  jupiter: 5,
  saturn: 5,
  uranus: 3,
  neptune: 3,
  pluto: 3,
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
  { type: "conjunction", angle: 0, orb: 8 },
  { type: "sextile", angle: 60, orb: 5 },
  { type: "square", angle: 90, orb: 7 },
  { type: "trine", angle: 120, orb: 7 },
  { type: "opposition", angle: 180, orb: 8 },
];

function separation(a: number, b: number): number {
  let diff = Math.abs(a - b);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Compute today's transit chart against the user's natal chart.
 *  Uses the user's birth location so house assignments are meaningful.
 *  Pass zodiacOverride to compute transits in a different zodiac than the natal chart. */
export function computeTransits(
  natal: NatalChart,
  zodiacOverride?: "tropical" | "sidereal",
): TransitData {
  const today = todayDateString();
  const transitInput: BirthInput = {
    date: today,
    time: "12:00",
    place: natal.input.place,
    lat: natal.input.lat,
    lon: natal.input.lon,
    tz: natal.input.tz,
    tzName: natal.input.tzName,
    zodiac: zodiacOverride ?? natal.zodiac,
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

  return {
    date: today,
    positions: transitChart.positions,
    aspects: aspects.slice(0, 24), // top 24 for API payload
  };
}

/** Return the sign name for a given sign index */
export function signName(index: number): string {
  return SIGNS[index] ?? "Unknown";
}

/** House ordinal label */
export function houseLabel(n: number): string {
  const suffixes = ["", "1st", "2nd", "3rd", "4th", "5th", "6th",
    "7th", "8th", "9th", "10th", "11th", "12th"];
  return suffixes[n] ?? `${n}th`;
}
