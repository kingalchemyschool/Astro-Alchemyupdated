import type {
  NatalChart,
  PlanetKey,
  ReportSection,
  Reading,
  Aspect,
  AspectType,
} from "@/types/astro";
import {
  SIGNS,
  ORDINALS,
  PLANET_META,
  SIGN_QUALITY,
  HOUSE_DOMAIN,
  HOUSE_THROUGH,
  PLANET_HOUSE,
} from "@/constants/astro";
import { aspectsFor, ASPECT_WORD } from "@/lib/aspects";
import { deriveFunctions, derivePrimary } from "@/lib/archetypes";
import { generateHeroJourney } from "@/lib/heroJourney";
import { generateWealthBlueprint } from "@/lib/wealthBlueprint";

type Element = "fire" | "earth" | "air" | "water";
type Modality = "cardinal" | "fixed" | "mutable";

const ELEMENT_FLOW: Record<Element, string> = {
  fire:  "Energy arrives as ignition — the impulse to move, create, and initiate is immediate and instinctive. This function generates heat before it generates light, and that forward momentum is where its power lives.",
  earth: "Energy arrives as tangible reality — this function trusts what can be measured, built, and held. It works through contact with material conditions, and its influence deepens through sustained, grounded application.",
  air:   "Energy arrives as connection — between concepts, between people, between what is known and what could be. This function moves through language and relationship, and its depth is expressed through the quality of what it links.",
  water: "Energy arrives as felt impression — sensed before it is named, known before it is understood. This function moves through emotional intelligence and instinctive resonance rather than surface reasoning.",
};

const MODALITY_DECISION: Record<Modality, string> = {
  cardinal: "The cardinal mode means it commits early and builds momentum through initiation — the decision to begin is also the decision to define the work.",
  fixed:    "The fixed mode means it holds a position and concentrates force — commitment deepens through sustained focus, and the power is in the staying rather than the starting.",
  mutable:  "The mutable mode means it adapts as it moves — the final form emerges through iteration, and the strength is in the capacity to reshape without losing the thread.",
};

const BOTTLENECK: Record<Modality, string> = {
  cardinal: "the initiating impulse can outrun its own sustaining capacity, leaving work well-launched but difficult to complete",
  fixed:    "the holding force can persist past the point of usefulness, turning concentration into rigidity",
  mutable:  "the adaptive quality can keep revising long past the moment when commitment would have served better",
};

// The energetic role each function plays in the creation cycle.
const ROLE: Partial<Record<PlanetKey, string>> = {
  sun:     "This is where your creative system begins. Everything in the chart flows from this point — the sign it occupies is not just a quality you carry but the fundamental medium through which all creative energy passes before it reaches anything else.",
  moon:    "Receiving the Essence your Sun establishes, this function converts it into felt reality — what registers as true, what the body knows before the mind names it, what shapes your perception of everything that enters the system.",
  mars:    "With perception formed, this function delivers the first actual movement — the translation of interior awareness into outward force. It determines how energy crosses from intention into action, and how you meet the resistance that action inevitably produces.",
  mercury: "Force must become communicable to be useful. This function encodes what Mars initiates into signal — language, pattern, analysis, the transmissible form that allows what you have moved toward to be understood, directed, and built upon.",
  jupiter: "Signal now seeks reach. This function takes what Mercury has articulated and extends its range — multiplying possibility, enlarging the field of what is available to work with, and bringing the philosophical dimension that asks what this is all actually for.",
  venus:   "Expansion creates abundance, but abundance requires selection. This function discerns what within Jupiter's expanded field is genuinely worth keeping — what has real value, what deserves sustained investment, what the system should retain and build on.",
  saturn:  "Value must be given form to endure. This function provides the architecture, discipline, and structural integrity that allows what Venus has recognized as worth keeping to survive time — to become something durable rather than merely something that once mattered.",
};

// Role descriptions for the outer planets as standalone functions.
const OUTER_ROLE: Partial<Record<PlanetKey, string>> = {
  pluto:   "As Mars's higher octave, this function carries the force of Force to its evolutionary extreme. Where Mars initiates movement, Pluto drives transformation — the kind that requires the complete dismantling of what no longer serves before the new configuration can take shape. Its placement shows the arena of your life where this regenerative pressure is most consistently active, where your capacity for depth and total renewal is most concentrated, and where the quality of your presence carries the most evolutionary weight.",
  uranus:  "As Mercury's higher octave, this function carries intelligence past its ordinary boundaries. Where Mercury communicates within established frameworks, Uranus reorganizes the frameworks themselves — through sudden insight, pattern-breaking perception, and the kind of original synthesis that arrives as recognition rather than construction. Its placement shows where you naturally see what others miss, where innovation is not a style but a necessity, and where the creative system is most regularly interrupted and renewed.",
  neptune: "As Venus's higher octave, this function carries value past individual discernment into collective resonance. Where Venus selects what is personally worth keeping, Neptune draws the value function toward what carries meaning beyond the personal — ideal forms, collective imagination, the transcendent dimension of what is worth creating. Its placement shows where your creative system is most permeable to inspiration that exceeds ordinary definition, and where the work is most likely to carry significance that outlasts its immediate moment.",
};

// ── Aspect synthesis factories ──────────────────────────────────────────────
// Each factory: (otherName, otherFn, orb) → string.

type AspectDesc = (n: string, fn: string, orb: string) => string;
const ASPECT_PAIR_TEXT: Partial<Record<PlanetKey, Record<AspectType, AspectDesc>>> = {
  sun: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} means Essence and ${fn.toLowerCase()} are operating as a single integrated unit — they cannot be separated in the creative act, which means each one continuously shapes the quality of the other before either reaches the world.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} opens a reliable channel between Essence and ${fn.toLowerCase()} — one that activates readily and provides consistent access to ${n}'s resources without the dependency that a tighter contact would create.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} generates productive friction at the root of the system — what Essence establishes, ${fn.toLowerCase()} contests, and that pressure has been refining both sides into increasingly precise form ever since.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} means Essence draws on ${fn.toLowerCase()} without resistance — the originating creative quality and ${n}'s energy move together structurally, which is one of the quiet foundations of how this whole system operates.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places Essence in full creative dialogue with ${fn.toLowerCase()} — each articulates what the other cannot, and that polarity has been maturing, over time, from apparent conflict into complementary precision.`,
  },
  moon: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} fuses Perception and ${fn.toLowerCase()} at the level of instinct — what the emotional body knows and what ${n} does are processed together, making their interaction immediate, pre-verbal, and inseparable in how you read the world.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} lets Perception and ${fn.toLowerCase()} cooperate naturally — what your instinctive intelligence registers, ${n} can work with, and what ${n} generates, the perception function can orient toward without friction.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} creates tension between what the emotional body registers and what ${fn.toLowerCase()} demands — the two systems run at different rhythms, which produces a productive pressure that prevents either from operating without the corrective influence of the other.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} lets Perception draw naturally on ${fn.toLowerCase()} — what you feel as important is readily supported by what ${n} can do, and that structural alignment between emotional intelligence and ${n}'s function is a consistent advantage throughout the system.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places Perception in dynamic tension with ${fn.toLowerCase()} — what the emotional body registers and what ${n} produces must negotiate constantly, which deepens the accuracy of both and prevents either from running on assumption.`,
  },
  mars: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} fuses initiating Force directly with ${fn.toLowerCase()} — impulse and ${n}'s function activate together, which significantly concentrates the impact of both and collapses the gap between intention and consequence.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} lets Force draw on ${fn.toLowerCase()} when initiative requires it — the channel is open but not compulsory, which gives you access to ${n}'s resources without structural dependency or override.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} creates a sustained contest between Force and ${fn.toLowerCase()} — neither can run unopposed, and the resistance between them has been progressively producing more targeted, consequential, and precise initiative.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} lets Force move with ${n}'s natural support — what is initiated flows readily into ${fn.toLowerCase()}'s territory, which reduces the friction between action and the conditions that would otherwise need to be built before it could be sustained.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places Force in direct dialogue with ${fn.toLowerCase()} — action cannot proceed without awareness of what ${n} requires, and ${n} cannot operate without the pressure Mars generates. That polarity matures into complementary precision at both ends.`,
  },
  mercury: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} merges Intelligence and ${fn.toLowerCase()} at source — thought and ${n}'s function are running as a single process, each shaping the other before either externalises as language, pattern, or signal.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} opens a productive channel between Intelligence and ${fn.toLowerCase()} — Mercury draws on ${n}'s resources when precision requires it, without being overwritten or redirected by them.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} creates productive tension between Intelligence and ${fn.toLowerCase()} — what Mercury understands and what ${n} demands are in friction, forcing each into greater precision and preventing either from settling into its easier, less tested form.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} lets Intelligence and ${fn.toLowerCase()} move together with structural ease — what Mercury synthesises, ${n} can readily receive and apply, which reduces the loss between understanding something and having it actually function in the world.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places Intelligence in full dialogue with ${fn.toLowerCase()} — what Mercury articulates, ${n} qualifies; what ${n} requires, Mercury must speak to. That mutual pressure has been producing increasingly complementary precision on both sides.`,
  },
  jupiter: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} fuses Expansion directly with ${fn.toLowerCase()} — what Jupiter multiplies is immediately shaped by ${n}'s function, and what ${n} produces is immediately extended by Jupiter's scale. The two are structurally inseparable.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} lets Expansion draw on ${fn.toLowerCase()} when scaling requires additional depth — the channel is open and cooperative without creating a structural dependency that would limit either function's independent operation.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} generates productive tension between Expansion and ${fn.toLowerCase()} — the friction prevents Jupiter from multiplying what ${n} has not yet confirmed as worth scaling, which over time produces growth that actually holds its own weight.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} aligns Expansion and ${fn.toLowerCase()} — what ${n} generates, Jupiter multiplies with minimal friction, and each cycle of growth compounds on what the previous one built.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places Expansion in direct dialogue with ${fn.toLowerCase()} — Jupiter's tendency toward more is in constant negotiation with what ${n} actually requires, producing growth that is earned through that negotiation rather than assumed.`,
  },
  venus: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} merges the Value function with ${fn.toLowerCase()} at source — what is recognized as genuinely worth keeping is inseparable from what ${n} does, making the two functions conditions of each other in how worth is determined.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} opens a productive channel between Value and ${fn.toLowerCase()} — Venus's discernment draws on ${n}'s resources when refining what deserves sustained investment, without ${n} overriding the selection process.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} creates productive tension between Value and ${fn.toLowerCase()} — what is identified as worth keeping is contested by what ${n} requires, and that friction has been progressively refining the standard both apply.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} lets Value and ${fn.toLowerCase()} move together naturally — what is identified as genuinely worth keeping, ${n} can readily work with, which reduces the loss between clear discernment and its actual expression in the world.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places Value in direct dialogue with ${fn.toLowerCase()} — what Venus recognizes as worth keeping and what ${n} demands negotiate constantly, producing a standard of worth that has been tested from both directions simultaneously.`,
  },
  saturn: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} fuses Structure directly with ${fn.toLowerCase()} — Saturn's architecture and ${n}'s function are built into each other, which means the discipline applied to one is immediately and unavoidably experienced by the other.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} lets Structure draw on ${fn.toLowerCase()}'s resources when building requires additional depth — Saturn can access ${n}'s energy without being confined by it, which provides flexibility within discipline.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} creates productive friction between Structure and ${fn.toLowerCase()} — the resistance prevents Saturn from constructing frameworks that ${n} cannot sustain, and prevents ${n} from operating without the test of structural integrity.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} aligns Structure and ${fn.toLowerCase()} — Saturn's discipline and ${n}'s function reinforce rather than contest each other, allowing what is built to hold more of what ${n} generates.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places Structure in direct dialogue with ${fn.toLowerCase()} — what Saturn requires for permanence and what ${n} generates must negotiate, producing architecture that endures because it was tested from both ends.`,
  },
  pluto: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} fuses evolutionary Force directly with ${fn.toLowerCase()} — Pluto's regenerative pressure is built into ${n}'s function at the root, which gives that function an intensity and depth that can transform whatever it encounters.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} lets the regenerative capacity operate as an available resource for ${fn.toLowerCase()} — Pluto's depth and transformative power are accessible when ${n} requires them, without the overwhelm of a tighter contact.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} places Pluto's evolutionary pressure in direct friction with ${fn.toLowerCase()} — the resistance between them ensures that ${n}'s function is continuously being tested at depth, and what survives that testing carries considerably more power.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} lets Pluto's regenerative depth flow naturally into ${fn.toLowerCase()} — the transformative capacity is structurally available to ${n}'s function, which gives it a quiet power that operates without needing to announce itself.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places the evolutionary dimension in full dialogue with ${fn.toLowerCase()} — Pluto's depth and ${n}'s function are in continuous negotiation, which produces a polarity that matures, over time, into a significant capacity for transformation through that specific function.`,
  },
  uranus: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} fuses the disruption of ordinary pattern directly with ${fn.toLowerCase()} — Uranus's capacity for sudden original synthesis is built into ${n}'s function, making innovation not an occasional event but the structural mode of how that function operates.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} makes Uranus's pattern-breaking intelligence available to ${fn.toLowerCase()} when originality is required — a reliable channel to unconventional insight that can be accessed without the instability of a closer contact.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} creates productive friction between the impulse to break pattern and ${fn.toLowerCase()}'s established way of operating — the resistance between them prevents either from settling, which keeps ${n}'s function in a state of productive renewal.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} lets Uranus's original intelligence flow naturally through ${fn.toLowerCase()} — what ${n} does has access to a structural source of unconventional insight, which tends to produce work that surprises even the person doing it.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places the disruptive intelligence in full dialogue with ${fn.toLowerCase()} — what Uranus sees and what ${n} operates through are in continuous negotiation, producing a polarity that eventually becomes a capacity for genuine innovation within that function's territory.`,
  },
  neptune: {
    conjunction: (n, fn, orb) => `The ${orb}° conjunction with ${n} fuses the dissolving, visionary quality directly with ${fn.toLowerCase()} — Neptune's capacity to reach beyond ordinary definition is built into ${n}'s function, which gives it an imaginative and transcendent dimension that cannot be separated from how it operates.`,
    sextile:     (n, fn, orb) => `The ${orb}° sextile to ${n} makes Neptune's idealistic depth available to ${fn.toLowerCase()} as a resource — a channel to collective meaning and expanded imagination that can be drawn on without the confusion that a tighter contact might introduce.`,
    square:      (n, fn, orb) => `The ${orb}° square to ${n} creates productive tension between the dissolving dimension and ${fn.toLowerCase()}'s need for workable form — the friction between vision and function has been demanding, over time, that both become more precise about where they meet.`,
    trine:       (n, fn, orb) => `The ${orb}° trine to ${n} lets Neptune's visionary depth flow naturally into ${fn.toLowerCase()} — the idealistic and imaginative dimension moves through ${n}'s function with structural ease, which tends to give that function an unusual resonance and reach.`,
    opposition:  (n, fn, orb) => `The ${orb}° opposition to ${n} places the dissolving intelligence in full dialogue with ${fn.toLowerCase()} — Neptune's pull toward the transcendent and ${n}'s operational requirements are in continuous negotiation, producing a polarity that matures into a distinctive blend of vision and function.`,
  },
};

// ── Aspect synthesis paragraph ────────────────────────────────────────────────

/** Paid: flowing synthesis of all major aspects for a given planet. */
function richAspectParagraph(chart: NatalChart, key: PlanetKey): string | null {
  const list = aspectsFor(key, chart.aspects);
  const meta = PLANET_META[key];

  if (!list.length) {
    return `${meta.name} holds no exact major aspects in this chart, which means the ${meta.fn.toLowerCase()} function operates without direct planetary conditioning from the rest of the system. This is not a weakness — it is a particular quality of self-containment. The function answers to its own interior standard, develops on its own terms, and is not continuously reshaped by external planetary pressure. The developmental work is learning to recognize what this function is producing independent of the friction that aspects would otherwise provide, and to trust that signal even when the rest of the system is not confirming it.`;
  }

  // Group aspects for a more coherent synthesis
  const harmoniousAspects = list.filter(a => ["conjunction", "sextile", "trine"].includes(a.type));
  const tensionAspects = list.filter(a => ["square", "opposition"].includes(a.type));

  const lines = list.slice(0, 5).map((asp) => {
    const otherKey = asp.a === key ? asp.b : asp.a;
    const otherMeta = PLANET_META[otherKey];
    const factory = ASPECT_PAIR_TEXT[key]?.[asp.type];
    if (factory) return factory(otherMeta.name, otherMeta.fn, String(asp.orb));
    return `The ${asp.orb}° ${ASPECT_WORD[asp.type]} with ${otherMeta.name} connects ${meta.fn.toLowerCase()} and ${otherMeta.fn.toLowerCase()} — the two functions condition each other, and neither operates entirely independently of the other in this chart.`;
  });

  let synthesis: string;
  if (harmoniousAspects.length > 0 && tensionAspects.length > 0) {
    synthesis = `What this produces, in total, is a ${meta.fn.toLowerCase()} function that is simultaneously supported by ${harmoniousAspects.map(a => {
      const ok = a.a === key ? a.b : a.a;
      return PLANET_META[ok].name;
    }).join(" and ")} and tested by ${tensionAspects.map(a => {
      const ok = a.a === key ? a.b : a.a;
      return PLANET_META[ok].name;
    }).join(" and ")} — a configuration that, over time, produces the kind of capability that has been built under real conditions rather than assumed.`;
  } else if (harmoniousAspects.length > 0) {
    synthesis = `Taken together, these connections give the ${meta.fn.toLowerCase()} function a network of structural support — each planet contributes something that deepens or extends what ${meta.name} can do, and that support is woven into how this function operates at its foundation.`;
  } else {
    synthesis = `Taken together, these connections mean the ${meta.fn.toLowerCase()} function has been consistently tested rather than smoothly supported — which is the precise condition through which its most durable and precise form is eventually developed.`;
  }

  const intro = `${meta.name}'s ${meta.fn.toLowerCase()} function is woven into the larger system through ${list.length === 1 ? "one major aspect" : `${list.length} major aspects`} — each one a living relationship that continuously shapes how this energy moves and what it can do.`;

  return `${intro} ${lines.join(" ")} ${synthesis}`;
}

// ── Inner planet section ───────────────────────────────────────────────────────

function field(houseIdx: number): string {
  return HOUSE_DOMAIN[houseIdx].replace("the arena of", "the field of");
}

function planetSection(chart: NatalChart, key: PlanetKey): ReportSection {
  const meta = PLANET_META[key];
  const pos = chart.positions[key];
  const sign = SIGNS[pos.signIndex];
  const hi = pos.house - 1;
  const houseOrd = ORDINALS[hi];
  const el = sign.element as Element;
  const mod = sign.modality as Modality;
  const retroNote = pos.retrograde
    ? ` Moving retrograde, this function turns inward before it externalises — it refines through reflection first, which means the outward expression often lags behind a considerable interior depth.`
    : "";

  // p0 — FREE: role in system → placement → what sign brings → retrograde
  const p0 =
    `${meta.glyph} ${meta.name} — your function of ${meta.fn} — sits in ${sign.name} in the ${houseOrd} house, ${HOUSE_DOMAIN[hi]}. ` +
    `${ROLE[key] ?? ""} ` +
    `In ${sign.name}, that energy arrives ${sign.element === "fire" ? "as ignition" : sign.element === "earth" ? "as grounded, material contact" : sign.element === "air" ? "as connection and concept" : "as felt impression"} — ${SIGN_QUALITY[pos.signIndex]}.` +
    `${retroNote}`;

  // p1 — PAID: how element/modality/house shape this function in practice
  const houseSpecific = PLANET_HOUSE[key]?.[hi] ?? `In the ${houseOrd} house, this function finds its expression through ${HOUSE_THROUGH[hi]}.`;
  const p1 =
    `${ELEMENT_FLOW[el]} ${MODALITY_DECISION[mod]} ` +
    `${houseSpecific} ` +
    `The point of friction arises when the ${mod} tempo works against itself — ${BOTTLENECK[mod]}.`;

  // p2 — PAID: rich aspect synthesis
  const aspPara = richAspectParagraph(chart, key);

  const paragraphs: string[] = [p0, p1];
  if (aspPara) paragraphs.push(aspPara);

  // Inner planet: also show the outer octave inline as a final paragraph
  if (meta.octave) {
    const oPos = chart.positions[meta.octave];
    const oSign = SIGNS[oPos.signIndex];
    const oHouse = ORDINALS[oPos.house - 1];
    const oMeta = PLANET_META[meta.octave];
    paragraphs.push(
      `${oMeta.glyph} ${oMeta.name} — this function's higher octave — occupies ${oSign.name} in the ${oHouse} house. ` +
      `${OUTER_ROLE[meta.octave] ?? ""} ` +
      `Its full reading appears below as its own section.`
    );
  }

  return {
    kind: "planet",
    order: 0,
    title: `${meta.name} · ${meta.fn}`,
    subtitle: `${sign.name} — ${houseOrd} House`,
    glyph: meta.glyph,
    planetKeys: meta.octave ? [key, meta.octave] : [key],
    paragraphs,
  };
}

// ── Outer planet sections ──────────────────────────────────────────────────────

/** Outer planets as full standalone sections in the blueprint. */
function outerPlanetSection(chart: NatalChart, key: "pluto" | "uranus" | "neptune"): ReportSection {
  const meta = PLANET_META[key];
  const pos = chart.positions[key];
  const sign = SIGNS[pos.signIndex];
  const hi = pos.house - 1;
  const houseOrd = ORDINALS[hi];
  const retroNote = pos.retrograde
    ? ` Moving retrograde at your birth, this function internalises its pressure even more deeply — the evolutionary or disruptive or dissolving quality operates primarily through interior work before it surfaces in external events.`
    : "";

  // The inner planet this outer planet extends
  const innerKey: PlanetKey = key === "pluto" ? "mars" : key === "uranus" ? "mercury" : "venus";
  const innerMeta = PLANET_META[innerKey];
  const innerPos = chart.positions[innerKey];
  const innerSign = SIGNS[innerPos.signIndex];

  // Generational context
  const generationalNote = `${sign.name} is the sign shared by everyone born within the same generational window — what makes this placement specifically yours is the ${houseOrd} house it occupies and the aspects it holds to your personal planets.`;

  // p0: octave relationship + sign + house
  const p0 =
    `${meta.glyph} ${meta.name} — ${meta.fn}, and the higher octave of your ${innerMeta.fn} function — occupies ${sign.name} in the ${houseOrd} house, ${HOUSE_DOMAIN[hi]}. ` +
    `${generationalNote}` +
    `${retroNote}`;

  // p1: how this outer planet extends the inner planet's function + house context
  const p1 = (() => {
    const houseThroughText = `In the ${houseOrd} house, this energy finds expression through ${HOUSE_THROUGH[hi]}.`;
    if (key === "pluto") {
      return `Where your ${innerMeta.name} in ${innerSign.name} applies direct force to produce movement, Pluto in the ${houseOrd} house applies evolutionary pressure to the same creative territory — but at a different order of magnitude and timescale. This is where your capacity for total transformation is most concentrated: where you are capable of initiating not just change but the kind of reorganisation that leaves nothing in its previous form. ${houseThroughText} The depth of engagement here is not a choice — it is a structural feature of how this part of your creative system operates.`;
    }
    if (key === "uranus") {
      return `Where your ${innerMeta.name} in ${innerSign.name} works within existing structures to communicate and connect, Uranus in the ${houseOrd} house is reorganising those structures from the ground up — introducing pattern-breaks, sudden original synthesis, and the kind of insight that arrives as recognition of something that was always true but had not yet been seen. ${houseThroughText} This is where your creative system is most regularly disrupted and renewed — and where its most genuinely original contributions are most likely to emerge.`;
    }
    // neptune
    return `Where your ${innerMeta.name} in ${innerSign.name} recognises what has personal worth, Neptune in the ${houseOrd} house draws the value function toward what carries worth at a collective scale — the ideal forms, the resonant visions, the quality of what matters beyond individual preference. ${houseThroughText} This is where the creative system becomes most permeable: most open to inspiration that exceeds ordinary definition, and most capable of producing work that carries meaning beyond the moment that produced it.`;
  })();

  // p2: aspect synthesis — focusing on personal planet aspects specifically
  const p2 = richAspectParagraph(chart, key);

  const paragraphs: string[] = [p0, p1];
  if (p2) paragraphs.push(p2);

  const titleMap: Record<string, string> = {
    pluto:   "Pluto · Regeneration",
    uranus:  "Uranus · Disruption",
    neptune: "Neptune · Dissolution",
  };
  const glyphMap: Record<string, string> = {
    pluto: "♇", uranus: "♅", neptune: "♆",
  };

  return {
    kind: "planet",
    order: 0,
    title: titleMap[key],
    subtitle: `${sign.name} — ${houseOrd} House · ${innerMeta.name}'s Higher Octave`,
    glyph: glyphMap[key],
    planetKeys: [key],
    paragraphs,
  };
}

// ── Thresholds ─────────────────────────────────────────────────────────────────

function impactThreshold(chart: NatalChart): ReportSection {
  const mars = SIGNS[chart.positions.mars.signIndex].name;
  const sun = SIGNS[chart.positions.sun.signIndex].name;
  const moon = SIGNS[chart.positions.moon.signIndex].name;
  const mercury = SIGNS[chart.positions.mercury.signIndex].name;
  return {
    kind: "threshold",
    order: 0,
    title: "Impact",
    subtitle: "Being — The Source of Your Impact",
    glyph: "◬",
    planetKeys: [],
    paragraphs: [
      `The Being threshold marks the point where identity becomes expression — where what you are turns into what you make happen in the world. It is not a planet but a transformation event: the moment when the interior structure of your creative self must translate into something others can actually encounter.`,
      `Your Sun in ${sun} holds the originating Essence — your creative source, your identity, and the fundamental quality from which all expression extends. Your Moon in ${moon} holds perception and embodiment — the emotional imprint through which that source is experienced from the inside and carried into action. Together, these two establish the foundation from which all creation emerges. Being answers the question: what is the source I am creating from?`,
      `The output of Being is Impact — the capacity of this identity and internal structure to reach the world and register there. Your Mars in ${mars} is the force that translates Being into outward effect: the drive, the initiative, the willingness to move first. Before your Mercury in ${mercury} can shape that energy into communicable signal, Mars must refine raw drive into deliberate direction. Cross this threshold and the question shifts from "how hard can I push" to "where does this need to land." Action stops being reactive and becomes targeted.`,
    ],
  };
}

function willThreshold(chart: NatalChart): ReportSection {
  const jupiter = SIGNS[chart.positions.jupiter.signIndex].name;
  const venus = SIGNS[chart.positions.venus.signIndex].name;
  const neptune = SIGNS[chart.positions.neptune.signIndex].name;
  return {
    kind: "threshold",
    order: 0,
    title: "Wealth",
    subtitle: "Will — The Source of Your Wealth",
    glyph: "◬",
    planetKeys: [],
    paragraphs: [
      `The Will threshold represents the transformation of possibility into tangible value. This is the point in the cycle where what has been initiated and communicated must now become something worth keeping — where expansion earns its meaning by being refined into genuine worth.`,
      `Your Jupiter in ${jupiter} opens the field of possibility: it expands reach, multiplies opportunity, and increases what is available to work with. But an expanded field still requires selection. Your Venus in ${venus} provides the discernment to recognize what within that abundance is genuinely valuable — not what merely feels large, but what is actually worth the investment of sustained attention. Your Neptune in ${neptune} elevates that discernment further, drawing value toward what carries meaning beyond personal preference into collective resonance.`,
      `Together, these three planets answer the question: what am I bringing into existence, and why does it matter? The output of Will is Wealth — not measured in accumulation alone, but in the quality of what is created, the resources it generates, and the lasting influence it establishes. Cross this threshold and growth becomes purposeful. Expansion stops being measured by how much can be added and starts being defined by how precisely energy is directed toward what holds real value.`,
    ],
  };
}

function retentionThreshold(chart: NatalChart): ReportSection {
  const saturn = SIGNS[chart.positions.saturn.signIndex].name;
  const sun = SIGNS[chart.positions.sun.signIndex].name;
  const moon = SIGNS[chart.positions.moon.signIndex].name;
  return {
    kind: "threshold",
    order: 0,
    title: "Legacy",
    subtitle: "Retention — The Foundation of Your Legacy",
    glyph: "♄",
    planetKeys: [],
    paragraphs: [
      `The Retention threshold asks the final question of the creation cycle: what will remain? Creation reaches completion only when what has been built can survive the cycle that created it — when the lesson stops being learned and becomes part of the structure itself.`,
      `Your Saturn in ${saturn} holds the function of Retention: the discipline, structure, endurance, and mastery required for what has been created to outlast the moment of inspiration. Saturn does not reward speed or brilliance. It rewards the willingness to build with sufficient care and precision that the work stands when the creator is no longer actively sustaining it. Integrated with the originating Essence carried by your Sun in ${sun} and the lived experience held by your Moon in ${moon}, Retention asks: what from this creation cycle is strong enough to endure? What must be preserved, and what must be released because it cannot sustain the weight of permanence?`,
      `The output of Retention is Legacy — what compounds beyond the moment of creation, what continues generating meaning without requiring continuous reinvestment, and what eventually becomes part of the field itself rather than merely something produced within it. Cross this threshold and experience becomes architecture. What you have built stops being something you carry and begins carrying itself.`,
    ],
  };
}

export function generateReading(chart: NatalChart): Reading {
  const functions = deriveFunctions(chart);
  const primary = derivePrimary(functions, chart);

  // Functions in cycle order — outer planets inserted after their inner octave.
  const planetSections: ReportSection[] = [];
  const add = (s: ReportSection) => {
    s.order = planetSections.length;
    planetSections.push(s);
  };

  add(planetSection(chart, "sun"));
  add(planetSection(chart, "moon"));
  add(planetSection(chart, "mars"));
  add(outerPlanetSection(chart, "pluto"));   // Mars's higher octave
  add(planetSection(chart, "mercury"));
  add(outerPlanetSection(chart, "uranus"));  // Mercury's higher octave
  add(planetSection(chart, "jupiter"));
  add(planetSection(chart, "venus"));
  add(outerPlanetSection(chart, "neptune")); // Venus's higher octave
  add(planetSection(chart, "saturn"));

  const heroJourney = generateHeroJourney(chart, primary);
  const wealthBlueprint = generateWealthBlueprint(chart);

  return {
    chart,
    planetSections,
    functions,
    primary,
    heroJourney,
    wealthBlueprint,
  };
}

// Re-exported for convenience where a raw aspect list needs typing.
export type { Aspect };
