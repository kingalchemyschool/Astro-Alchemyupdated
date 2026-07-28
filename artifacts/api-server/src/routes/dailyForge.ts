import { Router } from "express";
import rateLimit from "express-rate-limit";
import { verifyStripeToken } from "./stripe.js";
import { logger } from "../lib/logger.js";

const router = Router();
const isDev = process.env.NODE_ENV !== "production";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanetKey =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";

type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

interface PlanetSummary {
  signIndex: number;
  degree: number;
  minute?: number;
  house: number;
  retrograde?: boolean;
  longitude: number;
}

interface TransitAspect {
  transitPlanet: PlanetKey;
  natalPlanet: PlanetKey;
  type: AspectType;
  orb: number;
  score: number;
}

interface DailyForgeRequest {
  token: string;
  natal: {
    name?: string;
    positions: Record<PlanetKey, PlanetSummary>;
    ascendant: { signIndex: number; degree: number };
    zodiac: string;
  };
  transits: {
    date: string;
    positions: Record<PlanetKey, PlanetSummary>;
    aspects: TransitAspect[];
    zodiac: string;
  };
}

export interface ForgeReport {
  date: string;
  zodiac: "tropical" | "sidereal";
  referenceTime: string;
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
  celestialField: Array<{
    planetaryAspect: string;
    transitPlacement: string;
    natalPlacement: string;
    houseActivation: string;
    coreFunctionActivated: string;
  }>;
  todaysTheme: string;
  celestialState: string;
  blueprintActivation: string;
  whatIsBeingRefined: string;
  forgePrinciple: string;
  journalPrompt: string;
  dailyApplication: string;
  closingReflection: string;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry { date: string; report: ForgeReport; }
const reportCache = new Map<string, CacheEntry>();

/** Stable fingerprint of the natal chart so two different charts for the same
 *  token on the same day each get their own cache slot. Uses sun, moon, and
 *  ascendant — enough to distinguish virtually any two birth charts. */
function natalFingerprint(natal: DailyForgeRequest["natal"]): string {
  const sun = natal.positions.sun;
  const moon = natal.positions.moon;
  const asc = natal.ascendant;
  return [
    sun?.longitude?.toFixed(6) ?? "0",
    moon?.longitude?.toFixed(6) ?? "0",
    `${asc?.signIndex ?? 0}.${asc?.degree ?? 0}`,
    natal.zodiac,
  ].join(":");
}

const REPORT_VERSION = "activation-v10";

function cacheKey(jti: string, date: string, zodiac: string, natal: DailyForgeRequest["natal"]): string {
  return `${REPORT_VERSION}:${jti}:${date}:${zodiac}:${natalFingerprint(natal)}`;
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const PLANET_NAMES: Record<PlanetKey, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto",
};

// What the planet governs in plain human terms
const PLANET_DOMAIN: Record<PlanetKey, string> = {
  sun:     "your core sense of purpose and how you express who you fundamentally are",
  moon:    "your inner life — how you absorb experience, regulate emotion, and read situations around you",
  mercury: "how you think, communicate, and make sense of information",
  venus:   "what you value, what you are drawn to, and how you create and attract quality",
  mars:    "how you take action, direct your will, and generate momentum",
  jupiter: "how you grow, where you expand, and the beliefs that open or limit your reach",
  saturn:  "the structures you are building, the discipline you are developing, and the foundations that determine long-term capacity",
  uranus:  "your capacity for innovation, pattern disruption, and breakthrough thinking",
  neptune: "how you clear out what is no longer working, develop deeper understanding, and sharpen your view of what is actually in front of you",
  pluto:   "your capacity for fundamental transformation — what must be dismantled so something stronger can be built",
};

// What is being refined (short noun) — picked by natal planet
const REFINEMENT_NOUN: Record<PlanetKey, string[]> = {
  sun:     ["purpose", "authentic expression", "clarity of direction"],
  moon:    ["self-awareness", "emotional regulation", "ability to read situations clearly"],
  mercury: ["precision of thought", "communication", "discernment"],
  venus:   ["value", "quality of attraction", "what you cultivate"],
  mars:    ["decisive action", "momentum", "how you direct your will"],
  jupiter: ["perspective", "the scope of your growth", "your capacity for expansion"],
  saturn:  ["discipline", "structural integrity", "long-term mastery"],
  uranus:  ["innovation", "adaptive thinking", "your capacity for breakthrough"],
  neptune: ["depth of understanding", "clarity beneath the surface", "inner coherence"],
  pluto:   ["depth of engagement", "capacity for real change", "foundational restructuring"],
};

// What this house governs — spelled out fully
const HOUSE_MEANING: Record<number, { short: string; full: string }> = {
  1:  { short: "Identity",       full: "who you are, how you initiate, and how you present yourself to the world" },
  2:  { short: "Value",          full: "what you value, how you generate resources, and your relationship with security and worth" },
  3:  { short: "Communication",  full: "how you think, learn, communicate, and exchange ideas in daily life" },
  4:  { short: "Foundations",    full: "your roots, your inner life, what makes you feel grounded and secure at the deepest level" },
  5:  { short: "Creativity",     full: "your creative expression, what brings you genuine joy, and what you create from the inside out" },
  6:  { short: "Refinement",     full: "your daily systems, your practices of self-improvement, and the rituals that sustain your capacity" },
  7:  { short: "Relationships",  full: "how you relate, what you attract in partnership, and what you offer in close exchange with others" },
  8:  { short: "Transformation", full: "what must change at depth — the parts of your life requiring genuine transformation rather than adjustment" },
  9:  { short: "Expansion",      full: "the beliefs that shape your worldview, your search for meaning, and the direction in which you are growing" },
  10: { short: "Contribution",   full: "your long-term direction, your public contribution, and the reputation you are building through consistent action" },
  11: { short: "Networks",       full: "your communities, your vision for the future, and the people who share or challenge your direction" },
  12: { short: "Integration",    full: "what you are processing beneath the surface — the unseen patterns that shape your experience from within" },
};

// Aspect — what it means experientially
const ASPECT_MEANING: Record<AspectType, {
  mechanism: string;
  experiential: string;
  demand: string;
  doNot: string;
}> = {
  conjunction: {
    mechanism:    "two planetary forces occupying the same point — they merge and amplify each other rather than operating separately",
    experiential: "an intensity of focus in one area of your life that cannot be split between two directions",
    demand:       "direct the combined force — conjunction energy dissipates when scattered but becomes precise when concentrated",
    doNot:        "splitting your attention between this area and everything else, which dilutes the concentrated force available",
  },
  trine: {
    mechanism:    "two planetary forces moving in the same direction — they work together naturally and effort moves between them without resistance",
    experiential: "a quality of ease and natural flow in this area of your life",
    demand:       "direct the flow with intention — the ease supports whatever you choose to build, but offers nothing if you simply observe",
    doNot:        "assuming the ease means no engagement is required — flow without direction is just motion",
  },
  sextile: {
    mechanism:    "two planetary forces in a cooperative position — the path between them is open, but it requires you to take a deliberate first step",
    experiential: "an opening that rewards initiative — the conditions are right, but they need you to move",
    demand:       "initiate something specific in this area rather than waiting for momentum to appear on its own",
    doNot:        "waiting for the right moment — in a sextile, the right moment is now, and passing it is the only way to miss it",
  },
  square: {
    mechanism:    "two planetary forces at a 90-degree angle — neither can operate without creating friction against the other",
    experiential: "productive tension that demands resolution — something in this area of your life cannot be avoided or deferred",
    demand:       "engage directly with what is creating resistance rather than routing around it, because the engagement is the development",
    doNot:        "interpreting the friction as a sign something is wrong — the square's discomfort is not dysfunction, it is development under load",
  },
  opposition: {
    mechanism:    "two planetary forces at maximum distance, pulling in opposite directions — they create contrast rather than conflict",
    experiential: "a heightened clarity about something you cannot see from within your usual perspective",
    demand:       "hold both sides of the tension in view at the same time rather than collapsing into the more comfortable position",
    doNot:        "choosing a side when the real work is holding both — what stands across from you today is not your obstacle, it is your next development",
  },
};

// Moon processing — how today's Moon sign shapes daily experience
const MOON_PROCESSING: Record<string, { style: string; lens: string }> = {
  Aries:       { style: "direct, immediate, and action-oriented",          lens: "responding before reflecting" },
  Taurus:      { style: "steady, grounded, and deliberate",                 lens: "anchoring in what is concrete and reliable" },
  Gemini:      { style: "quick, adaptive, and information-driven",          lens: "gathering input before settling on a direction" },
  Cancer:      { style: "intuitive, protective, and attuned to atmosphere", lens: "reading the emotional landscape before engaging" },
  Leo:         { style: "expressive, engaged, and personally invested",     lens: "connecting experience to self and identity" },
  Virgo:       { style: "analytical, precise, and correction-seeking",      lens: "identifying what needs refinement before moving forward" },
  Libra:       { style: "relational, calibrating, and balance-seeking",     lens: "weighing all sides before committing" },
  Scorpio:     { style: "penetrating, depth-seeking, and emotionally intense", lens: "moving past the surface to find what is actually happening" },
  Sagittarius: { style: "expansive, meaning-driven, and directional",       lens: "connecting today's events to broader purpose" },
  Capricorn:   { style: "disciplined, strategic, and utility-focused",      lens: "filtering experience through long-term value" },
  Aquarius:    { style: "detached, systems-oriented, and pattern-aware",    lens: "observing the structure of what is happening before reacting" },
  Pisces:      { style: "open, absorbing, and emotionally receptive",         lens: "taking in experience from multiple directions at once" },
};

// Blueprint creative function names (per the Astroboros system)
const PLANET_FUNCTION_NAME: Record<PlanetKey, string> = {
  sun:     "Essence",
  moon:    "Perception",
  mercury: "Expression",
  venus:   "Value",
  mars:    "Impact",
  jupiter: "Expansion",
  saturn:  "Foundation",
  uranus:  "Genius",          // octave activator of Mercury / Expression
  neptune: "Dissolution",     // octave activator of Venus / Value
  pluto:   "Regeneration",    // outer octave of Mars / Impact
};

// How each aspect type activates a function
const ASPECT_MODE: Record<AspectType, string> = {
  conjunction: "Concentration",
  trine:       "Alignment",
  sextile:     "Initiative",
  square:      "Resistance",
  opposition:  "Adaptation",
};

// Capitalized aspect labels for display strings
const ASPECT_LABEL_CAP: Record<AspectType, string> = {
  conjunction: "Conjunct",
  sextile:     "Sextile",
  square:      "Square",
  trine:       "Trine",
  opposition:  "Opposition",
};

// Planet glyph symbols
const PLANET_GLYPH: Record<PlanetKey, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

// Human-readable functions for the activation field. These are intentionally
// more concrete than one-word planet keywords: the report should explain what
// a transit is asking the person to notice, not just name a category.
const TRANSIT_FUNCTION: Record<PlanetKey, string> = {
  sun:     "focus on identity, purpose, and creative expression",
  moon:    "emotional weather, instinctive responses, and immediate needs",
  mercury: "conversations, perceptions, and decisions",
  venus:   "attraction, taste, and the signals that shape connection",
  mars:    "urgency, effort, boundaries, and assertion",
  jupiter: "expansion of belief, confidence, and possibility",
  saturn:  "pressure to define standards, commitments, and structure",
  uranus:  "disruption, liberation, and a new way of seeing the pattern",
  neptune: "sensitivity, imagination, and the dissolving of old boundaries",
  pluto:   "pressure to confront what is buried and change it at the root",
};

const NATAL_FUNCTION: Record<PlanetKey, string> = {
  sun:     "your sense of purpose and way of expressing who you are",
  moon:    "your emotional baseline, instinctive responses, and need for safety",
  mercury: "your thinking, language, and way of making meaning",
  venus:   "your values, desires, and way of creating connection",
  mars:    "your will, boundaries, and way of taking action",
  jupiter: "your beliefs, confidence, and capacity for growth",
  saturn:  "your standards, commitments, and long-term structures",
  uranus:  "your originality, freedom, and relationship to change",
  neptune: "your imagination, sensitivity, and ideals",
  pluto:   "your relationship to power, endings, and deep transformation",
};

function activationDescription(aspect: TransitAspect): string {
  const transit = TRANSIT_FUNCTION[aspect.transitPlanet];
  const natal = NATAL_FUNCTION[aspect.natalPlanet];

  switch (aspect.type) {
    case "conjunction":
      return `The current transit brings ${transit} into direct contact with ${natal}. What surfaces wants your full attention rather than a quick reaction.`;
    case "trine":
      return `The current transit lets ${transit} move more easily through ${natal}. The ease is real, but it becomes useful when you turn it into deliberate movement.`;
    case "sextile":
      return `The current transit opens a practical opportunity to develop ${natal} through ${transit}. The opening becomes real when you take a specific step.`;
    case "square": {
      const squareClosings: Partial<Record<PlanetKey, string>> = {
        sun:     "The pressure is clarifying where your sense of purpose has been running on assumption rather than intention.",
        moon:    "The tension is where an instinctive pattern is ready to become more conscious and deliberate.",
        mercury: "The difficulty is sharpening the thinking that still needs more precision.",
        venus:   "What you value is being tested — the test reveals what you actually prioritize.",
        mars:    "The resistance is developing the precision of how you direct your will.",
        jupiter: "The difficulty is the expansion — meeting it at that level is where growth actually happens.",
        saturn:  "The friction is building a foundation that will hold under real pressure.",
        uranus:  "The disruption is clearing what the old pattern can no longer support.",
        neptune: "The tension is dissolving a layer that has been obscuring clearer understanding.",
        pluto:   "What is being pressured is precisely what requires transformation rather than adjustment.",
      };
      const closing = squareClosings[aspect.natalPlanet] ?? "The friction shows where a familiar response is ready to become more capable.";
      return `The current transit puts ${transit} under pressure from ${natal}. ${closing}`;
    }
    case "opposition":
      return `The current transit places ${transit} across from ${natal}. The tension reveals what your usual perspective leaves out.`;
  }
}

const SIGN_QUALITY: Record<string, { brief: string; operative: string }> = {
  Aries:       { brief: "initiating and direct",             operative: "directness and initiative" },
  Taurus:      { brief: "grounded and persistent",           operative: "groundedness and deliberate pace" },
  Gemini:      { brief: "adaptive and connective",           operative: "adaptability and information-gathering" },
  Cancer:      { brief: "intuitive and protective",          operative: "attunement and protective awareness" },
  Leo:         { brief: "expressive and self-directed",      operative: "intentional expression and creative confidence" },
  Virgo:       { brief: "analytical and precision-seeking",  operative: "precision and systematic refinement" },
  Libra:       { brief: "balancing and relational",          operative: "relational awareness and calibration" },
  Scorpio:     { brief: "penetrating and depth-seeking",     operative: "depth of engagement and transformative focus" },
  Sagittarius: { brief: "expansive and directional",         operative: "expansive thinking and directional clarity" },
  Capricorn:   { brief: "structural and long-arc focused",   operative: "discipline and long-term structural thinking" },
  Aquarius:    { brief: "systematic and pattern-breaking",   operative: "innovation and systems-level awareness" },
  Pisces:      { brief: "open and receptive",                operative: "openness and ability to absorb from multiple directions" },
};

// Forge Principles — timeless wisdom, NO astrology/planet/house terms
const FORGE_PRINCIPLES: Record<AspectType, Record<string, string[]>> = {
  conjunction: {
    sun:     ["Clarity of purpose becomes productive only when it is followed without division. Today requires concentration.", "The depth of your focus determines the quality of what you produce — not the force you apply.", "When your direction is clear and your energy is concentrated, very little can resist what you build."],
    moon:    ["How you respond to what happens to you is more powerful than what happens to you. Reading situations clearly is a skill, not a gift.", "The most underestimated ability is the one that shapes how everything else is experienced. Develop that, and you develop everything.", "Awareness that is deliberately built becomes an advantage. Awareness that runs on habit becomes a limitation."],
    mercury: ["The quality of your thinking determines the quality of your decisions before you make them. Precision here is not pedantry — it is leverage.", "What you say shapes what you see. What you see determines what you do. Communication is the beginning of everything.", "Clarity in expression is not a style preference. It is a strategic advantage."],
    venus:   ["You move toward what you value — consciously or not. Knowing what you value is the beginning of directing your own development.", "What you cultivate reflects what you believe you deserve. Both can be deliberately upgraded.", "The quality of what you attract reflects what you consistently demonstrate."],
    mars:    ["Force becomes mastery when it learns where to land.", "Action without direction is energy without return. Precision of aim is what transforms effort into outcome.", "The difference between momentum and chaos is not the amount of force — it is the clarity of the target."],
    jupiter: ["The size of your thinking determines the scale of what you can build. Expand the former before expecting the latter.", "Growth without direction is just movement. Know where you are going before you increase your speed.", "Perspective is not found — it is deliberately cultivated. Expand it the same way you would develop any other capacity."],
    saturn:  ["Structure gives ambition somewhere to stand.", "Discipline is not restriction — it is the architecture that transforms effort into compounding results.", "What you build methodically outlasts what you build quickly. The foundation determines the height."],
    uranus:  ["Disruption without direction is destruction. Innovation with intention is the beginning of a new order.", "The capacity for original thought is most powerful when it is applied to the right problem.", "Breaking patterns is easy. Building something better from the pieces requires more from you."],
    neptune: ["What you work through thoroughly shapes how you see everything after. Development at this level changes what becomes visible to you.", "The subtlest adjustments carry the largest long-term consequences. Attend to what is beneath the surface.", "Letting go of what no longer works is not loss — it is making room for something more solid."],
    pluto:   ["Transformation is not something that happens to you. It is something you participate in — or resist until it happens anyway.", "The strongest structures are built on the ruins of what was honestly outgrown.", "What cannot be reformed must be rebuilt. That is not failure — it is precision."],
  },
  trine: {
    sun:     ["Natural gifts are not accomplishments. What you build with them, consistently and deliberately, is.", "The conditions are right. The question is not whether you can — it is how far you are willing to go.", "When your direction aligns with your capacity, the only variable left is the depth of your commitment."],
    moon:    ["Thinking clearly does not mean thinking easily. Develop both.", "Emotional intelligence is not a fixed trait — it is a practice. Today's clarity is an invitation to develop it further.", "The moments when you read a situation most sharply are the moments most worth paying attention to what it is showing you."],
    mercury: ["When thinking flows naturally, use it to go deeper rather than faster.", "Clarity of mind is a resource. Deploy it on the problems that matter most, not just the ones that are closest.", "Good thinking that stays internal produces nothing. Express it. That is where the value is transferred."],
    venus:   ["Flow is an invitation, not a destination. What you build within it outlasts it.", "When creation feels natural, build something that requires your best — not just your available effort.", "Value is not discovered — it is developed. Use the ease to build something with more precision than you usually allow yourself."],
    mars:    ["Momentum belongs to those who recognize it and move — not those who observe it.", "When action flows without resistance, use that to go further than your default stopping point.", "Natural momentum is a tool. What you build with it is the real test of your capacity."],
    jupiter: ["Expansion that is consciously directed becomes progress. Expansion that is merely experienced becomes scatter.", "When the path is clear, the question is not whether to move — it is how deliberately you will build along the way.", "Perspective that arrives easily is most valuable when it is acted on immediately."],
    saturn:  ["When structure comes naturally today, use it to build something that will hold when conditions are harder.", "Discipline that feels effortless is still discipline. Credit the practice, not just the ease.", "What gets built in aligned conditions lasts. This is the time to lay the foundation, not rest on it."],
    uranus:  ["Innovation is most powerful when the conditions support it. This is the moment to go further than you planned.", "When new thinking arrives naturally, document it, develop it, deploy it. Insight without action dissolves.", "Breakthrough thinking is wasted in the absence of the courage to implement it."],
    neptune: ["Deeper understanding happens when you are willing to stay with something rather than move through it quickly.", "When clarity comes naturally, use it to see something you have been too busy to notice.", "What becomes clear in moments of flow was always true — you were just not in a position to see it."],
    pluto:   ["Transformation is most effective when it is chosen rather than compelled. Today you have the choice.", "When change feels natural, go deeper than the surface adjustment. The opportunity is structural.", "What you build during aligned transformation becomes the new baseline — not a temporary upgrade."],
  },
  sextile: {
    sun:     ["An open door is not the same as a decision. The opportunity belongs to whoever walks through.", "Readiness without action is not preparation — it is hesitation with better vocabulary.", "The right conditions mean nothing without the choice to operate within them."],
    moon:    ["Noticing an opening is not the same as moving through it. Awareness is only half the work.", "What you notice in the space between stimulus and response is the most leveraged place you have.", "The ability to spot an opportunity and act on it before it closes is a trainable skill. Train it today."],
    mercury: ["A good idea that stays internal never becomes leverage. Communicate it — that is where its value is realized.", "Thinking is preparation. The action is what completes the circuit.", "Precision of thought followed by imprecision of action loses most of what the thinking was worth."],
    venus:   ["Quality is not self-sustaining. It requires you to keep choosing it even when easier options are available.", "What you invest in right now, under favorable conditions, compounds faster than at any other time. Act accordingly.", "Attraction follows alignment. Align first — the attraction follows."],
    mars:    ["Opportunity does not wait for certainty. It waits for initiative.", "The difference between the person who acts and the person who is almost ready is not capability — it is timing.", "Momentum begins the moment you move. Not the moment you decide to. Move."],
    jupiter: ["The opening exists. Walking through it is still your decision.", "Growth is not a consequence of thinking about growth. It is a consequence of choosing to grow in a specific direction, now.", "When the conditions expand what is possible, the most productive response is to expand what you attempt."],
    saturn:  ["Structure built during a window of cooperative conditions is harder to build later under resistance. Use this.", "Discipline applied now, when it requires less effort, produces the same compounding return as discipline applied under pressure — with more precision.", "Build the system while it is easy to build. That is how you ensure it holds when it is hard to maintain."],
    uranus:  ["Innovation requires not just the idea but the decision to implement it before the window closes.", "Originality means nothing in isolation. Bring it into the world — that is where it becomes real.", "Breakthrough thinking followed by conventional action produces conventional results. Think and act at the level of the insight."],
    neptune: ["Deeper understanding requires the willingness to stay with something rather than swap it for something easier. This is the moment for that.", "What you allow yourself to fully understand today will shape how you see things long after today.", "The subtlety you are being asked to develop requires only one thing: your sustained attention."],
    pluto:   ["Transformation chosen under favorable conditions is more complete than transformation forced by necessity.", "What you dismantle willingly is done with greater precision than what gets dismantled for you.", "This is the moment to begin the change you have been considering. It will not be more available than it is now."],
  },
  square: {
    sun:     ["What cannot be avoided must be worked through. That is how capacity is built.", "The path of least resistance leads somewhere — just not toward the person you are becoming.", "Pressure reveals what comfort conceals. Both are information. Use the pressure."],
    moon:    ["What you resist processing most is usually what most needs to be processed. The friction is information.", "Emotional clarity is not the absence of difficulty — it is the capacity to remain functional within it.", "The quality of your inner processing determines the quality of every output. Refine it here, under resistance, and it compounds."],
    mercury: ["The thinking that is hardest to complete is often the thinking most worth finishing.", "Precision under pressure is the version of precision that actually matters. Everything else is practice.", "Friction in communication reveals where clarity is still needed. Attend to it rather than around it."],
    venus:   ["What you value is most clearly revealed by what you are willing to work for when it is difficult.", "The quality of what you create reflects the quality of your commitment to it — especially when the process is not easy.", "Value built under resistance holds differently than value built in ease. Both are real. This version is more durable."],
    mars:    ["Friction is not a sign that something is wrong. It is the mechanism by which something becomes stronger.", "The resistance you are encountering is not working against you — it is working on you. Engage with it accurately.", "Development does not require ease. It requires engagement. Stay engaged."],
    jupiter: ["Growth that requires nothing from you produces nothing that changes you.", "The expansion you are being asked to make today is precisely as difficult as it needs to be. Meet it at that level.", "The beliefs that limit your growth are only visible when they are being tested. Pay attention to what is being revealed."],
    saturn:  ["Structure that cannot hold under pressure is not structure — it is decoration. Build the real version.", "Discipline is most valuable precisely when it is most difficult to maintain. That is when the compounding happens.", "What you build under resistance has a different quality than what you build under ease. Both are necessary. Do not avoid this one."],
    uranus:  ["Pattern disruption is uncomfortable by definition. That discomfort is not a reason to stop — it is confirmation that something is actually changing.", "Innovation is easy when the conditions support it. It is most valuable when it is the only way forward.", "The friction you feel is the old pattern resisting replacement. Keep going."],
    neptune: ["What needs to go does not go easily. That is exactly why it requires sustained attention.", "Working through something under pressure is more thorough than working through it in easy conditions. The difficulty is what makes it complete.", "Resistance to deeper understanding is usually the clearest signal that deeper understanding is exactly what is needed."],
    pluto:   ["Transformation is not comfortable. It is not meant to be. It is meant to be complete.", "What is being broken down is not you — it is the version of you that can no longer hold what you are becoming.", "The hardest restructuring is the most honest one. Do not settle for the version that is easier to complete."],
  },
  opposition: {
    sun:     ["The opposite of your current position is not your enemy. It is your next development.", "Clarity is born in contrast. What stands across from you today shows you something you cannot see from where you normally stand.", "Holding both sides is not compromise. It is the ability to keep two truths in view at once without collapsing into either."],
    moon:    ["The tension you feel between two ways of responding is not confusion — it is your thinking expanding past its usual limits.", "What you notice most in contrast is what you have been least able to see head-on. That is the value of the tension.", "The ability to hold two emotional realities at once — without collapsing into one — is one of the most useful things you can develop."],
    mercury: ["Two valid perspectives in direct tension are not a problem to resolve. They are a conversation to complete.", "The clearest thinking often emerges from the willingness to hold a position while genuinely examining its opposite.", "Precision requires the ability to see from more than one angle. The opposition is developing that capacity."],
    venus:   ["What you value becomes clearest when you are asked to choose between it and something else. Pay attention to what you reach for.", "The tension between two things you want is not an obstacle — it is a definition. It shows you which value is primary.", "Quality is revealed in the moment of contrast. What you find yourself unwilling to sacrifice is what you actually value."],
    mars:    ["The tension you feel is not a problem to solve. It is a question to answer — and the answer becomes your direction.", "When two directions are pulling equally, your next level of clarity comes from committing to one while understanding the other.", "Decisive action does not require the absence of tension. It requires the capacity to act within it."],
    jupiter: ["The belief that stands in opposition to your current one is not necessarily wrong — it may be the next step you have not yet taken.", "When your perspective is challenged, you are being offered a larger map. What you do with it determines whether you expand or defend.", "Growth begins where your current way of thinking meets its edge. That is where you are today."],
    saturn:  ["The structure you are being asked to question is only as valuable as its ability to hold what you are building. Test it honestly.", "What stands across from your current approach is not an obstacle — it is the part of the solution you have not yet incorporated.", "Long-term mastery requires the willingness to evaluate your own foundations from the outside. That is what today is asking."],
    uranus:  ["The pattern you are being asked to see from the outside is the one you have been inside of too long to examine clearly.", "Innovation requires the capacity to see your own assumptions as assumptions. The opposition is providing that view.", "What looks like resistance to your breakthrough is often your own prior thinking meeting its limit. Examine both."],
    neptune: ["What you see most clearly from a distance is what you were too close to see straight.", "The tension between going deeper and staying on the surface is not a choice — it is an invitation to develop the ability to do both.", "Understanding grows when opposing realities are held at the same time, not when one of them is dismissed. Start with the one you find most uncomfortable."],
    pluto:   ["The thing that stands most directly across from your current position is the transformation that has been waiting longest.", "Fundamental change does not come from within the current structure — it comes from seeing the structure clearly from outside it.", "What the opposition is revealing cannot be unseen. That is the point. Use it."],
  },
};

// ─── Seeding ──────────────────────────────────────────────────────────────────

function hashSeed(...parts: string[]): number {
  let h = 0;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function sign(index: number): string { return SIGNS[index] ?? "Unknown"; }
function houseOrd(n: number): string {
  const s = ["", "1st", "2nd", "3rd", "4th", "5th", "6th",
    "7th", "8th", "9th", "10th", "11th", "12th"];
  return s[n] ?? `${n}th`;
}
function formatDeg(p: PlanetSummary): string {
  return `${p.degree}° ${sign(p.signIndex)}${p.retrograde ? " Rx" : ""}`;
}

function angularSeparation(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

function expectedAspect(diff: number): { type: AspectType; orb: number } | null {
  const defs: Array<{ type: AspectType; angle: number; orb: number }> = [
    { type: "conjunction", angle: 0, orb: 3 },
    { type: "sextile", angle: 60, orb: 3 },
    { type: "square", angle: 90, orb: 3 },
    { type: "trine", angle: 120, orb: 3 },
    { type: "opposition", angle: 180, orb: 3 },
  ];
  for (const def of defs) {
    const orb = Math.abs(diff - def.angle);
    if (orb <= def.orb) return { type: def.type, orb: Math.round(orb * 10) / 10 };
  }
  return null;
}

/**
 * The browser calculates aspects because it owns the birth input. Validate the
 * supplied list against the supplied longitudes before generating prose so a
 * stale/mixed chart cannot masquerade as a valid report.
 */
function validateTransitAspects(req: DailyForgeRequest): string | null {
  for (const aspect of req.transits.aspects) {
    const transit = req.transits.positions[aspect.transitPlanet];
    const natal = req.natal.positions[aspect.natalPlanet];
    if (!transit || !natal) return `Missing positions for ${aspect.transitPlanet}/${aspect.natalPlanet}.`;
    const expected = expectedAspect(angularSeparation(transit.longitude, natal.longitude));
    if (!expected || expected.type !== aspect.type || Math.abs(expected.orb - aspect.orb) > 0.2) {
      return `Aspect data does not match the supplied sidereal/tropical positions for ${aspect.transitPlanet}/${aspect.natalPlanet}.`;
    }
  }
  return null;
}

// ─── Report generator ─────────────────────────────────────────────────────────

function generateReport(req: DailyForgeRequest): ForgeReport {
  const { natal, transits } = req;

  // Take top 4–5 aspects; guarantee at least one Moon transit where available.
  // Primary drives most generation; supporting aspects add context.
  const MAX_ASPECTS = 5;
  let activeAspects = transits.aspects.slice(0, Math.min(MAX_ASPECTS, transits.aspects.length));
  const hasMoonTransit = activeAspects.some(a => a.transitPlanet === "moon");
  if (!hasMoonTransit) {
    const moonAspect = transits.aspects.find(a => a.transitPlanet === "moon");
    if (moonAspect) {
      if (activeAspects.length < MAX_ASPECTS) {
        activeAspects = [...activeAspects, moonAspect];
      } else {
        // Swap out the lowest-priority slot (last) for Moon
        activeAspects = [...activeAspects.slice(0, MAX_ASPECTS - 1), moonAspect];
      }
    }
  }
  const top       = activeAspects[0];
  const supporting = activeAspects.slice(1);
  const date = transits.date;

  const tPlanet    = top.transitPlanet;
  const nPlanet    = top.natalPlanet;
  const aspectType = top.type;

  const tPos  = transits.positions[tPlanet];
  const nPos  = natal.positions[nPlanet];
  const moonT = transits.positions.moon;

  const tName   = PLANET_NAMES[tPlanet];
  const nName   = PLANET_NAMES[nPlanet];
  const tSign   = sign(tPos.signIndex);
  const nSign   = sign(nPos.signIndex);
  const nHouse  = nPos.house;
  const moonSign = sign(moonT.signIndex);

  const nHouseMeaning  = HOUSE_MEANING[nHouse] ?? { short: "Life", full: "a key area of your life" };
  const aspectInfo     = ASPECT_MEANING[aspectType];
  const tSignInfo      = SIGN_QUALITY[tSign] ?? { brief: "purposeful", operative: "deliberate engagement" };
  const moonInfo       = MOON_PROCESSING[moonSign] ?? { style: "present and attentive", lens: "filtering through current awareness" };
  const nDomain        = PLANET_DOMAIN[nPlanet];

  const seed        = hashSeed(date, tPlanet, nPlanet, aspectType);
  const refinement  = pick(REFINEMENT_NOUN[nPlanet], seed, 0);
  const refinement2 = pick(REFINEMENT_NOUN[nPlanet], seed, 1);

  const houseLabel = houseOrd(nHouse);
  // Keep proprietary framework labels internal. Report copy should translate
  // them into lived experience for the reader.
  const nFuncName  = NATAL_FUNCTION[nPlanet];
  const tFuncName  = TRANSIT_FUNCTION[tPlanet];

  // ── CELESTIAL FIELD ──────────────────────────────────────────────────────
  const celestialField = activeAspects.map(aspect => {
    const sp_tPos      = transits.positions[aspect.transitPlanet];
    const sp_nPos      = natal.positions[aspect.natalPlanet];
    const sp_tName     = PLANET_NAMES[aspect.transitPlanet];
    const sp_nName     = PLANET_NAMES[aspect.natalPlanet];
    const sp_tGlyph    = PLANET_GLYPH[aspect.transitPlanet];
    const sp_nGlyph    = PLANET_GLYPH[aspect.natalPlanet];
    const sp_nSign     = sign(sp_nPos.signIndex);
    const sp_tSign     = sign(sp_tPos.signIndex);
    const sp_nHouse    = sp_nPos.house;
    const sp_houseInfo = HOUSE_MEANING[sp_nHouse] ?? { short: "Life", full: "a key area" };
    return {
      planetaryAspect:       `${sp_tGlyph} ${sp_tName} ${ASPECT_LABEL_CAP[aspect.type]} Natal ${sp_nGlyph} ${sp_nName}`,
      transitPlacement:     `Transit ${sp_tSign} ${sp_tPos.degree}°${String(sp_tPos.minute ?? 0).padStart(2, "0")}′`,
      natalPlacement:        `Natal ${sp_nSign} ${sp_nPos.degree}° · ${houseOrd(sp_nHouse)} house`,
      houseActivation:       `${houseOrd(sp_nHouse)} house · ${sp_houseInfo.short}`,
      coreFunctionActivated: activationDescription(aspect),
    };
  });

  // ── TODAY'S THEME ────────────────────────────────────────────────────────
  const themes: Record<AspectType, string[]> = {
    conjunction: [
      `Concentrating ${refinement} through direct pressure from ${tName}.`,
      `${cap(refinement)} and ${tName}'s influence merge into a single point of focus.`,
      `Deepening ${refinement} through focused, undivided engagement.`,
      `${tName} intensifies your ${refinement} — the work is concentration.`,
    ],
    trine: [
      `Amplifying ${refinement} through natural alignment with ${tName}.`,
      `${cap(refinement)} flows more easily today — the work is to direct that flow deliberately.`,
      `Natural momentum supports the development of ${refinement}.`,
      `${tName} opens a path for ${refinement} to deepen without resistance.`,
    ],
    sextile: [
      `An opening for ${refinement} — initiated by ${tName}, activated by you.`,
      `${cap(refinement)} advances today if you choose to move through the cooperative opening available.`,
      `The conditions favor ${refinement}. The initiative is yours.`,
      `${tName} creates the opening. What you do with it determines the outcome.`,
    ],
    square: [
      `Strengthening ${refinement} through the productive friction of ${tName}.`,
      `${cap(refinement)} is being built — not through ease, but through direct engagement with what resists.`,
      `The tension between ${tName} and your natal design is developing ${refinement}.`,
      `Development of ${refinement} arrives through productive difficulty today.`,
    ],
    opposition: [
      `Clarifying ${refinement} through the contrast ${tName} is creating.`,
      `${cap(refinement)} comes into focus through contrast — what stands across from you reveals what you could not see from the inside.`,
      `${tName} illuminates ${refinement} from the outside.`,
      `Clarifying ${refinement} through what today's contrast makes visible.`,
    ],
  };
  const primaryThemeStr = pick(themes[aspectType], seed, 0);
  // Cap the "Also active" list at 2 items to keep the theme readable
  const themeSupporting = supporting.slice(0, 2);
  const todaysTheme = themeSupporting.length > 0
    ? `${primaryThemeStr} Also active: ${themeSupporting.map(a =>
        `${PLANET_NAMES[a.transitPlanet]} ${ASPECT_LABEL_CAP[a.type]} natal ${PLANET_NAMES[a.natalPlanet]}`
      ).join(', ')}${supporting.length > 2 ? `, +${supporting.length - 2} more` : ''}.`
    : primaryThemeStr;

  // ── CELESTIAL STATE ──────────────────────────────────────────────────────
  const celestialStateTemplates = [
    `Today's primary planetary contact is a ${aspectType} between transiting ${tName} (${tFuncName}) and your natal ${nName} (${nFuncName}) at ${formatDeg(nPos)} in your ${houseLabel} House. A ${aspectType} means ${aspectInfo.mechanism} — and in practical terms, this produces ${aspectInfo.experiential}. The ${houseLabel} House governs ${nHouseMeaning.full}, placing this part of your life at the center of today's contact. ${tName} is currently in ${tSign}, a sign characterized by ${tSignInfo.brief}, bringing ${tSignInfo.operative} to the way this interaction unfolds. This aspect is precise and personally active throughout the day.`,
    `The sky today puts a ${aspectType} between transiting ${tName} (${tFuncName}) and your natal ${nName} (${nFuncName}) — a configuration that means ${aspectInfo.mechanism}. Your natal ${nName} sits in your ${houseLabel} House at ${formatDeg(nPos)}, a house concerned with ${nHouseMeaning.full}: this is the territory today's contact is pressing directly into. Transiting ${tName} at ${formatDeg(tPos)} is ${aspectType === "conjunction" ? "merging with" : aspectType === "opposition" ? "pulling from across" : aspectType === "square" ? "pressing against" : aspectType === "trine" ? "flowing into" : "opening a path to"} that natal point. What this produces is ${aspectInfo.experiential}. The ${tSignInfo.brief} quality of ${tSign} is the character through which this contact expresses itself today.`,
    `A ${aspectType} between transiting ${tName} (${tFuncName}) and your natal ${nName} (${nFuncName}) is the main planetary condition today. The ${aspectType} describes how these two experiences meet: ${aspectInfo.mechanism}. Your natal ${nName} in the ${houseLabel} House governs ${nHouseMeaning.full} — the precise territory this contact is engaging. Transiting ${tName} at ${formatDeg(tPos)} in ${tSign} — a ${tSignInfo.brief} sign — is bringing ${tSignInfo.operative} to that domain. The contact is precise and active throughout the day.`,
    `Today, ${tName} (${tFuncName}) in ${tSign} forms a ${aspectType} with your natal ${nName} (${nFuncName}) in your ${houseLabel} House. A ${aspectType} produces ${aspectInfo.experiential}. Your ${houseLabel} House governs ${nHouseMeaning.full}: that is where this contact's pressure is applied. ${tName} at ${formatDeg(tPos)} is bringing its current ${tSignInfo.brief} quality into direct relation with your natal ${nName} at ${formatDeg(nPos)}. This interaction is tight and personally relevant throughout today.`,
  ];

  // Supporting aspect paragraphs (one per secondary aspect)
  const supportingCelestialParas = supporting.map((aspect, i) => {
    const sp_tPlanet    = aspect.transitPlanet;
    const sp_nPlanet    = aspect.natalPlanet;
    const sp_aspectType = aspect.type;
    const sp_tPos       = transits.positions[sp_tPlanet];
    const sp_nPos       = natal.positions[sp_nPlanet];
    const sp_tName      = PLANET_NAMES[sp_tPlanet];
    const sp_nName      = PLANET_NAMES[sp_nPlanet];
    const sp_tSign      = sign(sp_tPos.signIndex);
    const sp_nSign      = sign(sp_nPos.signIndex);
    const sp_nHouse     = sp_nPos.house;
    const sp_houseInfo  = HOUSE_MEANING[sp_nHouse] ?? { short: "Life", full: "a key area of your life" };
    const sp_aspectInfo = ASPECT_MEANING[sp_aspectType];
    const sp_tSignInfo  = SIGN_QUALITY[sp_tSign] ?? { brief: "purposeful", operative: "deliberate engagement" };
    const sp_nFunc      = PLANET_FUNCTION_NAME[sp_nPlanet];
    const templates = [
      `A supporting contact is active alongside the primary: ${sp_tName} in ${sp_tSign} forms a ${sp_aspectType} with your natal ${sp_nName} at ${sp_nSign} ${sp_nPos.degree}° in your ${houseOrd(sp_nHouse)} House (${sp_houseInfo.full}). This ${sp_aspectType} means ${sp_aspectInfo.mechanism} — adding ${sp_tSignInfo.operative} to the area of ${sp_houseInfo.short.toLowerCase()}. Your ${sp_nFunc} function is modulated through ${ASPECT_MODE[sp_aspectType].toLowerCase()} alongside the primary activation.`,
      `A secondary aspect is also active: ${sp_tName} in ${sp_tSign} at a ${sp_aspectType} to your natal ${sp_nName} in your ${houseOrd(sp_nHouse)} House. This ${sp_aspectType} produces ${sp_aspectInfo.experiential} in the area of ${sp_houseInfo.full}. The ${sp_tSignInfo.brief} quality of ${sp_tSign} shapes how this contact operates — bringing ${sp_tSignInfo.operative} to your ${sp_nFunc} function.`,
    ];
    return pick(templates, seed, 9 + i);
  });

  const celestialState = [pick(celestialStateTemplates, seed, 0), ...supportingCelestialParas].join('\n\n');

  // ── BLUEPRINT ACTIVATION ─────────────────────────────────────────────────
  const supportingFunctionCtx = supporting.length > 0
    ? ` Alongside this, ${supporting.map(a =>
        `transiting ${PLANET_NAMES[a.transitPlanet]} forms a ${a.type} with your natal ${PLANET_NAMES[a.natalPlanet]} — ${activationDescription(a)}`
      ).join(', and ')}, adding further complexity to today's field.`
    : '';

  const blueprintActivationTemplates = [
    `Your natal ${nName} in ${nSign} governs ${nDomain} — placed in your ${houseLabel} House, which covers ${nHouseMeaning.full}. This is the specific natal placement most directly engaged today. Transiting ${tName} forms a ${aspectType} with it: ${aspectInfo.mechanism}. What that produces is ${aspectInfo.experiential}.${supportingFunctionCtx} The capacity being developed through this contact is your ${refinement} — directly in the area of ${nHouseMeaning.full}.`,
    `Your natal ${nName} in your ${houseLabel} House governs ${nDomain}. That is the part of your chart under direct pressure right now. Today, transiting ${tName} forms a ${aspectType} with this placement — meaning ${aspectInfo.mechanism} — and what it produces specifically here is ${aspectInfo.experiential}.${supportingFunctionCtx} The ability being refined through this contact is your ${refinement}, in the domain of ${nHouseMeaning.full}.`,
    `Today's primary contact: transiting ${tName} in ${tSign} forms a ${aspectType} with your natal ${nName} in ${nSign}, ${houseLabel} House. Your natal ${nName} governs ${nDomain} — in the ${houseLabel} House that shows up as ${nHouseMeaning.full}. The ${aspectType} means ${aspectInfo.mechanism}.${supportingFunctionCtx} What is being directly engaged is your capacity for ${refinement2} in the domain of ${nHouseMeaning.short.toLowerCase()}.`,
    `The part of your chart under the most direct pressure today is your natal ${nName} in ${nSign} — governing ${nDomain}. In your ${houseLabel} House, this expresses as ${nHouseMeaning.full}. Transiting ${tName}'s ${aspectType} to this placement produces ${aspectInfo.experiential}.${supportingFunctionCtx} The question today's transit is asking: how does your natal ${nName} hold up under this kind of contact — and what does ${nHouseMeaning.short.toLowerCase()} require from you right now?`,
  ];

  // ── WHAT IS BEING REFINED ─────────────────────────────────────────────────
  const supportingRefinementCtx = supporting.length > 0
    ? ` In the background, ${supporting.map(a =>
        `${PLANET_NAMES[a.transitPlanet]}'s ${a.type} to natal ${PLANET_NAMES[a.natalPlanet]} (${activationDescription(a)})`
      ).join(' and ')} adds to the developmental load — shaping the overall field within which today's primary refinement is occurring.`
    : '';

  const whatIsBeingRefinedTemplates = [
    `What is being developed through today's planetary field is your ${refinement}. The primary driver is the ${aspectType} itself — ${aspectInfo.mechanism} — which produces ${aspectInfo.experiential}. ${aspectType === "square" ? "The square does not offer ease — it offers development. The tension you encounter is not interference; it is the resistance that builds strength." : aspectType === "opposition" ? "The opposition creates contrast you did not ask for. But contrast is one of the most direct forms of clarity — it shows you what you cannot see from inside your current position." : aspectType === "conjunction" ? "The conjunction intensifies — it does not allow the two forces to remain separate. That intensity is what drives the development." : aspectType === "trine" ? "The trine removes the resistance that usually slows this process. That does not make the work optional — it makes the opportunity for going further more available than usual." : "The sextile is cooperative but not automatic. It creates the opening; what you do within it determines what actually develops."}${supportingRefinementCtx} What develops through this pressure is a more capable, more deliberate expression of ${refinement2}. Real ability rarely comes from understanding. It comes from experience that demands more than the current version can handle.`,
    `What is being worked on today follows three stages: the current state (${nDomain}, as it currently operates), the pressure being applied (the ${aspectType}: ${aspectInfo.mechanism}), and what is developing as a result (a more precise expression of ${refinement}).${supportingRefinementCtx} The ${houseLabel} House — covering ${nHouseMeaning.full} — is where this is happening. ${tName} in ${tSign} brings its ${tSignInfo.brief} quality to this process, shaping not just what is being developed but how that development is occurring.`,
    `Today's planetary field is developing your ${refinement} — specifically in the area of ${nHouseMeaning.full}. The ${aspectType} is what is driving this: ${aspectInfo.mechanism}. This produces ${aspectInfo.experiential}. What is being tested is how ${nDomain} holds up under this kind of pressure.${supportingRefinementCtx} The opportunity — present in any real planetary contact — is to build ${refinement2} through deliberate engagement today, rather than waiting for easier conditions.`,
    `What today is actually doing is building your ${refinement}. Not as an idea — as a demonstrated ability. The ${aspectType} between ${tName} and your natal ${nName} creates the specific pressure: ${aspectInfo.experiential}.${supportingRefinementCtx} What is being strengthened is how deliberately and precisely you operate in the area of ${nHouseMeaning.full}. What is being tested is any part of that which has been running on autopilot. Today is not a setback. It is a test of where you actually are.`,
  ];

  // ── FORGE PRINCIPLE ──────────────────────────────────────────────────────
  const principlePlanetKey = nPlanet in FORGE_PRINCIPLES[aspectType] ? nPlanet : "mars";
  const forgePrinciple = pick(
    FORGE_PRINCIPLES[aspectType][principlePlanetKey] ?? FORGE_PRINCIPLES[aspectType]["mars"] ?? ["Refinement is not a destination. It is a direction."],
    seed, 3,
  );

  // ── JOURNAL PROMPT ───────────────────────────────────────────────────────
  const journalPromptsByAspect: Record<AspectType, string[]> = {
    conjunction: [
      `Your thinking today runs ${moonInfo.style} — ${moonInfo.lens}. In the area of ${nHouseMeaning.full}, where is your ${refinement} most concentrated right now, and what would it look like to direct that concentration more deliberately rather than let it find its own level?`,
      `Your thinking today runs ${moonInfo.style}. In the area of ${nHouseMeaning.full}, what part of your ${refinement} have you been splitting between two separate efforts when it actually needs to go into one focused approach?`,
      `Your thinking today is ${moonInfo.style} (${moonInfo.lens}). In the area of ${nHouseMeaning.full}, what is the one thing holding back your ${refinement} — not because you lack the ability, but because you have not focused on it as a single priority?`,
    ],
    trine: [
      `Your thinking today runs ${moonInfo.style} — ${moonInfo.lens}. In the area of ${nHouseMeaning.full}, where is your ${refinement} already working most naturally, and what would it take to push that further than your usual stopping point?`,
      `Your thinking today runs ${moonInfo.style}. In the area of ${nHouseMeaning.full}, what goal have you been treating as something for later that today's conditions actually make available now?`,
      `Your thinking today is ${moonInfo.style}. In the area of ${nHouseMeaning.full}, where is your ${refinement} coming most easily — and what would it look like to build something real and lasting within that ease, rather than just riding it?`,
    ],
    sextile: [
      `Your thinking today runs ${moonInfo.style} — ${moonInfo.lens}. In the area of ${nHouseMeaning.full}, what specific step related to your ${refinement} has been waiting for better conditions — and what is the smallest version of that step you could take right now?`,
      `Your thinking today runs ${moonInfo.style}. In the area of ${nHouseMeaning.full}, what are you most aware of not starting — and what assumption about timing or readiness is behind that hesitation?`,
      `Your thinking today is ${moonInfo.style}. In the area of ${nHouseMeaning.full}, where do you notice an opening that was not there last week — and what would it take to move through it before it closes?`,
    ],
    square: [
      `Your thinking today runs ${moonInfo.style} — ${moonInfo.lens}. In the area of ${nHouseMeaning.full}, where is your ${refinement} running into the most resistance — and if you treated that resistance as specific information about what still needs work, what would it be telling you?`,
      `Your thinking today runs ${moonInfo.style}. In the area of ${nHouseMeaning.full}, what are you most tempted to avoid — and what would it reveal about your ${refinement} if you engaged with it directly instead?`,
      `Your thinking today is ${moonInfo.style}. In the area of ${nHouseMeaning.full}, where is the gap between your current approach and what is being asked of you widest — and what one specific adjustment, not a workaround, would close that gap most?`,
    ],
    opposition: [
      `Your thinking today runs ${moonInfo.style} — ${moonInfo.lens}. In the area of ${nHouseMeaning.full}, what angle on your ${refinement} does today's contrast give you that your usual point of view cannot?`,
      `Your thinking today runs ${moonInfo.style}. In the area of ${nHouseMeaning.full}, what about your current approach becomes most visible when you look at it from the position that is most directly opposite to where you usually stand?`,
      `Your thinking today is ${moonInfo.style}. In the area of ${nHouseMeaning.full}, what do you notice when you hold both your current position and its opposite at the same time — not choosing between them, but keeping both in view at once?`,
    ],
  };
  const journalPrompt = pick(journalPromptsByAspect[aspectType], seed, 4);

  // ── DAILY APPLICATION ────────────────────────────────────────────────────
  const doActions: Record<AspectType, string[]> = {
    conjunction: [
      `Choose one specific expression of ${refinement} in the domain of ${nHouseMeaning.full} and commit to it completely today — not partially, not in parallel with other priorities. The conjunction's force is wasted when split.`,
      `Identify the most concentrated, undivided action available to you in the area of ${nHouseMeaning.full} and execute it. Bring the ${tSignInfo.operative} quality of ${tSign} into how you deliver it.`,
      `Take the one action in the area of ${nHouseMeaning.full} that requires the most of your ${refinement} — the one you have been fragmenting across multiple smaller efforts — and do it as a single, focused task today.`,
    ],
    trine: [
      `Identify one goal in the domain of ${nHouseMeaning.full} that has been feeling close but incomplete, and use today's natural momentum to push it across the finish line rather than maintaining it at 80%.`,
      `Choose the most ambitious expression of ${refinement} you have been treating as not yet ready, and begin it today. The conditions support it more than your default hesitation assumes.`,
      `Take one deliberate step in the domain of ${nHouseMeaning.full} that goes further than your usual comfort point — not recklessly, but intentionally. Today's flow carries further than most.`,
    ],
    sextile: [
      `Before the day is over, take one specific, concrete action in the domain of ${nHouseMeaning.full} that you have been waiting to initiate. The sextile's window is open — step through it now, not next week.`,
      `Identify the cooperative opening available to you in the area of ${nHouseMeaning.full} and make contact with it today — whether that means initiating a conversation, beginning a project, or making a decision you have been deferring.`,
      `Choose one thing in the domain of ${nHouseMeaning.full} where your ${refinement} has been waiting for better conditions, and act as if today's conditions are exactly that. They are.`,
    ],
    square: [
      `Engage directly with the point of greatest friction in the domain of ${nHouseMeaning.full} — not around it, not despite it, but through it. Name the specific resistance and work with it as the mechanism of development it actually is.`,
      `Identify the one task or decision in the area of ${nHouseMeaning.full} that you have been most tempted to defer because of its difficulty, and complete at least one meaningful component of it today. Difficulty is today's signal, not a warning.`,
      `Take one specific action in the area of ${nHouseMeaning.full} that directly addresses what has been creating the most tension. Bring ${tSignInfo.operative} to how you approach it — that quality is what ${tSign} is making available today.`,
    ],
    opposition: [
      `Deliberately seek one perspective on your current approach to ${nHouseMeaning.full} that you would not normally consider — from someone outside your usual frame, a different methodology, or an opposing position. Engage with it genuinely, not defensively.`,
      `Identify the position that stands most directly across from your current approach in the area of ${nHouseMeaning.full} and spend deliberate time with it today. Not to abandon your position, but to understand what the contrast reveals about it.`,
      `Make one decision or take one action in the area of ${nHouseMeaning.full} that accounts for a point of view you have been underweighting. Acting on it is the work — not just noticing it.`,
    ],
  };

  const avoidPatterns: Record<AspectType, string[]> = {
    conjunction: [
      `Splitting your attention between this domain and lower-priority areas — the conjunction's force is strongest when it is not distributed.`,
      `Treating the intensity of today's contact as a reason to step back rather than step in. Concentrated pressure is an asset, not a warning.`,
      `Defaulting to familiar patterns of fragmentation when what today requires is singular focus on ${refinement} in ${nHouseMeaning.full}.`,
    ],
    trine: [
      `Assuming that because the process feels easier today, less engagement is required. Flow that is not directed produces movement, not progress.`,
      `Treating today's ease as a rest day rather than a runway — natural momentum does not persist, and what you build within it will.`,
      `Passive appreciation of what is working rather than deliberate extension of it into something more developed.`,
    ],
    sextile: [
      `Treating the available opening as something to explore later. A sextile's cooperative conditions are temporary. Acting within them is the entire opportunity.`,
      `Waiting for more certainty or better preparation before initiating in the domain of ${nHouseMeaning.full}. The conditions are already cooperative.`,
      `Letting awareness of the opportunity substitute for action within it. Recognition is not participation.`,
    ],
    square: [
      `Interpreting the friction in the domain of ${nHouseMeaning.full} as a sign to stop or redirect. The square's discomfort is the mechanism of development — avoiding it avoids the growth.`,
      `Routing around the most difficult part of today's planetary contact rather than engaging with it directly. The resistance is pointing at exactly what needs attention.`,
      `Explaining or justifying why the tension is present instead of working with what the tension is building. Analysis without engagement is not development.`,
    ],
    opposition: [
      `Collapsing into your most familiar position when the discomfort of the opposition invites you to hold both perspectives simultaneously.`,
      `Treating the contrast today as confirmation that your current approach is correct, rather than as information about what it is missing.`,
      `Resolving the opposition's tension by dismissing the other side rather than taking in what it is showing you. Closing the gap too quickly shuts down what the contrast was making visible.`,
    ],
  };

  const practices: Record<AspectType, string[]> = {
    conjunction: [
      `Concentration as a deliberate practice: before beginning any task in the domain of ${nHouseMeaning.full} today, make one clear decision about what this effort is in service of — and return to that decision if focus fragments.`,
      `Treat undivided attention as the primary resource today. In the domain of ${nHouseMeaning.full}, practice maintaining singular focus longer than you usually do before switching tasks or perspectives.`,
      `When intensity arises in the area of ${nHouseMeaning.full} today, treat it as a signal about where to focus — and lean into that area rather than spreading your energy across other concerns.`,
    ],
    trine: [
      `Intentional extension: when something in the domain of ${nHouseMeaning.full} feels natural today, push 20% further than your default stopping point. Natural flow carries further than you usually allow it to.`,
      `Treat ease as a resource rather than a rest state. Each time something in the area of ${nHouseMeaning.full} flows without friction today, use that as the moment to go deeper, not to rest on what has already been accomplished.`,
      `Deliberate ambition: identify the version of your ${refinement} that you have been treating as too far ahead of where you currently are, and make one move toward it today under the cover of the current flow.`,
    ],
    sextile: [
      `Initiative as a discipline: in the domain of ${nHouseMeaning.full}, practice choosing to begin before you feel completely ready. The sextile's cooperative conditions will not wait for certainty — they reward movement.`,
      `Treat the available opening not as something to notice but as something to use. Each time you observe a cooperative condition in the area of ${nHouseMeaning.full} today, ask: what is the specific action that moves through this opening right now?`,
      `Practice the habit of acting on the smallest version of what is available to you today in the domain of ${nHouseMeaning.full}, rather than waiting for a larger or cleaner version of the same opportunity.`,
    ],
    square: [
      `Reframe friction as load-bearing: each time you encounter resistance in the domain of ${nHouseMeaning.full} today, pause and ask not "how do I avoid this?" but "what specific capacity is this developing?" Let that answer redirect how you engage.`,
      `Engagement over avoidance as a daily practice: in the area of ${nHouseMeaning.full}, when the instinct is to redirect or delay because something is difficult, practice staying present with the difficulty for one additional period before deciding how to respond.`,
      `Treat your most consistent reaction to friction in the domain of ${nHouseMeaning.full} as the pattern the square is asking you to develop past. Identify it clearly, then practice one different response each time it appears today.`,
    ],
    opposition: [
      `Holding two views at once: in the area of ${nHouseMeaning.full}, deliberately keep your current position and the opposing one in view at the same time at least once today — not to abandon either, but to understand what each sees that the other cannot.`,
      `Treat the thing that stands most directly against your current approach in the area of ${nHouseMeaning.full} as a source of information rather than an obstacle. Identify specifically what it is showing you that your current position cannot see on its own.`,
      `Resist the pull to resolve things too quickly: when the tension in the area of ${nHouseMeaning.full} creates an impulse to land on one position fast, slow down and stay with the contrast long enough to get what it is actually showing you.`,
    ],
  };

  const doAction     = pick(doActions[aspectType],     seed, 5);
  const avoidPatt    = pick(avoidPatterns[aspectType], seed, 6);
  const practiceItem = pick(practices[aspectType],     seed, 7);

  const dailyApplication = `DO: ${doAction}\n\nAVOID: ${avoidPatt}\n\nPRACTICE: ${practiceItem}`;

  // ── CLOSING REFLECTION ───────────────────────────────────────────────────
  const closingTemplates = [
    `Today's sky is a temporary condition. What you build within it — the ${refinement} you develop through today's work — is not. Every transit creates conditions. What you do with those conditions becomes part of how you actually operate going forward. The ${houseLabel} House will be under pressure again. Your natal ${nName} will be reached by other transits. But the level at which you engage today determines what those next contacts find when they arrive. The sky changes. The chart remains. Development is the process connecting them.`,
    `The ${aspectType} between ${tName} and your natal ${nName} will pass. The ${refinement} you build through it does not reset when it does. Daily Forge is built on this: the current sky conditions are temporary. What you build within them is not. Today has shown you specifically where ${nHouseMeaning.full} sits in your chart and what the current sky is pressing on. That clarity is yours to keep. What you choose to do with it — today, not someday — is what determines whether this contact produces growth or simply passes.`,
    `Development in Daily Forge does not arrive after you understand something. It arrives through consistent engagement with exactly this — today's specific conditions, today's specific area, today's specific ability. Your natal ${nName} in the ${houseLabel} House is under real pressure right now. The ${aspectType} is the type of pressure. The quality of your response is what determines what comes out of it. The sky changes daily. The person you are building into, through each of these contacts, is the work that does not reset at midnight.`,
    `The ${houseLabel} House covers ${nHouseMeaning.full}. That is not a temporary concern — it is a permanent part of your chart. What today is doing within it is building your ${refinement2} in a specific, traceable direction. You will not be able to see the full result immediately. But the effort itself — how deliberately you worked with today's ${aspectType} — becomes part of how your natal ${nName} holds up the next time it is under pressure. The sky is always temporary. The development it drives, when you show up for it, is not.`,
  ];
  const closingReflection = pick(closingTemplates, seed, 8);

  return {
    date,
    zodiac: transits.zodiac as "tropical" | "sidereal",
    referenceTime: "12:00 local chart time",
    primaryTransit: {
      transitPlanet: tName,
      natalPlanet:   nName,
      aspect:        aspectType,
      orb:           top.orb,
      house:         nHouse,
    },
    activeAspects: activeAspects.map(a => ({
      transitPlanet: PLANET_NAMES[a.transitPlanet],
      natalPlanet:   PLANET_NAMES[a.natalPlanet],
      aspect:        a.type,
      orb:           a.orb,
      house:         natal.positions[a.natalPlanet]?.house ?? 1,
    })),
    celestialField,
    todaysTheme,
    celestialState,
    blueprintActivation: pick(blueprintActivationTemplates,  seed, 1),
    whatIsBeingRefined:  pick(whatIsBeingRefinedTemplates,   seed, 2),
    forgePrinciple,
    journalPrompt,
    dailyApplication,
    closingReflection,
  };
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

const forgeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// ─── POST /api/daily-forge/report ────────────────────────────────────────────

router.post("/daily-forge/report", forgeLimiter, async (req: any, res) => {
  const body = req.body as DailyForgeRequest;

  if (!body?.token || !body?.natal || !body?.transits) {
    return res.status(400).json({ error: "Missing required fields: token, natal, transits." });
  }

  let tokenJti: string;
  const stripeClaims = verifyStripeToken(body.token);
  if (stripeClaims) {
    if (stripeClaims.product !== "forge") {
      return res.status(403).json({ error: "This token does not grant access to Daily Forge." });
    }
    tokenJti = stripeClaims.jti;
  } else if (isDev) {
    const SECRET = process.env.SESSION_SECRET;
    if (!SECRET) return res.status(500).json({ error: "Server misconfiguration." });
    try {
      const dotIndex = body.token.lastIndexOf(".");
      const encodedPayload = body.token.slice(0, dotIndex);
      const providedSig = body.token.slice(dotIndex + 1);
      const { createHmac, timingSafeEqual } = await import("crypto");
      const expectedSig = createHmac("sha256", SECRET).update(encodedPayload).digest("hex");
      const valid = providedSig.length === expectedSig.length &&
        timingSafeEqual(Buffer.from(expectedSig, "hex"), Buffer.from(providedSig, "hex"));
      if (!valid) return res.status(403).json({ error: "Invalid token." });
      const claims = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
      if (claims.sub !== "dev-user" || claims.exp < Math.floor(Date.now() / 1000)) {
        return res.status(403).json({ error: "Token expired or invalid." });
      }
      tokenJti = claims.jti ?? "dev";
    } catch {
      return res.status(403).json({ error: "Invalid token format." });
    }
  } else {
    return res.status(403).json({ error: "Invalid or expired token." });
  }

  const { date } = body.transits;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Expected YYYY-MM-DD." });
  }

  if (body.natal.zodiac !== "sidereal" && body.natal.zodiac !== "tropical") {
    return res.status(400).json({
      error: "Invalid natal zodiac. Expected tropical or sidereal.",
    });
  }
  const zodiac = body.natal.zodiac;

  // ── Consistency guard ───────────────────────────────────────────────────────
  // Reject any request where the client mixes zodiac systems across the natal
  // chart, the transit chart, and the explicit zodiac tag. A mixed-zodiac
  // request would produce a report that names some planets in one system and
  // some in another, which is incoherent and must never reach the generator.
  const transitsZodiacRaw = (body as { transits?: { zodiac?: string } }).transits?.zodiac;
  const topZodiacRaw = (body as { zodiac?: string }).zodiac;
  const transitsZodiac = transitsZodiacRaw === "sidereal" ? "sidereal"
    : transitsZodiacRaw === "tropical" ? "tropical" : null;
  const topZodiac = topZodiacRaw === "sidereal" ? "sidereal"
    : topZodiacRaw === "tropical" ? "tropical" : null;

  const mismatches: string[] = [];
  if (!transitsZodiac) mismatches.push("transits.zodiac missing or invalid");
  if (topZodiac && topZodiac !== zodiac) mismatches.push("zodiac");
  if (transitsZodiac && transitsZodiac !== zodiac) mismatches.push("transits.zodiac");
  if (mismatches.length) {
    logger.warn({ mismatches, zodiac, topZodiac, transitsZodiac }, "Mixed-zodiac Daily Forge request rejected");
    return res.status(400).json({
      error: `Inconsistent zodiac across request (${mismatches.join(", ")} must match natal.zodiac=${zodiac}). Please reload the page.`,
    });
  }

  const aspectError = validateTransitAspects(body);
  if (aspectError) {
    logger.warn({ zodiac, aspectError }, "Inconsistent Daily Forge aspect data rejected");
    return res.status(400).json({
      error: `${aspectError} Refresh the chart and generate the report again.`,
    });
  }

  const key = cacheKey(tokenJti, date, zodiac, body.natal);
  const cached = reportCache.get(key);
  if (cached && cached.date === date) {
    return res.json({ report: cached.report, cached: true });
  }

  if (!body.transits.aspects.length) {
    return res.status(400).json({ error: "No transit aspects found." });
  }

  try {
    const report = generateReport(body);
    reportCache.set(key, { date, report });
    logger.info({ date, primaryTransit: report.primaryTransit, cached: false }, "Daily Forge report generated");
    return res.json({ report, cached: false });
  } catch (err: any) {
    logger.error({ err: err.message }, "Daily Forge report generation failed");
    return res.status(500).json({ error: "Failed to generate report. Please try again." });
  }
});

export default router;
