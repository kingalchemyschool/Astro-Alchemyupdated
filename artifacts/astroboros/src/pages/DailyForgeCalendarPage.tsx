import { Link } from "wouter";
import { Flame } from "lucide-react";
import { useReading } from "@/hooks/useReading";
import { DailyForgeCalendar } from "@/components/features/DailyForge/DailyForgeSurface";

export default function DailyForgeCalendarPage() {
  const { reading, forgePremium, unlockForge } = useReading();

  if (!reading && !forgePremium) {
    return (
      <div className="container max-w-2xl py-16">
        <div className="rounded-2xl border border-[#3B4B8C]/40 bg-[#080B18] p-8 text-center">
          <Flame className="mx-auto mb-4 h-9 w-9 text-[#8B9EE8]" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B9EE8]">Daily Forge calendar</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-[#E8E4D8]">Your sky, day by day</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#6B7A99]">
            Generate a blueprint and unlock Daily Forge to explore the world sky across the month.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/reading" className="rounded-xl bg-[#3B4B8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4A5BA0]">
              Generate blueprint
            </Link>
            <button
              type="button"
              onClick={() => void unlockForge()}
              className="rounded-xl border border-[#8B9EE8]/35 px-5 py-3 text-sm font-semibold text-[#A8B4D4] hover:text-[#E8E4D8]"
            >
              Unlock Daily Forge
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <p className="text-sm text-[#6B7A99]">Generate your blueprint first, then return to the sky calendar.</p>
        <Link to="/reading" className="mt-5 inline-flex rounded-xl bg-[#3B4B8C] px-5 py-3 text-sm font-semibold text-white">Generate blueprint</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060914] px-4 py-10">
      <div className="container mx-auto max-w-4xl">
        <DailyForgeCalendar
          zodiac={reading.chart.zodiac}
          name={reading.chart.input.name || "Your sky"}
        />
      </div>
    </div>
  );
}