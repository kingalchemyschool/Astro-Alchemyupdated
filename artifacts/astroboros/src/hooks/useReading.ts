import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { BirthInput, Reading } from "@/types/astro";
import { computeChart } from "@/lib/ephemeris";
import { generateReading } from "@/lib/reading";

const READING_KEY = "astral_forge_reading";
const DEV_UNLOCK_KEY = "astral_forge_dev_unlock";

// Per-product token keys. Storing separately allows independent product unlocks.
type Product = "blueprint" | "wealth" | "bundle" | "forge" | "archetype";
const TOKEN_KEYS: Record<Product, string> = {
  blueprint: "astral_forge_token_blueprint",
  wealth: "astral_forge_token_wealth",
  bundle: "astral_forge_token_bundle",
  forge: "astral_forge_token_forge",
  archetype: "astral_forge_token_archetype",
};

// Legacy single-token key — checked for backward compat, migrated on first load.
const LEGACY_TOKEN_KEY = "astral_forge_premium_token";

/** Verify a stored token for a specific product against the server. */
async function verifyProductToken(token: string, product: Product): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch("/api/premium/verify", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, product }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

/** Start a Stripe Checkout session and redirect to Stripe. */
async function startCheckout(product: Product): Promise<boolean> {
  try {
    const base = window.location.href.split("?")[0];
    const successUrl = `${base}?session_id={CHECKOUT_SESSION_ID}&unlocked_product=${product}`;
    const cancelUrl = window.location.href;

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, successUrl, cancelUrl }),
    });

    if (!res.ok) {
      console.error("Checkout session creation failed:", res.status);
      return false;
    }

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Exchange a completed Stripe session ID for a signed product-scoped token. */
async function redeemSession(
  sessionId: string,
): Promise<{ token: string; product: Product } | null> {
  try {
    const res = await fetch(`/api/stripe/session/${encodeURIComponent(sessionId)}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.token === "string" && data.product) {
      return { token: data.token, product: data.product as Product };
    }
    return null;
  } catch {
    return null;
  }
}

export function useReading() {
  const [reading, setReading] = useState<Reading | null>(null);
  // Track which products are unlocked as a Set for clean bundle support.
  const [unlockedProducts, setUnlockedProducts] = useState<Set<Product>>(() => new Set());

  useEffect(() => {
    // ── 1. Restore any existing reading from localStorage ──────────────────
    try {
      const raw = localStorage.getItem(READING_KEY);
      if (raw) {
        const input = JSON.parse(raw) as BirthInput;
        setReading(generateReading(computeChart(input)));
      }
    } catch {
      // ignore corrupt storage
    }

    // ── 2a. Dev unlock (dev builds only) ──────────────────────────────────────
    const params = new URLSearchParams(window.location.search);
    if (import.meta.env.DEV) {
      const devParam = params.get("dev_unlock");
      if (devParam === "1") {
        localStorage.setItem(DEV_UNLOCK_KEY, "1");
        params.delete("dev_unlock");
        window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
      } else if (devParam === "0") {
        localStorage.removeItem(DEV_UNLOCK_KEY);
        params.delete("dev_unlock");
        window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
      }
      if (localStorage.getItem(DEV_UNLOCK_KEY) === "1") {
        setUnlockedProducts(new Set(["blueprint", "wealth", "bundle", "forge", "archetype"] as Product[]));
        return;
      }
    }

    // ── 2b. Return-from-Stripe: exchange session_id for a product token ─────
    const sessionId = params.get("session_id");
    if (sessionId) {
      params.delete("session_id");
      params.delete("unlocked_product");
      const cleanUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", cleanUrl);

      const loadingToastId = toast.loading("Confirming your payment…");
      redeemSession(sessionId).then((result) => {
        if (result) {
          localStorage.setItem(TOKEN_KEYS[result.product], result.token);
          setUnlockedProducts((prev) => {
            const next = new Set(prev);
            next.add(result.product);
            return next;
          });
          const productLabel =
            result.product === "blueprint"
              ? "Blueprint"
              : result.product === "wealth"
                ? "Wealth"
                : result.product === "bundle"
                  ? "Bundle"
                  : "Daily Forge";
          toast.success(
            `Payment successful! Your ${productLabel} reading is now unlocked.`,
            { id: loadingToastId, duration: 6000 },
          );
        } else {
          toast.dismiss(loadingToastId);
        }
      });
      return; // skip normal verify on this load; we just redeemed
    }

    // ── 3. Migrate legacy single token if present ──────────────────────────
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacyToken) {
      // Legacy tokens (dev-bypass) don't have a product scope — treat as blueprint.
      localStorage.setItem(TOKEN_KEYS.blueprint, legacyToken);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }

    // ── 4. Verify each stored product token server-side ────────────────────
    const products: Product[] = ["blueprint", "wealth", "bundle", "forge", "archetype"];
    const checks = products.map(async (product) => {
      const token = localStorage.getItem(TOKEN_KEYS[product]);
      if (!token) return;
      const valid = await verifyProductToken(token, product);
      if (valid) {
        setUnlockedProducts((prev) => {
          const next = new Set(prev);
          next.add(product);
          return next;
        });
      } else {
        localStorage.removeItem(TOKEN_KEYS[product]);
      }
    });

    void Promise.all(checks);
  }, []);

  const generate = useCallback((input: BirthInput, overrideZodiac?: "tropical" | "sidereal") => {
    // When overrideZodiac differs from the user-stored input.zodiac, compute
    // the chart in the override zodiac WITHOUT updating localStorage — so on
    // reload the user gets back their original saved chart, and the in-memory
    // chart can be temporarily shown in another system (e.g. for the Daily
    // Forge Sidereal/Tropical toggle) without losing their preferred mode.
    const effectiveInput: BirthInput =
      overrideZodiac && overrideZodiac !== input.zodiac
        ? { ...input, zodiac: overrideZodiac }
        : input;
    const result = generateReading(computeChart(effectiveInput));
    setReading(result);
    // Persist the user's literal birth input (with their preferred zodiac).
    // The override is a transient view of the same chart in another system.
    localStorage.setItem(READING_KEY, JSON.stringify(input));
    return result;
  }, []);

  const reset = useCallback(() => {
    setReading(null);
    localStorage.removeItem(READING_KEY);
  }, []);

  // Product-scoped premium flags. Bundle unlocks both blueprint and wealth.
  const blueprintPremium =
    unlockedProducts.has("blueprint") || unlockedProducts.has("bundle");
  const wealthPremium =
    unlockedProducts.has("wealth") || unlockedProducts.has("bundle");
  const forgePremium = unlockedProducts.has("forge");
  const archetypePremium = unlockedProducts.has("archetype");
  // Generic flag — true if any product is unlocked (backward compat).
  const premium = unlockedProducts.size > 0;

  const unlockBlueprint = useCallback(() => startCheckout("blueprint"), []);
  const unlockWealth = useCallback(() => startCheckout("wealth"), []);
  const unlockBundle = useCallback(() => startCheckout("bundle"), []);
  const unlockForge = useCallback(() => startCheckout("forge"), []);
  const unlockArchetype = useCallback(() => startCheckout("archetype"), []);
  /** @deprecated Use unlockBlueprint / unlockWealth / unlockBundle */
  const unlockPremium = unlockBlueprint;

  return {
    reading,
    generate,
    reset,
    premium,
    blueprintPremium,
    wealthPremium,
    forgePremium,
    archetypePremium,
    unlockPremium,
    unlockBlueprint,
    unlockWealth,
    unlockBundle,
    unlockForge,
    unlockArchetype,
  };
}
