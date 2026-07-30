import { BookOpen } from "lucide-react";
import type { HeroJourney } from "@/types/astro";
import { cn } from "@/lib/utils";

export default function HeroJourneyCard({ journey }: { journey: HeroJourney }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-b from-primary/[0.06] to-card/60 p-6 blueprint-grid sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-accent">
            The Alchemist's Journey
          </div>
          <h3 className="font-serif text-2xl font-semibold">{journey.title}</h3>
        </div>
      </div>
      <div className="space-y-4">
        {journey.paragraphs.map((p, i) => (
          <p
            key={i}
            className={cn(
              "text-[15px] leading-relaxed text-foreground/90",
              i === 0 &&
                "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-primary"
            )}
          >
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
