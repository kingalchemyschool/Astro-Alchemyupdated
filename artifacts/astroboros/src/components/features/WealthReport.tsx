import { useState } from "react";
import type { Reading } from "@/types/astro";
import PremiumGate from "@/components/features/PremiumGate";
import BlueprintEnneagram from "@/components/features/InteractiveEnneagram";
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

      <section className="space-y-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70 mb-1">
            Interactive Wealth Blueprint
          </div>
          <h3 className="font-serif text-2xl font-semibold text-white">Your wealth enneagram</h3>
          <p className="text-sm text-muted-foreground">
            Tap any function to explore its wealth role, octave amplifier, threshold, or connecting pathway.
          </p>
        </div>
        <BlueprintEnneagram
          chart={reading.chart}
          functions={reading.functions}
          premium={premium}
          onUnlock={onUnlock}
          labelOverrides={{
            planets: {
              sun: "Conscious Direction",
              moon: "Recognition",
              mars: "Force",
              mercury: "Translation",
              jupiter: "Expansion",
              venus: "Value",
              saturn: "Stewardship",
            },
            functions: {
              message: "Translation of Genius",
              execution: "Magnitude + Direction",
              discipline: "Strategy",
              mastery: "Conscious Stewardship",
              cultivation: "Dynamic Value Creation",
              integration: "Resonance of Value",
            },
            thresholds: {
              3: "Impact Threshold",
              6: "Wealth Threshold",
            },
          }}
        />
      </section>

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
