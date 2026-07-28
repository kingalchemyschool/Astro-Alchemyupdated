declare module "astronomia/pluto" {
  /** Returns heliocentric J2000 ecliptic coordinates of Pluto. */
  export function heliocentric(jde: number): {
    /** Heliocentric ecliptic longitude (radians) */
    lon: number;
    /** Heliocentric ecliptic latitude (radians) */
    lat: number;
    /** Distance from Sun (AU) */
    range: number;
  };
}

declare module "astronomia/moonposition" {
  export interface MoonCoord {
    lon: number;
    lat: number;
    range: number;
  }

  /** Returns the geocentric Moon position for a Julian ephemeris day. */
  export function position(jde: number): MoonCoord;
}
