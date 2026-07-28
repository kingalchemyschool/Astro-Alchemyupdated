import { useState } from "react";
import type { Reading } from "@/types/astro";
import PremiumGate from "@/components/features/PremiumGate";
import { cn } from "@/lib/utils";

interface Props {
  reading: Reading;
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
}

type ForceColor = "impact" | "wealth" | "consciousness";

const COLOR = {
  impact: {
    section:   "border-orange-500/25 bg-orange-950/20",
    badge:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
    formula:   "border-orange-500/20 text-orange-400/80",
    bar:       "bg-orange-500/40",
    glow:      "shadow-[0_0_24px_rgba(249,115,22,0.08)]",
    label:     "text-orange-400",
    border:    "border-orange-500/30",
    strength:  "border-orange-500/15 bg-orange-950/20",
    edge:      "border-l-orange-500/40",
    dot:       "bg-orange-400",
  },
  wealth: {
    section:   "border-amber-500/25 bg-amber-950/20",
    badge:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
    formula:   "border-amber-500/20 text-amber-400/80",
    bar:       "bg-amber-500/40",
    glow:      "shadow-[0_0_24px_rgba(251,191,36,0.08)]",
    label:     "text-amber-400",
    border:    "border-amber-500/30",
    strength:  "border-amber-500/15 bg-amber-950/20",
    edge:      "border-l-amber-500/40",
    dot:       "bg-amber-400",
  },
  consciousness: {
    section:   "border-violet-500/25 bg-violet-950/20",
    badge:     "bg-violet-500/10 text-violet-400 border-violet-500/20",
    formula:   "border-violet-500/20 text-violet-400/80",
    bar:       "bg-violet-500/40",
    glow:      "shadow-[0_0_24px_rgba(45,212,191,0.08)]",
    label:     "text-violet-400",
    border:    "border-violet-500/30",
    strength:  "border-violet-500/15 bg-violet-950/20",
    edge:      "border-l-violet-500/40",
    dot:       "bg-violet-400",
  },
} satisfies Record<ForceColor, Record<string, string>>;

function ForceSection({
  label,
  color,
  title,
  planetLine,
  synthesisIntro,
  signature,
  formula,
  strengths,
  matureExpression,
  developmentalEdge,
  reflectionQuestion,
}: {
  label: string;
  color: ForceColor;
  title: string;
  planetLine: string;
  synthesisIntro: string;
  signature: string[];
  formula: string;
  strengths: { label: string; description: string }[];
  matureExpression: string;
  developmentalEdge: string[];
  reflectionQuestion: string;
}) {
  const c = COLOR[color];
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={cn("rounded-2xl border p-6 sm:p-8 space-y-6", c.section, c.glow)}>
      {/* Header */}
      <div>
        <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.15em] mb-3", c.badge)}>
          {label}
        </div>
        <h3 className="font-serif text-2xl font-semibold">{title}</h3>
        <p className={cn("mt-1 font-mono text-[11px] tracking-wide", c.label, "opacity-60")}>{planetLine}</p>
      </div>

      {/* Formula pill */}
      <div className={cn("inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-[11px] tracking-wide", c.formula)}>
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.dot)} />
        {formula}
      </div>

      {/* Synthesis intro — how the planets create a unified system */}
      <p className="text-[15px] leading-relaxed text-foreground/85">{synthesisIntro}</p>

      {/* Strengths */}
      <div>
        <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Natural Strengths
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {strengths.map((s) => (
            <div key={s.label} className={cn("rounded-xl border p-3.5", c.strength)}>
              <p className={cn("font-semibold text-sm", c.label)}>{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mature Expression */}
      <div className={cn("rounded-xl border bg-card/10 p-4", c.border)}>
        <p className={cn("font-mono text-[10px] uppercase tracking-[0.15em] mb-2", c.label, "opacity-60")}>
          Mature Expression
        </p>
        <p className="text-[15px] leading-relaxed text-foreground/85">{matureExpression}</p>
      </div>

      {/* Reflection */}
      <div className={cn("rounded-xl border bg-card/10 p-4", c.border)}>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
          Reflection Question
        </p>
        <p className="text-[15px] leading-relaxed text-foreground/90 font-medium">
          {reflectionQuestion}
        </p>
      </div>

      {/* Planetary Detail — collapsible */}
      <div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors hover:bg-white/[0.03]",
            c.strength
          )}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Planetary Detail
          </span>
          <svg
            className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {expanded && (
          <div className="mt-4 space-y-6">
            {/* Per-planet prose */}
            <div className="space-y-4 text-[15px] leading-relaxed text-foreground/85">
              {signature.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {/* Developmental Edge */}
            <div>
              <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Developmental Edge
              </h4>
              <div className={cn("space-y-2 border-l-2 pl-4", c.edge)}>
                {developmentalEdge.map((p, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-foreground/75 italic">{p}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Creative function card ────────────────────────────────────────────────────
function RelationSection({
  title,
  subtitle,
  planets,
  formula,
  paragraphs,
  developmentalEdge,
  masteryConclusion,
}: {
  title: string;
  subtitle: string;
  planets: string;
  formula: string;
  paragraphs: string[];
  developmentalEdge?: string;
  masteryConclusion?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-card/30 p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
          {planets}
        </div>
        <h4 className="font-serif text-lg font-semibold">{title}</h4>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/50">{subtitle}</p>
      </div>

      {/* Formula */}
      <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] px-4 py-2 font-mono text-[11px] tracking-wide text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-white/25 shrink-0" />
        {formula}
      </div>

      {/* Main prose */}
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/80">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* Developmental Edge — Creative Functions only */}
      {developmentalEdge && (
        <div className="border-t border-white/[0.06] pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
            Developmental Edge
          </p>
          <p className="text-[14px] leading-relaxed text-foreground/65 italic">{developmentalEdge}</p>
        </div>
      )}

      {/* Mastery Conclusion — Creative Functions only */}
      {masteryConclusion && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">
            Mastery
          </p>
          <p className="text-[15px] leading-relaxed text-foreground/85">{masteryConclusion}</p>
        </div>
      )}
    </div>
  );
}

// ── Interactive Wealth Enneagram ─────────────────────────────────────────────
type EnneagramSelection =
  | { kind: "point"; label: string; title: string; description: string; action?: string }
  | { kind: "line"; label: string; title: string; description: string };

const ENNEAGRAM_POINTS = [
  { id: 1, label: "1", title: "Moon", description: "Inner processing and recognition: the first point of the creative system, where experience becomes significance.", action: "Open the full blueprint" },
  { id: 2, label: "2", title: "Mars", description: "Force and initiation: the capacity to move what has been recognized into directed action." },
  { id: 3, label: "3", title: "Strategy", description: "Moon + Mars — perception becomes directed force through Recognition → Prioritization → Action." },
  { id: 4, label: "4", title: "Mercury", description: "Translation and communication: the function that turns perception into a usable pattern." },
  { id: 5, label: "5", title: "Jupiter", description: "Expansion and reach: the function that allows understanding to become transferable value." },
  { id: 6, label: "6", title: "Dynamic Value Creation", description: "Mercury + Jupiter — information becomes transferable value through Translation → Expansion → Application." },
  { id: 7, label: "7", title: "Venus", description: "Value discernment: the function that recognizes what deserves cultivation and care." },
  { id: 8, label: "8", title: "Saturn", description: "Structure and stewardship: the function that gives what matters a durable container." },
  { id: 9, label: "9", title: "Resonance of Value", description: "Venus + Neptune — value becomes collective meaning through Value → Inspiration → Resonance → Influence." },
] as const;

const ENNEAGRAM_LINES = [
  { from: 9, to: 3, label: "9 → 3", title: "Strategy", description: "The path from resonance to directed force: what matters becomes something that can be prioritized and acted upon." },
  { from: 3, to: 6, label: "3 → 6", title: "Dynamic Value Creation", description: "The path from directed action to reach: strategy becomes a repeatable process for translating effort into value." },
  { from: 6, to: 9, label: "6 → 9", title: "Resonance of Value", description: "The path from expansion to significance: value becomes meaningful beyond its original context." },
  { from: 1, to: 4, label: "1 → 4", title: "Translation of Genius", description: "Moon-led perception enters Mercury’s language and becomes available for translation into new understanding." },
  { from: 4, to: 2, label: "4 → 2", title: "Magnitude + Direction", description: "Translated intelligence gains force and direction, moving from pattern into consequence." },
  { from: 2, to: 8, label: "2 → 8", title: "Force into Structure", description: "Initiated force encounters structure, converting momentum into a capacity that can hold consequence." },
  { from: 8, to: 5, label: "8 → 5", title: "Structure into Reach", description: "What has been made durable becomes available for expansion, transmission, and wider use." },
  { from: 5, to: 7, label: "5 → 7", title: "Reach into Value", description: "Expansion is filtered through discernment so that growth serves what is genuinely worth cultivating." },
  { from: 7, to: 1, label: "7 → 1", title: "Conscious Stewardship", description: "Recognized value returns to the inner system to be protected, embodied, and carried forward." },
] as const;

function InteractiveEnneagram({
  premium,
  onUnlock,
}: {
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
}) {
  const [selected, setSelected] = useState<EnneagramSelection>({
    kind: "point",
    label: "Point 1",
    title: "Moon",
    description: "Select any point or pathway to explore how the creative system moves from perception to consequence, innovation, and influence.",
    action: "Open the full blueprint",
  });

  const pointById = new Map(ENNEAGRAM_POINTS.map((point) => [point.id, point] as const));
  type PointId = typeof ENNEAGRAM_POINTS[number]["id"];
  const point = (id: PointId) => pointById.get(id)!;
  const coord = (id: PointId, radius = 100) => {
    const angle = (-90 + (id - 1) * 40) * (Math.PI / 180);
    return { x: 180 + radius * Math.cos(angle), y: 132 + radius * Math.sin(angle) };
  };

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-[#060c18] p-6 sm:p-8 shadow-[0_0_28px_rgba(34,211,238,0.06)]">
      <div className="mb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70 mb-2">
          Interactive Creative Enneagram
        </div>
        <h3 className="font-serif text-2xl font-semibold text-white">Explore the creative system</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          Every point and connecting pathway is clickable. Follow the movement from inner function to
          strategy, value creation, resonance, and higher-order creative mechanics.
        </p>
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[minmax(320px,1fr)_minmax(260px,0.8fr)]">
        <div className="mx-auto w-full max-w-[440px]">
          <svg viewBox="0 0 360 265" className="w-full overflow-visible" role="img" aria-label="Interactive creative enneagram">
            <defs>
              <filter id="enneagram-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <circle cx="180" cy="132" r="100" fill="none" stroke="rgba(125,211,252,0.22)" strokeWidth="1.2" />
            <polygon
              points={[9, 3, 6].map((id) => {
                const p = coord(id as PointId);
                return `${p.x},${p.y}`;
              }).join(" ")}
              fill="rgba(34,211,238,0.025)"
              stroke="rgba(103,232,249,0.48)"
              strokeWidth="1.4"
              strokeDasharray="5 4"
            />
            <g
              role="button"
              tabIndex={0}
              aria-label="Integrated system"
              onClick={() => setSelected({ kind: "line", label: "Center", title: "Integrated System", description: "Force, intelligence, and value operate as one evolutionary architecture: Transformation → Innovation → Influence." })}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelected({ kind: "line", label: "Center", title: "Integrated System", description: "Force, intelligence, and value operate as one evolutionary architecture: Transformation → Innovation → Influence." }); }}
              className="cursor-pointer"
            >
              <circle cx="180" cy="132" r="38" fill="transparent" stroke="transparent" strokeWidth="10" />
              <circle cx="180" cy="132" r="33" fill="rgba(139,92,246,0.08)" stroke="rgba(167,139,250,0.45)" strokeWidth="1" />
            </g>

            {ENNEAGRAM_LINES.map((line) => {
              const start = coord(line.from as PointId);
              const end = coord(line.to as PointId);
              const active = selected.kind === "line" && selected.label === line.label;
              return (
                <g key={line.label} role="button" tabIndex={0} aria-label={`${line.title}: ${line.description}`}
                  onClick={() => setSelected({ kind: "line", label: line.label, title: line.title, description: line.description })}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelected({ kind: "line", label: line.label, title: line.title, description: line.description }); }}
                  className="cursor-pointer">
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="transparent" strokeWidth="14" />
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke={active ? "#67e8f9" : "rgba(103,232,249,0.3)"} strokeWidth={active ? 2.5 : 1.2}
                    strokeDasharray={line.from === 9 ? undefined : "4 4"} filter={active ? "url(#enneagram-glow)" : undefined} />
                </g>
              );
            })}

            {ENNEAGRAM_POINTS.map((item) => {
              const { x, y } = coord(item.id);
              const active = selected.kind === "point" && selected.label === `Point ${item.id}`;
              return (
                <g key={item.id} role="button" tabIndex={0} aria-label={`Point ${item.id}: ${item.title}`}
                  onClick={() => setSelected({ kind: "point", label: `Point ${item.id}`, title: item.title, description: item.description, action: "action" in item ? item.action : undefined })}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelected({ kind: "point", label: `Point ${item.id}`, title: item.title, description: item.description, action: "action" in item ? item.action : undefined }); }}
                  className="cursor-pointer">
                  <circle cx={x} cy={y} r="19" fill={active ? "rgba(34,211,238,0.25)" : "rgba(15,23,42,0.96)"}
                    stroke={active ? "#67e8f9" : "rgba(148,163,184,0.48)"} strokeWidth={active ? 2 : 1} filter={active ? "url(#enneagram-glow)" : undefined} />
                  <text x={x} y={y + 4} textAnchor="middle" fill={active ? "#cffafe" : "#cbd5e1"} fontSize="12" fontFamily="monospace" fontWeight="700">{item.label}</text>
                </g>
              );
            })}
            <text x="180" y="128" textAnchor="middle" fill="#ddd6fe" fontSize="7" fontFamily="monospace" letterSpacing="0.08em">INTEGRATED</text>
            <text x="180" y="139" textAnchor="middle" fill="#ddd6fe" fontSize="7" fontFamily="monospace" letterSpacing="0.08em">SYSTEM</text>
          </svg>
          <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
            Select a point or line
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 min-h-[190px]">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300/60">{selected.label}</div>
          <h4 className="mt-2 font-serif text-xl font-semibold text-white">{selected.title}</h4>
          <p className="mt-3 text-sm leading-relaxed text-white/65">{selected.description}</p>
          {selected.kind === "point" && selected.action && (
            <button
              type="button"
              onClick={() => { if (!premium) void onUnlock?.(); }}
              className="mt-5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/20"
            >
              {premium ? "Full blueprint unlocked" : selected.action}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Cosmic header with mini Venn ─────────────────────────────────────────────
function MiniVenn({ impact, wealth, consciousness }: { impact: string; wealth: string; consciousness: string }) {
  const cx = 130, cy = 90, r = 58, offset = 36;
  const top   = { x: cx,          y: cy - offset };
  const left  = { x: cx - offset, y: cy + offset * 0.7 };
  const right = { x: cx + offset, y: cy + offset * 0.7 };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060c18] p-6 sm:p-8">
      {/* nebula glows */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-900/20 blur-[40px]" />
      <div className="absolute -bottom-10 -left-5 w-32 h-32 rounded-full bg-amber-900/15 blur-[40px]" />
      <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-orange-900/10 blur-[40px]" />

      <div className="relative flex flex-col sm:flex-row items-center gap-8">
        {/* Mini SVG Venn */}
        <div className="shrink-0">
          <svg viewBox="0 0 260 200" width="200" className="overflow-visible">
            <defs>
              <filter id="mg-violet"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="mg-gold"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="mg-red"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <circle cx={top.x}   cy={top.y}   r={r} fill="rgba(109,40,217,0.10)" stroke="#a78bfa" strokeWidth="1.2" filter="url(#mg-violet)" />
            <circle cx={left.x}  cy={left.y}  r={r} fill="rgba(110,80,10,0.10)"  stroke="#fbbf24" strokeWidth="1.2" filter="url(#mg-gold)" />
            <circle cx={right.x} cy={right.y} r={r} fill="rgba(160,40,10,0.10)"  stroke="#f97316" strokeWidth="1.2" filter="url(#mg-red)" />
            {/* center */}
            <circle cx={cx} cy={cy + 6} r={14} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <text x={cx} y={cy + 2}  textAnchor="middle" fill="white" fontSize="4.5" fontFamily="monospace" letterSpacing="0.04em" opacity="0.9">INTEGRATED</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="white" fontSize="4.5" fontFamily="monospace" letterSpacing="0.04em" opacity="0.9">MASTERY</text>
            {/* labels */}
            <text x={top.x}   y={top.y - r - 8} textAnchor="middle" fill="#5eead4" fontSize="7" fontFamily="monospace" fontWeight="700" letterSpacing="0.1em">CONSCIOUS</text>
            <text x={left.x - 10}  y={left.y  + r + 14} textAnchor="middle" fill="#fcd34d" fontSize="7" fontFamily="monospace" fontWeight="700" letterSpacing="0.1em">WEALTH</text>
            <text x={right.x + 10} y={right.y + r + 14} textAnchor="middle" fill="#fb923c" fontSize="7" fontFamily="monospace" fontWeight="700" letterSpacing="0.1em">IMPACT</text>
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-2 opacity-80">
            Your Alchemical Signature
          </div>
          <h2 className="font-serif text-2xl font-semibold text-white mb-4">
            Three forces, one integrated mastery
          </h2>
          <div className="space-y-2.5">
            {[
              { label: "Impact",       title: impact,       c: "text-orange-400", dot: "bg-orange-400" },
              { label: "Wealth",       title: wealth,       c: "text-amber-400",  dot: "bg-amber-400" },
              { label: "Conscious",    title: consciousness, c: "text-violet-400", dot: "bg-violet-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={cn("h-2 w-2 rounded-full shrink-0 mt-0.5", item.dot)} />
                <span className={cn("font-mono text-[10px] uppercase tracking-widest w-20 shrink-0", item.c)}>{item.label}</span>
                <span className="text-sm text-white/70 font-serif italic">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WealthReport({ reading, premium, onUnlock }: Props) {
  const { wealthBlueprint: wb } = reading;

  const content = (
    <div className="space-y-8">
      {/* Cosmic header */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-2">
          Create Conscious Wealth Blueprint
        </div>
        <MiniVenn
          impact={wb.impact.title}
          wealth={wb.wealth.title}
          consciousness={wb.consciousness.title}
        />
        <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">
          {wb.alchemicalSignature}
        </p>
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* Three forces */}
      <ForceSection
        label="Impact — How You Create Change"
        color="impact"
        title={wb.impact.title}
        planetLine={wb.impact.planetLine}
        synthesisIntro={wb.impact.synthesisIntro}
        signature={wb.impact.signature}
        formula={wb.impact.formula}
        strengths={wb.impact.strengths}
        matureExpression={wb.impact.matureExpression}
        developmentalEdge={wb.impact.developmentalEdge}
        reflectionQuestion={wb.impact.reflectionQuestion}
      />
      <ForceSection
        label="Wealth — How You Create Sustainable Value"
        color="wealth"
        title={wb.wealth.title}
        planetLine={wb.wealth.planetLine}
        synthesisIntro={wb.wealth.synthesisIntro}
        signature={wb.wealth.signature}
        formula={wb.wealth.formula}
        strengths={wb.wealth.strengths}
        matureExpression={wb.wealth.matureExpression}
        developmentalEdge={wb.wealth.developmentalEdge}
        reflectionQuestion={wb.wealth.reflectionQuestion}
      />
      <ForceSection
        label="Consciousness — How Experience Becomes Mastery"
        color="consciousness"
        title={wb.consciousness.title}
        planetLine={wb.consciousness.planetLine}
        synthesisIntro={wb.consciousness.synthesisIntro}
        signature={wb.consciousness.signature}
        formula={wb.consciousness.formula}
        strengths={wb.consciousness.strengths}
        matureExpression={wb.consciousness.matureExpression}
        developmentalEdge={wb.consciousness.developmentalEdge}
        reflectionQuestion={wb.consciousness.reflectionQuestion}
      />

      <div className="border-t border-white/[0.06]" />

      {/* Conscious Wealth Formula */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060c18] p-6 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-900/15 blur-[50px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-amber-900/10 blur-[50px]" />
        </div>
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-5 opacity-80">
            Your Conscious Wealth Formula
          </div>
          <div className="space-y-5">
            {[
              { label: "Impact",       text: wb.formula.impact,       color: "text-orange-400", dot: "bg-orange-400" },
              { label: "Wealth",       text: wb.formula.wealth,       color: "text-amber-400",  dot: "bg-amber-400" },
              { label: "Consciousness", text: wb.formula.consciousness, color: "text-violet-400", dot: "bg-violet-400" },
            ].map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", item.dot)} />
                  <div className="w-px flex-1 bg-white/[0.06]" />
                </div>
                <div className="pb-4 min-w-0">
                  <span className={cn("font-mono text-[10px] uppercase tracking-[0.15em] font-bold", item.color)}>
                    {item.label}
                  </span>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/80">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creative Functions */}
      <section className="space-y-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-1">
            Creative Functions
          </div>
          <p className="text-sm text-muted-foreground/60">
            The operational processes created when planetary forces cooperate.
          </p>
        </div>
        <RelationSection {...wb.relations.strategy} />
        <RelationSection {...wb.relations.dynamicValueCreation} />
        <RelationSection {...wb.relations.consciousStewardship} />
        <CreativeArchitectureSection {...wb.creativeArchitecture} />
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* Creative Mechanics */}
      <section className="space-y-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-1">
            Creative Mechanics
          </div>
          <p className="text-sm text-muted-foreground/60">
            How each inner planetary force is elevated through its higher octave into a new creative capacity.
          </p>
        </div>
        <RelationSection {...wb.synthesis.impact} />
        <RelationSection {...wb.synthesis.translation} />
        <RelationSection {...wb.synthesis.value} />
        <CreativeMechanicsArchitectureSection {...wb.creativeMechanicsArchitecture} />
      </section>

      <InteractiveEnneagram premium={premium} onUnlock={onUnlock} />

      <div className="border-t border-white/[0.06]" />

      {/* Core Archetype */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060c18] p-6 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full bg-violet-900/20 blur-[40px]" />
        </div>
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-3 opacity-80">
            Core Archetype
          </div>
          <h3 className="font-serif text-3xl font-semibold text-white">{wb.coreArchetype.title}</h3>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-white/80">
            {wb.coreArchetype.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <PremiumGate
      premium={premium}
      onUnlock={onUnlock}
      price="$22"
      product="wealth"
      title="Unlock Your Conscious Wealth Reading"
      description="A focused exploration of your relationship with value, creation, and prosperity. Discover the patterns that influence how you generate impact, cultivate resources, and build wealth that aligns with your deeper potential."
    >
      {content}
    </PremiumGate>
  );
}

function CreativeArchitectureSection({
  title,
  cycle,
  paragraphs,
}: {
  title: string;
  cycle: string;
  paragraphs: string[];
}) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-950/10 p-6 sm:p-7 space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300/70 mb-2">
          {title}
        </div>
        <h4 className="font-serif text-xl font-semibold text-white">How creation becomes durable</h4>
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg border border-violet-300/15 px-4 py-2 font-mono text-[11px] tracking-wide text-violet-200/70">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300/60 shrink-0" />
        {cycle}
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/80">
        {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </div>
  );
}

function CreativeMechanicsArchitectureSection({
  title,
  sequence,
  paragraphs,
}: {
  title: string;
  sequence: string;
  paragraphs: string[];
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-6 sm:p-7 space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300/70 mb-2">{title}</div>
        <h4 className="font-serif text-xl font-semibold text-white">How personal function evolves</h4>
      </div>
      <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/15 px-4 py-2 font-mono text-[11px] tracking-wide text-cyan-200/70">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/60 shrink-0" />
        {sequence}
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/80">
        {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </div>
  );
}
