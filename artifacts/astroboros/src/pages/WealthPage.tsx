import { RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import { exportReadingPdf } from "@/lib/pdf";
import { useReading } from "@/hooks/useReading";
import BirthDataForm from "@/components/features/BirthDataForm";
import NatalChartSummary from "@/components/features/NatalChartSummary";
import WealthReport from "@/components/features/WealthReport";
import SaveChartButton from "@/components/features/SaveChartButton";
import { Button } from "@/components/common/Button";

// ── Starfield ────────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: (((i * 137.508) % 100)).toFixed(2),
  y: (((i * 97.333) % 100)).toFixed(2),
  r: i % 7 === 0 ? 1.5 : i % 3 === 0 ? 1.1 : 0.7,
  o: 0.15 + (i % 5) * 0.14,
}));

function Starfield() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg width="100%" height="100%" className="absolute inset-0">
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o} />
        ))}
      </svg>
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-blue-900/20 blur-[100px]" />
      <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-amber-900/15 blur-[80px]" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-violet-900/10 blur-[90px]" />
    </div>
  );
}

// ── Venn diagram with tooltips ───────────────────────────────────────────────
function CosmicVenn() {
  const cx = 200, cy = 172, r = 104, offset = 64;
  const top   = { x: cx,          y: cy - offset };
  const left  = { x: cx - offset, y: cy + offset * 0.7 };
  const right = { x: cx + offset, y: cy + offset * 0.7 };

  return (
    <div className="relative w-full max-w-[440px] mx-auto select-none">
      <svg viewBox="0 0 400 380" width="100%" className="overflow-visible">
        <defs>
          <filter id="glow-violet" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="text-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* outer halo rings */}
        <circle cx={top.x}   cy={top.y}   r={r+8} fill="none" stroke="#5eead4" strokeWidth="0.5" opacity="0.2"/>
        <circle cx={left.x}  cy={left.y}  r={r+8} fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.2"/>
        <circle cx={right.x} cy={right.y} r={r+8} fill="none" stroke="#f97316" strokeWidth="0.5" opacity="0.2"/>

        {/* main circles */}
        <circle cx={top.x}   cy={top.y}   r={r} fill="rgba(109,40,217,0.10)" stroke="#a78bfa" strokeWidth="1.5" filter="url(#glow-violet)"/>
        <circle cx={left.x}  cy={left.y}  r={r} fill="rgba(120,90,10,0.10)"  stroke="#fbbf24" strokeWidth="1.5" filter="url(#glow-gold)"/>
        <circle cx={right.x} cy={right.y} r={r} fill="rgba(180,40,10,0.10)"  stroke="#f97316" strokeWidth="1.5" filter="url(#glow-red)"/>

        {/* ── center: Integrated Mastery ── */}
        <circle cx={cx} cy={cy + 10} r={26} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
        <text x={cx} y={cy + 4}  textAnchor="middle" fill="white" fontSize="5.8" fontFamily="monospace" fontWeight="700" letterSpacing="0.06em" filter="url(#text-glow)">INTEGRATED</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="white" fontSize="5.8" fontFamily="monospace" fontWeight="700" letterSpacing="0.06em" filter="url(#text-glow)">MASTERY</text>

        {/* ── circle labels ── */}
        <text x={top.x}        y={top.y - r - 18} textAnchor="middle" fill="#5eead4" fontSize="10" fontFamily="monospace" fontWeight="700" letterSpacing="0.14em" filter="url(#text-glow)">CONSCIOUS</text>
        <text x={left.x - 18}  y={left.y + r + 20} textAnchor="middle" fill="#fcd34d" fontSize="10" fontFamily="monospace" fontWeight="700" letterSpacing="0.14em" filter="url(#text-glow)">WEALTH</text>
        <text x={right.x + 18} y={right.y + r + 20} textAnchor="middle" fill="#fb923c" fontSize="10" fontFamily="monospace" fontWeight="700" letterSpacing="0.14em" filter="url(#text-glow)">IMPACT</text>

        {/* ── overlap zone labels ── */}
        <text x={cx - 50} y={cy - 2} textAnchor="middle" fill="rgba(255,255,255,0.50)" fontSize="5.4" fontFamily="serif" fontStyle="italic">Conscious</text>
        <text x={cx - 50} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.50)" fontSize="5.4" fontFamily="serif" fontStyle="italic">Stewardship</text>

        <text x={cx + 50} y={cy - 2} textAnchor="middle" fill="rgba(255,255,255,0.50)" fontSize="5.4" fontFamily="serif" fontStyle="italic">Strategic</text>
        <text x={cx + 50} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.50)" fontSize="5.4" fontFamily="serif" fontStyle="italic">Will</text>

        <text x={cx} y={cy + 57} textAnchor="middle" fill="rgba(255,255,255,0.50)" fontSize="5.4" fontFamily="serif" fontStyle="italic">Dynamic Value</text>
        <text x={cx} y={cy + 67} textAnchor="middle" fill="rgba(255,255,255,0.50)" fontSize="5.4" fontFamily="serif" fontStyle="italic">Creation</text>
      </svg>
    </div>
  );
}

// ── Landing ──────────────────────────────────────────────────────────────────
function WealthLanding({ onGenerate }: { onGenerate: (input: unknown) => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 60% 20%, #0b1a30 0%, #060c18 50%, #030609 100%)" }}
      >
        <Starfield />
        <div className="relative container max-w-3xl py-20 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-violet-400 mb-4 opacity-80">
            Conscious Wealth Reading
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-semibold leading-tight text-white mb-6">
            Create Conscious Wealth
          </h1>
          <p className="text-base text-white/55 leading-relaxed max-w-2xl mx-auto">
            A focused exploration of your relationship with value, creation, and prosperity.
            Discover the patterns that influence how you generate impact, cultivate resources,
            and build wealth that aligns with your deeper potential.
          </p>

          <div className="mt-14 mb-6">
            <CosmicVenn />
          </div>
        </div>
      </div>

      {/* Three circles explained */}
      <div
        className="relative"
        style={{ background: "linear-gradient(180deg, #030609 0%, #06080f 100%)" }}
      >
        <div className="container max-w-3xl py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-10">
            The three forces
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                label: "IMPACT",
                color: "border-orange-500/25 bg-orange-950/15",
                badge: "text-orange-400",
                planets: "Mars · Pluto · Mercury · Uranus",
                def: "The powerful capacity to shape, guide, and transform reality in alignment with intended vision. Impact is the visible manifestation of focused will and conscious choice on the world — directing transformative forces to create enduring, meaningful change.",
              },
              {
                label: "WEALTH",
                color: "border-amber-500/25 bg-amber-950/15",
                badge: "text-amber-400",
                planets: "Jupiter · Venus · Neptune",
                def: "The dynamic skill of identifying, cultivating, and multiplying intrinsic value through powerful transformation. This is not just financial — it includes the continuous generation of resources, meaning, and abundance. True wealth is the enduring outcome of successfully directed energy and conscious stewarding.",
              },
              {
                label: "CONSCIOUS",
                color: "border-violet-500/25 bg-violet-950/15",
                badge: "text-violet-400",
                planets: "Sun · Moon · Saturn",
                def: "Cultivating profound internal awareness of one's thoughts, feelings, and intentions — a sustained, deliberate presence that bridges inner subjective reality and outer objective experience. By mastering conscious awareness, one aligns personal direction with universal wisdom.",
              },
            ].map((f) => (
              <div key={f.label} className={`rounded-2xl border p-5 ${f.color}`}>
                <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-bold ${f.badge}`}>
                  {f.label}
                </span>
                <p className="mt-1 font-mono text-[10px] text-white/25 tracking-wide">{f.planets}</p>
                <p className="mt-3 text-sm text-white/60 leading-relaxed">{f.def}</p>
              </div>
            ))}
          </div>

          {/* Overlap zones */}
          <div className="mt-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 text-center mb-8">
              Where forces intersect
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  label: "Conscious Stewardship",
                  forces: "Conscious + Wealth",
                  color: "border-white/10",
                  desc: "The responsibility of recognizing and protecting the deep-seated value and structural integrity inherent within a directed reality.",
                },
                {
                  label: "Dynamic Value Creation",
                  forces: "Wealth + Impact",
                  color: "border-white/10",
                  desc: "The art of channeling and directing change to generate sustained wealth and substantial growth.",
                },
                {
                  label: "Strategic Will",
                  forces: "Conscious + Impact",
                  color: "border-white/10",
                  desc: "The disciplined application of will — directing powerful forces with precision, logic, and deep conscious understanding.",
                },
              ].map((z) => (
                <div key={z.label} className={`rounded-xl border ${z.color} bg-white/[0.02] p-4`}>
                  <p className="font-serif italic text-sm text-white/70 font-semibold">{z.label}</p>
                  <p className="font-mono text-[9px] text-white/25 tracking-wide mt-0.5 mb-2">{z.forces}</p>
                  <p className="text-[13px] text-white/50 leading-relaxed">{z.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integrated Mastery */}
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Center</p>
            <p className="font-serif text-xl font-semibold text-white mb-3">Integrated Mastery</p>
            <p className="text-sm text-white/50 leading-relaxed max-w-xl mx-auto">
              The unified expression of profound impact, sustainable value cultivation, and aligned awareness.
              The ultimate integration and dynamic synergy of all capabilities — where directed will and conscious
              presence meet to create an optimal, thriving existence.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container max-w-2xl py-16">
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Decode your blueprint
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your birth data to see how all three forces are configured in your chart.
          </p>
        </div>
        <BirthDataForm onGenerate={onGenerate} />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function WealthPage() {
  const { reading, generate, reset, wealthPremium, unlockWealth } = useReading();
  const premium = wealthPremium;

  if (!reading) return <WealthLanding onGenerate={generate} />;

  const chartName = reading.chart.input.name
    ? `${reading.chart.input.name} — Wealth Blueprint`
    : "Conscious Wealth Blueprint";

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-xs uppercase tracking-widest text-violet-400">Conscious Wealth Reading</div>
          <h1 className="mt-1 font-serif text-3xl font-semibold truncate">
            {reading.chart.input.name
              ? `${reading.chart.input.name}'s Wealth Blueprint`
              : "Your Wealth Blueprint"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {reading.chart.input.place} · {reading.chart.input.date}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SaveChartButton
            key={reading.chart.input.date + reading.chart.input.place}
            name={chartName}
            birthInput={reading.chart.input as unknown as Record<string, unknown>}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { exportReadingPdf(reading, premium); toast.success("PDF exported"); }}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> New reading
          </Button>
        </div>
      </div>
      <NatalChartSummary chart={reading.chart} />
      <div className="mt-10">
        <WealthReport reading={reading} premium={premium} onUnlock={unlockWealth} />
      </div>
    </div>
  );
}
