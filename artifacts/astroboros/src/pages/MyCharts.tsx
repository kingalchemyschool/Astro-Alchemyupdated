import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { Loader2, BookMarked, Trash2, ExternalLink } from "lucide-react";
import { fetchSavedCharts, deleteChart, type SavedChart } from "@/lib/savedCharts";
import { toast } from "sonner";

const READING_KEY = "astral_forge_reading";

export default function MyCharts() {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const [, navigate] = useLocation();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  // In dev, Clerk never resolves through the Replit proxy — treat as signed-out
  // after 3 s so the page doesn't spin forever.
  const [timedOut, setTimedOut] = useState(false);
  const isLoaded = clerkLoaded || timedOut;

  useEffect(() => {
    if (clerkLoaded) return;
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [clerkLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }

    fetchSavedCharts()
      .then(setCharts)
      .catch(() => toast.error("Could not load your blueprints"))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  async function handleDelete(id: string) {
    await deleteChart(id);
    setCharts((prev) => prev.filter((c) => c.id !== id));
    toast.success("Blueprint removed");
  }

  function handleView(chart: SavedChart) {
    // Write birth input back to localStorage so the report page re-generates it
    try {
      localStorage.setItem(READING_KEY, JSON.stringify(chart.birthInput));
    } catch {
      // ignore
    }
    navigate("/reports/blueprint");
  }

  // ── Not loaded yet ──────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Signed out ──────────────────────────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-md text-center py-24">
          <BookMarked className="mx-auto h-12 w-12 text-muted-foreground mb-6" />
          <h1 className="font-serif text-3xl font-semibold mb-4">My Blueprints</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to save and access your natal chart readings across any device.
          </p>
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            Sign in to view blueprints
          </Link>
        </div>
      </div>
    );
  }

  // ── Signed in ───────────────────────────────────────────────────────────────
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-semibold mb-2">My Blueprints</h1>
          <p className="text-muted-foreground">Your saved natal chart readings.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : charts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
            <BookMarked className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-lg font-serif font-medium mb-2">No saved blueprints yet</p>
            <p className="text-sm text-muted-foreground mb-8">
              Generate a reading on any report page and click "Save chart" to build your collection.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/reports/blueprint"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Blueprint Report
              </Link>
              <Link
                to="/reports/archetype"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-card transition-colors"
              >
                Archetype Report
              </Link>
              <Link
                to="/reports/wealth"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-card transition-colors"
              >
                Wealth Blueprint
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {charts.map((chart) => {
              const input = chart.birthInput as any;
              const date = input?.date
                ? new Date(input.date).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })
                : "Unknown date";
              const place = input?.place || input?.city || "";

              return (
                <div
                  key={chart.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/50 px-6 py-5"
                >
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-medium truncate">{chart.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {date}{place ? ` · ${place}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleView(chart)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(chart.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-900/40 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
