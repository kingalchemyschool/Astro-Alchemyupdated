import type { Reading } from "@/types/astro";
import PremiumGate from "@/components/features/PremiumGate";

interface Props {
  reading: Reading;
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
}

export default function ArchetypeReport({ reading, premium, onUnlock }: Props) {
  const { functions } = reading;

  const content = (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-2">
        <div className="font-mono text-xs uppercase tracking-widest text-accent">
          Alchemist Archetypes
        </div>
        <h2 className="mt-1 font-serif text-2xl font-semibold">
          The six functions, read in depth
        </h2>
        <p className="text-sm text-muted-foreground">
          Each planet-pair relationship generates one creative function. This report
          decodes exactly how each one plays out in your chart — the mechanism,
          the archetype it produces, and how to work with it.
        </p>
      </div>

      <div className="space-y-6">
        {functions.map((f) => (
          <article
            key={f.key}
            className="rounded-xl border border-border bg-card/60 p-6 sm:p-8"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="glyph text-2xl text-accent">{f.glyphs[0]}</span>
              <span className="text-muted-foreground">+</span>
              <span className="glyph text-2xl text-primary">{f.glyphs[1]}</span>
              <div className="ml-1">
                <h4 className="font-serif text-xl font-semibold">
                  {f.title} — <span className="text-primary">{f.archetypeName}</span>
                </h4>
                <p className="text-xs text-muted-foreground">{f.tagline}</p>
              </div>
            </div>
            <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
              {f.reading.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  return (
    <PremiumGate
      premium={premium}
      onUnlock={onUnlock}
      title="Archetype Report"
      description="Deep readings for all six of your Alchemist Archetypes — the creative functions that define how you operate."
    >
      {content}
    </PremiumGate>
  );
}
