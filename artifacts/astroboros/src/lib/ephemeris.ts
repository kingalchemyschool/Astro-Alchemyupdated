import type {
  BirthInput,
  NatalChart,
  PlanetKey,
  PlanetPosition,
  Ascendant,
  AdditionalPointKey,
  ChartPointPosition,
  ChartAngles,
} from "@/types/astro";
import { SIGNS } from "@/constants/astro";
import { computeAspects } from "@/lib/aspects";
import { getTimezoneOffset } from "@/lib/timezone";
import { placidusCusps, houseOf, lahiriAyanamsa } from "@/lib/houses";
import { heliocentric as plutoHeliocentric } from "astronomia/pluto";
import { position as moonPositionMeeus } from "astronomia/moonposition";

// --- trig helpers (degrees) ---
const RAD = Math.PI / 180;
const rev = (x: number) => ((x % 360) + 360) % 360;
const sind = (x: number) => Math.sin(x * RAD);
const cosd = (x: number) => Math.cos(x * RAD);
const tand = (x: number) => Math.tan(x * RAD);
const atan2d = (y: number, x: number) => Math.atan2(y, x) / RAD;

interface Elements {
  N: number; i: number; w: number; a: number; e: number; M: number;
}

// Low-precision orbital elements (Paul Schlyter), d = days since 2000 Jan 0.0 UT
function elements(key: PlanetKey, d: number): Elements {
  switch (key) {
    case "sun":
      return { N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1.0, e: 0.016709 - 1.151e-9 * d, M: 356.047 + 0.9856002585 * d };
    case "moon":
      return { N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d };
    case "mercury":
      return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5.0e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d };
    case "venus":
      return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d };
    case "mars":
      return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d };
    case "jupiter":
      return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d };
    case "saturn":
      return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d };
    case "uranus":
      return { N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d };
    case "neptune":
      return { N: 131.7806 + 3.0173e-5 * d, i: 1.77 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d };
    default:
      return { N: 0, i: 0, w: 0, a: 1, e: 0, M: 0 };
  }
}

function eccentricAnomaly(M: number, e: number): number {
  M = rev(M);
  let E = M + (180 / Math.PI) * e * sind(M) * (1 + e * cosd(M));
  for (let n = 0; n < 5; n++) {
    E = E - (E - (180 / Math.PI) * e * sind(E) - M) / (1 - e * cosd(E));
  }
  return E;
}

function sunPosition(d: number) {
  const o = elements("sun", d);
  const E = eccentricAnomaly(o.M, o.e);
  const xv = cosd(E) - o.e;
  const yv = Math.sqrt(1 - o.e * o.e) * sind(E);
  const v = atan2d(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const lon = rev(v + o.w);
  return { lon, xs: r * cosd(lon), ys: r * sind(lon), Ls: rev(o.M + o.w), Ms: rev(o.M) };
}

function longitudeOf(key: PlanetKey, d: number, xs: number, ys: number): number {
  if (key === "sun") return sunPosition(d).lon;
  if (key === "pluto") return plutoLongitude(d, xs, ys);

  const o = elements(key, d);
  const E = eccentricAnomaly(o.M, o.e);
  const xv = o.a * (cosd(E) - o.e);
  const yv = o.a * Math.sqrt(1 - o.e * o.e) * sind(E);
  const v = atan2d(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  const xh = r * (cosd(o.N) * cosd(v + o.w) - sind(o.N) * sind(v + o.w) * cosd(o.i));
  const yh = r * (sind(o.N) * cosd(v + o.w) + cosd(o.N) * sind(v + o.w) * cosd(o.i));

  if (key === "moon") {
    // Meeus Chapter 47 via astronomia (~0.01° accuracy) replaces the
    // Schlyter low-precision formula which drifts ~10° for dates 25+ years
    // from J2000 epoch. `d` uses the Schlyter epoch, so convert it with the
    // Schlyter epoch's Julian day rather than the J2000.0 offset.
    // `astronomia` returns a Coord instance. Its longitude is exposed through
    // the `lon` getter; destructuring it loses the getter-backed value.
    const moon = moonPositionMeeus(2451543.5 + d);
    return rev(moon.lon / RAD);
  }

  return rev(atan2d(yh + ys, xh + xs));
}

/**
 * Pluto geocentric ecliptic longitude (degrees, tropical).
 *
 * Uses the Meeus Chapter 37 / Table 37.a algorithm from the `astronomia`
 * package (~0.01° accuracy), replacing the Schlyter approximation which
 * accumulated up to ~1.5° error near the ASC crossing — enough to mis-assign
 * Pluto's house. xs/ys are the Sun's geocentric rectangular components
 * (from sunPosition) used to convert heliocentric → geocentric.
 */
function plutoLongitude(d: number, xs: number, ys: number): number {
  // `d` is measured from 2000 Jan 0.0 (JD 2451543.5), not J2000.0.
  const jde = 2451543.5 + d;
  const { lon, lat, range } = plutoHeliocentric(jde);

  // Convert heliocentric ecliptic → rectangular (J2000 frame, ~0.056° vs
  // ecliptic-of-date for dates within 5 yrs of J2000; negligible vs the fix).
  const cosLat = Math.cos(lat);
  const xp = range * cosLat * Math.cos(lon);
  const yp = range * cosLat * Math.sin(lon);

  // Geocentric = heliocentric Pluto + Sun's geocentric vector.
  // xs = r_earth * cos(sun_lon), ys = r_earth * sin(sun_lon), which equals
  // the Earth→Sun vector, i.e. the negation of Earth's heliocentric position.
  const xg = xp + xs;
  const yg = yp + ys;

  return rev(Math.atan2(yg, xg) / RAD);
}

function dayNumber(y: number, m: number, day: number, utHours: number): number {
  let d =
    367 * y -
    Math.floor((7 * (y + Math.floor((m + 9) / 12))) / 4) +
    Math.floor((275 * m) / 9) +
    day -
    730530;
  d += utHours / 24;
  return d;
}

const ALL_KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

const ADDITIONAL_KEYS: AdditionalPointKey[] = [
  "chiron", "lilith", "northNode", "southNode",
];

function anglePosition(key: AdditionalPointKey, longitude: number): ChartPointPosition {
  const lon = rev(longitude);
  const signIndex = Math.floor(lon / 30);
  const within = lon - signIndex * 30;
  return {
    key,
    longitude: lon,
    signIndex,
    degree: Math.floor(within),
    minute: Math.floor((within - Math.floor(within)) * 60),
  };
}

/**
 * Stable mean points used by the chart surface. The lunar nodes and Lilith are
 * intentionally mean points so the daily and natal views do not jump between
 * definitions. Chiron uses a slow mean longitude approximation; it is a
 * sign-level reference, not a substitute for a high-precision ephemeris.
 */
function additionalLongitudes(d: number): Record<AdditionalPointKey, number> {
  const northNode = rev(125.044555 - 0.05295377 * d);
  const lilith = rev(83.353246 + 0.11140353 * d);
  const chiron = rev(209.5 + 0.0197 * d);
  return {
    chiron,
    lilith,
    northNode,
    southNode: rev(northNode + 180),
  };
}

export function computeChart(input: BirthInput): NatalChart {
  const [y, m, day] = input.date.split("-").map(Number);
  const [hh, mm] = input.time.split(":").map(Number);
  const offset = input.tzName
    ? getTimezoneOffset(input.tzName, input.date, input.time)
    : input.tz;
  const utHours = hh + mm / 60 - offset;
  const d = dayNumber(y, m, day, utHours);

  const sun = sunPosition(d);
  const eps = 23.4393 - 3.563e-7 * d;

  // Local sidereal time -> RAMC (right ascension of the meridian)
  const gmst0deg = rev(sun.Ls + 180);
  const lstHours = gmst0deg / 15 + utHours + input.lon / 15;
  const ramc = rev(lstHours * 15);

  const zodiac = input.zodiac === "sidereal" ? "sidereal" : "tropical";
  const ayan = zodiac === "sidereal" ? lahiriAyanamsa(d) : 0;

  // Tropical ascendant (matches Swiss Ephemeris convention)
  const ascLonTrop = rev(
    atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + tand(input.lat) * sind(eps)))
  );

  // Placidus cusps (tropical) — fall back to whole-sign inside the polar circle
  // where Placidus is undefined.
  let cuspsTrop: number[];
  if (Math.abs(input.lat) <= 66) {
    cuspsTrop = placidusCusps(ramc, input.lat, eps);
  } else {
    const base = Math.floor(ascLonTrop / 30) * 30;
    cuspsTrop = Array.from({ length: 12 }, (_, i) => rev(base + i * 30));
  }

  const positions = {} as Record<PlanetKey, PlanetPosition>;
  for (const key of ALL_KEYS) {
    const lonTrop = longitudeOf(key, d, sun.xs, sun.ys);
    let retrograde = false;
    if (key !== "sun" && key !== "moon") {
      const prevSun = sunPosition(d - 1);
      const prev = longitudeOf(key, d - 1, prevSun.xs, prevSun.ys);
      const delta = ((lonTrop - prev + 540) % 360) - 180;
      retrograde = delta < 0;
    }
    // House is a rigid property of the sky — assign in tropical frame so the
    // number is identical in tropical and sidereal.
    const house = houseOf(lonTrop, cuspsTrop);
    const lonDisp = rev(lonTrop - ayan);
    const signIndex = Math.floor(lonDisp / 30);
    const within = lonDisp - signIndex * 30;
    positions[key] = {
      key,
      longitude: lonDisp,
      signIndex,
      degree: Math.floor(within),
      minute: Math.floor((within - Math.floor(within)) * 60),
      house,
      retrograde,
    };
  }

  const ascLon = rev(ascLonTrop - ayan);
  const ascSignIndex = Math.floor(ascLon / 30);
  const ascWithin = ascLon - ascSignIndex * 30;
  const ascendant: Ascendant = {
    longitude: ascLon,
    signIndex: ascSignIndex,
    degree: Math.floor(ascWithin),
    minute: Math.floor((ascWithin - Math.floor(ascWithin)) * 60),
  };

  // The meridian is the ecliptic point whose right ascension equals RAMC.
  // Deriving the four angles from one frame keeps them coherent in both
  // tropical and sidereal displays.
  const mcLonTrop = rev(atan2d(sind(ramc), cosd(ramc) * cosd(eps)));
  const mcLon = rev(mcLonTrop - ayan);
  const midheaven: Ascendant = {
    longitude: mcLon,
    signIndex: Math.floor(mcLon / 30),
    degree: Math.floor(mcLon % 30),
    minute: Math.floor(((mcLon % 30) % 1) * 60),
  };
  const descendant: Ascendant = {
    longitude: rev(ascLon + 180),
    signIndex: Math.floor(rev(ascLon + 180) / 30),
    degree: Math.floor(rev(ascLon + 180) % 30),
    minute: Math.floor((rev(ascLon + 180) % 1) * 60),
  };
  const icLon = rev(mcLon + 180);
  const imumCoeli: Ascendant = {
    longitude: icLon,
    signIndex: Math.floor(icLon / 30),
    degree: Math.floor(icLon % 30),
    minute: Math.floor((icLon % 1) * 60),
  };
  const angles: ChartAngles = { ascendant, midheaven, descendant, imumCoeli };
  const additionalTropical = additionalLongitudes(d);
  const additionalPoints = Object.fromEntries(
    ADDITIONAL_KEYS.map((key) => [key, anglePosition(key, additionalTropical[key] - ayan)]),
  ) as Record<AdditionalPointKey, ChartPointPosition>;

  const cusps = cuspsTrop.map((c) => rev(c - ayan));

  return {
    input,
    positions,
    ascendant,
    angles,
    additionalPoints,
    aspects: computeAspects(positions),
    cusps,
    zodiac,
    ayanamsa: ayan,
  };
}

export function formatDegree(pos: { degree: number; minute: number }): string {
  const mm = String(pos.minute).padStart(2, "0");
  return `${pos.degree}°${mm}'`;
}

export { SIGNS };
