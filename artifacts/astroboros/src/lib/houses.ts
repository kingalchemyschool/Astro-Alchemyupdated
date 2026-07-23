// House-system mathematics.
//
// Placidus house cusps (the system professional software defaults to) computed
// via the semi-arc iteration, validated against Swiss Ephemeris to ~1.5 arc-min.
// Reference: cosinekitty/astronomy discussion #391.

const RAD = Math.PI / 180;
const rev = (x: number) => ((x % 360) + 360) % 360;

function solvePlacidusCusp(
  tanPhi: number,
  ramcRad: number,
  cosOb: number,
  sinOb: number,
  cuspRatio: number,
  nocturnal: boolean
): number {
  const ref = nocturnal ? ramcRad + Math.PI : ramcRad;
  let y = Math.sin(ref);
  let x = Math.cos(ref) * cosOb;
  for (let i = 0; i < 10; i++) {
    const dec = (y / Math.hypot(y, x)) * sinOb; // declination of current guess
    let v = (dec / Math.sqrt(1 - dec * dec)) * tanPhi; // ascensional-diff sin
    v = Math.max(-1, Math.min(1, v));
    const ad = Math.asin(v);
    const requiredRa = ref + (ad + Math.PI / (nocturnal ? -2 : 2)) * cuspRatio;
    y = Math.sin(requiredRa);
    x = Math.cos(requiredRa) * cosOb;
  }
  return rev(Math.atan2(y, x) / RAD);
}

// Returns 12 cusp longitudes (deg). House i begins at cusps[i-1].
export function placidusCusps(
  ramcDeg: number,
  latDeg: number,
  epsDeg: number
): number[] {
  const cosOb = Math.cos(epsDeg * RAD);
  const sinOb = Math.sin(epsDeg * RAD);
  const tanPhi = Math.tan(latDeg * RAD);
  const ramc = ramcDeg * RAD;

  const c11 = solvePlacidusCusp(tanPhi, ramc, cosOb, sinOb, 1 / 3, false);
  const c12 = solvePlacidusCusp(tanPhi, ramc, cosOb, sinOb, 2 / 3, false);
  const c2 = solvePlacidusCusp(tanPhi, ramc, cosOb, sinOb, 2 / 3, true);
  const c3 = solvePlacidusCusp(tanPhi, ramc, cosOb, sinOb, 1 / 3, true);

  const sinRamc = Math.sin(ramc);
  const cosRamc = Math.cos(ramc);
  const mc = rev(Math.atan2(sinRamc, cosRamc * cosOb) / RAD);
  const dsc = rev(Math.atan2(-cosRamc, sinRamc * cosOb + tanPhi * sinOb) / RAD);
  const asc = rev(dsc + 180);

  const cusps = new Array<number>(12);
  cusps[0] = asc; // 1
  cusps[1] = c2; // 2
  cusps[2] = c3; // 3
  cusps[3] = rev(mc + 180); // 4 (IC)
  cusps[4] = rev(c11 + 180); // 5
  cusps[5] = rev(c12 + 180); // 6
  cusps[6] = dsc; // 7
  cusps[7] = rev(c2 + 180); // 8
  cusps[8] = rev(c3 + 180); // 9
  cusps[9] = mc; // 10 (MC)
  cusps[10] = c11; // 11
  cusps[11] = c12; // 12
  return cusps;
}

function inArc(x: number, start: number, end: number): boolean {
  const s = rev(start);
  let e = rev(end);
  let xx = rev(x);
  if (e <= s) e += 360;
  if (xx < s) xx += 360;
  return xx >= s && xx < e;
}

// Which house (1-12) a longitude falls in, given the 12 cusp longitudes.
export function houseOf(lon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    if (inArc(lon, cusps[i], cusps[(i + 1) % 12])) return i + 1;
  }
  return 1;
}

// Lahiri (Chitrapaksha) ayanamsa for sidereal charts.
// d = days since 2000 Jan 0.0 (Schlyter epoch). ~23.85 deg at epoch,
// precessing ~50.29"/yr.
export function lahiriAyanamsa(d: number): number {
  return 23.8522 + 3.8222e-5 * d;
}
