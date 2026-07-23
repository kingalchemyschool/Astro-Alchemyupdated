import type { ArchetypeFunction, FunctionKey } from "@/types/astro";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  "deep resonance": "text-accent",
  "natural flow": "text-primary",
  "productive tension": "text-primary",
  "creative friction": "text-destructive",
};

interface Props {
  functions: ArchetypeFunction[];
  primaryKey: FunctionKey;
}

// Free "map" of the six Alchemist Archetype functions with the derived archetype
// name for each. The deep readings live behind the paywall (FullBlueprint).
export default function ArchetypeMap({ functions, primaryKey }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {functions.map((f) => {
        const isPrimary = f.key === primaryKey;
        return (
          <article
            key={f.key}
            className={cn(
              "rounded-xl border p-5 transition-all hover:-translate-y-0.5",
              isPrimary
                ? "border-primary/50 bg-primary/[0.05]"
                : "border-border bg-card/60 hover:border-accent/50"
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="glyph text-xl text-accent">{f.glyphs[0]}</span>
              <span className="text-muted-foreground">+</span>
              <span className="glyph text-xl text-primary">{f.glyphs[1]}</span>
              <h4 className="ml-1 font-serif text-lg font-semibold">{f.title}</h4>
              {isPrimary && (
                <span className="ml-auto rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                  Your primary
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              {f.definition}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
              <span className="text-sm">
                <span className="text-muted-foreground">In your chart: </span>
                <span className="font-semibold text-primary">{f.archetypeName}</span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-xs font-medium uppercase tracking-wide",
                  TONE[f.resonance] ?? "text-muted-foreground"
                )}
              >
                {f.resonance}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
