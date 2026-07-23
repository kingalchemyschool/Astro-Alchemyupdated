import type { PlanetKey } from "@/types/astro";

export interface SignInfo {
  name: string;
  glyph: string;
  element: "fire" | "earth" | "air" | "water";
  modality: "cardinal" | "fixed" | "mutable";
}

export const SIGNS: SignInfo[] = [
  { name: "Aries", glyph: "♈", element: "fire", modality: "cardinal" },
  { name: "Taurus", glyph: "♉", element: "earth", modality: "fixed" },
  { name: "Gemini", glyph: "♊", element: "air", modality: "mutable" },
  { name: "Cancer", glyph: "♋", element: "water", modality: "cardinal" },
  { name: "Leo", glyph: "♌", element: "fire", modality: "fixed" },
  { name: "Virgo", glyph: "♍", element: "earth", modality: "mutable" },
  { name: "Libra", glyph: "♎", element: "air", modality: "cardinal" },
  { name: "Scorpio", glyph: "♏", element: "water", modality: "fixed" },
  { name: "Sagittarius", glyph: "♐", element: "fire", modality: "mutable" },
  { name: "Capricorn", glyph: "♑", element: "earth", modality: "cardinal" },
  { name: "Aquarius", glyph: "♒", element: "air", modality: "fixed" },
  { name: "Pisces", glyph: "♓", element: "water", modality: "mutable" },
];

export const ORDINALS = [
  "1st", "2nd", "3rd", "4th", "5th", "6th",
  "7th", "8th", "9th", "10th", "11th", "12th",
];

export interface PlanetInfo {
  name: string;
  glyph: string;
  fn: string; // creation function
  point?: number; // enneagram point (inner planets only)
  octave?: PlanetKey; // outer octave partner
}

export const PLANET_META: Record<PlanetKey, PlanetInfo> = {
  sun: { name: "Sun", glyph: "☉", fn: "Essence", point: 0 },
  moon: { name: "Moon", glyph: "☽", fn: "Perception", point: 1 },
  mars: { name: "Mars", glyph: "♂", fn: "Force", point: 2, octave: "pluto" },
  mercury: { name: "Mercury", glyph: "☿", fn: "Genius", point: 4, octave: "uranus" },
  jupiter: { name: "Jupiter", glyph: "♃", fn: "Expansion", point: 5 },
  venus: { name: "Venus", glyph: "♀", fn: "Value", point: 7, octave: "neptune" },
  saturn: { name: "Saturn", glyph: "♄", fn: "Foundation", point: 8 },
  pluto: { name: "Pluto", glyph: "♇", fn: "Regeneration" },
  uranus: { name: "Uranus", glyph: "♅", fn: "Disruption" },
  neptune: { name: "Neptune", glyph: "♆", fn: "Dissolution" },
};

// Order used for the summary box display
export const SUMMARY_ORDER: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

export interface CityInfo {
  name: string;
  lat: number;
  lon: number; // east positive
  tz: number; // standard UTC offset (fallback)
  tzName: string; // IANA id — drives DST-accurate offset per birth date
}

export const CITIES: CityInfo[] = [
  // North America
  { name: "New York, USA", lat: 40.7128, lon: -74.006, tz: -5, tzName: "America/New_York" },
  { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437, tz: -8, tzName: "America/Los_Angeles" },
  { name: "Chicago, USA", lat: 41.8781, lon: -87.6298, tz: -6, tzName: "America/Chicago" },
  { name: "Houston, USA", lat: 29.7604, lon: -95.3698, tz: -6, tzName: "America/Chicago" },
  { name: "Phoenix, USA", lat: 33.4484, lon: -112.074, tz: -7, tzName: "America/Phoenix" },
  { name: "Denver, USA", lat: 39.7392, lon: -104.9903, tz: -7, tzName: "America/Denver" },
  { name: "Seattle, USA", lat: 47.6062, lon: -122.3321, tz: -8, tzName: "America/Los_Angeles" },
  { name: "San Francisco, USA", lat: 37.7749, lon: -122.4194, tz: -8, tzName: "America/Los_Angeles" },
  { name: "Miami, USA", lat: 25.7617, lon: -80.1918, tz: -5, tzName: "America/New_York" },
  { name: "Boston, USA", lat: 42.3601, lon: -71.0589, tz: -5, tzName: "America/New_York" },
  { name: "Atlanta, USA", lat: 33.749, lon: -84.388, tz: -5, tzName: "America/New_York" },
  { name: "Honolulu, USA", lat: 21.3069, lon: -157.8583, tz: -10, tzName: "Pacific/Honolulu" },
  { name: "Anchorage, USA", lat: 61.2181, lon: -149.9003, tz: -9, tzName: "America/Anchorage" },
  { name: "Toronto, Canada", lat: 43.6532, lon: -79.3832, tz: -5, tzName: "America/Toronto" },
  { name: "Montreal, Canada", lat: 45.5017, lon: -73.5673, tz: -5, tzName: "America/Toronto" },
  { name: "Vancouver, Canada", lat: 49.2827, lon: -123.1207, tz: -8, tzName: "America/Vancouver" },
  { name: "Mexico City, Mexico", lat: 19.4326, lon: -99.1332, tz: -6, tzName: "America/Mexico_City" },
  { name: "Guadalajara, Mexico", lat: 20.6597, lon: -103.3496, tz: -6, tzName: "America/Mexico_City" },

  // Central & South America
  { name: "Guatemala City, Guatemala", lat: 14.6349, lon: -90.5069, tz: -6, tzName: "America/Guatemala" },
  { name: "Panama City, Panama", lat: 8.9824, lon: -79.5199, tz: -5, tzName: "America/Panama" },
  { name: "Bogotá, Colombia", lat: 4.711, lon: -74.0721, tz: -5, tzName: "America/Bogota" },
  { name: "Lima, Peru", lat: -12.0464, lon: -77.0428, tz: -5, tzName: "America/Lima" },
  { name: "Quito, Ecuador", lat: -0.1807, lon: -78.4678, tz: -5, tzName: "America/Guayaquil" },
  { name: "Caracas, Venezuela", lat: 10.4806, lon: -66.9036, tz: -4, tzName: "America/Caracas" },
  { name: "Santiago, Chile", lat: -33.4489, lon: -70.6693, tz: -4, tzName: "America/Santiago" },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lon: -58.3816, tz: -3, tzName: "America/Argentina/Buenos_Aires" },
  { name: "Montevideo, Uruguay", lat: -34.9011, lon: -56.1645, tz: -3, tzName: "America/Montevideo" },
  { name: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333, tz: -3, tzName: "America/Sao_Paulo" },
  { name: "Rio de Janeiro, Brazil", lat: -22.9068, lon: -43.1729, tz: -3, tzName: "America/Sao_Paulo" },

  // Europe
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: 0, tzName: "Europe/London" },
  { name: "Manchester, UK", lat: 53.4808, lon: -2.2426, tz: 0, tzName: "Europe/London" },
  { name: "Dublin, Ireland", lat: 53.3498, lon: -6.2603, tz: 0, tzName: "Europe/Dublin" },
  { name: "Lisbon, Portugal", lat: 38.7223, lon: -9.1393, tz: 0, tzName: "Europe/Lisbon" },
  { name: "Madrid, Spain", lat: 40.4168, lon: -3.7038, tz: 1, tzName: "Europe/Madrid" },
  { name: "Barcelona, Spain", lat: 41.3874, lon: 2.1686, tz: 1, tzName: "Europe/Madrid" },
  { name: "Paris, France", lat: 48.8566, lon: 2.3522, tz: 1, tzName: "Europe/Paris" },
  { name: "Amsterdam, Netherlands", lat: 52.3676, lon: 4.9041, tz: 1, tzName: "Europe/Amsterdam" },
  { name: "Brussels, Belgium", lat: 50.8503, lon: 4.3517, tz: 1, tzName: "Europe/Brussels" },
  { name: "Berlin, Germany", lat: 52.52, lon: 13.405, tz: 1, tzName: "Europe/Berlin" },
  { name: "Munich, Germany", lat: 48.1351, lon: 11.582, tz: 1, tzName: "Europe/Berlin" },
  { name: "Zurich, Switzerland", lat: 47.3769, lon: 8.5417, tz: 1, tzName: "Europe/Zurich" },
  { name: "Milan, Italy", lat: 45.4642, lon: 9.19, tz: 1, tzName: "Europe/Rome" },
  { name: "Rome, Italy", lat: 41.9028, lon: 12.4964, tz: 1, tzName: "Europe/Rome" },
  { name: "Vienna, Austria", lat: 48.2082, lon: 16.3738, tz: 1, tzName: "Europe/Vienna" },
  { name: "Prague, Czechia", lat: 50.0755, lon: 14.4378, tz: 1, tzName: "Europe/Prague" },
  { name: "Warsaw, Poland", lat: 52.2297, lon: 21.0122, tz: 1, tzName: "Europe/Warsaw" },
  { name: "Copenhagen, Denmark", lat: 55.6761, lon: 12.5683, tz: 1, tzName: "Europe/Copenhagen" },
  { name: "Oslo, Norway", lat: 59.9139, lon: 10.7522, tz: 1, tzName: "Europe/Oslo" },
  { name: "Stockholm, Sweden", lat: 59.3293, lon: 18.0686, tz: 1, tzName: "Europe/Stockholm" },
  { name: "Helsinki, Finland", lat: 60.1699, lon: 24.9384, tz: 2, tzName: "Europe/Helsinki" },
  { name: "Athens, Greece", lat: 37.9838, lon: 23.7275, tz: 2, tzName: "Europe/Athens" },
  { name: "Kyiv, Ukraine", lat: 50.4501, lon: 30.5234, tz: 2, tzName: "Europe/Kyiv" },
  { name: "Istanbul, Turkey", lat: 41.0082, lon: 28.9784, tz: 3, tzName: "Europe/Istanbul" },
  { name: "Moscow, Russia", lat: 55.7558, lon: 37.6173, tz: 3, tzName: "Europe/Moscow" },

  // Africa & Middle East
  { name: "Casablanca, Morocco", lat: 33.5731, lon: -7.5898, tz: 1, tzName: "Africa/Casablanca" },
  { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792, tz: 1, tzName: "Africa/Lagos" },
  { name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357, tz: 2, tzName: "Africa/Cairo" },
  { name: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219, tz: 3, tzName: "Africa/Nairobi" },
  { name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241, tz: 2, tzName: "Africa/Johannesburg" },
  { name: "Johannesburg, South Africa", lat: -26.2041, lon: 28.0473, tz: 2, tzName: "Africa/Johannesburg" },
  { name: "Jerusalem, Israel", lat: 31.7683, lon: 35.2137, tz: 2, tzName: "Asia/Jerusalem" },
  { name: "Tel Aviv, Israel", lat: 32.0853, lon: 34.7818, tz: 2, tzName: "Asia/Jerusalem" },
  { name: "Riyadh, Saudi Arabia", lat: 24.7136, lon: 46.6753, tz: 3, tzName: "Asia/Riyadh" },
  { name: "Tehran, Iran", lat: 35.6892, lon: 51.389, tz: 3.5, tzName: "Asia/Tehran" },
  { name: "Dubai, UAE", lat: 25.2048, lon: 55.2708, tz: 4, tzName: "Asia/Dubai" },

  // Asia
  { name: "Karachi, Pakistan", lat: 24.8607, lon: 67.0011, tz: 5, tzName: "Asia/Karachi" },
  { name: "Mumbai, India", lat: 19.076, lon: 72.8777, tz: 5.5, tzName: "Asia/Kolkata" },
  { name: "New Delhi, India", lat: 28.6139, lon: 77.209, tz: 5.5, tzName: "Asia/Kolkata" },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946, tz: 5.5, tzName: "Asia/Kolkata" },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639, tz: 5.5, tzName: "Asia/Kolkata" },
  { name: "Colombo, Sri Lanka", lat: 6.9271, lon: 79.8612, tz: 5.5, tzName: "Asia/Colombo" },
  { name: "Kathmandu, Nepal", lat: 27.7172, lon: 85.324, tz: 5.75, tzName: "Asia/Kathmandu" },
  { name: "Dhaka, Bangladesh", lat: 23.8103, lon: 90.4125, tz: 6, tzName: "Asia/Dhaka" },
  { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018, tz: 7, tzName: "Asia/Bangkok" },
  { name: "Ho Chi Minh City, Vietnam", lat: 10.8231, lon: 106.6297, tz: 7, tzName: "Asia/Ho_Chi_Minh" },
  { name: "Jakarta, Indonesia", lat: -6.2088, lon: 106.8456, tz: 7, tzName: "Asia/Jakarta" },
  { name: "Kuala Lumpur, Malaysia", lat: 3.139, lon: 101.6869, tz: 8, tzName: "Asia/Kuala_Lumpur" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8, tzName: "Asia/Singapore" },
  { name: "Manila, Philippines", lat: 14.5995, lon: 120.9842, tz: 8, tzName: "Asia/Manila" },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694, tz: 8, tzName: "Asia/Hong_Kong" },
  { name: "Taipei, Taiwan", lat: 25.033, lon: 121.5654, tz: 8, tzName: "Asia/Taipei" },
  { name: "Beijing, China", lat: 39.9042, lon: 116.4074, tz: 8, tzName: "Asia/Shanghai" },
  { name: "Shanghai, China", lat: 31.2304, lon: 121.4737, tz: 8, tzName: "Asia/Shanghai" },
  { name: "Seoul, South Korea", lat: 37.5665, lon: 126.978, tz: 9, tzName: "Asia/Seoul" },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, tz: 9, tzName: "Asia/Tokyo" },
  { name: "Osaka, Japan", lat: 34.6937, lon: 135.5023, tz: 9, tzName: "Asia/Tokyo" },

  // Oceania
  { name: "Perth, Australia", lat: -31.9523, lon: 115.8613, tz: 8, tzName: "Australia/Perth" },
  { name: "Adelaide, Australia", lat: -34.9285, lon: 138.6007, tz: 9.5, tzName: "Australia/Adelaide" },
  { name: "Brisbane, Australia", lat: -27.4698, lon: 153.0251, tz: 10, tzName: "Australia/Brisbane" },
  { name: "Melbourne, Australia", lat: -37.8136, lon: 144.9631, tz: 10, tzName: "Australia/Melbourne" },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, tz: 10, tzName: "Australia/Sydney" },
  { name: "Auckland, New Zealand", lat: -36.8485, lon: 174.7633, tz: 12, tzName: "Pacific/Auckland" },
  { name: "Wellington, New Zealand", lat: -41.2865, lon: 174.7762, tz: 12, tzName: "Pacific/Auckland" },
  { name: "Suva, Fiji", lat: -18.1416, lon: 178.4419, tz: 12, tzName: "Pacific/Fiji" },
];

export const TZ_OPTIONS = [
  -12, -11, -10, -9, -8, -7, -6, -5, -4, -3.5, -3, -2, -1,
  0, 1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 8.75,
  9, 9.5, 10, 10.5, 11, 12, 12.75, 13,
];

// Short quality phrase per sign (indexed by signIndex) — makes readings
// specific rather than generic.
export const SIGN_QUALITY: string[] = [
  "direct, pioneering, and driven to begin", // Aries
  "grounded, deliberate, and built to endure", // Taurus
  "quick, curious, and endlessly associative", // Gemini
  "protective, tidal, and attuned to what needs care", // Cancer
  "radiant, expressive, and organized around a creative center", // Leo
  "precise, analytical, and devoted to refinement", // Virgo
  "relational, balancing, and tuned to proportion", // Libra
  "intense, penetrating, and unwilling to stay on the surface", // Scorpio
  "expansive, exploratory, and aimed at meaning", // Sagittarius
  "strategic, disciplined, and structured for the long climb", // Capricorn
  "inventive, systemic, and oriented toward what is next", // Aquarius
  "fluid, imaginative, and permeable to the unseen", // Pisces
];

// House domain ("the arena of ...") indexed 0-11 for houses 1-12.
export const HOUSE_DOMAIN: string[] = [
  "the arena of identity, presence, and self-initiation",
  "the arena of resources, worth, and material value",
  "the arena of language, learning, and local exchange",
  "the arena of roots, home, and inner foundation",
  "the arena of play, performance, and creative output",
  "the arena of craft, systems, and refinement",
  "the arena of partnership and reflection",
  "the arena of shared power and transformation",
  "the arena of vision, meaning, and expansion",
  "the arena of public work, status, and legacy",
  "the arena of networks, alliances, and the future",
  "the arena of the subconscious, source, and retreat",
];

// How energy "finds expression through ..." in each house.
export const HOUSE_THROUGH: string[] = [
  "self-initiation, presence, and the way you enter a room",
  "resources, worth, and what you choose to build value around",
  "ideas, communication, curiosity, and shared understanding",
  "roots, home, memory, and the private foundation beneath the work",
  "play, performance, and authored creative output",
  "craft, routine, health, and the refinement of process",
  "partnership, negotiation, and the mirror of other people",
  "shared power, intimacy, and cycles of ending and renewal",
  "belief, travel, teaching, and the search for larger meaning",
  "public work, status, ambition, and visible legacy",
  "networks, alliances, and future-oriented vision",
  "solitude, the unconscious, and the dissolving of boundaries",
];

// What the function is "most productive when the work involves ...".
export const HOUSE_WORK: string[] = [
  "launching visible, self-authored beginnings",
  "building steady value and naming what you are worth",
  "translating raw signal into transmissible ideas",
  "securing the private base the work grows from",
  "putting authored expression into the open",
  "tuning process until the work runs clean",
  "shaping the work through the mirror of others",
  "regenerating through depth, merger, and crisis",
  "extending the work toward larger significance",
  "delivering the work into the world as reputation",
  "distributing the work across community and time",
  "drawing material from the hidden and unformed",
];

// Planet × house matrix: how each function operates in each house's territory.
// Indexed [houseIndex 0–11]. Seven core planets only (octaves handled separately).
export const PLANET_HOUSE: Partial<Record<PlanetKey, string[]>> = {
  sun: [
    // H1 — identity
    "In the 1st house, Essence expresses directly through presence — your creative source and your lived identity are the same thing. The work others encounter is the person they encounter, which means your most fundamental creative quality is also your most immediate and personal.",
    // H2 — resources
    "In the 2nd house, Essence grounds itself in material creation and tangible form. Your creative source deepens through building, making, and establishing — what you produce with sustained effort carries your most fundamental signature.",
    // H3 — communication
    "In the 3rd house, Essence moves through language, ideas, and exchange. Teaching, writing, and building understanding between people is not incidental to your creative source — it is the primary territory where your fundamental quality lives and generates.",
    // H4 — roots
    "In the 4th house, Essence is rooted in private interior truth. Your most authentic creative work emerges from psychological depth and honesty — the more grounded the inner foundation, the more clearly your fundamental quality can reach outward.",
    // H5 — creative output
    "In the 5th house, Essence is at home in pure creative expression and original authorship. You are built to create, perform, and be seen in your originality — this is the natural domain of the creator, and Essence here operates without apology.",
    // H6 — craft
    "In the 6th house, Essence finds itself in daily craft and the refinement of process. Your fundamental creative quality is inseparable from your discipline — you know your own creative source most clearly in the middle of the work, making it more precise than it was.",
    // H7 — partnership
    "In the 7th house, Essence activates through dialogue and collaboration. Partnership is not a constraint on your creative source — it is the primary condition through which your fundamental quality becomes legible, to yourself and to others.",
    // H8 — depth
    "In the 8th house, Essence is activated by depth, transformation, and what is hidden beneath the visible surface. Your most original material lives in territory others avoid — shared power, psychological extremes, and what has been broken and remade.",
    // H9 — meaning
    "In the 9th house, Essence is philosophical and expansive. Your creative source finds its clearest expression when reaching toward a larger framework of meaning — belief, teaching, and questions that do not resolve are where your fundamental quality generates most freely.",
    // H10 — legacy
    "In the 10th house, Essence is public and architecturally ambitious. Your creative source is inseparable from what you are building in the world — you carry a fundamental quality designed to leave a lasting mark, and the work must ultimately stand without you.",
    // H11 — community
    "In the 11th house, Essence is collective and future-oriented. Your creative source is most alive when serving something larger than yourself — a community, a movement, a possibility that does not yet exist but that you are bringing into form.",
    // H12 — source
    "In the 12th house, Essence arrives from solitude, the unconscious, and the territory beyond ordinary perception. Your most authentic material is sourced from depth and retreat — what surfaces in stillness is often more true than what surfaces in noise.",
  ],

  moon: [
    // H1
    "In the 1st house, Perception is immediately visible — your emotional register and instinctive responses are readable from the first moment of contact, making you a natural barometer for the feeling-tone of any room you enter.",
    // H2
    "In the 2nd house, Perception is grounded in material security and embodied comfort. Your instinctive intelligence is most reliable when your physical foundation is stable — financial insecurity disrupts the signal at its root and makes accurate perception difficult.",
    // H3
    "In the 3rd house, Perception moves through language and ideas. You process experience by talking, writing, and articulating — putting something into words is not reflection that follows perception but the act of perception itself, happening in real time.",
    // H4
    "In the 4th house, Perception is rooted in memory, ancestry, and the private interior. Your instinctive intelligence is most acute when it has access to depth — what you perceive most clearly is often what you have always known but never needed to name.",
    // H5
    "In the 5th house, Perception is playful, creative, and emotionally expressive. What moves you aesthetically and emotionally is also what guides your most reliable creative instincts — resonance and delight are not distractions but directional signals.",
    // H6
    "In the 6th house, Perception is attuned to detail, pattern, and the subtle disturbances in systems. You notice what is slightly off before others do — your instinctive intelligence manifests as a finely calibrated sensitivity to process, health, and craft.",
    // H7
    "In the 7th house, Perception is relational and reciprocal. You understand yourself most clearly through others — your emotional intelligence is most acute inside real relationships, where the mirror of another person makes visible what you could not see alone.",
    // H8
    "In the 8th house, Perception is deep and oriented toward what is concealed. You sense things below the surface of what is said or shown — your instinctive awareness is particularly acute around emotional truth, power dynamics, and what is being withheld.",
    // H9
    "In the 9th house, Perception is expansive and philosophical. You process experience by locating it in a larger framework of meaning — what something means matters more to your instinctive intelligence than what, precisely, it is.",
    // H10
    "In the 10th house, Perception is attuned to social dynamics, reputation, and public feeling. You read professional rooms with unusual precision — your instinctive awareness of how authority, achievement, and expectation move through a group is a reliable compass.",
    // H11
    "In the 11th house, Perception is collective and future-oriented. You are instinctively attuned to group feeling and the subtle currents that move through communities — you often sense what a group needs before it can name it.",
    // H12
    "In the 12th house, Perception is oceanic and often pre-verbal. Your instinctive intelligence arrives from below ordinary consciousness — through dreams, intuition, and a permeable boundary between your own experience and the emotional field around you.",
  ],

  mars: [
    // H1
    "In the 1st house, Force is front-facing and immediate — you act without hesitation, lead through presence, and your will is visible from the first moment of contact. The work gets started because you start it, and you do not wait for conditions to be favorable.",
    // H2
    "In the 2nd house, Force is directed toward the acquisition and protection of material value. You apply energy most naturally to building something durable — earning, accumulating, and defending what matters is where your drive is most reliably and productively sustained.",
    // H3
    "In the 3rd house, Force expresses through argument, assertion, and the power of stated ideas. Your will to act moves through language — debate, persuasion, and the ability to cut through ambiguity with clear communication is your most reliable leverage point.",
    // H4
    "In the 4th house, Force is private, defensive, and roots-driven. You mobilize most completely when something personally foundational is at stake — your drive is less about public recognition and more about establishing and protecting what is real and lasting at your core.",
    // H5
    "In the 5th house, Force is creative, expressive, and competitively engaged. You bring full energy to self-expression and authored work — when you are creating, you are not holding back, and the intensity of your drive is most visible in what you actually make.",
    // H6
    "In the 6th house, Force is channeled into daily discipline, craft, and the relentless improvement of process. Your drive expresses most fully in the sustained work itself — consistent effort, precise execution, and the willingness to do difficult things repeatedly over time.",
    // H7
    "In the 7th house, Force engages through relationship and direct opposition. You are energized by a real counterpart — competition, collaboration, and the friction of a genuine equal are not distractions from your drive but the conditions that bring it fully online.",
    // H8
    "In the 8th house, Force is concentrated, investigative, and transformative. You apply will most powerfully in high-stakes territory — shared resources, psychological depth, and the kind of pressure that most people instinctively step back from.",
    // H9
    "In the 9th house, Force is philosophical and expansive. Your drive is activated by the pursuit of meaning — challenging ideas, disorienting travel, and the ambition to build something that reaches well beyond what you already know are its primary activating conditions.",
    // H10
    "In the 10th house, Force is directed toward public achievement and professional mastery. Your ambition is career-defining — you bring your full will to the work of building something that will be recognized, remembered, and respected beyond the moment of creation.",
    // H11
    "In the 11th house, Force moves through collective action and shared goals. Your drive is most reliably energized by purpose that extends beyond personal benefit — you are at your most effective when working toward something a community or movement needs.",
    // H12
    "In the 12th house, Force is internalized, psychological, and operates beneath the visible surface. Your will is most powerful in private — research, solitary creation, and the behind-the-scenes effort that operates without audience and often does more than it appears.",
  ],

  mercury: [
    // H1
    "In the 1st house, Communication shapes your entire presence — your manner of speaking, thinking, and presenting yourself is the most immediate signal others receive. Your mind is visible in everything about how you carry and express yourself.",
    // H2
    "In the 2nd house, Communication is applied to questions of value, resource, and practical worth. Your thinking is most engaged when it is solving tangible problems — analysis, careful evaluation, and the intelligence that turns information into something materially useful.",
    // H3
    "In the 3rd house, Communication is in its native territory — ideas, dialogue, exchange, and learning are not just tools but the substance of your creative life. You think by talking, learn by teaching, and your intelligence is most generative in the act of exchange.",
    // H4
    "In the 4th house, Communication is private, interior, and rooted in personal memory. Your mind works most deeply on what is closest — family, origin, the stories that shaped you, and the intelligence that lives in embodied, personally-held experience.",
    // H5
    "In the 5th house, Communication is creative, playful, and authored. Your thinking is most original when it has an audience — you communicate with a natural sense of performance and personal style, and your voice is distinctive enough to be recognized as yours.",
    // H6
    "In the 6th house, Communication is analytical, precise, and oriented toward improvement. Your mind excels at identifying what is wrong and how to fix it — you think in systems, sequences, and the kind of careful diagnosis that makes process better and more reliable.",
    // H7
    "In the 7th house, Communication is relational and reciprocal. Your thinking is most alive in genuine dialogue — you need a real interlocutor, not a silent page, and the exchange of ideas with an equal is where your intelligence becomes most precise and generative.",
    // H8
    "In the 8th house, Communication is investigative and oriented toward what is not said. Your mind moves toward depth by instinct — research, uncovering hidden structures, and the kind of penetrating analysis that reaches what surface observation consistently misses.",
    // H9
    "In the 9th house, Communication is philosophical, teaching-oriented, and expansive. Your thinking reaches naturally toward the large — principles, frameworks, and the synthesis of disparate ideas into a coherent structure that can hold the weight of complexity.",
    // H10
    "In the 10th house, Communication is professional, strategic, and reputation-building. Your thinking is directed toward impact in the public arena — how you communicate shapes how you are perceived as a professional and what kind of lasting authority you build.",
    // H11
    "In the 11th house, Communication is collaborative, network-oriented, and future-facing. Your mind is engaged by collective intelligence — you think best inside communities of peers, and your ideas are most generative when being tested against many different minds.",
    // H12
    "In the 12th house, Communication is subtle, interior, and often more powerful written than spoken. Your thinking moves in channels below ordinary articulation — what emerges from solitude is frequently more precise and more original than what emerges from conversation.",
  ],

  jupiter: [
    // H1
    "In the 1st house, Expansion operates through presence, confidence, and direct experience. You grow by encountering the world without intermediary — your natural optimism and generosity of spirit draw opportunity toward you and create the conditions for its own expansion.",
    // H2
    "In the 2nd house, Expansion is oriented toward material abundance and the multiplication of genuine value. Your relationship with resources is naturally optimistic — the potential for financial growth and the sense that there is always more available is a stable feature of your creative architecture.",
    // H3
    "In the 3rd house, Expansion moves through ideas, communication, and the proliferation of connections. You grow by learning, exchanging, and making your thinking available to others — the more you communicate, the more returns to expand what is possible.",
    // H4
    "In the 4th house, Expansion is rooted in domestic life, family, and personal foundation. Growth happens through the deepening of private roots — the more secure and generative your interior life, the more the outward work expands naturally from that base.",
    // H5
    "In the 5th house, Expansion is creative, generous, and expressive. Your work grows most naturally through originality, play, and the willingness to risk creative exposure — you have a genuine instinct for enlarging whatever creative territory you are invited to inhabit.",
    // H6
    "In the 6th house, Expansion works through sustained daily effort and the accumulation of craft mastery. Growth is not sudden but cumulative — the discipline of showing up and improving the work is what multiplies the output over time and creates lasting reach.",
    // H7
    "In the 7th house, Expansion happens through relationship and partnership. Your growth is catalyzed by alliances with people who bring different capacities to the work — collaboration is not a tactic but the primary structural condition through which possibility enlarges.",
    // H8
    "In the 8th house, Expansion operates through depth, shared resources, and transformation. Growth comes through the kinds of engagements others find uncomfortable — inheritance, deep investment, and the multiplication of what is produced through genuine shared risk.",
    // H9
    "In the 9th house, Expansion is in its natural home — belief, teaching, philosophy, and the reaching toward larger meaning amplify here without friction. Your work grows most naturally when it is oriented toward a purpose that exceeds personal benefit.",
    // H10
    "In the 10th house, Expansion is career-defining and reputation-driven. Your public work grows significantly over time — the ambition here is real and the capacity to sustain it is present, provided it is directed at something worthy of the scale it will eventually reach.",
    // H11
    "In the 11th house, Expansion moves through networks, community, and collective momentum. Growth is multiplied by the quality and range of genuine alliances — the more you invest in real collaborative relationships, the more possibility compounds and returns.",
    // H12
    "In the 12th house, Expansion is interior, philosophical, and often invisible to public view. Growth happens in solitude and through the development of an inner life rich enough to sustain significant creative output — what grows here is less visible but no less real in its effect.",
  ],

  venus: [
    // H1
    "In the 1st house, Value expresses through personal presentation, style, and the impression you make on first encounter. Your aesthetic sensibility is part of your identity — the way you appear, move, and carry yourself is a considered act, and the work you make reflects it directly.",
    // H2
    "In the 2nd house, Value is in its natural home. Your sense of worth is deeply connected to material reality — what you own, what you earn, and whether your resources reflect your actual values. When financial life matches internal worth, this function operates with full clarity.",
    // H3
    "In the 3rd house, Value is located in ideas, the pleasure of exchange, and the relationships closest to daily life. What you find genuinely beautiful is often what is precisely expressed — clarity, elegance of thought, and the right word in exactly the right place.",
    // H4
    "In the 4th house, Value is rooted in home, family, and the quality of private life. You build worth through the care you bring to your domestic world and intimate relationships — this is not decoration but a primary expression of how you understand what has genuine meaning.",
    // H5
    "In the 5th house, Value is found in creative expression, pleasure, and authentic self-expression. What you find genuinely worth creating is also what genuinely delights you — your aesthetic and your desire are aligned, which is a significant and rare creative advantage.",
    // H6
    "In the 6th house, Value is located in excellence of process and the satisfaction of craft done well. You know something is worth keeping when it works — precision, functionality, and the integrity of well-made things are the primary markers of genuine worth.",
    // H7
    "In the 7th house, Value lives in relationships and the quality of your closest alliances. What you find genuinely beautiful is often found in another person — the intelligence, grace, or integrity of a real counterpart is a primary source of inspiration, meaning, and creative momentum.",
    // H8
    "In the 8th house, Value is located in depth, intensity, and shared transformation. What you find genuinely worth pursuing often involves vulnerability and the kind of shared experience that changes both parties — surface beauty is rarely sufficient to hold your sustained attention.",
    // H9
    "In the 9th house, Value is philosophical and expansive. What you find genuinely worth creating or investing in is connected to meaning, belief, and the possibility of reaching beyond personal experience into something that carries significance for others.",
    // H10
    "In the 10th house, Value is tied to reputation, recognition, and the quality of what you leave behind. You take professional aesthetics seriously — the standard of what you put into the world is a matter of personal integrity, and compromise on quality is felt as genuine loss.",
    // H11
    "In the 11th house, Value is found in community, ideals, and collective aspiration. What you find genuinely worth creating often serves a group or a vision larger than yourself — the most meaningful work, for you, is work that holds meaning for others as well.",
    // H12
    "In the 12th house, Value is subtle, interior, and often invisible to public recognition. What you find genuinely worth pursuing is connected to the transcendent and the dimensions of experience that exceed ordinary articulation — beauty, for you, is often closest to the sacred.",
  ],

  saturn: [
    // H1
    "In the 1st house, Foundation is built through the patient construction of a reliable, distinctive identity. The discipline here is personal — learning to occupy your own presence with authority, and building the kind of consistent self-presentation that earns trust over time.",
    // H2
    "In the 2nd house, Foundation is built through sustained financial discipline and the careful management of resources. Security comes through earned rather than assumed stability — what you build materially is built slowly, and proves durable precisely because you have not cut corners.",
    // H3
    "In the 3rd house, Foundation is built through the mastery of communication and the discipline of precise thinking. Your structural authority is earned through rigorous study, careful expression, and the kind of intellectual depth that holds up under sustained scrutiny.",
    // H4
    "In the 4th house, Foundation is built in the private sphere — the discipline here is deeply personal and often demanding, centering on family, home, and the psychological structure that supports everything built above it. What is established here determines the load-bearing capacity of the rest.",
    // H5
    "In the 5th house, Foundation is built through creative discipline and the long practice of developing a distinctive voice. The work is real, but what makes it endure is the seriousness about the craft behind it — the willingness to practice the thing in private so the public output holds.",
    // H6
    "In the 6th house, Foundation is built through consistent daily practice and the mastery of craft — one of Saturn's most congenial placements. The discipline of showing up and doing the work with precision is exactly what this house demands, and the authority built here is particularly durable.",
    // H7
    "In the 7th house, Foundation is built through serious, tested relationships. The discipline is relational — learning to hold commitments, navigate partnership with integrity, and build the kind of alliances that do not collapse when reality becomes more difficult than anticipated.",
    // H8
    "In the 8th house, Foundation is built through confrontation with depth, shared power, and psychological complexity. The structure you develop is earned through exactly the encounters most people avoid — crisis, transformation, and what cannot be managed from the surface.",
    // H9
    "In the 9th house, Foundation is built through sustained study, developed belief, and the patient construction of a genuine philosophical framework. You build authority in the domain of ideas and meaning — the discipline of actually mastering what you believe, rather than holding it loosely.",
    // H10
    "In the 10th house, Foundation is built in public — this is Saturn's most natural terrain. The discipline of building a career, establishing a reputation, and sustaining professional integrity over decades produces exactly the kind of lasting, recognized structure that Saturn demands and rewards.",
    // H11
    "In the 11th house, Foundation is built through tested alliances and the slow development of a genuine community. The discipline is collective — learning which relationships have structural integrity and which are circumstantial, and investing consistently in the ones that compound.",
    // H12
    "In the 12th house, Foundation is built in solitude and through the discipline of a rich interior life. The structure you develop is invisible to others but essential — the psychological and spiritual framework that allows you to sustain significant creative work without requiring constant external validation.",
  ],
};

// Free planet-function explainers for the interactive enneagram.
export const PLANET_ABOUT: Record<PlanetKey, string> = {
  sun: "Essence — the originating creative principle of the entire system. The Sun is the source point from which the whole creation process draws coherence and direction. Where the Moon perceives, Mercury translates, and Mars initiates, the Sun simply is — the fundamental quality of the creator from which everything else naturally extends. It describes what is inherently trying to express itself through you: the creative signature that persists regardless of circumstance or context. Its sign reveals how your Essence naturally colours, shapes, and gives character to everything else in the chart. When the Sun is operating with clarity, the entire system finds its purpose.",
  moon: "Perception — how you instinctively receive and process reality. The Moon gathers sensation, memory, emotional tone, and body-level awareness, turning raw experience into felt understanding before the mind can name it. It governs what you notice first, what you respond to without thinking, and how you organize experience into meaning. Your Moon's sign shapes the filter through which all incoming information passes. Where the Sun generates direction, the Moon determines what you are actually picking up from the world around you.",
  mars: "Force — the function that converts intention into physical movement. Mars is the first push: the point where internal awareness crosses into action and meets resistance. It determines how you apply effort, how you handle obstacles, and the natural rhythm of your energy. Mars in your chart shows where you move instinctively and how you operate under pressure. When Mars is working well, you are decisive and effective. When it is misdirected, force scatters or stalls before it reaches its target.",
  mercury: "Genius — how you encode experience into transmissible signal and evolve it into entirely new frameworks. Mercury is the intelligence layer of the chart: it translates what you perceive (Moon) and what you intend (Sun) into language, thought, and pattern. Uranus, its higher octave, does not simply add creativity to that intelligence — it transforms the direction of it, converting interpretation into architecture for what does not yet exist. Together at point 4, they determine not just how your mind works, but how it breaks with existing structure to produce what could not have been arrived at by refinement alone.",
  jupiter: "Expansion — the function that increases the reach and possibility of whatever it touches. Jupiter is not simply luck; it is the mechanism through which your work grows beyond its original container. It represents your instinct toward growth, your relationship with abundance, and the philosophical framework you use to understand why things matter. Jupiter's sign tells you how you naturally expand — through depth, breadth, optimism, discipline, or another quality — and its house shows which arena of life is most naturally amplified.",
  venus: "Value — the function of discernment and worth. Venus determines what you find genuinely meaningful, what you choose to invest in, and what you consider worth creating. It is not decoration; it is the selection mechanism that decides which of Jupiter's many possibilities actually deserve your continued attention and refinement. Venus in your chart shapes your aesthetic instincts, your relationship with desire, and the standard by which you evaluate your own output. When Venus is working clearly, you build things of lasting worth. When it is confused, you pursue what looks valuable rather than what is.",
  saturn: "Foundation — the function of structure, endurance, and earned authority. Saturn provides the architecture that allows everything else to persist beyond the initial creative impulse. It governs discipline, boundaries, long-term commitment, and the willingness to do difficult work over time. Saturn is where you are tested most consistently and where, through that testing, you develop your deepest competence. Its sign shapes how you build and where patience is required; its house shows which area of life demands the most sustained effort and offers the greatest structural reward.",
  pluto: "Regeneration — Mars's higher octave, operating at the level of complete transformation. Where Mars creates movement, Pluto creates evolution. It intensifies force into a pressure that dismantles whatever has outlived its form so that something stronger can emerge in its place. Pluto is slow and total: it does not adjust, it transforms. In your chart, Pluto shows where you are subject to the deepest cycles of breakdown and rebuilding — and where your greatest regenerative capacity lives. Its placement often marks the arena where you operate with unusual depth and intensity.",
  uranus: "Disruption — the higher octave of Mercury's Genius function, operating at the level of systemic reinvention. Where Mercury encodes and transmits within existing frameworks, Uranus rewrites the frameworks themselves. It introduces sudden insight, pattern-breaking perception, and entirely new structures for understanding. Uranus in your chart shows where you are most likely to see what others miss, where conventional approaches feel like a ceiling, and where originality operates not as style but as genuine structural necessity. Its influence is often felt as restlessness until the breakthrough arrives — and then as clarity that the old form was never going to hold.",
  neptune: "Dissolution — Venus's higher octave, operating at the level of collective meaning and idealized vision. Where Venus discerns personal worth, Neptune dissolves the boundary between personal and universal, drawing value toward ideals that carry significance beyond the individual. Neptune in your chart shows where you are permeable to inspiration, where imagination works at its most expansive, and where the pull toward something transcendent is strongest. It can be the source of profound creative vision or of confusion — the difference between the two is usually whether Neptune's signal has been given a workable form.",
};
