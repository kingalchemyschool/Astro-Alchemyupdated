import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Loader2, Sparkles, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Reading } from "@/types/astro";
import { loadBlueprint } from "@/lib/blueprints";
import { computeChart } from "@/lib/ephemeris";
import { generateReading } from "@/lib/reading";
import ReportView from "@/components/features/ReportView";
import { Button } from "@/components/common/Button";
import { exportReadingPdf } from "@/lib/pdf";

type Status = "loading" | "ready" | "notfound";

export default function Blueprint() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [reading, setReading] = useState<Reading | null>(null);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) {
        setStatus("notfound");
        return;
      }
      try {
        const bp = await loadBlueprint(id);
        if (!active) return;
        if (!bp) {
          setStatus("notfound");
          return;
        }
        setReading(generateReading(computeChart(bp.birth_input)));
        setPremium(bp.is_premium);
        setStatus("ready");
      } catch {
        if (active) setStatus("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Reconstructing this creation blueprint…</p>
      </div>
    );
  }

  if (status === "notfound" || !reading) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-semibold">Blueprint not found</h1>
        <p className="max-w-md text-muted-foreground">
          This shared link is invalid or has been removed. You can build your own
          blueprint instead.
        </p>
        <Link to="/reading">
          <Button size="lg">Build my blueprint</Button>
        </Link>
      </div>
    );
  }

  const { chart } = reading;
  const name = chart.input.name;

  const handlePdf = () => {
    exportReadingPdf(reading, premium);
    toast.success("PDF exported");
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-accent">
            Shared Creation Blueprint
          </div>
          <h1 className="mt-1 font-serif text-4xl font-semibold">
            {name ? `${name}'s Reading` : "Shared Reading"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {chart.input.place} · {chart.input.date} · {chart.input.time}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePdf}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Link to="/reading">
            <Button variant="secondary" size="sm">
              <Sparkles className="h-4 w-4" /> Create your own
            </Button>
          </Link>
        </div>
      </div>

      <ReportView reading={reading} premium={premium} />
    </div>
  );
}
