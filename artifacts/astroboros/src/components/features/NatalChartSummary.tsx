import type { NatalChart } from "@/types/astro";
import { SIGNS, SUMMARY_ORDER, PLANET_META, ORDINALS } from "@/constants/astro";
import { formatDegree } from "@/lib/ephemeris";

export default function NatalChartSummary({ chart }: { chart: NatalChart }) {
  const asc = chart.ascendant;
  const ascSign = SIGNS[asc.signIndex];

  return (
    <div className="rounded-xl border border-border bg-card/70 p-5 blueprint-grid">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold">Natal Chart Summary</h3>
        <div className="text-right">
          <div className="font-mono text-xs text-muted-foreground">
            {chart.input.date} · {chart.input.time}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground/70">
            {chart.input.place} · {chart.input.lat.toFixed(3)}°, {chart.input.lon.toFixed(3)}°
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
            {chart.zodiac === "sidereal" ? "Sidereal · Lahiri" : "Tropical"} · Placidus
            {" · "}
            {chart.input.tzName
              ? chart.input.tzName
              : `UTC${(chart.input.tz ?? 0) >= 0 ? "+" : ""}${chart.input.tz ?? 0}`}
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/60 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2">Planet</th>
              <th className="px-4 py-2">Sign</th>
              <th className="px-4 py-2">Degree</th>
              <th className="px-4 py-2">House</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border/50 bg-primary/5">
              <td className="px-4 py-2 font-medium">
                <span className="glyph mr-2 text-primary">↑</span> Ascendant
              </td>
              <td className="px-4 py-2">
                <span className="glyph mr-1 text-accent">{ascSign.glyph}</span>
                {ascSign.name}
              </td>
              <td className="px-4 py-2 font-mono text-muted-foreground">
                {formatDegree(asc)}
              </td>
              <td className="px-4 py-2 font-mono text-muted-foreground">1st</td>
            </tr>
            {SUMMARY_ORDER.map((key) => {
              const pos = chart.positions[key];
              const sign = SIGNS[pos.signIndex];
              const meta = PLANET_META[key];
              return (
                <tr key={key} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-2 font-medium">
                    <span className="glyph mr-2 text-primary">{meta.glyph}</span>
                    {meta.name}
                    {pos.retrograde && (
                      <span className="ml-1 font-mono text-xs text-accent">℞</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className="glyph mr-1 text-accent">{sign.glyph}</span>
                    {sign.name}
                  </td>
                  <td className="px-4 py-2 font-mono text-muted-foreground">
                    {formatDegree(pos)}
                  </td>
                  <td className="px-4 py-2 font-mono text-muted-foreground">
                    {ORDINALS[pos.house - 1]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
