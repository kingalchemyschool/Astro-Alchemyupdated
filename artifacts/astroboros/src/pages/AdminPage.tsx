import { useUser, useClerk, SignIn } from "@clerk/react";
import { Link } from "wouter";
import { LogOut, Shield, Users, BookOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkAppearance = {
  variables: {
    colorPrimary: "#C9913D",
    colorForeground: "#EDE8DC",
    colorMutedForeground: "#8892A4",
    colorBackground: "#0C1120",
    colorInput: "#141B2E",
    colorNeutral: "#2A3352",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "w-[440px] max-w-full overflow-hidden rounded-2xl",
    card: "!shadow-none !border-0 !rounded-none",
    footer: "!shadow-none !border-0 !rounded-none",
    headerTitle: { color: "#EDE8DC", fontFamily: "'Fraunces', serif", fontSize: "1.5rem" },
    headerSubtitle: { color: "#8892A4" },
    formButtonPrimary: "bg-[#C9913D] hover:bg-[#B8812D] text-[#0A0D18] font-semibold",
    formFieldInput: "bg-[#141B2E] border-[#2A3352] text-[#EDE8DC] placeholder:text-[#8892A4]",
    footerAction: "bg-[#0C1120]",
    dividerLine: "bg-[#2A3352]",
    main: "bg-[#0C1120]",
  },
};

const STAT_CARDS = [
  { icon: Users,     label: "Total Users",   value: "—", note: "Clerk dashboard" },
  { icon: BookOpen,  label: "Reports Generated", value: "—", note: "Client-side only" },
  { icon: BarChart3, label: "Premium Unlocks", value: "—", note: "API server logs" },
];

export default function AdminPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Not yet loaded
  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  // Not signed in — show admin-specific sign-in
  if (!isSignedIn) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 gap-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-semibold">Administrator Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your Astral Forge admin account to continue.
          </p>
        </div>
        <SignIn
          routing="path"
          path={`${basePath}/admin`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/admin`}
          appearance={clerkAppearance}
        />
      </div>
    );
  }

  // Signed in — show admin dashboard
  return (
    <div className="container max-w-4xl py-12 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent mb-1">
            <Shield className="h-3.5 w-3.5" /> Administrator
          </div>
          <h1 className="font-serif text-3xl font-semibold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {user?.primaryEmailAddress?.emailAddress ?? user?.fullName}
          </p>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border/60 bg-card/50 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <s.icon className="h-4 w-4 text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </span>
            </div>
            <p className="font-serif text-3xl font-semibold">{s.value}</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold">Quick Links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Clerk Dashboard",   href: "https://dashboard.clerk.com",  note: "User management & auth" },
            { label: "API Server Logs",   href: "#",                             note: "View workflow logs in Replit" },
            { label: "Blueprint Reports", href: `${basePath}/reports/blueprint`, note: "Blueprint report (as user)" },
            { label: "Wealth Blueprint",  href: `${basePath}/reports/wealth`,    note: "Wealth report (as user)" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={cn(
                "block rounded-lg border border-border/50 p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors",
                item.href === "#" && "pointer-events-none opacity-40"
              )}
            >
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-border/40 pt-4">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Astral Forge
        </Link>
      </div>
    </div>
  );
}
