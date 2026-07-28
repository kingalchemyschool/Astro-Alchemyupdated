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