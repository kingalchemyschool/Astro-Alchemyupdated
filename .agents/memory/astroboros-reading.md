---
name: Astral Forge reading system
description: Key decisions about the reading architecture, archetype system, content rules, and canonical function terminology
---

## Canonical function names (PLANET_META.fn in constants/astro.ts)
These are the authoritative labels — used in section titles, aspect text, and enneagram display:
- sun: "Essence" (Point 0)
- moon: "Reception" (Point 1)
- mars: "Initiation" (Point 2)
- mercury: "Translation" (Point 4)
- jupiter: "Expansion" (Point 5)
- venus: "Value" (Point 7)
- saturn: "Structure" (Point 8)
- pluto: "Transformation" (outer octave of Mars)
- uranus: "Ingenuity" (outer octave of Mercury)
- neptune: "Resonance" (outer octave of Venus)

**Why:** The uploaded architecture spec defines these as the canonical point functions. Previous labels (Force, Expression, Foundation, Disruption, Dissolution, Perception, and Consolidation) were replaced.

## Threshold sections (lib/reading.ts)
- Point 3 — Impact: synthesis of Mars+Pluto (force/magnitude) + Mercury+Uranus (translation/ingenuity). Uses pluto, uranus sign placements. Subtitle: "Force · Intelligence → External Consequence"
- Point 6 — Wealth: synthesis of Jupiter (expansion) + Venus+Neptune (value+resonance). Subtitle: "Expansion · Value → Accumulated Worth"
- Point 9 — Actualization: synthesis of Sun (essence) + Saturn (structure). Does NOT use Moon. Subtitle: "Essence · Structure → Embodied Expression"

**Why:** Previous thresholds used wrong planetary inputs (Impact used Sun/Moon, Actualization used Moon) and wrong naming ("Being", "Will", "Retention", "Legacy").

## Archetype system
- 6 functions: message, execution, discipline, mastery, cultivation, integration
- Each function has 78 sign-pair archetypes looked up by signPairKey(signA, signB) = "${min}_${max}"
- Pairs are mirror-symmetric (same archetype regardless of direction)
- Defined in constants/archetypes.ts; picked in lib/archetypes.ts pickArchetype()

## Function pairs (planet pairs for archetypes)
- message: moon + mercury
- execution: mercury + mars
- discipline: mars + saturn
- mastery: saturn + jupiter
- cultivation: jupiter + venus
- integration: venus + moon

## Content rules
- Never use "cardinal", "fixed", or "mutable" in output text
- Blueprint Journey is a continuous, grounded developmental narrative; reveal the six archetype names only in the final paragraph
- Blueprint aspect prose describes approximate angular distance in plain language and never exposes orb values
- Blueprint house-aspect prose describes contribution, transformation, reverse flow, and imbalance rather than listing two house definitions
- Forbidden hero journey openings: "Every hero...", "Once there was...", "Our story begins...", "Before doing anything..."
- Thresholds use architecture language: "encoded", "inherent", "operating pattern", "refinement", "embodiment" — avoid manifestation language and personality traits
