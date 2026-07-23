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
// laboratory comparison. Only the seven core functions are compared.
const CORE: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
];

export interface CrossAspect {
  a: PlanetKey; // from chart A
  b: PlanetKey; // from chart B
  type: AspectType;
  orb: number;
}

export function crossAspects(
  posA: Record<PlanetKey, PlanetPosition>,
  posB: Record<PlanetKey, PlanetPosition>
): CrossAspect[] {
  const out: CrossAspect[] = [];
  for (const ka of CORE) {
    for (const kb of CORE) {
      const diff = separation(posA[ka].longitude, posB[kb].longitude);
      for (const def of DEFS) {
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

export const HARMONIOUS: AspectType[] = ["conjunction", "sextile", "trine"];
export const CHALLENGING: AspectType[] = ["square", "opposition"];

// Plain, exact aspect words — never vague ("fused", etc.).
export const ASPECT_WORD: Record<AspectType, string> = {
  conjunction: "conjunct",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposite",
};

export const ASPECT_VERB_LONG: Record<AspectType, string> = {
  conjunction: "sit conjunct",
  sextile: "hold a supportive sextile to",
  square: "lock into a square with",
  trine: "share a flowing trine with",
  opposition: "face off in opposition to",
};
