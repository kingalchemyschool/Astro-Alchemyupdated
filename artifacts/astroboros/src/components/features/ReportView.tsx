import { useState } from "react";
import type { Reading } from "@/types/astro";
import NatalChartSummary from "@/components/features/NatalChartSummary";
import BlueprintReport from "@/components/features/BlueprintReport";
import ArchetypeReport from "@/components/features/ArchetypeReport";
import WealthReport from "@/components/features/WealthReport";
import { cn } from "@/lib/utils";

interface Props {
  reading: Reading;
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
}

type Tab = "blueprint" | "archetype" | "wealth";

const TABS: { key: Tab; label: string; kicker: string }[] = [
  { key: "blueprint", label: "Blueprint Report", kicker: "Free preview" },
  { key: "archetype", label: "Archetype Report", kicker: "Paid · $33" },
  { key: "wealth", label: "Wealth Blueprint", kicker: "Paid · $22" },
];

export default function ReportView({ reading, premium, onUnlock }: Props) {
  const [tab, setTab] = useState<Tab>("blueprint");

  return (
    <>
      {/* Natal chart summary — always visible */}
      <NatalChartSummary chart={reading.chart} />

      {/* Tab bar */}
      <div className="mt-10 border-b border-border/60">
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex flex-col items-start px-5 py-3 text-left transition-colors",
                tab === t.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                {t.kicker}
              </span>
              <span className="font-serif text-base font-semibold">{t.label}</span>
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {tab === "blueprint" && (
          <BlueprintReport reading={reading} premium={premium} onUnlock={onUnlock} />
        )}
        {tab === "archetype" && (
          <ArchetypeReport reading={reading} premium={premium} onUnlock={onUnlock} />
        )}
        {tab === "wealth" && (
          <WealthReport reading={reading} premium={premium} onUnlock={onUnlock} />
        )}
      </div>
    </>
  );
}
