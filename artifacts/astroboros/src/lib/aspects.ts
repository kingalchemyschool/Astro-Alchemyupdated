import type { Aspect, AspectType, PlanetKey, PlanetPosition } from "@/types/astro";

const DEFS: { type: AspectType; angle: number; orb: number }[] = [
  { type: "conjunction", angle: 0, orb: 8 },
  { type: "sextile", angle: 60, orb: 5 },
  { type: "square", angle: 90, orb: 7 },
  { type: "trine", angle: 120, orb: 7 },
  { type: "opposition", angle: 180, orb: 8 },
];

const KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

function separation(a: number, b: number): number {
  let diff = Math.abs(a - b);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

export function computeAspects(
  positions: Record<PlanetKey, PlanetPosition>
): Aspect[] {
  const result: Aspect[] = [];
  for (let i = 0; i < KEYS.length; i++) {
    for (let j = i + 1; j < KEYS.length; j++) {
      const a = positions[KEYS[i]];
      const b = positions[KEYS[j]];
      const diff = separation(a.longitude, b.longitude);
      for (const def of DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          result.push({
            a: a.key,
            b: b.key,
            type: def.type,
            orb: Math.round(orb * 10) / 10,
          });
          break;
        }
      }
    }
  }
  return result;
}

export function aspectsFor(key: PlanetKey, aspects: Aspect[]): Aspect[] {
  return aspects
    .filter((x) => x.a === key || x.b === key)
    .sort((x, y) => x.orb - y.orb);
}

export function aspectBetween(
  a: PlanetKey,
  b: PlanetKey,
  aspects: Aspect[]
): Aspect | undefined {
  return aspects.find(
    (x) => (x.a === a && x.b === b) || (x.a === b && x.b === a)
  );
}

// Cross-chart (synastry) aspects between two sets of positions, for the
// laboratory comparison. The functional Lab layer uses seven planets, while
// the full matrix includes all planets and both Ascendants.
const CORE: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
];

const ALL_SYNASTRY_POINTS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

export type SynastryPointKey = PlanetKey | "ascendant";
export type SynastryAspectType = AspectType | "quincunx";
type LongitudePoint = { longitude: number };

export interface CrossAspect {
  a: SynastryPointKey; // from chart A
  b: SynastryPointKey; // from chart B
  type: SynastryAspectType;
  orb: number;
}

export function crossAspects(
  posA: Record<PlanetKey, PlanetPosition>,
  posB: Record<PlanetKey, PlanetPosition>,
  ascA?: LongitudePoint,
  ascB?: LongitudePoint,
): CrossAspect[] {
  const out: CrossAspect[] = [];
  const pointsA: Partial<Record<SynastryPointKey, LongitudePoint>> = { ...posA };
  const pointsB: Partial<Record<SynastryPointKey, LongitudePoint>> = { ...posB };
  const includeFullMatrix = Boolean(ascA && ascB);
  if (ascA && ascB) {
    pointsA.ascendant = ascA;
    pointsB.ascendant = ascB;
  }
  const pointKeys: SynastryPointKey[] = includeFullMatrix
    ? [...ALL_SYNASTRY_POINTS, "ascendant"]
    : CORE;
  const definitions: Array<{ type: SynastryAspectType; angle: number; orb: number }> =
    includeFullMatrix
      ? [...DEFS, { type: "quincunx", angle: 150, orb: 3 }]
      : DEFS;

  for (const ka of pointKeys) {
    for (const kb of pointKeys) {
      const pointA = pointsA[ka];
      const pointB = pointsB[kb];
      if (!pointA || !pointB) continue;
      const diff = separation(pointA.longitude, pointB.longitude);
      for (const def of definitions) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          out.push({ a: ka, b: kb, type: def.type, orb: Math.round(orb * 10) / 10 });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

export const HARMONIOUS: Array<AspectType | "quincunx"> = ["conjunction", "sextile", "trine"];
export const CHALLENGING: Array<AspectType | "quincunx"> = ["square", "opposition", "quincunx"];

// Plain, exact aspect words — never vague ("fused", etc.).
export const ASPECT_WORD: Record<AspectType, string> = {
  conjunction: "conjunct",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposite",
};

export const SYNASTRY_ASPECT_WORD: Record<SynastryAspectType, string> = {
  ...ASPECT_WORD,
  quincunx: "quincunx",
};

export const ASPECT_VERB_LONG: Record<AspectType, string> = {
  conjunction: "sit conjunct",
  sextile: "hold a supportive sextile to",
  square: "lock into a square with",
  trine: "share a flowing trine with",
  opposition: "face off in opposition to",
};
