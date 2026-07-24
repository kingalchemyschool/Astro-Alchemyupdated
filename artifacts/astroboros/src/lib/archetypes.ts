import type {
  ArchetypeFunction,
  NatalChart,
  PlanetKey,
  PrimaryArchetype,
  Aspect,
} from "@/types/astro";
import { FUNCTIONS, type FunctionMeta, type ArchetypeEntry, signPairKey } from "@/constants/archetypes";
import { SIGNS, ORDINALS, PLANET_META, HOUSE_DOMAIN, HOUSE_THROUGH, HOUSE_WORK } from "@/constants/astro";
import { aspectBetween } from "@/lib/aspects";

type Element = "fire" | "earth" | "air" | "water";

const ELEMENT_GIFT: Record<Element, string> = {
  fire: "igniting momentum others rally behind",
  earth: "turning intention into durable, usable form",
  air: "connecting scattered ideas into clear, shareable systems",
  water: "sensing meaning and value before it becomes visible",
};

const ELEMENT_EDGE: Record<Element, string> = {
  fire: "pacing the fire so initiatives are finished, not merely started",
  earth: "staying flexible when a structure has outlived its usefulness",
  air: "grounding ideas into committed, embodied action",
  water: "giving intuition a defined form others can actually receive",
};

function ord(n: number): string {
  return ORDINALS[n - 1];
}

function field(houseIdx: number): string {
  return HOUSE_DOMAIN[houseIdx].replace("the arena of", "the field of");
}

function aspClause(fn: FunctionMeta, asp: Aspect | undefined): string {
  if (!asp) {
    return "operate without a major aspect, acting as two independent systems you must consciously synchronize";
  }
  
  if (fn.key === "message") {
    const words: Record<Aspect["type"], string> = {
      conjunction: "merge in message — translating experience and expression as one seamless current",
      sextile: "hold a productive sextile, each one opening what the other is reaching for",
      square: "lock into a generative square — friction that sharpens meaning rather than blocking it when engaged directly",
      trine: "flow in natural trine, the kind of alignment that makes articulation feel inevitable",
      opposition: "stand in productive opposition, creating the arc of tension from which message draws its range",
    };
    return `${words[asp.type]} (orb ${asp.orb}°)`;
  }
  
  if (fn.key === "execution") {
    const words: Record<Aspect["type"], string> = {
      conjunction: "merge in execution — thought and force becoming one immediate trigger",
      sextile: "hold a productive sextile, strategy opening doors that force can walk through",
      square: "lock into a generative square — friction that hones action rather than stalling it when aimed correctly",
      trine: "flow in natural trine, the kind of alignment that makes decisive movement feel inevitable",
      opposition: "stand in productive opposition, creating the arc of tension from which execution draws its range",
    };
    return `${words[asp.type]} (orb ${asp.orb}°)`;
  }
  
  if (fn.key === "discipline") {
    const words: Record<Aspect["type"], string> = {
      conjunction: "merge in discipline — raw drive and structural limit becoming one tempered instrument",
      sextile: "hold a productive sextile, effort naturally locating the boundaries it needs to succeed",
      square: "lock into a generative square — friction that builds endurance rather than breaking it when held steady",
      trine: "flow in natural trine, the kind of alignment that makes mastery feel like an inevitable consequence of practice",
      opposition: "stand in productive opposition, creating the arc of tension from which discipline draws its range",
    };
    return `${words[asp.type]} (orb ${asp.orb}°)`;
  }
  
  if (fn.key === "mastery") {
    const words: Record<Aspect["type"], string> = {
      conjunction: "merge in mastery — accumulated experience and expansive authority becoming a single transmission",
      sextile: "hold a productive sextile, structure creating the exact container expansion requires",
      square: "lock into a generative square — friction that deepens wisdom rather than doubting it when tested",
      trine: "flow in natural trine, the kind of alignment that makes genuine authority feel inevitable",
      opposition: "stand in productive opposition, creating the arc of tension from which mastery draws its range",
    };
    return `${words[asp.type]} (orb ${asp.orb}°)`;
  }
  
  if (fn.key === "cultivation") {
    const words: Record<Aspect["type"], string> = {
      conjunction: "merge in cultivation — abundant growth and discerning taste acting as one single measure",
      sextile: "hold a productive sextile, possibility effortlessly finding the form that gives it value",
      square: "lock into a generative square — friction that refines worth rather than diluting it when examined",
      trine: "flow in natural trine, the kind of alignment that makes creation and curation feel inevitable",
      opposition: "stand in productive opposition, creating the arc of tension from which cultivation draws its range",
    };
    return `${words[asp.type]} (orb ${asp.orb}°)`;
  }
  
  // integration
  const words: Record<Aspect["type"], string> = {
    conjunction: "merge in integration — the experience of worth and the emotional memory of it becoming one feeling",
    sextile: "hold a productive sextile, value naturally finding a home within the interior life",
    square: "lock into a generative square — friction that deepens belonging rather than unsettling it when faced",
    trine: "flow in natural trine, the kind of alignment that makes embodied connection feel inevitable",
    opposition: "stand in productive opposition, creating the arc of tension from which integration draws its range",
  };
  return `${words[asp.type]} (orb ${asp.orb}°)`;
}

function toneFor(chart: NatalChart, a: PlanetKey, b: PlanetKey): string {
  const A = SIGNS[chart.positions[a].signIndex];
  const B = SIGNS[chart.positions[b].signIndex];
  if (A.element === B.element) return "deep resonance";
  if (compatible(A.element as Element, B.element as Element)) return "natural flow";
  if (A.modality === B.modality) return "productive tension";
  return "creative friction";
}

function compatible(a: Element, b: Element): boolean {
  return (
    (a === "fire" && b === "air") ||
    (a === "air" && b === "fire") ||
    (a === "earth" && b === "water") ||
    (a === "water" && b === "earth")
  );
}

function pickArchetype(fn: FunctionMeta, chart: NatalChart): ArchetypeEntry {
  const signA = chart.positions[fn.pair[0]].signIndex;
  const signB = chart.positions[fn.pair[1]].signIndex;
  const key = signPairKey(signA, signB);
  return fn.archetypes[key] ?? { name: "The Alchemist", line: "works the transformation between what is and what could be" };
}

function scoreFn(fn: FunctionMeta, asp: Aspect | undefined): number {
  let s = 0;
  if (asp) {
    const w: Record<Aspect["type"], number> = {
      conjunction: 5,
      opposition: 4,
      trine: 4,
      square: 3.5,
      sextile: 2.5,
    };
    s += w[asp.type] + Math.max(0, 3 - asp.orb);
  }
  if (fn.pair.includes("moon")) s += 1.2; // luminary weight
  return Math.round(s * 100) / 100;
}

// ─── Section 1: Fixed function introductions (no signs yet) ──────────────────
const FN_INTRO: Record<string, string> = {
  message:
    "Message is the work of the Moon and Mercury. It is the alchemy of perception into expression. The Moon gathers experience before language exists — emotion, instinct, memory, atmosphere, and felt reality. Mercury organizes those experiences into thought, language, interpretation, and communication. Together they determine how your inner world becomes something another person can receive.",
  execution:
    "Execution is the work of Mercury and Mars. It is the alchemy of strategy into action. Mercury maps the terrain — reading patterns, identifying sequences, and clarifying what needs to happen and in what order. Mars provides the ignition — force, will, initiation, and the raw drive to move. Together they determine how thought becomes movement and movement becomes result.",
  discipline:
    "Discipline is the work of Mars and Saturn. It is the alchemy of drive into endurance. Mars generates energy — impulse, urgency, desire, and the raw capacity to start. Saturn governs structure — time, limitation, patience, and the architecture of what lasts. Together they determine how raw force becomes something that sustains itself.",
  mastery:
    "Mastery is the work of Saturn and Jupiter. It is the alchemy of authority into wisdom. Saturn builds from earned experience — testing, pruning, refining, and forging understanding through consequence. Jupiter expands outward — reaching for broader principles, larger patterns, and the meaning behind the mechanism. Together they determine how expertise becomes genuine authority.",
  cultivation:
    "Cultivation is the work of Jupiter and Venus. It is the alchemy of growth into value. Jupiter reaches outward — expanding possibility, accumulating experience, and continuously asking what more is available. Venus discerns — measuring worth, calibrating beauty, and determining what deserves to be kept. Together they determine how abundance becomes something refined and meaningful.",
  integration:
    "Integration is the work of Venus and the Moon. It is the alchemy of value into belonging. Venus establishes worth — what deserves desire, care, and investment. The Moon internalizes experience — carrying it forward as memory, instinct, and emotional truth. Together they determine how what you value becomes part of who you are.",
};

// ─── Section 2: How each planet-in-function operates through each element ────
// Key format: `${functionKey}_${0|1}` — 0 = first planet of the pair, 1 = second.
const SIGN_COLORING: Record<string, Record<Element, string>> = {
  // Moon in Message — gathers raw experience
  message_0: {
    fire:  "catches impressions through direct encounter — emotion surfaces as urgency and immediate heat, arriving before analysis is possible",
    earth: "anchors experience in the body — feeling arrives as physical fact, and emotional truth is only trusted once it has been verified by what endures",
    air:   "reads the patterns between experiences before fully feeling them — mood translates into signal, and the relational meaning of events registers faster than their emotional content",
    water: "absorbs rather than observes — catching mood, symbolism, and the emotional atmosphere beneath the visible surface of events rather than the events themselves",
  },
  // Mercury in Message — organizes into expression
  message_1: {
    fire:  "reaches immediately for what an experience means and where it leads — expression arrives fast and tends toward bold direct interpretation over careful qualification",
    earth: "builds meaning into durable concrete form — language is most trusted when it produces something that can be demonstrated, verified, or used rather than merely felt",
    air:   "networks ideas across contexts — communication finds its rhythm in cross-referencing, making connections, and translating experience into frameworks others can navigate",
    water: "arrives at meaning before the reasoning that explains it — expression surfaces as image, metaphor, and resonant language rather than as linear argument",
  },
  // Mercury in Execution — maps the strategy
  execution_0: {
    fire:  "identifies the fastest path and launches before the map is complete — strategy is a live process refined through contact rather than drawn up in advance",
    earth: "builds plans from material reality — thinking that cannot be grounded in what actually exists is treated as unreliable, and the best strategy is the one that can be executed step by step",
    air:   "assembles strategy from multiple inputs simultaneously — thinking through networks of possibility and finding the logical sequence that uses available resources most efficiently",
    water: "approaches strategy intuitively — reading the pattern of a situation before naming its parts, and planning through felt navigation more than formal analysis",
  },
  // Mars in Execution — provides the igniting force
  execution_1: {
    fire:  "moves on instinct — force is generated in the moment of contact rather than stored in advance, and execution begins before the situation is fully assessed",
    earth: "moves on accumulation — force is most effective when sustained across time, and execution is built from steady effort rather than single decisive strikes",
    air:   "moves through friction — force finds its most natural outlet in the collision of ideas and positions, and execution accelerates when opposition provides resistance to push against",
    water: "moves through feeling — force is generated by emotional intensity, and execution is most powerful when driven by what is deeply felt rather than strategically calculated",
  },
  // Mars in Discipline — generates the raw drive
  discipline_0: {
    fire:  "generates urgency — the pressure it creates is forward-moving and difficult to sustain in the absence of direct encounter or immediate stakes",
    earth: "generates endurance — the pressure it creates is slow, steady, and most powerful when channeled into a single direction over a long period of time",
    air:   "generates friction — the pressure it creates feeds on resistance and the need to overcome opposing positions rather than on sustained solitary effort",
    water: "generates intensity — the pressure it creates comes from beneath the surface, driven by emotional reserves that are difficult to replenish once fully drawn down",
  },
  // Saturn in Discipline — builds the containing structure
  discipline_1: {
    fire:  "structures through direction — the limits it constructs are designed to concentrate energy into its most effective form rather than to contain or suppress it",
    earth: "structures through form — the limits it constructs are material, time-bound, and designed to outlast the effort that created them",
    air:   "structures through principle — the limits it constructs are conceptual, built on rules and systems that hold relationships in place across changing conditions",
    water: "structures through depth — the limits it constructs are psychological, forged through what has been felt, survived, and integrated rather than planned in advance",
  },
  // Saturn in Mastery — builds from earned experience
  mastery_0: {
    fire:  "builds authority through direct encounter — credibility is earned by initiating and surviving failure rather than by studying it, and expertise is held in the body of experience",
    earth: "builds authority through sustained practice — expertise arrives not as a moment of insight but as the demonstrated fact of what has endured and what has not",
    air:   "builds authority through systematic knowledge — expertise is established through the ability to explain, transmit, and make transferable what has been learned across time",
    water: "builds authority through integration — expertise is not stored as information but as felt understanding, absorbed into the full weight of the self rather than catalogued in the mind",
  },
  // Jupiter in Mastery — expands toward larger meaning
  mastery_1: {
    fire:  "expands toward meaning through encounter — wisdom grows from the accumulation of what has been dared and survived rather than from what has been studied or planned",
    earth: "expands toward meaning through accumulation — wisdom deepens through patient investment in a particular domain rather than through broad exploration or rapid movement between fields",
    air:   "expands toward meaning through ideas — wisdom arrives through the exchange of perspectives and the discovery of principles that connect disparate domains into a larger coherent framework",
    water: "expands toward meaning through feeling — wisdom grows through the integration of what cannot be named but can be recognized, deepening through the invisible dimensions of experience",
  },
  // Jupiter in Cultivation — reaches for possibility
  cultivation_0: {
    fire:  "reaches for possibility through initiative — growth is discovered by acting into it before it can be fully mapped, and expansion follows from what is generated in motion",
    earth: "reaches for possibility through investment — growth is expanded through patient commitment to a single direction, and expansion follows from what is built with consistent care",
    air:   "reaches for possibility through exchange — growth is discovered in the space between perspectives, and expansion follows from the connections that form across disciplines and distances",
    water: "reaches for possibility through resonance — growth follows what pulls rather than what points, guided by the felt sense of where meaning is deepening",
  },
  // Venus in Cultivation — discerns genuine worth
  cultivation_1: {
    fire:  "discerns worth through aliveness — value is measured by what produces heat, vitality, and forward movement, and the test of quality is whether something sustains desire or extinguishes it",
    earth: "discerns worth through form — value is measured by what endures and produces tangible satisfaction, and the test of quality is whether something can be held and returned to over time",
    air:   "discerns worth through connection — value is measured by the quality of exchange a thing generates, and the test of quality is whether it opens conversation and feeds thought",
    water: "discerns worth through resonance — value is measured by emotional depth, and the test of quality is whether something belongs in the interior life or only on the surface",
  },
  // Venus in Integration — establishes what is worth carrying
  integration_0: {
    fire:  "establishes worth through desire — what is valued announces itself through heat and aliveness, and what is carried forward is what continues to feel alive rather than merely familiar",
    earth: "establishes worth through form — what is valued has proved itself in material reality, and what is carried forward is what has demonstrated endurance rather than merely appealed",
    air:   "establishes worth through connection — what is valued is what generates exchange and feeds thought, and what is carried forward is what opens the world rather than narrows it",
    water: "establishes worth through resonance — what is valued registers deep in the interior life before it can be named, and what is carried forward is what feels true rather than merely useful",
  },
  // Moon in Integration — internalizes as living memory
  integration_1: {
    fire:  "internalizes experience through intensity — what is carried forward is held as emotional heat, and what is remembered most vividly is what arrived with urgency and aliveness",
    earth: "internalizes experience through accumulation — what is carried forward is held as sensory fact, and what is remembered most reliably is what was felt in the body and verified by endurance",
    air:   "internalizes experience through pattern — what is carried forward is held as relational knowledge, and what is remembered most clearly is what clarified a connection or opened a new understanding",
    water: "internalizes experience through depth — what is carried forward is held as felt atmosphere, and what is remembered most permanently is what was absorbed rather than observed",
  },
};

// Section 2 helper: WHY two signs create this particular system together.
function elementInteractionNote(
  eA: Element, mA: string,
  eB: Element, mB: string,
  signA: string, signB: string
): string {
  if (eA === eB) {
    return `Because both signs share the ${eA} element, the two halves of this function speak directly to each other without the need for translation. The system is coherent and self-amplifying — which also means the blind spots of the ${eA} nature tend to go unchallenged from within.`;
  }
  if ((eA === "fire" && eB === "air") || (eA === "air" && eB === "fire")) {
    return `${signA}'s ${eA} and ${signB}'s ${eB} work in natural circulation — fire generates raw material and momentum; air gives it structure and the ability to travel. The function builds through an ongoing exchange: movement produces material, thinking gives that material direction, and the cycle deepens with use.`;
  }
  if ((eA === "earth" && eB === "water") || (eA === "water" && eB === "earth")) {
    return `${signA}'s ${eA} and ${signB}'s ${eB} work in natural circulation — earth provides form and containment; water provides the depth that makes form worth inhabiting. Structure holds what feeling cannot contain alone, and depth gives structure a reason to exist beyond utility.`;
  }
  if (mA === mB) {
    return `${signA} and ${signB} share the ${mA} mode but operate through incompatible elements. They move on the same rhythm while speaking different languages — the function has internal coherence in its timing but constant tension in its nature. That tension is the force rather than the obstacle.`;
  }
  return `${signA} and ${signB} share neither element nor modality. The gap between them is the defining characteristic of this function — the two planets are not naturally fluent in each other's operations, so the system must be built rather than assumed. What that construction produces is genuinely specific to this configuration.`;
}

// Section 3: How the aspect determines energy movement between the planets.
function transmissionText(pA: string, pB: string, asp: Aspect | undefined): string {
  if (!asp) {
    return `${pA} and ${pB} share no major aspect, which means this function does not run on an automatic channel. The two planets develop independently — maturing at different rates and through different experiences before learning to coordinate. Insight from one side often arrives well before the other is ready to receive it, creating periods of lag where one half of the function waits for the other to catch up. When the connection does form, it tends to arrive in complete frameworks rather than incremental steps, producing sudden integration rather than gradual development.`;
  }
  const entries: Record<Aspect["type"], string> = {
    conjunction: `${pA} and ${pB} are conjoined, meaning this function operates as a single unified system rather than as two cooperating parts. There is no gap between the impulse ${pA} generates and the response ${pB} provides — they activate together, and the function moves with speed and decisiveness. The limitation is that the two planets cannot easily observe each other from a distance: what ${pA} produces, ${pB} immediately inherits, leaving very little room for self-correction before the function has already engaged. (orb ${asp.orb}°)`,
    sextile:     `${pA} and ${pB} share a productive sextile (orb ${asp.orb}°). This aspect works through invitation rather than pressure — each planet creates conditions the other can use, but neither compels the other to respond. The function builds through cultivation: the more deliberately it is engaged, the more fluid the exchange becomes. Left passive, the sextile can remain latent — a resource that exists but is never fully drawn on.`,
    square:      `${pA} and ${pB} are in a generative square (orb ${asp.orb}°). The two planets pull in different directions, and the function is powered by the tension between them. The square makes this function effortful: it does not flow automatically, and every time it engages, it requires that the friction between what ${pA} demands and what ${pB} is prepared to deliver be resolved. That friction is not a flaw in the system — it is the mechanism that makes the output forceful rather than passive. The function does not work when the tension is avoided; it works precisely when the tension is entered directly.`,
    trine:       `${pA} and ${pB} share a flowing trine (orb ${asp.orb}°). Energy passes between them without resistance, and this function activates with a naturalness that can feel almost unconscious. Because the alignment is so easy, the function often operates below the level of deliberate attention — which is both its greatest strength and its primary risk. What flows without friction is also what flows without scrutiny, meaning the patterns this function produces can run for years before being examined directly.`,
    opposition:  `${pA} and ${pB} stand in productive opposition (orb ${asp.orb}°). This function operates through the dynamic between two poles rather than through a single unified direction. What ${pA} generates, ${pB} qualifies — and vice versa, in constant alternation. The function develops through contrast: each planet is understood by seeing itself reflected and challenged by the other. This produces a function with remarkable range, built from two extreme positions rather than from one consolidated center. The challenge is that the two poles can periodically feel irreconcilable until a new synthesis is forced.`,
  };
  return entries[asp.type];
}

// Section 4: Why this mechanism produces that specific archetype.
function archetypeRevealParagraph(
  fn: FunctionMeta,
  arche: ArchetypeEntry,
  sa: { name: string; element: string; modality: string },
  sb: { name: string; element: string; modality: string },
  asp: Aspect | undefined
): string {
  const pA = PLANET_META[fn.pair[0]].name;
  const pB = PLANET_META[fn.pair[1]].name;
  const eA = sa.element as Element;
  const eB = sb.element as Element;

  let mechanism: string;
  if (eA === eB) {
    mechanism = `the concentrated coherence of two ${eA} operations feeding each other without interruption`;
  } else if (
    (eA === "fire" && eB === "air") || (eA === "air" && eB === "fire") ||
    (eA === "earth" && eB === "water") || (eA === "water" && eB === "earth")
  ) {
    mechanism = `the natural circulation between ${pA}'s ${eA} instinct and ${pB}'s ${eB} instinct — each supplying exactly what the other requires to move forward`;
  } else if (sa.modality === sb.modality) {
    mechanism = `the productive tension of two ${sa.modality} operations in incompatible elements — a shared rhythm without a shared language`;
  } else {
    mechanism = `the deliberate construction required when ${pA}'s ${eA} nature and ${pB}'s ${eB} nature have no natural path to each other — a gap that produces distinctive output in the very act of being bridged`;
  }

  let aspNote: string;
  if (!asp) {
    aspNote = " Because the two planets matured independently before learning to cooperate, the archetype tends to emerge in bursts of sudden clarity rather than as a steady background presence.";
  } else if (asp.type === "conjunction") {
    aspNote = " The conjunction fuses the two operations into one movement, so the archetype activates as a whole rather than as a developing sequence.";
  } else if (asp.type === "trine") {
    aspNote = " The trine allows this to unfold without friction, which means the archetype often operates below conscious intention — a strength that also requires deliberate examination to remain honest.";
  } else if (asp.type === "square") {
    aspNote = " The square means the archetype is not automatic — it is produced through the resolution of ongoing internal tension, which gives it force but requires engagement to function.";
  } else if (asp.type === "opposition") {
    aspNote = " The opposition means the archetype builds through range — its characteristic output comes from having internalized two opposing poles rather than one consolidated position.";
  } else {
    aspNote = " The sextile means the archetype deepens with deliberate use rather than emerging automatically.";
  }

  return `When this system matures, it produces ${arche.name} — the one who ${arche.line}. This archetype is the direct output of ${mechanism}.${aspNote}`;
}

// Section 5: Observable behavior — what people actually witness.
function observableBehavior(
  fn: FunctionMeta,
  arche: ArchetypeEntry,
  sa: { name: string; element: string; modality: string },
  sb: { name: string; element: string; modality: string },
  asp: Aspect | undefined
): string {
  const pA = PLANET_META[fn.pair[0]].name;
  const pB = PLANET_META[fn.pair[1]].name;
  const eA = sa.element as Element;
  const eB = sb.element as Element;
  const isFluid = !!asp && (asp.type === "trine" || asp.type === "sextile" || asp.type === "conjunction");

  if (fn.key === "message") {
    const quality = eA === "fire" ? "immediate and declarative" :
                    eA === "earth" ? "deliberate and grounded" :
                    eA === "air"   ? "networked and cross-referential" :
                                     "imagistic and atmospheric";
    const impact = eB === "air"   ? "others often leave conversations with a framework rather than just an answer" :
                   eB === "fire"  ? "others often receive an energy as much as a message — the communication arrives as ignition" :
                   eB === "earth" ? "others often receive something they can use — the communication lands as usable form rather than abstract content" :
                                    "others often receive something that resonates before it is understood — the communication moves feeling before it moves logic";
    const decisionNote = isFluid
      ? "Decision-making flows through this function naturally — articulating a choice is part of how it becomes real."
      : "Decision-making requires that the interior reality be put into language before a choice feels settled; what cannot be expressed tends to remain unmade.";
    return `In everyday life, this function produces communication that is ${quality}. ${impact.charAt(0).toUpperCase() + impact.slice(1)}. ${decisionNote} In relationships, the tendency is to communicate more completely than the moment demands, because this function does not easily distinguish between what is relevant and what is simply present and true.`;
  }

  if (fn.key === "execution") {
    const tempo = eA === "fire" ? "fast and instinct-led" :
                  eA === "earth" ? "deliberate and resource-conscious" :
                  eA === "air"   ? "logically sequenced and friction-seeking" :
                                   "feeling-driven and intensely committed";
    const workStyle = eB === "fire" ? "prefers to begin with what is available and course-correct in motion" :
                      eB === "earth" ? "produces durable results over ambiguous or provisional ones" :
                      eB === "air"   ? "excels when the problem has structure that can be mapped and optimized" :
                                       "performs best when the stakes are real and the emotional investment is genuine";
    return `In everyday life, this function produces initiative that is ${tempo}. The work style ${workStyle}. Decision-making moves through a characteristic sequence: ${pA} gathers the information and maps the logic; ${pB} tests whether the mapped path has actual force behind it. When both sides align, execution is decisive. When they diverge — when direction is clear but drive is absent, or drive is present but direction is not — the function stalls until the gap is resolved. Others experience this as someone who builds remarkable momentum once a course is chosen but who may be visibly inconsistent in the period before that clarity arrives.`;
  }

  if (fn.key === "discipline") {
    const driveQuality = eA === "fire" ? "initiating and self-pressurizing — it functions best in the presence of immediate encounter or clear forward stakes" :
                         eA === "earth" ? "steady and accumulative — it functions best under conditions of consistent routine rather than crisis or urgency" :
                         eA === "air"   ? "friction-dependent — it intensifies in the presence of challenge or intellectual opposition rather than in its absence" :
                                          "depth-dependent — it requires genuine emotional investment to sustain, organized around what is felt rather than what is rational";
    const structureEffect = eB === "earth" ? "builds frameworks that are practical and resistant to the pressure to compromise before the work is complete" :
                             eB === "fire"  ? "builds frameworks designed to protect momentum — structure here serves acceleration rather than caution" :
                             eB === "air"   ? "builds frameworks that are principled and portable — systems that can be explained and applied across contexts" :
                                              "builds frameworks that hold not just the schedule but the interior conditions the work requires";
    return `In everyday life, this function produces effort that is ${driveQuality}. ${pB}'s ${eB} influence ${structureEffect}. Others experience this as someone clearly capable of extraordinary sustained effort but whose engagement follows a specific internal logic: the conditions must be right, the direction must be worthy of the investment, and the structure must be one this person has built rather than inherited. Work imposed from outside the system tends to produce resistance; work generated from inside it produces remarkable discipline.`;
  }

  if (fn.key === "mastery") {
    const authorityMode = eA === "fire" || eB === "fire" ? "arrived at through visible risk and direct encounter with the territory rather than through study or inheritance" :
                          eA === "earth" || eB === "earth" ? "demonstrated through what has been actually built, sustained, and delivered over time — not claimed but proved" :
                          eA === "air" || eB === "air"     ? "expressed through the ability to transmit, teach, and make the earned understanding available to others in transferable form" :
                                                              "carried as felt knowledge rather than performed as credentials — more apparent in how this person navigates than in what they claim";
    return `In everyday life, this function produces authority that is ${authorityMode}. Decision-making draws on a synthesis of specific lived knowledge and a larger framework of meaning — neither pure pragmatism nor pure theory, but something assembled from the tension between them. Others experience this as someone who has clearly gone somewhere few others have, though the destination is not always easy to name. The function produces a particular kind of influence: not the authority of rank or role, but the authority of someone whose understanding has been genuinely earned and then placed inside a map large enough to be useful to others.`;
  }

  if (fn.key === "cultivation") {
    const reachQuality = eA === "fire" ? "bold and expansive — possibility is pursued before it is verified, and growth follows from moving toward what excites before the path is cleared" :
                         eA === "earth" ? "patient and accumulative — possibility is pursued through sustained investment, and growth follows from what is built steadily rather than grasped quickly" :
                         eA === "air"   ? "networked and connective — possibility is discovered in the exchange between perspectives, and growth follows from connections forming across fields" :
                                          "resonant and feeling-led — possibility is sensed before it can be named, and growth follows what pulls rather than what points";
    const discernNote = eB === "fire" ? "gravitates toward what is most alive and capable of sustaining desire" :
                        eB === "earth" ? "gravitates toward what endures and can be returned to, building value in what sustains" :
                        eB === "air"   ? "gravitates toward what opens conversation and connects across contexts" :
                                         "gravitates toward what resonates in the interior life — what belongs emotionally rather than what merely qualifies";
    return `In everyday life, this function produces growth that is ${reachQuality}. Discernment — ${pB}'s contribution — ${discernNote}. In work, this creates a characteristic pattern: the capacity to reach widely and return with what is genuinely worth keeping. Others experience this as someone who navigates possibility with unusual taste — not cautious, not reckless, but consistently arriving at what has lasting value rather than what is merely available or impressive in the moment.`;
  }

  // Integration
  const worthQuality = eA === "fire"  ? "announces itself through heat and immediate recognition rather than through careful deliberation" :
                        eA === "earth" ? "proves itself through endurance — what is genuinely valued demonstrates its worth over time rather than in the moment of first encounter" :
                        eA === "air"   ? "generates exchange and feeds thought — what is genuinely valued opens the world rather than narrows it" :
                                         "resonates in the body and interior before it can be named — felt true rather than concluded to be true";
  const memoryNote = eB === "fire"  ? "carries experience forward as living heat — the interior life holds most vividly what arrived with urgency and aliveness" :
                     eB === "earth" ? "carries experience forward as accumulated fact — the interior life holds most reliably what was verified through endurance" :
                     eB === "air"   ? "carries experience forward as relational pattern — the interior life organizes itself around connections and understandings rather than feelings alone" :
                                      "carries experience forward as atmosphere — the interior life holds what was absorbed rather than observed, closer to weather than to catalogued memory";
  return `In everyday life, this function produces a particular relationship between what is loved and who the person is. Worth ${worthQuality}. The ${pB} ${memoryNote}. Others experience this as someone whose sense of identity is structurally entangled with what they value — not defensively but constitutively: what is genuinely valued by this person is genuinely part of them, and what is not valued is genuinely absent from their interior life regardless of external circumstances.`;
}

// Section 6: Predictable failure modes — what breaks and exactly how.
function failureMode(
  fn: FunctionMeta,
  sa: { name: string; element: string; modality: string },
  sb: { name: string; element: string; modality: string },
  asp: Aspect | undefined
): string {
  const pA = PLANET_META[fn.pair[0]].name;
  const pB = PLANET_META[fn.pair[1]].name;
  const eA = sa.element as Element;
  const eB = sb.element as Element;

  let aspFailure: string;
  if (!asp) {
    aspFailure = `Because the two planets developed independently, the most common failure is developmental lag — one half of the function advances while the other stalls, creating a persistent gap between what the function could produce and what it actually delivers.`;
  } else if (asp.type === "conjunction") {
    aspFailure = `The conjunction merges both planets into a single activation, which means when this function fails, it fails completely rather than partially. There is no internal buffer — ${pA}'s distortion immediately becomes ${pB}'s distortion. Self-correction requires deliberate external input, because the system cannot easily observe its own failure state from within.`;
  } else if (asp.type === "square") {
    aspFailure = `The square creates tension that is productive only when directly engaged. When the friction is avoided rather than worked, it does not disappear — it accumulates. The failure mode is not a single dramatic breakdown but a gradual withdrawal: the effort required to resolve the internal tension eventually exceeds what feels worthwhile, and the system begins to underperform quietly rather than failing visibly.`;
  } else if (asp.type === "trine") {
    aspFailure = `The trine flows without resistance, which means this function rarely alerts its owner to its own distortions. The failure mode is invisible operation — the function runs below the level of deliberate attention for so long that unchecked patterns accumulate without scrutiny. When the failure eventually becomes visible, it often appears to come from nowhere, because no friction in the system flagged it in advance.`;
  } else if (asp.type === "opposition") {
    aspFailure = `The opposition can swing between poles without finding a sustainable center. The failure mode is oscillation — periods where ${pA}'s qualities dominate without ${pB}'s correction, followed by overcorrection in the other direction. Integration requires holding both poles simultaneously, which is the most demanding task this aspect produces.`;
  } else {
    aspFailure = `The sextile is latent by nature — its potential requires active cultivation. The failure mode is underuse: this function is capable of more than it typically produces, but because it does not demand engagement, it is easy to leave it at a comfortable but partial level of development.`;
  }

  let elementFailure: string;
  if (fn.key === "message") {
    if (eA === eB) {
      elementFailure = `Because both planets share the ${eA} element, the function's blind spot lies in what that element cannot perceive. The system is highly coherent within its own register and easily misses signals arriving through a fundamentally different mode.`;
    } else if ((eA === "water" && eB === "fire") || (eA === "fire" && eB === "water")) {
      elementFailure = `The specific pressure here is between emotional depth and expressive speed — the interior accumulates faster than it can be organized into language, creating a persistent sense that what is communicated fails to capture what is actually known internally.`;
    } else if ((eA === "fire" && eB === "air") || (eA === "air" && eB === "fire")) {
      elementFailure = `The specific pressure here is between generating and organizing — movement can outpace structure, producing communication that is vital and engaging but difficult for others to use as a reliable foundation for action.`;
    } else if ((eA === "earth" && eB === "water") || (eA === "water" && eB === "earth")) {
      elementFailure = `The specific pressure here is between practical form and felt meaning — communication can become so dense with both registers that others struggle to receive it without knowing how to hold both simultaneously.`;
    } else {
      elementFailure = `The specific pressure here is the translation gap between two fundamentally different registers — what is received and what is expressed do not share a natural pathway, which means the function must be actively managed rather than trusted to operate automatically.`;
    }
  } else if (fn.key === "execution") {
    elementFailure = eA === eB
      ? `Because ${pA} and ${pB} share the same element, the system's failure mode is internal reinforcement without correction — strategy and force confirm each other's approach rather than providing independent checks.`
      : `The gap between how ${pA} maps and how ${pB} moves creates the primary failure point. Either the strategy is clear but the force never fully engages it, or the force moves before the strategy is ready to guide it — and the output suffers the consequences of whichever misalignment is operating.`;
  } else if (fn.key === "discipline") {
    elementFailure = asp?.type === "square"
      ? `The square makes discipline itself exhausting to maintain over time. The system risks performing effort rather than sustaining it — protecting the appearance of discipline after the genuine internal engagement has already withdrawn.`
      : `The failure specific to this element configuration is a mismatch between how ${pA} generates pressure and what ${pB} is designed to structure. The system can produce enormous drive that is poorly contained, or excellent containment that suppresses drive rather than directing it.`;
  } else if (fn.key === "mastery") {
    elementFailure = eA === eB
      ? `When both planets share the same element, expertise can become self-confirming — knowledge that validates its own assumptions rather than testing them. The system can produce deep but narrow authority that mistakes fluency in its own domain for general understanding.`
      : `The gap between how ${pA} builds authority and how ${pB} reaches for larger meaning creates a specific failure: either the expertise becomes so narrowly specific that it cannot be placed inside a larger significance, or the larger framework becomes so expansive that the specific practical knowledge beneath it cannot support the weight.`;
  } else if (fn.key === "cultivation") {
    elementFailure = `This function fails when growth and discernment become desynchronized. When ${pA}'s reach accelerates beyond ${pB}'s ability to evaluate what is being gathered, the result is abundance without judgment. When ${pB}'s discernment becomes so refined that ${pA}'s reach feels perpetually insufficient, the result is judgment without abundance. Either direction produces the same outcome: the function stops generating genuine value and begins cycling in place.`;
  } else {
    elementFailure = eA !== eB
      ? `${pA}'s ${eA} instincts and ${pB}'s ${eB} instincts can operate in parallel without actually meeting — producing someone who knows what they value and knows what they feel but cannot fully reconcile the two into a stable interior life. The interior landscape becomes divided rather than integrated.`
      : `Both planets sharing the ${eA} element creates a system that integrates deeply within that register but resists material arriving in a different mode — gradually narrowing the interior life to what fits the dominant element without fully acknowledging the exclusion.`;
  }

  return `${aspFailure} ${elementFailure}`;
}

// Section 7: What mastery looks like when this function transforms.
function masteryParagraph(fn: FunctionMeta, arche: ArchetypeEntry, pA: string, pB: string): string {
  const texts: Record<string, string> = {
    message:
      `Mastery of this function develops as the gap between interior experience and expressed language steadily closes. Each time perception is translated into communication without waiting for perfect language, the channel between ${pA} and ${pB} strengthens. Eventually the delay between receiving and expressing becomes so small that the distinction between knowing and communicating nearly disappears. At its highest expression, this function does not simply report what has been experienced — it reorganizes how others perceive what they have experienced themselves.`,
    execution:
      `Mastery of this function develops as strategy and force stop operating on different timelines. Each time ${pA}'s map is tested in motion rather than refined indefinitely in advance, and each time ${pB}'s drive is aimed by logic rather than released before direction exists, the channel between them deepens. Eventually the two operations become nearly simultaneous: the plan and the launch are the same event. At its highest expression, this function does not simply complete work — it creates the conditions for the next move before the current one is finished.`,
    discipline:
      `Mastery of this function develops as effort stops requiring ideal conditions to sustain itself. Each time ${pA} generates pressure in the absence of excitement and ${pB} holds structure in the absence of external reward, the function deepens. What began as effortful maintenance becomes the natural mode — effort is no longer something the system produces; it is what the system is made of. At its highest expression, this function does not simply endure — it transforms the conditions it operates under by demonstrating that they can be worked regardless of their difficulty.`,
    mastery:
      `Mastery of this function develops as accumulated experience and expansive understanding become a single movement rather than two competing orientations. Each time ${pA}'s hard-earned knowledge is placed inside ${pB}'s larger framework, and each time ${pB}'s search for meaning is grounded by what is actually true, the two planets align more completely. Eventually expertise and wisdom are no longer distinguishable: knowing something deeply is the same as knowing where it fits. At its highest expression, this function does not simply possess authority — it transmits a way of seeing that makes authority legible to others.`,
    cultivation:
      `Mastery of this function develops as growth and discernment become synchronized — when what is reached for and what is kept are moving at the same speed. Each time ${pA}'s expansion is held to ${pB}'s standard of genuine worth, and each time ${pB}'s discernment keeps pace with ${pA}'s reach, the two planets become more fluent with each other. Eventually the function produces not simply more, but specifically more of what matters. At its highest expression, this function does not merely accumulate quality — it creates conditions in which quality becomes more available to everyone in its vicinity.`,
    integration:
      `Mastery of this function develops as what is valued and what is remembered become structurally unified — no longer two parallel systems but a single continuous process. Each time ${pA} names what genuinely belongs and ${pB} carries it forward without distortion, the integration deepens. What has been integrated becomes impossible to separate from the person themselves: values are not held, they are embodied. At its highest expression, this function does not simply know what matters — it lives in a way that makes what matters visible to others without naming it directly.`,
  };
  return texts[fn.key] ?? `Mastery develops as ${pA} and ${pB} become increasingly synchronized. The system that once required deliberate management becomes background intelligence — operating beneath the level of conscious attention without losing the capacity to be engaged directly when needed. At its highest expression, this function runs as ${arche.name}, the one who ${arche.line}, not as an occasional talent but as the natural mode of the creation cycle.`;
}

function functionReading(
  chart: NatalChart,
  fn: FunctionMeta,
  arche: ArchetypeEntry,
  asp: Aspect | undefined,
  _resonance: string
): string[] {
  const [a, b] = fn.pair;
  const pa = chart.positions[a];
  const pb = chart.positions[b];
  const sa = SIGNS[pa.signIndex];
  const sb = SIGNS[pb.signIndex];
  const pA = PLANET_META[a].name;
  const pB = PLANET_META[b].name;
  const eA = sa.element as Element;

  // Section 1 — Introduce the Function
  const s1 = FN_INTRO[fn.key];

  // Section 2 — Explain the System (both planets' sign colorings + why they interact)
  const colorA = SIGN_COLORING[`${fn.key}_0`]?.[eA] ?? `operates in ${sa.name}`;
  const colorB = SIGN_COLORING[`${fn.key}_1`]?.[sb.element as Element] ?? `operates in ${sb.name}`;
  const interaction = elementInteractionNote(eA, sa.modality, sb.element as Element, sb.modality, sa.name, sb.name);
  // Mention houses only when they occupy notably different domains
  const houseDiff = Math.abs(pa.house - pb.house);
  const houseAddendum =
    houseDiff >= 4 || (pa.house <= 3 && pb.house >= 9) || (pa.house >= 9 && pb.house <= 3)
      ? ` ${pA} — as your ${PLANET_META[fn.pair[0]].fn} function — runs through ${HOUSE_THROUGH[pa.house - 1]}, which means this side of the function is most productive when the work involves ${HOUSE_WORK[pa.house - 1]}. ${pB} — as the ${PLANET_META[fn.pair[1]].fn} dimension — runs through ${HOUSE_THROUGH[pb.house - 1]}, grounding that end of the function in the arena of ${HOUSE_WORK[pb.house - 1]}. The function produces its fullest output when both territories are engaged simultaneously.`
      : "";
  const s2 = `Your ${pA} ${colorA}. ${pB} approaches this work differently. In ${sb.name} it ${colorB}. ${interaction}${houseAddendum}`;

  // Section 3 — Explain the Transmission
  const s3 = transmissionText(pA, pB, asp);

  // Section 4 — Reveal the Archetype
  const s4 = archetypeRevealParagraph(fn, arche, sa, sb, asp);

  // Section 5 — Observable Behavior
  const s5 = observableBehavior(fn, arche, sa, sb, asp);

  // Section 6 — Failure Mode
  const s6 = failureMode(fn, sa, sb, asp);

  // Section 7 — Mastery
  const s7 = masteryParagraph(fn, arche, pA, pB);

  return [s1, s2, s3, s4, s5, s6, s7];
}

export function deriveFunctions(chart: NatalChart): ArchetypeFunction[] {
  return FUNCTIONS.map((fn) => {
    const [a, b] = fn.pair;
    const asp = aspectBetween(a, b, chart.aspects);
    const arche = pickArchetype(fn, chart);
    const resonance = toneFor(chart, a, b);
    const overview = `${fn.title} — ${fn.tagline}. In your chart this resolves into ${arche.name}.`;
    const reading = functionReading(chart, fn, arche, asp, resonance);
    const score = scoreFn(fn, asp);
    return {
      key: fn.key,
      title: fn.title,
      tagline: fn.tagline,
      pair: fn.pair,
      glyphs: fn.glyphs,
      definition: fn.definition,
      archetypeName: arche.name,
      archetypeLine: arche.line,
      resonance,
      overview,
      reading,
      score,
    };
  });
}

export function derivePrimary(
  functions: ArchetypeFunction[],
  chart: NatalChart
): PrimaryArchetype {
  const top = [...functions].sort((x, y) => y.score - x.score)[0];
  const fnMeta = FUNCTIONS.find((f) => f.key === top.key)!;
  const [a, b] = top.pair;
  const pa = chart.positions[a];
  const pb = chart.positions[b];
  const sa = SIGNS[pa.signIndex];
  const sb = SIGNS[pb.signIndex];
  const el = sb.element as Element;
  const asp = aspectBetween(a, b, chart.aspects);

  const p1 =
    `Read all six functions together and one archetype keeps surfacing as the thread that ties them into a single way of creating. For you that thread is ${top.title} — ${top.glyphs[0]} ${PLANET_META[a].name} and ${top.glyphs[1]} ${PLANET_META[b].name} working as one. ` +
    `${top.definition} It resolves into a clear identity that runs through every function above: you are ${top.archetypeName}, the one who ${top.archetypeLine}.`;

  const p2 =
    `${PLANET_META[a].name} sits in ${sa.name} in your ${ord(pa.house)} house (${field(pa.house - 1)}), while ${PLANET_META[b].name} sits in ${sb.name} in your ${ord(pb.house)} house (${field(pb.house - 1)}). ` +
    `The two ${aspClause(fnMeta, asp)}, giving this signature ${top.resonance}. This is the source of ${top.tagline}.`;

  const p3 =
    `As ${top.archetypeName}, your natural advantage is ${ELEMENT_GIFT[el]}; your growth edge is ${ELEMENT_EDGE[el]}.`;

  return {
    functionKey: top.key,
    name: top.archetypeName,
    line: top.archetypeLine,
    paragraphs: [p1, p2, p3],
  };
}
