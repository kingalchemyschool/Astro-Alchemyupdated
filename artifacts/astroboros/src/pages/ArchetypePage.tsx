import { RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import { useReading } from "@/hooks/useReading";
import BirthDataForm from "@/components/features/BirthDataForm";
import NatalChartSummary from "@/components/features/NatalChartSummary";
import ArchetypeReport from "@/components/features/ArchetypeReport";
import SaveChartButton from "@/components/features/SaveChartButton";
import { Button } from "@/components/common/Button";
import { exportReadingPdf } from "@/lib/pdf";

export default function ArchetypePage() {
  const { reading, generate, reset, archetypePremium, unlockArchetype } = useReading();

  if (!reading) {
    return (
      <div className="container max-w-2xl py-16">
        <div className="mb-12 text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
            Archetype Report
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            Six functions. Six archetypes.
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg mx-auto">
            A personalized exploration of your unique archetypal signature. Discover the
            qualities, themes, and creative patterns that define your expression and reveal
            the deeper nature of how you move through the world.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            {[
              { n: "6", label: "Functions decoded" },
              { n: "Deep", label: "7-section readings" },
              { n: "$9", label: "Full report" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card/40 p-3">
                <p className="font-serif text-xl font-semibold text-primary">{s.n}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-2 max-w-sm mx-auto text-left">
            {[
              { fn: "Message", desc: "Moon + Mercury — how perception becomes signal" },
              { fn: "Execution", desc: "Mercury + Mars — how signal becomes force" },
              { fn: "Discipline", desc: "Mars + Saturn — how force becomes structure" },
              { fn: "Mastery", desc: "Saturn + Jupiter — how structure becomes authority" },
              { fn: "Cultivation", desc: "Jupiter + Venus — how authority becomes value" },
              { fn: "Integration", desc: "Venus + Moon — how value becomes wisdom" },
            ].map((f) => (
              <div key={f.fn} className="flex items-baseline gap-2 text-sm">
                <span className="font-semibold text-foreground/80 w-24 shrink-0">{f.fn}</span>
                <span className="text-muted-foreground text-xs">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <BirthDataForm onGenerate={generate} />
      </div>
    );
  }

  const chartName = reading.chart.input.name
    ? `${reading.chart.input.name} — Archetypes`
    : "Archetype Report";

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-xs uppercase tracking-widest text-accent">Archetype Report</div>
          <h1 className="mt-1 font-serif text-3xl font-semibold truncate">
            {reading.chart.input.name ? `${reading.chart.input.name}'s Archetypes` : "Your Archetypes"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {reading.chart.input.place} · {reading.chart.input.date}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SaveChartButton
            key={reading.chart.input.date + reading.chart.input.place}
            name={chartName}
            birthInput={reading.chart.input as unknown as Record<string, unknown>}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { exportReadingPdf(reading, true); toast.success("PDF exported"); }}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> New reading
          </Button>
        </div>
      </div>
      <NatalChartSummary chart={reading.chart} />
      <div className="mt-10">
        <ArchetypeReport reading={reading} premium={archetypePremium} onUnlock={unlockArchetype} />
      </div>
    </div>
  );
}
