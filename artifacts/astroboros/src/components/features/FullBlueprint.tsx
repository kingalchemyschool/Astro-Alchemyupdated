import type { Reading } from "@/types/astro";
import ReportSection from "@/components/features/ReportSection";
import HeroJourneyCard from "@/components/features/HeroJourneyCard";
import PremiumGate from "@/components/features/PremiumGate";

interface Props {
  reading: Reading;
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
}

function SectionHeader({
  kicker,
  title,
  desc,
}: {
  kicker: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="border-b border-border/60 pb-2">
      <div className="font-mono text-xs uppercase tracking-widest text-accent">
        {kicker}
      </div>
      <h2 className="mt-1 font-serif text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

// The paid layer: every function, the three thresholds, the six archetype deep
// readings, and the Blueprint Journey — behind a single unlock.
export default function FullBlueprint({ reading, premium, onUnlock }: Props) {
  const { planetSections, functions, heroJourney } = reading;

  const content = (
    <div className="space-y-14">
      <section className="space-y-6">
        <SectionHeader
          kicker="The Functions & Thresholds"
          title="Every function in the creation cycle, in order"
          desc="Essence through Structure — ten planets across the full cycle, with Pluto, Uranus, and Neptune read as standalone sections alongside their inner-planet counterparts."
        />
        {planetSections.map((s, i) => (
          <ReportSection key={i} section={s} />
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeader
          kicker="Alchemist Archetypes"
          title="The six functions, read in depth"
          desc="How each planet-pair relationship generates a function — and exactly how it plays out in your chart."
        />
        <div className="space-y-6">
          {functions.map((f) => (
            <article
              key={f.key}
              className="rounded-xl border border-border bg-card/60 p-6 sm:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="glyph text-2xl text-accent">{f.glyphs[0]}</span>
                <span className="text-muted-foreground">+</span>
                <span className="glyph text-2xl text-primary">{f.glyphs[1]}</span>
                <div className="ml-1">
                  <h4 className="font-serif text-xl font-semibold">
                    {f.title} — {f.archetypeName}
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
      </section>

      <section className="space-y-6">
        <SectionHeader
          kicker="Your Blueprint Journey"
          title="The developmental story of your blueprint"
          desc="A continuous, grounded narrative of how your capacities evolve and become integrated."
        />
        <HeroJourneyCard journey={heroJourney} />
      </section>
    </div>
  );

  return (
    <PremiumGate
      premium={premium}
      onUnlock={onUnlock}
      title="Your Full Alchemical Blueprint"
       description="The full enneagram map, deep readings for all six archetypes, and your personalized Blueprint Journey."
    >
      {content}
    </PremiumGate>
  );
}
