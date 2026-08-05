import { useState } from "react";
import {
  FlaskConical,
  RotateCcw,
  Check,
  Zap,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Shield,
  Target,
  ArrowRight,
  Activity,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { exportLabPdf } from "@/lib/pdf";
import type { BirthInput, Reading } from "@/types/astro";
import { computeChart } from "@/lib/ephemeris";
import { generateReading } from "@/lib/reading";
import {
  compareCharts,
  type Comparison,
  type Amplifier,
  type Constraint,
  type PlanetPairNote,
  type SynastryMatrixEntry,
} from "@/lib/compare";
import { SIGNS, PLANET_META } from "@/constants/astro";
import BirthDataForm from "@/components/features/BirthDataForm";
import { Button } from "@/components/common/Button";

export default function Compare() {
  const [a, setA] = useState<Reading | null>(null);
  const [b, setB] = useState<Reading | null>(null);
  const [result, setResult] = useState<Comparison | null>(null);

  const make = (input: BirthInput) => generateReading(computeChart(input));

  const reset = () => {
    setA(null);
    setB(null);
    setResult(null);
  };

  if (result) {
    return <Result comparison={result} readingA={a!} readingB={b!} onReset={reset} />;
  }

  return (
    <div className="container max-w-5xl py-12">
      <header className="mb-10 max-w-2xl">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
          <FlaskConical className="h-3.5 w-3.5" /> Alchemy Laboratory
        </div>
        <h1 className="mt-2 font-serif text-4xl font-semibold">
          Compare two blueprints
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          A comparative exploration of two individual blueprints, revealing the dynamics,
          strengths, and opportunities within a connection. Understand how two people
          influence, support, and challenge each other through shared experiences.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Slot label="Person A" reading={a} onEdit={() => setA(null)}>
          <BirthDataForm onGenerate={(i) => setA(make(i))} />
        </Slot>
        <Slot label="Person B" reading={b} onEdit={() => setB(null)}>
          <BirthDataForm onGenerate={(i) => setB(make(i))} />
        </Slot>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Button
          size="lg"
          disabled={!a || !b}
          onClick={() => a && b && setResult(compareCharts(a, b))}
        >
          <FlaskConical className="h-4 w-4" /> Run the Laboratory
        </Button>
        {(a || b) && (
          <button
            onClick={reset}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset both
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Slot ─────────────────────────────────────────────────────────────────────

function Slot({
  label,
  reading,
  onEdit,
  children,
}: {
  label: string;
  reading: Reading | null;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  if (reading) {
    const sun = SIGNS[reading.chart.positions.sun.signIndex].name;
    const name = reading.chart.input.name?.trim() || label;
    return (
      <div className="flex flex-col justify-center rounded-2xl border border-primary/40 bg-primary/[0.05] p-6">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Check className="h-3.5 w-3.5" /> {label} ready
        </div>
        <h3 className="mt-2 font-serif text-2xl font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {sun} sun · {reading.chart.input.place}
        </p>
        <button
          onClick={onEdit}
          className="mt-4 self-start text-xs font-medium text-accent hover:underline"
        >
          Edit {label}
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

// ─── Health badge ─────────────────────────────────────────────────────────────

const HEALTH_COLORS: Record<string, string> = {
  Excellent:  "bg-primary/15 text-primary border-primary/30",
  Strong:     "bg-primary/10 text-primary/80 border-primary/20",
  Balanced:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Developing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Fragile:    "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function HealthBadge({ value }: { value: string }) {
  const cls = HEALTH_COLORS[value] ?? "bg-muted/20 text-muted-foreground border-border";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${cls}`}>
      {value}
    </span>
  );
}

// ─── Reaction state badge ─────────────────────────────────────────────────────

const REACTION_COLORS: Record<string, string> = {
  Resonant:   "bg-primary/15 text-primary border-primary/30",
  Stable:     "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Dynamic:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Catalytic:  "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Balanced:   "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Compressed: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Reactive:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Volatile:   "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function ReactionBadge({ value }: { value: string }) {
  const cls = REACTION_COLORS[value] ?? "bg-muted/20 text-muted-foreground border-border";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${cls}`}>
      {value}
    </span>
  );
}

// ─── Climate badge ────────────────────────────────────────────────────────────

const CLIMATE_COLORS: Record<string, string> = {
  Warm:         "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Catalytic:    "bg-violet-500/20 text-violet-300 border-violet-500/40",
  Balanced:     "bg-violet-500/20 text-violet-300 border-violet-500/40",
  "High-pressure": "bg-orange-500/20 text-orange-300 border-orange-500/40",
  Volatile:     "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 font-mono text-xs uppercase tracking-widest text-accent">
      {children}
    </div>
  );
}

// ─── Result ───────────────────────────────────────────────────────────────────

function Result({
  comparison,
  readingA,
  readingB,
  onReset,
}: {
  comparison: Comparison;
  readingA: Reading;
  readingB: Reading;
  onReset: () => void;
}) {
  const c = comparison;
  const es = c.experimentalSummary;
  const climateCls = CLIMATE_COLORS[es.climate] ?? "bg-muted/20 text-muted-foreground border-border";

  return (
    <div className="container max-w-4xl py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
            <FlaskConical className="h-3.5 w-3.5" /> The Laboratory
          </div>
          <h1 className="mt-1 font-serif text-4xl font-semibold">
            {c.nameA} <span className="text-muted-foreground">×</span> {c.nameB}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { exportLabPdf(c); toast.success("Lab PDF exported"); }}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Save Lab PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" /> New comparison
          </Button>
        </div>
      </div>

      {/* Intro */}
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
        {c.summary.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* ── Experimental Summary ── */}
      <section className="mt-10 rounded-2xl border border-accent/25 bg-accent/[0.04] p-6 sm:p-8">
        <SectionLabel>Experimental Summary</SectionLabel>
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-2xl font-semibold">Laboratory Climate</h2>
          <span className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest ${climateCls}`}>
            {es.climate}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Primary Strength", value: es.primaryStrength },
            { label: "Primary Challenge", value: es.primaryChallenge },
            { label: "Greatest Opportunity", value: es.greatestOpportunity },
            { label: "Greatest Operational Risk", value: es.greatestRisk },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card/40 p-4">
              <dt className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
              <dd className="text-sm leading-relaxed text-foreground/85">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-destructive/70">Left Unconscious</div>
            <p className="text-sm leading-relaxed text-foreground/80">{es.leftUnconscious}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary/70">Built Intentionally</div>
            <p className="text-sm leading-relaxed text-foreground/80">{es.builtIntentionally}</p>
          </div>
        </div>
      </section>

      {/* ── Complete sidereal synastry matrix ── */}
      <section className="mt-12">
        <div className="mb-6 border-b border-border/60 pb-2">
          <SectionLabel>Complete Sidereal Synastry</SectionLabel>
          <h2 className="mt-1 font-serif text-2xl font-semibold">Every qualifying cross-chart contact</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Exact aspects between both Ascendants and all ten planetary points. Orbs are calculated from the displayed sidereal longitudes; the cards translate each contact into observable partnership behavior.
          </p>
        </div>
        <div className="space-y-3">
          {c.synastryMatrix.map((entry, i) => (
            <SynastryMatrixCard key={`${entry.aPoint}-${entry.bPoint}-${entry.aspect}-${i}`} entry={entry} />
          ))}
        </div>
      </section>

      {/* ── Creation Cycle Analysis ── */}
      <section className="mt-12">
        <div className="mb-6 border-b border-border/60 pb-2">
          <SectionLabel>Creation Cycle Analysis</SectionLabel>
          <h2 className="mt-1 font-serif text-2xl font-semibold">Function by function</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How each pair of creative functions interacts when both systems work together.
          </p>
        </div>
        <div className="space-y-4">
          {c.planetPairs.map((p) => <FunctionCard key={p.key} pair={p} />)}
        </div>
      </section>

      {/* ── Amplifiers ── */}
      <section className="mt-12">
        <div className="mb-6 border-b border-border/60 pb-2">
          <SectionLabel>Amplifiers</SectionLabel>
          <h2 className="mt-1 font-serif text-2xl font-semibold">Where functions strengthen each other</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cross-contacts where one function naturally reinforces another across both blueprints.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {c.amplifiers.map((amp, i) => <AmplifierCard key={i} amp={amp} />)}
        </div>
      </section>

      {/* ── Constraints ── */}
      <section className="mt-10">
        <div className="mb-6 border-b border-border/60 pb-2">
          <SectionLabel>Constraints</SectionLabel>
          <h2 className="mt-1 font-serif text-2xl font-semibold">Engineering limitations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every difficult interaction is a constraint, not a flaw. Each contains its own mitigation.
          </p>
        </div>
        <div className="space-y-4">
          {c.constraints.map((con, i) => <ConstraintCard key={i} constraint={con} />)}
        </div>
      </section>

      {/* ── Emergent System ── */}
      <section className="mt-12 rounded-2xl border border-accent/25 bg-accent/[0.04] p-6 sm:p-8">
        <SectionLabel>Emergent System</SectionLabel>
        <h2 className="font-serif text-2xl font-semibold">{c.emergentSystem.category}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{c.emergentSystem.description}</p>
      </section>

      {/* ── Predicted Creation Cycle ── */}
      <section className="mt-12">
        <div className="mb-6 border-b border-border/60 pb-2">
          <SectionLabel>Predicted Creation Cycle</SectionLabel>
          <h2 className="mt-1 font-serif text-2xl font-semibold">How work flows through the partnership</h2>
        </div>
        <PredictedCycleView cycle={c.predictedCycle} />
      </section>

      {/* ── Executive Summary ── */}
      <section className="mt-12 rounded-2xl border border-primary/30 bg-primary/[0.05] p-6 sm:p-8">
        <SectionLabel>Executive Summary</SectionLabel>
        <h2 className="font-serif text-2xl font-semibold">The laboratory conclusion</h2>
        <div className="mt-6 space-y-4">
          {[
            { icon: TrendingUp, label: "Defining Strength", value: c.executiveSummary.definingStrength, accent: "text-accent" },
            { icon: AlertTriangle, label: "Defining Limitation", value: c.executiveSummary.definingLimitation, accent: "text-amber-400" },
            { icon: Target, label: "Highest Leverage Adjustment", value: c.executiveSummary.highestLeverage, accent: "text-primary" },
            { icon: Eye, label: "Long-Term Potential", value: c.executiveSummary.longTermPotential, accent: "text-violet-400" },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div key={label} className="flex gap-4 rounded-xl border border-border/60 bg-card/40 p-4">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${accent}`} />
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
                <p className="text-sm leading-relaxed text-foreground/85">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// ─── Function card ────────────────────────────────────────────────────────────

function FunctionCard({ pair }: { pair: PlanetPairNote }) {
  const meta = PLANET_META[pair.key];
  return (
    <article className="rounded-xl border border-border bg-card/60 p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="glyph text-2xl text-accent">{meta.glyph}</span>
          <div>
            <h4 className="font-serif text-xl font-semibold">{meta.name}</h4>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <span>{pair.aSign}</span>
              <span className="text-border">·</span>
              <span>{pair.bSign}</span>
              <span className="text-border">·</span>
              <span>{pair.relationshipType}</span>
            </div>
          </div>
        </div>
        <HealthBadge value={pair.healthIndicator} />
      </div>

      {/* Question */}
      {pair.question && (
        <div className="mt-4 rounded-lg bg-muted/20 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Function question  </span>
          <span className="text-sm font-medium text-foreground/90">{pair.question}</span>
        </div>
      )}

      {/* Functional interaction */}
      <p className="mt-4 text-sm leading-relaxed text-foreground/80">{pair.note}</p>

      {/* Reaction state + reason */}
      <div className="mt-4 flex flex-wrap items-start gap-3">
        <ReactionBadge value={pair.reactionState} />
        <p className="flex-1 text-sm leading-relaxed text-foreground/75 min-w-0">{pair.reactionReason}</p>
      </div>

      {/* Observable effect */}
      {pair.observableEffect && (
        <div className="mt-4 rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Observable Effect</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85 font-medium">{pair.observableEffect}</p>
        </div>
      )}

      {/* Recommendation */}
      {pair.recommendation && (
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/[0.06] px-4 py-3">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-primary/70">Recommendation</div>
          <p className="text-sm leading-relaxed text-foreground/85">{pair.recommendation}</p>
        </div>
      )}

      {/* Laboratory Experiment */}
      {pair.experiment && (
        <div className="mt-3 rounded-lg border border-accent/20 bg-accent/[0.05] px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <FlaskConical className="h-3 w-3 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Laboratory Experiment</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{pair.experiment}</p>
        </div>
      )}
    </article>
  );
}

function SynastryMatrixCard({ entry }: { entry: SynastryMatrixEntry }) {
  const isChallenging = entry.aspect === "square" || entry.aspect === "opposite" || entry.aspect === "quincunx";
  return (
    <article className={`rounded-xl border p-5 sm:p-6 ${
      isChallenging
        ? "border-amber-500/20 bg-amber-500/[0.035]"
        : "border-primary/20 bg-primary/[0.025]"
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-serif text-lg font-semibold">
            {entry.aPoint} <span className="text-muted-foreground">{entry.aspect}</span> {entry.bPoint}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>{entry.aPlacement}</span>
            <span className="text-border">×</span>
            <span>{entry.bPlacement}</span>
            <span className="text-border">·</span>
            <span>{entry.orb.toFixed(1)}° orb</span>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${
          isChallenging
            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
            : "border-primary/25 bg-primary/10 text-primary"
        }`}>
          {isChallenging ? "Constraint" : "Resource"}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground/85">{entry.interpretation}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">Observable Effect</div>
          <p className="text-sm leading-relaxed text-foreground/80">{entry.observableEffect}</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/[0.05] px-4 py-3">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-primary/70">Recommendation</div>
          <p className="text-sm leading-relaxed text-foreground/80">{entry.recommendation}</p>
        </div>
      </div>
    </article>
  );
}

// ─── Amplifier card ───────────────────────────────────────────────────────────

function AmplifierCard({ amp }: { amp: Amplifier }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
      <div className="mb-1 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground/90">{amp.interaction}</h4>
      </div>
      <dl className="mt-3 space-y-2.5">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Why it matters</dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-foreground/75">{amp.whyItMatters}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Observable outcome</dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-foreground/75">{amp.observableOutcome}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Operational advantage</dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-foreground/75">{amp.operationalAdvantage}</dd>
        </div>
      </dl>
    </div>
  );
}

// ─── Constraint card ──────────────────────────────────────────────────────────

function ConstraintCard({ constraint }: { constraint: Constraint }) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
      <div className="mb-1 flex items-center gap-2">
        <Shield className="h-4 w-4 text-amber-400" />
        <h4 className="text-sm font-semibold text-foreground/90">{constraint.constraint}</h4>
      </div>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Operational consequence</dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-foreground/75">{constraint.operationalConsequence}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Best mitigation</dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-foreground/75">{constraint.bestMitigation}</dd>
        </div>
      </dl>
    </div>
  );
}

// ─── Predicted cycle view ─────────────────────────────────────────────────────

function PredictedCycleView({ cycle }: { cycle: Comparison["predictedCycle"] }) {
  const phases = [
    { label: "Ignition", text: cycle.ignition },
    { label: "Genius", text: cycle.translation },
    { label: "Execution", text: cycle.execution },
    { label: "Expansion", text: cycle.expansion },
    { label: "Preservation", text: cycle.preservation },
  ];

  return (
    <div className="space-y-4">
      {/* Phase flow */}
      <div className="flex flex-wrap items-center gap-2">
        {phases.map((p, i) => (
          <div key={p.label} className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
              {p.label}
            </span>
            {i < phases.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
            )}
          </div>
        ))}
      </div>

      {/* Phase details */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {phases.map((p) => (
          <div key={p.label} className="rounded-xl border border-border/60 bg-card/40 p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.label}</div>
            <p className="text-sm leading-relaxed text-foreground/80">{p.text}</p>
          </div>
        ))}
      </div>

      {/* Accelerator / stall / handoff */}
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Natural Accelerator</span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/75">{cycle.naturalAccelerator}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">Natural Stall</span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/75">{cycle.naturalStall}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Handoff Protocol</span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/75">{cycle.handoff}</p>
        </div>
      </div>
    </div>
  );
}
