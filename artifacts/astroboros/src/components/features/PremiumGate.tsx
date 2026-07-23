import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Lock } from "lucide-react";
import { Button } from "@/components/common/Button";
import PaywallDialog from "@/components/features/PaywallDialog";

interface Props {
  premium: boolean;
  onUnlock?: () => Promise<boolean>;
  /** Optional bundle upgrade handler passed through to PaywallDialog. */
  onBundle?: () => Promise<boolean>;
  title: string;
  description: string;
  price?: string;
  product?: "blueprint" | "wealth";
  children: ReactNode;
}

// Wraps paid content: shows it directly when unlocked, or a blurred preview with
// a checkout call-to-action (live view) / "create your own" link (shared view).
export default function PremiumGate({
  premium,
  onUnlock,
  onBundle,
  title,
  description,
  price = "$44",
  product = "blueprint",
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  if (premium) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60">
      <div
        className="pointer-events-none max-h-[560px] select-none overflow-hidden blur-[7px]"
        aria-hidden
      >
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-background/30 via-background/70 to-background px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-card text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <p className="font-serif text-2xl font-semibold">{title}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {onUnlock ? (
          <Button size="lg" onClick={() => setOpen(true)}>
            Unlock — {price}
          </Button>
        ) : (
          <Link to="/reading">
            <Button size="lg">Create your own blueprint</Button>
          </Link>
        )}
      </div>
      {onUnlock && (
        <PaywallDialog
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={onUnlock}
          onBundle={onBundle}
          product={product}
        />
      )}
    </div>
  );
}
