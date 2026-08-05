import type { PlanetKey, Reading } from "@/types/astro";
import { SIGNS, PLANET_META } from "@/constants/astro";
import {
  crossAspects,
  HARMONIOUS,
  CHALLENGING,
  SYNASTRY_ASPECT_WORD,
  type CrossAspect,
  type SynastryPointKey,
} from "@/lib/aspects";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanetPairNote {
  key: PlanetKey;
  aSign: string;
  bSign: string;
  relationshipType: string;
  question: string;
  note: string;
  reactionState: string;
  reactionReason: string;
  observableEffect: string;
  recommendation: string;
  experiment: string;
  healthIndicator: string;
}

export interface ExperimentalSummary {
  climate: string;
  primaryStrength: string;
  primaryChallenge: string;
  greatestOpportunity: string;
  greatestRisk: string;
  leftUnconscious: string;
  builtIntentionally: string;
}

export interface Amplifier {
  interaction: string;
  whyItMatters: string;
  observableOutcome: string;
  operationalAdvantage: string;
}

export interface Constraint {
  constraint: string;
  operationalConsequence: string;
  bestMitigation: string;
}

export interface EmergentSystem {
  category: string;
  description: string;
}

export interface PredictedCycle {
  ignition: string;
  translation: string;
  execution: string;
  expansion: string;
  preservation: string;
  naturalAccelerator: string;
  naturalStall: string;
  handoff: string;
}

export interface ExecutiveSummary {
  definingStrength: string;
  definingLimitation: string;
  highestLeverage: string;
  longTermPotential: string;
}

export interface Comparison {
  nameA: string;
  nameB: string;
  summary: string[];
  experimentalSummary: ExperimentalSummary;
  planetPairs: PlanetPairNote[];
  synastryMatrix: SynastryMatrixEntry[];
  archetype: { a: string; b: string; paragraphs: string[] };
  amplifiers: Amplifier[];
  constraints: Constraint[];
  emergentSystem: EmergentSystem;
  predictedCycle: PredictedCycle;
  executiveSummary: ExecutiveSummary;
}

export interface SynastryMatrixEntry {
  aPoint: string;
  bPoint: string;
  aspect: string;
  orb: number;
  aPlacement: string;
  bPlacement: string;
  interpretation: string;
  observableEffect: string;
  recommendation: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CORE: PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

const PAIR_LENS: Record<PlanetKey, string> = {
  sun: "shared creative vision and core intent",
  moon: "emotional attunement and instinctual rhythm",
  mercury: "the flow of information and shared logic",
  venus: "the definition of value and aesthetic alignment",
  mars: "the allocation of force and raw initiative",
  jupiter: "the scale of ambition and shared belief",
  saturn: "the architecture of endurance and accountability",
  uranus: "disruption",
  neptune: "dissolution",
  pluto: "regeneration",
};

const FUNCTION_QUESTION: Partial<Record<PlanetKey, string>> = {
  sun: "What are we building?",
  moon: "How do we naturally interpret one another?",
  mercury: "How should information move?",
  mars: "How should force be allocated?",
  jupiter: "How should growth occur?",
  venus: "What deserves investment?",
  saturn: "What ensures longevity?",
};

const POINT_LENS: Record<SynastryPointKey, string> = {
  sun: "creative identity and core intent",
  moon: "emotional attunement and instinct",
  mercury: "thinking and communication",
  venus: "value, attraction, and shared taste",
  mars: "initiative, desire, and force",
  jupiter: "growth, meaning, and scale",
  saturn: "structure, responsibility, and endurance",
  uranus: "freedom, disruption, and new possibilities",
  neptune: "sensitivity, imagination, and ideals",
  pluto: "depth, power, and transformation",
  ascendant: "embodiment, presentation, and first response",
};

function pointName(key: SynastryPointKey): string {
  return key === "ascendant" ? "Ascendant" : PLANET_META[key].name;
}

function pointLens(key: SynastryPointKey): string {
  return POINT_LENS[key];
}

function pointMetaName(key: SynastryPointKey): string {
  return pointName(key);
}

function pointLabel(name: string, key: SynastryPointKey): string {
  return `${name}'s ${pointMetaName(key)}`;
}

function aspectRelationship(
  aspect: CrossAspect | undefined,
  aIdx: number,
  bIdx: number,
): Rel {
  if (!aspect) return signRel(aIdx, bIdx);
  const A = SIGNS[aIdx];
  const B = SIGNS[bIdx];
  const type = SYNASTRY_ASPECT_WORD[aspect.type];
  const clauses: Record<string, string> = {
    conjunction: "operate through the same channel, amplifying both the shared capacity and the need to differentiate it",
    sextile: `form a sextile — ${A.element} and ${B.element} cooperate when given a deliberate opening`,
    square: `form a square — ${A.modality} drives meet through different ${A.element} and ${B.element} strategies`,
    trine: `form a trine through compatible ${A.element} energy, creating a natural current between them`,
    opposition: "stand in opposition — complementary poles make each other visible and demand conscious balance",
    quincunx: `form a quincunx — ${A.element} and ${B.element} require ongoing translation rather than automatic agreement`,
  };
  return {
    clause: `${type} (orb ${aspect.orb}°); they ${clauses[aspect.type]}`,
    easy: HARMONIOUS.includes(aspect.type),
    type: type[0].toUpperCase() + type.slice(1),
  };
}

// ─── Reaction states ──────────────────────────────────────────────────────────

const REACTION_STATE: Partial<Record<PlanetKey, { easy: string; hard: string }>> = {
  sun:     { easy: "Resonant",   hard: "Volatile"   },
  moon:    { easy: "Stable",     hard: "Reactive"   },
  mercury: { easy: "Dynamic",    hard: "Compressed" },
  venus:   { easy: "Balanced",   hard: "Reactive"   },
  mars:    { easy: "Catalytic",  hard: "Volatile"   },
  jupiter: { easy: "Dynamic",    hard: "Compressed" },
  saturn:  { easy: "Stable",     hard: "Compressed" },
};

const REACTION_REASON: Partial<Record<PlanetKey, { easy: string; hard: string }>> = {
  sun: {
    easy: "Both central creative directives point toward compatible territory — leadership and intent align without requiring negotiation over ownership.",
    hard: "Two strong creative directives occupy the same space — neither naturally defers, producing both extraordinary generative tension and structural friction around authority.",
  },
  moon: {
    easy: "The interpretive frequencies are compatible — each system reads the other's internal state with minimal translation required.",
    hard: "Emotional processing operates through fundamentally different mechanisms — what one reads as a clear signal, the other experiences as noise.",
  },
  mercury: {
    easy: "Information moves fluidly between two compatible reasoning styles — ideas transfer intact and build on each other efficiently.",
    hard: "Each mind structures its thinking through a different architecture — what appears obvious to one requires deliberate unpacking for the other.",
  },
  venus: {
    easy: "Both systems anchor value in compatible territory — investment priorities and quality standards require little negotiation.",
    hard: "Value frameworks originate from different foundations — what one considers essential, the other treats as secondary.",
  },
  mars: {
    easy: "Drive and initiative tempo synchronize naturally — force compounds rather than divides when both systems move at compatible rhythms.",
    hard: "Both systems carry strong directional impulse — force collides at every launch point unless clearly channeled into distinct domains.",
  },
  jupiter: {
    easy: "Expansion parameters are compatible — both push toward similar scale without one feeling dragged or the other feeling constrained.",
    hard: "One system consistently pushes beyond the parameters the other considers viable — growth becomes a site of persistent negotiation.",
  },
  saturn: {
    easy: "Both systems hold structural responsibility through compatible mechanisms — accountability distributes without confusion or duplication.",
    hard: "Each holds authority through a different structural logic — what one reads as the rule, the other reads as negotiable.",
  },
};

const OBSERVABLE_EFFECT: Partial<Record<PlanetKey, { easy: string; hard: string }>> = {
  sun: {
    easy: "Decisions accelerate. Leadership moves naturally between both systems. Creative authority compounds without territorial conflict.",
    hard: "Authority becomes unclear. Two competing visions slow the decision point. Execution fragments when both systems move toward the same phase simultaneously.",
  },
  moon: {
    easy: "Communication compresses naturally. Conflict de-escalates quickly. Recalibration requires less energy.",
    hard: "Miscommunication compounds. Emotional misreads accumulate. Recalibration consumes bandwidth that should be directed toward the work.",
  },
  mercury: {
    easy: "Information bridges cleanly. Revision cycles shorten. Shared documentation becomes a reliable anchor rather than a contested artifact.",
    hard: "Information arrives but does not translate intact. Revision cycles lengthen. Assumptions accumulate on both sides before anyone names them.",
  },
  venus: {
    easy: "Quality benchmarks align naturally. Investment decisions resolve quickly. Scope creep decreases because both systems agree on what matters.",
    hard: "Standard debates repeat. Completion thresholds shift. Output fluctuates between two different definitions of ready.",
  },
  mars: {
    easy: "Momentum compounds. Execution sequences naturally. Force is not wasted on negotiating who moves first.",
    hard: "Execution bottlenecks appear at every launch point. Both systems initiate simultaneously, creating duplication and dispersed force.",
  },
  jupiter: {
    easy: "Growth compounds steadily. Scale decisions resolve without extended debate. Ambition is shared rather than competed over.",
    hard: "The boundary of what is viable shifts constantly. One partner extends beyond the other's threshold. Overextension becomes a recurring pattern.",
  },
  saturn: {
    easy: "Structure holds under pressure. Timelines are honored. Accountability distributes without generating resentment.",
    hard: "Structural drift accumulates. Authority over the timeline becomes unclear. Accountability gaps appear precisely where the work is most fragile.",
  },
};

const RECOMMENDATION: Partial<Record<PlanetKey, { easy: string; hard: string }>> = {
  sun: {
    easy: "Designate shared territory explicitly — even natural alignment benefits from named ownership before the work begins.",
    hard: "Assign each person a specific creative domain with clear authority before any shared project launches.",
  },
  moon: {
    easy: "Use your natural attunement as a diagnostic tool — when mutual calibration breaks down, treat it as an early operational warning.",
    hard: "Open every high-stakes working session by naming the current state out loud before it invisibly shapes what follows.",
  },
  mercury: {
    easy: "Formalize your shared language in documentation so it remains accessible to others who eventually join the work.",
    hard: "Treat written clarity as the default — no decision should be considered final until both parties have confirmed it in writing.",
  },
  venus: {
    easy: "Set a shared quality standard at the beginning of each project before allowing it to be defined by whoever speaks first.",
    hard: "Define what complete looks like before work begins — otherwise the two definitions will collide at the moment of delivery.",
  },
  mars: {
    easy: "Establish a clear initiative sequence at project launch so natural synchrony does not turn into invisible duplication.",
    hard: "Assign one person to launch and the other to execute — never allow both to initiate the same phase simultaneously.",
  },
  jupiter: {
    easy: "Periodically pressure-test growth assumptions — shared ambition can become a shared blind spot if it is never challenged.",
    hard: "Set a defined ceiling for expansion before the project begins — without a shared maximum, one system will consistently push past the other's viable threshold.",
  },
  saturn: {
    easy: "Periodically audit your shared structure — aligned authority benefits from deliberate maintenance to prevent accumulated drift.",
    hard: "Appoint one person as keeper of the structural framework — divided authority over timelines and standards will quietly fracture the foundation.",
  },
};

const EXPERIMENT: Partial<Record<PlanetKey, string>> = {
  sun: "Each person independently writes their vision of the final outcome before any verbal discussion. Compare the two documents, identify where they align and where they diverge, and determine which differences require resolution before the work can begin.",
  moon: "At the start of your next three working sessions, each person shares one sentence naming their current state before any agenda is addressed. Track whether this changes the quality of what follows.",
  mercury: "Run your next planning meeting in writing only — no verbal discussion until both have documented their perspective. Compare the written versions and identify where information failed to transfer intact.",
  mars: "For the next shared project phase, assign one person as initiator and the other as executor. Track whether output volume or quality changes when force is channeled in sequence rather than in parallel.",
  venus: "Before your next deliverable, each person independently defines what complete looks like. Share the definitions, reconcile the gaps, and confirm the shared threshold before any further work proceeds.",
  jupiter: "Identify your largest current ambition. Each person independently writes the version of it they would commit full resources to. Compare the two documents for scale alignment and negotiate the shared parameter.",
  saturn: "Write down who currently owns the timeline, who owns the quality standard, and who holds the final decision authority. If any of these lacks a clear owner, assign one before the next project begins.",
};

// ─── Sign relationship helpers ────────────────────────────────────────────────

interface Rel {
  clause: string;
  easy: boolean;
  type: string;
}

function signRel(aIdx: number, bIdx: number): Rel {
  const A = SIGNS[aIdx];
  const B = SIGNS[bIdx];
  const raw = Math.abs(aIdx - bIdx);
  const dist = Math.min(raw, 12 - raw);
  switch (dist) {
    case 0:
      return { clause: "share the exact same sign", easy: true, type: "Conjunction" };
    case 2:
      return { clause: `form a sextile — different elements (${A.element} and ${B.element}) that cooperate naturally`, easy: true, type: "Sextile" };
    case 3:
      return { clause: `are in a square — both ${A.modality} signs that share an initiating drive, but pull it through incompatible elements (${A.element} vs ${B.element})`, easy: false, type: "Square" };
    case 4:
      return { clause: `form a trine through the ${A.element} element — the same elemental nature creates natural resonance`, easy: true, type: "Trine" };
    case 6:
      return { clause: `sit directly opposite each other across the zodiac — complementary poles on the ${A.modality} axis`, easy: false, type: "Opposition" };
    default:
      return { clause: `operate at an oblique angle that requires deliberate translation between ${A.element} and ${B.element}`, easy: false, type: "Quincunx" };
  }
}

function sig(x: CrossAspect): string {
  return `${x.a}-${x.b}-${x.type}`;
}

// ─── Health indicator ─────────────────────────────────────────────────────────

function healthIndicator(rel: Rel, hardContact: boolean): string {
  if (rel.type === "Conjunction" && !hardContact) return "Excellent";
  if (rel.type === "Trine" && !hardContact) return "Strong";
  if (rel.type === "Sextile" && !hardContact) return "Strong";
  if (rel.easy && !hardContact) return "Balanced";
  if (rel.easy && hardContact) return "Balanced";
  if (!rel.easy && !hardContact) return "Developing";
  return "Fragile";
}

// ─── Planet pair note builder ─────────────────────────────────────────────────

const FLAVOR: Partial<Record<PlanetKey, { easy: string; hard: string }>> = {
  sun: {
    easy: "your core directives align — leadership can pass naturally without sparking territorial conflict.",
    hard: "you each carry a distinct, unyielding vision of what the work should be. Establish clear domains of authority before you begin.",
  },
  moon: {
    easy: "you read each other's internal state with ease, creating a steady baseline of mutual calibration.",
    hard: "you interpret experience on entirely different frequencies. State the obvious out loud instead of relying on intuition.",
  },
  mercury: {
    easy: "ideas bridge the gap between you intact, making the collaboration feel like a shared language.",
    hard: "you map thinking through different structures. Default to written clarity before treating any decision as final.",
  },
  venus: {
    easy: "your standards harmonize naturally — you rarely have to debate what counts as good enough.",
    hard: "you anchor value in different places. Define your quality metric together before you start measuring the work.",
  },
  mars: {
    easy: "your tempos sync up naturally — combined effort compounds rather than scatters.",
    hard: "you both instinctively want the wheel. Hand one of you the launch and the other the execution rather than driving the same car.",
  },
  jupiter: {
    easy: "you share a compatible sense of scale — plans expand without either feeling dragged along.",
    hard: "one of you consistently pushes for a larger horizon. Set the parameters of your ambition before momentum makes the choice.",
  },
  saturn: {
    easy: "you align on the necessity of structure — the framework holds without relitigating the rules.",
    hard: "you hold responsibility differently. Designate who owns the timeline and the final decision to prevent structural drift.",
  },
};

function planetNote(
  key: PlanetKey,
  aIdx: number,
  bIdx: number,
  nameA: string,
  nameB: string,
  cross: CrossAspect[],
  used: Set<string>
): { note: string; rel: Rel; hardContact: boolean } {
  const exact = cross.find((x) => x.a === key && x.b === key && !used.has(sig(x)));
  const rel = aspectRelationship(exact, aIdx, bIdx);
  const aSign = SIGNS[aIdx].name;
  const bSign = SIGNS[bIdx].name;

  const involving = cross.filter(
    (x) => (x.a === key || x.b === key) && !used.has(sig(x))
  );
  const hard = involving.filter((x) => CHALLENGING.includes(x.type)).sort((m, n) => m.orb - n.orb)[0];
  const soft = involving.filter((x) => HARMONIOUS.includes(x.type)).sort((m, n) => m.orb - n.orb)[0];
  const chosen = exact ?? hard ?? soft;

  let crossClause = "";
  let hardContact = false;
  if (chosen) {
    used.add(sig(chosen));
    hardContact = CHALLENGING.includes(chosen.type);
    crossClause = exact
      ? ` The exact cross-chart contact is ${pointLabel(nameA, chosen.a)} ${SYNASTRY_ASPECT_WORD[chosen.type]} ${pointLabel(nameB, chosen.b)} at ${chosen.orb}° orb.`
      : ` A supporting contact is ${pointLabel(nameA, chosen.a)} ${SYNASTRY_ASPECT_WORD[chosen.type]} ${pointLabel(nameB, chosen.b)} at ${chosen.orb}° orb.`;
  }

  const isHard = hardContact || !rel.easy;
  const flavor = FLAVOR[key]?.[isHard ? "hard" : "easy"] ?? "";

  const planetName = PLANET_META[key].name;
  const note = `Regarding ${PAIR_LENS[key]}: ${nameA}'s ${planetName} and ${nameB}'s ${planetName} ${rel.clause}.${crossClause} ${nameA}'s ${planetName} is in ${aSign} and ${nameB}'s is in ${bSign}. In practice, ${flavor}`;

  return { note, rel, hardContact };
}

function matrixPointPosition(
  reading: Reading,
  key: SynastryPointKey,
): { signIndex: number; degree: number; minute: number } {
  if (key === "ascendant") return reading.chart.ascendant;
  return reading.chart.positions[key];
}

function matrixPlacement(reading: Reading, key: SynastryPointKey): string {
  const pos = matrixPointPosition(reading, key);
  const signName = SIGNS[pos.signIndex].name;
  return `${signName} ${pos.degree}°${String(pos.minute).padStart(2, "0")}′`;
}

function matrixInterpretation(
  aspect: CrossAspect,
  nameA: string,
  nameB: string,
): Pick<SynastryMatrixEntry, "interpretation" | "observableEffect" | "recommendation"> {
  const aLens = pointLens(aspect.a);
  const bLens = pointLens(aspect.b);
  const aPoint = pointName(aspect.a);
  const bPoint = pointName(aspect.b);
  const subject = `${nameA}'s ${aPoint} and ${nameB}'s ${bPoint}`;

  const templates: Record<string, { interpretation: string; observableEffect: string; recommendation: string }> = {
    conjunction: {
      interpretation: `${subject} operate through one channel: ${aLens} meets ${bLens} without much separation. The contact intensifies whatever it touches, so shared momentum is available but differentiation matters.`,
      observableEffect: "The two functions become noticeable in the same moments. Decisions can accelerate, but the partnership may confuse agreement with fusion.",
      recommendation: "Name what each person is contributing before deciding together; preserve distinct ownership inside the shared impulse.",
    },
    sextile: {
      interpretation: `${subject} create a usable opening between the ${aLens} function and the ${bLens} function. The contact is supportive when you choose to activate it rather than waiting for harmony to do the work.`,
      observableEffect: "A practical bridge appears between different instincts. Collaboration improves when one person deliberately invites the other's function into the process.",
      recommendation: "Create a repeatable handoff where this contact can be used intentionally instead of relying on spontaneous compatibility.",
    },
    trine: {
      interpretation: `${subject} move through a naturally compatible relationship between the ${aLens} function and the ${bLens} function. The ease is genuine, but anything effortless can remain unexamined.`,
      observableEffect: "Coordination feels immediate and effort compounds. The hidden risk is allowing a shared assumption to pass without being tested.",
      recommendation: "Use the ease to build something specific, then periodically question the assumption that makes the exchange feel obvious.",
    },
    square: {
      interpretation: `${subject} generate friction between the ${aLens} function and the ${bLens} function. Neither function is defective; the partnership is being asked to give two strong operating principles a clear structure.`,
      observableEffect: "The same decision point can produce competing impulses, repeated correction, or a contest over whose timing and method leads.",
      recommendation: "Separate the contested functions into explicit roles, sequence, or decision rights before pressure turns into personal conflict.",
    },
    opposition: {
      interpretation: `${subject} stand across from each other, making the difference between the ${aLens} function and the ${bLens} function impossible to ignore. This can become complementarity only when both sides remain visible.`,
      observableEffect: "One person may experience the other as an external counterweight, mirror, or challenge. Balance is lost when either side tries to eliminate the difference.",
      recommendation: "Let each function state what it sees before choosing a direction; build a third option from the tension rather than forcing one side to surrender.",
    },
    quincunx: {
      interpretation: `${subject} require ongoing translation between the ${aLens} function and the ${bLens} function. The contact does not resolve through instinctive agreement; it asks for repeated adjustment.`,
      observableEffect: "Small mismatches accumulate in timing, expectations, or language until someone makes the hidden difference explicit.",
      recommendation: "Use short recalibration checkpoints and define the terms of the exchange before either person assumes the other has understood.",
    },
  };

  return templates[aspect.type];
}

function buildSynastryMatrix(
  cross: CrossAspect[],
  a: Reading,
  b: Reading,
  nameA: string,
  nameB: string,
): SynastryMatrixEntry[] {
  return cross.map((aspect) => ({
    aPoint: pointLabel(nameA, aspect.a),
    bPoint: pointLabel(nameB, aspect.b),
    aspect: aspect.type === "opposition" ? "opposition" : SYNASTRY_ASPECT_WORD[aspect.type],
    orb: aspect.orb,
    aPlacement: matrixPlacement(a, aspect.a),
    bPlacement: matrixPlacement(b, aspect.b),
    ...matrixInterpretation(aspect, nameA, nameB),
  }));
}

// ─── Amplifiers ───────────────────────────────────────────────────────────────

const AMPLIFIER_OUTCOMES: Partial<Record<string, string>> = {
  "sun_moon": "Creative vision and interpretive intelligence align — execution is simultaneously informed by intent and instinct.",
  "sun_mercury": "Essence and communication operate in natural alignment — ideas are expressed as clearly as they are conceived.",
  "sun_mars": "Creative identity and force synchronize — decisions become immediately actionable.",
  "sun_jupiter": "Essence and expansion reinforce each other — what is built tends to outgrow its original scope in a generative direction.",
  "sun_saturn": "Creative authority and structural discipline align — what is built tends to last beyond the conditions that created it.",
  "moon_mercury": "Emotional intelligence and communication flow together — meaning transfers intact without significant loss in translation.",
  "moon_mars": "Instinct and force move in the same direction — response time compresses and decisions carry emotional coherence.",
  "moon_jupiter": "Intuitive reading of opportunity and expansive thinking compound — growth is identified before it becomes visible.",
  "moon_saturn": "Emotional processing and structural discipline complement each other — experience converts efficiently into usable pattern.",
  "mercury_mars": "Communication and force operate in synchrony — ideas move directly into action without unnecessary lag.",
  "mercury_jupiter": "Information processing and expansion thinking align — ideas naturally scale into larger frameworks.",
  "mercury_saturn": "Communication and structural authority cooperate — what is communicated becomes reliably implemented.",
  "venus_jupiter": "Value alignment and expansion thinking reinforce each other — investment decisions tend to compound rather than deplete.",
  "venus_saturn": "Investment discernment and structural discipline align — what is built reflects careful, lasting priorities.",
  "mars_jupiter": "Force and expansion synchronize — what is initiated tends to grow rather than stall at its original scale.",
  "mars_saturn": "Directional force and structural accountability balance each other — execution is both energetic and disciplined.",
  "jupiter_saturn": "Growth ambition and structural discipline calibrate each other — expansion is ambitious but bounded by sustainable frameworks.",
};

const AMPLIFIER_ADVANTAGES: Partial<Record<string, string>> = {
  "sun_mars": "Leadership and initiative are available simultaneously — the collaboration does not need to negotiate between deciding and doing.",
  "sun_jupiter": "Essence naturally scales — this system tends to build things that exceed their original parameters in a generative direction.",
  "mercury_mars": "Communication converts directly to action — information cycles are short and decision lag is minimized.",
  "mercury_saturn": "Documented agreements hold — this system can make and enforce shared standards without recurring negotiation.",
  "venus_jupiter": "Investment naturally compounds — what this system chooses to build tends to generate value beyond its direct scope.",
  "mars_saturn": "This system initiates with energy and sustains with discipline — neither overextension nor stagnation is a persistent risk.",
  "jupiter_saturn": "Growth is ambitious but bounded — this system builds at scale without regularly exceeding its structural capacity.",
};

function buildAmplifier(
  x: CrossAspect,
  nameA: string,
  nameB: string
): Amplifier {
  const aName = pointMetaName(x.a);
  const bName = pointMetaName(x.b);
  const aLens = pointLens(x.a);
  const bLens = pointLens(x.b);
  const aspectWord = SYNASTRY_ASPECT_WORD[x.type];

  const effectDesc: Record<string, string> = {
    trine: "flows naturally and compounds without deliberate effort",
    sextile: "activates productively when consciously engaged",
    conjunction: "operates as a unified force — amplified but requiring differentiation",
  };
  const effect = effectDesc[x.type] ?? "interacts productively";

  const outcomeKey = [x.a, x.b].sort().join("_");
  const outcome =
    AMPLIFIER_OUTCOMES[`${x.a}_${x.b}`] ??
    AMPLIFIER_OUTCOMES[`${x.b}_${x.a}`] ??
    `These two functions reinforce each other — where ${aLens} ${effect}, ${bLens} amplifies the result.`;

  const advantage =
    AMPLIFIER_ADVANTAGES[`${x.a}_${x.b}`] ??
    AMPLIFIER_ADVANTAGES[`${x.b}_${x.a}`] ??
    `Lean on this contact deliberately — it is a reliable internal resource when other functions require more navigation.`;

  return {
    interaction: `${nameA}'s ${aName} ${aspectWord} ${nameB}'s ${bName}`,
    whyItMatters: `The ${aLens} function meets the ${bLens} function in resonant contact — this interaction ${effect}.`,
    observableOutcome: outcome,
    operationalAdvantage: advantage,
  };
}

// ─── Constraints ──────────────────────────────────────────────────────────────

const SOLUTION_BY_PLANET: Partial<Record<PlanetKey, string>> = {
  sun: "When creative visions fracture, carve the endeavor into distinct, undisputed domains so each can lead definitively.",
  moon: "Start heavy sessions with a brief baseline check — name the mood before it invisibly shapes the work.",
  mercury: "Lean heavily on documented decisions; treat shared notes as the bridge between two entirely different mental maps.",
  venus: "Explicitly define ready to ship together at the start, ensuring taste differences are settled before the final hour.",
  mars: "Run your drives in sequence rather than in parallel — let one initiate and the other conclude, avoiding direct collision.",
  jupiter: "Calibrate the size of the bet intentionally: agree on what constitutes too big before momentum makes the choice.",
  saturn: "Appoint a single keeper of the frame — divided authority over deadlines and standards will quietly fracture the foundation.",
};

function buildConstraint(
  x: CrossAspect,
  nameA: string,
  nameB: string
): Constraint {
  const aName = pointMetaName(x.a);
  const bName = pointMetaName(x.b);
  const aLens = pointLens(x.a);
  const bLens = pointLens(x.b);
  const aspectWord = SYNASTRY_ASPECT_WORD[x.type];

  const typeDesc: Record<string, string> = {
    square: "generates productive friction between",
    opposition: "creates structural tension between",
  };
  const verb = typeDesc[x.type] ?? "creates operational friction between";

  const mitigation =
    (x.a !== "ascendant" ? SOLUTION_BY_PLANET[x.a] : undefined) ??
    (x.b !== "ascendant" ? SOLUTION_BY_PLANET[x.b] : undefined) ??
    `Create a clear handoff protocol between the ${aLens} function and the ${bLens} function to prevent cross-interference.`;

  return {
    constraint: `${nameA}'s ${aName} ${aspectWord} ${nameB}'s ${bName}`,
    operationalConsequence: `This aspect ${verb} the ${aLens} function and the ${bLens} function. Left unaddressed, the tension accumulates at their intersection — producing recurring friction rather than directed challenge.`,
    bestMitigation: mitigation,
  };
}

// ─── Emergent system ──────────────────────────────────────────────────────────

function buildEmergentSystem(a: Reading, b: Reading): EmergentSystem {
  const counts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const r of [a, b]) {
    for (const k of CORE) {
      const el = SIGNS[r.chart.positions[k].signIndex].element;
      counts[el] = (counts[el] ?? 0) + 1;
    }
  }
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

  const EMERGENT: Record<string, EmergentSystem> = {
    fire: {
      category: "Movements and Creative Systems",
      description:
        "This collaboration naturally builds movements — not just products or services. The combined force-generating capacity produces work that inspires others to act, believe, or create differently. At its highest expression, this system generates momentum that extends far beyond the original collaboration's scope.",
    },
    earth: {
      category: "Institutions and Lasting Structures",
      description:
        "This collaboration naturally builds institutions — systems designed to persist and compound over time. The combined drive toward quality, material reality, and structural precision produces work that endures. At its highest expression, this system creates infrastructure others come to depend on.",
    },
    air: {
      category: "Educational Systems and Research",
      description:
        "This collaboration naturally builds frameworks of understanding — systems, tools, or bodies of knowledge that allow others to think more clearly. The combined translation capacity and future-oriented thinking produces work that reorganizes how people understand reality. At its highest expression, this system creates ideas that outlast both collaborators.",
    },
    water: {
      category: "Communities and Depth-Based Organizations",
      description:
        "This collaboration naturally builds communities — environments where people feel genuinely seen, supported, and transformed. The combined emotional intelligence and depth-generating capacity produces work that creates belonging at scale. At its highest expression, this system creates the conditions for collective evolution.",
    },
  };

  return EMERGENT[dominant] ?? EMERGENT["air"];
}

// ─── Archetype section ────────────────────────────────────────────────────────

function buildArchetype(a: Reading, b: Reading, nameA: string, nameB: string) {
  const same = a.primary.name === b.primary.name;
  const lineA = a.primary.line.replace(/\.$/, "");
  const lineB = b.primary.line.replace(/\.$/, "");
  return {
    a: a.primary.name,
    b: b.primary.name,
    paragraphs: [
      `${nameA} operates fundamentally as ${a.primary.name} — the one who ${lineA}. ${nameB} moves through the work as ${b.primary.name} — the one who ${lineB}.`,
      same
        ? `Sharing a primary archetype signifies that you perceive the work through an identical lens. This is a profound accelerant — and a hidden trap. You will naturally reinforce each other's blind spots. Deliberately assign ownership of the functions neither of you gravitates toward.`
        : `Because your archetypes diverge, each of you inherently covers a stage of the creation cycle that the other might under-serve. This collaboration thrives when you stop competing to control the same steps and instead hand the momentum forward — allowing ${a.primary.name}'s function to feed ${b.primary.name}'s domain and vice versa.`,
    ],
  };
}

// ─── Predicted creation cycle ─────────────────────────────────────────────────

function localSignName(r: Reading, k: PlanetKey): string {
  return SIGNS[r.chart.positions[k].signIndex].name;
}

function healthToStrength(h: string): number {
  return h === "Excellent" ? 4 : h === "Strong" ? 3 : h === "Balanced" ? 2 : h === "Developing" ? 1 : 0;
}

function buildPredictedCycle(
  a: Reading,
  b: Reading,
  pairs: PlanetPairNote[],
  nameA: string,
  nameB: string
): PredictedCycle {
  const pairMap = Object.fromEntries(pairs.map((p) => [p.key, p]));

  const marsPair = pairMap["mars"];
  const mercPair = pairMap["mercury"];
  const jupPair = pairMap["jupiter"];
  const satPair = pairMap["saturn"];

  const marsStrength = healthToStrength(marsPair?.healthIndicator ?? "Balanced");
  const satStrength = healthToStrength(satPair?.healthIndicator ?? "Balanced");

  const sorted = [...pairs].sort((a, b) => healthToStrength(b.healthIndicator) - healthToStrength(a.healthIndicator));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const archA = a.primary.name;
  const archB = b.primary.name;
  const sameArch = archA === archB;

  return {
    ignition:
      marsStrength >= 3
        ? `Ignition happens quickly and naturally. Both ${nameA} and ${nameB} carry compatible force-generating mechanisms — the collaboration tends to launch with clear momentum rather than requiring extended runway.`
        : `Ignition requires deliberate sequencing. Both ${nameA} and ${nameB} carry distinct initiative styles — designate who initiates each phase before the project launches, or force will cancel itself at the starting point.`,

    translation: `${nameA}'s ${localSignName(a, "mercury")} Mercury and ${nameB}'s ${localSignName(b, "mercury")} Mercury ${
      mercPair && healthToStrength(mercPair.healthIndicator) >= 2
        ? "translate information through compatible mechanisms — ideas bridge between both systems with minimal loss in transit. Document decisions anyway to extend this clarity to others."
        : "translate information differently — allow additional cycles for communication to bridge between two distinct reasoning architectures, and treat no decision as final until both parties have confirmed it in writing."
    }`,

    execution: `Execution is most effective when force is allocated in sequence rather than in parallel. ${nameA} governs the phases that draw on their natural creative function; ${nameB} operates most effectively in the phases that match their native domain. Handing the work between these two systems at each threshold — rather than shadowing each other throughout — is where this collaboration gains the most efficiency.`,

    expansion:
      jupPair && healthToStrength(jupPair.healthIndicator) >= 3
        ? `Expansion is a natural phase for this collaboration — the Jupiter alignment accelerates growth without requiring additional structural effort. The primary risk is over-expansion: the natural momentum of this system tends to exceed deliberately set parameters. Set a ceiling before entering this phase.`
        : `Expansion requires deliberate calibration. The Jupiter contact introduces friction around scale decisions — one system pushes further than the other considers viable. Set explicit growth parameters before entering this phase and revisit them at each major threshold.`,

    preservation:
      satStrength >= 3
        ? `Preservation is structurally supported — the Saturn alignment means the framework holds under pressure without requiring constant reinforcement. The long-range architecture of this collaboration is a genuine operational asset.`
        : `Preservation requires active maintenance. The Saturn contact introduces structural negotiation. Designate a keeper of the framework before the preservation phase begins — or the architecture will quietly drift under the weight of ongoing momentum.`,

    naturalAccelerator: `The ${PLANET_META[best.key].name} function — ${PAIR_LENS[best.key]} — is the natural accelerator of this collaboration. Where these two systems interact most cleanly, momentum compounds without requiring deliberate effort.`,

    naturalStall: `The ${PLANET_META[worst.key].name} function — ${PAIR_LENS[worst.key]} — is where momentum most frequently stalls. This is the intersection that requires the most deliberate management and clear ownership.`,

    handoff: sameArch
      ? `Because both ${nameA} and ${nameB} share the same dominant creative function, consciously assign ownership of the stages neither naturally gravitates toward. Identical instincts create identical blind spots — and the creation cycle will break down precisely at the functions both of you default away from.`
      : `${nameA}'s system excels at the stages that require its native function; ${nameB}'s picks up where that function reaches its productive limit. The most effective handoff happens at the completion of each major threshold — not during it.`,
  };
}

// ─── Experimental summary ─────────────────────────────────────────────────────

function buildExperimentalSummary(
  good: number,
  hard: number,
  nameA: string,
  nameB: string,
  pairs: PlanetPairNote[]
): ExperimentalSummary {
  const climate =
    good >= hard * 2 ? "Warm" :
    good > hard ? "Catalytic" :
    good === hard ? "Balanced" :
    hard >= good * 2 ? "Volatile" :
    "High-pressure";

  const sorted = [...pairs].sort((a, b) => healthToStrength(b.healthIndicator) - healthToStrength(a.healthIndicator));
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const CLIMATE_DESCRIPTIONS: Record<string, { left: string; built: string }> = {
    "Warm": {
      left: `Left unconscious, this collaboration coasts. The natural ease generates momentum without discipline — and momentum without intention builds impressive structure in the wrong direction.`,
      built: `Built intentionally, this system becomes one of the most productive creative partnerships available. The ease is not the gift. The ease is the raw material that intentional design turns into compound output.`,
    },
    "Catalytic": {
      left: `Left unconscious, the energy generates activity without accumulation. Both systems produce — but the outputs don't compound because the handoffs haven't been defined.`,
      built: `Built intentionally, this collaboration converts its natural momentum into directed consequence. The catalytic quality means this system accelerates what other partnerships must sustain through effort alone.`,
    },
    "Balanced": {
      left: `Left unconscious, this collaboration hovers in equilibrium — producing steadily but rarely reaching the threshold of compounding output. Balance without direction is stability without growth.`,
      built: `Built intentionally, the equilibrium becomes a structural advantage — a collaboration that can sustain both pressure and ease without destabilizing in either direction.`,
    },
    "High-pressure": {
      left: `Left unconscious, the friction accumulates until it becomes systemic. What begins as productive tension becomes recurring conflict that drains the energy that should go toward the work.`,
      built: `Built intentionally, the pressure becomes the engine. Every constraint this system navigates consciously becomes a refinement mechanism. High-pressure collaborations that survive their friction points produce the most durable work.`,
    },
    "Volatile": {
      left: `Left unconscious, this collaboration becomes corrosive. The intensity of the contact points generates as much heat as it does momentum — and unmanaged heat destroys structure before it can compound.`,
      built: `Built intentionally, this is one of the most generative systems available. Volatility addressed head-on produces breakthroughs that balanced collaborations cannot reach. The question is never whether the pressure is real — it is whether the system has been designed to channel it.`,
    },
  };

  const cd = CLIMATE_DESCRIPTIONS[climate] ?? CLIMATE_DESCRIPTIONS["Balanced"];

  return {
    climate,
    primaryStrength: `The ${PLANET_META[strongest.key].name} function — ${PAIR_LENS[strongest.key]} — is the most naturally aligned point in this system. This is where the collaboration generates output without needing to overcome structural resistance.`,
    primaryChallenge: `The ${PLANET_META[weakest.key].name} function — ${PAIR_LENS[weakest.key]} — is the most persistent point of operational friction. This is where the system loses momentum it has to rebuild rather than compound.`,
    greatestOpportunity: `The ${good} harmonious contacts across the seven functions create a reliable internal circuit — a system that, when deliberately activated, produces output that neither ${nameA} nor ${nameB} would generate alone.`,
    greatestRisk: `The ${hard} challenging contacts represent engineering constraints rather than flaws. Left unaddressed, they will consistently reclaim energy that should be directed toward the work. Addressed explicitly, they become the friction that refines the output.`,
    leftUnconscious: cd.left,
    builtIntentionally: cd.built,
  };
}

// ─── Executive summary ────────────────────────────────────────────────────────

function buildExecutiveSummary(
  pairs: PlanetPairNote[],
  nameA: string,
  nameB: string,
  climate: string
): ExecutiveSummary {
  const sorted = [...pairs].sort((a, b) => healthToStrength(b.healthIndicator) - healthToStrength(a.healthIndicator));
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const LEVERAGE_BY_WEAKEST: Partial<Record<PlanetKey, string>> = {
    sun: "Define creative domains explicitly before each project begins — who owns what, who holds the final authority, and what the shared vision actually is. This single structural adjustment eliminates the category of friction that consumes the most operational bandwidth.",
    moon: "Build a brief calibration ritual at the start of every high-stakes working session. Name states. Check alignment. The cost is two minutes. The return is the elimination of compounding misread that otherwise accumulates invisibly across weeks.",
    mercury: "Default to written documentation for every consequential decision. This is not a communication style preference — it is the primary structural intervention that closes the gap between two different reasoning architectures.",
    venus: "Set quality and completion thresholds explicitly before work begins. The definition of done should never be discovered at the moment of delivery.",
    mars: "Assign initiative and execution to different people at each project phase. Never allow both systems to occupy the same functional position simultaneously.",
    jupiter: "Set a defined growth ceiling before each expansion phase. One sentence. Agreed upon in advance. This single parameter prevents the most common form of overextension in this system.",
    saturn: "Name one keeper of the structural framework. One owner of the timeline. One holder of the final decision authority. Distribute them if needed — but never leave any of them unassigned.",
  };

  const leverage =
    LEVERAGE_BY_WEAKEST[weakest.key] ??
    `Address the ${PLANET_META[weakest.key].name} function explicitly — it is the primary operational constraint and the point where the highest return on structural investment is available.`;

  const POTENTIAL_BY_CLIMATE: Record<string, string> = {
    Warm: `When operating intentionally, this system builds at the intersection of ease and precision — a rare combination that produces work of lasting quality without the friction cost that most high-output collaborations carry.`,
    Catalytic: `When operating intentionally, this system generates compounding output — each phase accelerates the next rather than consuming the momentum of what came before.`,
    Balanced: `When operating intentionally, this system sustains what high-pressure collaborations cannot — an architecture that holds through difficulty without requiring constant structural repair.`,
    "High-pressure": `When operating intentionally, this system produces work that only pressure can forge — a creative output with a structural depth that comfortable collaborations cannot reach.`,
    Volatile: `When operating intentionally, this system becomes one of the most powerful creative engines available. Its highest expression is not merely the work it produces — it is the standard the work sets for what is possible.`,
  };

  return {
    definingStrength: `The defining strength of this laboratory is the ${PLANET_META[strongest.key].name} function — where these two blueprints interact most cleanly and where combined output exceeds what either system produces independently.`,
    definingLimitation: `The defining limitation is the ${PLANET_META[weakest.key].name} function — the operational constraint that, if left unnamed, will consistently reclaim the momentum this system builds elsewhere.`,
    highestLeverage: leverage,
    longTermPotential: POTENTIAL_BY_CLIMATE[climate] ?? POTENTIAL_BY_CLIMATE["Balanced"],
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function compareCharts(a: Reading, b: Reading): Comparison {
  const nameA = a.chart.input.name?.trim() || "Person A";
  const nameB = b.chart.input.name?.trim() || "Person B";
  const cross = crossAspects(
    a.chart.positions,
    b.chart.positions,
    a.chart.ascendant,
    b.chart.ascendant,
  );
  const good = cross.filter((x) => HARMONIOUS.includes(x.type)).length;
  const hard = cross.filter((x) => CHALLENGING.includes(x.type)).length;
  const synastryMatrix = buildSynastryMatrix(cross, a, b, nameA, nameB);

  const used = new Set<string>();
  const planetPairs: PlanetPairNote[] = CORE.map((key) => {
    const aIdx = a.chart.positions[key].signIndex;
    const bIdx = b.chart.positions[key].signIndex;
    const { note, rel, hardContact } = planetNote(key, aIdx, bIdx, nameA, nameB, cross, used);
    const isHard = hardContact || !rel.easy;

    return {
      key,
      aSign: SIGNS[aIdx].name,
      bSign: SIGNS[bIdx].name,
      relationshipType: rel.type,
      question: FUNCTION_QUESTION[key] ?? "",
      note,
      reactionState: REACTION_STATE[key]?.[isHard ? "hard" : "easy"] ?? (isHard ? "Reactive" : "Stable"),
      reactionReason: REACTION_REASON[key]?.[isHard ? "hard" : "easy"] ?? "",
      observableEffect: OBSERVABLE_EFFECT[key]?.[isHard ? "hard" : "easy"] ?? "",
      recommendation: RECOMMENDATION[key]?.[isHard ? "hard" : "easy"] ?? "",
      experiment: EXPERIMENT[key] ?? "",
      healthIndicator: healthIndicator(rel, hardContact),
    };
  });

  // Amplifiers from harmonious cross-aspects
  const harmPool = cross.filter((x) => HARMONIOUS.includes(x.type) && !used.has(sig(x)));
  const harmSource = harmPool.length ? harmPool : cross.filter((x) => HARMONIOUS.includes(x.type));
  const amplifiers: Amplifier[] = harmSource
    .slice(0, 4)
    .map((x) => buildAmplifier(x, nameA, nameB));

  const ampFallback: Amplifier[] = amplifiers.length ? amplifiers : [{
    interaction: "No tight harmonious cross-contacts detected",
    whyItMatters: "Any ease this collaboration establishes must be built deliberately rather than arriving from natural alignment.",
    observableOutcome: "Workflow efficiency requires deliberate structural design rather than natural synchrony.",
    operationalAdvantage: "What this system builds through conscious design will be structurally stronger than ease produced by natural alignment alone.",
  }];

  // Constraints from challenging cross-aspects
  const fricPool = cross.filter((x) => CHALLENGING.includes(x.type) && !used.has(sig(x)));
  const fricSource = fricPool.length ? fricPool : cross.filter((x) => CHALLENGING.includes(x.type));
  const constraints: Constraint[] = fricSource
    .slice(0, 4)
    .map((x) => buildConstraint(x, nameA, nameB));

  const constraintFallback: Constraint[] = constraints.length ? constraints : [{
    constraint: "No tight challenging cross-contacts detected",
    operationalConsequence: "Friction will arise from differing paces and habits rather than from deep structural incompatibilities — harder to name but easier to address.",
    bestMitigation: "Name operational differences explicitly rather than waiting for them to produce visible friction.",
  }];

  const archetype = buildArchetype(a, b, nameA, nameB);
  const emergentSystem = buildEmergentSystem(a, b);
  const predictedCycle = buildPredictedCycle(a, b, planetPairs, nameA, nameB);
  const experimentalSummary = buildExperimentalSummary(good, hard, nameA, nameB, planetPairs);
  const executiveSummary = buildExecutiveSummary(planetPairs, nameA, nameB, experimentalSummary.climate);

  const climateDesc =
    good > hard
      ? `The laboratory runs ${experimentalSummary.climate.toLowerCase()} — ${good} harmonious contacts against ${hard} difficult ones. Momentum is relatively accessible; the primary risk is the complacency that natural ease produces.`
      : hard > good
      ? `The laboratory runs ${experimentalSummary.climate.toLowerCase()} — ${hard} difficult contacts against ${good} harmonious ones. This produces an exceptionally generative dynamic when addressed head-on, and a corrosive one if left unspoken.`
      : `The laboratory runs ${experimentalSummary.climate.toLowerCase()} — ${good} harmonious contacts against ${hard} difficult ones. This precise equilibrium tends to forge the most enduring collaborative bonds when structured deliberately.`;

  const summary = [
    `Two distinct blueprints placed on the same workbench. Astral Forge maps ${nameA} and ${nameB} through the functional Lab layer and the complete sidereal synastry field — including both Ascendants, all ten planetary points, exact aspects, and orbs — to reveal how the relationship operates when you build together.`,
    climateDesc,
  ];

  return {
    nameA,
    nameB,
    summary,
    experimentalSummary,
    planetPairs,
    synastryMatrix,
    archetype,
    amplifiers: ampFallback,
    constraints: constraintFallback,
    emergentSystem,
    predictedCycle,
    executiveSummary,
  };
}
