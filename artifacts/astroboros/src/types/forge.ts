export interface CelestialFieldEntry {
  planetaryAspect: string;
  natalPlacement: string;
  houseActivation: string;
  coreFunctionActivated: string;
}

export interface ForgeReport {
  date: string;
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
  todaysTheme: string;
  celestialState: string;
  blueprintActivation: string;
  whatIsBeingRefined: string;
  /** @deprecated use whatIsBeingRefined */
  alchemicalProcess?: string;
  forgePrinciple: string;
  journalPrompt: string;
  dailyApplication: string;
  closingReflection: string;
}
