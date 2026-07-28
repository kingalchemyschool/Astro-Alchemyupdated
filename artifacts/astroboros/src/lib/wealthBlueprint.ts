/**
 * Conscious Wealth Blueprint generator.
 *
 * Produces a WealthBlueprint from a NatalChart. Each planetary section follows
 * the 7-step structure from the spec:
 *   1. Planetary function
 *   2. Sign modification
 *   3. House application
 *   4. Major aspects
 *   5. Retrograde modification (if applicable)
 *   6. Practical expression
 *   7. Developmental edge
 */

import type { NatalChart, WealthBlueprint, WealthForce, WealthStrength } from "@/types/astro";
import { SIGNS, ORDINALS, PLANET_META } from "@/constants/astro";

type El = "fire" | "earth" | "air" | "water";
type Mod = "cardinal" | "fixed" | "mutable";

function el(chart: NatalChart, key: keyof NatalChart["positions"]): El {
  return SIGNS[chart.positions[key].signIndex].element as El;
}
function signName(chart: NatalChart, key: keyof NatalChart["positions"]): string {
  return SIGNS[chart.positions[key].signIndex].name;
}
function houseNum(chart: NatalChart, key: keyof NatalChart["positions"]): number {
  return chart.positions[key].house;
}
function houseOrd(chart: NatalChart, key: keyof NatalChart["positions"]): string {
  return ORDINALS[chart.positions[key].house - 1];
}
function glyph(key: keyof NatalChart["positions"]): string {
  return PLANET_META[key].glyph;
}
function retro(chart: NatalChart, key: keyof NatalChart["positions"]): boolean {
  return chart.positions[key].retrograde;
}

function placementLine(
  chart: NatalChart,
  key: keyof NatalChart["positions"],
  contribution: string,
): string {
  const position = chart.positions[key];
  return `${glyph(key)} ${PLANET_META[key].name} in ${signName(chart, key)} and the ${houseOrd(chart, key)} house contributes ${contribution}.`;
}

// ─── Aspect interpretation ────────────────────────────────────────────────────

// Functional role of each planet in the wealth system — used to explain
// what the aspect relationship means operationally, not just symbolically.
const PLANET_FUNCTION: Record<keyof NatalChart["positions"], string> = {
  sun:     "creative identity",
  moon:    "internal processing and integration",
  mars:    "initiating force",
  mercury: "translation and communication of force",
  jupiter: "expansion and growth",
  venus:   "value discernment",
  saturn:  "structure-building and mastery",
  pluto:   "transformational power and depth",
  uranus:  "innovation and structural disruption",
  neptune: "vision and higher purpose",
};

function aspectsFor(chart: NatalChart, key: keyof NatalChart["positions"]): string {
  const relevant = chart.aspects
    .filter((a) => a.a === key || a.b === key)
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 2);

  if (!relevant.length) return "";

  const lines = relevant.map((asp) => {
    const other = asp.a === key ? asp.b : asp.a;
    const oG = PLANET_META[other].glyph;
    const oN = PLANET_META[other].name;
    const tG = PLANET_META[key].glyph;
    const tN = PLANET_META[key].name;
    const tFn = PLANET_FUNCTION[key];
    const oFn = PLANET_FUNCTION[other];

    switch (asp.type) {
      case "conjunction":
        return `${tG} ${tN} and ${oG} ${oN} are conjunct — these two functions merge at the point of activation, so engaging one engages both simultaneously. The result is amplification when both are consciously directed; the developmental work is learning to separate them enough to deploy each with precision rather than as a single undifferentiated force.`;
      case "sextile":
        return `${tG} ${tN} and ${oG} ${oN} form a sextile — there is structural compatibility here, but the connection requires deliberate engagement to become productive. When you consciously draw both into the same decision or action, they reinforce each other in ways that compound reliably over time.`;
      case "square":
        return `${tG} ${tN} and ${oG} ${oN} are in square — these two functions operate on different rhythms, generating friction when both are active. That friction is not a problem to resolve: it is the mechanism through which each develops precision it could not build in an unchallenged environment.`;
      case "trine":
        return `${tG} ${tN} and ${oG} ${oN} form a trine — their cooperation is largely effortless, creating a self-reinforcing circuit that generates consistent output without demanding active management. What flows easily here tends to remain invisible, which is both its advantage and its developmental risk.`;
      case "opposition":
        return `${tG} ${tN} and ${oG} ${oN} are in opposition — both functions are fully active on opposite ends of the same operational axis. The natural pattern is to cycle between them rather than integrate them; holding both simultaneously is what converts the tension into complete operational range.`;
      default:
        return "";
    }
  });

  return lines.filter(Boolean).join(" ");
}

// ─── Relational aspect helper ─────────────────────────────────────────────────
// Finds the aspect between two specific planets and returns a focused sentence.

function relationAspect(
  chart: NatalChart,
  a: keyof NatalChart["positions"],
  b: keyof NatalChart["positions"]
): string {
  const asp = chart.aspects.find(
    (x) => (x.a === a && x.b === b) || (x.a === b && x.b === a)
  );
  if (!asp) return "";
  const aG = PLANET_META[a].glyph, aN = PLANET_META[a].name;
  const bG = PLANET_META[b].glyph, bN = PLANET_META[b].name;
  switch (asp.type) {
    case "conjunction":
      return `${aG} ${aN} and ${bG} ${bN} are conjunct — these two functions merge at the point of activation, amplifying each other's output. The developmental work is learning to deploy each with precision rather than as a single undifferentiated force.`;
    case "sextile":
      return `${aG} ${aN} and ${bG} ${bN} form a sextile — structurally compatible, they become productive when deliberately engaged together. When you consciously activate both, they reinforce each other in ways that compound reliably.`;
    case "square":
      return `${aG} ${aN} and ${bG} ${bN} are in square — these two functions operate on different rhythms, generating friction when both are active. That friction is the mechanism through which each develops precision it could not build in an unchallenged environment.`;
    case "trine":
      return `${aG} ${aN} and ${bG} ${bN} form a trine — their cooperation is largely effortless, creating a self-reinforcing circuit. What flows easily here tends to remain invisible; consciously examining this pairing reveals capacity that has likely been underutilized.`;
    case "opposition":
      return `${aG} ${aN} and ${bG} ${bN} are in opposition — both fully active on opposite ends of the same axis, tending to alternate in dominance rather than integrate. Holding both simultaneously converts the tension into complete operational range.`;
    default:
      return "";
  }
}

// ─── House application text ───────────────────────────────────────────────────
// 12 entries per planet (index = house - 1).

const MARS_HOUSE: string[] = [
  "In the first house, this force expresses directly through the body and identity — you are the primary instrument through which initiative moves, and your presence itself generates momentum.",
  "In the second house, this force orients toward resources — building, protecting, and expanding material capacity is where initiative produces its most consistent consequence.",
  "In the third house, this force operates through communication and immediate influence — impact is generated through ideas, writing, teaching, and local connection.",
  "In the fourth house, this force channels inward toward foundations — the home, family structure, and private environment are where initiative is most productive and where the most significant building occurs.",
  "In the fifth house, this force becomes creative energy — impact emerges through original expression, risk-taking, and the willingness to produce something that carries your signature.",
  "In the sixth house, this force is directed toward precision and systematic service — impact comes through refined, consistent daily effort applied with exacting attention.",
  "In the seventh house, this force moves through relationship and partnership — initiative is most powerful in direct collaboration, negotiation, or the willingness to meet a strong counterpart.",
  "In the eighth house, this force penetrates beneath the surface — impact comes through transformation, depth, shared resources, and the willingness to engage what others avoid.",
  "In the ninth house, this force expands through ideas, philosophy, and distance — impact is generated at the level of worldview, meaning, and the frameworks others use to understand reality.",
  "In the tenth house, this force targets public achievement and structural authority — career, reputation, and public contribution are the primary arenas where initiative produces lasting consequence.",
  "In the eleventh house, this force operates through collective structures and future-oriented systems — networks, communities, and the redesign of how groups function are where initiative creates most consequence.",
  "In the twelfth house, this force operates in private or through service — impact is generated in solitude, through healing work, or through contributions that are largely unseen but structurally essential.",
];

const PLUTO_HOUSE: string[] = [
  "In the first house, transformation is personal and continuous — the self is the primary site of regeneration, and identity undergoes repeated, profound restructuring throughout life.",
  "In the second house, transformation occurs through material reality — values, resources, and the relationship to wealth and security are repeatedly dismantled and rebuilt at a deeper level.",
  "In the third house, transformation occurs through communication and knowledge — the way reality is understood and transmitted undergoes repeated evolution, dissolving frameworks that have reached their limit.",
  "In the fourth house, transformation occurs at the foundation — family structures, psychological roots, and the private self are the primary sites of deep, ongoing regeneration.",
  "In the fifth house, transformation occurs through creative expression and personal risk — what is authentic and genuinely expressive undergoes continuous refining pressure.",
  "In the sixth house, transformation occurs through work and daily systems — methods, health structures, and the mechanics of service are repeatedly overhauled at their root.",
  "In the seventh house, transformation occurs through relationship — every significant partnership becomes a site of mutual regeneration and structural change.",
  "In the eighth house, transformation is at maximum depth — in its natural territory, Pluto regenerates through the most intense experiences available: shared resources, mortality, psychological excavation.",
  "In the ninth house, transformation occurs through belief and worldview — philosophical frameworks, religious systems, and the structures that give life meaning are repeatedly dissolved and rebuilt.",
  "In the tenth house, transformation occurs in public and in career — the structure of authority and professional contribution undergoes profound, repeated restructuring.",
  "In the eleventh house, transformation occurs through collective structures — communities, ideologies, and the systems governing how groups organize are the primary sites of ongoing dismantling and regeneration.",
  "In the twelfth house, transformation occurs in the invisible — the unconscious, spiritual territory, and what is hidden from the self are repeatedly excavated and restructured.",
];

const MERCURY_HOUSE: string[] = [
  "In the first house, intelligence expresses directly — communication is immediate, personal, and oriented toward immediate influence.",
  "In the second house, intelligence orients toward value — analysis is most effective when focused on what is genuinely worth building and sustaining.",
  "In the third house, intelligence is in its natural element — communication multiplies across local networks, and the exchange of ideas is the primary medium of impact.",
  "In the fourth house, intelligence turns inward — private analysis, reflection, and the organization of personal and family structures are where the mind is most productive.",
  "In the fifth house, intelligence moves through creative expression — ideas take form through writing, storytelling, and the willingness to produce original work.",
  "In the sixth house, intelligence is directed toward precision and systematic improvement — analysis finds refinement opportunity before others recognize the problem.",
  "In the seventh house, intelligence operates through dialogue and negotiation — communication is most effective in genuine exchange with a capable counterpart.",
  "In the eighth house, intelligence penetrates depth — the mind is most effective when investigating hidden dynamics, unspoken agreements, and the mechanisms beneath visible circumstances.",
  "In the ninth house, intelligence operates at the level of meaning — ideas move from specific observations to universal principles and transmissible frameworks.",
  "In the tenth house, intelligence supports public authority — communication builds reputation and translates expertise into influence at institutional scale.",
  "In the eleventh house, intelligence operates at systems level — pattern recognition within collective structures and future possibilities is where thinking produces most consequence.",
  "In the twelfth house, intelligence works in private and through synthesis — the mind absorbs at depth before it speaks, and its most significant outputs often emerge from solitary reflection.",
];

const URANUS_HOUSE: string[] = [
  "In the first house, innovation expresses through identity itself — the self is the site of continuous disruption, and the way you exist challenges existing frameworks by its nature.",
  "In the second house, innovation disrupts material and value systems — the relationship to resources and security undergoes repeated evolution, redesigning what wealth means.",
  "In the third house, innovation occurs in communication and knowledge systems — new languages are created for what was previously unspeakable, and the way reality is transmitted is repeatedly redesigned.",
  "In the fourth house, innovation disrupts foundations — domestic structures, family systems, and the architecture of security undergo repeated evolution.",
  "In the fifth house, innovation is expressed through creative disruption — authentic expression becomes impossible to suppress, and what is created consistently challenges conventional form.",
  "In the sixth house, innovation targets systems and methods — existing processes are redesigned at their operational core, finding the flaw that others missed.",
  "In the seventh house, innovation occurs through relationship — the structure of partnership and one-to-one exchange is repeatedly redesigned, often through unexpected encounters.",
  "In the eighth house, innovation disrupts hidden power structures — what was deliberately concealed is surfaced, and the mechanisms of shared power are repeatedly exposed and rebuilt.",
  "In the ninth house, innovation is philosophical — worldview frameworks are rewritten rather than improved from within, and the assumptions governing belief systems are dismantled.",
  "In the tenth house, innovation disrupts institutional authority — existing structures cannot contain what is emerging, and breakthroughs arrive because the current system has reached its limit.",
  "In the eleventh house, innovation operates at collective scale — human organization itself is the target of disruption, and future systems become the primary medium of impact.",
  "In the twelfth house, innovation dissolves invisible boundaries — what was classified as unreachable becomes accessible, and the interior landscape undergoes repeated evolutionary disruption.",
];

const JUPITER_HOUSE: string[] = [
  "In the first house, expansion occurs through self-expression and personal initiative — opportunity is created by how you present yourself and move through the world.",
  "In the second house, expansion occurs through the cultivation of resources — wealth compounds through patient investment in what holds genuine, lasting value.",
  "In the third house, expansion occurs through communication and intellectual exchange — opportunities multiply at the intersection of ideas and relationships.",
  "In the fourth house, expansion occurs through the deepening of foundations — growth comes through building environments where others can develop and belong.",
  "In the fifth house, expansion occurs through creative expression and authentic risk — opportunities multiply when you operate from genuine creative ownership.",
  "In the sixth house, expansion occurs through precision and service — growth compounds through the systematic improvement of process and the quality of daily contribution.",
  "In the seventh house, expansion occurs through partnership and alliance — your most significant opportunities arrive through others and multiply in collaboration.",
  "In the eighth house, expansion occurs through depth and transformation — growth comes from going where others will not, and from the conversion of hidden value into usable form.",
  "In the ninth house, expansion occurs through philosophy, exploration, and the search for meaning — growth multiplies when your work carries a framework others can use to understand reality.",
  "In the tenth house, expansion occurs through reputation and earned authority — opportunity compounds through disciplined positioning and the consistent delivery of what you claim to offer.",
  "In the eleventh house, expansion occurs through collective intelligence and future-oriented thinking — growth comes from seeing what is emerging before it becomes widely recognized.",
  "In the twelfth house, expansion occurs through imagination and service at depth — growth comes through work that carries significance beyond its visible surface, and through contributions that operate quietly but at scale.",
];

const VENUS_HOUSE: string[] = [
  "In the first house, value is defined through personal expression — wealth comes through the originality and authenticity of how you present yourself and what you choose to embody.",
  "In the second house, value is defined through material quality and sensory reality — wealth accumulates through the refinement of what is most essential and genuinely worth keeping.",
  "In the third house, value is defined through communication and intellectual exchange — the ability to transmit ideas across multiple registers is itself a primary resource.",
  "In the fourth house, value is defined through depth of care and emotional quality — wealth comes through environments and relationships where people feel genuinely held.",
  "In the fifth house, value is defined through creative expression and the quality of original work — wealth comes from output that carries a signature others can recognize and feel.",
  "In the sixth house, value is defined through precision and service quality — wealth comes through the exactness of the craft and the genuine usefulness of what is offered.",
  "In the seventh house, value is defined through the quality of relationship and principled exchange — wealth comes through what is made possible between people.",
  "In the eighth house, value is defined through depth and the willingness to engage what others avoid — wealth comes from making the hidden visible and the invisible usable.",
  "In the ninth house, value is defined through meaning, freedom, and the connection to something larger — wealth comes from work that serves a vision beyond personal preference.",
  "In the tenth house, value is defined through mastery and reputation — wealth accumulates through patient, disciplined creation of work that outlasts the conditions that produced it.",
  "In the eleventh house, value is defined through originality and contribution to collective progress — wealth comes from creating something distinct that serves future needs.",
  "In the twelfth house, value is defined through compassion and the dissolution of ordinary separation — wealth comes from making others feel seen in ways they cannot always articulate.",
];

const NEPTUNE_HOUSE: string[] = [
  "In the first house, vision dissolves the boundaries of the self — your ideals seek expression through your direct presence, and you carry a quality of transcendence others encounter in you.",
  "In the second house, vision seeks material embodiment — your ideals dissolve conventional definitions of value and point toward a relationship with resources that carries spiritual rather than merely transactional meaning.",
  "In the third house, vision operates through communication — your ideals create new languages and dissolve the frameworks that prevent understanding.",
  "In the fourth house, vision seeks deep belonging — your ideals dissolve the boundaries between private and collective, and your sense of home is inseparable from your sense of spiritual connection.",
  "In the fifth house, vision seeks creative expression — your ideals dissolve the boundary between personal creativity and collective inspiration.",
  "In the sixth house, vision seeks to make the ideal functional — your ideals are not satisfied with inspiration alone; they want systems, methods, and service structures that embody the highest possible standard.",
  "In the seventh house, vision dissolves the boundary between self and other — your ideals seek relationship as a spiritual territory, and your most significant partnerships carry a quality of collective meaning.",
  "In the eighth house, vision penetrates hidden territory — your ideals seek transformation at depth, dissolving what collective power has concealed and regenerating what was suppressed.",
  "In the ninth house, vision is philosophical and boundary-expanding — your ideals seek to dissolve the separation between belief systems and create frameworks that carry universal rather than merely personal meaning.",
  "In the tenth house, vision seeks public embodiment — your imagination wants architecture. Your ideals seek systems and structures capable of making them real at institutional scale.",
  "In the eleventh house, vision is collective and humanitarian — your ideals seek to dissolve the boundary between individuals and create networks of shared possibility.",
  "In the twelfth house, vision operates at maximum dissolution — in this territory, Neptune makes the boundary between what is personal and what is universal entirely permeable.",
];

const SUN_HOUSE: string[] = [
  "In the first house, identity develops through direct self-expression — your creative center radiates most powerfully when you operate as yourself without mediation.",
  "In the second house, identity develops through what you build and value — your creative center is expressed through the quality of what you cultivate and the resources you steward.",
  "In the third house, identity develops through communication and the exchange of ideas — your creative center finds expression in the transmission of what you understand.",
  "In the fourth house, identity develops through the cultivation of foundations — your creative center is expressed through what you create for those closest to you and the environment you build.",
  "In the fifth house, identity develops through creative expression and play — your creative center is most fully expressed when you are making something original.",
  "In the sixth house, identity develops through service and the refinement of craft — your creative center expresses through the quality and precision of your daily contribution.",
  "In the seventh house, identity develops through relationship — your creative center is shaped and expressed through significant one-to-one partnerships.",
  "In the eighth house, identity develops through transformation and depth — your creative center is forged through what you survive and what you release.",
  "In the ninth house, identity develops through exploration and the search for meaning — your creative center expresses through the frameworks you build and the distances you travel.",
  "In the tenth house, identity develops through public achievement and the construction of lasting authority — your creative center seeks visible expression in the world.",
  "In the eleventh house, identity develops through contribution to collective systems — your creative center expresses through future-oriented thinking and the communities you help create.",
  "In the twelfth house, identity develops through dissolution and the transcendence of ordinary boundaries — your creative center operates at depth, often expressing most powerfully through private work.",
];

const MOON_HOUSE: string[] = [
  "In the first house, emotional processing happens immediately and visibly — your internal state registers directly in your body and presence.",
  "In the second house, emotional processing is grounded in material reality — security and resource availability directly shape your internal stability.",
  "In the third house, emotional processing happens through communication — talking, writing, and active exchange are how experience becomes integrated.",
  "In the fourth house, emotional processing is deeply interior and long-holding — your home and private environment are the primary sites of integration.",
  "In the fifth house, emotional processing happens through creative expression — play, making, and self-expression are how experience becomes usable.",
  "In the sixth house, emotional processing is systematic — experience is organized through analysis, improvement, and the identification of what can be done.",
  "In the seventh house, emotional processing is relational — your internal calibration is deeply tied to the quality of your significant partnerships.",
  "In the eighth house, emotional processing happens at depth — experience is not simply remembered but absorbed into the operating structure, transformed over time.",
  "In the ninth house, emotional processing seeks meaning — experience settles most fully when you understand why it happened and what it points toward.",
  "In the tenth house, emotional processing is practical and structural — feeling converts into function, and experience becomes material for mastery.",
  "In the eleventh house, emotional processing is conceptual — you understand experiences analytically before you feel them fully.",
  "In the twelfth house, emotional processing is absorptive and permeable — what happens in the environment becomes part of your inner landscape before you can separate it.",
];

const SATURN_HOUSE: string[] = [
  "In the first house, mastery is developed through the disciplined cultivation of self-authority — the work is learning to trust your own structure without requiring external validation.",
  "In the second house, mastery is developed through patient material cultivation — genuine resources are built through sustained, deliberate effort rather than speed.",
  "In the third house, mastery is developed through disciplined communication — the work is learning to transmit depth with precision, to say more by saying less.",
  "In the fourth house, mastery is developed through the construction of stable foundations — emotional boundaries and responsible stewardship of what you care for are the primary discipline.",
  "In the fifth house, mastery is developed through creative commitment — the work is sustaining authentic expression even when it is not immediately recognized.",
  "In the sixth house, mastery is developed through systematic excellence — precision applied consistently over time produces capability that talent alone cannot generate.",
  "In the seventh house, mastery is developed through principled relationship — the discipline is building agreements and structures that remain fair under pressure.",
  "In the eighth house, mastery is developed through the conscious direction of intensity — depth without being consumed by it, power directed rather than wielded reactively.",
  "In the ninth house, mastery is developed through meaningful commitment — the work is focusing expansive vision into a coherent, embodied direction.",
  "In the tenth house, mastery is developed through long-range construction — in this natural territory, Saturn produces maximum structural authority through patient, methodical building.",
  "In the eleventh house, mastery is developed through collective responsibility — the discipline is creating systems that serve communities rather than only individuals.",
  "In the twelfth house, mastery is developed through the invisible — structure must be built around what cannot always be measured: intuition, creativity, and the insights that arrive without explanation.",
];

// ─── Per-planet practical expression ─────────────────────────────────────────

const MARS_PRACTICAL: string[] = [
  "In practice, this means you are most effective at the beginning of a cycle — designing the first move, breaking inertia, and establishing the direction. Your output is most powerful when it does not wait for external permission.",
  "In practice, this means your most significant impact arrives through sustained pressure rather than rapid bursts — the things you build are designed to last, and they do.",
  "In practice, this means you are most effective when covering multiple channels simultaneously — your ability to initiate across different domains is a core operational asset.",
  "In practice, this means your initiating force is most productive when it protects what matters — the capacity to mobilize resources in defense of what you value is a consistent strength.",
  "In practice, this means your leadership presence itself generates momentum — others move when you move, and your willingness to be first gives others permission to follow.",
  "In practice, this means your most powerful force expression comes after refinement — moving quickly is less effective than moving with precision, and the gap between impulse and action is where your most consequential work happens.",
  "In practice, this means your most effective impact is relational — alliances, timing, and the willingness to move in coordination with others amplify your force rather than depleting it.",
  "In practice, this means your most powerful work targets what others overlook — depth of engagement with the most difficult territory is where your initiative produces disproportionate consequence.",
  "In practice, this means your force travels further than its origin — the ideas and frameworks you generate continue operating long after the initial impulse.",
  "In practice, this means your most effective work builds structural change over time — slow-burning, long-range impact is where your force compounds rather than expends.",
  "In practice, this means your impact is systemic rather than individual — redesigning how structures work produces more consequence than operating within them.",
  "In practice, this means your force is most powerful when it flows with rather than against environments — pervasive, quiet influence rather than direct confrontation.",
];

const PLUTO_PRACTICAL: string[] = [
  "The practical expression of Pluto in Aries is the capacity to begin again after complete dissolution — not merely to recover, but to rebuild with greater precision than before.",
  "The practical expression of Pluto in Taurus is the capacity for total material transformation — the ability to replace foundations rather than adjust surfaces.",
  "The practical expression of Pluto in Gemini is the reframing of invisible assumptions — you disrupt not the content of established ideas but the architecture that holds them in place.",
  "The practical expression of Pluto in Cancer is psychological depth — what you surface from emotional excavation becomes the foundation for structural regeneration.",
  "The practical expression of Pluto in Leo is creative reinvention — you can dissolve false identities and rebuild from authentic creative authority.",
  "The practical expression of Pluto in Virgo is radical systemic overhaul — you identify the mechanism that is failing before it produces visible breakdown.",
  "The practical expression of Pluto in Libra is the rebuilding of principled structures — you dissolve imbalanced agreements and rebuild them on grounds of genuine fairness.",
  "The practical expression of Pluto in Scorpio is maximum transformational depth — you work at the level of hidden power and operate where others cannot or will not go.",
  "The practical expression of Pluto in Sagittarius is philosophical evolution — you dismantle belief systems that have reached their productive limit.",
  "The practical expression of Pluto in Capricorn is institutional dismantling — you expose where structural authority no longer serves the purpose it was built to fulfill.",
  "The practical expression of Pluto in Aquarius is collective transformation — you disrupt social and technological systems at their root rather than their surface.",
  "The practical expression of Pluto in Pisces is boundary dissolution — you generate evolution by making continuous what was previously held as separate.",
];

const MERCURY_PRACTICAL: string[] = [
  "The practical expression is direct, decision-oriented communication — ideas are presented as calls to action, and your translation function works best at the front of a cycle rather than in the middle of one.",
  "The practical expression is the ability to create durable, testable frameworks from abstract insight — your most effective communication produces something others can hold and use.",
  "The practical expression is rapid synthesis across multiple channels — you can name the pattern before others have finished processing the components.",
  "The practical expression is communication through felt meaning — your most effective transmission is not purely cognitive but carries experiential depth others absorb before they consciously understand it.",
  "The practical expression is narrative framing — you translate complex understanding into story others can enter and navigate.",
  "The practical expression is precision analysis — you identify the refinement opportunity and communicate it with exactness before others recognize the gap.",
  "The practical expression is diplomatic translation — you convert conflict into resolution through equitable language and principled framing.",
  "The practical expression is the surfacing of hidden dynamics — you name the unspoken agreements and invisible mechanisms beneath visible exchange.",
  "The practical expression is meaning-making at scale — you move from specific observation to transmissible principle that can carry further than its origin.",
  "The practical expression is institutional translation — you convert insight into language that commands sustained attention from structures and systems.",
  "The practical expression is systems-level pattern recognition — you identify the collective structures and translate them into future frameworks before others see them clearly.",
  "The practical expression is symbolic, intuitive communication — you perceive the whole before the parts are visible and transmit it through channels that carry meaning beneath language.",
];

// ─── Sign text tables (same as before) ────────────────────────────────────────

const MARS_FORCE: string[] = [
  "direct initiation — you are designed to move first, generating momentum where none previously existed",
  "patient, sustained pressure — your force builds through deliberate consistency that compounds over time",
  "adaptive, multi-directional movement — your impact spreads by covering multiple channels simultaneously",
  "protective, resource-driven action — your force mobilizes what matters and resists what wastes it",
  "expressive, leadership-centered energy — your presence itself generates movement and authority",
  "precise, methodical execution — your force is most effective after it has been refined",
  "strategic, relationship-oriented influence — you create impact through timing, alliance, and alignment",
  "concentrated, penetrating depth — your force targets what others miss or avoid",
  "expansive, philosophy-driven momentum — you create impact through ideas that travel further than their source",
  "disciplined, long-range force — you build structural change over time rather than rapid disruption",
  "collective, system-disrupting energy — your impact comes from redesigning how things work",
  "intuitive, pervasive influence — your force flows through environments and relationships, not against them",
];

const PLUTO_TRANSFORM: string[] = [
  "regeneration through bold reinvention — dismantling what hesitation leaves incomplete",
  "slow, total material transformation — replacing foundations rather than adjusting surfaces",
  "transformation through reframing — disrupting the invisible architecture of established ideas",
  "psychological regeneration through emotional excavation — surfacing what is buried before it builds pressure",
  "transformation through creative reinvention and reclaimed identity — dissolving false structures",
  "regeneration through radical refinement — systematically overhauling what no longer performs",
  "transformation through dissolution of imbalanced structures — rebuilding on principled ground",
  "maximum intensity transformation — the instinct for identifying hidden mechanisms beneath visible circumstances",
  "philosophical evolution — dismantling belief systems that have reached their limit",
  "systematic structural dismantling — exposing where institutional authority no longer serves its purpose",
  "collective-level transformation — disrupting social and technological systems at their root",
  "transformation through boundary dissolution — generating evolution by making the separate continuous",
];

const MERCURY_TRANSLATE: string[] = [
  "directly and decisively — presenting ideas as calls to action without intermediary steps",
  "deliberately and with tangible grounding — translating insight into durable, testable frameworks",
  "rapidly and across multiple channels — synthesizing information faster than the components can be named",
  "through emotional intelligence and felt meaning — absorbing context and translating experience into language",
  "through narrative and creative authority — framing complex understanding as story others can enter",
  "with precision and analytical clarity — identifying refinement opportunity before others recognize the problem",
  "through balance and diplomatic framing — translating conflict into resolution through equitable language",
  "through penetrating depth — surfacing the hidden dynamics and unspoken agreements beneath visible exchange",
  "through expansive meaning-making — moving from specific observation to universal principle",
  "with structural precision — translating insight into institutional authority that commands sustained attention",
  "at systems level — identifying patterns within collective structures and translating them into future frameworks",
  "through symbolism, intuition, and interconnected pattern — perceiving the whole before the parts are visible",
];

const URANUS_INNOVATE: string[] = [
  "through disruptive initiation — your breakthroughs arrive before the system is ready to accommodate them",
  "through the systematic redesign of material and value systems — your innovation targets what appears most stable",
  "through communication disruption — your innovation creates new languages for what was previously unspeakable",
  "through domestic and psychological paradigm shifts — your innovation restructures what security means",
  "through creative disruption — your innovation makes authentic expression impossible to suppress",
  "through precision disruption — your innovation finds the flaw in complex systems and redesigns the mechanism",
  "through the disruption of relationship and justice systems — your innovation restructures fairness itself",
  "through the disruption of hidden power structures — your innovation surfaces what was deliberately concealed",
  "through philosophical disruption — your innovation rewrites worldview frameworks rather than improving within them",
  "through institutional disruption — your breakthroughs emerge because existing structures cannot carry what is coming",
  "through collective-level disruption — your innovation operates at the scale of human organization",
  "through the dissolution of invisible boundaries — your innovation makes possible what was classified as unreachable",
];

const JUPITER_EXPAND: string[] = [
  "Jupiter in Aries expands through bold, self-directed enterprise. Growth comes from moving ahead of the field rather than optimizing within it — your opportunities are created, not found.",
  "Jupiter in Taurus expands through patient cultivation and tangible accumulation. Growth compounds through consistent investment in what holds genuine, lasting value.",
  "Jupiter in Gemini expands through information, connection, and the multiplication of perspectives. Growth multiplies at intersections — where ideas meet, opportunities emerge.",
  "Jupiter in Cancer expands through nurturing, emotional intelligence, and the depth of what you build around people. Growth comes through creating environments where others can develop and thrive.",
  "Jupiter in Leo expands through creative authority, inspired leadership, and the power of authentic expression. Growth multiplies when you are operating from genuine creative ownership.",
  "Jupiter in Virgo expands through refinement, service, and systematic improvement. Growth comes through the compounding effect of small, precise improvements applied with consistent attention.",
  "Jupiter in Libra expands through partnership, strategic alliance, and the creation of relational value. Growth multiplies in collaboration — your most significant opportunities arrive through others.",
  "Jupiter in Scorpio expands through depth, investigation, and the transformation of what has been hidden. Growth comes from going where others will not.",
  "Jupiter in Sagittarius expands through philosophy, vision, travel, and the search for larger meaning. Growth multiplies when your work carries a framework others can use to understand reality.",
  "Jupiter in Capricorn expands through discipline, strategic positioning, and the patient accumulation of earned authority. Growth comes through reputation — through being exactly what you claim to be.",
  "Jupiter in Aquarius expands through innovation, collective intelligence, and future-oriented thinking. Growth comes from seeing possibilities that are not yet fully developed.",
  "Jupiter in Pisces expands through imagination, compassion, and the creation of meaning that transcends the visible. Growth comes through work that carries significance beyond its surface form.",
];

const VENUS_VALUE: string[] = [
  "Venus in Aries determines value through originality, courage, and the willingness to go first. Wealth comes from pioneering — from creating something that did not exist before you introduced it.",
  "Venus in Taurus determines value through quality, sensory reality, and genuine worth. Wealth accumulates through the refinement of what is most essential — you are designed to build things that endure.",
  "Venus in Gemini determines value through versatility, wit, and intellectual range. Wealth comes from the ability to communicate across multiple registers — your mind itself is a primary resource.",
  "Venus in Cancer determines value through emotional depth, care, and the quality of what you provide to others. Wealth comes through environments and relationships where people feel genuinely held.",
  "Venus in Leo determines value through authentic creative expression, warmth, and generous recognition. Wealth comes from inspired work that carries a signature others can feel.",
  "Venus in Virgo determines value through precision, service, and careful refinement. Wealth comes through the quality of your analysis and the exactness of your craft.",
  "Venus in Libra determines value through beauty, balance, and the quality of relationship. Wealth comes through what you make possible between people — your ability to create fair, elegant exchange.",
  "Venus in Scorpio determines value through depth, intensity, and the willingness to engage what others avoid. Wealth comes from making the hidden visible and the invisible usable.",
  "Venus in Sagittarius determines value through freedom, meaning, and expansive vision. Wealth comes from connecting what you create to something larger than personal preference.",
  "Venus in Capricorn determines value through mastery, reputation, and the long-term quality of what is built. Wealth accumulates through patient, disciplined creation of something that outlasts the moment.",
  "Venus in Aquarius determines value through originality, intelligence, and contribution to collective progress. Wealth comes from creating something distinct — from refusing to copy what already exists.",
  "Venus in Pisces determines value through compassion, imagination, and the dissolution of ordinary separation. Wealth comes from making others feel seen in ways they cannot always articulate.",
];

const NEPTUNE_VISION: string[] = [
  "Neptune in Aries gives vision a pioneering quality — your ideals seek entirely new beginnings and resist repetition of what already exists.",
  "Neptune in Taurus gives vision a material grounding — your ideals seek tangible, enduring form rather than remaining in the realm of inspiration.",
  "Neptune in Gemini gives vision a communicative quality — your ideals dissolve old frameworks of knowledge and create new languages for emerging understanding.",
  "Neptune in Cancer gives vision a protective depth — your ideals seek to create belonging and safety at collective scale.",
  "Neptune in Leo gives vision a creative, expressive quality — your ideals seek to inspire collective imagination through the power of authentic expression.",
  "Neptune in Virgo gives vision a refinement quality — your ideals seek to perfect systems of service and make the ideal functional rather than merely beautiful.",
  "Neptune in Libra gives vision a relational, harmonizing quality — your ideals seek to dissolve what separates people and create the conditions for collective beauty.",
  "Neptune in Scorpio gives vision a transformational depth — your ideals seek to dissolve hidden corruption and reveal what collective power has concealed.",
  "Neptune in Sagittarius gives vision a philosophical, boundary-expanding quality — your ideals seek to dissolve the separation between belief systems and create frameworks that carry universal meaning.",
  "Neptune in Capricorn gives vision a structural purpose — your imagination seeks embodiment. Your visions want systems. Your ideas want architecture capable of making them real.",
  "Neptune in Aquarius gives vision a collective, humanitarian quality — your ideals seek to dissolve the boundary between individuals and create networks of shared possibility.",
  "Neptune in Pisces gives vision maximum dissolution power — in its home sign, Neptune dissolves every boundary between what is personal and what is universal.",
];

const SUN_IDENTITY: string[] = [
  "Your Consciousness begins with Sun in Aries, where identity develops through action. You discover yourself by creating, initiating, and choosing your own direction — not through reflection alone, but through the evidence of what happens when you move.",
  "Your Consciousness begins with Sun in Taurus, where identity develops through presence and material mastery. You discover yourself through what you build and what you can sustain — self-definition deepens through endurance.",
  "Your Consciousness begins with Sun in Gemini, where identity develops through exchange, learning, and the multiplicity of perspectives. You discover yourself through connection — self-definition is built through dialogue and the movement between ideas.",
  "Your Consciousness begins with Sun in Cancer, where identity develops through emotional depth and the cultivation of security. You discover yourself through what you protect and what protects you — self-definition is inseparable from what you care for.",
  "Your Consciousness begins with Sun in Leo, where identity develops through creative expression and the experience of being seen. You discover yourself through authorship — self-definition deepens when what you create reflects who you genuinely are.",
  "Your Consciousness begins with Sun in Virgo, where identity develops through refinement, service, and the pursuit of precision. You discover yourself through what you improve — self-definition is tied to the quality of your craft.",
  "Your Consciousness begins with Sun in Libra, where identity develops through relationship and the pursuit of balance. You discover yourself in the mirror of others — self-definition is refined through the standards of fairness and beauty you uphold.",
  "Your Consciousness begins with Sun in Scorpio, where identity develops through transformation and depth. You discover yourself through what you have survived and what you have released — self-definition is forged in the pressure of experience.",
  "Your Consciousness begins with Sun in Sagittarius, where identity develops through exploration, meaning, and the expansion of worldview. You discover yourself through inquiry — self-definition is shaped by what you have come to believe and why.",
  "Your Consciousness begins with Sun in Capricorn, where identity develops through achievement, discipline, and the construction of lasting authority. You discover yourself through what you build over time — self-definition is inseparable from mastery.",
  "Your Consciousness begins with Sun in Aquarius, where identity develops through originality and the freedom to think differently. You discover yourself through divergence — self-definition is sharpened by what you refuse to accept.",
  "Your Consciousness begins with Sun in Pisces, where identity develops through dissolution and the transcendence of ordinary boundaries. You discover yourself through surrender — self-definition is fluid and deepened by experience rather than fixed by choice.",
];

const MOON_PROCESS: string[] = [
  "Moon in Aries processes experience through immediate, instinctive response. Your emotional system reacts first and integrates later — experience is marked by what you chose to do in the moment.",
  "Moon in Taurus processes experience through embodied memory and sensory retention. Your emotional system records in the body — what you remember most deeply is how things felt, not what was said.",
  "Moon in Gemini processes experience through mental activity and language. Your emotional system organizes itself through talking, writing, and thinking — processing happens in communication.",
  "Moon in Cancer processes experience through emotional absorption and long memory. Your emotional system holds what others release — experiences become part of your structure.",
  "Moon in Leo processes experience through the lens of recognition and creative meaning. Your emotional system needs to know that what happened mattered and was witnessed.",
  "Moon in Virgo processes experience through analysis and refinement. Your emotional system organizes distress by finding what can be improved — you process by identifying what you can do.",
  "Moon in Libra processes experience through the quality of relationship present in it. Your emotional system is calibrated to fairness — what disturbs you most is sustained imbalance.",
  "Moon in Scorpio processes experience through depth and transformation. Events are not simply remembered — they become part of your internal architecture. What you absorb, you carry until it transforms you.",
  "Moon in Sagittarius processes experience through meaning and expansion. Your emotional system is most settled when it can understand why something happened and what it points toward.",
  "Moon in Capricorn processes experience through practical integration and structural response. Your emotional system converts feeling into function — what you experience becomes material for mastery.",
  "Moon in Aquarius processes experience through detachment and pattern recognition. Your emotional system observes rather than immerses — you understand feelings conceptually before you feel them fully.",
  "Moon in Pisces processes experience through absorption and dissolution. Your emotional system is permeable — what happens around you becomes part of your inner landscape before you can separate it.",
];

const SATURN_MASTERY: string[] = [
  "Saturn in Aries teaches the discipline of courageous, self-directed action. Mastery comes through learning that consistent initiative — not only bold beginnings — creates lasting authority.",
  "Saturn in Taurus teaches the discipline of patience and material mastery. Mastery comes through building genuine resources — not through speed, but through the quality of sustained, deliberate effort.",
  "Saturn in Gemini teaches the discipline of focused communication. Mastery comes through learning to transmit depth with precision — to say more by saying less.",
  "Saturn in Cancer teaches the discipline of emotional boundaries and responsible care. Mastery comes through learning what to hold and what to release from the unending flow of experience.",
  "Saturn in Leo teaches the discipline of creative commitment. Mastery comes through learning to sustain authentic expression even when it is not immediately recognized or rewarded.",
  "Saturn in Virgo teaches the discipline of systematic excellence. Mastery comes through the refinement of process — not through talent, but through the consistent application of precision over time.",
  "Saturn in Libra teaches the discipline of principled relationship. Mastery comes through building agreements and structures that remain fair under pressure.",
  "Saturn in Scorpio teaches the discipline of conscious power. Mastery comes through transforming intensity into precision — learning to direct depth without being consumed by it.",
  "Saturn in Sagittarius teaches the discipline of meaningful commitment. Mastery comes through focusing expansive vision into a coherent, embodied direction.",
  "Saturn in Capricorn teaches the discipline of long-range mastery. In its home sign, Saturn operates with maximum authority — mastery comes through patient, methodical construction of something designed to endure.",
  "Saturn in Aquarius teaches the discipline of collective responsibility. Mastery comes through creating systems that serve communities rather than only individuals.",
  "Saturn in Pisces teaches the discipline of the invisible. Mastery comes through creating structure around what cannot always be measured: intuition, creativity, imagination, and the insights that arrive without explanation.",
];

// ─── Per-planet developmental edges (brief, per-planet) ───────────────────────

const MARS_DEV_EDGE: string[] = [
  "The developmental edge is precision in targeting — initiation is fast, but consequence requires the force to be aimed before it is released.",
  "The developmental edge is course-correction — sustained pressure is a strength, but knowing when an approach has reached its limit prevents endurance from becoming inertia.",
  "The developmental edge is depth of execution — multiple channels can be opened simultaneously, but each requires sustained follow-through rather than rapid initiation.",
  "The developmental edge is mobility — protective instincts are powerful, but defending what exists can prevent the redirection necessary when circumstances shift.",
  "The developmental edge is sustained follow-through — leading naturally, but the gap between inspiration and completion requires consistent, unglamorous effort.",
  "The developmental edge is timeliness — precision is the strength, but over-refinement delays release past the productive threshold.",
  "The developmental edge is directness — strategic patience is an asset, but excessive calibration can delay the initiative that creates the opportunity.",
  "The developmental edge is breadth — depth is natural, but certain consequences require a wider initial surface before concentration is applied.",
  "The developmental edge is execution — ideas travel far, but converting vision into specific, time-bound action requires deliberate translation of the expansive into the concrete.",
  "The developmental edge is agility — long-range structural force is the strength, but rapid response to changed conditions requires a different gear.",
  "The developmental edge is individual follow-through — systemic redesign is natural, but collective change still requires individual momentum to sustain it.",
  "The developmental edge is directed application — pervasive influence is real, but diffuse force produces less consequence than force channeled toward a specific outcome.",
];

const JUPITER_DEV_EDGE: string[] = [
  "The developmental edge is selection discipline — the capacity to identify opportunity is strong, but not every viable opening deserves full resource allocation.",
  "The developmental edge is distribution — the quality of what is cultivated is high, but over-refinement can delay value from reaching those it was built to serve.",
  "The developmental edge is committed direction — expansion through ideas is natural, but multiplying possibilities without choosing among them prevents compounding.",
  "The developmental edge is sustainable boundaries — creating environments for others to grow is a strength, but absorbing others' development without limits can deplete the system.",
  "The developmental edge is continuation — creative expansion is natural, but sustaining the work beyond the inspiring initial phase requires a different discipline.",
  "The developmental edge is completion — systematic improvement compounds, but stopping to release before the next refinement is applied requires a deliberate threshold.",
  "The developmental edge is independent initiative — opportunity arrives through others, but depending exclusively on external connection can create overexposure to circumstances outside your control.",
  "The developmental edge is sustainability — going where others will not is a genuine competitive advantage, but depth without recovery can exhaust the system that produces it.",
  "The developmental edge is embodiment — the framework is clear, but translating philosophical vision into specific, executable steps requires a different kind of precision.",
  "The developmental edge is flexibility — strategic authority is a strength, but the precision required to build reputation can produce rigidity when circumstances require a different approach.",
  "The developmental edge is implementation — future possibilities are visible early, but converting vision into current, operational systems requires a translation step that innovation does not naturally include.",
  "The developmental edge is distribution — meaning is created, but getting it into the hands of those who need it requires a different mechanism than generating it.",
];

const SATURN_DEV_EDGE: string[] = [
  "The developmental edge is structural continuity — courage and initiative are strong, but consistency of effort between bold beginnings is where lasting authority is actually built.",
  "The developmental edge is adaptability — patient cultivation is a strength, but knowing when the investment has reached its productive limit requires releasing what is no longer compounding.",
  "The developmental edge is depth — precise communication is a strength, but the discipline of transmitting complex understanding without oversimplification is the ongoing work.",
  "The developmental edge is release — responsible stewardship is real, but carrying others' experience indefinitely depletes the structure that makes care sustainable.",
  "The developmental edge is durability — creative commitment is the strength, but sustaining expression without external recognition requires an internal authority that is the work of this placement.",
  "The developmental edge is completion — systematic precision is a strength, but perfectionism that delays release produces diminishing returns beyond the productive threshold.",
  "The developmental edge is self-authority — principled relationship is the strength, but the structure must be maintained internally rather than requiring external agreement to hold.",
  "The developmental edge is integration — conscious power is real, but transforming intensity into precision rather than suppressing it is the ongoing disciplinary work.",
  "The developmental edge is concreteness — meaningful direction is the strength, but vision without specific, committed execution cannot compound into lasting structure.",
  "The developmental edge is flexibility — long-range structural authority is powerful, but the capacity to adapt when circumstances require a different architecture is what prevents endurance from becoming rigidity.",
  "The developmental edge is personal accountability — collective responsibility is real, but ensuring individual follow-through within the collective system is where structural drift most often occurs.",
  "The developmental edge is tangibility — invisible structure is a real contribution, but converting intuition and creative insight into forms others can engage requires deliberate translation.",
];

// ─── Titles ───────────────────────────────────────────────────────────────────

function impactTitle(marsEl: El, plutoEl: El): string {
  const map: Record<`${El}_${El}`, string> = {
    fire_fire: "The Pioneering Catalyst", fire_earth: "The Transformational Initiator",
    fire_air: "The Disruptive Creator", fire_water: "The Regenerative Pioneer",
    earth_fire: "The Strategic Innovator", earth_earth: "The Methodical Architect",
    earth_air: "The Systematic Reformer", earth_water: "The Transformational Builder",
    air_fire: "The Dynamic Strategist", air_earth: "The Analytical Reformer",
    air_air: "The Pattern Disruptor", air_water: "The Penetrating Translator",
    water_fire: "The Intuitive Catalyst", water_earth: "The Depth Architect",
    water_air: "The Perceptive Innovator", water_water: "The Transformational Alchemist",
  };
  return map[`${marsEl}_${plutoEl}`] ?? "The Transformational Initiator";
}

function wealthTitle(jupEl: El, venEl: El): string {
  const map: Record<`${El}_${El}`, string> = {
    fire_fire: "The Expansive Creator", fire_earth: "The Visionary Builder",
    fire_air: "The Inspired Connector", fire_water: "The Abundant Transformer",
    earth_fire: "The Productive Innovator", earth_earth: "The Material Architect",
    earth_air: "The Systems Cultivator", earth_water: "The Grounded Visionary",
    air_fire: "The Dynamic Innovator", air_earth: "The Future Systems Builder",
    air_air: "The Intellectual Creator", air_water: "The Collective Architect",
    water_fire: "The Intuitive Expander", water_earth: "The Depth Value Creator",
    water_air: "The Empathic Innovator", water_water: "The Abundant Alchemist",
  };
  return map[`${jupEl}_${venEl}`] ?? "The Future Systems Builder";
}

function consciousnessTitle(sunEl: El, moonEl: El): string {
  const map: Record<`${El}_${El}`, string> = {
    fire_fire: "The Courageous Creator", fire_earth: "The Resourceful Pioneer",
    fire_air: "The Visionary Thinker", fire_water: "The Integrated Alchemist",
    earth_fire: "The Disciplined Initiator", earth_earth: "The Masterful Builder",
    earth_air: "The Grounded Strategist", earth_water: "The Embodied Transformer",
    air_fire: "The Dynamic Communicator", air_earth: "The Practical Visionary",
    air_air: "The Pattern Master", air_water: "The Perceptive Architect",
    water_fire: "The Intuitive Pioneer", water_earth: "The Depth Architect",
    water_air: "The Empathic Thinker", water_water: "The Mystical Architect",
  };
  return map[`${sunEl}_${moonEl}`] ?? "The Integrated Alchemist";
}

function impactFormula(_marsEl: El, _mercEl: El): string {
  return "Force → Expression → Genius → Consequence";
}
function wealthFormula(_jupEl: El): string {
  return "Opportunity → Refinement → Meaning → Value";
}
function consciousnessFormula(_sunEl: El, _moonEl: El): string {
  return "Experience → Integration → Embodiment";
}

// ─── Strengths ────────────────────────────────────────────────────────────────

function impactStrengths(marsEl: El, mercEl: El, plutoSi: number): WealthStrength[] {
  const FIRE_STRENGTHS: WealthStrength[] = [
    { label: "Initiator", description: "Creates momentum by acting where others remain in preparation." },
    { label: "Catalyst", description: "Presence accelerates processes that were already ready to change." },
    { label: "Risk Intelligence", description: "Distinguishes between productive risk and unnecessary exposure." },
  ];
  const EARTH_STRENGTHS: WealthStrength[] = [
    { label: "Persistent Builder", description: "Converts long-term effort into structural results others can rely on." },
    { label: "Material Translator", description: "Turns abstract intention into measurable, tangible output." },
    { label: "Reliability", description: "Creates trust through consistent follow-through rather than dramatic delivery." },
  ];
  const AIR_STRENGTHS: WealthStrength[] = [
    { label: "Pattern Recognizer", description: "Sees the underlying structure beneath visible problems before others name it." },
    { label: "Translator", description: "Converts complex, abstract, or emotional concepts into language others can apply." },
    { label: "Strategic Connector", description: "Links people, ideas, and opportunities across boundaries." },
  ];
  const WATER_STRENGTHS: WealthStrength[] = [
    { label: "Depth Reader", description: "Perceives what is operating beneath the surface of situations and people." },
    { label: "Emotional Intelligence", description: "Converts felt awareness into actionable understanding." },
    { label: "Regenerative Capacity", description: "Rebuilds from disruption with greater precision than before." },
  ];
  const shared: WealthStrength[] = [
    { label: "System Reformer", description: "Naturally identifies where existing structures can evolve and creates what replaces them." },
    { label: "Transformational Force", description: "Creates change by addressing root causes rather than surface symptoms." },
  ];
  const base = marsEl === "fire" ? FIRE_STRENGTHS : marsEl === "earth" ? EARTH_STRENGTHS : marsEl === "air" ? AIR_STRENGTHS : WATER_STRENGTHS;
  const extra = mercEl === "air" || mercEl === "fire"
    ? { label: "Clear Communicator", description: "Translates the full complexity of insight into language others can receive and act on." }
    : { label: "Deep Communicator", description: "Transmits meaning beneath what words alone can carry — felt as much as understood." };
  return [...base, ...shared.slice(0, 2 - (base.length > 3 ? 1 : 0)), extra].slice(0, 5);
}

function wealthStrengths(jupEl: El, venEl: El): WealthStrength[] {
  const byJup: Record<El, WealthStrength[]> = {
    fire: [
      { label: "Visionary", description: "Sees opportunities before they become obvious to others." },
      { label: "Growth Creator", description: "Generates expansion through inspired initiative rather than incremental optimization." },
    ],
    earth: [
      { label: "Reliable Builder", description: "Converts opportunity into sustainable structures others can depend on." },
      { label: "Long-Range Investor", description: "Recognizes which investments will compound over time." },
    ],
    air: [
      { label: "Future-Oriented Creator", description: "Naturally sees what is emerging before it becomes a recognized possibility." },
      { label: "Framework Builder", description: "Creates intellectual and organizational structures around emerging ideas." },
    ],
    water: [
      { label: "Intuitive Opportunity Reader", description: "Perceives where genuine value lies before the market confirms it." },
      { label: "Community Creator", description: "Builds environments where others develop and contribute." },
    ],
  };
  const byVen: Record<El, WealthStrength[]> = {
    fire: [{ label: "Innovator", description: "Finds alternative pathways when conventional approaches become limiting." }],
    earth: [{ label: "Quality Architect", description: "Ensures what is created has genuine, lasting worth rather than surface appeal." }],
    air: [{ label: "Collective Thinker", description: "Creates greatest value when working with and for others." }],
    water: [{ label: "Depth Value Creator", description: "Generates worth through emotional resonance and transformational depth." }],
  };
  const shared: WealthStrength = { label: "Architect", description: "Turns abstract ideas and visions into usable, functional systems." };
  return [...byJup[jupEl], ...byVen[venEl], shared].slice(0, 5);
}

function consciousnessStrengths(sunEl: El, moonEl: El): WealthStrength[] {
  const bySun: Record<El, WealthStrength[]> = {
    fire: [
      { label: "Self-Renewal", description: "Capable of profound reinvention when old forms no longer serve the work." },
      { label: "Courageous Initiation", description: "Moves toward what others hesitate to approach." },
    ],
    earth: [
      { label: "Embodied Mastery", description: "Converts experience into durable, practical wisdom that can be transmitted." },
      { label: "Endurance", description: "Sustains commitment through difficulty rather than abandoning what has not yet compounded." },
    ],
    air: [
      { label: "Intellectual Depth", description: "Understands what drives situations before others have named the question." },
      { label: "Adaptive Intelligence", description: "Adjusts frameworks in real time rather than defending positions." },
    ],
    water: [
      { label: "Depth", description: "Understands experiences beneath their surface meaning." },
      { label: "Intuitive Mastery", description: "Perceives patterns beyond immediate evidence." },
    ],
  };
  const byMoon: Record<El, WealthStrength> = {
    fire: { label: "Resilience", description: "Transforms challenge into direction — setbacks become intelligence." },
    earth: { label: "Integration", description: "Turns lived experience into structure others can apply." },
    air: { label: "Pattern Translation", description: "Converts internal insight into communicable understanding." },
    water: { label: "Emotional Intelligence", description: "Transforms experience into compassion, clarity, and depth." },
  };
  const shared: WealthStrength = { label: "Wisdom Creation", description: "Turns the accumulation of experience into insight that operates across situations." };
  return [...bySun[sunEl], byMoon[moonEl], shared].slice(0, 5);
}

// ─── Developmental edges (force-level) ───────────────────────────────────────

function impactEdge(marsEl: El, _mercSi: number): string[] {
  const forceEdge: Record<El, string> = {
    fire: "Force without direction. The initiation mechanism is strong — movement is instinctive and rapid. The developmental challenge is that rapid initiation does not automatically produce directed consequence. Force that is not aimed at a specific outcome disperses before it accumulates into structural impact.",
    earth: "Power without control. The capacity for sustained force is present, but the same quality that produces endurance can prevent correction. When an approach has reached its productive limit, the ability to maintain effort becomes a liability rather than an asset.",
    air: "Insight without execution. The pattern recognition and translation functions operate quickly — often identifying what needs to change before the mechanism for changing it is clear. The developmental gap is between what is understood and what is implemented.",
    water: "Innovation without implementation. The perception of what is needed arrives faster than the system for delivering it. The developmental challenge is converting intuitive force into repeatable, executable process — not just identifying what should change, but building the mechanism that changes it.",
  };
  const refinement: Record<El, string> = {
    fire: "The refinement is not slowing the initiation — it is adding targeting precision before the force is released. The measure of effective impact is not how fast the force moves, but what it produces at the point of contact.",
    earth: "The refinement is building course-correction into the structure from the beginning — identifying in advance the conditions under which the direction changes, so that sustained effort and strategic flexibility operate simultaneously.",
    air: "The refinement is treating execution as part of the intelligence function, not as something that follows it. The insight is incomplete until it has been converted into a specific, time-bound action.",
    water: "The refinement is systematizing what works. When a method produces the intended result, that method becomes the template — removing dependency on intuition being reliably present at every point of delivery.",
  };
  return [forceEdge[marsEl], refinement[marsEl]];
}

function wealthEdge(jupEl: El, venEl: El): string[] {
  const expansionEdge: Record<El, string> = {
    fire: "Excessive expansion. The capacity to identify possibility is not the limiting factor. The developmental challenge is selection — determining which possibility deserves full resource allocation and which represents distraction. Wealth is not built by pursuing every viable opportunity. It is built by concentrating resources on the opportunities with the highest compound return.",
    earth: "Over-refinement. The quality standard is rigorous, which is a genuine asset. The developmental challenge is the point at which continued refinement produces diminishing return — where additional precision does not increase value but delays distribution. Wealth requires that value reach the market.",
    air: "Difficulty converting vision into monetizable structure. The identification of future possibilities is accurate, but the translation from possibility to product — from idea to revenue-generating system — requires a different kind of precision than ideation does.",
    water: "Unrealistic ideals. The standard for what qualifies as genuinely valuable is high, which produces discernment. The developmental challenge is that ideals untethered from market reality do not generate sustainable wealth. The vision must be compelling and executable.",
  };
  const valueEdge: Record<El, string> = {
    fire: "The refinement is building a selection framework before opportunities appear — criteria established in advance that distinguish high-compound opportunities from compelling distractions.",
    earth: "The refinement is setting a completion threshold: a defined point at which a product or service is complete enough to distribute. Perfection is not the target. Sufficient quality for the intended purpose is.",
    air: "The refinement is treating distribution as a design problem, not a downstream concern. The mechanism for how value reaches the market should be designed alongside the value itself.",
    water: "The refinement is testing ideals against actual market response before full resource allocation. The vision remains intact. The delivery mechanism is pressure-tested.",
  };
  return [expansionEdge[jupEl], valueEdge[venEl]];
}

function consciousnessEdge(sunEl: El, moonEl: El): string[] {
  const identityEdge: Record<El, string> = {
    fire: "Identity structured around initiation creates a dependency on movement. When the external environment does not provide the next thing to begin, the internal structure can become destabilized. The developmental challenge is building identity that is stable at rest — not only in motion.",
    earth: "Identity structured around what has been built creates rigidity when what has been built is no longer working. The developmental challenge is separating self-concept from specific achievements — so that restructuring what has been built does not require restructuring who is building.",
    air: "Identity structured around understanding creates a gap when understanding does not produce the expected outcome. The developmental challenge is tolerating the period between insight and result — when the pattern has been identified but the consequence has not yet appeared.",
    water: "Identity structured around depth of experience creates difficulty when experience is absent. The developmental challenge is building internal structure that does not require constant input — that can generate direction from existing pattern rather than from new information.",
  };
  const processingEdge: Record<El, string> = {
    fire: "The developmental refinement is building a processing structure that converts experience into usable data without requiring it to be immediately acted upon. Not every experience is a signal. Some are noise.",
    earth: "The developmental refinement is building a release function into the integration process — identifying what has been fully integrated and can be set aside, rather than carrying all experience forward as active weight.",
    air: "The developmental refinement is treating embodiment as a lag, not a failure. Understanding arrives before integration completes. The gap is structural, not a problem to solve.",
    water: "The developmental refinement is building discernment between what belongs to your pattern and what was absorbed from the surrounding environment. Not all of what is felt is yours to process.",
  };
  return [identityEdge[sunEl], processingEdge[moonEl]];
}

// ─── Reflection questions ─────────────────────────────────────────────────────

const IMPACT_QUESTIONS: Record<El, string> = {
  fire: "Where are you moving so fast that the people who need what you are creating cannot follow the transmission?",
  earth: "What are you holding onto because you built it, rather than because it is still working?",
  air: "Where is your insight generating understanding in others without generating the change you actually intended?",
  water: "Where is your force being absorbed by the environment rather than directed toward the specific outcome that matters?",
};

const WEALTH_QUESTIONS: Record<El, string> = {
  fire: "Which of your current visions deserves your complete, sustained attention — and which are possibilities you are using to avoid committing to the one that matters most?",
  earth: "Where are you continuing to refine something that is already good enough to deliver value — and what would happen if you released it now?",
  air: "What is the specific idea or system worth building into reality, rather than remaining a compelling possibility?",
  water: "What are you investing in because it feels meaningful, and what are you investing in because it creates genuine, lasting value?",
};

const CONSCIOUSNESS_QUESTIONS: Record<El, string> = {
  fire: "What are you treating as part of your identity that is actually just something you experienced — and what would become possible if you released it?",
  earth: "What lesson are you still learning that you have actually already integrated — and what are you holding onto that no longer needs to be carried?",
  air: "Where is your understanding of yourself more advanced than your embodiment of it — and what would it take to close that distance?",
  water: "What are you carrying that belongs to the experiences around you rather than to your own pattern — and what is left when you set it down?",
};

// ─── Alchemical intro ─────────────────────────────────────────────────────────

function alchemicalIntro(
  impTitle: string, wealthTitleStr: string, consTitle: string,
  sunSign: string, marsSign: string, jupSign: string,
): string {
  return (
    `Your chart describes a creation pattern built around the combination of ${impTitle.replace("The ", "").toLowerCase()} energy, ` +
    `${wealthTitleStr.replace("The ", "").toLowerCase()} value creation, and ` +
    `${consTitle.replace("The ", "").toLowerCase()} mastery. ` +
    `With ${glyph("sun")} Sun in ${sunSign}, ${glyph("mars")} Mars in ${marsSign}, and ${glyph("jupiter")} Jupiter in ${jupSign}, ` +
    `your creation cycle moves through three primary forces: Impact — how your energy creates change; ` +
    `Wealth — how your gifts become sustainable value; and Consciousness — how experience becomes mastery. ` +
    `These forces do not operate in sequence alone. They are simultaneous — each shaping the conditions under which the others can perform.`
  );
}

// ─── Force section synthesis intros ──────────────────────────────────────────
// How the multi-planet force creates a unified system (shown before strengths).

const IMPACT_SYNTH_INTRO: Record<El, string> = {
  fire: "Impact is the mechanism through which internal creative force becomes external consequence. Mars initiates movement through self-generated urgency; Pluto amplifies that movement until it reaches structural depth rather than surface displacement; Mercury converts what has been generated into language and strategy others can receive and act on; Uranus directs the entire mechanism toward what genuinely requires new architecture rather than incremental adjustment. Together, these four functions create a system whose force does not simply move things — it reorganizes what produces them. In fire, this system activates at high velocity and tends to arrive before the environment is prepared to receive it.",
  earth: "Impact is the mechanism through which internal creative force becomes external consequence. Mars initiates through sustained, materially grounded momentum; Pluto amplifies that momentum into structural depth; Mercury translates the impact into precise language others can apply; Uranus evolves the mechanism toward what requires genuine replacement rather than optimization. Together, these four functions create a system capable of structural transformation — change that reaches what produces outcomes rather than only the outcomes themselves. In earth, this system builds slowly but holds completely; its impact compounds with each cycle rather than exhausting itself on first contact.",
  air: "Impact is the mechanism through which internal creative force becomes external consequence. Mars initiates through conceptual urgency — the force of pattern recognition and idea transmission; Pluto converts that urgency into transformative pressure that reaches structural assumptions; Mercury translates the impact into frameworks others can apply; Uranus redirects the mechanism toward what requires entirely new architecture. Together, these four functions create a system that operates through understanding — the force that changes systems is often the force that names what those systems have failed to name about themselves. In air, impact tends to arrive as a reframing that cannot be received without changing something.",
  water: "Impact is the mechanism through which internal creative force becomes external consequence. Mars initiates through directed feeling — force sourced in what genuinely matters rather than what is simply available; Pluto intensifies this into a capacity to operate at the level of foundational resistance; Mercury translates depth into receivable form; Uranus evolves the mechanism toward what genuinely requires transformation rather than what is merely available to be disrupted. Together, these four functions create a system capable of reaching what others have been unable to contact. In water, this system operates beneath visibility and tends to produce effects that are felt before they are seen.",
};

const WEALTH_SYNTH_INTRO: Record<El, string> = {
  fire: "Wealth is the mechanism through which expanded possibility becomes meaningful, sustainable value. Jupiter identifies and increases what is available — multiplying what the creative system can access; Venus determines what within that expanded field actually deserves cultivation — separating genuine worth from volume; Neptune provides the ceiling of meaning — the larger significance that gives discernment its orientation beyond personal preference. Together, these three functions create a wealth system that moves from possibility to worth to purpose. In fire, this system tends to identify emerging value before it becomes obvious — the developmental work is ensuring that rapid recognition is matched by the structural capacity to cultivate what has been found.",
  earth: "Wealth is the mechanism through which expanded possibility becomes meaningful, sustainable value. Jupiter identifies and multiplies what is available; Venus determines what within that field demonstrably deserves cultivation — what has substance and proven worth; Neptune provides the question of larger significance, asking whether what endures is also worth enduring for. Together, these three functions create a wealth system that builds on what has already shown itself real. In earth, this system produces value that compounds — each unit of genuine worth becomes the foundation for the next rather than a peak that reverts.",
  air: "Wealth is the mechanism through which expanded possibility becomes meaningful, sustainable value. Jupiter identifies and multiplies what a creative system has access to; Venus determines what within that expanded field deserves cultivation — what connects, communicates, and creates understanding; Neptune provides the visionary orientation, the sense of what a shared future might hold worth building toward. Together, these three functions create a wealth system that scales through frameworks rather than through individual output. In air, this system generates value that travels — what is created can be encountered and applied by others independently of the creator's continued presence.",
  water: "Wealth is the mechanism through which expanded possibility becomes meaningful, sustainable value. Jupiter identifies and multiplies what is available; Venus determines what within that field has genuine depth — what resonates beneath its surface rather than performing worth; Neptune extends that recognition toward collective meaning — what a culture or community needs to encounter. Together, these three functions create a wealth system oriented toward depth. In water, this system tends to perceive value before it is visible — the developmental work is translating what is felt as genuinely worth cultivating into forms that others can receive and invest in.",
};

const CONSCIOUSNESS_SYNTH_INTRO: Record<El, string> = {
  fire: "Consciousness is the mechanism through which experience becomes integrated identity, and integrated identity becomes a platform for creative mastery. The Sun establishes the originating creative self — the framework through which experience is interpreted and direction emerges; the Moon governs the ongoing integration process — the conversion of what is experienced into usable emotional and somatic pattern; Saturn converts what integration produces into durable structure — the architecture of genuine mastery that can be relied upon when conditions are demanding. Together, these three functions create a system in which experience does not simply accumulate — it compounds. In fire, this system activates through challenge: identity is clarified not through reflection alone, but through the encounter with what tests current capacity.",
  earth: "Consciousness is the mechanism through which experience becomes integrated identity, and integrated identity becomes a platform for creative mastery. The Sun establishes the originating self — the source of direction and the lens through which experience acquires meaning; the Moon governs the integration of what is lived into felt wisdom and usable pattern; Saturn converts what has been integrated into structural capability — separating what is known from what can be reliably applied under pressure. Together, these three functions create a system in which what is learned through experience becomes genuinely available rather than simply remembered. In earth, this system produces mastery through patient, embodied encounter — what is truly learned is what has been built, tested, and refined through direct contact with reality.",
  air: "Consciousness is the mechanism through which experience becomes integrated identity, and integrated identity becomes a platform for creative mastery. The Sun establishes the originating self — the pattern through which experience is organized and direction is chosen; the Moon governs the ongoing integration of what is lived into emotional pattern and embodied knowing; Saturn converts what is integrated into structural frameworks of genuine capability. Together, these three functions create a system in which understanding deepens into wisdom — not by accumulating more information, but by converting what has been encountered into increasingly precise internal architecture. In air, this system produces mastery through the gradual narrowing of the gap between what is perceived and what can be reliably transmitted.",
  water: "Consciousness is the mechanism through which experience becomes integrated identity, and integrated identity becomes a platform for creative mastery. The Sun establishes the originating self — the direction from which experience is encountered and the meaning-making filter through which it is processed; the Moon governs the integration of what is experienced into felt wisdom — the comprehension that arrives through full encounter rather than efficient processing; Saturn converts what has been fully integrated into structure that can be trusted. Together, these three functions create a system in which depth of encounter is the primary mechanism of development. In water, this system produces mastery through the willingness to feel the full range of what experience contains — and Saturn's function is to ensure that what has been fully felt becomes something that can be built upon.",
};

// ─── Force section mature expressions ────────────────────────────────────────
// Conclusive paragraph: what the fully integrated system creates.

const IMPACT_MATURE: Record<El, string> = {
  fire: "When fully integrated, this system creates directed, translatable, evolutionary consequence — force that arrives at speed, amplified into structural depth, converted into frameworks others can receive and act on, and evolved toward what genuinely requires a new architecture. The mature expression is not simply power, but the capacity to initiate change that reorganizes what produces outcomes rather than merely displacing what is visible on their surface.",
  earth: "When fully integrated, this system creates durable, legible, structural transformation — force that builds until it reaches structural root, translated into precise language others can apply, and evolved toward what genuinely requires replacement rather than optimization. The mature expression is the capacity to create change that holds — not change that was dramatic in its announcement, but change that reorganized what produces outcomes at their source.",
  air: "When fully integrated, this system creates paradigm-level consequence — force applied through conceptual precision, amplified into structural depth, translated into frameworks others can navigate by, and evolved into new architectures that replace what preceded them. The mature expression is the capacity to change not what people do, but what they understand as possible — the force that names what systems cannot name about themselves.",
  water: "When fully integrated, this system creates depth-sourced, translatable, transformational consequence — force that begins where others stop, amplified to the level of structural resistance, converted into forms others can receive, and evolved toward what is genuinely ready to become something new. The mature expression is the capacity to initiate change from depth — not disruption for its own sake, but the regeneration of what has completed its useful life.",
};

const WEALTH_MATURE: Record<El, string> = {
  fire: "When fully integrated, this system creates inspired, meaningful, enduring value — opportunity identified before it becomes obvious, cultivated toward genuine worth, and oriented toward a vision large enough to give that worth lasting significance. The mature expression is the capacity to convert emerging possibility into something that compounds — to move from what was a vision into what becomes a foundation others can build upon.",
  earth: "When fully integrated, this system creates substantial, purposeful, compounding value — expansion built on what has demonstrated genuine worth, refined to a standard that persists across preference shifts, and given meaning by the larger purpose it serves. The mature expression is the capacity to build wealth that accumulates through the depth of what it is rather than through the breadth of what it claims.",
  air: "When fully integrated, this system creates scalable, architecturally grounded, meaningful value — frameworks and systems that can be encountered and applied independently, refined toward what genuinely contributes rather than simply expands, and oriented toward a collective vision. The mature expression is the capacity to create wealth infrastructure — value-generating systems that operate beyond the creator's continuous presence.",
  water: "When fully integrated, this system creates resonant, depth-sourced, collectively significant value — worth perceived at depth before it was visible at the surface, cultivated toward what genuinely matters, and extended by a vision that connects personal worth to what a culture needs to encounter. The mature expression is the capacity to create what resonates because it is true — and whose worth deepens rather than diminishes as it meets more of what the world contains.",
};

const CONSCIOUSNESS_MATURE: Record<El, string> = {
  fire: "When fully integrated, this system creates a self capable of purposeful renewal — an identity that is not preserved intact by its encounters, nor destroyed by them, but transformed into something more precisely capable. The Sun maintains direction through transformation; the Moon ensures that what is experienced is fully integrated rather than simply survived; Saturn converts what is integrated into the structural authority from which the next cycle originates. The mature expression is an increasingly precise mechanism: a creative self that becomes more genuinely itself through each encounter with what tests it.",
  earth: "When fully integrated, this system creates embodied mastery — understanding that has been tested by material reality, integrated through the full range of lived experience, and consolidated into structures of genuine capability. The Sun provides originating direction; the Moon integrates what that direction encounters; Saturn converts what is integrated into wisdom that can be relied upon under pressure. The mature expression is not simply accumulated knowledge, but the capacity to perform with precision under conditions that would dissolve what was only understood rather than fully integrated.",
  air: "When fully integrated, this system creates transmissible mastery — understanding that was generated through experience, integrated into precise pattern, and structured into frameworks others can navigate by. The Sun provides originating direction; the Moon integrates the experience of following it; Saturn consolidates what integration produces into architectural clarity. The mature expression is the capacity to become an authority whose depth is matched by its communicability — to embody what has been understood so completely that it becomes transmissible.",
  water: "When fully integrated, this system creates depth mastery — wisdom generated through full encounter with what is most difficult, processed through the complete range of feeling, and consolidated by Saturn into structural understanding that can be trusted when circumstances are extreme. The mature expression is the capacity to lead from what has been genuinely lived through — not from performance of authority, but from the precision that only comes from having been fully present to what experience actually contains.",
};

// ─── Core archetype ───────────────────────────────────────────────────────────

function coreArchetype(
  impTitle: string, wealthTitleStr: string, consTitle: string,
  marsEl: El, jupEl: El, sunEl: El,
): { title: string; paragraphs: string[] } {
  const counts: Record<El, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  counts[marsEl]++;
  counts[jupEl]++;
  counts[sunEl]++;
  const dominant = (Object.keys(counts) as El[]).reduce((a, b) => counts[a] >= counts[b] ? a : b);

  const CORE_TITLES: Record<El, string> = {
    fire: "The Transformational Architect",
    earth: "The Methodical Alchemist",
    air: "The Systems Innovator",
    water: "The Regenerative Creator",
  };

  const CORE_P1: Record<El, string> = {
    fire: "The Transformational Architect is the one who recognizes where evolution is required, creates the force necessary to begin the process, and builds the structures that allow transformation to continue beyond the initial moment of creation.",
    earth: "The Methodical Alchemist is the one who converts raw potential into enduring value through patient, precise, and disciplined construction — building what outlasts the inspiration that started it.",
    air: "The Systems Innovator is the one who sees the pattern beneath the visible problem, translates it into a framework others can understand, and designs the next architecture before the current one has finished collapsing.",
    water: "The Regenerative Creator is the one who transforms what has been broken down, moves through dissolution without losing direction, and creates from depth what others can only create from the surface.",
  };

  const CORE_P2 = `Your Impact as ${impTitle}, your Wealth pattern as ${wealthTitleStr}, and your Consciousness development as ${consTitle} are not three separate systems. They are three expressions of the same underlying mechanism — and their combination produces a specific creative signature that belongs only to this chart.`;

  const CORE_P3: Record<El, string> = {
    fire: "Your highest expression is not simply creating something new. It is creating something that changes what is possible — and building the framework that allows that change to continue after the initial act of creation is complete.",
    earth: "Your highest expression is not simply building something that works. It is building something so precisely calibrated to genuine need that it outlasts every fashion, trend, and preference shift that surrounds it.",
    air: "Your highest expression is not simply generating insight. It is creating systems of understanding so clear and so structurally sound that others can navigate by them long after you have moved on to the next pattern.",
    water: "Your highest expression is not simply creating from depth. It is transforming the depth into form — giving the invisible a container that others can encounter, use, and transmit.",
  };

  return {
    title: CORE_TITLES[dominant],
    paragraphs: [CORE_P1[dominant], CORE_P2, CORE_P3[dominant]],
  };
}

// ─── Creative Functions content ───────────────────────────────────────────────
// Each function follows: Definition → Operation → Contributions → Natural Expression
// Plus labeled: Developmental Edge / Mastery Conclusion

// ── Strategy: Moon + Mars ─────────────────────────────────────────────────────

const STRATEGY_DEFINITION: Record<El, string> = {
  fire: "Strategy is the mechanism through which perception guides the allocation of force. Moon registers what genuinely matters — emotional priority, the instinctive recognition of what is ready to receive energy; Mars determines where and how that force is directed. Neither force alone completes this mechanism: Mars without Moon acts on whatever is available rather than what is important; Moon without Mars perceives clearly but does not mobilize. Together they create a complete direction-setting process, and in fire they operate at nearly the same velocity — recognition and mobilization are functionally collapsed into a single movement.",
  earth: "Strategy is the mechanism through which perception guides the allocation of force. Moon registers what genuinely matters — through sustained, embodied, sensory evaluation of what has proven significant; Mars determines where and how that recognized importance receives force. Neither alone is sufficient: Mars without Moon acts on what is available; Moon without Mars perceives without mobilizing. In earth, the mechanism operates through accumulated evidence — force is consistently directed toward what Moon has verified as genuinely worth pursuing, rather than toward what simply presents itself.",
  air: "Strategy is the mechanism through which perception guides the allocation of force. Moon registers what genuinely matters — through pattern recognition, conceptual priority, and the identification of what ideas are worth pursuing; Mars converts that recognition into directed momentum. Neither alone completes the mechanism: Mars without Moon follows available targets rather than important ones; Moon without Mars generates clarity without force. In air, the mechanism operates through understanding — what has been recognized as conceptually significant becomes the target Mars moves toward.",
  water: "Strategy is the mechanism through which perception guides the allocation of force. Moon registers what genuinely matters — through depth-reading, felt significance, and the capacity to perceive what is important beneath what is merely visible; Mars converts that depth-reading into directed force. Neither alone is sufficient: Mars without Moon acts on surface targets; Moon without Mars perceives without mobilizing. In water, the mechanism operates from depth — force consistently follows what Moon has recognized as genuinely important beneath the surface of what appears available.",
};

const STRATEGY_OPERATION: Record<El, string> = {
  fire: "The function operates at high speed. Information enters as instinctive recognition — what registers immediately as important; the two forces coordinate through shared urgency, Moon's registration triggering Mars before deliberation intervenes; the transformation is the conversion of instinctive priority into immediate directed action; the output is force mobilized toward what genuinely mattered, before the window closes. The risk the function runs at this speed is that vividness and importance can be difficult to distinguish — the most urgent sensation is not always the most significant target.",
  earth: "The function operates through deliberate priority verification. Information enters through sustained, sensory evaluation of what has demonstrated genuine worth; the two forces coordinate through accumulated confirmation — Moon registers consistently, Mars commits to what has been confirmed; the transformation is the conversion of verified priority into precise, sustained force; the output is effort applied with material accuracy to targets that have actually earned it. The function compounds with repetition: each cycle of force directed toward what was genuinely important produces evidence that sharpens the next allocation.",
  air: "The function operates through conceptual direction-setting. Information enters as pattern recognition — what Moon notices about where ideas, connections, and possibilities are genuinely significant; the two forces coordinate through the translation of conceptual recognition into specific, actionable direction; the transformation is the conversion of understood priority into committed momentum; the output is force that follows genuine understanding rather than instinct or circumstance. The function produces flexible targeting — Mars can be redirected quickly as Moon's recognition evolves.",
  water: "The function operates through felt priority. Information enters through depth-sensing — what Moon registers as genuinely significant beneath the surface of what is available; the two forces coordinate through the alignment of Mars's direction with Moon's depth-reading; the transformation is the conversion of felt significance into sustained force; the output is motivated action aimed at what has been recognized as genuinely important rather than superficially compelling. The function produces creative action sourced at depth — which tends to carry more endurance than surface-level urgency.",
};

const STRATEGY_NATURAL_EXPR: Record<El, string> = {
  fire: "When this function operates coherently, the primary natural output is speed of mobilization toward what genuinely matters. You can respond to what you have recognized as important before the window closes — recognition and action are calibrated to the same signal. What becomes easier is creative action that is both motivated and timely: force that arrives when an opening exists, directed at what the opening is actually for.",
  earth: "When this function operates coherently, the primary natural output is reliable targeting. Force does not get dispersed across what is merely available — it consistently accumulates on what Moon has verified as genuinely worth the investment. What becomes easier is sustainable creative momentum: effort that compounds because it is always directed toward what has demonstrated genuine capacity to receive it.",
  air: "When this function operates coherently, the primary natural output is directed intelligence. Conceptual clarity translates into committed force rather than remaining at the level of understood but unenacted direction. What becomes easier is creative action that is well-reasoned as well as mobilized — force that follows genuine understanding of why a direction matters, not just that it is available.",
  water: "When this function operates coherently, the primary natural output is depth-motivated force. Action is consistently sourced in what genuinely matters rather than in what is immediately available or socially sanctioned as important. What becomes easier is sustained creative effort: force that holds through resistance because it is directed toward what Moon registered as genuinely significant, not toward what was simply presented as an opportunity.",
};

const STRATEGY_DEV_EDGE: Record<El, string> = {
  fire: "When Moon's urgency and Mars's urgency run together without enough separation to distinguish what is vivid from what is important, the function produces force directed at the most immediately striking target rather than the most genuinely significant one. The development required is not slowing the mechanism down, but adding enough discrimination to Moon's registration to surface importance rather than intensity — to delay Mars's mobilization only for the moment required to verify that what is urgent is also what matters.",
  earth: "When Moon's preference for what has already demonstrated worth prevents recognition of what is emerging as genuinely important, Mars follows a conservative directional read that consistently aims at what was significant rather than what is becoming significant. The development required is extending the function's sensory accuracy toward the not-yet-proven — keeping the grounding quality of earth's discernment while opening Mars to directions that have not yet accumulated the track record both forces naturally prefer.",
  air: "When Moon's conceptual recognition generates more directions than Mars can follow simultaneously — more ideas recognized as important than force can sustain — the function produces distributed momentum that never accumulates power on any single target. The development required is the selection step: translating the full landscape of what Moon has recognized as conceptually worth pursuing into a committed, specific direction that Mars can maintain across the arc of a complete creative project.",
  water: "When Moon's depth-sensitivity registers significance at a frequency or at a depth that Mars cannot translate into sustained external force — because what is felt as genuinely important is not yet articulable as a direction — the function produces force attached to what moves you rather than to what can actually receive that force productively. The development required is the translation step: converting depth recognition into specific, actionable direction that Mars can work with over time.",
};

const STRATEGY_MASTERY: Record<El, string> = {
  fire: "When this function reaches mastery, the result is directed momentum — the capacity to move toward what is genuinely important with the speed that fire enables, without losing that importance in the velocity. Strategy creates creative action that is both fast and well-aimed: force that arrives where it matters, when the window is open, in the amount the situation can actually use. The function becomes a reliable mechanism for converting recognition into consequence without the losses that come from either delay or misdirection.",
  earth: "When this function reaches mastery, the result is accumulated precision — force consistently applied to what has proven to carry genuine weight, compounding across time into a body of creative work that was actually worth building. Strategy creates a creative operating process in which the question of where to direct effort is answered reliably through Moon's verified recognition rather than through circumstance or availability, and Mars's sustained force does what only sustained force can do: it builds something that lasts.",
  air: "When this function reaches mastery, the result is embodied direction — conceptual clarity reliably converted into committed, sustained action. Strategy creates the capacity to move with genuine intention: not just to perceive what matters or to understand why it matters, but to mobilize and sustain force toward it through the full arc of its development. The function produces a creative operating process in which understanding and momentum are permanently coupled.",
  water: "When this function reaches mastery, the result is depth-sourced creation — the capacity to act from what genuinely matters and to sustain that force through everything a meaningful creative project will encounter. Strategy creates a mechanism in which motivation and direction are aligned at root, not just at the surface: a creative operating process that produces work whose coherence is felt because it was directed from depth, not from what was available.",
};

// ── Dynamic Value Creation: Mercury + Jupiter ─────────────────────────────────

const DVC_DEFINITION: Record<El, string> = {
  fire: "Dynamic Value Creation is the mechanism through which intelligence is converted into scalable worth. Mercury generates the understanding — the analysis, synthesis, and translation of information into recognizable patterns and usable form; Jupiter expands the reach of what Mercury has produced, multiplying access, application, and consequence. Neither force alone completes the mechanism: Mercury without Jupiter produces insight that remains local — understood but not extended; Jupiter without Mercury expands what has not been sufficiently understood, scaling incoherence rather than value. In fire, both forces operate at the same forward velocity — Mercury identifies emerging possibility and Jupiter immediately begins multiplying it.",
  earth: "Dynamic Value Creation is the mechanism through which intelligence is converted into scalable worth. Mercury generates understanding through precise, empirically grounded analysis — it certifies what is true and useful before committing to it; Jupiter expands the reach of what Mercury has certified, multiplying what has already been verified as genuinely sound. In earth, the mechanism operates through confirmed worth: expansion occurs on what has demonstrated its foundations, and value compounds accordingly. Neither force alone is sufficient — Mercury without Jupiter remains precise but local; Jupiter without Mercury's verification scales what has not yet been genuinely established.",
  air: "Dynamic Value Creation is the mechanism through which intelligence is converted into scalable worth. Mercury generates understanding through framework construction — it synthesizes across categories, identifies structural patterns, and produces transmissible systems of thought; Jupiter multiplies the reach and application of the frameworks that result. In air, the mechanism produces scalable intelligence: what Mercury builds can be extended to contexts Mercury has not personally encountered, because it operates at the level of structure rather than specific instance. Mercury without Jupiter produces frameworks that remain personal; Jupiter without Mercury's structural clarity scales what has not yet been made transmissible.",
  water: "Dynamic Value Creation is the mechanism through which intelligence is converted into scalable worth. Mercury generates understanding through resonant comprehension — the capacity to perceive what is meaningfully true through depth and felt connection rather than logical derivation alone; Jupiter multiplies what carries genuine meaning, extending its reach toward more of what it can serve. In water, the mechanism produces value that deepens as it scales — what gets expanded is not just what is technically correct but what genuinely matters. Mercury without Jupiter produces depth perception that remains personal; Jupiter without Mercury's resonant verification scales what merely appears significant.",
};

const DVC_OPERATION: Record<El, string> = {
  fire: "The function operates through rapid recognition and immediate extension. Information enters as emerging possibility — what Mercury notices as potentially significant before the field has confirmed it; the two forces coordinate through shared forward momentum, with Jupiter responding to Mercury's rapid synthesis before the synthesis has been fully stress-tested; the transformation is the conversion of recognized possibility into resourced, extended action; the output is value generated by moving toward what is becoming important before it becomes obvious. The risk the function runs at this velocity is that Mercury's speed of recognition and Jupiter's speed of multiplication can outrun the structural verification required to make expansion sustainable.",
  earth: "The function operates through verified intelligence and compounding extension. Information enters through precise analysis — what Mercury has confirmed as genuinely applicable and structurally sound; the two forces coordinate through the staged process of analysis followed by expansion, with Jupiter scaling only what Mercury's precision has cleared; the transformation is the conversion of verified understanding into extended, compounding value; the output is growth built on demonstrated foundations, each cycle adding to what previous cycles have certified. The function is reliable but requires that Mercury's analytical process run ahead of Jupiter's expansion.",
  air: "The function operates through framework generation and structural scaling. Information enters through pattern recognition across domains — what Mercury notices as a structural principle underlying multiple specific cases; the two forces coordinate through the development and extension of transmissible frameworks, with Jupiter multiplying the reach of what Mercury has made structurally coherent; the transformation is the conversion of perceived pattern into scalable system; the output is value that travels — usable by others who have not encountered the specific instances Mercury synthesized it from. The function produces knowledge infrastructure rather than individual insight.",
  water: "The function operates through resonant perception and meaning-multiplying extension. Information enters through felt significance — what Mercury perceives as genuinely meaningful beneath the surface of what is presented as important; the two forces coordinate through the extension of what carries real depth, with Jupiter multiplying what Mercury has recognized as worth expanding because it genuinely matters; the transformation is the conversion of depth perception into extended, transmissible worth; the output is value that deepens as it scales — whose significance grows rather than diminishes as more people encounter it.",
};

const DVC_NATURAL_EXPR: Record<El, string> = {
  fire: "When this function operates coherently, the primary natural output is opportunity generation — the capacity to identify emerging value and mobilize toward it before it becomes visible to others. What becomes easier is creative action that is both perceptive and resourced: intelligence that is not delayed from reaching the scale it requires, and expansion that is directed toward what Mercury has genuinely recognized rather than toward what is merely available.",
  earth: "When this function operates coherently, the primary natural output is reliable value creation — expansion that compounds because it is consistently built on what has been verified as genuinely worth extending. What becomes easier is sustainable growth: each cycle of Mercury's analysis and Jupiter's expansion builds on the structural foundation established by the previous cycle, producing wealth architecture that holds under the weight of its own scale.",
  air: "When this function operates coherently, the primary natural output is scalable knowledge — frameworks, systems, and structural intelligence that can be transmitted to others and extended by them independently. What becomes easier is the creation of value infrastructure: work that continues generating worth beyond the individual effort that created it, because it operates at the level of transmissible structure rather than specific personal output.",
  water: "When this function operates coherently, the primary natural output is the expansion of what genuinely matters — growth directed toward what carries real meaning rather than toward what merely performs well at scale. What becomes easier is the creation of work whose worth deepens rather than thins as more people encounter it: value that was recognized at depth and scaled in a way that preserved and extended that depth rather than converting it into something shallower but more accessible.",
};

const DVC_DEV_EDGE: Record<El, string> = {
  fire: "When Mercury's speed identifies possibilities before they can be structurally verified, and Jupiter extends them at the same velocity, the function produces rapid scaling of what has not yet demonstrated its foundations. Each successive cycle of fast recognition and fast expansion compounds the exposure: what is built becomes structurally complex before the underlying elements have been confirmed as sound. The development required is inserting a verification step between Mercury's recognition and Jupiter's extension — brief enough to preserve the speed advantage, sufficient to confirm that what is being scaled can hold the weight of its own growth.",
  earth: "When Mercury only analyzes what has already proven itself, and Jupiter only extends what Mercury's conservative analysis certifies, the function produces excellent stewardship of what already exists but insufficient investment in what is becoming. The risk is not instability but obsolescence — compounding on foundations that were genuine but are no longer at the leading edge of what is worth building. The development required is extending Mercury's analytical precision toward what is emerging before certainty arrives: applying the function's rigor to the question of what is becoming worth building, not only to what has already proven itself.",
  air: "When Mercury generates more frameworks than Jupiter can scale simultaneously — more structural patterns recognized as worth extending than available resources can support in parallel — the function produces distributed expansion that never accumulates depth in any single direction. Breadth increases without the concentration required for any single framework to reach its full potential. The development required is the selection step: deciding which of the structural patterns Mercury has identified carries enough integrity to sustain Jupiter's full allocation, and withholding expansion from the others until that primary direction reaches the depth it requires.",
  water: "When Mercury's resonant intelligence produces understanding that is genuinely felt but not yet translatable into explicit, transmissible form — because what is deeply known has not yet been converted into language, structure, or framework that others can engage — Jupiter cannot scale what has not yet been made legible. The function stalls between perception and extension. The development required is the translation step: converting what Mercury has recognized at depth into communicable form precise enough that Jupiter can multiply it, and others can encounter it without losing what made the original recognition significant.",
};

const DVC_MASTERY: Record<El, string> = {
  fire: "When this function reaches mastery, the result is the capacity to generate value ahead of its context — to identify, understand, and scale what is becoming important before it becomes visible to others, without the structural failures that come from scaling what has not yet been sufficiently verified. Dynamic Value Creation produces a body of creative and economic work that consistently arrives ahead of the field, because Mercury has learned to run its recognition fast while Jupiter has learned to confirm before it extends. The function becomes a reliable mechanism for turning genuine foresight into built consequence.",
  earth: "When this function reaches mastery, the result is a compounding value-creation system — one in which each cycle of Mercury's verified analysis and Jupiter's grounded expansion becomes the structural foundation for the next cycle's greater capacity. Dynamic Value Creation produces a body of work and a wealth architecture that grows through the quality of what it is built from rather than through the breadth of what it claims. The function becomes the mechanism through which patient, rigorous intelligence converts into genuine accumulation.",
  air: "When this function reaches mastery, the result is the capacity to create transmissible value architecture — systems, frameworks, and structural intelligence that generate worth independent of the creator's continuous presence. Dynamic Value Creation produces knowledge infrastructure: the capacity to convert what Mercury synthesizes into what Jupiter can extend to contexts neither has encountered, because it is built from structural principle rather than specific instance. The function becomes a mechanism for creating genuine intellectual and economic legacy.",
  water: "When this function reaches mastery, the result is the capacity to scale what genuinely matters — to take what Mercury has recognized through depth perception and extend its reach without losing the quality of resonance that makes it significant. Dynamic Value Creation produces work whose worth deepens rather than thins as it scales, because Jupiter has learned to multiply only what Mercury has certified as carrying genuine depth. The function becomes the mechanism for converting felt significance into genuine, enduring, broad-reaching value.",
};

// ── Conscious Stewardship: Venus + Saturn ─────────────────────────────────────

const STEWARDSHIP_DEFINITION: Record<El, string> = {
  fire: "Conscious Stewardship is the mechanism through which recognized value is converted into lasting structure. Venus determines what is worth sustaining — the discernment function that identifies genuine worth as distinct from volume, availability, or what simply generates excitement; Saturn converts what Venus has determined as worth sustaining into the structural commitments and disciplined frameworks that allow it to persist across time and changing circumstances. Neither alone completes the mechanism: Venus without Saturn recognizes what is valuable but does not build what preserves it; Saturn without Venus builds structures that are durable but may not be organized around what genuinely deserves to endure. In fire, the function holds a productive tension — Venus recognizes through vitality and inspiration, Saturn asks what can outlast the energy that created it.",
  earth: "Conscious Stewardship is the mechanism through which recognized value is converted into lasting structure. Venus determines what is worth sustaining through grounded, sensory discernment — what has proven itself through material encounter, what holds genuine quality regardless of preference shifts; Saturn converts what Venus has verified as worth sustaining into the structural frameworks and long-term commitments that allow it to accumulate. In earth, the two forces share a natural orientation toward solidity: both prefer what is real over what is merely compelling. The primary developmental challenge is not tension between them but the risk that their agreement becomes self-reinforcing in a way that excludes what is genuinely worth building toward but has not yet proven itself.",
  air: "Conscious Stewardship is the mechanism through which recognized value is converted into lasting structure. Venus determines what is worth sustaining through relational and intellectual discernment — what creates genuine understanding, connection, and meaning between people and across ideas; Saturn converts what Venus has recognized as worth sustaining into the structural commitments and architectural frameworks required to make those qualities reliably transmissible rather than episodically present. In air, the function operates through the translation of relational and conceptual value into explicit, buildable structure: moving from appreciation to architecture.",
  water: "Conscious Stewardship is the mechanism through which recognized value is converted into lasting structure. Venus determines what is worth sustaining through depth perception — the capacity to feel what is genuinely significant beneath what appears valuable; Saturn converts what Venus has recognized at depth into the explicit structural commitments and durable frameworks that allow it to be reliably encountered by others. In water, the function must bridge a gap that does not exist in the other elements: the depth of Venus's recognition and the legibility of Saturn's requirements are in productive tension, and that tension is where the function's most significant capacity is developed.",
};

const STEWARDSHIP_OPERATION: Record<El, string> = {
  fire: "The function operates through the productive negotiation between vitality and durability. Information enters as Venus's recognition of what is genuinely alive — what inspires, what generates creative energy, what has the quality that makes investment feel worth the commitment; the two forces coordinate through a back-and-forth in which Venus identifies what is worth preserving and Saturn tests whether a structure can be built that outlasts the original inspiration; the transformation is the conversion of recognized vitality into committed, architecturally sound investment; the output is creative and financial commitment to what is both genuinely worth building and structurally viable. The function requires that Venus's recognition be matched by Saturn's structural analysis before commitment is finalized.",
  earth: "The function operates through the consolidation of demonstrated worth. Information enters as Venus's sensory evaluation — what has proven quality through sustained encounter with reality; the two forces coordinate naturally: Venus certifies genuine worth through sensory confirmation, Saturn builds frameworks around what the certification has approved; the transformation is the conversion of proven worth into structural permanence — from what has demonstrated value to what has been given the architecture to accumulate it; the output is wealth infrastructure built on verified foundations that compounds across time. The function is reliable and self-reinforcing when operating coherently.",
  air: "The function operates through the conversion of relational and intellectual value into transmissible architecture. Information enters as Venus's recognition of what creates genuine understanding, connection, and meaning — what deserves to be encountered by more people, in more contexts, for longer durations; the two forces coordinate through the process of translating recognized value into explicit structural form: Saturn taking what Venus has identified as worth preserving and asking what building it requires; the transformation is the conversion of what is worth appreciating into what can be reliably encountered; the output is structural investment in what creates enduring meaning between people and across ideas.",
  water: "The function operates through the conversion of depth perception into explicit structural commitment. Information enters as Venus's felt recognition of what genuinely matters — not what performs as valuable, but what is genuinely worth sustaining at the level where what is actually significant lives; the two forces coordinate through Saturn's willingness to build structures around what has been recognized at depth, even before that recognition has been universally confirmed; the transformation is the conversion of felt certainty about genuine worth into durable form — from what has been perceived as deeply significant to what has been given the architecture to be reliably encountered; the output is structural commitment to what has been genuinely, rather than merely conventionally, recognized as worth preserving.",
};

const STEWARDSHIP_NATURAL_EXPR: Record<El, string> = {
  fire: "When this function operates coherently, the primary natural output is lasting investment in what is genuinely worth building. What becomes easier is the translation of creative inspiration into structural commitment — not allowing inspiration to be the only thing holding a creative direction together, but giving what is recognized as genuinely valuable the structural architecture to persist after the original energy has moved on. The function creates a tendency toward creative work that has both genuine vitality and the durability to realize what the vitality recognized as worth creating.",
  earth: "When this function operates coherently, the primary natural output is enduring wealth construction — the systematic accumulation of what has been verified as genuinely worth building, organized by Saturn into structures that compound across time. What becomes easier is patient, reliable stewardship: the capacity to build wealth through the quality of what is invested in rather than through the volume of what is pursued. The function creates a creative and economic operating process in which what is built holds.",
  air: "When this function operates coherently, the primary natural output is structural investment in what creates enduring value through connection. What becomes easier is the creation of systems, relationships, and intellectual frameworks that allow what Venus has recognized as worth transmitting to be reliably encountered by others over time. The function creates a tendency toward the construction of what could be called connective infrastructure — the architecture through which what is genuinely valuable in how ideas, people, and systems relate can be preserved and extended.",
  water: "When this function operates coherently, the primary natural output is structured depth — the conversion of what has been recognized as genuinely significant into explicit commitments, frameworks, and architectures that allow others to encounter and extend it. What becomes easier is giving form to what is known at depth: translating felt certainty about genuine worth into the structural language Saturn requires and that makes preservation and transmission possible. The function creates a tendency toward creative and financial commitment to what is actually worth sustaining, rather than to what is merely available or compelling.",
};

const STEWARDSHIP_DEV_EDGE: Record<El, string> = {
  fire: "When Venus moves rapidly toward what is inspiring and Saturn is asked to provide structural architecture for each new direction before the previous one has been consolidated, the function produces a pattern of initiated but incomplete structures — creative directions whose foundations are architecturally sound in theory but have not been given sufficient time to demonstrate that they can hold. The development required is allowing Saturn enough consolidation time before Venus redirects to the next genuinely inspiring direction: choosing structural depth of commitment over breadth of creative recognition, even when multiple directions are genuinely worth pursuing.",
  earth: "When Venus and Saturn's shared orientation toward the already-demonstrated creates mutual confirmation of what is currently established, the function reinforces what has already been verified rather than extending discernment toward what is genuinely becoming worth building. The risk is not structural failure but missed emergence: the compounding that earth's stewardship excels at can be directed toward what was significant rather than what is becoming significant. The development required is extending the function's discernment toward what is genuinely emerging, before it has accumulated the track record both forces naturally prefer.",
  air: "When Venus recognizes relational and conceptual value without translating that recognition into explicit structural form — when what is genuinely worth preserving is appreciated but not converted into the specific, buildable commitments that Saturn requires to work with — the function produces appreciation without architecture. Saturn builds nothing because there is nothing concrete to build from; Venus's recognition remains at the level of felt understanding rather than constructed form. The development required is the translation step: converting what is recognized as genuinely worth preserving into explicit structural language precise enough that Saturn can work with it.",
  water: "When the depth of Venus's recognition has not yet been converted into language that Saturn can act on — when what is genuinely felt as worth preserving has not yet been articulated as a direction, commitment, or architectural requirement — the function produces structural commitments to vague orientations rather than to specific, well-defined worth. The architecture gets built, but it is built around what was felt rather than what was clearly identified. The development required is the same translation step water's functions consistently require: moving what has been genuinely recognized from felt clarity to explicit description precise enough that Saturn can build from it.",
};

const STEWARDSHIP_MASTERY: Record<El, string> = {
  fire: "When this function reaches mastery, the result is the capacity to build lasting structures around what is genuinely worth building — to select from among what is inspiring based not only on the quality of the inspiration but on what can be structurally realized, and to commit with the discipline required to carry it through. Conscious Stewardship produces a creative and economic operating process in which vitality and durability are not in opposition — in which what Venus recognizes as genuinely worth pursuing is given the structural architecture to become what it recognized.",
  earth: "When this function reaches mastery, the result is the capacity to compound genuine wealth — to build on what has been verified as genuinely worth building, with the patience, precision, and structural discipline required to allow it to accumulate into something that outlasts the conditions that created it. Conscious Stewardship produces a wealth-creation mechanism that grows through the depth of what it is built from: not the breadth of what is pursued, but the quality of what has been confirmed as worth the investment.",
  air: "When this function reaches mastery, the result is the capacity to create structural frameworks for what creates enduring value through connection — to give architecturally sound form to what Venus has recognized as worth transmitting, and to build the systems through which that transmission can occur reliably across time and context. Conscious Stewardship produces infrastructure: the kind of creation that continues generating worth because it operates at the level of what makes value possible between people, ideas, and systems.",
  water: "When this function reaches mastery, the result is the capacity to give structural permanence to what has been genuinely recognized at depth — to translate depth perception into explicit frameworks, commitments, and architectures that allow others to encounter and extend what has been recognized as worth preserving. Conscious Stewardship produces creative and financial work that carries the quality of what was perceived at the level where what is genuinely significant lives: work whose depth is felt because it was sourced from depth, and whose structure is sound because Saturn was given enough clarity to build from.",
};

function generateRelations(chart: NatalChart) {
  const moonSi  = chart.positions.moon.signIndex;
  const marsSi  = chart.positions.mars.signIndex;
  const mercSi  = chart.positions.mercury.signIndex;
  const jupSi   = chart.positions.jupiter.signIndex;
  const venSi   = chart.positions.venus.signIndex;
  const satSi   = chart.positions.saturn.signIndex;
  const moonEl  = el(chart, "moon");
  const mercEl  = el(chart, "mercury");
  const venEl   = el(chart, "venus");

  const strategy = {
    title: "Strategy",
    subtitle: "How perception becomes directed force",
    planets: `${glyph("moon")} Moon · ${glyph("mars")} Mars`,
    formula: "Recognition → Prioritization → Action",
    paragraphs: [
      STRATEGY_DEFINITION[moonEl],
      STRATEGY_OPERATION[moonEl],
      placementLine(chart, "moon", `recognition through ${MOON_PROCESS[moonSi].toLowerCase()}`),
      placementLine(chart, "mars", `directed movement through ${MARS_FORCE[marsSi].toLowerCase()}`),
      "The Moon supplies recognition, Mars supplies mobilization, and neither completes the process alone: perception without movement remains unexpressed, while movement without recognition spends force on whatever is nearest. Their cooperation converts significance into a chosen direction and then into action.",
      STRATEGY_NATURAL_EXPR[moonEl],
      relationAspect(chart, "moon", "mars"),
    ].filter(Boolean) as string[],
    developmentalEdge: STRATEGY_DEV_EDGE[moonEl],
    masteryConclusion: STRATEGY_MASTERY[moonEl],
  };

  const dynamicValueCreation = {
    title: "Dynamic Value Creation",
    subtitle: "How intelligence becomes scalable value",
    planets: `${glyph("mercury")} Mercury · ${glyph("jupiter")} Jupiter`,
    formula: "Information → Translation → Expansion",
    paragraphs: [
      DVC_DEFINITION[mercEl],
      DVC_OPERATION[mercEl],
      placementLine(chart, "mercury", `understanding through ${MERCURY_TRANSLATE[mercSi].toLowerCase()}`),
      placementLine(chart, "jupiter", `reach through ${JUPITER_EXPAND[jupSi].toLowerCase()}`),
      "Mercury creates understanding and Jupiter extends its application. Neither completes the process alone: insight without reach remains local, while expansion without understanding multiplies what has not been made coherent. Their cooperation translates intelligence into knowledge, systems, and ideas that can travel beyond their original context.",
      DVC_NATURAL_EXPR[mercEl],
      relationAspect(chart, "mercury", "jupiter"),
    ].filter(Boolean) as string[],
    developmentalEdge: DVC_DEV_EDGE[mercEl],
    masteryConclusion: DVC_MASTERY[mercEl],
  };

  const consciousStewardship = {
    title: "Conscious Stewardship",
    subtitle: "How value becomes lasting structure",
    planets: `${glyph("venus")} Venus · ${glyph("saturn")} Saturn`,
    formula: "Recognition → Commitment → Permanence",
    paragraphs: [
      STEWARDSHIP_DEFINITION[venEl],
      STEWARDSHIP_OPERATION[venEl],
      placementLine(chart, "venus", `discernment through ${VENUS_VALUE[venSi].toLowerCase()}`),
      placementLine(chart, "saturn", `preservation through ${SATURN_MASTERY[satSi].toLowerCase()}`),
      "Venus identifies what deserves investment and Saturn builds the structure that allows it to endure. Neither completes the process alone: value without commitment remains temporary, while structure without discernment preserves whatever happens to be there. Their cooperation converts recognition into permanence.",
      STEWARDSHIP_NATURAL_EXPR[venEl],
      relationAspect(chart, "venus", "saturn"),
    ].filter(Boolean) as string[],
    developmentalEdge: STEWARDSHIP_DEV_EDGE[venEl],
    masteryConclusion: STEWARDSHIP_MASTERY[venEl],
  };

  return { strategy, dynamicValueCreation, consciousStewardship };
}

function generateCreativeArchitecture(): WealthBlueprint["creativeArchitecture"] {
  return {
    title: "Creative Architecture",
    cycle: "Recognize → Develop → Sustain",
    paragraphs: [
      "Strategy determines where energy belongs. Moon + Mars answers: What deserves force? Perception identifies significance, then directed action gives that recognition consequence.",
      "Dynamic Value Creation determines what deserves reach. Mercury + Jupiter turns understanding into transferable value — extending insight into knowledge, systems, and ideas that can operate beyond their original context.",
      "Conscious Stewardship determines what deserves permanence. Venus + Saturn preserves and compounds what has been created by turning discerned value into structures capable of carrying it across time.",
      "Together, these three mechanisms form a complete creative operating system: detect what matters, convert understanding into value, and build the structures that allow meaningful value to survive beyond the initial act of creation.",
    ],
  };
}

// ─── Synthesis section content ────────────────────────────────────────────────

// Creative Mechanic: Magnitude (Mars + Pluto)
// Describes the transformation created by their relationship — not the planets separately.
const IMPACT_SYNTHESIS_INTRO: Record<El, string> = {
  fire: "Magnitude is the capacity for personal force to expand into transformative consequence. Mars provides the initiating impulse — the first expression of drive before it encounters resistance; Pluto does not simply intensify that impulse but transforms its quality: what begins as urgency becomes the capacity to reach structural depth rather than surface displacement. In fire, this transformation arrives at high velocity — the developmental work is learning to channel the speed of initiation into directed consequence rather than dispersed energy that exhausts itself on first contact.",
  earth: "Magnitude is the capacity for personal force to expand into transformative consequence. Mars provides the initiating impulse through sustained, materially grounded momentum; Pluto transforms that momentum into something capable of reorganizing foundations rather than simply revising what is visible. In earth, this transformation builds incrementally and holds completely — what is changed is not the surface of a system but the structure from which it produces its outcomes. The developmental edge is distinguishing the point at which sustained force has reached its productive limit.",
  air: "Magnitude is the capacity for personal force to expand into transformative consequence. Mars provides the initiating impulse through conceptual urgency — the drive to establish and defend what has been recognized as true; Pluto transforms that urgency into an investigative pressure capable of exposing the foundational assumptions beneath surface positions. In air, this transformation operates through the force of reframing — what is changed is not simply what people do, but the architecture within which they understand what is possible.",
  water: "Magnitude is the capacity for personal force to expand into transformative consequence. Mars provides the initiating impulse through directed feeling — force sourced in what genuinely matters; Pluto transforms this into the capacity to initiate change at the level of foundational resistance, reaching what others have been unwilling or unable to contact. In water, this transformation tends to produce effects that are felt before they are visible — depth consequence rather than surface disruption.",
};

// Creative Mechanic: Innovation (Mercury + Uranus)
const TRANSLATION_SYNTHESIS_INTRO: Record<El, string> = {
  fire: "Innovation is the capacity to transform intelligence into evolutionary insight — not better answers to existing questions, but the recognition that the question itself needs to change. Mercury provides the capacity to process experience into language and pattern; Uranus does not simply add creativity to that intelligence, but transforms its direction: what began as interpretation becomes architecture for what has not yet been built. In fire, this transformation arrives before its context is ready for it — the developmental work is communicating what has been seen with enough precision that others can follow it.",
  earth: "Innovation is the capacity to transform intelligence into evolutionary insight. Mercury provides precise, empirically grounded analysis; Uranus transforms that accuracy into the ability to locate exactly where an existing system has exceeded its useful design — and to articulate what needs to replace it in terms grounded enough to be immediately buildable. In earth, this transformation produces insight that is immediately actionable — theory and application arrive together rather than sequentially.",
  air: "Innovation is the capacity to transform intelligence into evolutionary insight. Mercury generates frameworks that connect across categories and synthesize across domains; Uranus transforms those frameworks into new architectures that reorganize not just one domain but the underlying logic shared across multiple. In air, this transformation operates at the level of shared understanding — what changes is not just one person's ideas, but the system within which others generate and evaluate ideas.",
  water: "Innovation is the capacity to transform intelligence into evolutionary insight. Mercury processes experience through resonant comprehension — the understanding that arrives through felt connection rather than logical derivation; Uranus transforms this into the capacity to give communicable form to what exists in a culture as unspoken collective knowing. In water, this transformation produces articulation of the implicit — breakthrough at the level of meaning rather than method.",
};

// Creative Mechanic: Resonance (Venus + Neptune)
const VALUE_SYNTHESIS_INTRO: Record<El, string> = {
  fire: "Resonance is the capacity for personal value discernment to extend into collective significance — to create something whose worth reaches beyond the creator. Venus identifies what is genuinely worth pursuing — not simply what is available or impressive, but what has the quality to endure; Neptune does not simply add idealism to that discernment, but extends it toward the question of collective meaning, asking whether what is worth creating personally is also worth creating for others. In fire, this transformation tends to identify emerging cultural value before it becomes obvious — what is recognized as genuinely alive carries significance that extends beyond its moment.",
  earth: "Resonance is the capacity for personal value discernment to extend into collective significance. Venus identifies what has demonstrable, real worth — what has substance and has survived encounter with reality; Neptune transforms this into the capacity to recognize whether what endures is also worth enduring for, extending the question of worth beyond personal preference into larger purpose. In earth, this transformation produces value that is both structurally sound and genuinely significant — it does not force a choice between what is real and what matters.",
  air: "Resonance is the capacity for personal value discernment to extend into collective significance. Venus identifies what deserves cultivation through the quality of connection and understanding it creates; Neptune transforms this recognition into the capacity to perceive what a shared future might hold that is worth building toward — not simply what is appreciated now, but what will carry meaning as it scales. In air, this transformation produces collectively generative value: what is created can be encountered by others and generate meaning independently of the creator's continued presence.",
  water: "Resonance is the capacity for personal value discernment to extend into collective significance. Venus identifies what resonates at depth — what is genuinely felt as meaningful rather than merely preferred; Neptune confirms and amplifies this recognition toward what a culture or community needs to encounter. In water, this transformation produces value that was perceived beneath the surface before it was visible above it — whose worth deepens rather than diminishes as it encounters more of what the world contains.",
};

function generateSynthesis(chart: NatalChart) {
  const marsSi    = chart.positions.mars.signIndex;
  const plutoSi   = chart.positions.pluto.signIndex;
  const mercSi    = chart.positions.mercury.signIndex;
  const uranusSi  = chart.positions.uranus.signIndex;
  const venSi     = chart.positions.venus.signIndex;
  const neptuneSi = chart.positions.neptune.signIndex;
  const marsEl    = el(chart, "mars");
  const mercEl    = el(chart, "mercury");
  const venEl     = el(chart, "venus");

  const impact: import("../types/astro").WealthRelation = {
    title: "Magnitude + Direction",
    subtitle: "How force becomes transformative consequence",
    planets: `${glyph("mars")} Mars · ${glyph("pluto")} Pluto`,
    formula: "Force → Concentration → Leverage → Transformation",
    paragraphs: [
      IMPACT_SYNTHESIS_INTRO[marsEl],
      placementLine(chart, "mars", `the original human function of force, expressed through ${MARS_FORCE[marsSi]}`),
      placementLine(chart, "pluto", `magnitude and direction, transforming force through ${PLUTO_TRANSFORM[plutoSi]}`),
      relationAspect(chart, "mars", "pluto"),
      "Before octave activation, Mars can initiate and move energy but may remain focused on immediate displacement. Pluto adds magnitude and direction, turning force toward the underlying structure that determines consequence.",
      "After integration, this mechanism can apply force where it produces irreversible structural transformation rather than merely visible motion.",
    ].filter(Boolean),
    developmentalEdge: "The imbalance is force without depth on one side, or magnitude without a usable initiating channel on the other. The refinement is to let Mars identify the point of action while Pluto supplies the depth and direction required for consequence.",
    masteryConclusion: "The ability to apply force where it produces irreversible structural transformation.",
  };

  const translation: import("../types/astro").WealthRelation = {
    title: "Translation of Genius",
    subtitle: "How intelligence becomes evolutionary insight",
    planets: `${glyph("mercury")} Mercury · ${glyph("uranus")} Uranus`,
    formula: "Pattern → Recognition → Translation → Breakthrough",
    paragraphs: [
      TRANSLATION_SYNTHESIS_INTRO[mercEl],
      placementLine(chart, "mercury", `the original human function of translation through ${MERCURY_TRANSLATE[mercSi]}`),
      placementLine(chart, "uranus", `genius and structural disruption through ${URANUS_INNOVATE[uranusSi]}`),
      relationAspect(chart, "mercury", "uranus"),
      "Before octave activation, Mercury can interpret experience and make it communicable, but its intelligence may remain inside existing categories. Uranus introduces the capacity to recognize the new architecture implied by what has been perceived.",
      "After integration, perception can become a breakthrough that is understandable, usable, and capable of changing the framework others work within.",
    ].filter(Boolean),
    developmentalEdge: "The imbalance is insight that cannot be translated, or translation that keeps novel intelligence inside familiar frames. The refinement is to preserve the originality of the perception while giving it a form that can enter practice.",
    masteryConclusion: "The ability to translate emerging intelligence into ideas that change existing frameworks.",
  };

  const value: import("../types/astro").WealthRelation = {
    title: "Resonance of Value",
    subtitle: "How value becomes collective meaning",
    planets: `${glyph("venus")} Venus · ${glyph("neptune")} Neptune`,
    formula: "Value → Inspiration → Resonance → Influence",
    paragraphs: [
      VALUE_SYNTHESIS_INTRO[venEl],
      placementLine(chart, "venus", `the original human function of value through ${VENUS_VALUE[venSi]}`),
      placementLine(chart, "neptune", `resonance and higher meaning through ${NEPTUNE_VISION[neptuneSi]}`),
      relationAspect(chart, "venus", "neptune"),
      "Before octave activation, Venus can recognize and cultivate what is personally valuable, but that value may remain bounded by preference or immediate exchange. Neptune extends the question toward collective meaning and what can continue to matter beyond the creator.",
      "After integration, value becomes influence: what is created can carry meaning into a wider field and continue generating significance independently of its origin.",
    ].filter(Boolean),
    developmentalEdge: "The imbalance is preference without collective resonance, or idealized meaning without a concrete value to carry it. The refinement is to embody what resonates so that significance has a real vessel through which it can reach others.",
    masteryConclusion: "The ability to create value that continues generating meaning beyond the creator.",
  };

  return { impact, translation, value };
}

function generateCreativeMechanicsArchitecture(): WealthBlueprint["creativeMechanicsArchitecture"] {
  return {
    title: "Creative Evolutionary Architecture",
    sequence: "Force → Intelligence → Value  becoming  Transformation → Innovation → Influence",
    paragraphs: [
      "Magnitude + Direction answers where energy must be applied to create transformation: Mars supplies force and Pluto gives that force the magnitude and direction required for consequence.",
      "Translation of Genius answers how new perception becomes understandable and usable: Mercury translates intelligence while Uranus opens the breakthrough architecture that can reorganize an existing framework.",
      "Resonance of Value answers how what is valuable becomes meaningful beyond the individual: Venus recognizes worth while Neptune extends it into collective significance and influence.",
      "Together, the three octave mechanisms form an evolutionary system in which personal force becomes transformation, personal intelligence becomes innovation, and personal value becomes influence.",
    ],
  };
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateWealthBlueprint(chart: NatalChart): WealthBlueprint {
  const marsSi  = chart.positions.mars.signIndex;
  const plutoSi = chart.positions.pluto.signIndex;
  const mercSi  = chart.positions.mercury.signIndex;
  const uraSi   = chart.positions.uranus.signIndex;
  const jupSi   = chart.positions.jupiter.signIndex;
  const venSi   = chart.positions.venus.signIndex;
  const nepSi   = chart.positions.neptune.signIndex;
  const sunSi   = chart.positions.sun.signIndex;
  const moonSi  = chart.positions.moon.signIndex;
  const satSi   = chart.positions.saturn.signIndex;

  const marsH   = houseNum(chart, "mars");
  const plutoH  = houseNum(chart, "pluto");
  const mercH   = houseNum(chart, "mercury");
  const uraH    = houseNum(chart, "uranus");
  const jupH    = houseNum(chart, "jupiter");
  const venH    = houseNum(chart, "venus");
  const nepH    = houseNum(chart, "neptune");
  const sunH    = houseNum(chart, "sun");
  const moonH   = houseNum(chart, "moon");
  const satH    = houseNum(chart, "saturn");

  const marsEl  = el(chart, "mars");
  const plutoEl = el(chart, "pluto");
  const mercEl  = el(chart, "mercury");
  const jupEl   = el(chart, "jupiter");
  const venEl   = el(chart, "venus");
  const sunEl   = el(chart, "sun");
  const moonEl  = el(chart, "moon");

  const impTitle = impactTitle(marsEl, plutoEl);
  const weaTitle = wealthTitle(jupEl, venEl);
  const conTitle = consciousnessTitle(sunEl, moonEl);

  const impPlanetLine = [
    `${glyph("mars")} Mars in ${signName(chart, "mars")} · ${houseOrd(chart, "mars")} house`,
    `${glyph("pluto")} Pluto in ${signName(chart, "pluto")} · ${houseOrd(chart, "pluto")} house`,
    `${glyph("mercury")} Mercury in ${signName(chart, "mercury")} · ${houseOrd(chart, "mercury")} house`,
    `${glyph("uranus")} Uranus in ${signName(chart, "uranus")} · ${houseOrd(chart, "uranus")} house`,
  ].join("  •  ");

  const weaPlanetLine = [
    `${glyph("jupiter")} Jupiter in ${signName(chart, "jupiter")} · ${houseOrd(chart, "jupiter")} house`,
    `${glyph("venus")} Venus in ${signName(chart, "venus")} · ${houseOrd(chart, "venus")} house`,
    `${glyph("neptune")} Neptune in ${signName(chart, "neptune")} · ${houseOrd(chart, "neptune")} house`,
  ].join("  •  ");

  const conPlanetLine = [
    `${glyph("sun")} Sun in ${signName(chart, "sun")} · ${houseOrd(chart, "sun")} house`,
    `${glyph("moon")} Moon in ${signName(chart, "moon")} · ${houseOrd(chart, "moon")} house`,
    `${glyph("saturn")} Saturn in ${signName(chart, "saturn")} · ${houseOrd(chart, "saturn")} house`,
  ].join("  •  ");

  // Aspect lines per planet
  const marsAspects  = aspectsFor(chart, "mars");
  const plutoAspects = aspectsFor(chart, "pluto");
  const mercAspects  = aspectsFor(chart, "mercury");
  const uraAspects   = aspectsFor(chart, "uranus");
  const jupAspects   = aspectsFor(chart, "jupiter");
  const venAspects   = aspectsFor(chart, "venus");
  const nepAspects   = aspectsFor(chart, "neptune");
  const sunAspects   = aspectsFor(chart, "sun");
  const moonAspects  = aspectsFor(chart, "moon");
  const satAspects   = aspectsFor(chart, "saturn");

  // ── IMPACT — Mars (7-step) ──
  const marsRetroText = retro(chart, "mars")
    ? `${glyph("mars")} Mars retrograde turns force inward before it becomes external — initiation is delayed not by weakness but by the internal process of ensuring force is aimed before it is released.`
    : "";
  const marsSection = [
    `${glyph("mars")} Mars is the initiating mechanism of the Impact system — the function that converts internal readiness into external movement. Its sign determines the quality of initiation: what activates the mechanism, what resistance it encounters, and whether force expends itself on contact or accumulates into structural impact.`,
    `In ${signName(chart, "mars")}, this force operates through ${MARS_FORCE[marsSi]}.`,
    MARS_HOUSE[marsH - 1],
    marsAspects ? marsAspects : "",
    marsRetroText,
    MARS_PRACTICAL[marsSi],
    MARS_DEV_EDGE[marsSi],
  ].filter(Boolean).join(" ");

  // ── IMPACT — Pluto (7-step) ──
  const plutoRetroText = retro(chart, "pluto")
    ? `${glyph("pluto")} Pluto retrograde develops its power psychologically before it becomes externally visible — transformation works through the interior architecture first.`
    : "";
  const plutoSection = [
    `${glyph("pluto")} Pluto determines whether the force Mars initiates creates surface change or structural change — whether what is altered is visible or the mechanism itself is rebuilt. Its sign reveals the domain where impact operates at greatest depth and the characteristic way force dismantles what has exceeded its useful life.`,
    `In ${signName(chart, "pluto")}, transformation operates through ${PLUTO_TRANSFORM[plutoSi]}.`,
    PLUTO_HOUSE[plutoH - 1],
    plutoAspects ? plutoAspects : "",
    plutoRetroText,
    PLUTO_PRACTICAL[plutoSi],
  ].filter(Boolean).join(" ");

  // ── IMPACT — Mercury (7-step) ──
  const mercRetroText = retro(chart, "mercury")
    ? `${glyph("mercury")} Mercury retrograde develops ideas through reflection before expression — insight matures internally before it enters language.`
    : "";
  const mercSection = [
    `${glyph("mercury")} Mercury is the expression function of the Impact system — it gives force and transformational capacity the form through which others can receive, understand, and act on what has been initiated. Expression is not packaging added after the fact; it is the mechanism that determines whether what has been generated reaches the world or remains locked at its source. Its sign reveals how this intelligence finds its voice — the characteristic register through which what has been set in motion becomes transmissible.`,
    `In ${signName(chart, "mercury")}, this expression operates through ${MERCURY_TRANSLATE[mercSi]}.`,
    MERCURY_HOUSE[mercH - 1],
    mercAspects ? mercAspects : "",
    mercRetroText,
    MERCURY_PRACTICAL[mercSi],
  ].filter(Boolean).join(" ");

  // ── IMPACT — Uranus (7-step) ──
  const uraRetroText = retro(chart, "uranus")
    ? `${glyph("uranus")} Uranus retrograde develops innovation internally before it becomes visible — breakthroughs emerge from private synthesis rather than external disruption.`
    : "";
  const uraSection = [
    `${glyph("uranus")} Uranus elevates Mercury's expression into the Genius register — it recognizes when existing language and frameworks have reached their limit and an entirely new architecture is required. Where Mercury communicates within established structures, Uranus reorganizes the structures themselves, producing insight that arrives as recognition rather than incremental construction. Its sign and house reveal where expression breaks from what was inherited and begins something that could not have emerged from prior conditions.`,
    `In ${signName(chart, "uranus")}, evolution operates ${URANUS_INNOVATE[uraSi]}.`,
    URANUS_HOUSE[uraH - 1],
    uraAspects ? uraAspects : "",
    uraRetroText,
  ].filter(Boolean).join(" ");

  const impSig: string[] = [marsSection, plutoSection, mercSection, uraSection];

  // ── WEALTH — Jupiter (7-step) ──
  const jupRetroText = retro(chart, "jupiter")
    ? `${glyph("jupiter")} Jupiter retrograde turns expansion inward first — wisdom is developed through private investigation before it becomes transmissible growth.`
    : "";
  const jupSection = [
    `${glyph("jupiter")} Jupiter governs the expansion mechanism of the Wealth system — the function that determines how value multiplies beyond its initial form. Its sign reveals the quality of expansion the system is designed to produce; its house reveals the domain where growth naturally compounds with each unit of investment.`,
    JUPITER_EXPAND[jupSi],
    JUPITER_HOUSE[jupH - 1],
    jupAspects ? jupAspects : "",
    jupRetroText,
    JUPITER_DEV_EDGE[jupSi],
  ].filter(Boolean).join(" ");

  // ── WEALTH — Venus (7-step) ──
  const venRetroText = retro(chart, "venus")
    ? `${glyph("venus")} Venus retrograde internalizes discernment — standards of value are developed through reflection rather than social confirmation, producing a more personal but more durable sense of worth.`
    : "";
  const venSection = [
    `${glyph("venus")} Venus is the value discernment function of the Wealth system — it determines what is genuinely worth creating, keeping, and building toward, rather than what merely feels productive. Its sign reveals the quality standard that distinguishes worth from worthlessness; its house reveals the domain where that discernment is most reliable.`,
    VENUS_VALUE[venSi],
    VENUS_HOUSE[venH - 1],
    venAspects ? venAspects : "",
    venRetroText,
  ].filter(Boolean).join(" ");

  // ── WEALTH — Neptune (7-step) ──
  const nepRetroText = retro(chart, "neptune")
    ? `${glyph("neptune")} Neptune retrograde matures vision through inner refinement — ideals are tested by experience before they become frameworks others can use.`
    : "";
  const nepSection = [
    `${glyph("neptune")} Neptune establishes the visionary ceiling of the Wealth system — the ideal that expansion and discernment are oriented toward. Without it, wealth production has no direction beyond self-perpetuation; Neptune provides the purpose that gives the mechanism its meaning and its limit.`,
    NEPTUNE_VISION[nepSi],
    NEPTUNE_HOUSE[nepH - 1],
    nepAspects ? nepAspects : "",
    nepRetroText,
  ].filter(Boolean).join(" ");

  const weaSig: string[] = [jupSection, venSection, nepSection];

  // ── CONSCIOUSNESS — Sun (7-step) ──
  const sunSection = [
    `${glyph("sun")} The Sun establishes the identity framework of the Consciousness system — the core through which experience is filtered and meaning is assigned. Its sign reveals the mode through which creative identity naturally develops; its house reveals the arena where the Sun's expressive function produces the most authentic and enduring output.`,
    SUN_IDENTITY[sunSi],
    SUN_HOUSE[sunH - 1],
    sunAspects ? sunAspects : "",
    // Sun is never retrograde
    `The practical expression of this placement is the gradual deepening of creative authority — not a fixed destination but a process of becoming more precisely yourself through the act of making.`,
  ].filter(Boolean).join(" ");

  // ── CONSCIOUSNESS — Moon (7-step) ──
  const moonRetroText = retro(chart, "moon")
    ? `${glyph("moon")} Moon retrograde deepens the processing cycle — experience requires more integration time before it becomes usable wisdom.`
    : "";
  const moonSection = [
    `${glyph("moon")} The Moon governs the integration mechanism of the Consciousness system — the process by which what happens to you becomes part of how you function. Its sign reveals the emotional-somatic channel through which experience is converted into usable pattern; its house reveals where unprocessed experience produces the most significant disruption to the creative cycle.`,
    MOON_PROCESS[moonSi],
    MOON_HOUSE[moonH - 1],
    moonAspects ? moonAspects : "",
    moonRetroText,
    `You are not simply changed by experiences — you are transformed by them. What the ${signName(chart, "sun")} Sun sets in motion, the ${signName(chart, "moon")} Moon processes until it becomes part of the operating structure itself.`,
  ].filter(Boolean).join(" ");

  // ── CONSCIOUSNESS — Saturn (7-step) ──
  const satRetroText = retro(chart, "saturn")
    ? `${glyph("saturn")} Saturn retrograde develops mastery internally — the most significant structural understanding comes through private discipline before it becomes visible authority.`
    : "";
  const satSection = [
    `${glyph("saturn")} Saturn is the mastery-building function of the Consciousness system — the structure that converts accumulated experience into durable capability, separating knowledge (what you understand) from wisdom (what you can reliably apply under pressure). Its sign reveals where discipline produces the most compounding return; its house reveals where the mastery mechanism is tested most rigorously.`,
    SATURN_MASTERY[satSi],
    SATURN_HOUSE[satH - 1],
    satAspects ? satAspects : "",
    satRetroText,
    SATURN_DEV_EDGE[satSi],
  ].filter(Boolean).join(" ");

  const conSig: string[] = [sunSection, moonSection, satSection];

  // ── Formula summaries ──
  const EL_CHANGE: Record<El, string> = {
    fire: "initiating change and rebuilding systems through transformational force",
    earth: "creating sustained structural change through methodical, disciplined application of force",
    air: "translating insight into action and redesigning the systems that shape collective possibility",
    water: "transforming reality through depth, perception, and regenerative force",
  };
  const EL_VALUE: Record<El, string> = {
    fire: "turning inspired vision into innovative structures that create impact beyond their origin",
    earth: "building systems of genuine, lasting worth that compound value over time",
    air: "transforming innovative ideas into frameworks that serve future needs",
    water: "creating depth-generated value that resonates at collective as well as personal scale",
  };
  const EL_MASTER: Record<El, string> = {
    fire: "transforming experience into wisdom and wisdom into systems of action that carry the work forward",
    earth: "integrating experience into embodied, practical mastery that becomes a reliable foundation",
    air: "converting the accumulation of insight into frameworks of understanding that can be transmitted",
    water: "absorbing the depth of experience and transforming it into wisdom others can navigate by",
  };

  const core = coreArchetype(impTitle, weaTitle, conTitle, marsEl, jupEl, sunEl);
  const relations = generateRelations(chart);
  const creativeArchitecture = generateCreativeArchitecture();
  const synthesis = generateSynthesis(chart);
  const creativeMechanicsArchitecture = generateCreativeMechanicsArchitecture();

  return {
    alchemicalSignature: alchemicalIntro(impTitle, weaTitle, conTitle, signName(chart, "sun"), signName(chart, "mars"), signName(chart, "jupiter")),
    impact: {
      title: impTitle,
      planetLine: impPlanetLine,
      synthesisIntro: IMPACT_SYNTH_INTRO[marsEl],
      signature: impSig,
      formula: impactFormula(marsEl, mercEl),
      strengths: impactStrengths(marsEl, mercEl, plutoSi),
      matureExpression: IMPACT_MATURE[marsEl],
      developmentalEdge: impactEdge(marsEl, mercSi),
      reflectionQuestion: IMPACT_QUESTIONS[marsEl],
    },
    wealth: {
      title: weaTitle,
      planetLine: weaPlanetLine,
      synthesisIntro: WEALTH_SYNTH_INTRO[jupEl],
      signature: weaSig,
      formula: wealthFormula(jupEl),
      strengths: wealthStrengths(jupEl, venEl),
      matureExpression: WEALTH_MATURE[jupEl],
      developmentalEdge: wealthEdge(jupEl, venEl),
      reflectionQuestion: WEALTH_QUESTIONS[jupEl],
    },
    consciousness: {
      title: conTitle,
      planetLine: conPlanetLine,
      synthesisIntro: CONSCIOUSNESS_SYNTH_INTRO[sunEl],
      signature: conSig,
      formula: consciousnessFormula(sunEl, moonEl),
      strengths: consciousnessStrengths(sunEl, moonEl),
      matureExpression: CONSCIOUSNESS_MATURE[sunEl],
      developmentalEdge: consciousnessEdge(sunEl, moonEl),
      reflectionQuestion: CONSCIOUSNESS_QUESTIONS[sunEl],
    },
    formula: {
      impact: `You create change by ${EL_CHANGE[marsEl]}.`,
      wealth: `You create value by ${EL_VALUE[jupEl]}.`,
      consciousness: `You develop mastery by ${EL_MASTER[sunEl]}.`,
    },
    coreArchetype: core,
    relations,
    creativeArchitecture,
    synthesis,
    creativeMechanicsArchitecture,
  };
}
