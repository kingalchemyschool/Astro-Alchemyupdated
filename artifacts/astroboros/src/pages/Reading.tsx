import { useState } from "react";
import { RotateCcw, Share2, Download, Loader2, BookMarked } from "lucide-react";
import { Show } from "@clerk/react";
import { toast } from "sonner";
import { useReading } from "@/hooks/useReading";
import BirthDataForm from "@/components/features/BirthDataForm";
import ReportView from "@/components/features/ReportView";
import { Button } from "@/components/common/Button";
import { saveBlueprint } from "@/lib/blueprints";
import { exportReadingPdf } from "@/lib/pdf";
import { saveChart } from "@/lib/savedCharts";

export default function Reading() {
  const { reading, generate, reset, premium, unlockPremium } = useReading();
  const [saving, setSaving] = useState(false);

  if (!reading) {
    return (
      <div className="container max-w-2xl py-16">
        {/* Intro — what a blueprint is */}
        <div className="mb-12 text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
            Creation Blueprint
          </div>
          <h1 className="font-serif text-4xl font-semibold leading-tight">
            Every person creates differently
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Your natal chart is not a personality profile — it is a blueprint. It maps the
            nine functions you were born with, how they relate to each other, and the specific
            creative process that emerges from their combination. No two blueprints are
            identical. Yours describes exactly how you initiate, refine, communicate, and
            build — and where the friction in that process lives. Enter your birth data
            below to generate yours.
          </p>
        </div>
        <BirthDataForm onGenerate={generate} />
      </div>
    );
  }

  const { chart } = reading;
  const name = chart.input.name;

  const handleShare = async () => {
    setSaving(true);
    try {
      const id = await saveBlueprint(chart.input, premium);
      const url = `${window.location.origin}/blueprint/${id}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Shareable link copied to clipboard", { description: url });
      } catch {
        toast.success("Blueprint saved", { description: url });
      }
    } catch (e) {
      toast.error("Could not save blueprint", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePdf = () => {
    exportReadingPdf(reading, premium);
    toast.success("PDF exported");
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-accent">
            Creation Blueprint
          </div>
          <h1 className="mt-1 font-serif text-4xl font-semibold">
            {name ? `${name}'s Reading` : "Your Reading"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {chart.input.place} · {chart.input.date} · {chart.input.time}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Show when="signed-in">
            <button
              onClick={async () => {
                try {
                  await saveChart(reading.chart.input.name || "My Blueprint", reading.chart.input as any);
                  toast.success("Blueprint saved to your account");
                } catch {
                  toast.error("Could not save blueprint");
                }
              }}
              className="flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <BookMarked className="h-4 w-4" />
              Save Blueprint
            </button>
          </Show>
          <Button variant="secondary" size="sm" onClick={handleShare} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Save &amp; Share
          </Button>
          <Button variant="outline" size="sm" onClick={handlePdf}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> New chart
          </Button>
        </div>
      </div>

      <ReportView reading={reading} premium={premium} onUnlock={unlockPremium} />
    </div>
  );
}
