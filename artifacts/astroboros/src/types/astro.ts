export type PlanetKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export type ZodiacSystem = "tropical" | "sidereal";

export interface PlanetPosition {
  key: PlanetKey;
  longitude: number; // 0-360 ecliptic longitude (display zodiac)
  signIndex: number; // 0-11
  degree: number; // 0-29 within sign
  minute: number; // 0-59
  house: number; // 1-12 (Placidus, falls back to whole-sign near poles)
  retrograde: boolean;
}

export interface Aspect {
  a: PlanetKey;
  b: PlanetKey;
  type: AspectType;
  orb: number; // degrees from exact
}

export interface Ascendant {
  longitude: number;
  signIndex: number;
  degree: number;
  minute: number;
}

export interface BirthInput {
  name?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  place: string;
  lat: number;
  lon: number; // east positive
  tz: number; // UTC offset in hours (fallback when tzName is absent)
  tzName?: string; // IANA timezone id — drives DST-accurate offset
  zodiac?: ZodiacSystem; // tropical (default) or sidereal (Lahiri)
}

// A place resolved from live geocoding search (any city or town worldwide).
export interface GeoLocation {
  name: string; // display label, e.g. "Mount Vernon, Ohio, United States"
  lat: number;
  lon: number; // east positive
  tzName: string; // IANA timezone id
}

export interface NatalChart {
  input: BirthInput;
  positions: Record<PlanetKey, PlanetPosition>;
  ascendant: Ascendant;
  aspects: Aspect[];
  cusps: number[]; // 12 house-cusp longitudes; house i begins at cusps[i-1]
  zodiac: ZodiacSystem;
  ayanamsa: number; // degrees subtracted for sidereal (0 for tropical)
}

export type SectionKind = "planet" | "threshold";

export interface ReportSection {
  kind: SectionKind;
  order: number; // internal ordering only — never shown as a "point number"
  title: string;
  subtitle: string;
  glyph: string;
  planetKeys: PlanetKey[];
  paragraphs: string[];
  aspectCards?: NatalAspectCard[];
}

export interface NatalAspectCard {
  title: string;
  subtitle: string;
  name?: string;
  paragraphs: string[];
}

// The six Alchemist Archetype functions — each a fixed planet-pair relationship.
export type FunctionKey =
  | "message"
  | "execution"
  | "discipline"
  | "mastery"
  | "cultivation"
  | "integration";

export interface ArchetypeFunction {
  key: FunctionKey;
  title: string;
  tagline: string; // what its paid reading covers
  pair: [PlanetKey, PlanetKey];
  glyphs: [string, string];
  definition: string; // fixed description of the function
  archetypeName: string; // derived from placements, e.g. "The Interpreter"
  archetypeLine: string; // one-line meaning of that archetype
  resonance: string; // tone label
  overview: string; // short free teaser
  reading: string[]; // deep reading paragraphs (paid)
  score: number; // strength of this relationship in the chart
}

// The single archetype derived for the free reading.
export interface PrimaryArchetype {
  functionKey: FunctionKey;
  name: string;
  line: string;
  paragraphs: string[]; // free reading
}

export interface HeroJourney {
  title: string;
  paragraphs: string[]; // paid, personalized fictional story
}

export interface WealthStrength {
  label: string;
  description: string;
}

export interface WealthRelation {
  title: string;
  subtitle: string;
  planets: string;
  formula: string;
  paragraphs: string[];      // flowing prose: function def → operation → contributions → natural expression
  developmentalEdge?: string;
  masteryConclusion?: string;
}

export interface WealthForce {
  title: string;          // e.g. "The Transformational Initiator"
  planetLine: string;     // e.g. "Mars in Aries • Pluto in Scorpio • ..."
  synthesisIntro: string; // how the planets create a unified system mechanism
  signature: string[];    // detailed per-planet narrative paragraphs
  formula: string;        // e.g. "Force → Translation → Innovation → Consequence"
  strengths: WealthStrength[];
  matureExpression: string; // conclusive paragraph: what the fully integrated system creates
  developmentalEdge: string[];
  reflectionQuestion: string;
}

export interface WealthBlueprint {
  alchemicalSignature: string;  // opening summary paragraph
  impact: WealthForce;
  wealth: WealthForce;
  consciousness: WealthForce;
  formula: { impact: string; wealth: string; consciousness: string };
  coreArchetype: { title: string; paragraphs: string[] };
  relations: {
    strategy: WealthRelation;
    dynamicValueCreation: WealthRelation;
    consciousStewardship: WealthRelation;
  };
  creativeArchitecture: {
    title: string;
    paragraphs: string[];
    cycle: string;
  };
  synthesis: {
    impact: WealthRelation;       // Mars + Pluto
    translation: WealthRelation;  // Mercury + Uranus
    value: WealthRelation;        // Venus + Neptune
  };
  creativeMechanicsArchitecture: {
    title: string;
    paragraphs: string[];
    sequence: string;
  };
}

export interface Reading {
  chart: NatalChart;
  planetSections: ReportSection[]; // paid — functions + thresholds woven in cycle order
  functions: ArchetypeFunction[]; // the six Alchemist Archetypes
  primary: PrimaryArchetype; // the freebie
  heroJourney: HeroJourney; // paid
  wealthBlueprint: WealthBlueprint; // paid — Conscious Wealth Blueprint
}
