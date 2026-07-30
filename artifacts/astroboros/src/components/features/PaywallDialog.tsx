import { useState } from "react";
import { Lock, Loader2, CreditCard, ShieldCheck, X, Package, LogIn } from "lucide-react";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { Button } from "@/components/common/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called when the user clicks the primary unlock button. Redirects to Stripe. */
  onSuccess: () => Promise<boolean>;
  /**
   * Optional bundle upgrade handler. When provided, a "Bundle" option is shown.
   * For Blueprint: shows the $60 Blueprint + Lab Synastry bundle.
   */
  onBundle?: () => Promise<boolean>;
  /** Product being unlocked — drives copy and price display. */
  product?: "blueprint" | "wealth";
}

const COPY = {
  blueprint: {
    title: "Unlock Your Full Blueprint",
    description:
      "A complete exploration of your personal blueprint, revealing the core patterns, strengths, and themes that shape how you think, create, relate, and build your life.",
    price: "$44",
    priceLabel: "Full Blueprint Reading",
    features: [
      "Full multi-paragraph reading for every function",
      "Rich aspect synthesis for each planet",
      "All three threshold readings decoded",
      "Six Alchemist Archetype deep readings",
      "Your personalised Blueprint Journey",
    ],
  },
  wealth: {
    title: "Unlock Your Wealth Reading",
    description:
      "A focused exploration of your relationship with value, creation, and prosperity. Discover the patterns that influence how you generate impact, cultivate resources, and build wealth that aligns with your deeper potential.",
    price: "$22",
    priceLabel: "Conscious Wealth Reading",
    features: [
      "Impact, Wealth, and Consciousness decoded",
      "Core Archetype + Wealth Formula",
      "Three planetary system analysis",
      "Reflection questions per force",
    ],
  },
};

export default function PaywallDialog({
  open,
  onClose,
  onSuccess,
  onBundle,
  product = "blueprint",
}: Props) {
  const [processing, setProcessing] = useState<"primary" | "bundle" | null>(null);
  // isLoaded = false when Clerk hasn't initialised yet (dev env). Treat as
  // "unknown" — don't block if we can't determine auth state.
  const { isLoaded, isSignedIn } = useUser();
  const [, navigate] = useLocation();

  if (!open) return null;

  const copy = COPY[product];
  const needsSignIn = isLoaded && !isSignedIn;

  const goSignIn = () => {
    onClose();
    navigate(`/sign-in`);
  };

  const handlePrimary = async () => {
    if (needsSignIn) { goSignIn(); return; }
    setProcessing("primary");
    await onSuccess();
    // If we get here, the redirect failed
    setProcessing(null);
  };

  const handleBundle = async () => {
    if (!onBundle) return;
    if (needsSignIn) { goSignIn(); return; }
    setProcessing("bundle");
    await onBundle();
    // If we get here, the redirect failed
    setProcessing(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-2xl font-semibold">{copy.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>

        {/* Primary product */}
        <div className="my-5 rounded-lg border border-border bg-secondary/40 p-4">
          <div className="flex items-end justify-between">
            <span className="text-sm text-muted-foreground">
              {copy.priceLabel}
            </span>
            <span className="font-serif text-3xl font-semibold text-gradient-gold">
              {copy.price}
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
            {copy.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-accent" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {needsSignIn && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/[0.06] px-3 py-2.5 text-sm text-foreground/80">
            <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Sign in to purchase — your reading is saved to your account.</span>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handlePrimary}
          disabled={processing !== null}
        >
          {processing === "primary" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to
              checkout…
            </>
          ) : needsSignIn ? (
            <>
              <LogIn className="h-4 w-4" /> Sign in to unlock
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" /> Unlock for {copy.price}
            </>
          )}
        </Button>

        {/* Bundle option — Blueprint only */}
        {onBundle && (
          <>
            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-border/60" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Or get more
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4 mb-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    Bundle
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Full Blueprint + Lab Synastry Premium
                  </p>
                </div>
                <span className="font-serif text-2xl font-semibold text-gradient-gold">
                  $60
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={handleBundle}
              disabled={processing !== null}
            >
              {processing === "bundle" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" /> Get the Bundle — $60
                </>
              )}
            </Button>
          </>
        )}

        <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
          Secure checkout via Stripe · One-time payment
        </p>
      </div>
    </div>
  );
}
