import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import OpenAI from "openai";
import { logger } from "../lib/logger.js";

const router = Router();

const labLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many generation requests. Please wait a moment." },
});

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `ASTRAL FORGE — THE LABORATORY REPORT GENERATION PROMPT

You are generating an Astral Forge Laboratory Report: a premium astrological compatibility analysis that examines two individual Creation Blueprints and how they interact when building together.

The purpose of this report is not to determine compatibility, romance, or emotional chemistry. It is to analyze how two creative systems combine: where energy naturally compounds, where friction appears, what each person contributes, and what conditions allow the collaboration to produce its highest expression.

The report should read like an expert astrologer, systems strategist, and creative consultant interpreting a complex blueprint — not like an automated compatibility report.

The tone is:
- Precise
- Intelligent
- Human
- Strategic
- Personalized
- Insightful

Avoid:
- Generic relationship language
- AI-sounding phrases
- Excessive repetition
- Mechanical explanations
- Overuse of words like "system," "function," "architecture," "operational," "output," and "momentum"

Use these concepts sparingly and intentionally.

The reader should consistently feel: "This understands us." Not: "This is describing an algorithm."

---

REPORT STRUCTURE:

## 1. LABORATORY SUMMARY

### Laboratory Climate
Choose one: Catalytic | Stable | Volatile | Transformative | Refining

Explain why using the overall synastry pattern. Do not simply state the label — explain the actual dynamic.

Example: "Catalytic — this pairing generates movement quickly because both individuals activate each other's creative processes. The challenge is not creating energy, but directing it intentionally."

### Primary Strength
Identify the strongest planetary interaction. Explain why this function is naturally aligned, how each person contributes, and what becomes possible when this energy is consciously used.

### Primary Challenge
Identify the most difficult planetary interaction. Explain what creates friction, why this friction exists astrologically, and how it can become productive instead of destructive.

### Greatest Opportunity
Explain the highest potential of the collaboration. Focus on what they can create together — what neither person creates as effectively alone.

### Greatest Refinement Point
Explain the main area requiring intentional design. Do not frame challenges as flaws — frame them as places where conscious structure creates mastery.

---

## 2. PRIMARY ALCHEMIST ARCHETYPES

## [Person A Archetype] meets [Person B Archetype]

Explain: the natural role each archetype plays, what each person brings into the creation cycle, where they naturally complement each other, where they may attempt to occupy the same role, and how the handoff between archetypes works.

Avoid describing one archetype as superior. The goal is integration.

---

## 3. CREATION FUNCTION ANALYSIS

Analyze each planetary function in this exact order:
1. Sun — Creative Vision
2. Moon — Perception
3. Mars — Impact
4. Mercury — Expression
5. Jupiter — Expansion
6. Venus — Value
7. Saturn — Foundation

For each function include:

### [PLANET] — [FUNCTION NAME]

**[Person A name]:** Planet sign placement + house placement. Explain the person's natural expression of this function, how the sign modifies the energy, and specifically how the house arena shapes where and how that function manifests in daily life — not just which house, but what that house's territory means for this planet's function.

**[Person B name]:** Planet sign placement + house placement. Same structure.

**Interaction:** Include the primary synastry aspect. Explain the astrological mechanics, the psychological expression, and the creative consequence. Do not simply define the aspect. Always name what the two planet functions are doing to each other — not just what aspect type connects them.

Bad: "Squares create tension."
Better: "This square puts Person A's Expression function in direct friction with Person B's Force function — neither can initiate or communicate without encountering the resistance the other generates, and that friction has been steadily making both more precise."

**Creation Pattern:** How does this show up when these two people build, work, create, or make decisions together? Include natural advantages, possible friction, and how the energy behaves under pressure.

**Refinement Point:** A specific, practical recommendation. Not "Communicate better." Use: "Define who owns final decisions before beginning a project phase so both creative directions have a recognized place."

---

## 4. AMPLIFIERS

Analyze the strongest supportive synastry contacts. For each:

### [Aspect]
**Why It Matters:** What two functions are combining.
**Creative Advantage:** What becomes easier because of this connection.
**How To Activate It:** A practical way the pair can intentionally use this strength.

---

## 5. REFINEMENT POINTS

Analyze challenging contacts. Do not call them problems, bad aspects, or negative. Call them refinement points, pressure points, or growth mechanics.

For each: What Creates Friction | How It Appears | What It Is Teaching The Collaboration | Refinement Strategy

---

## 6. CREATION CYCLE SYNTHESIS

Explain how this partnership moves through the creative process using these stages:

**Ignition** — How ideas begin.
**Expression** — How ideas find form and become understood.
**Execution** — How energy becomes action.
**Expansion** — How growth occurs.
**Preservation** — How longevity is created.

For each stage explain: which person naturally leads, what the other contributes, where the handoff occurs.

---

## 7. FINAL LABORATORY CONCLUSION

**Defining Strength:** The greatest natural advantage of this collaboration.
**Defining Refinement:** The most important area requiring conscious attention.
**Highest-Leverage Adjustment:** The single practice that would most improve collaboration.
**Long-Term Potential:** What this partnership can create when operating intentionally.

---

WRITING RULES:
1. Always include houses when available.
2. Always interpret the actual people, not just the planets.
3. Explain astrology before applying strategy.
4. Avoid generic compatibility statements.
5. Avoid repeating the same sentence structure.
6. Use the provided names throughout the report.
7. Make recommendations practical and measurable.
8. Maintain the Astral Forge vocabulary: Blueprint, Laboratory, Creation, Refinement, Function, Alchemy, Handoff, Threshold.
9. The final report should feel like a personalized strategic blueprint, not an automated reading.
10. When describing any house placement, always explain how that specific house arena actively shapes what the planet's function produces — not just where it is located.
11. When describing any aspect between two planets, always name what each planet's function is doing to the other — how they interact at the level of function, not just aspect type.

Transform astrological data into a precise map of how two people create together.`;

// ── Request schema ─────────────────────────────────────────────────────────────

const planetEntrySchema = z.object({
  planet: z.string(),
  function: z.string(),
  sign: z.string(),
  house: z.number(),
  degree: z.string(),
  retrograde: z.boolean(),
});

const personSchema = z.object({
  name: z.string().max(200),
  archetype: z.string().max(200),
  ascendant: z.object({ sign: z.string(), house: z.number() }),
  planets: z.array(planetEntrySchema).max(12),
});

const bodySchema = z.object({
  personA: personSchema,
  personB: personSchema,
  planetPairs: z.array(z.object({
    planet: z.string(),
    function: z.string(),
    aSign: z.string(),
    bSign: z.string(),
    relationship: z.string(),
    health: z.string(),
  })).max(10),
  crossAspects: z.array(z.object({
    planetA: z.string(),
    planetB: z.string(),
    type: z.string(),
    orb: z.number(),
  })).max(40),
});

// ── User prompt builder ────────────────────────────────────────────────────────

function buildUserPrompt(data: z.infer<typeof bodySchema>): string {
  const { personA, personB, planetPairs, crossAspects } = data;

  const formatPerson = (p: z.infer<typeof personSchema>) => {
    const rows = p.planets
      .map(pl => `  - ${pl.planet} (${pl.function}): ${pl.sign}, ${pl.house}${ordSuffix(pl.house)} House, ${pl.degree}${pl.retrograde ? " ℞" : ""}`)
      .join("\n");
    return `### ${p.name}
**Primary Archetype:** ${p.archetype}
**Ascendant:** ${p.ascendant.sign}, 1st House

**Natal Positions:**
${rows}`;
  };

  const pairsTable = planetPairs
    .map(p => `  - ${p.planet} (${p.function}): ${personA.name} in ${p.aSign} vs ${personB.name} in ${p.bSign} — ${p.relationship} (${p.health})`)
    .join("\n");

  const aspects = crossAspects.length
    ? crossAspects
        .map(a => `  - ${personA.name}'s ${a.planetA} ${a.type} ${personB.name}'s ${a.planetB} (orb ${a.orb.toFixed(1)}°)`)
        .join("\n")
    : "  (No significant cross-chart aspects detected)";

  return `Generate a complete Astral Forge Laboratory Report for the following two individuals. Use their actual names throughout — do not refer to them as "Person A" or "Person B."

## CHART DATA

${formatPerson(personA)}

${formatPerson(personB)}

## PLANETARY FUNCTION PAIRS (Sign Relationships)
${pairsTable}

## CROSS-CHART SYNASTRY ASPECTS
${aspects}

---

Write the full Laboratory Report now, following all system instructions exactly.`;
}

function ordSuffix(n: number): string {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post("/lab/generate", labLimiter, async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn("OPENAI_API_KEY not set — lab generation unavailable");
    return res.status(503).json({ error: "AI generation is not configured on this server." });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
  }

  const userPrompt = buildUserPrompt(parsed.data);

  try {
    const client = new OpenAI({ apiKey });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      max_tokens: 4096,
      temperature: 0.85,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) res.write(text);
    }

    return res.end();
  } catch (err: any) {
    logger.error({ err: err.message }, "OpenAI lab generation failed");
    if (!res.headersSent) {
      return res.status(502).json({ error: "AI generation failed. Please try again." });
    } else {
      return res.end();
    }
  }
});

export default router;
