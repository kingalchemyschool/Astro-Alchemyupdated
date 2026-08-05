import { useEffect, useRef, useState } from "react";
import { Flame, RefreshCw } from "lucide-react";
import { useReading } from "@/hooks/useReading";
import { computeTransits, todayDateString, type TransitLocation } from "@/lib/transits";
import ForgePaywall from "@/components/features/DailyForge/ForgePaywall";
import ForgeReport from "@/components/features/DailyForge/ForgeReport";
import ChartSwitcher from "@/components/features/DailyForge/ChartSwitcher";
import DailyForgeSurface from "@/components/features/DailyForge/DailyForgeSurface";
import type { ForgeReport as ForgeReportType } from "@/types/forge";
import type { BirthInput } from "@/types/astro";
import { getTimezoneOffset } from "@/lib/timezone";

const FORGE_TOKEN_KEY = "astral_forge_token_forge";
const FORGE_REPORT_CACHE_KEY = "astral_forge_daily_report_v13";

interface CachedReport {
  date: string;
  zodiac: string;    // "tropical" | "sidereal" — cache is per-zodiac
  chartKey: string;  // fingerprint of natal sun+moon+asc so different charts don't share a slot
  locationMode: "birth" | "current";
  report: ForgeReportType;
}

/** Stable fingerprint that distinguishes two different natal charts. */
function chartFingerprint(chart: import("@/types/astro").NatalChart): string {
  const sun = chart.positions.sun;
  const moon = chart.positions.moon;
  const asc = chart.ascendant;
  return [
    sun.longitude.toFixed(6),
    moon.longitude.toFixed(6),
    asc.longitude.toFixed(6),
    chart.zodiac,
  ].join(":");
}

export default function DailyForgePage() {
  const { reading, generate, forgePremium, unlockForge } = useReading();
  const [report, setReport] = useState<ForgeReportType | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<"birth" | "current">("birth");
  const [currentLocation, setCurrentLocation] = useState<TransitLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "ready" | "denied">("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Capture the report day once for the whole cache/request cycle. This keeps
  // the displayed date, transit ephemeris date, and server cache key aligned
  // even if the browser crosses midnight while the page is open.
  const [today] = useState(todayDateString);
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
        if (locationMode === "birth" && entry.date === today && entry.zodiac === zodiac && entry.chartKey === chartKey && entry.locationMode === "birth") {
          setReport(entry.report);
          setCached(true);
        } else {
          localStorage.removeItem(FORGE_REPORT_CACHE_KEY);
        }
      }
    } catch {
      // ignore
    }
  }, [today, reading, locationMode]);

  // Fetch report when we have a chart and a token
  useEffect(() => {
    if (!forgePremium || !reading || report || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchReport();
  }, [forgePremium, reading]);

  async function fetchReport(
    requestMode: "birth" | "current" = locationMode,
    locationOverride = requestMode === "current" ? currentLocation : null,
  ) {
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
      if (requestMode === "current" && !locationOverride) {
        setError("Choose your current location before generating this report.");
        setLoading(false);
        return;
      }
      const transitData = computeTransits(reading.chart, zodiac, today, locationOverride ?? undefined);

      const natalPositions: Record<string, any> = {};
      for (const [key, pos] of Object.entries(reading.chart.positions)) {
        natalPositions[key] = {
          signIndex: pos.signIndex,
          degree: pos.degree,
          minute: pos.minute,
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
          minute: pos.minute,
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
          zodiac: transitData.zodiac,
          location: transitData.location,
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

      if (requestMode === "birth") {
        localStorage.setItem(FORGE_REPORT_CACHE_KEY, JSON.stringify({
          date: today,
          zodiac,
          chartKey: chartFingerprint(reading.chart),
          locationMode: requestMode,
          report: fetched,
        }));
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clearReportState() {
    localStorage.removeItem(FORGE_REPORT_CACHE_KEY);
    setReport(null);
    setCached(false);
    setError(null);
    fetchedRef.current = true;
  }

  function handleBirthLocation() {
    setLocationMode("birth");
    setCurrentLocation(null);
    setLocationStatus("idle");
    setLocationError(null);
    clearReportState();
    fetchReport("birth", null);
  }

  function handleCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setLocationError("Your browser does not provide location access. Birth location will remain active.");
      return;
    }

    setLocationStatus("requesting");
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const location: TransitLocation = {
          label: "Current location",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          tz: getTimezoneOffset(timeZone, today, "12:00"),
          tzName: timeZone,
        };
        setLocationMode("current");
        setCurrentLocation(location);
        setLocationStatus("ready");
        clearReportState();
        fetchReport("current", location);
      },
      (positionError) => {
        setLocationStatus("denied");
        setLocationError(
          positionError.code === positionError.PERMISSION_DENIED
            ? "Location access was declined. Birth location remains active."
            : "Unable to determine your current location. Birth location remains active.",
        );
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 10000 },
    );
  }

  async function handleRefresh() {
    localStorage.removeItem(FORGE_REPORT_CACHE_KEY);
    setReport(null);
    setCached(false);
    fetchedRef.current = false;
    await fetchReport(locationMode);
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
          <TransitLocationPicker
            mode={locationMode}
            location={currentLocation}
            status={locationStatus}
            error={locationError}
            onBirthLocation={handleBirthLocation}
            onCurrentLocation={handleCurrentLocation}
          />
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
          <TransitLocationPicker
            mode={locationMode}
            location={currentLocation}
            status={locationStatus}
            error={locationError}
            onBirthLocation={handleBirthLocation}
            onCurrentLocation={handleCurrentLocation}
          />
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
        <div className="mb-5">
          <TransitLocationPicker
            mode={locationMode}
            location={currentLocation}
            status={locationStatus}
            error={locationError}
            onBirthLocation={handleBirthLocation}
            onCurrentLocation={handleCurrentLocation}
          />
        </div>

        <div className="mb-5 flex justify-end">
          <button
            onClick={handleRefresh}
            title="Refresh report"
            className="flex items-center gap-1.5 rounded-lg border border-[#3B4B8C]/40 bg-transparent px-3 py-1.5 text-xs text-[#6B7A99] transition-colors hover:border-[#8B9EE8]/40 hover:text-[#8B9EE8]"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh sky
          </button>
        </div>

        <DailyForgeSurface
          reading={reading}
          report={report}
          cached={cached}
          zodiac={activeZodiac}
          today={today}
          locationMode={locationMode}
          currentLocation={currentLocation}
          onToggleZodiac={handleToggleZodiac}
          transitLocationLabel={locationMode === "current" ? "Current location" : reading.chart.input.place}
        />
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

function TransitLocationPicker({
  mode,
  location,
  status,
  error,
  onBirthLocation,
  onCurrentLocation,
}: {
  mode: "birth" | "current";
  location: TransitLocation | null;
  status: "idle" | "requesting" | "ready" | "denied";
  error: string | null;
  onBirthLocation: () => void;
  onCurrentLocation: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#1E2640]/80 bg-[#070A15] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-[#8B9EE8]">
            Transit Location
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#6B7A99]">
            Use your current location for today’s houses and local sky, while your natal blueprint stays anchored to your birth data.
          </p>
        </div>
        {status === "requesting" && (
          <span className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-[#8B9EE8]">
            Locating…
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onBirthLocation}
          className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
            mode === "birth"
              ? "border-[#8B9EE8]/40 bg-[#3B4B8C]/15 text-[#E8E4D8]"
              : "border-[#1E2640]/70 text-[#6B7A99] hover:border-[#3B4B8C]/50 hover:text-[#A8B4D4]"
          }`}
        >
          Birth location
        </button>
        <button
          type="button"
          onClick={onCurrentLocation}
          disabled={status === "requesting"}
          className={`rounded-lg border px-3 py-2 text-xs transition-colors disabled:cursor-wait disabled:opacity-60 ${
            mode === "current"
              ? "border-[#8B9EE8]/40 bg-[#3B4B8C]/15 text-[#E8E4D8]"
              : "border-[#1E2640]/70 text-[#6B7A99] hover:border-[#3B4B8C]/50 hover:text-[#A8B4D4]"
          }`}
        >
          Current location
        </button>
      </div>
      {mode === "current" && location && (
        <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[#4A5470]">
          Using browser coordinates · {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
        </p>
      )}
      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}
    </div>
  );
}
