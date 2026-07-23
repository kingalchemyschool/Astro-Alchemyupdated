import { useState } from "react";
import { Flame, CalendarDays, Zap, Moon, LayoutGrid, BookOpen, Target } from "lucide-react";

interface ForgePaywallProps {
  onSubscribe: () => Promise<boolean>;
  noChart?: boolean;
}

const FEATURES = [
  { icon: <Moon className="h-4 w-4" />, text: "Daily Moon processing layer — perception, house, and aspects" },
  { icon: <Zap className="h-4 w-4" />, text: "Personalized transit activation report — your blueprint vs the live sky" },
  { icon: <LayoutGrid className="h-4 w-4" />, text: "House activation tracking — where the refinement is occurring" },
  { icon: <Flame className="h-4 w-4" />, text: "Forge Principle — a daily philosophical statement from the transit" },
  { icon: <BookOpen className="h-4 w-4" />, text: "Personalized journal prompt tied to your natal activations" },
  { icon: <Target className="h-4 w-4" />, text: "Daily application — one practical action to work with the moment" },
];

export default function ForgePaywall({ onSubscribe, noChart }: ForgePaywallProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    await onSubscribe();
    setLoading(false);
  }

  if (noChart) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[#3B4B8C]/40 bg-[#0A0D1A] p-8 text-center shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#3B4B8C]/50 bg-[#0F1428]">
            <Flame className="h-6 w-6 text-[#8B9EE8]" />
          </div>
        </div>
        <h2 className="font-serif text-xl font-semibold text-[#E8E4D8]">Blueprint Required</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#6B7A99]">
          Daily Forge calibrates your personal transit report against your natal blueprint.
          Generate your reading first, then return here for your daily report.
        </p>
        <a
          href="/reading"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3B4B8C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4A5BA0]"
        >
          Generate Your Blueprint
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#3B4B8C]/60 bg-[#0F1428] shadow-[0_0_30px_rgba(59,75,140,0.3)]">
            <Flame className="h-9 w-9 text-[#8B9EE8]" />
            <div className="absolute inset-0 rounded-full border border-[#8B9EE8]/20 animate-pulse" />
          </div>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#E8E4D8]">Daily Forge</h1>
        <p className="mt-3 text-[#8B9EE8] text-sm tracking-widest uppercase font-mono">
          Celestial Calibration System
        </p>
        <p className="mt-4 text-[#6B7A99] leading-relaxed max-w-md mx-auto">
          Your blueprint is fixed. The sky is in motion. Daily Forge reveals how today's
          planetary conditions interact with your natal design — and what to do with it.
        </p>
      </div>

      {/* Price card */}
      <div className="rounded-2xl border border-[#3B4B8C]/50 bg-[#080B18] shadow-[0_0_40px_rgba(59,75,140,0.12)] overflow-hidden">
        {/* Trial banner */}
        <div className="border-b border-[#3B4B8C]/30 bg-[#3B4B8C]/10 px-6 py-3 text-center">
          <span className="text-xs font-mono tracking-widest uppercase text-[#8B9EE8]">
            7-day free trial included
          </span>
        </div>

        <div className="p-8">
          {/* Price */}
          <div className="mb-8 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-[#E8E4D8] font-serif">$7.99</span>
              <span className="text-[#6B7A99] text-sm">/ month</span>
            </div>
            <p className="mt-1.5 text-xs text-[#4A5770]">
              Cancel anytime · No charge during trial
            </p>
          </div>

          {/* Feature list */}
          <ul className="mb-8 space-y-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-[#8B9EE8]">{f.icon}</span>
                <span className="text-sm text-[#8892A4] leading-relaxed">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full rounded-xl bg-[#3B4B8C] py-4 text-sm font-semibold text-white transition-all hover:bg-[#4A5BA0] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(59,75,140,0.4)] hover:shadow-[0_4px_30px_rgba(59,75,140,0.6)]"
          >
            {loading ? "Redirecting to checkout…" : "Start Free Trial"}
          </button>

          <p className="mt-4 text-center text-xs text-[#4A5770]">
            <CalendarDays className="mr-1 inline h-3 w-3" />
            7 days free, then $7.99/month · Powered by Stripe
          </p>
        </div>
      </div>

      {/* Sub-copy */}
      <p className="mt-8 text-center text-xs text-[#4A5770] leading-relaxed">
        "Your blueprint is fixed. Your conditions are changing.
        Daily Forge shows you how to work with the moment."
      </p>
    </div>
  );
}
