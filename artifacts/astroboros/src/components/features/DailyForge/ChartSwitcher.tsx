import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { ChevronDown, ChevronUp, Check, Loader2, Plus, User } from "lucide-react";
import { fetchSavedCharts, type SavedChart } from "@/lib/savedCharts";
import type { Reading } from "@/types/astro";
import type { BirthInput } from "@/types/astro";

interface Props {
  reading: Reading;
  onSwitch: (input: BirthInput) => void;
}

export default function ChartSwitcher({ reading, onSwitch }: Props) {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [clerkTimedOut, setClerkTimedOut] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const clerkReady = clerkLoaded || clerkTimedOut;

  // Clerk can time out in dev behind the Replit proxy
  useEffect(() => {
    if (clerkLoaded) return;
    const t = setTimeout(() => setClerkTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [clerkLoaded]);

  // Fetch saved charts when the panel opens and user is signed in
  useEffect(() => {
    if (!open || !clerkReady || !isSignedIn) return;
    setLoadingCharts(true);
    fetchSavedCharts()
      .then(setCharts)
      .catch(() => setCharts([]))
      .finally(() => setLoadingCharts(false));
  }, [open, clerkReady, isSignedIn]);

  const input = reading.chart.input;
  const activeZodiac = reading.chart.zodiac ?? "tropical";
  const activeName = input.name || "Unnamed Blueprint";
  const activeDate = input.date
    ? new Date(input.date + "T12:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "";
  const activePlace = (input as any).place || (input as any).city || "";

  function handleActivate(chart: SavedChart) {
    setSwitching(chart.id);
    onSwitch(chart.birthInput as unknown as BirthInput);
    setOpen(false);
    setSwitching(null);
  }

  return (
    <div className="rounded-2xl border border-[#1E2640]/80 bg-[#070A15] overflow-hidden">
      {/* Current blueprint row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#0D1220] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 rounded-full border border-[#3B4B8C]/50 bg-[#3B4B8C]/15 flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-[#8B9EE8]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-[#C4CADC] truncate">{activeName}</p>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase border ${
                activeZodiac === "sidereal"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-[#8B9EE8]/30 bg-[#3B4B8C]/15 text-[#8B9EE8]"
              }`}>
                {activeZodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"}
              </span>
            </div>
            {(activeDate || activePlace) && (
              <p className="text-[11px] text-[#4A5470] mt-0.5 truncate">
                {activeDate}{activeDate && activePlace ? " · " : ""}{activePlace}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#4A5470]">
            Switch Blueprint
          </span>
          {open
            ? <ChevronUp className="h-3.5 w-3.5 text-[#6B7A99]" />
            : <ChevronDown className="h-3.5 w-3.5 text-[#6B7A99]" />
          }
        </div>
      </button>

      {/* Expandable panel */}
      {open && (
        <div className="border-t border-[#1E2640]/60 px-5 pb-5 pt-4">
          {!clerkReady ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[#6B7A99]" />
            </div>
          ) : !isSignedIn ? (
            /* Signed out */
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-[#6B7A99]">
                Sign in to access your saved blueprints and switch between charts.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  to="/sign-in"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#3B4B8C]/40 bg-[#3B4B8C]/10 px-4 py-2 text-xs font-semibold text-[#8B9EE8] hover:bg-[#3B4B8C]/20 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/reading"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2640]/60 px-4 py-2 text-xs text-[#6B7A99] hover:text-[#9AA3B8] transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  New Blueprint
                </Link>
              </div>
            </div>
          ) : loadingCharts ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[#6B7A99]" />
            </div>
          ) : charts.length === 0 ? (
            /* Signed in, no saved charts */
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-[#6B7A99]">
                No saved blueprints yet. Generate a chart and save it to switch here.
              </p>
              <Link
                to="/reading"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#3B4B8C]/40 bg-[#3B4B8C]/10 px-4 py-2 text-xs font-semibold text-[#8B9EE8] hover:bg-[#3B4B8C]/20 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Generate New Blueprint
              </Link>
            </div>
          ) : (
            /* Saved chart list */
            <div className="space-y-2">
              {charts.map((chart) => {
                const ci = chart.birthInput as any;
                const isActive =
                  chart.name === activeName &&
                  (ci?.date ?? "") === ((input as any)?.date ?? "");
                const chartDate = ci?.date
                  ? new Date(ci.date + "T12:00:00").toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })
                  : "";
                const chartPlace = ci?.place || ci?.city || "";

                const chartZodiac = (ci?.zodiac as string) ?? "tropical";

                return (
                  <button
                    key={chart.id}
                    onClick={() => handleActivate(chart)}
                    disabled={isActive || switching === chart.id}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-[#8B9EE8]/30 bg-[#3B4B8C]/12 cursor-default"
                        : "border-[#1E2640]/60 bg-[#070A15] hover:border-[#3B4B8C]/40 hover:bg-[#0D1220]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-[#E8E4D8]" : "text-[#A8B4D4]"}`}>
                          {chart.name}
                        </p>
                        <span className={`flex-shrink-0 rounded-full px-1.5 py-0 text-[9px] font-mono tracking-wider uppercase border ${
                          chartZodiac === "sidereal"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-[#3B4B8C]/40 bg-[#3B4B8C]/10 text-[#6B7A99]"
                        }`}>
                          {chartZodiac === "sidereal" ? "Sidereal" : "Tropical"}
                        </span>
                      </div>
                      {(chartDate || chartPlace) && (
                        <p className="text-[11px] text-[#4A5470] mt-0.5 truncate">
                          {chartDate}{chartDate && chartPlace ? " · " : ""}{chartPlace}
                        </p>
                      )}
                    </div>
                    {isActive ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-[#8B9EE8]" />
                        <span className="text-[10px] font-mono tracking-widest uppercase text-[#8B9EE8]">Active</span>
                      </div>
                    ) : switching === chart.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6B7A99] flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] font-mono tracking-widest uppercase text-[#3B4B6C] group-hover:text-[#6B7A99] flex-shrink-0">
                        Use
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Generate new */}
              <div className="pt-1">
                <Link
                  to="/reading"
                  className="flex items-center gap-2 rounded-xl border border-dashed border-[#1E2640]/60 px-4 py-3 text-sm text-[#4A5470] hover:border-[#3B4B8C]/40 hover:text-[#6B7A99] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Generate New Blueprint
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
