import { BookOpen, Package, Sparkles, Star } from "lucide-react";
import type { Reading } from "@/types/astro";
import InteractiveEnneagram from "@/components/features/InteractiveEnneagram";
import HeroJourneyCard from "@/components/features/HeroJourneyCard";
import { Button } from "@/components/common/Button";
import { PLANET_META, SIGNS, ORDINALS } from "@/constants/astro";
import { cn } from "@/lib/utils";
import NatalAspectCards from "@/components/features/NatalAspectCards";

interface Props {
  reading: Reading;
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
  /** Optional bundle upgrade handler — shows a second "$60 Bundle" button. */
  onBundle?: () => Promise<boolean>;
}

export default function BlueprintReport({ reading, premium, onUnlock, onBundle }: Props) {
  const { chart, functions, primary, planetSections, heroJourney } = reading;

  return (
    <div className="space-y-14">
      {/* Interactive Enneagram */}
      <section>
        <div className="mb-4">
          <div className="font-mono text-xs uppercase tracking-widest text-accent">
            Interactive Blueprint
          </div>
          <h2 className="mt-1 font-serif text-2xl font-semibold">
            Your creation enneagram
          </h2>
          <p className="text-sm text-muted-foreground">
            Tap any function to learn its role and your sign placement. Tap the
            connecting lines to reveal your six Alchemist Archetypes. Tap a ◇ diamond
            to explore a cycle threshold.
          </p>
        </div>
        <InteractiveEnneagram
          chart={chart}
          functions={functions}
          premium={premium}
          onUnlock={onUnlock}
        />
      </section>

      {/* Planet-by-planet readings */}
      <section className="space-y-5">
        <div className="border-b border-border/60 pb-2">
          <div className="font-mono text-xs uppercase tracking-widest text-accent">
            {premium ? "Full Reading" : "Blueprint Preview"}
          </div>
          <h2 className="mt-1 font-serif text-2xl font-semibold">
            Your nine functions, decoded
          </h2>
          <p className="text-sm text-muted-foreground">
            {premium
              ? "Complete readings for every function — sign placement, practical expression, aspects, and octave amplifiers."
              : "How each function operates in your sign. One personalised insight per planet — free."}
          </p>
        </div>

        {planetSections.map((section) => {
          const isThreshold = section.kind === "threshold";
          const planetKey = section.planetKeys[0];
          const pos = planetKey ? chart.positions[planetKey] : null;
          const meta = planetKey ? PLANET_META[planetKey] : null;
          const visibleParagraphs = section.paragraphs;

          return (
            <article
              key={section.order}
              className={cn(
                "relative rounded-xl border p-5 sm:p-6",
                isThreshold
                  ? "border-primary/30 bg-primary/[0.04]"
                  : "border-border bg-card/60"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "glyph flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-xl",
                    isThreshold
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-accent/40 bg-accent/10 text-accent"
                  )}
                >
                  {section.glyph}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {isThreshold ? "Threshold" : "Function"}
                  </div>
                  <h3 className="font-serif text-lg font-semibold leading-snug">
                    {section.title}
                  </h3>
                  {pos && (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {SIGNS[pos.signIndex].name} · {ORDINALS[pos.house - 1]} house
                      {pos.retrograde ? " · ℞" : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {visibleParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className={cn(
                      "text-[15px] leading-relaxed",
                      i === 0 ? "text-foreground/90" : "text-foreground/80"
                    )}
                  >
                    {p}
                  </p>
                ))}
              </div>
               <NatalAspectCards cards={section.aspectCards} />
            </article>
          );
        })}
      </section>

      {/* Primary archetype */}
      <section>
        <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Your all-encompassing archetype
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/[0.05] p-6 blueprint-grid sm:p-8">
          <h2 className="font-serif text-3xl font-semibold">You are {primary.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The single archetype that ties all six of your functions together.
          </p>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/90">
            {primary.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* ── PAID CONTENT ─────────────────────────────────────────── */}
      {premium && (
        <>
          {/* Alchemist Archetypes */}
          <section className="space-y-6">
            <div className="border-b border-border/60 pb-2">
              <div className="font-mono text-xs uppercase tracking-widest text-accent">
                Alchemist Archetypes
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                The six functions, read in depth
              </h2>
              <p className="text-sm text-muted-foreground">
                Each planet-pair relationship generates one creative function. Here is
                exactly how each one plays out in your chart.
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
                    {f.reading.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Blueprint Journey */}
          <section className="space-y-6">
            <div className="border-b border-border/60 pb-2">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent mb-1">
                <BookOpen className="h-3.5 w-3.5" /> The Alchemist's Journey
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold">
                The story your blueprint tells
              </h2>
              <p className="text-sm text-muted-foreground">
                A continuous developmental narrative — how your capacities form, transform, and become integrated over time.
              </p>
            </div>
            <HeroJourneyCard journey={heroJourney} />
          </section>
        </>
      )}

      {/* ── UNLOCK CTA (free only) ────────────────────────────────── */}
      {!premium && (
        <section>
          <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center">
            <div className="absolute inset-0 blueprint-grid opacity-30" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">
                Unlock Your Full Blueprint Reading
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                A complete exploration of your personal blueprint, revealing the core patterns,
                strengths, and themes that shape how you think, create, relate, and build your
                life. Gain deeper insight into your natural tendencies, untapped potential, and
                the unique architecture behind your path forward.
              </p>
              <ul className="mx-auto mt-4 mb-6 max-w-sm space-y-1.5 text-left text-sm text-muted-foreground">
                {[
                  "Full multi-paragraph reading for every function",
                  "Rich aspect synthesis for each planet",
                  "Outer-planet octave amplifier readings",
                  "All three threshold readings decoded",
                  "Six Alchemist Archetype deep readings",
                  "The Alchemist's Journey — your personal developmental narrative",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-primary">✷</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Primary CTA */}
              {onUnlock && (
                <div className="flex flex-col items-center gap-3">
                  <Button onClick={onUnlock} size="lg">
                    Unlock Full Blueprint — $44
                  </Button>

                  {/* Bundle CTA */}
                  {onBundle && (
                    <Button onClick={onBundle} size="lg" variant="outline">
                      <Package className="h-4 w-4" />
                      Get the Bundle — $60
                    </Button>
                  )}

                  {onBundle && (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                      Bundle includes Full Blueprint + Lab Synastry Premium
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
