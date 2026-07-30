import type { NatalAspectCard } from "@/types/astro";

export default function NatalAspectCards({ cards }: { cards?: NatalAspectCard[] }) {
  if (!cards?.length) return null;

  return (
    <div className="mt-5 space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
        Natal aspects
      </div>
      {cards.map((card) => (
        <article
          key={`${card.title}-${card.subtitle}`}
          className="rounded-xl border border-accent/25 bg-background/35 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-serif text-lg font-semibold">{card.title}</h4>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {card.subtitle}
              </p>
            </div>
            {card.name && (
              <span className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                {card.name}
              </span>
            )}
          </div>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/85">
            {card.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}