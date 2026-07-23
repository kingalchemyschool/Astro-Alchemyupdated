// DST-accurate UTC offset resolution.
//
// Given an IANA timezone id (e.g. "America/New_York") and a local wall-clock
// birth date/time, return the UTC offset in hours that was in effect at that
// moment — including historical daylight-saving rules — using the platform Intl
// database. This is far more accurate than a single fixed offset per city.

export function getTimezoneOffset(
  timeZone: string,
  dateStr: string,
  timeStr: string
): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);

  // Treat the entered wall-clock time as if it were UTC to get a probe instant.
  const asUTC = Date.UTC(y, m - 1, d, hh || 0, mm || 0, 0);

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(new Date(asUTC));
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }

  const tzAsUTC = Date.UTC(
    map.year,
    (map.month ?? 1) - 1,
    map.day ?? 1,
    map.hour ?? 0,
    map.minute ?? 0,
    map.second ?? 0
  );

  const offsetHours = (tzAsUTC - asUTC) / 3_600_000;
  // Round to the nearest minute to avoid floating dust.
  return Math.round(offsetHours * 60) / 60;
}
