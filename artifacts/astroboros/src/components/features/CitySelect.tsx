import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import type { GeoLocation } from "@/types/astro";
import { cn } from "@/lib/utils";

interface Props {
  value: GeoLocation | null;
  onChange: (loc: GeoLocation) => void;
}

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string; // state / region
  admin2?: string; // county / district
}

function labelFor(r: GeoResult): string {
  return [r.name, r.admin1, r.country].filter(Boolean).join(", ");
}

// Live geocoding search (Open-Meteo, no key required) — any city or town
// worldwide is searchable, including small towns. Each result carries its IANA
// timezone, which drives the DST-accurate chart calculation.
export default function CitySelect({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Debounced geocoding lookup
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            q
          )}&count=10&language=en&format=json`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        setResults(Array.isArray(data?.results) ? data.results : []);
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  const select = (r: GeoResult) => {
    onChange({
      name: labelFor(r),
      lat: r.latitude,
      lon: r.longitude,
      tzName: r.timezone || "UTC",
    });
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0 && results[active]) {
      e.preventDefault();
      select(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && (query.trim().length >= 2 || results.length > 0);

  return (
    <div className="relative" ref={ref}>
      {value && !open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setQuery("");
          }}
          className="flex w-full items-center justify-between rounded-md border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/50"
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate">{value.name}</span>
          </span>
          <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
            Change
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-input bg-background/60 px-3 py-2.5 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus={open}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search any city or town…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
          {!loading && query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {showList && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
          <ul className="max-h-64 overflow-auto py-1" role="listbox">
            {loading && results.length === 0 && (
              <li className="px-3 py-3 text-sm text-muted-foreground">Searching…</li>
            )}
            {!loading && results.length === 0 && query.trim().length >= 2 && (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No match. Try a nearby larger town, or enter exact coordinates.
              </li>
            )}
            {results.map((r, i) => (
              <li key={r.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => select(r)}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors",
                    i === active
                      ? "bg-secondary/60 text-primary"
                      : "text-foreground/90 hover:bg-secondary/40"
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.name}</span>
                    <span className="block truncate font-mono text-xs text-muted-foreground">
                      {[r.admin1, r.country].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
