/**
 * /dev-unlock — developer bypass for all paid readings.
 *
 * Calls POST /api/premium/unlock (disabled in production) to get a signed
 * dev-bypass token, then stores it for all three products so every gated
 * section opens without going through Stripe.
 *
 * The API endpoint returns HTTP 410 in production, so this page is effectively
 * inert outside of a local dev environment.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle, XCircle, Loader2, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOKEN_KEYS = {
  blueprint: "astral_forge_token_blueprint",
  wealth:    "astral_forge_token_wealth",
  bundle:    "astral_forge_token_bundle",
  forge:     "astral_forge_token_forge",
} as const;

const DEV_UNLOCK_KEY = "astral_forge_dev_unlock";

function storeTokenForAllProducts(token: string) {
  for (const key of Object.values(TOKEN_KEYS)) {
    localStorage.setItem(key, token);
  }
  // Also set the simple flag checked by useReading in DEV mode.
  localStorage.setItem(DEV_UNLOCK_KEY, "1");
}

function revokeAll() {
  for (const key of Object.values(TOKEN_KEYS)) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(DEV_UNLOCK_KEY);
}

function isAlreadyUnlocked(): boolean {
  return (
    localStorage.getItem(DEV_UNLOCK_KEY) === "1" ||
    Object.values(TOKEN_KEYS).some((k) => !!localStorage.getItem(k))
  );
}

type Status = "idle" | "loading" | "success" | "error" | "prod";

export default function DevUnlock() {
  const [status, setStatus] = useState<Status>("idle");
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setAlreadyUnlocked(isAlreadyUnlocked());
  }, []);

  async function unlock() {
    setStatus("loading");
    try {
      const res = await fetch("/api/premium/unlock", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 410) {
        setStatus("prod");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error ?? `Server returned ${res.status}`);
        setStatus("error");
        return;
      }

      const data = await res.json();
      if (typeof data.token !== "string") {
        setErrorMsg("Server returned an unexpected response.");
        setStatus("error");
        return;
      }

      storeTokenForAllProducts(data.token);
      setAlreadyUnlocked(true);
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Network error.");
      setStatus("error");
    }
  }

  function revoke() {
    revokeAll();
    setAlreadyUnlocked(false);
    setStatus("idle");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-900/30 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <ShieldOff className="h-6 w-6 text-amber-400" />
          <h1 className="text-xl font-semibold text-amber-100">Dev Bypass</h1>
          <span className="ml-auto rounded-full bg-amber-900/50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-amber-400">
            Dev only
          </span>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-slate-400">
          Issues a signed bypass token and stores it locally for all three
          products — <strong className="text-slate-300">Blueprint</strong>,{" "}
          <strong className="text-slate-300">Wealth</strong>, and{" "}
          <strong className="text-slate-300">Bundle</strong> — so every gated
          section opens without going through Stripe.
        </p>

        {/* Status area */}
        {status === "success" && (
          <div className="mb-5 flex items-start gap-2 rounded-lg bg-emerald-900/30 p-3 text-sm text-emerald-300">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>All readings unlocked. Tokens stored in localStorage.</span>
          </div>
        )}

        {status === "error" && (
          <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-900/30 p-3 text-sm text-red-300">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "prod" && (
          <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-900/30 p-3 text-sm text-red-300">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              This endpoint is disabled in production. Run the app locally to
              use the dev bypass.
            </span>
          </div>
        )}

        {alreadyUnlocked && status !== "success" && (
          <div className="mb-5 flex items-start gap-2 rounded-lg bg-emerald-900/30 p-3 text-sm text-emerald-300">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Bypass already active — tokens found in localStorage.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={unlock}
            disabled={status === "loading"}
            className="w-full bg-amber-600 text-white hover:bg-amber-500"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing token…
              </>
            ) : (
              "Unlock all readings"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={revoke}
            className="w-full border-slate-700 text-slate-400 hover:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Revoke bypass
          </Button>
        </div>

        {/* Quick links */}
        <div className="mt-6 border-t border-slate-800 pt-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            Jump to
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/reports/blueprint" className="rounded-lg border border-slate-700 px-3 py-2 text-center text-slate-300 transition hover:border-amber-700 hover:text-amber-300">
              Blueprint
            </Link>
            <Link href="/reports/wealth" className="rounded-lg border border-slate-700 px-3 py-2 text-center text-slate-300 transition hover:border-amber-700 hover:text-amber-300">
              Wealth
            </Link>
            <Link href="/reports/archetype" className="rounded-lg border border-slate-700 px-3 py-2 text-center text-slate-300 transition hover:border-amber-700 hover:text-amber-300">
              Archetype
            </Link>
            <Link href="/reading" className="rounded-lg border border-slate-700 px-3 py-2 text-center text-slate-300 transition hover:border-amber-700 hover:text-amber-300">
              Reading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
