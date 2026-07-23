import { RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import { useReading } from "@/hooks/useReading";
import BirthDataForm from "@/components/features/BirthDataForm";
import NatalChartSummary from "@/components/features/NatalChartSummary";
import BlueprintReport from "@/components/features/BlueprintReport";
import SaveChartButton from "@/components/features/SaveChartButton";
import { Button } from "@/components/common/Button";
import { exportReadingPdf } from "@/lib/pdf";

export default function BlueprintPage() {
  const { reading, generate, reset, blueprintPremium, unlockBlueprint, unlockBundle } = useReading();
  const premium = blueprintPremium;

  if (!reading) {
    return (
      <div className="container max-w-2xl py-16">
        <div className="mb-12 text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
            Blueprint Report
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            Your nine functions, decoded
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg mx-auto">
            A complete exploration of your personal blueprint, revealing the core patterns,
            strengths, and themes that shape how you think, create, relate, and build your life.
            One insight per function, free. The complete multi-paragraph reading for every planet
            unlocks with the full blueprint.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            {[
              { n: "9", label: "Functions decoded" },
              { n: "Free", label: "Preview reading" },
              { n: "$44", label: "Full blueprint" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card/40 p-3">
                <p className="font-serif text-xl font-semibold text-primary">{s.n}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <BirthDataForm onGenerate={generate} />
      </div>
    );
  }

  const chartName = reading.chart.input.name
    ? `${reading.chart.input.name} — Blueprint`
    : "Blueprint Report";

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-xs uppercase tracking-widest text-accent">Blueprint Report</div>
          <h1 className="mt-1 font-serif text-3xl font-semibold truncate">
            {reading.chart.input.name ? `${reading.chart.input.name}'s Blueprint` : "Your Blueprint"}
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
            onClick={() => { exportReadingPdf(reading, premium); toast.success("PDF exported"); }}
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
        <BlueprintReport
          reading={reading}
          premium={premium}
          onUnlock={unlockBlueprint}
          onBundle={unlockBundle}
        />
      </div>
    </div>
  );
}
