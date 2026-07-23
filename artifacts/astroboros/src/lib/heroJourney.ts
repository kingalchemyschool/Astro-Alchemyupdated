import type { HeroJourney, NatalChart, PrimaryArchetype } from "@/types/astro";

// Sign-specific narrative fragments for each planetary function.
// Each entry completes a mythic second-person sentence without naming
// the sign or using cardinal/fixed/mutable terminology.

const SUN_MYTH: string[] = [
  // Aries
  "The calling arrives before the explanation does — a first move that creates the world rather than waiting for it. You were not summoned. You simply began.",
  // Taurus
  "The calling is not a question but a weight — something placed in your hands that was worth keeping before you knew what it was. You were not sent anywhere. You were rooted somewhere.",
  // Gemini
  "The calling arrives as a gap between two ideas that desperately need each other. You are the one who notices. You are the bridge before the bridge has a name.",
  // Cancer
  "The calling moves through feeling first, through the full weight of what has been received and remembered. You do not choose the story — you inherit it, and then decide what it means.",
  // Leo
  "The calling requires a stage. Not out of vanity — out of necessity. What you carry must be witnessed to become real, and what you make holds the force of your full self.",
  // Virgo
  "The calling is a problem worth solving, a standard worth meeting. You are here to serve the work, and the work rewards only those willing to be honest about what it actually requires.",
  // Libra
  "The calling lives in the space between two people. You did not arrive to be alone with what you know — you arrived to make it into something that bridges.",
  // Scorpio
  "The calling arrives from the dark — from the depth of what cannot be avoided and refuses to be simplified. What you make has weight precisely because you did not look away.",
  // Sagittarius
  "The calling is at the edge of what is already known. You were not made for what has already been mapped. The next territory is always the real destination.",
  // Capricorn
  "The calling is a mountain — not as obstacle but as orientation. You create from ambition aimed at what lasts, and you do not stop before the work stands on its own.",
  // Aquarius
  "The calling is a question the world has not asked yet. You arrived to make the future inhabitable, and the present is never quite the right container for what you are carrying.",
  // Pisces
  "The calling arrives at the edge of the visible, from the current of what is not yet form. You do not invent what you make — you receive it, then give it shape.",
];

const MOON_MYTH: string[] = [
  // Aries
  "Beneath the story, the interior weather runs hot and immediate — trusting the first signal over the long debate. It is not recklessness. It is a kind of fidelity to what arrives before the mind has time to intervene.",
  // Taurus
  "Beneath the story, the interior world seeks ground — sensing what is solid, withdrawing from what is not. Safety is not a destination; it is a quality of the soil, tested slowly and trusted only when it holds.",
  // Gemini
  "Beneath the story, the interior world gathers data, reading the weather by watching how the wind changes. Certainty is not the goal. Legibility is — making sense of what is happening in real time.",
  // Cancer
  "Beneath the story, the interior world absorbs the room, holding the unspoken emotional truth of every space it enters. Nothing is lost in there. Everything is stored until it becomes wisdom.",
  // Leo
  "Beneath the story, the interior world demands a center — orienting naturally toward the warmth of being seen, the safety of being fully known. Recognition is not vanity. It is how the emotional body knows it is real.",
  // Virgo
  "Beneath the story, the interior world analyzes the flow, searching for what needs attention before it can rest. Peace is not the absence of problems. It is the satisfaction of a problem well-handled.",
  // Libra
  "Beneath the story, the interior world calibrates the balance — adjusting constantly, sensing the relational field, searching for the equilibrium that allows everything to coexist.",
  // Scorpio
  "Beneath the story, the interior world peers underneath every surface, refusing to accept the visible as the whole account. What cannot be seen is not therefore absent. It is waiting to be found.",
  // Sagittarius
  "Beneath the story, the interior world looks to the horizon, finding safety in motion rather than stillness. The open road is not escape — it is home.",
  // Capricorn
  "Beneath the story, the interior world builds walls — measuring emotional safety by what can be secured and what can be trusted to hold under pressure.",
  // Aquarius
  "Beneath the story, the interior world steps outside the circle, viewing the emotional field from a slight distance — not coldly, but with the clarity that comes from perspective.",
  // Pisces
  "Beneath the story, the interior world diffuses into everything, catching currents that others walk past without noticing. The boundary between self and world is a question, not a given.",
];

const MARS_MYTH: string[] = [
  // Aries
  "When the story asks for a first move, the answer is immediate — a flare of action that leaves convention behind. The lesson arrives later: striking fast is not the same as striking true.",
  // Taurus
  "When the story asks for a first move, the answer is an unstoppable, deliberate march — a force that outlasts opposition by refusing to stop. The lesson arrives later: endurance without direction is just slow exhaustion.",
  // Gemini
  "When the story asks for a first move, the answer scatters — striking from multiple angles until a weak point is found. The lesson arrives later: a thousand small moves do not always add to one large result.",
  // Cancer
  "When the story asks for a first move, the answer encircles — approaching from the side, reading the moment before committing. The lesson arrives later: protection is a form of force, but it cannot be its only form.",
  // Leo
  "When the story asks for a first move, the answer commands — stepping to the center and expecting to be followed. The lesson arrives later: authority must be earned in the doing, not assumed in the stepping forward.",
  // Virgo
  "When the story asks for a first move, the answer dissects — applying effort like a scalpel, exactly where it matters. The lesson arrives later: precision can become an excuse to avoid the full scope of what the moment requires.",
  // Libra
  "When the story asks for a first move, the answer aims for equilibrium — engaging force in a way that seeks a cleaner outcome for all involved. The lesson arrives later: fair and effective are not always the same.",
  // Scorpio
  "When the story asks for a first move, the answer drives to the root — intensity straight to the source of the issue. The lesson arrives later: not everything can be transformed by force alone, even the most concentrated kind.",
  // Sagittarius
  "When the story asks for a first move, the answer launches — throwing energy outward in an arc that does not look back. The lesson arrives later: the destination matters as much as the momentum.",
  // Capricorn
  "When the story asks for a first move, the answer engineers — sequencing action so that every step supports the next one. The lesson arrives later: the blueprint is only as good as the willingness to adapt it.",
  // Aquarius
  "When the story asks for a first move, the answer disrupts — applying pressure exactly where the old system has to break to let something new through. The lesson arrives later: rupture without replacement is only half the work.",
  // Pisces
  "When the story asks for a first move, the answer dissolves — bypassing resistance entirely by moving like water around it. The lesson arrives later: every obstacle that is circumvented must eventually be returned to.",
];

const IMPACT_MYTH: string[] = [
  // Not sign-specific — one version for all (threshold is chart-positional, not sign-based)
  "Here the first initiation arrives. Between force and direction stands a threshold that cannot be forced open — it must be crossed by becoming different on the other side. The hero who arrives at this threshold is one kind of person. The one who crosses it is another. The question is no longer how hard to push. It is: where does this need to land? In answering it honestly — not strategically, not efficiently, but honestly — something fundamental shifts. What had been momentum becomes intention.",
];

const MERCURY_MYTH: string[] = [
  // Aries
  "Past the threshold, the gift arrives: the ability to speak in sparks, to cut through the noise and deliver the essential before others have finished clearing their throats. Intelligence enters the story — not as an alternative to force, but as its most precise expression.",
  // Taurus
  "Past the threshold, the gift arrives: the ability to speak in stone, ensuring every word has weight, use, and the kind of grip that does not release when the conversation moves on. Intelligence enters the story not as speed but as permanence.",
  // Gemini
  "Past the threshold, the gift arrives: the ability to speak in webs, linking what others have not yet connected, moving at the pace that forces the room to catch up. Intelligence enters the story as the architecture of relationship between ideas.",
  // Cancer
  "Past the threshold, the gift arrives: the ability to speak in echoes, infusing language with the memory of what it means and the feeling that should accompany it. Intelligence enters the story as emotional fidelity.",
  // Leo
  "Past the threshold, the gift arrives: the ability to speak in broadcasts — projecting ideas with an authority that insists on being heard and makes the room feel that the hearing matters. Intelligence enters the story as presence.",
  // Virgo
  "Past the threshold, the gift arrives: the ability to speak in blueprints, breaking the grand design down into what can actually be built. Intelligence enters the story as the discipline of the useful, the precise, the honest.",
  // Libra
  "Past the threshold, the gift arrives: the ability to speak in bridges — constantly translating between competing perspectives until both sides have heard something they could not have reached alone. Intelligence enters the story as mediation.",
  // Scorpio
  "Past the threshold, the gift arrives: the ability to speak in shadows, naming the underlying truth that the room is trying to keep comfortable by ignoring. Intelligence enters the story as excavation.",
  // Sagittarius
  "Past the threshold, the gift arrives: the ability to speak in arrows, firing concepts toward the larger philosophical mark and trusting the audience to retrieve the arrow themselves. Intelligence enters the story as direction.",
  // Capricorn
  "Past the threshold, the gift arrives: the ability to speak in architecture, organizing thought into structures that actually stand under real-world pressure. Intelligence enters the story as the discipline of form.",
  // Aquarius
  "Past the threshold, the gift arrives: the ability to speak in frequencies, tuning into the pattern that is forming before it has name or precedent. Intelligence enters the story as the capacity to transmit the not-yet-known.",
  // Pisces
  "Past the threshold, the gift arrives: the ability to speak in poetry, allowing meaning to bypass the logical layer and land directly in the gut. Intelligence enters the story as resonance — the truth that does not require argument.",
];

const JUPITER_MYTH: string[] = [
  // Aries
  "Then comes the expansion — the moment in every story where the field opens wider than expected. For this hero, the opening requires courage. Growth arrives first as an invitation to move before the path is certain, and it keeps demanding that until the pattern is recognized.",
  // Taurus
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening relies on accumulation. Growth arrives as a slow compounding of what has been tended, and it keeps rewarding patience until patience becomes its own form of genius.",
  // Gemini
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening is driven by curiosity. Growth arrives through the unexpected tangent, the side door, the connection that was not in the original plan — and it keeps arriving that way.",
  // Cancer
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening relies on connection. Growth is not solitary — it happens in the nourishment of what is nearest, and it keeps expanding from the center outward.",
  // Leo
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening requires radiance — occupying the center fully enough that what grows around it has something to grow toward. The risk is the same as the gift.",
  // Virgo
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening relies on refinement. Growth happens when the details are honored rather than simplified, and it keeps revealing that what looks like a small thing is actually the load-bearing piece.",
  // Libra
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening requires partnership. Growth arrives in the balance — in the space between, in the quality of what is built with another — and it keeps teaching that abundance is relational.",
  // Scorpio
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening requires depth. Growth arrives when the uncomfortable territory is entered rather than circumnavigated, and it keeps insisting on that until depth becomes the default mode.",
  // Sagittarius
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening is boundless in principle and governed by belief in practice. Growth arrives at the edge of what is already known, and it keeps arriving there.",
  // Capricorn
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening is governed by discipline and respect for the long game. Growth arrives as the compound result of sustained, patient effort — not as a windfall, but as an architecture.",
  // Aquarius
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening requires revolution. Growth arrives when the accepted rule is examined and found insufficient — and it keeps arriving that way, at the edge of what convention permits.",
  // Pisces
  "Then comes the expansion — the moment the field opens wider than expected. For this hero, the opening requires surrender. Growth arrives when the current is allowed to take the work somewhere it could not have been steered consciously.",
];

const WILL_MYTH: string[] = [
  "The second initiation arrives inside the abundance. Between more and meaningful stands a threshold that cannot be reasoned through — it must be chosen through. What is left behind at this crossing matters as much as what is carried forward. The hero who arrives here has everything available. The one who crosses knows what everything is actually for. This is the moment purpose is separated from its shadow — the version of desire that is merely large — and the work stops being measured by scale and starts being defined by what it is worth.",
];

const VENUS_MYTH: string[] = [
  // Aries
  "Past the second threshold, the true treasure reveals itself: the value of the chase itself — what is fierce, fresh, and willing to risk being wrong. The hero discovers not a destination but a quality of engagement that will drive every worthy investment from here forward.",
  // Taurus
  "Past the second threshold, the true treasure reveals itself: the value of what can be held, tasted, trusted, and returned to. The hero discovers that what endures is not always what is first — but it is always what was built with the right materials.",
  // Gemini
  "Past the second threshold, the true treasure reveals itself: the value of the conversation that keeps moving, the idea that generates more ideas, the connection that changes how both sides think. The hero discovers that what is worth keeping is always alive.",
  // Cancer
  "Past the second threshold, the true treasure reveals itself: the value of what is safe, familiar, and fiercely protected — the sanctuary that makes the rest of the work possible. The hero discovers that belonging is not a weakness but a source.",
  // Leo
  "Past the second threshold, the true treasure reveals itself: the value of the generosity that does not require reciprocation — the love that is grand because it risks being large, not because it is modest. The hero discovers that what is worth keeping is what was given fully.",
  // Virgo
  "Past the second threshold, the true treasure reveals itself: the value of the well-made thing — the solution that actually holds, the work that serves without calling attention to itself. The hero discovers that beauty and function are not in competition.",
  // Libra
  "Past the second threshold, the true treasure reveals itself: the value of the match — of the relationship, the proportion, the restoration of what was imbalanced. The hero discovers that what is worth protecting is always a form of connection.",
  // Scorpio
  "Past the second threshold, the true treasure reveals itself: the value of the bond that asks for everything and receives everything in return — the intensity that transforms both parties and leaves neither unchanged. The hero discovers that depth is the real currency.",
  // Sagittarius
  "Past the second threshold, the true treasure reveals itself: the value of the journey itself — not as a detour before the destination, but as the destination. The hero discovers that what is worth protecting is the freedom to keep going.",
  // Capricorn
  "Past the second threshold, the true treasure reveals itself: the value of the commitment that withstands time — the investment that compounds rather than depreciates, the structure of love and loyalty that does not require renegotiation. The hero discovers that what endures is what was chosen clearly.",
  // Aquarius
  "Past the second threshold, the true treasure reveals itself: the value of what stands apart — the idea, the person, the creation that refuses to be ordinary and is extraordinary precisely because it knows it. The hero discovers that what is worth protecting is always slightly ahead of what the room is ready for.",
  // Pisces
  "Past the second threshold, the true treasure reveals itself: the value of the dissolution — the merger, the boundary that becomes permeable, the love that does not require separation to be real. The hero discovers that what is worth protecting is always a form of union.",
];

const SATURN_MYTH: string[] = [
  // Aries
  "The last trial belongs to what is built to last. Here, the work of mastering impulse begins — not suppressing it, but forging the patience that makes initiative sustainable rather than merely periodic. The hero learns that the structure that survives is the one built at the right speed.",
  // Taurus
  "The last trial belongs to what is built to last. Here, the work of mastering inertia begins — not removing stability, but learning to move the structure when the structure has stopped serving. The hero learns that permanence and rigidity are not the same.",
  // Gemini
  "The last trial belongs to what is built to last. Here, the work of mastering focus begins — forcing the scattered, brilliant mind into a single channel for long enough that something accumulates. The hero learns that the capacity to stay is as important as the capacity to see.",
  // Cancer
  "The last trial belongs to what is built to last. Here, the work of mastering emotional boundaries begins — holding shape when the tide rushes in, maintaining form without losing contact. The hero learns that the strongest walls still have gates.",
  // Leo
  "The last trial belongs to what is built to last. Here, the work of mastering the ego begins — converting the need to be seen into the responsibility to lead, the need for applause into the willingness to be accountable. The hero learns that authority is not given by recognition. It is earned by serving what is larger than the self.",
  // Virgo
  "The last trial belongs to what is built to last. Here, the work of mastering the detail begins — ensuring that perfectionism serves the work rather than replacing it. The hero learns that the excellent and the finished are both required, and that sometimes the second matters more.",
  // Libra
  "The last trial belongs to what is built to last. Here, the work of mastering independence begins — finding the center when others pull away, developing the authority that does not require agreement to stand. The hero learns that the strongest partnership is built between two people who could each stand alone.",
  // Scorpio
  "The last trial belongs to what is built to last. Here, the work of mastering power begins — learning to hold enormous intensity without allowing it to consume what it was meant to protect. The hero learns that control and destruction are separated only by intention.",
  // Sagittarius
  "The last trial belongs to what is built to last. Here, the work of mastering the map begins — converting grand philosophy into workable, livable law. The hero learns that wisdom without structure remains inspiration, and that inspiration alone builds nothing that survives the one who held it.",
  // Capricorn
  "The last trial belongs to what is built to last. Here, the work of mastering time itself begins — bearing the weight of the long climb without collapse, honoring the pace that the work actually requires. The hero learns that what is built at the right speed does not fall.",
  // Aquarius
  "The last trial belongs to what is built to last. Here, the work of mastering the collective begins — building structures that serve the future rather than only the present, that hold the strange and the brilliant rather than excluding them. The hero learns that the most important systems are the ones that do not require a genius to maintain.",
  // Pisces
  "The last trial belongs to what is built to last. Here, the work of mastering the boundless begins — giving concrete form to what is fluid and divine, making the invisible inhabitable. The hero learns that what flows must eventually be given a channel if it is to reach the places that need it.",
];

export function generateHeroJourney(
  chart: NatalChart,
  primary: PrimaryArchetype
): HeroJourney {
  const name = chart.input.name?.trim() || "the hero";
  const p = chart.positions;

  const sunMyth  = SUN_MYTH[p.sun.signIndex];
  const moonMyth = MOON_MYTH[p.moon.signIndex];
  const marsMyth = MARS_MYTH[p.mars.signIndex];
  const mercMyth = MERCURY_MYTH[p.mercury.signIndex];
  const jupMyth  = JUPITER_MYTH[p.jupiter.signIndex];
  const venMyth  = VENUS_MYTH[p.venus.signIndex];
  const satMyth  = SATURN_MYTH[p.saturn.signIndex];

  // Threshold paragraphs have one version regardless of sign.
  const impactMyth = IMPACT_MYTH[0];
  const willMyth   = WILL_MYTH[0];

  return {
    title: `The Blueprint of ${name}`,
    paragraphs: [
      // 1. The Calling — Sun
      `${sunMyth} This is where ${name}'s story begins — not in preparation, not in waiting, but at the exact point where identity becomes an act.`,

      // 2. The Interior World — Moon
      `${moonMyth} This is not a secondary feature of the story. It is the invisible current that determines which way everything else runs.`,

      // 3. The First Move — Mars
      `${marsMyth} The force is real, and the lessons it generates are equally real. No story progresses without this function; no function runs cleanly without being aimed.`,

      // 4. The Being Threshold — Impact initiation
      `${impactMyth} For ${name}, this crossing is not optional. The chart was designed to bring it. What arrives on the other side is not mastery — it is direction. And direction, it turns out, is the prerequisite for everything else.`,

      // 5. The Gift — Mercury
      `${mercMyth} This is the weapon the myth required: not strength alone, but the capacity to translate what has been learned into something that reaches others. The map is drawn from the inside of the experience, not from above it.`,

      // 6. The Expansion — Jupiter
      `${jupMyth} Here the story opens in a way it could not have predicted. The risk is real: not every expansion that feels like growth is growth. Some of it is drift wearing the mask of opportunity. ${name} will have to learn to tell the difference from the inside.`,

      // 7. The Will Threshold — Wealth initiation
      `${willMyth} For ${name}, the choice is specific — it cannot be made in the abstract, only at the actual point where the path forks and both options feel like loss. This is not a failure of the story. This is its hinge.`,

      // 8. The True Treasure — Venus
      `${venMyth} This is not a reward for surviving the threshold — it is what the threshold was for. The hero was always moving toward this. The initiations were the preparation for being able to see it clearly.`,

      // 9. The Final Trial — Saturn + Legacy initiation
      `${satMyth} This is the Retention threshold: the moment the hero discovers that building something is not enough. What is built must outlast the builder. The creation must become part of the world rather than something the world merely contains. ${name} does not pass this threshold by finishing. They pass it by making something that does not need them anymore.`,

      // 10. The Moral — Primary archetype
      `What remains on the other side is not a different person. It is ${name} — finally fully inhabited, finally operating as what they were always designed to be. As ${primary.name} — the one who ${primary.line} — the blueprint was never incomplete. Every threshold was a clarification. Every resistance was a refinement. The legend the chart was trying to tell was always this one. The only thing that was required was the willingness to read it.`,
    ],
  };
}
