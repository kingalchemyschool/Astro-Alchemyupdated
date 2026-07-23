import { Link } from "wouter";
import { ArrowRight, Circle, Package } from "lucide-react";
import { Button } from "@/components/common/Button";
import heroImg from "@/assets/hero-blueprint.png";

// ─── Report cards ─────────────────────────────────────────────────────────────

const REPORTS = [
  {
    to: "/reports/blueprint",
    kicker: "Full Blueprint Reading",
    price: "Free preview · $44 full",
    headline: "Your complete personal blueprint.",
    desc: "A complete exploration of your personal blueprint, revealing the core patterns, strengths, and themes that shape how you think, create, relate, and build your life. Gain deeper insight into your natural tendencies, untapped potential, and the unique architecture behind your path forward.",
    features: [
      "Complete planetary function analysis",
      "Your primary Alchemist Archetype",
      "Interactive creation enneagram",
      "Sign, house, and aspect readings",
      "Deep function readings (paid)",
    ],
    accent: "border-accent/40 hover:border-accent/70",
    badge: "text-accent border-accent/30 bg-accent/10",
    cta: "Get Your Free Blueprint Preview",
    ctaVariant: "primary" as const,
  },
  {
    to: "/reports/archetype",
    kicker: "Alchemy Archetype Reading",
    price: "$9",
    headline: "The mechanisms behind your creation.",
    desc: "A personalized exploration of your unique archetypal signature. Discover the qualities, themes, and creative patterns that define your expression and reveal the deeper nature of how you move through the world.",
    features: [
      "Six planetary relationship readings",
      "Mechanism → Archetype → Mastery arc",
      "Observable behavior and failure modes",
      "Element and aspect-specific analysis",
      "Full developmental edge per archetype",
    ],
    accent: "border-primary/40 hover:border-primary/60",
    badge: "text-primary border-primary/30 bg-primary/10",
    cta: "Explore Archetypes",
    ctaVariant: "secondary" as const,
  },
  {
    to: "/reports/wealth",
    kicker: "Conscious Wealth Reading",
    price: "$22",
    headline: "Transform potential into lasting value.",
    desc: "A focused exploration of your relationship with value, creation, and prosperity. Discover the patterns that influence how you generate impact, cultivate resources, and build wealth that aligns with your deeper potential.",
    features: [
      "Impact: how force becomes consequence",
      "Wealth: how consequence becomes value",
      "Consciousness: how value becomes mastery",
      "Core Archetype + Wealth Formula",
      "Reflection questions per force",
    ],
    accent: "border-violet-500/30 hover:border-violet-500/50",
    badge: "text-violet-400 border-violet-500/20 bg-violet-500/10",
    cta: "Explore Wealth Blueprint",
    ctaVariant: "secondary" as const,
  },
  {
    to: "/compare",
    kicker: "Laboratory Reading",
    price: "Free",
    headline: "Discover what two blueprints create together.",
    desc: "A comparative exploration of two individual blueprints, revealing the dynamics, strengths, and opportunities within a connection. Understand how two people influence, support, and challenge each other through shared experiences.",
    features: [
      "Seven-function cross-analysis",
      "Amplifiers and operational constraints",
      "Laboratory climate + health indicators",
      "Predicted creation cycle",
      "Executive summary for the partnership",
    ],
    accent: "border-violet-500/30 hover:border-violet-500/50",
    badge: "text-violet-400 border-violet-500/20 bg-violet-500/10",
    cta: "Run the Laboratory",
    ctaVariant: "secondary" as const,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div>

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Creation architecture blueprint"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background" />
        </div>

        <div className="container relative py-24 sm:py-32 flex flex-col items-center text-center animate-fade-in-up">

          <h1 className="font-serif text-5xl font-semibold tracking-wide text-gradient-indigo sm:text-6xl lg:text-7xl">
            Astral Forge
          </h1>

          {/* Welcome line */}
          <p className="mt-4 font-mono text-sm uppercase tracking-widest text-primary/80">
            Welcome — your natal chart, reforged as a creation blueprint
          </p>

          {/* Divider */}
          <div className="mt-8 w-16 border-t border-primary/30" />

          {/* About */}
          <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-foreground/75">
            <p>
              Your birth chart is not a personality profile. It is a map of the
              creative forces you were born with — the specific mechanics of how
              you initiate, communicate, transform, and sustain everything you
              build.
            </p>
            <p>
              Astral Forge translates those planetary positions into a functional
              system: nine creative functions, six archetypal signatures, and a
              precise blueprint of where your energy gains momentum, where it
              stalls, and how to refine it toward mastery.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#reports">
              <Button size="lg" className="border border-border hover:border-primary/60 hover:text-primary bg-[#89b0e6] text-[color:var(--color-slate-700)]">
                Explore Reports
              </Button>
            </a>
          </div>

        </div>
      </section>

      {/* ── 2. EXPLAIN THE SYSTEM ── */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container py-20">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

            {/* Left — narrative */}
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
                The System
              </div>
              <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                Astrology as a creation architecture.
              </h2>
              <div className="mt-6 space-y-4 leading-relaxed text-foreground/75">
                <p>
                  Astral Forge translates your natal chart into a functional
                  system of creation. The planets are not symbols of who you
                  are — they are representations of specific creative forces:
                  how you initiate, communicate, transform, expand, refine, and
                  sustain what you build.
                </p>
                <p>
                  The relationships between those forces reveal the mechanics
                  that are unique to your blueprint. Not traits. Not destiny.
                  The actual architecture of how you create — and where it
                  gains momentum, where it stalls, and how to refine it toward
                  mastery.
                </p>
              </div>
            </div>

            {/* Right — three forces */}
            <div className="space-y-4">
              {[
                {
                  glyph: "☉",
                  label: "The planets",
                  text: "Each planet in your chart is a specific creative force — Essence, Force, Genius, Expansion, Value, Foundation. Together they form a complete creation cycle.",
                  accent: "text-accent",
                  border: "border-accent/20 bg-accent/[0.03]",
                },
                {
                  glyph: "⟡",
                  label: "The relationships",
                  text: "The aspects between planets reveal your unique mechanisms — where forces amplify each other, where they create productive friction, and where development is required.",
                  accent: "text-primary",
                  border: "border-primary/20 bg-primary/[0.03]",
                },
                {
                  glyph: "◈",
                  label: "The blueprint",
                  text: "Your chart becomes a readable architecture — a map of how you build, communicate, grow, and create impact. No two blueprints are identical.",
                  accent: "text-violet-400",
                  border: "border-violet-500/20 bg-violet-500/[0.03]",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-start gap-4 rounded-xl border p-5 ${item.border}`}
                >
                  <span className={`glyph mt-0.5 shrink-0 text-2xl ${item.accent}`}>
                    {item.glyph}
                  </span>
                  <div>
                    <div className={`mb-1.5 font-mono text-[10px] uppercase tracking-widest ${item.accent}`}>
                      {item.label}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/75">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Daily Forge intro ── */}
      <section className="container py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
              Daily Forge
            </div>
            <h2 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              Your chart, active in real time.
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-foreground/75">
              <p>
                The Daily Forge reads today's planetary positions against your natal chart and identifies the most significant active transit — the specific planetary contact that is shaping the conditions of your day.
              </p>
              <p>
                Each day you get a precise breakdown: which of your natal points is under pressure, what kind of pressure it is, which area of your life it activates, and what that means in practical terms. Not a horoscope. Not a mood forecast. A targeted, actionable read on what the sky is actually doing to your specific blueprint right now.
              </p>
            </div>
            <div className="mt-8">
              <Link to="/daily-forge">
                <Button variant="outline">
                  Open Daily Forge <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                glyph: "◎",
                label: "The transit",
                text: "Today's planetary positions are read against your natal chart to find the tightest, most significant active contact — the aspect shaping your day right now.",
                accent: "text-accent",
                border: "border-accent/20 bg-accent/[0.03]",
              },
              {
                glyph: "⧖",
                label: "The pressure",
                text: "Each transit creates a specific type of condition — a square produces friction that demands resolution, a trine opens flow, a conjunction intensifies. The Forge names exactly what kind of pressure is at work.",
                accent: "text-primary",
                border: "border-primary/20 bg-primary/[0.03]",
              },
              {
                glyph: "◈",
                label: "The application",
                text: "You get a concrete daily protocol: what to do, what pattern to avoid, and what to practice — built directly from the transit, your natal planet, and the house it occupies.",
                accent: "text-violet-400",
                border: "border-violet-500/20 bg-violet-500/[0.03]",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-start gap-4 rounded-xl border p-5 ${item.border}`}
              >
                <span className={`glyph mt-0.5 shrink-0 text-2xl ${item.accent}`}>
                  {item.glyph}
                </span>
                <div>
                  <div className={`mb-1.5 font-mono text-[10px] uppercase tracking-widest ${item.accent}`}>
                    {item.label}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/75">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. REPORTS ── */}
      <section id="reports" className="container py-24">
        <div className="mb-14">
          <div className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
            Explore Your Blueprint
          </div>
          <h2 className="font-serif text-4xl font-semibold">
            Four ways to read your architecture.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
            Each report reads the same natal chart through a different lens.
            Start with the free Blueprint preview, then go as deep as the work requires.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {REPORTS.map((r) => (
            <div
              key={r.to}
              className={`group flex flex-col rounded-2xl border bg-card/60 p-6 transition-all duration-200 hover:-translate-y-1 ${r.accent}`}
            >
              {/* Badge + price */}
              <div className="mb-5 flex items-start justify-between gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${r.badge}`}>
                  {r.kicker}
                </span>
                <span className="font-mono text-xs font-semibold text-foreground/60 shrink-0">
                  {r.price}
                </span>
              </div>

              {/* Headline + desc */}
              <h3 className="font-serif text-xl font-semibold leading-snug">
                {r.headline}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground flex-1">
                {r.desc}
              </p>

              {/* Feature list */}
              <ul className="mt-5 space-y-2">
                {r.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground/75">
                    <span className="mt-0.5 text-accent shrink-0">✷</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to={r.to} className="mt-6 block">
                <Button
                  variant={r.ctaVariant === "primary" ? "primary" : "secondary"}
                  className="w-full justify-between"
                >
                  {r.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bundle highlight card */}
        <div className="mt-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-primary mb-1">
                  Best Value
                </div>
                <h3 className="font-serif text-xl font-semibold">
                  Full Blueprint + Lab Synastry Bundle
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Unlocks your Full Blueprint Reading <em>and</em> a premium synastry narrative layer on the Lab Compare page.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <span className="font-serif text-3xl font-semibold text-gradient-gold">$60</span>
              <Link to="/reports/blueprint">
                <Button size="lg">
                  <Package className="h-4 w-4" /> Get the Bundle
                </Button>
              </Link>
              <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                One-time · Permanent access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. DIFFERENTIATION ── */}
      <section className="border-t border-border/50 bg-card/20">
        <div className="container py-24">
          <div className="mx-auto max-w-4xl">
            <div className="font-mono text-xs uppercase tracking-widest text-accent mb-3 text-center">
              A New Framework
            </div>
            <h2 className="font-serif text-center text-3xl font-semibold sm:text-4xl">
              Astrology transformed into application.
            </h2>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {/* Traditional */}
              <div className="rounded-2xl border border-border/40 bg-card/40 p-8">
                <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Traditional Astrology
                </div>
                <p className="font-serif text-2xl font-semibold text-foreground/60 leading-snug">
                  "Who am I?"
                </p>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>Interprets planetary positions as personality traits, archetypes, and descriptions of the self.</p>
                  <p>Produces a profile. Valuable as self-knowledge — limited as an operational system.</p>
                </div>
              </div>

              {/* Astral Forge */}
              <div className="rounded-2xl border border-primary/30 bg-primary/[0.05] p-8 blueprint-grid">
                <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-primary">
                  Astral Forge
                </div>
                <p className="font-serif text-2xl font-semibold text-gradient-gold leading-snug">
                  "How do I create?"
                </p>
                <div className="mt-6 space-y-3 text-sm text-foreground/75 leading-relaxed">
                  <p>Translates planetary positions into a functional architecture — the mechanics of how you generate force, translate ideas, build value, and sustain what you create.</p>
                  <p>Produces a blueprint. Readable, refinable, and directly applicable to the work.</p>
                </div>
              </div>
            </div>

            <p className="mt-10 text-center text-lg leading-relaxed text-foreground/60 max-w-2xl mx-auto">
              Astral Forge does not describe personality. It reveals the creative
              architecture encoded in the natal chart — the mechanics behind how
              a person generates vision, applies force, communicates ideas,
              creates value, and builds something lasting.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. FINAL CTA ── */}
      <section className="container py-28 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="glyph mb-6 text-5xl text-primary">✷</div>
          <h2 className="font-serif text-4xl font-semibold sm:text-5xl leading-tight">
            Your blueprint already exists.
          </h2>
          <p className="mt-5 text-lg text-foreground/60 leading-relaxed">
            The question is whether you understand the architecture behind it.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/reports/blueprint">
              <Button size="lg">
                Get Your Free Blueprint Preview <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#reports">
              <Button size="lg" className="border border-border hover:border-primary/60 hover:text-primary bg-[#89b0e6] text-[color:var(--color-slate-700)]">
                Explore Reports
              </Button>
            </a>
          </div>
          <p className="mt-5 font-mono text-xs text-muted-foreground/60">
            No account required · Free preview included
          </p>
        </div>
      </section>

    </div>
  );
}
