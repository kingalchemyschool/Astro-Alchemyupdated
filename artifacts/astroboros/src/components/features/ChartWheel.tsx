import type {
  AdditionalPointKey,
  ChartAngles,
  ChartPointPosition,
  NatalChart,
  PlanetKey,
  PlanetPosition,
  AspectType,
} from "@/types/astro";
import { PLANET_META, SIGNS } from "@/constants/astro";

const PLANET_KEYS: PlanetKey[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

const ADDITIONAL_META: Record<AdditionalPointKey, { label: string; glyph: string; color: string }> = {
  chiron: { label: "Chiron", glyph: "⚷", color: "#d6a7e8" },
  lilith: { label: "Black Moon Lilith", glyph: "⚸", color: "#d88aa4" },
  northNode: { label: "North Node", glyph: "☊", color: "#e5c786" },
  southNode: { label: "South Node", glyph: "☋", color: "#9c8fc7" },
};

const ANGLE_META: Array<{ key: keyof ChartAngles; label: string; glyph: string; color: string }> = [
  { key: "ascendant", label: "Ascendant", glyph: "AC", color: "#e8e4d8" },
  { key: "midheaven", label: "Midheaven", glyph: "MC", color: "#e8e4d8" },
  { key: "descendant", label: "Descendant", glyph: "DC", color: "#e8e4d8" },
  { key: "imumCoeli", label: "Imum Coeli", glyph: "IC", color: "#e8e4d8" },
];

const SIGN_COLORS = [
  "#e36d64", "#b6a15d", "#d8b86a", "#8bc6c8",
  "#e36d64", "#a8bf8b", "#8b9ee8", "#d88aa4",
  "#e36d64", "#a8bf8b", "#8b9ee8", "#8bc6c8",
];

const ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: "#d8b86a",
  sextile: "#8bc6c8",
  square: "#d95e68",
  trine: "#8b9ee8",
  opposition: "#d95e68",
};

type WheelChart = Pick<NatalChart, "positions" | "additionalPoints" | "angles" | "cusps" | "zodiac" | "aspects">;

interface Props {
  chart: WheelChart;
  overlay?: {
    positions: Record<PlanetKey, PlanetPosition>;
    additionalPoints?: Record<AdditionalPointKey, ChartPointPosition>;
    angles?: ChartAngles;
  };
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

function polar(longitude: number, radius: number, cx: number, cy: number) {
  // Astrology wheels place 0° Aries at the top and move clockwise.
  const radians = ((longitude - 90) * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function circularMidpoint(a: number, b: number) {
  const delta = ((b - a + 540) % 360) - 180;
  return (a + delta / 2 + 360) % 360;
}

function positionFor(
  chart: WheelChart,
  key: PlanetKey | AdditionalPointKey,
): { longitude: number; label: string; glyph: string; color: string } {
  if (key in chart.positions) {
    const planet = key as PlanetKey;
    return {
      longitude: chart.positions[planet].longitude,
      label: PLANET_META[planet].name,
      glyph: PLANET_META[planet].glyph,
      color: "#e8e4d8",
    };
  }
  const point = key as AdditionalPointKey;
  return {
    longitude: chart.additionalPoints[point].longitude,
    label: ADDITIONAL_META[point].label,
    glyph: ADDITIONAL_META[point].glyph,
    color: ADDITIONAL_META[point].color,
  };
}

function pointList(chart: WheelChart) {
  return [
    ...PLANET_KEYS.map((key) => ({ key, ...positionFor(chart, key) })),
    ...(Object.keys(ADDITIONAL_META) as AdditionalPointKey[]).map((key) => ({
      key,
      ...positionFor(chart, key),
    })),
  ];
}

export default function ChartWheel({
  chart,
  overlay,
  title = "Astral Chart",
  subtitle,
  compact = false,
}: Props) {
  const size = compact ? 360 : 460;
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.43;
  const signRing = size * 0.36;
  const houseRing = size * 0.29;
  const aspectRing = size * 0.18;
  const points = pointList(chart);
  const overlayPoints = overlay
    ? [
        ...PLANET_KEYS.map((key) => ({
          key,
          longitude: overlay.positions[key].longitude,
          label: PLANET_META[key].name,
          glyph: PLANET_META[key].glyph,
          color: "#9fc4ff",
        })),
        ...((Object.keys(ADDITIONAL_META) as AdditionalPointKey[])
          .filter((key) => overlay.additionalPoints?.[key])
          .map((key) => ({
            key,
            longitude: overlay.additionalPoints![key].longitude,
            label: ADDITIONAL_META[key].label,
            glyph: ADDITIONAL_META[key].glyph,
            color: "#8bc6c8",
          }))),
      ]
    : [];

  return (
    <section className="rounded-2xl border border-[#3B4B8C]/35 bg-[#080B18] p-5 shadow-[0_0_40px_rgba(59,75,140,0.1)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B9EE8]">Chart field</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-[#E8E4D8]">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-[#6B7A99]">{subtitle}</p>}
        </div>
        <span className="rounded-full border border-[#8B9EE8]/25 bg-[#3B4B8C]/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-[#8B9EE8]">
          {chart.zodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"}
        </span>
      </div>

      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_155px]">
        <div className="mx-auto w-full max-w-[460px]">
          <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full" role="img" aria-label={`${title} wheel`}>
            <defs>
              <radialGradient id="wheel-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#3B4B8C" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#080B18" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={outer + 16} fill="url(#wheel-glow)" />
            <circle cx={cx} cy={cy} r={outer} fill="#070A14" stroke="#53618c" strokeWidth="1.4" />
            <circle cx={cx} cy={cy} r={signRing} fill="#0b1020" stroke="#39466f" strokeWidth="1" />
            <circle cx={cx} cy={cy} r={houseRing} fill="#080b18" stroke="#39466f" strokeWidth="1" />
            <circle cx={cx} cy={cy} r={aspectRing} fill="#060810" stroke="#252f50" strokeWidth="0.8" />

            {Array.from({ length: 12 }, (_, i) => {
              const start = i * 30;
              const a = polar(start, outer, cx, cy);
              const b = polar(start, signRing, cx, cy);
              const label = polar(start + 15, (outer + signRing) / 2, cx, cy);
              return (
                <g key={`sign-${i}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#53618c" strokeWidth="0.9" />
                  <text x={label.x} y={label.y + 3} textAnchor="middle" fill={SIGN_COLORS[i]} fontSize={size * 0.042} fontWeight="600">
                    {SIGNS[i].glyph}
                  </text>
                </g>
              );
            })}

            {chart.cusps?.map((cusp, i) => {
              const a = polar(cusp, signRing, cx, cy);
              const b = polar(cusp, houseRing, cx, cy);
              return (
                <line key={`house-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#53618c" strokeOpacity="0.65" strokeWidth={i === 0 || i === 3 || i === 6 || i === 9 ? 1.5 : 0.6} />
              );
            })}

            {chart.cusps?.map((cusp, i) => {
              const next = chart.cusps[(i + 1) % chart.cusps.length];
              const midpoint = circularMidpoint(cusp, next);
              const label = polar(midpoint, signRing - 15, cx, cy);
              return (
                <text key={`house-label-${i}`} x={label.x} y={label.y + 3} textAnchor="middle" fill="#9aa3b8" fontSize={size * 0.025}>
                  {i + 1}
                </text>
              );
            })}

            {chart.aspects?.map((aspect) => {
              const a = polar(chart.positions[aspect.a].longitude, aspectRing, cx, cy);
              const b = polar(chart.positions[aspect.b].longitude, aspectRing, cx, cy);
              return (
                <line
                  key={`aspect-${aspect.a}-${aspect.b}-${aspect.type}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={ASPECT_COLORS[aspect.type]}
                  strokeOpacity="0.82"
                  strokeWidth={aspect.type === "square" || aspect.type === "opposition" ? 1.3 : 0.9}
                />
              );
            })}

            {points.map((point) => {
              const p = polar(point.longitude, houseRing - 3, cx, cy);
              const label = polar(point.longitude, houseRing - 24, cx, cy);
              return (
                <g key={String(point.key)}>
                  <circle cx={p.x} cy={p.y} r="2.6" fill={point.color} />
                  <text x={label.x} y={label.y + 3} textAnchor="middle" fill={point.color} fontSize={size * 0.038} fontWeight="600">
                    {point.glyph}
                  </text>
                </g>
              );
            })}

            {overlayPoints.map((point) => {
              const p = polar(point.longitude, houseRing - 42, cx, cy);
              return (
                <g key={`overlay-${String(point.key)}`}>
                  <circle cx={p.x} cy={p.y} r="3.2" fill={point.color} stroke="#07101e" strokeWidth="1" />
                  <text x={p.x} y={p.y - 7} textAnchor="middle" fill={point.color} fontSize={size * 0.03}>
                    {point.glyph}
                  </text>
                </g>
              );
            })}

            {ANGLE_META.map((angle) => {
              const source = chart.angles[angle.key];
              const p = polar(source.longitude, outer + 7, cx, cy);
              return (
                <text key={angle.key} x={p.x} y={p.y + 3} textAnchor="middle" fill={angle.color} fontSize={size * 0.034} fontWeight="700">
                  {angle.glyph}
                </text>
              );
            })}
            <circle cx={cx} cy={cy} r="3" fill="#d8b86a" />
          </svg>
        </div>

        <div className="space-y-2">
          <LegendGroup title="Angles">
            {ANGLE_META.map((angle) => (
              <LegendRow key={angle.key} glyph={angle.glyph} label={angle.label} value={`${chart.angles[angle.key].degree}°${String(chart.angles[angle.key].minute).padStart(2, "0")}′ ${SIGNS[chart.angles[angle.key].signIndex].name}`} color={angle.color} />
            ))}
          </LegendGroup>
          <LegendGroup title="Additional points">
            {(Object.keys(ADDITIONAL_META) as AdditionalPointKey[]).map((key) => {
              const point = chart.additionalPoints[key];
              return <LegendRow key={key} glyph={ADDITIONAL_META[key].glyph} label={ADDITIONAL_META[key].label} value={`${point.degree}°${String(point.minute).padStart(2, "0")}′ ${SIGNS[point.signIndex].name}`} color={ADDITIONAL_META[key].color} />;
            })}
          </LegendGroup>
        </div>
      </div>
    </section>
  );
}

function LegendGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1E2640]/70 bg-[#060810] p-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[#6B7A99]">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function LegendRow({ glyph, label, value, color }: { glyph: string; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[10px]">
      <span className="flex min-w-0 items-center gap-1.5 text-[#A8B4D4]">
        <span style={{ color }} className="w-4 text-center text-sm">{glyph}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-mono text-[9px] text-[#6B7A99]">{value}</span>
    </div>
  );
}