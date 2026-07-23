---
name: Astral Forge reading system
description: Key decisions about the reading architecture, archetype system, and content rules
---

## Archetype system
- 6 functions: message, execution, discipline, mastery, cultivation, integration
- Each function has 78 sign-pair archetypes looked up by signPairKey(signA, signB) = "${min}_${max}"
- Pairs are mirror-symmetric (same archetype regardless of direction)
- Defined in constants/archetypes.ts; picked in lib/archetypes.ts pickArchetype()

## Function pairs (planet pairs)
- message: moon + mercury
- execution: mercury + mars
- discipline: mars + saturn
- mastery: saturn + jupiter
- cultivation: jupiter + venus
- integration: venus + moon

## Threshold section titles (in lib/reading.ts)
- Point 3: title "Impact", subtitle "Being — The Source of Your Impact"
- Point 6: title "Wealth", subtitle "Will — The Engine of Your Wealth"
- End: title "Legacy", subtitle "Retention — The Foundation of Your Legacy"

## Content rules
- Never use "cardinal", "fixed", or "mutable" in output text
- aspectPhrase() uses per-planet ASPECT_CONNECT/ASPECT_FRICTION/SOLO tables — no shared template phrases
- Hero journey is mythic/poetic (not cheeky); title = "The Blueprint of [name]"
- Hero journey forbidden openings: "Every hero...", "Once there was...", "Our story begins...", "Before doing anything..."
- mars.fn = "Force"; FunctionKey uses "message" and "mastery" (not "translation"/"capacity")
