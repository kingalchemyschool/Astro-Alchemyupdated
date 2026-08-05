---
name: Astral Forge chart points
description: Definitions and precision boundaries for angles, lunar nodes, Lilith, and Chiron in the shared chart model
---

The shared chart model treats AC, DC, MC, and IC as four coherent ecliptic angles derived from the same local sidereal frame. Mean North/South Nodes and mean Black Moon Lilith are stable point definitions for display and transit contacts. Chiron is currently a slow mean-longitude approximation intended for sign-level interpretation, not high-precision ephemeris claims.

**Why:** The Daily Forge personal, world, and natal views need the same point vocabulary, while the available local astronomy dependency does not provide a complete high-precision Chiron/Lilith implementation.

**How to apply:** Keep angles and additional points in the shared natal/transit model rather than creating a second chart system. If a precision ephemeris is added later, replace the point calculation centrally and preserve the UI/API shapes.