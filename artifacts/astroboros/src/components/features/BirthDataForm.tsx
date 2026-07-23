import { useState, useCallback } from "react";
import { Compass, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { BirthInput, GeoLocation } from "@/types/astro";
import { TZ_OPTIONS } from "@/constants/astro";
import { getTimezoneOffset } from "@/lib/timezone";
import { Button } from "@/components/common/Button";
import CitySelect from "@/components/features/CitySelect";
import { cn } from "@/lib/utils";

interface Props {
  onGenerate: (input: BirthInput) => void;
}

const inputClass =
  "w-full rounded-md border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground/90";

export default function BirthDataForm({ onGenerate }: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [custom, setCustom] = useState(false);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [tz, setTz] = useState("0");
  const [detectedTzName, setDetectedTzName] = useState<string>("");
  const [tzDetecting, setTzDetecting] = useState(false);
  const [zodiac, setZodiac] = useState<"tropical" | "sidereal">("tropical");

  /** Auto-detect IANA timezone from lat/lon using Open-Meteo. */
  const detectTimezone = useCallback(async (latStr: string, lonStr: string) => {
    const latN = parseFloat(latStr), lonN = parseFloat(lonStr);
    if (Number.isNaN(latN) || Number.isNaN(lonN)) return;
    setTzDetecting(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latN}&longitude=${lonN}&current=temperature_2m&timezone=auto&forecast_days=0`
      );
      const data = await res.json();
      if (data?.timezone && data.timezone !== "GMT") {
        setDetectedTzName(data.timezone as string);
        // Also set numeric tz as a visible fallback
        const offsetH = (data.utc_offset_seconds ?? 0) / 3600;
        setTz(String(offsetH));
      }
    } catch {
      // fail silently — user can still set tz manually
    } finally {
      setTzDetecting(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Please enter your birth date.");
      return;
    }
    if (!time) {
      toast.error("Please enter your birth time.");
      return;
    }

    let input: BirthInput;
    if (custom) {
      const latN = parseFloat(lat);
      const lonN = parseFloat(lon);
      if (Number.isNaN(latN) || Number.isNaN(lonN)) {
        toast.error("Enter valid latitude and longitude.");
        return;
      }
      // Use auto-detected IANA timezone if available (accurate for DST history).
      // Fall back to the manually selected numeric UTC offset.
      const tzNum = parseFloat(tz);
      input = {
        name: name.trim() || undefined,
        date,
        time,
        place: `${latN.toFixed(2)}, ${lonN.toFixed(2)}`,
        lat: latN,
        lon: lonN,
        tz: detectedTzName
          ? getTimezoneOffset(detectedTzName, date, time)
          : tzNum,
        tzName: detectedTzName || undefined,
        zodiac,
      };
    } else {
      if (!location) {
        toast.error("Search for and select your birth place.");
        return;
      }
      input = {
        name: name.trim() || undefined,
        date,
        time,
        place: location.name,
        lat: location.lat,
        lon: location.lon,
        tz: getTimezoneOffset(location.tzName, date, time),
        tzName: location.tzName,
        zodiac,
      };
    }

    onGenerate(input);
    toast.success("Blueprint computed.", {
      description: "Your nine-point creation cycle is ready below.",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 blueprint-grid"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold">Enter your birth data</h2>
          <p className="text-sm text-muted-foreground">
            Date, time, and place map your natal chart onto the blueprint.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="name">
            Name <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="For your report header"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="date">
            Birth date
          </label>
          <input
            id="date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="time">
            Birth time
          </label>
          <input
            id="time"
            type="time"
            className={inputClass}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        {!custom ? (
          <div className="sm:col-span-2">
            <label className={labelClass}>Birth place</label>
            <CitySelect value={location} onChange={setLocation} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Search any city or town worldwide. Time zone and daylight saving are
              resolved automatically from your birth date.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className={labelClass} htmlFor="lat">
                Latitude
              </label>
              <input
                id="lat"
                className={inputClass}
                value={lat}
                onChange={(e) => { setLat(e.target.value); setDetectedTzName(""); }}
                onBlur={() => detectTimezone(lat, lon)}
                placeholder="e.g. 40.71"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="lon">
                Longitude <span className="text-muted-foreground">(east +)</span>
              </label>
              <input
                id="lon"
                className={inputClass}
                value={lon}
                onChange={(e) => { setLon(e.target.value); setDetectedTzName(""); }}
                onBlur={() => detectTimezone(lat, lon)}
                placeholder="e.g. -74.00"
                inputMode="decimal"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground/90" htmlFor="tz">
                  UTC offset (hours)
                </label>
                {tzDetecting && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Detecting timezone…
                  </span>
                )}
                {!tzDetecting && detectedTzName && (
                  <span className="font-mono text-[10px] text-accent">
                    ✓ Auto-detected: {detectedTzName}
                  </span>
                )}
              </div>
              <select
                id="tz"
                className={inputClass}
                value={tz}
                onChange={(e) => { setTz(e.target.value); setDetectedTzName(""); }}
              >
                {TZ_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    UTC{t >= 0 ? "+" : ""}
                    {t}
                  </option>
                ))}
              </select>
              {!detectedTzName && !tzDetecting && (
                <p className="mt-1.5 text-xs text-amber-500/80">
                  ⚠ Enter lat/lon above to auto-detect timezone, or select the UTC offset manually. Incorrect offset shifts all house placements.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-5">
        <span className={labelClass}>Zodiac system</span>
        <div className="grid grid-cols-2 gap-2.5">
          {/* TROPICAL */}
          <button
            type="button"
            onClick={() => setZodiac("tropical")}
            className={cn(
              "rounded-lg border p-3.5 text-left transition-colors",
              zodiac === "tropical"
                ? "border-primary/60 bg-primary/10"
                : "border-input bg-background/60 hover:border-input/80"
            )}
          >
            <div className={cn("text-sm font-semibold mb-0.5", zodiac === "tropical" ? "text-primary" : "text-foreground")}>
              Tropical
            </div>
            <div className={cn("text-xs leading-snug", zodiac === "tropical" ? "text-primary/70" : "text-muted-foreground")}>
              Western standard. Signs based on the seasons.
            </div>
          </button>

          {/* SIDEREAL */}
          <button
            type="button"
            onClick={() => setZodiac("sidereal")}
            className={cn(
              "rounded-lg border p-3.5 text-left transition-colors",
              zodiac === "sidereal"
                ? "border-accent/60 bg-accent/10"
                : "border-input bg-background/60 hover:border-input/80"
            )}
          >
            <div className={cn("text-sm font-semibold mb-0.5", zodiac === "sidereal" ? "text-accent" : "text-foreground")}>
              Sidereal
            </div>
            <div className={cn("text-xs leading-snug", zodiac === "sidereal" ? "text-accent/70" : "text-muted-foreground")}>
              Vedic / Lahiri. Signs aligned to fixed stars. ~24° behind tropical.
            </div>
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          If your reference chart is from a Western astrologer or app, use <strong className="font-medium text-foreground/80">Tropical</strong>. If from a Vedic astrologer, use <strong className="font-medium text-foreground/80">Sidereal</strong>. Houses use the Placidus system.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setCustom((c) => !c)}
        className="mt-4 flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
      >
        <MapPin className="h-3.5 w-3.5" />
        {custom ? "Use city search instead" : "Enter exact coordinates manually"}
      </button>

      <Button type="submit" size="lg" className="mt-6 w-full">
        Generate Creation Blueprint
      </Button>
    </form>
  );
}
