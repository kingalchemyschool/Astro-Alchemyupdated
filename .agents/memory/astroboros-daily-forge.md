---
name: Daily Forge calendar and zodiac
description: Date and zodiac consistency rules for Daily Forge reports
---

Daily Forge reports must use the user’s local calendar day rather than a UTC date string. The transit chart must be computed with the same explicit zodiac system as the currently displayed natal chart, and the date should be captured once for the whole request/cache cycle.

**Why:** UTC conversion can show the wrong day near midnight, and implicit zodiac defaults can pair sidereal natal positions with tropical transits or the reverse.

**How to apply:** Keep the local `YYYY-MM-DD` helper as the date source, compute the daily sky at a stable noon reference on that date, pass the active zodiac and captured date into transit computation, and include both in report cache/request identity.

The Moon ephemeris returns an `astronomia` `Coord` object; read its longitude as `moon.lon` rather than destructuring `{ lon }`.

**Why:** Destructuring the getter-backed longitude produced an invalid Moon position, creating false Moon aspects and hiding the sidereal contacts shown by Astro-Seek.

**How to apply:** When changing or upgrading the Moon calculation, verify both natal and transit Moon positions before trusting Daily Forge aspects.

The ephemeris day counter uses the Schlyter epoch (JD 2451543.5), so conversions into `astronomia` JDE-based routines must add 2451543.5, not J2000.0 JD 2451545.0.

**Why:** The 1.5-day offset moved the natal Moon by about 18°, incorrectly placing it in the 10th house instead of the 9th; Pluto used the same incorrect conversion.

**How to apply:** Validate natal Moon and Pluto against known chart references before diagnosing house cusps; if the cusps match but a planet does not, inspect the epoch conversion first.

Daily Forge aspect selection should use one box per transiting planet, with room for up to two Moon contacts when available; each box carries the detailed interpretation, while Celestial State synthesizes the overall energy and Moon processing instead of repeating the boxes.

**Why:** A single transit planet can aspect multiple natal planets and crowd out the rest of the sky, while a transit-by-transit Celestial State duplicated the information already visible in the boxes.

**How to apply:** Deduplicate non-Moon transit planets during ranked aspect selection, preserve extra lunar coverage, and keep Celestial State at the level of energetic tone, processing, and response.