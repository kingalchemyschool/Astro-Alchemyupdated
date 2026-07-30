import type {
  ArchetypeFunction,
  FunctionKey,
  HeroJourney,
  NatalChart,
  PlanetKey,
} from "@/types/astro";
import { SIGNS } from "@/constants/astro";

type Element = "fire" | "earth" | "air" | "water";

const FUNCTION_ORDER: FunctionKey[] = [
  "message",
  "execution",
  "discipline",
  "mastery",
  "cultivation",
  "integration",
];

const ELEMENT_VOICE: Record<Element, {
  strength: string;
  edge: string;
}> = {
  fire: {
    strength: "direct encounter, instinct, and the courage to begin",
    edge: "learning to give momentum a direction it can sustain",
  },
  earth: {
    strength: "contact with what is tangible, reliable, and worth building",
    edge: "remaining responsive when a trusted form no longer serves",
  },
  air: {
    strength: "connection, pattern, and the movement of ideas between people",
    edge: "bringing insight down into a choice that can be lived",
  },
  water: {
    strength: "sensitivity to atmosphere, meaning, and what is felt beneath events",
    edge: "giving what is sensed a clear enough form to be shared",
  },
};

const STAGE_PLANETS: Record<FunctionKey, [PlanetKey, PlanetKey]> = {
  message: ["moon", "mercury"],
  execution: ["mercury", "mars"],
  discipline: ["mars", "saturn"],
  mastery: ["saturn", "jupiter"],
  cultivation: ["jupiter", "venus"],
  integration: ["venus", "moon"],
};

function functionMap(functions: ArchetypeFunction[]): Record<FunctionKey, ArchetypeFunction> {
  return Object.fromEntries(
    FUNCTION_ORDER.map((key) => {
      const fn = functions.find((candidate) => candidate.key === key);
      if (!fn) throw new Error(`Missing Blueprint Journey function: ${key}`);
      return [key, fn];
    })
  ) as Record<FunctionKey, ArchetypeFunction>;
}

function elementsFor(chart: NatalChart, key: FunctionKey): [Element, Element] {
  const [a, b] = STAGE_PLANETS[key];
  return [
    SIGNS[chart.positions[a].signIndex].element as Element,
    SIGNS[chart.positions[b].signIndex].element as Element,
  ];
}

function pairedVoice(chart: NatalChart, key: FunctionKey): string {
  const [a, b] = elementsFor(chart, key);
  const first = ELEMENT_VOICE[a];
  const second = ELEMENT_VOICE[b];
  if (a === b) {
    return `Both sides draw on ${first.strength}, so the pattern can become unusually coherent and self-reinforcing. Its growth edge is ${first.edge}.`;
  }
  return `One side draws on ${first.strength}; the other brings ${second.strength}. Their meeting asks for translation between those different ways of knowing, especially around ${second.edge}.`;
}

function stageNarrative(
  chart: NatalChart,
  key: FunctionKey,
  name: string
): string {
  const voice = pairedVoice(chart, key);
  switch (key) {
    case "message":
      // BEGINNING — The First Gift (Moon + Mercury)
      // Natural way of perceiving reality; first intelligence developed;
      // what they notice that others overlook; initial gift and early challenge.
      return `The journey begins with a way of receiving the world before it has been named. The first intelligence to develop is not yet a system or a skill — it is a particular kind of attentiveness: to mood, to undertone, to the small signals that most people move past without registering. What arrives first is felt rather than explained, and the early gift is the capacity to hold that incoming experience long enough to find words for it. ${voice} The initial challenge belongs to this gift directly: the temptation is to translate too quickly, to smooth the felt impression into something acceptable before it has given up what it actually knows. Over time, learning to sit with what has been received — and to trust it as the starting point for meaning — becomes the foundation everything else is built on.`;
    case "execution":
      // FIRST TRANSFORMATION — Bringing the Inner World Into Action (Mercury + Mars)
      // Desire to create movement; tension between knowing and doing;
      // turning insight into action; directing energy toward meaningful outcomes.
      return `Eventually, understanding alone no longer feels like enough. The internal map becomes too detailed for the territory it describes, and something asks to be moved from knowing into doing. This is where the first real tension appears: the gap between a clear interpretation and the risk of acting on it. ${voice} What gets learned here is not simply how to act, but how to choose the action that gives an intention somewhere real to go. Energy that once circulated as observation begins to find direction. The turning point arrives when insight is no longer held back as preparation — and instead becomes the organizing force behind a first move.`;
    case "discipline":
      // SECOND TRANSFORMATION — Refinement and Mastery (Mars + Saturn)
      // Challenges of consistency; development of discipline;
      // what deserves energy vs what must be released; effort becoming skill becoming mastery.
      return `With momentum underway, the question shifts from how to begin to what to sustain. The challenge of consistency arrives not as a single obstacle but as a recurring one — a series of moments where the original energy asks to be renewed rather than assumed. ${voice} The developmental work of this stage is learning to distinguish between the possibilities that deserve continued investment and those that should be released without guilt. Through repetition, structure, and the willingness to return to the same difficult thing until it gives way, effort gradually acquires a shape. What once required full force eventually becomes reliable skill.`;
    case "mastery":
      // THIRD TRANSFORMATION — Wisdom Through Experience (Saturn + Jupiter)
      // Lessons through difficulty; knowledge becoming understanding;
      // personal experience becoming useful to others; the development of authority.
      return `Over time, difficulty stops arriving as an interruption and begins to arrive as information. The experiences that once seemed like setbacks gradually reveal their structure — what they required, what they taught, and what they produced that would not have been produced any other way. ${voice} Authority develops through this accumulation, not by claiming certainty but by having genuine knowledge of what experience has actually earned. Eventually, what was learned through difficulty becomes something that can be offered: understanding refined enough that it can help another person see further than they could alone. Personal experience becomes something that belongs to more than one person.`;
    case "cultivation":
      // FOURTH TRANSFORMATION — Creating Something Beyond Yourself (Jupiter + Venus)
      // Personal growth becoming creation; ideas becoming systems, frameworks, offerings;
      // beginning to shape environments; value cultivated and shared.
      return `From there, the work begins to extend beyond the boundaries of the self. Ideas that were once held privately begin to take on public form — as systems, offerings, environments, or frameworks that make a difficult thing more possible for others. ${voice} Expansion at this stage requires a new kind of discernment: not everything that grows is worth tending, and not every opportunity for more is an opportunity for better. Gradually, the capacity to cultivate becomes distinct from the capacity to accumulate. What gets shaped and shared is no longer just personal growth — it begins to hold value for a wider field.`;
    case "integration":
      // FINAL TRANSFORMATION — Becoming Integrated (Venus + Moon)
      // How the original gift has transformed; embodying values;
      // different capacities working together; becoming a living expression of the blueprint.
      return `Eventually, the journey turns inward — not back to where it began, but toward something it could not have reached at the beginning. The original gift has passed through action, discipline, experience, and contribution, and it has changed in the process. ${voice} What is cared for, what is practiced, and what is held as genuinely valuable begin to align. The different capacities — perception, action, discipline, understanding, cultivation — stop arriving in sequence and begin operating as one way of being present. The blueprint becomes lived rather than described. ${name} moves through the world as someone who has made something out of what they first only noticed.`;
    default:
      return "";
  }
}

export function generateHeroJourney(
  chart: NatalChart,
  functions: ArchetypeFunction[]
): HeroJourney {
  const name = chart.input.name?.trim() || "This person";
  const byKey = functionMap(functions);

  const narrative = FUNCTION_ORDER.map((key) => stageNarrative(chart, key, name));

  const reveal = [
    "Looking back, the path reveals the identities that were forming beneath each stage of the journey.",
    `The first gift became ${byKey.message.archetypeName}.`,
    `The ability to act became ${byKey.execution.archetypeName}.`,
    `The commitment to mastery became ${byKey.discipline.archetypeName}.`,
    `The wisdom earned through experience became ${byKey.mastery.archetypeName}.`,
    `The ability to create lasting value became ${byKey.cultivation.archetypeName}.`,
    `And when all of these capacities became integrated, ${byKey.integration.archetypeName} emerged.`,
  ].join(" ");

  return {
    title: `The Alchemist's Journey of ${name}`,
    paragraphs: [...narrative, reveal],
  };
}