import { useState } from "react";
import type {
  ArchetypeFunction,
  FunctionKey,
  NatalChart,
  PlanetKey,
} from "@/types/astro";
import { PLANET_META, PLANET_ABOUT, SIGNS, ORDINALS } from "@/constants/astro";
import { cn } from "@/lib/utils";

interface Props {
  chart: NatalChart;
  functions: ArchetypeFunction[];
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
  labelOverrides?: {
    planets?: Partial<Record<PlanetKey, string>>;
    functions?: Partial<Record<FunctionKey, string>>;
    thresholds?: Partial<Record<3 | 6, string>>;
  };
}

type Selected =
  | { t: "planet"; key: PlanetKey }
  | { t: "octave"; key: PlanetKey }
  | { t: "threshold"; key: 3 | 6 }
  | { t: "archetype"; key: FunctionKey }
  | null;

const CX = 190;
const CY = 190;
const R = 118;
const SAT = 156;

const NODES: { n: number; planet: PlanetKey; octave?: PlanetKey }[] = [
  { n: 0, planet: "sun" },
  { n: 1, planet: "moon" },
  { n: 2, planet: "mars", octave: "pluto" },
  { n: 4, planet: "mercury", octave: "uranus" },
  { n: 5, planet: "jupiter" },
  { n: 7, planet: "venus", octave: "neptune" },
  { n: 8, planet: "saturn" },
];

const EDGES: { a: number; b: number; key: FunctionKey }[] = [
  { a: 1, b: 4, key: "message" },
  { a: 4, b: 2, key: "execution" },
  { a: 2, b: 8, key: "discipline" },
  { a: 8, b: 5, key: "mastery" },
  { a: 5, b: 7, key: "cultivation" },
  { a: 7, b: 1, key: "integration" },
];

function coord(n: number, radius = R) {
  const a = (-90 + n * 40) * (Math.PI / 180);
  return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
}

// Threshold metadata: position on circle → label + description shown in detail panel.
const THRESHOLD_INFO: Record<number, { label: string; description: string }> = {
  3: {
    label: "Impact Threshold",
    description:
      "The point in the cycle where force meets direction. Before this threshold, energy generates movement. After it, movement becomes intention — force that has been aimed rather than simply released. This is where the question shifts from \"how hard can I push\" to \"where does this need to land.\"",
  },
  6: {
    label: "Wealth Threshold",
    description:
      "The point in the cycle where expansion meets discernment. Before this threshold, growth multiplies what is available. After it, abundance is filtered through genuine worth — growth becomes defined not by how much can be added, but by what is actually worth keeping. This is where scale stops being the measure and lasting value takes its place.",
  },
};

export default function InteractiveEnneagram({
  chart,
  functions,
  premium,
  onUnlock,
  labelOverrides,
}: Props) {
  const [selected, setSelected] = useState<Selected>(null);

  const triangle = [0, 3, 6].map((n) => coord(n));

  const isSel = (s: Selected) =>
    selected &&
    s &&
    JSON.stringify(selected) === JSON.stringify(s);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Diagram */}
      <div className="rounded-xl border border-border bg-card/60 p-4 blueprint-grid">
        <svg viewBox="0 0 380 380" className="mx-auto w-full max-w-[440px]">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="hsl(var(--border))" strokeWidth={1} />

          {/* Triangle 0-3-6 (decorative spine) */}
          <polygon
            points={triangle.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth={1}
            strokeDasharray="4 5"
          />

          {/* Hexad edges = Alchemist Archetypes (clickable) */}
          {EDGES.map((e) => {
            const p1 = coord(e.a);
            const p2 = coord(e.b);
            const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            const active = isSel({ t: "archetype", key: e.key });
            return (
              <g key={e.key} className="cursor-pointer">
                <line
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={active ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.4)"}
                  strokeWidth={active ? 2.5 : 1.3}
                />
                <line
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke="transparent" strokeWidth={18}
                  onClick={() => setSelected({ t: "archetype", key: e.key })}
                />
                <circle
                  cx={mid.x} cy={mid.y} r={active ? 4 : 2.5}
                  fill="hsl(var(--accent))"
                  onClick={() => setSelected({ t: "archetype", key: e.key })}
                />
              </g>
            );
          })}

          {/* Octave connectors + satellites */}
          {NODES.filter((nd) => nd.octave).map((nd) => {
            const base = coord(nd.n);
            const sat = coord(nd.n, SAT);
            const active = isSel({ t: "octave", key: nd.octave! });
            return (
              <g key={nd.octave} className="cursor-pointer" onClick={() => setSelected({ t: "octave", key: nd.octave! })}>
                <line x1={base.x} y1={base.y} x2={sat.x} y2={sat.y} stroke="hsl(var(--accent) / 0.35)" strokeWidth={1} strokeDasharray="2 3" />
                <circle cx={sat.x} cy={sat.y} r={13} fill="hsl(var(--card))" stroke={active ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.5)"} strokeWidth={active ? 2 : 1.3} />
                <text x={sat.x} y={sat.y + 4} textAnchor="middle" fontSize={12} className="glyph" fill="hsl(var(--accent))">
              {PLANET_META[nd.octave!].glyph}
                </text>
              </g>
            );
          })}

          {/* Threshold nodes (3 & 6) — plain informational points, no lock */}
          {[3, 6].map((n) => {
            const { x, y } = coord(n);
            const active = isSel({ t: "threshold", key: n as 3 | 6 });
            const s = 8; // half-size of diamond
            return (
              <g key={n} className="cursor-pointer" onClick={() => setSelected({ t: "threshold", key: n as 3 | 6 })}>
                {active && <circle cx={x} cy={y} r={20} fill="hsl(var(--primary) / 0.10)" />}
                {/* Diamond shape */}
                <polygon
                  points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
                  fill="hsl(var(--card))"
                  stroke={active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
                  strokeWidth={active ? 2 : 1.3}
                />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={8} fontFamily="'JetBrains Mono', monospace" fill="hsl(var(--primary))">
                  ◬
                </text>
              </g>
            );
          })}

          {/* Planet nodes */}
          {NODES.map((nd) => {
            const { x, y } = coord(nd.n);
            const active = isSel({ t: "planet", key: nd.planet });
            return (
              <g key={nd.planet} className="cursor-pointer" onClick={() => setSelected({ t: "planet", key: nd.planet })}>
                {active && <circle cx={x} cy={y} r={24} fill="hsl(var(--accent) / 0.12)" />}
                <circle cx={x} cy={y} r={20} fill="hsl(var(--card))" stroke={active ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.55)"} strokeWidth={active ? 2.4 : 1.5} />
                <text x={x} y={y + 6} textAnchor="middle" fontSize={17} className="glyph" fill="hsl(var(--foreground))">
                  {PLANET_META[nd.planet].glyph}
                </text>
                <text x={x} y={y - 27} textAnchor="middle" fontSize={9} fontFamily="'JetBrains Mono', monospace" fill="hsl(var(--muted-foreground))">
                  {labelOverrides?.planets?.[nd.planet] ?? PLANET_META[nd.planet].fn}
                </text>
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={3} fill="hsl(var(--primary))" />
        </svg>
      </div>

      {/* Detail panel */}
      <div className="flex flex-col rounded-xl border border-border bg-card/60 p-6">
        <Detail selected={selected} chart={chart} functions={functions} labelOverrides={labelOverrides} />
      </div>
    </div>
  );
}

function Detail({
  selected,
  chart,
  functions,
  labelOverrides,
}: {
  selected: Selected;
  chart: NatalChart;
  functions: ArchetypeFunction[];
  labelOverrides?: Props["labelOverrides"];
}) {
  if (!selected) {
    return (
      <div className="m-auto max-w-xs text-center">
        <div className="glyph mb-3 text-4xl text-accent">✷</div>
        <p className="font-serif text-lg font-semibold">Explore your blueprint</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a <span className="text-accent">function</span> to learn its role, the
          outer <span className="text-accent">octaves</span> that amplify it, or a{" "}
          <span className="text-accent">connecting line</span> to reveal one of your six
          Alchemist Archetypes. Tap a <span className="text-primary">◇ diamond</span> to
          explore a cycle threshold.
        </p>
      </div>
    );
  }

  if (selected.t === "planet" || selected.t === "octave") {
    const key = selected.key;
    const meta = PLANET_META[key];
    const pos = chart.positions[key];
    return (
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="glyph text-3xl text-accent">{meta.glyph}</span>
          <div>
            <h4 className="font-serif text-xl font-semibold">
              {meta.name} · {labelOverrides?.planets?.[key] ?? meta.fn}
            </h4>
            <p className="font-mono text-xs text-muted-foreground">
              {SIGNS[pos.signIndex].name} · {ORDINALS[pos.house - 1]} house
              {pos.retrograde ? " · ℞" : ""}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{PLANET_ABOUT[key]}</p>
        {selected.t === "octave" && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            An octave planet amplifies its base function — it operates as an extension rather than an independent point.
          </p>
        )}
      </div>
    );
  }

  if (selected.t === "threshold") {
    const info = THRESHOLD_INFO[selected.key];
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl text-primary">◬</span>
           <h4 className="font-serif text-xl font-semibold">{labelOverrides?.thresholds?.[selected.key] ?? info.label}</h4>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{info.description}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The full threshold reading — decoded with your exact placements — is woven into
          the complete blueprint.
        </p>
      </div>
    );
  }

  const fn = functions.find((f) => f.key === selected.key)!;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="glyph text-2xl text-accent">{fn.glyphs[0]}</span>
        <span className="text-muted-foreground">+</span>
        <span className="glyph text-2xl text-primary">{fn.glyphs[1]}</span>
         <h4 className="ml-1 font-serif text-xl font-semibold">{labelOverrides?.functions?.[selected.key] ?? fn.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground">{fn.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{fn.definition}</p>
      <p className="mt-2 text-sm leading-relaxed">
        In your chart this resolves into{" "}
        <span className="font-semibold text-primary">{fn.archetypeName}</span> — {fn.archetypeLine}
      </p>
    </div>
  );
}
