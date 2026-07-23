import type { ReportSection as Section } from "@/types/astro";
import { cn } from "@/lib/utils";

export default function ReportSection({ section }: { section: Section }) {
  const isThreshold = section.kind === "threshold";
  return (
    <article
      className={cn(
        "relative rounded-xl border p-6 transition-colors sm:p-8",
        isThreshold
          ? "border-primary/40 bg-primary/[0.04]"
          : "border-border bg-card/60"
      )}
    >
      <div className="mb-5 flex items-start gap-4">
        <div
          className={cn(
            "glyph flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border text-2xl",
            isThreshold
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-accent/40 bg-accent/10 text-accent"
          )}
        >
          {section.glyph}
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {isThreshold ? "Threshold" : "Function"}
          </div>
          <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight">
            {section.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{section.subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        {section.paragraphs.map((p, i) => (
          <p
            key={i}
            className={cn(
              "text-[15px] leading-relaxed",
              i === section.paragraphs.length - 1 && section.planetKeys.length > 1
                ? "border-l-2 border-accent/40 pl-4 italic text-muted-foreground"
                : "text-foreground/90"
            )}
          >
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
