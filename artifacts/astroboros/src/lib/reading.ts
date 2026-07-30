import type {
  NatalChart,
  PlanetKey,
  ReportSection,
  Reading,
  Aspect,
  AspectType,
  NatalAspectCard,
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
import { withoutRepeatedSentences } from "@/lib/text";

type Element = "fire" | "earth" | "air" | "water";
type Modality = "cardinal" | "fixed" | "mutable";

const ELEMENT_FLOW: Record<Element, string> = {
  fire:  "The impulse to move, create, and initiate is immediate and instinctive — this function generates heat before it generates light, and that forward momentum is where its power lives.",
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
  moon:    "Receiving the essence your Sun establishes, this function takes in the environment and converts that incoming information into felt reality — what registers as true, what the body knows before the mind names it, and what begins to shape your response.",
  mars:    "With experience received, this function delivers the first actual movement — the translation of inner awareness into directed action. It determines how energy crosses from intention into action, and how you meet the resistance that action inevitably produces.",
  mercury: "Initiation must find translation to reach beyond its source. This function gives what Mars begins the form through which it can be understood, shared, and built upon — the language, pattern, and authored signal that turns inner movement into something that exists in the world.",
  jupiter: "Signal now seeks reach. This function takes what Mercury has articulated and extends its range — multiplying possibility, enlarging the field of what is available to work with, and bringing the philosophical dimension that asks what this is all actually for.",
  venus:   "Expansion creates abundance, but abundance requires selection. This function discerns what within Jupiter's expanded field is genuinely worth keeping — what has real value, what deserves sustained investment, what the system should retain and build on.",
  saturn:  "Value must be given structure to endure. This function provides the architecture, discipline, and structural integrity that allows what Venus has recognized as worth keeping to survive time — to become something durable rather than merely something that once mattered.",
};

// Role descriptions for the outer planets as standalone functions.
const OUTER_ROLE: Partial<Record<PlanetKey, string>> = {
  pluto:   "Pluto is the outer octave of Mars — where Mars initiates movement, Pluto drives regeneration at an evolutionary scale, the kind that requires the complete dismantling of what no longer serves before the new configuration can take shape. Its placement shows the arena of your life where this regenerative pressure is most consistently active, where your capacity for depth and total renewal is most concentrated, and where the quality of your presence carries the most evolutionary weight.",
  uranus:  "Uranus is the outer octave of Mercury — where Mercury works within existing frameworks to communicate and connect, Uranus reorganizes the frameworks themselves through sudden insight, pattern-breaking awareness, and the kind of original synthesis that arrives as recognition rather than construction. Its placement shows where you naturally see what others miss, where innovation is not a style but a necessity, and where the creative system is most regularly interrupted and renewed.",
  neptune: "Neptune is the outer octave of Venus — where Venus selects what is personally worth keeping, Neptune draws discernment toward what carries meaning beyond the personal: ideal forms, collective imagination, the transcendent dimension of what is worth creating. Its placement shows where your creative system is most permeable to inspiration that exceeds ordinary definition, and where the work is most likely to carry significance that outlasts its immediate moment.",
};

// ── Aspect synthesis ─────────────────────────────────────────────────────────
// Internal function names orient the section title. Aspect prose translates
// the relationship into observable behavior instead of asking the reader to
// decode the architecture.

const PLANET_EXPERIENCE: Record<PlanetKey, string> = {
  sun: "sense of purpose, identity, and creative direction",
  moon: "instinctive responses, emotional memory, and need for safety",
  mercury: "thinking, language, and decisions",
  venus: "values, attractions, and standards of quality",
  mars: "will, boundaries, and ability to act",
  jupiter: "confidence, beliefs, and appetite for growth",
  saturn: "standards, commitments, and long-term discipline",
  uranus: "originality and willingness to break an inherited pattern",
  neptune: "imagination, sensitivity, and ideals",
  pluto: "relationship with power, endings, and fundamental change",
};

function aspectExperience(
  chart: NatalChart,
  key: PlanetKey,
  otherKey: PlanetKey,
  type: AspectType,
): string {
  const subject = PLANET_EXPERIENCE[key];
  const influence = PLANET_EXPERIENCE[otherKey];
  const otherName = PLANET_META[otherKey].name;
  const sign = SIGNS[chart.positions[key].signIndex].name;
  const otherSign = SIGNS[chart.positions[otherKey].signIndex].name;
  const contact = `${PLANET_META[key].name} in ${sign} and ${otherName} in ${otherSign}`;
  const signContext = `${PLANET_META[key].name}'s ${SIGN_QUALITY[chart.positions[key].signIndex]} style meets ${otherName}'s ${SIGN_QUALITY[chart.positions[otherKey].signIndex]} style`;
  const variation = (key.charCodeAt(0) + otherKey.charCodeAt(0)) % 3;
  const article = type === "opposition" ? "an" : "a";

  switch (type) {
    case "conjunction":
      return `One aspect is a conjunction between ${contact}. The two planets are roughly 0 degrees apart, close enough to act as one concentrated influence. Your ${subject} immediately activates your ${influence}, so what you want, notice, or decide tends to carry the other planet's intensity with it. ${signContext}; the result is powerful but not automatically coordinated. The strength is commitment and impact. The risk is mistaking intensity for certainty, so give the combined drive one clear target before acting.`;
    case "trine":
      return [
        `One aspect is a trine between ${contact}. The two planets are roughly 120 degrees apart, so their drives can cooperate without constantly blocking one another. They connect your ${subject} with your ${influence}; ${signContext}. This can make it easier to trust an instinct, communicate what you mean, and move from intention into action. Treat that fluency as raw material: the skill appears when you give it a demanding use.`,
        `One aspect is a trine between ${contact}. The two planets are roughly 120 degrees apart, allowing their drives to reinforce one another instead of competing for access. They connect your ${subject} with your ${influence}; ${signContext}. The natural rapport is valuable precisely because it frees attention for a more ambitious application.`,
        `One aspect is a trine between ${contact}. The two planets are roughly 120 degrees apart, creating a channel where effort can travel between them with less friction. They connect your ${subject} with your ${influence}; ${signContext}. Notice what becomes possible when you stop spending energy on coordination and put that energy into depth.`,
      ][variation];
    case "sextile":
      return `One aspect is a sextile between ${contact}. The two planets are roughly 60 degrees apart, creating an opportunity rather than an automatic flow. They give your ${subject} a usable opening into your ${influence}; ${signContext}. The benefit appears when you choose a specific action—otherwise the potential stays dormant.`;
    case "square":
      return `One aspect is a square between ${contact}. The two planets are roughly 90 degrees apart, so their demands arrive at cross-purposes. Your ${subject} wants to move one way while your ${influence} introduces a competing demand; ${signContext}. This can show up as urgency, overcorrection, defensiveness, or repeated pressure to revise your approach. The tension is productive only when you name both needs and build a response that honors them.`;
    case "opposition":
      return `One aspect is ${article} opposition between ${contact}. The two planets are roughly 180 degrees apart, facing one another across the zodiac, so their needs become visible through contrast. They pull your ${subject} toward a conscious relationship with your ${influence}; ${signContext}. Other people, consequences, or external events may show you what your usual viewpoint leaves out. The work is negotiation rather than choosing one side—let the contrast refine your choices instead of turning it into projection or polarization.`;
  }
}

function namedAspect(key: PlanetKey, otherKey: PlanetKey): string | undefined {
  const moonPluto = (key === "moon" && otherKey === "pluto") ||
    (key === "pluto" && otherKey === "moon");
  // "Hades Moon" is an established name for a natal Moon–Pluto contact,
  // including conjunctions, squares, trines, sextiles, and oppositions.
  return moonPluto ? "Hades Moon" : undefined;
}

function aspectCardsFor(chart: NatalChart, key: PlanetKey): NatalAspectCard[] {
  // Each natal aspect belongs to one card in the report. The chart's stored
  // planet order gives it a stable home under the first planet in the pair,
  // rather than repeating the same contact in both planet sections.
  return aspectsFor(key, chart.aspects)
    .filter((asp) => asp.a === key)
    .slice(0, 5)
    .map((asp) => {
    const otherKey = asp.a === key ? asp.b : asp.a;
    const subject = chart.positions[key];
    const other = chart.positions[otherKey];
    const title = `${PLANET_META[key].name} ${asp.type}`;
    const subtitle =
      `${PLANET_META[key].name} in ${SIGNS[subject.signIndex].name} · ` +
      `${PLANET_META[otherKey].name} in ${SIGNS[other.signIndex].name}`;
    return {
      title,
      subtitle,
      name: namedAspect(key, otherKey),
      paragraphs: withoutRepeatedSentences([
        aspectExperience(chart, key, otherKey, asp.type),
        houseAspectContext(chart, key, otherKey),
      ]),
    };
    });
}

function houseAspectContext(
  chart: NatalChart,
  key: PlanetKey,
  otherKey: PlanetKey,
): string {
  const keyHouse = chart.positions[key].house;
  const otherHouse = chart.positions[otherKey].house;
  const keyOrd = ORDINALS[keyHouse - 1];
  const otherOrd = ORDINALS[otherHouse - 1];
  const keyDomain = HOUSE_DOMAIN[keyHouse - 1];
  const otherDomain = HOUSE_DOMAIN[otherHouse - 1];
  const keyThrough = HOUSE_THROUGH[keyHouse - 1];
  const otherThrough = HOUSE_THROUGH[otherHouse - 1];

  if (keyHouse === otherHouse) {
    return `Both planets work through the ${keyOrd} house, ${keyDomain}. That gives this relationship one shared outlet: it is likely to surface through ${keyThrough}. Purpose, feeling, and response are therefore tested in the same concrete area rather than being kept in separate compartments; choices made there quickly reveal whether the two drives are actually cooperating.`;
  }

  return `This relationship connects the ${keyOrd} house, ${keyDomain}, with the ${otherOrd} house, ${otherDomain}. In practice, it links ${keyThrough} with ${otherThrough}: developments in one arena change the demands placed on the other. The aspect becomes useful when you make decisions with that exchange in mind, rather than solving one area while creating a new problem in the other.`;
}

// ── Aspect synthesis paragraph ────────────────────────────────────────────────

/** Paid: flowing synthesis of all major aspects for a given planet. */
function richAspectParagraph(chart: NatalChart, key: PlanetKey): string | null {
  const list = aspectsFor(key, chart.aspects);
  const meta = PLANET_META[key];

  if (!list.length) {
    return `${meta.name} holds no exact major aspects in this chart — it operates without direct planetary conditioning from the rest of the system. This is not a weakness; it is a particular quality of self-containment. ${meta.name} answers to its own interior standard, develops on its own terms, and is not continuously reshaped by external planetary pressure. The developmental work is learning to recognize what ${meta.name} is producing independent of the friction that aspects would otherwise provide, and to trust that signal even when the rest of the chart is not confirming it.`;
  }

  // Group aspects for a more coherent synthesis
  const harmoniousAspects = list.filter(a => ["conjunction", "sextile", "trine"].includes(a.type));
  const tensionAspects = list.filter(a => ["square", "opposition"].includes(a.type));

  let synthesis: string;
  if (harmoniousAspects.length > 0 && tensionAspects.length > 0) {
    synthesis = `In total, ${meta.name} is simultaneously supported by ${harmoniousAspects.map(a => {
      const ok = a.a === key ? a.b : a.a;
      return PLANET_META[ok].name;
    }).join(" and ")} and tested by ${tensionAspects.map(a => {
      const ok = a.a === key ? a.b : a.a;
      return PLANET_META[ok].name;
    }).join(" and ")} — a configuration that, over time, produces the kind of capability that has been built under real conditions rather than assumed.`;
  } else if (harmoniousAspects.length > 0) {
    synthesis = `Taken together, these connections give ${meta.name} a network of structural support — each planet contributes something that deepens or extends what ${meta.name} can do, and that support is woven into how this planet operates at its foundation.`;
  } else {
    synthesis = `Taken together, these connections mean ${meta.name} has been consistently tested rather than smoothly supported — which is the precise condition through which its most durable and precise form is eventually developed.`;
  }

   const intro = `${meta.name} is shaped by ${list.length === 1 ? "one major planetary relationship" : `${list.length} major planetary relationships`}. Each contact below names the planets, the aspect, the approximate angle between them, and the life areas where the relationship becomes personal and observable.`;

  return withoutRepeatedSentences([`${intro} ${synthesis}`])[0] ?? "";
}

const SUN_RECEIVING: Record<string, string> = {
  Aries: "Your Sun receives neutral ideas through active meditation: walking, moving, cleaning, playing, or doing something that lets thought arrive through motion.",
  Taurus: "Your Sun receives neutral ideas through grounding and contact with nature: slow walks, cooking, gardening, music, or any practice that lets the body become quiet enough to notice.",
  Gemini: "Your Sun receives neutral ideas through movement between inputs: writing, reading, talking, or changing environments until a useful connection appears.",
  Cancer: "Your Sun receives neutral ideas through quiet emotional space: water, music, memory, cooking, or a private setting where your sensitivity can register without performing.",
  Leo: "Your Sun receives neutral ideas through expressive play: creating, performing, dancing, or making something without asking it to prove its value first.",
  Virgo: "Your Sun receives neutral ideas through attentive practice: organizing, walking, making, repairing, or refining a small process until the mind becomes clear.",
  Libra: "Your Sun receives neutral ideas through beauty and balance: art, music, gentle movement, or a calm conversation that lets several possibilities remain in view.",
  Scorpio: "Your Sun receives neutral ideas through depth and privacy: stillness, journaling, water, or focused solitude that allows what is beneath the surface to emerge.",
  Sagittarius: "Your Sun receives neutral ideas through spaciousness: walking, travel, study, teaching, or any practice that opens the mind beyond its current frame.",
  Capricorn: "Your Sun receives neutral ideas through disciplined stillness: walking with a question, working with your hands, or following a simple practice long enough for a larger structure to appear.",
  Aquarius: "Your Sun receives neutral ideas through detached observation: walking, sketching systems, watching patterns, or giving the mind enough distance to see a new arrangement.",
  Pisces: "Your Sun receives neutral ideas through receptive stillness: water, music, dreams, meditation, or creative practice that lets images arrive before you explain them.",
};

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
    ? ` Moving retrograde, ${meta.name} turns inward before it externalises — refining through reflection first, which means the outward expression often lags behind a considerable interior depth.`
    : "";

  // p0 — FREE: role in system → placement → what sign brings → retrograde
  const p0 =
    `${meta.glyph} ${meta.name} — governing ${meta.fn.toLowerCase()} in your alchemy — sits in ${sign.name} in the ${houseOrd} house, ${HOUSE_DOMAIN[hi]}. ` +
    `${ROLE[key] ?? ""} ` +
    `${key === "sun" ? `${SUN_RECEIVING[sign.name]} ` : ""}` +
    `In ${sign.name}, that energy arrives ${sign.element === "fire" ? "as ignition" : sign.element === "earth" ? "as grounded, material contact" : sign.element === "air" ? "as connection and concept" : "as felt impression"} — ${SIGN_QUALITY[pos.signIndex]}.` +
    `${retroNote}`;

  // p1 — PAID: how element/modality/house shape this function in practice
  const houseSpecific = PLANET_HOUSE[key]?.[hi] ?? `In the ${houseOrd} house, ${meta.name} finds its expression through ${HOUSE_THROUGH[hi]}.`;
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
      `${oMeta.glyph} ${oMeta.name} — the outer octave planet — occupies ${oSign.name} in the ${oHouse} house. ` +
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
    paragraphs: withoutRepeatedSentences(paragraphs),
    aspectCards: aspectCardsFor(chart, key),
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
    ? ` Moving retrograde at your birth, ${meta.name} internalises its pressure even more deeply — the evolutionary or disruptive or dissolving quality operates primarily through interior work before it surfaces in external events.`
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
    `${meta.glyph} ${meta.name} — governing ${meta.fn.toLowerCase()}, the outer octave of ${innerMeta.name} — occupies ${sign.name} in the ${houseOrd} house, ${HOUSE_DOMAIN[hi]}. ` +
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
    pluto:   "Pluto · Transformation",
    uranus:  "Uranus · Ingenuity",
    neptune: "Neptune · Resonance",
  };
  const glyphMap: Record<string, string> = {
    pluto: "♇", uranus: "♅", neptune: "♆",
  };

  return {
    kind: "planet",
    order: 0,
    title: titleMap[key],
    subtitle: `${sign.name} — ${houseOrd} House · Outer Octave of ${innerMeta.name}`,
    glyph: glyphMap[key],
    planetKeys: [key],
    paragraphs: withoutRepeatedSentences(paragraphs),
    aspectCards: aspectCardsFor(chart, key),
  };
}

// ── Thresholds ─────────────────────────────────────────────────────────────────

function impactThreshold(chart: NatalChart): ReportSection {
  const mars = SIGNS[chart.positions.mars.signIndex].name;
  const pluto = SIGNS[chart.positions.pluto.signIndex].name;
  const mercury = SIGNS[chart.positions.mercury.signIndex].name;
  const uranus = SIGNS[chart.positions.uranus.signIndex].name;
  const marsHouse = ORDINALS[chart.positions.mars.house - 1];
  const mercuryHouse = ORDINALS[chart.positions.mercury.house - 1];
  return {
    kind: "threshold",
    order: 0,
    title: "Impact",
    subtitle: "Force · Intelligence → External Consequence",
    glyph: "◬",
    planetKeys: [],
    paragraphs: [
      `The Impact threshold is not a planet — it is a synthesis point, the architecture that emerges when force and intelligence converge. It answers one question: how does this blueprint convert directed force and unique intelligence into external consequence?`,
      `The force mechanism is held by Mars in ${mars} in the ${marsHouse} house — the initiating drive, the direction of applied energy, and the willingness to generate real movement. Pluto in ${pluto} operates as the outer register of that same mechanism: not initiation alone, but the depth and magnitude behind it — the transformational pressure that gives action its irreversible quality, the capacity to operate at an evolutionary scale rather than a surface one. Together, they determine the intensity and direction of how this blueprint applies force.`,
      `The intelligence mechanism is held by Mercury in ${mercury} in the ${mercuryHouse} house — the translation function, the capacity to organize information into understanding, to give the blueprint's output a form that can be received, built upon, and transmitted. Uranus in ${uranus} extends that function into ingenuity: breakthrough synthesis, the ability to identify what the established pattern misses, and the originality that introduces approaches ordinary intelligence does not locate. Together, they determine how this blueprint interprets and innovates.`,
      `The Impact threshold is the operating pattern created where these two mechanisms meet. Strategy without force remains theoretical. Force without strategy remains undirected. When this threshold is functioning with precision, what this blueprint produces is externally recognizable: specific, consequential, and not easily replicated — because it carries both the depth of the force mechanism and the precision of the intelligence mechanism working in coordination.`,
    ],
  };
}

function willThreshold(chart: NatalChart): ReportSection {
  const jupiter = SIGNS[chart.positions.jupiter.signIndex].name;
  const venus = SIGNS[chart.positions.venus.signIndex].name;
  const neptune = SIGNS[chart.positions.neptune.signIndex].name;
  const jupiterHouse = ORDINALS[chart.positions.jupiter.house - 1];
  const venusHouse = ORDINALS[chart.positions.venus.house - 1];
  return {
    kind: "threshold",
    order: 0,
    title: "Wealth",
    subtitle: "Expansion · Value → Accumulated Worth",
    glyph: "◬",
    planetKeys: [],
    paragraphs: [
      `The Wealth threshold is not a planet — it is the synthesis point that emerges when expansion and value converge. It answers one architectural question: how does this blueprint transform growth into lasting accumulated value?`,
      `Jupiter in ${jupiter} in the ${jupiterHouse} house governs the expansion mechanism: the inherent capacity to increase reach, multiply opportunity, and compound what is available to work with. Jupiter does not select — it extends. The sign and house it occupies describe the specific territory and quality of that growth, the channels through which the blueprint naturally widens its field.`,
      `Venus in ${venus} in the ${venusHouse} house governs the value function: the discernment to recognize what within an expanded field is genuinely worth retaining — what deserves sustained investment, what the system should build on. Neptune in ${neptune} extends that function into collective resonance, drawing the value signal beyond personal preference toward what carries meaning at a shared, symbolic, or enduring level. What Venus identifies as worth keeping, Neptune tests against a larger standard.`,
      `The Wealth threshold is the operating pattern created where these functions meet. Wealth, as this architecture defines it, is not limited to financial accumulation — it includes resources, knowledge, skills, relationships, reputation, creative output, and accumulated advantage in all its forms. This threshold describes how the blueprint converts the fields it expands into concentrated, lasting value: growth that does not merely increase, but compounds into something that continues generating return well after the original investment.`,
    ],
  };
}

function retentionThreshold(chart: NatalChart): ReportSection {
  const saturn = SIGNS[chart.positions.saturn.signIndex].name;
  const sun = SIGNS[chart.positions.sun.signIndex].name;
  const sunHouse = ORDINALS[chart.positions.sun.house - 1];
  const saturnHouse = ORDINALS[chart.positions.saturn.house - 1];
  return {
    kind: "threshold",
    order: 0,
    title: "Actualization",
    subtitle: "Essence · Structure → Embodied Expression",
    glyph: "◬",
    planetKeys: [],
    paragraphs: [
      `The Actualization threshold is not a planet — it is the synthesis point where essence and structure converge. It is the final point in the refinement cycle, and it answers the deepest architectural question: how does this blueprint transform inherent essence into enduring, embodied expression?`,
      `The Sun in ${sun} in the ${sunHouse} house holds the originating essence — the fundamental creative pattern encoded within this blueprint, the core identity structure from which the entire architecture extends. This is not what the blueprint does. It is what the blueprint is. Point 0 holds the essence as it enters the cycle: unrefined, inherent, already present.`,
      `Saturn in ${saturn} in the ${saturnHouse} house holds the structure function: the architecture, discipline, and mastery required for what is inherent to become durable. Saturn does not generate the essence — it gives the essence architecture to stand within. It is the mechanism by which potential becomes embodiment, and by which expression outlasts the moments that produce it. The specific sign and house describe the precise conditions under which this blueprint builds what endures.`,
      `The Actualization threshold is the expression of what this blueprint becomes when the full refinement cycle has operated with precision. Point 0 holds the original encoding. Point 9 holds the same essence after it has passed through reception, initiation, translation, expansion, cultivation, and structure. This threshold is not aspiration — it is the encoded endpoint of an architecture already in motion. What is being refined here is the capacity to fully embody what was always present: not to create the essence, but to develop the structure through which it can be expressed without remainder.`,
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
  add(outerPlanetSection(chart, "pluto"));   // outer octave of Mars
  add(planetSection(chart, "mercury"));
  add(outerPlanetSection(chart, "uranus"));  // outer octave of Mercury
  add(planetSection(chart, "jupiter"));
  add(planetSection(chart, "venus"));
  add(outerPlanetSection(chart, "neptune")); // outer octave of Venus
  add(planetSection(chart, "saturn"));

  const heroJourney = generateHeroJourney(chart, functions);
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
