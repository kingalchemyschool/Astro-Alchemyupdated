import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { ChevronDown, LogOut, LogIn, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const REPORTS = [
  {
    to: "/reports/blueprint",
    label: "Blueprint Report",
    kicker: "Free preview · $44 full",
    desc: "Nine functions decoded — one insight per planet, with the full multi-paragraph reading unlockable.",
  },
  {
    to: "/reports/archetype",
    label: "Archetype Report",
    kicker: "Free",
    desc: "A personalized exploration of your unique archetypal signature — six planetary functions, six archetypes.",
  },
  {
    to: "/reports/wealth",
    label: "Wealth Blueprint",
    kicker: "Paid · $22",
    desc: "Impact, Wealth, and Consciousness — a diagnostic system for how you transform potential into reality.",
  },
  {
    to: "/compare",
    label: "Laboratory Synastry",
    kicker: "Lab Reading",
    desc: "A comparative exploration of two individual blueprints — the dynamics, strengths, and opportunities within a connection.",
  },
];

export default function Header() {
  const [pathname] = useLocation();
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const isReportActive = pathname.startsWith("/reports") || pathname === "/compare";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container flex flex-col items-center pt-3 pb-1">
        {/* Logo — centered above nav */}
        <Link to="/" className="group mb-1">
          <img
            src="/logo.png"
            alt="Astral Forge"
            className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Nav — centered below logo */}
        <nav className="flex items-center gap-1">
          {/* Home */}
          <Link
            to="/"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Home
          </Link>

          {/* Reports dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isReportActive || open
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Reports
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </button>

            {open && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-56 rounded-xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-md overflow-hidden">
                {REPORTS.map((r, i) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    className={cn(
                      "block px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/5",
                      i > 0 && "border-t border-border/40",
                      pathname === r.to ? "text-primary bg-primary/5" : "text-foreground"
                    )}
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Daily Forge */}
          <Link
            to="/daily-forge"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              pathname === "/daily-forge" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Daily Forge
          </Link>

          {/* My Blueprints — only when signed in */}
          {isLoaded && isSignedIn && (
            <Link
              to="/my-charts"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/my-charts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookMarked className="h-3.5 w-3.5" />
              My Blueprints
            </Link>
          )}

          {/* Dev bypass — only visible in local dev builds */}
          {import.meta.env.DEV && (
            <Link
              to="/dev-unlock"
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-colors border",
                pathname === "/dev-unlock"
                  ? "border-amber-500/60 bg-amber-900/40 text-amber-300"
                  : "border-amber-900/40 bg-amber-900/20 text-amber-500 hover:text-amber-300 hover:border-amber-500/50"
              )}
            >
              dev
            </Link>
          )}

          {/* Auth button — show Sign In until we know the user is signed in */}
          {(!isLoaded || !isSignedIn) && (
            <Link
              to="/sign-in"
              className="ml-1 flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          )}

          {isLoaded && isSignedIn && (
            <button
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
              className="ml-1 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </nav>
      </div>
    </header>

  );
}
