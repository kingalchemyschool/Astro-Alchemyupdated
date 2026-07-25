import { Activity, ArrowRight, Boxes, Check, Compass, DraftingCompass, Layers3, Orbit, Package, Radar, ScanLine, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "wouter";
import heroImg from "@/assets/hero-blueprint.png";

const REPORTS = [
  {
    to: "/reports/blueprint",
    kicker: "Full Blueprint Reading",
    price: "Free preview · $44 full",
    headline: "Your complete personal blueprint.",
    desc: "A complete exploration of the patterns, strengths, and themes that shape how you think, create, relate, and build.",
    features: ["Complete planetary function analysis", "Your primary Alchemist Archetype", "Interactive creation enneagram", "Sign, house, and aspect readings", "Deep function readings (paid)"],
    accent: "border-accent/40",
    badge: "text-accent border-accent/30 bg-accent/10",
    cta: "Get Your Free Blueprint Preview",
    ctaVariant: "primary",
  },
  {
    to: "/reports/archetype",
    kicker: "Alchemy Archetype Reading",
    price: "$9",
    headline: "The mechanisms behind your creation.",
    desc: "A personalized exploration of your archetypal signature, creative patterns, observable behavior, and developmental edge.",
    features: ["Six planetary relationship readings", "Mechanism → Archetype → Mastery arc", "Observable behavior and failure modes", "Element and aspect-specific analysis", "Full developmental edge per archetype"],
    accent: "border-primary/40",
    badge: "text-primary border-primary/30 bg-primary/10",
    cta: "Explore Archetypes",
    ctaVariant: "secondary",
  },
  {
    to: "/reports/wealth",
    kicker: "Conscious Wealth Reading",
    price: "$22",
    headline: "Transform potential into lasting value.",
    desc: "A focused exploration of your relationship with value, creation, and prosperity — and the patterns that turn impact into resources.",
    features: ["Impact: how force becomes consequence", "Wealth: how consequence becomes value", "Consciousness: how value becomes mastery", "Core Archetype + Wealth Formula", "Reflection questions per force"],
    accent: "border-violet-500/35",
    badge: "text-violet-300 border-violet-500/25 bg-violet-500/10",
    cta: "Explore Wealth Blueprint",
    ctaVariant: "secondary",
  },
  {
    to: "/compare",
    kicker: "Laboratory Reading",
    price: "Free",
    headline: "Discover what two blueprints create together.",
    desc: "A comparative exploration of two individual blueprints, revealing the dynamics, strengths, and opportunities within a connection.",
    features: ["Seven-function cross-analysis", "Amplifiers and operational constraints", "Laboratory climate + health indicators", "Predicted creation cycle", "Executive summary for the partnership"],
    accent: "border-violet-500/35",
    badge: "text-violet-300 border-violet-500/25 bg-violet-500/10",
    cta: "Run the Laboratory",
    ctaVariant: "secondary",
  },
];

const FORCES = [
  {
    label: "The planets",
    text: "Each planet in your chart is a specific creative force — Essence, Force, Genius, Expansion, Value, Foundation. Together they form a complete creation cycle.",
    icon: Orbit,
    accent: "text-accent",
    border: "border-accent/20",
  },
  {
    label: "The relationships",
    text: "The aspects between planets reveal your unique mechanisms — where forces amplify, where they create productive friction, and where development is required.",
    icon: Activity,
    accent: "text-primary",
    border: "border-primary/20",
  },
  {
    label: "The blueprint",
    text: "Your chart becomes a readable architecture — a map of how you build, communicate, grow, and create impact. No two blueprints are identical.",
    icon: DraftingCompass,
    accent: "text-violet-300",
    border: "border-violet-500/20",
  },
];

const DAILY_FORGE = [
  {
    label: "The transit",
    text: "Today's planetary positions are read against your natal chart to find the tightest, most significant active contact.",
    icon: Radar,
    accent: "text-accent",
    border: "border-accent/20",
  },
  {
    label: "The pressure",
    text: "The Forge names exactly what kind of condition is at work: friction, flow, intensity, or an invitation to integrate.",
    icon: ScanLine,
    accent: "text-primary",
    border: "border-primary/20",
  },
  {
    label: "The application",
    text: "You get a concrete daily protocol: what to do, what pattern to avoid, and what to practice.",
    icon: Compass,
    accent: "text-violet-300",
    border: "border-violet-500/20",
  },
];

// ─── Enneagram SVG ───────────────────────────────────────────────────────────
// 9-point creation enneagram: outer circle + triangle (3-6-9) + hexad (1-4-2-8-5-7)
// Viewbox 300×300, center 150,150, outer radius 110
function EnneagramSVG() {
  // Points 1-9 placed clockwise from top (point 9 at 12 o'clock)
  const R = 110;
  const cx = 150;
  const cy = 150;
  const pts: [number, number][] = Array.from({ length: 9 }, (_, i) => {
    const angle = ((i * 40) - 90) * (Math.PI / 180); // 40° apart, starting at top
    return [cx + R * Math.cos(angle), cy + R * Math.sin(angle)];
  });
  // pts[0]=pt9(top), pts[1]=pt1, pts[2]=pt2, pts[3]=pt3, pts[4]=pt4,
  // pts[5]=pt5, pts[6]=pt6, pts[7]=pt7, pts[8]=pt8
  const p = (i: number) => `${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`;

  // Triangle: points 9,3,6 → indices 0,3,6
  const triangle = `M ${p(0)} L ${p(3)} L ${p(6)} Z`;
  // Hexad: 1→4→2→8→5→7→1 → indices 1,4,2,8,5,7
  const hexad = `M ${p(1)} L ${p(4)} L ${p(2)} L ${p(8)} L ${p(5)} L ${p(7)} Z`;

  const LABELS = ["9","1","2","3","4","5","6","7","8"];
  const LABEL_R = 128;

  return (
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[340px] drop-shadow-[0_0_40px_rgba(99,102,241,0.25)]"
      aria-label="Creation enneagram — nine creative forces"
    >
      <defs>
        <radialGradient id="eng-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(238,70%,65%)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(238,70%,65%)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r={R + 20} fill="url(#eng-glow)" />

      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="hsl(238,55%,60%)" strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Inner reference circle */}
      <circle cx={cx} cy={cy} r={R * 0.38} fill="none" stroke="hsl(238,55%,60%)" strokeWidth="0.5" strokeOpacity="0.2" />

      {/* Triangle 3-6-9 */}
      <path d={triangle} fill="none" stroke="hsl(45,80%,60%)" strokeWidth="1" strokeOpacity="0.55" />

      {/* Hexad 1-4-2-8-5-7 */}
      <path d={hexad} fill="none" stroke="hsl(238,70%,68%)" strokeWidth="0.9" strokeOpacity="0.6" />

      {/* Spoke lines from center to each point */}
      {pts.map(([x, y], i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={cx + (x - cx) * 0.35} y2={cy + (y - cy) * 0.35}
          stroke="hsl(238,55%,60%)"
          strokeWidth="0.5"
          strokeOpacity="0.2"
        />
      ))}

      {/* Point dots */}
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x} cy={y} r={i === 0 ? 5 : 3.5}
          fill={i === 0 ? "hsl(238,70%,68%)" : i === 3 || i === 6 ? "hsl(45,75%,58%)" : "hsl(238,55%,58%)"}
          fillOpacity={i === 0 ? 1 : 0.85}
        />
      ))}

      {/* Point labels */}
      {LABELS.map((label, i) => {
        const angle = ((i * 40) - 90) * (Math.PI / 180);
        const lx = cx + LABEL_R * Math.cos(angle);
        const ly = cy + LABEL_R * Math.sin(angle);
        return (
          <text
            key={i}
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fontFamily="monospace"
            fill={i === 0 ? "hsl(238,70%,75%)" : i === 3 || i === 6 ? "hsl(45,75%,65%)" : "hsl(238,50%,65%)"}
            fillOpacity="0.8"
          >
            {label}
          </text>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="2.5" fill="hsl(238,70%,68%)" fillOpacity="0.7" />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <div className="home-section-label mb-3">{children}</div>;
}

export default function Home() {
  return (
    <div className="home-shell">
      <section className="home-hero relative">
        <div className="absolute inset-0 z-[-1]">
          <img src={heroImg} alt="" aria-hidden="true" className="h-full w-full object-cover object-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-background" />
        </div>

        <div className="container relative z-10 py-20 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div className="home-reveal max-w-2xl">
              <div className="home-kicker" data-testid="text-home-kicker">Creation architecture · field notes 01</div>
              <h1 className="home-hero-title mt-7 font-serif font-medium text-foreground">
                Your birth chart is not a personality profile. It is a map of the{" "}
                <span className="text-gradient-indigo">creative forces</span>{" "}
                you were born with.
              </h1>
              <div className="home-reveal-line mt-8 h-px w-24 bg-primary/55" />
              <p className="home-hero-copy mt-7">
                Astral Forge translates those planetary positions into a functional system: nine creative functions, six archetypal signatures, and a precise blueprint of where your energy gains momentum, where it stalls, and how to refine it toward mastery.
              </p>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link href="/reports/blueprint" className="home-cta home-cta-primary" data-testid="link-free-blueprint-hero">
                  Get Your Free Blueprint Preview <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#reports" className="home-cta home-cta-secondary" data-testid="link-explore-reports-hero">
                  Explore reports
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground/75">
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" /> No account required</span>
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent" /> Free preview included</span>
              </div>
            </div>

            <div className="home-reveal flex items-center justify-center [animation-delay:180ms]" aria-label="Creation enneagram">
              <EnneagramSVG />
            </div>
          </div>
        </div>
      </section>

      <section id="system" className="border-y border-border/50 bg-card/30">
        <div className="container py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
            <div>
              <SectionLabel>The system / not a profile</SectionLabel>
              <h2 className="font-serif text-4xl font-medium leading-[1.05] sm:text-5xl">Astrology as a creation architecture.</h2>
              <div className="mt-7 space-y-4 text-[0.98rem] leading-relaxed text-foreground/70">
                <p>Your birth chart is not a personality profile. It is a map of the creative forces you were born with — the specific mechanics of how you initiate, communicate, transform, and sustain everything you build.</p>
                <p>Astral Forge translates those positions into a functional system: nine creative functions, six archetypal signatures, and a precise blueprint of where your energy gains momentum, where it stalls, and how to refine it toward mastery.</p>
              </div>
            </div>
            <div className="space-y-4">
              {FORCES.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`home-info-card flex items-start gap-4 rounded-xl border bg-card/35 p-5 sm:p-6 ${item.border}`} style={{ "--card-accent": `var(--${index === 0 ? "accent" : index === 1 ? "primary" : "chart-3"})` } as CSSProperties} data-testid={`card-force-${index}`}>
                    <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${item.accent}`} strokeWidth={1.4} />
                    <div>
                      <div className={`mb-2 font-mono text-[10px] uppercase tracking-[0.18em] ${item.accent}`}>{item.label}</div>
                      <p className="text-sm leading-relaxed text-foreground/70">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>The translation / three movements</SectionLabel>
            <h2 className="max-w-2xl font-serif text-4xl font-medium leading-tight sm:text-5xl">From sky pattern to working method.</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">A blueprint is useful because it gives your intuition a structure it can return to.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-3">
          {[
            { number: "01", title: "Locate the force", text: "See which planetary functions are strongest in your architecture and what each one is here to do.", icon: Layers3 },
            { number: "02", title: "Read the mechanism", text: "Understand the relationships between those forces: the amplifiers, friction points, and hidden constraints.", icon: Boxes },
            { number: "03", title: "Apply the pattern", text: "Turn the read into a repeatable creative practice for decisions, projects, relationships, and value.", icon: DraftingCompass },
          ].map(({ number, title, text, icon: MovementIcon }) => {
            return (
              <div key={number} className="bg-card/70 p-7 sm:p-8" data-testid={`card-movement-${number}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-[0.18em] text-accent">{number}</span>
                  <MovementIcon className="h-5 w-5 text-primary/75" strokeWidth={1.4} />
                </div>
                <h3 className="mt-12 font-serif text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/50 bg-card/20">
        <div className="container py-20 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionLabel>Daily Forge / live conditions</SectionLabel>
              <h2 className="font-serif text-4xl font-medium leading-tight sm:text-5xl">Your chart, active in real time.</h2>
              <div className="mt-6 space-y-4 leading-relaxed text-foreground/70">
                <p>The Daily Forge reads today's planetary positions against your natal chart and identifies the most significant active transit — the specific contact shaping the conditions of your day.</p>
                <p>Not a horoscope. Not a mood forecast. A targeted, actionable read on what the sky is actually doing to your specific blueprint right now.</p>
              </div>
              <Link href="/daily-forge" className="home-cta home-cta-secondary mt-8" data-testid="link-daily-forge">
                Open Daily Forge <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {DAILY_FORGE.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`home-info-card flex items-start gap-4 rounded-xl border bg-card/35 p-5 ${item.border}`} data-testid={`card-daily-forge-${index}`}>
                    <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${item.accent}`} strokeWidth={1.4} />
                    <div>
                      <div className={`mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${item.accent}`}>{item.label}</div>
                      <p className="text-sm leading-relaxed text-foreground/70">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="reports" className="container py-20 sm:py-28">
        <div className="mb-12 max-w-2xl">
          <SectionLabel>Explore your blueprint</SectionLabel>
          <h2 className="font-serif text-4xl font-medium sm:text-5xl">Four ways to read your architecture.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">Each report reads the same natal chart through a different lens. Start with the free Blueprint preview, then go as deep as the work requires.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {REPORTS.map((report, index) => (
            <article key={report.to} className={`home-report-card group flex flex-col rounded-2xl border bg-card/55 p-6 ${report.accent}`} data-testid={`card-report-${index}`}>
              <div className="relative z-10 flex items-start justify-between gap-3">
                <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${report.badge}`}>{report.kicker}</span>
                <span className="shrink-0 font-mono text-xs text-foreground/55">{report.price}</span>
              </div>
              <h3 className="relative z-10 mt-7 font-serif text-2xl leading-snug">{report.headline}</h3>
              <p className="relative z-10 mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{report.desc}</p>
              <ul className="relative z-10 mt-6 space-y-2.5">
                {report.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/70"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />{feature}</li>)}
              </ul>
              <Link href={report.to} className={`home-cta relative z-10 mt-7 w-full justify-between ${report.ctaVariant === "primary" ? "home-cta-primary" : "home-cta-secondary"}`} data-testid={`link-report-${index}`}>
                {report.cta}<ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary"><Package className="h-6 w-6" /></div>
              <div><div className="home-section-label mb-1 text-primary">Best value</div><h3 className="font-serif text-xl">Full Blueprint + Lab Synastry Bundle</h3><p className="mt-1 text-sm text-muted-foreground">Your Full Blueprint Reading and a premium synastry narrative layer on the Lab Compare page.</p></div>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end"><span className="font-serif text-3xl text-gradient-gold">$60</span><Link href="/reports/blueprint" className="home-cta home-cta-primary" data-testid="link-bundle"><Package className="h-4 w-4" /> Get the Bundle</Link><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">One-time · Permanent access</span></div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/50 bg-card/20">
        <div className="container py-20 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center"><SectionLabel>A new framework</SectionLabel><h2 className="font-serif text-4xl font-medium sm:text-5xl">Astrology transformed into application.</h2></div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/40 bg-card/40 p-8"><div className="mb-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Traditional astrology</div><p className="font-serif text-3xl text-foreground/55">“Who am I?”</p><div className="mt-7 space-y-3 text-sm leading-relaxed text-muted-foreground"><p>Interprets planetary positions as personality traits, archetypes, and descriptions of the self.</p><p>Produces a profile. Valuable as self-knowledge — limited as an operational system.</p></div></div>
              <div className="blueprint-grid rounded-2xl border border-primary/30 bg-primary/[0.05] p-8"><div className="mb-5 font-mono text-[10px] uppercase tracking-widest text-primary">Astral Forge</div><p className="font-serif text-3xl text-gradient-gold">“How do I create?”</p><div className="mt-7 space-y-3 text-sm leading-relaxed text-foreground/75"><p>Translates planetary positions into the mechanics of how you generate force, translate ideas, build value, and sustain what you create.</p><p>Produces a blueprint. Readable, refinable, and directly applicable to the work.</p></div></div>
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-center text-lg leading-relaxed text-foreground/60">Astral Forge does not describe personality. It reveals the creative architecture encoded in the natal chart.</p>
          </div>
        </div>
      </section>

      <section className="container py-24 text-center sm:py-32">
        <div className="mx-auto max-w-2xl">
          <Sparkles className="mx-auto mb-6 h-9 w-9 text-primary" strokeWidth={1.2} />
          <h2 className="font-serif text-4xl font-medium leading-tight sm:text-6xl">Your blueprint already exists.</h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground/60">The question is whether you understand the architecture behind it.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/reports/blueprint" className="home-cta home-cta-primary" data-testid="link-free-blueprint-final">Get Your Free Blueprint Preview <ArrowRight className="h-4 w-4" /></Link><a href="#reports" className="home-cta home-cta-secondary" data-testid="link-explore-reports-final">Explore reports</a></div>
          <p className="mt-5 font-mono text-xs text-muted-foreground/60">No account required · Free preview included</p>
        </div>
      </section>
    </div>
  );
}