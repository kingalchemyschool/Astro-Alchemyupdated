import { useEffect, useRef, useState } from "react";
import { Flame, RefreshCw } from "lucide-react";
import { useReading } from "@/hooks/useReading";
import { computeTransits, todayDateString } from "@/lib/transits";
import ForgePaywall from "@/components/features/DailyForge/ForgePaywall";
import ForgeReport from "@/components/features/DailyForge/ForgeReport";
import ChartSwitcher from "@/components/features/DailyForge/ChartSwitcher";
import type { ForgeReport as ForgeReportType } from "@/types/forge";
import type { BirthInput } from "@/types/astro";

const FORGE_TOKEN_KEY = "astral_forge_token_forge";
const FORGE_REPORT_CACHE_KEY = "astral_forge_daily_report_v2";

interface CachedReport {
  date: string;
  zodiac: string;    // "tropical" | "sidereal" — cache is per-zodiac
  chartKey: string;  // fingerprint of natal sun+moon+asc so different charts don't share a slot
  report: ForgeReportType;
}

/** Stable fingerprint that distinguishes two different natal charts. */
function chartFingerprint(chart: import("@/types/astro").NatalChart): string {
  const sun = chart.positions.sun;
  const moon = chart.positions.moon;
  const asc = chart.ascendant;
  return `${sun.signIndex}.${sun.degree}:${moon.signIndex}.${moon.degree}:${asc.signIndex}`;
}

export default function DailyForgePage() {
  const { reading, generate, forgePremium, unlockForge } = useReading();
  const [report, setReport] = useState<ForgeReportType | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const today = todayDateString();
  // The reading's chart is regenerated in the active system on toggle, so this
  // is THE single source of truth for the zodiac displayed, transits computed,
  // and zodiac reported to the server. No separate transit-only state.
  const activeZodiac: "tropical" | "sidereal" = reading?.chart.zodiac ?? "tropical";

  // Try to restore a cached report from localStorage
  useEffect(() => {
    if (!reading) return; // wait until chart is loaded — fingerprint requires it
    const zodiac = reading.chart.zodiac;
    const chartKey = chartFingerprint(reading.chart);
    try {
      const raw = localStorage.getItem(FORGE_REPORT_CACHE_KEY);
      if (raw) {
        const entry = JSON.parse(raw) as CachedReport;
        // Invalidate if date, zodiac, or chart identity changed
        if (entry.date === today && entry.zodiac === zodiac && entry.chartKey === chartKey) {
          setReport(entry.report);
          setCached(true);
        } else {
          localStorage.removeItem(FORGE_REPORT_CACHE_KEY);
        }
      }
    } catch {
      // ignore
    }
  }, [today, reading]);

  // Fetch report when we have a chart and a token
  useEffect(() => {
    if (!forgePremium || !reading || report || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchReport();
  }, [forgePremium, reading]);

  async function fetchReport() {
    if (!reading) return;
    setLoading(true);
    setError(null);

    // Single source of truth: the natal chart's zodiac is the active zodiac
    // for everything (transit computation, request body, cache key). The
    // chart was regenerated to match when the user toggled, so the natal
    // positions and transit positions are guaranteed to be in the same system.
    const zodiac = reading.chart.zodiac;

    try {
      const token = localStorage.getItem(FORGE_TOKEN_KEY);
      if (!token) {
        setError("Subscription token not found. Please refresh the page.");
        setLoading(false);
        return;
      }

      // Keep the transit system explicitly tied to the displayed natal chart.
      // This prevents a sidereal chart from ever being paired with tropical
      // transit positions (or vice versa).
      const transitData = computeTransits(reading.chart, zodiac, today);

      const natalPositions: Record<string, any> = {};
      for (const [key, pos] of Object.entries(reading.chart.positions)) {
        natalPositions[key] = {
          signIndex: pos.signIndex,
          degree: pos.degree,
          house: pos.house,
          retrograde: pos.retrograde,
          longitude: pos.longitude,
        };
      }

      const transitPositions: Record<string, any> = {};
      for (const [key, pos] of Object.entries(transitData.positions)) {
        transitPositions[key] = {
          signIndex: pos.signIndex,
          degree: pos.degree,
          house: pos.house,
          retrograde: pos.retrograde,
          longitude: pos.longitude,
        };
      }

      const body = {
        token,
        zodiac, // explicit so server can cross-check that everything is consistent
        natal: {
          name: reading.chart.input.name,
          positions: natalPositions,
          ascendant: {
            signIndex: reading.chart.ascendant.signIndex,
            degree: reading.chart.ascendant.degree,
          },
          zodiac,
        },
        transits: {
          date: transitData.date,
          positions: transitPositions,
          aspects: transitData.aspects,
          zodiac,
        },
      };

      const res = await fetch("/api/daily-forge/report", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to generate your Daily Forge report.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const fetched: ForgeReportType = data.report;
      setReport(fetched);
      setCached(data.cached === true);

      localStorage.setItem(FORGE_REPORT_CACHE_KEY, JSON.stringify({ date: today, zodiac, chartKey: chartFingerprint(reading.chart), report: fetched }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    localStorage.removeItem(FORGE_REPORT_CACHE_KEY);
    setReport(null);
    setCached(false);
    fetchedRef.current = false;
    await fetchReport();
  }

  /** Toggle between sidereal and tropical — regenerates the entire chart+reading
   *  in the new system (in-memory only), so natal positions and the subsequent
   *  transit computation are guaranteed to be in the same system. The persisted
   *  birth input in localStorage keeps the user's original preferred zodiac. */
  function handleToggleZodiac() {
    if (!reading) return;
    const current = reading.chart.zodiac;
    const next: "tropical" | "sidereal" = current === "sidereal" ? "tropical" : "sidereal";
    generate(reading.chart.input, next); // rebuilds the chart+reading in new system
    localStorage.removeItem(FORGE_REPORT_CACHE_KEY);
    setReport(null);
    setCached(false);
    setError(null);
    fetchedRef.current = false;
    // The useEffect watching `reading` will trigger fetchReport once the
    // chart has been regenerated in the new system.
  }

  /** Switch to a different saved chart — clears the cached report and re-fetches
   *  in the new chart's stored zodiac. */
  function handleSwitchChart(input: BirthInput) {
    generate(input);
    localStorage.removeItem(FORGE_REPORT_CACHE_KEY);
    setReport(null);
    setCached(false);
    setError(null);
    fetchedRef.current = false;
    // fetchReport will be triggered by the useEffect watching `reading`
  }

  // ── No chart yet ────────────────────────────────────────────────────────────
  if (!reading && !forgePremium) {
    return (
      <PageShell>
        <ForgePaywall onSubscribe={unlockForge} noChart />
      </PageShell>
    );
  }

  // ── Not subscribed ──────────────────────────────────────────────────────────
  if (!forgePremium) {
    return (
      <PageShell>
        <ForgePaywall onSubscribe={unlockForge} />
      </PageShell>
    );
  }

  // ── Subscribed, no chart ────────────────────────────────────────────────────
  if (!reading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg rounded-2xl border border-[#3B4B8C]/40 bg-[#0A0D1A] p-8 text-center">
          <Flame className="mx-auto mb-4 h-10 w-10 text-[#8B9EE8]" />
          <h2 className="font-serif text-xl font-semibold text-[#E8E4D8]">Blueprint Required</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6B7A99]">
            Your Daily Forge subscription is active. Generate your natal blueprint first
            so we can calibrate today's transit report to your personal design.
          </p>
          <a
            href="/reading"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3B4B8C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A5BA0]"
          >
            Generate Your Blueprint
          </a>
        </div>
      </PageShell>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Chart switcher stays visible during loading */}
          <ChartSwitcher reading={reading} onSwitch={handleSwitchChart} />
          <div className="rounded-2xl border border-[#3B4B8C]/40 bg-[#080B18] p-12 text-center">
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <Flame className="h-8 w-8 text-[#8B9EE8] animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-[#8B9EE8]/30 animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <p className="font-serif text-lg text-[#E8E4D8]">Calibrating today's transits…</p>
            <p className="mt-2 text-sm text-[#6B7A99]">
              Comparing the current sky against your natal blueprint
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl space-y-4">
          <ChartSwitcher reading={reading} onSwitch={handleSwitchChart} />
          <div className="rounded-2xl border border-red-900/40 bg-[#0A0D1A] p-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => { fetchedRef.current = false; fetchReport(); }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3B4B8C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4A5BA0] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  if (report) {
    return (
      <PageShell>
        {/* Page header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B9EE8]">
            Daily Forge
          </p>
          <button
            onClick={handleRefresh}
            title="Refresh report"
            className="flex items-center gap-1.5 rounded-lg border border-[#3B4B8C]/40 bg-transparent px-3 py-1.5 text-xs text-[#6B7A99] transition-colors hover:text-[#8B9EE8] hover:border-[#8B9EE8]/40"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        {/* Blueprint switcher — always visible above the report */}
        <div className="mb-5">
          <ChartSwitcher reading={reading} onSwitch={handleSwitchChart} />
        </div>

        <ForgeReport report={report} cached={cached} zodiac={activeZodiac} onToggleZodiac={handleToggleZodiac} />
      </PageShell>
    );
  }

  // Fallback
  return (
    <PageShell>
      <div className="text-center text-[#6B7A99] text-sm py-12">
        Preparing your forge…
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060914] px-4 py-12">
      <div className="container max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
}
