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
      return `${name}'s journey begins with an attention that is already listening. Before there is a polished explanation, experience arrives as atmosphere, sensation, memory, and a sense of what matters in the room. ${voice} The first gift is the ability to notice the thread beneath the event and gradually turn inner experience into meaning that can be shared. The early challenge is trusting what has been received without rushing to explain it away.`;
    case "execution":
      return `Eventually, what has been understood asks to move. The wish to create change brings a tension between seeing the pattern and entering it, between a good interpretation and the risk of making a first move. ${voice} ${name} learns through this passage that insight is not complete until it can organize energy around a meaningful outcome. Action becomes less about proving force and more about giving a clear intention somewhere to go.`;
    case "discipline":
      return `With movement underway, the next work is refinement. Starting is no longer the only question; consistency becomes the measure. ${voice} The developing lesson is that not every possibility deserves continued effort. Through repetition, limits, and the willingness to release what does not strengthen the work, effort becomes skill. What once required willpower begins to acquire a dependable shape.`;
    case "mastery":
      return `Over time, difficulty stops being only an obstacle and becomes an education. Experiences that once felt separate begin to form a body of understanding: what holds, what fails, what can be taught, and what must be approached differently next time. ${voice} ${name}'s authority grows not from appearing certain, but from knowing what experience has actually earned. Knowledge becomes useful when it can help another person see more clearly.`;
    case "cultivation":
      return `From there, personal growth begins to reach beyond the self. Ideas can become systems, practices, offerings, or environments that make a difficult thing more possible for others. ${voice} Expansion now needs discernment: what should be developed, what should be protected, and what is merely more. ${name} gradually learns to cultivate value rather than collect possibility, shaping abundance into something refined enough to nourish a wider field.`;
    case "integration":
      return `Finally, the journey turns inward again, but not back to its starting point. The original gift has passed through action, discipline, experience, and contribution, and now it can be recognized in the values that have become lived rather than announced. ${voice} What is cared for, remembered, and practiced begins to agree. ${name} becomes a living expression of the blueprint when these capacities no longer compete for control; they work together as one way of being present.`;
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
    title: `The Blueprint Journey of ${name}`,
    paragraphs: [...narrative, reveal],
  };
}