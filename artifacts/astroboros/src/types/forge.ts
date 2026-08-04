export interface CelestialFieldEntry {
  planetaryAspect: string;
  transitPlacement?: string;
  natalPlacement: string;
  houseActivation: string;
  coreFunctionActivated: string;
}

export interface ForgeReport {
  date: string;
  zodiac?: "tropical" | "sidereal";
  referenceTime?: string;
  primaryTransit: {
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    house: number;
  };
  activeAspects: Array<{
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    house: number;
  }>;
  celestialField: CelestialFieldEntry[];
  dominantArena?: {
    house: number;
    label: string;
    description: string;
    activationCount: number;
  };
  todaysTheme: string;
  celestialState: string;
  blueprintActivation?: string;
  whatIsBeingRefined: string;
  /** @deprecated use whatIsBeingRefined */
  alchemicalProcess?: string;
  forgePrinciple: string;
  journalPrompt: string;
  dailyApplication: string;
  closingReflection: string;
}
