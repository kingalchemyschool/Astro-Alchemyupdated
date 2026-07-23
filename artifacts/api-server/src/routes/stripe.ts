import { Router } from "express";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import rateLimit from "express-rate-limit";
import { getAuth } from "@clerk/express";
import { getUncachableStripeClient } from "../stripeClient.js";
import type Stripe from "stripe";

const router = Router();

// ── Signing key (shared with premium.ts) ─────────────────────────────────────
const SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  throw new Error("SESSION_SECRET env var is required for premium token signing");
}

const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type Product = "blueprint" | "wealth" | "bundle" | "forge" | "archetype";

interface TokenClaims {
  sub: string;   // "stripe-session:<sessionId>"
  product: Product;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Issue a product-scoped signed entitlement token for a Stripe session.
 * Format: `<base64url-payload>.<hex-hmac-sha256-signature>`
 */
function issueToken(sessionId: string, product: Product): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    sub: `stripe-session:${sessionId}`,
    product,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    jti: randomBytes(16).toString("hex"),
  } satisfies TokenClaims);
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", SECRET!).update(encodedPayload).digest("hex");
  return `${encodedPayload}.${sig}`;
}

// ── In-memory session-token store (TTL: 30 min) ────────────────────────────

interface SessionEntry {
  token: string;
  product: Product;
  /** Clerk userId if the buyer was authenticated — used to enforce ownership. */
  userId?: string;
  expiresAt: number;
}

const sessionStore = new Map<string, SessionEntry>();

setInterval(
  () => {
    const now = Math.floor(Date.now() / 1000);
    for (const [key, entry] of sessionStore) {
      if (entry.expiresAt < now) sessionStore.delete(key);
    }
  },
  5 * 60 * 1000,
);

/**
 * Called when checkout.session.completed fires.
 * Returns the minted token.
 */
export function storeSessionToken(
  sessionId: string,
  product: Product,
  userId?: string,
): string {
  const token = issueToken(sessionId, product);
  sessionStore.set(sessionId, {
    token,
    product,
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 60,
  });
  return token;
}

/**
 * Verify a token issued by this module.
 * Returns decoded claims if signature is valid and token is not expired; null otherwise.
 */
export function verifyStripeToken(token: unknown): TokenClaims | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const dotIndex = token.lastIndexOf(".");
  const encodedPayload = token.slice(0, dotIndex);
  const providedSig = token.slice(dotIndex + 1);
  const expectedSig = createHmac("sha256", SECRET!).update(encodedPayload).digest("hex");
  if (providedSig.length !== expectedSig.length) return null;
  try {
    const ok = timingSafeEqual(
      Buffer.from(expectedSig, "hex"),
      Buffer.from(providedSig, "hex"),
    );
    if (!ok) return null;
  } catch {
    return null;
  }
  try {
    const claims = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString(),
    ) as TokenClaims;
    if (
      typeof claims.sub !== "string" ||
      !claims.sub.startsWith("stripe-session:") ||
      typeof claims.product !== "string" ||
      typeof claims.exp !== "number" ||
      typeof claims.iat !== "number"
    ) {
      return null;
    }
    if (claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

// ── Product catalog ───────────────────────────────────────────────────────────

export type OneTimeProduct = "blueprint" | "wealth" | "bundle" | "archetype";
export type SubscriptionProduct = "forge";

export const PRODUCT_CATALOG: Record<
  OneTimeProduct,
  { name: string; description: string; amount: number }
> = {
  archetype: {
    name: "Archetype Report",
    description:
      "A personalized exploration of your unique archetypal signature — six planetary relationship readings, revealing the mechanisms, archetypes, and developmental edges that define how you create.",
    amount: 900,
  },
  blueprint: {
    name: "Full Blueprint Reading",
    description:
      "A complete exploration of your personal blueprint, revealing the core patterns, strengths, and themes that shape how you think, create, relate, and build your life. Gain deeper insight into your natural tendencies, untapped potential, and the unique architecture behind your path forward.",
    amount: 4400,
  },
  wealth: {
    name: "Conscious Wealth Reading",
    description:
      "A focused exploration of your relationship with value, creation, and prosperity. Discover the patterns that influence how you generate impact, cultivate resources, and build wealth that aligns with your deeper potential.",
    amount: 2200,
  },
  bundle: {
    name: "Full Blueprint + Lab Synastry Bundle",
    description:
      "Unlocks the Full Blueprint Reading AND a premium synastry narrative layer on the Lab Compare page — the complete creation architecture plus collaborative dynamics in one purchase.",
    amount: 6000,
  },
};

export const SUBSCRIPTION_CATALOG: Record<
  SubscriptionProduct,
  { name: string; description: string; amount: number; trialDays: number }
> = {
  forge: {
    name: "Daily Forge",
    description:
      "A personalized daily transit calibration system. Compares the current sky against your natal blueprint and delivers a daily refinement report — celestial state, blueprint activation, forge principle, journal prompt, and practical application.",
    amount: 799, // $7.99/month
    trialDays: 7,
  },
};

/**
 * Ensure all products and prices exist in Stripe (idempotent).
 * Returns a map of product key → price ID.
 */
export async function ensureStripeProducts(): Promise<Record<Product, string>> {
  const stripe = await getUncachableStripeClient();
  const priceIds: Partial<Record<Product, string>> = {};

  // ── One-time products ─────────────────────────────────────────────────────
  for (const [key, catalog] of Object.entries(PRODUCT_CATALOG) as [
    OneTimeProduct,
    (typeof PRODUCT_CATALOG)[OneTimeProduct],
  ][]) {
    const existing = await stripe.products.search({
      query: `metadata['key']:'${key}'`,
    });

    let productId: string;
    if (existing.data.length > 0) {
      productId = existing.data[0].id;
    } else {
      const product = await stripe.products.create({
        name: catalog.name,
        description: catalog.description,
        metadata: { key },
      });
      productId = product.id;
    }

    const prices = await stripe.prices.list({ product: productId, active: true });
    const oneTimePrice = prices.data.find((p) => !p.recurring);
    if (oneTimePrice) {
      priceIds[key] = oneTimePrice.id;
    } else {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: catalog.amount,
        currency: "usd",
      });
      priceIds[key] = price.id;
    }
  }

  // ── Subscription products ─────────────────────────────────────────────────
  for (const [key, catalog] of Object.entries(SUBSCRIPTION_CATALOG) as [
    SubscriptionProduct,
    (typeof SUBSCRIPTION_CATALOG)[SubscriptionProduct],
  ][]) {
    const existing = await stripe.products.search({
      query: `metadata['key']:'${key}'`,
    });

    let productId: string;
    if (existing.data.length > 0) {
      productId = existing.data[0].id;
    } else {
      const product = await stripe.products.create({
        name: catalog.name,
        description: catalog.description,
        metadata: { key },
      });
      productId = product.id;
    }

    const prices = await stripe.prices.list({ product: productId, active: true });
    const recurringPrice = prices.data.find((p) => p.recurring?.interval === "month");
    if (recurringPrice) {
      priceIds[key] = recurringPrice.id;
    } else {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: catalog.amount,
        currency: "usd",
        recurring: { interval: "month" },
      });
      priceIds[key] = price.id;
    }
  }

  return priceIds as Record<Product, string>;
}

// Cached price IDs — populated on startup.
let cachedPriceIds: Record<Product, string> | null = null;
export function setPriceIds(ids: Record<Product, string>): void {
  cachedPriceIds = ids;
}

const SUBSCRIPTION_PRODUCTS = new Set<Product>(["forge"]);

async function getPriceId(product: Product): Promise<string | null> {
  if (cachedPriceIds) return cachedPriceIds[product] ?? null;
  try {
    const stripe = await getUncachableStripeClient();
    const results = await stripe.products.search({
      query: `metadata['key']:'${product}'`,
    });
    if (!results.data[0]) return null;
    const prices = await stripe.prices.list({
      product: results.data[0].id,
      active: true,
    });
    const isSubscription = SUBSCRIPTION_PRODUCTS.has(product);
    const price = isSubscription
      ? prices.data.find((p: Stripe.Price) => p.recurring?.interval === "month")
      : prices.data.find((p: Stripe.Price) => !p.recurring);
    return price?.id ?? null;
  } catch {
    return null;
  }
}

// ── Rate limiters ─────────────────────────────────────────────────────────────

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// ── POST /api/stripe/checkout ─────────────────────────────────────────────────
router.post("/stripe/checkout", checkoutLimiter, async (req: any, res) => {
  const { product, successUrl, cancelUrl } = req.body ?? {};

  if (!product || !["blueprint", "wealth", "bundle", "forge", "archetype"].includes(product)) {
    return res
      .status(400)
      .json({ error: "Invalid product. Must be blueprint, wealth, bundle, forge, or archetype." });
  }
  if (typeof successUrl !== "string" || !successUrl.startsWith("http")) {
    return res.status(400).json({ error: "successUrl must be a valid URL." });
  }
  if (typeof cancelUrl !== "string" || !cancelUrl.startsWith("http")) {
    return res.status(400).json({ error: "cancelUrl must be a valid URL." });
  }

  const priceId = await getPriceId(product as Product);
  if (!priceId) {
    return res.status(503).json({
      error: "Stripe products not yet initialized. Please try again in a moment.",
    });
  }

  // Bind to authenticated user if available, so we can enforce ownership on redemption.
  const auth = getAuth(req);
  const userId = auth?.userId ?? undefined;

  const isSubscription = SUBSCRIPTION_PRODUCTS.has(product as Product);
  const forgeCatalog = SUBSCRIPTION_CATALOG[product as SubscriptionProduct];

  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(userId ? { client_reference_id: userId } : {}),
      metadata: { product, ...(userId ? { userId } : {}) },
      ...(isSubscription && forgeCatalog
        ? { subscription_data: { trial_period_days: forgeCatalog.trialDays } }
        : {}),
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session." });
  }
});

// ── GET /api/stripe/session/:id ───────────────────────────────────────────────
/**
 * Exchange a completed Stripe checkout session ID for a product-scoped entitlement token.
 *
 * Ownership enforcement:
 *  - If the session was created by an authenticated user (client_reference_id set)
 *    AND the current caller is also authenticated, the caller's userId must match.
 *  - Unauthenticated callers may redeem any session (high-entropy session ID is
 *    the primary security boundary for anonymous users).
 */
router.get("/stripe/session/:id", sessionLimiter, async (req: any, res) => {
  const sessionId = req.params.id;
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Missing session ID." });
  }

  const auth = getAuth(req);
  const callerId = auth?.userId ?? null;

  // ── Helper: enforce owner-match for user-bound sessions ─────────────────
  // Rule: if a session was created by an authenticated user (has an owner),
  // the redeemer MUST be authenticated AS that same user.
  // Anonymous callers may only redeem sessions that were created anonymously.
  function checkOwnership(sessionOwner: string | null | undefined): boolean {
    if (!sessionOwner) return true;           // Anonymous session — anyone may redeem
    if (!callerId) return false;              // User-bound session, caller not authenticated
    return callerId === sessionOwner;         // Must be exact match
  }

  // 1. Check in-memory store (populated by webhook — fastest path)
  const stored = sessionStore.get(sessionId);
  if (stored) {
    if (!checkOwnership(stored.userId ?? null)) {
      return res.status(403).json({
        error: stored.userId && !callerId
          ? "Please sign in to redeem this purchase."
          : "This session belongs to a different account.",
      });
    }
    return res.json({ token: stored.token, product: stored.product });
  }

  // 2. Fall back: verify against Stripe API
  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // For subscriptions (e.g. forge with trial), payment_status is "no_payment_required".
    // Use session.status === "complete" as the universal completion check.
    if (session.status !== "complete") {
      return res.status(402).json({ error: "Payment not completed." });
    }

    const sessionOwner =
      session.client_reference_id ||
      session.metadata?.userId ||
      null;

    if (!checkOwnership(sessionOwner)) {
      return res.status(403).json({
        error: sessionOwner && !callerId
          ? "Please sign in to redeem this purchase."
          : "This session belongs to a different account.",
      });
    }

    const product = (session.metadata?.product ?? "blueprint") as Product;
    const userId = sessionOwner ?? undefined;
    const token = storeSessionToken(sessionId, product, userId);
    return res.json({ token, product });
  } catch (err: any) {
    console.error("Stripe session retrieval error:", err.message);
    return res.status(404).json({ error: "Session not found or invalid." });
  }
});

export default router;
