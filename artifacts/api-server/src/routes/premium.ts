import { Router } from "express";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import rateLimit from "express-rate-limit";
import { verifyStripeToken, type Product } from "./stripe.js";

const router = Router();

// SESSION_SECRET is the signing key for dev-bypass tokens only.
const SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  throw new Error("SESSION_SECRET env var is required for premium token signing");
}

const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Build a signed dev-bypass entitlement token.
 * Only issued in development — never in production.
 */
function issueDevToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    sub: "dev-user",
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    jti: randomBytes(16).toString("hex"),
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", SECRET!).update(encodedPayload).digest("hex");
  return `${encodedPayload}.${sig}`;
}

interface DevTokenClaims {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Verify a dev-bypass token. Returns claims if valid, null otherwise.
 * Only used in development — production rejects all legacy tokens.
 */
function verifyDevToken(token: unknown): DevTokenClaims | null {
  if (typeof token !== "string" || !token.includes(".")) return null;

  const dotIndex = token.lastIndexOf(".");
  const encodedPayload = token.slice(0, dotIndex);
  const providedSig = token.slice(dotIndex + 1);
  const expectedSig = createHmac("sha256", SECRET!)
    .update(encodedPayload)
    .digest("hex");

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
    ) as DevTokenClaims;
    if (
      typeof claims.sub !== "string" ||
      !claims.sub ||
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

/**
 * Returns true if the token's product claim grants access to `requestedProduct`.
 * Bundle unlocks both blueprint and wealth.
 * Forge only unlocks forge.
 */
function productGrantsAccess(tokenProduct: Product, requested: Product): boolean {
  if (tokenProduct === requested) return true;
  if (tokenProduct === "bundle" && (requested === "blueprint" || requested === "wealth")) {
    return true;
  }
  return false;
}

const unlockLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const isDev = process.env.NODE_ENV !== "production";

/**
 * POST /api/premium/unlock
 *
 * Development only — issues a dev-bypass token without payment.
 * DISABLED IN PRODUCTION. All production unlocks must go through Stripe Checkout
 * (`POST /api/stripe/checkout` → Stripe → `GET /api/stripe/session/:id`).
 */
router.post("/premium/unlock", unlockLimiter, (req: any, res) => {
  if (!isDev) {
    // Hard-block in production — no payment bypass allowed.
    return res.status(410).json({
      error:
        "This endpoint is disabled. Use Stripe Checkout to unlock premium content.",
    });
  }

  // Development-only dev bypass.
  const token = issueDevToken();
  return res.json({ token });
});

/**
 * POST /api/premium/verify
 *
 * Validates an entitlement token for a specific product.
 * Body: { token: string, product?: "blueprint" | "wealth" | "bundle" }
 *
 * Two token types:
 * - Stripe-issued (sub: "stripe-session:..."): verified by signature + product scope.
 *   Accepted in both dev and production — this is the canonical paid-access token.
 * - Dev-bypass (sub: "dev-user"): accepted only in development.
 *   Rejected in production to prevent payment bypasses.
 */
router.post("/premium/verify", verifyLimiter, async (req: any, res) => {
  const { token, product } = req.body ?? {};
  const validProducts: Product[] = ["blueprint", "wealth", "bundle", "forge", "archetype"];
  const requestedProduct: Product = validProducts.includes(product as Product)
    ? (product as Product)
    : "blueprint";

  // ── Path 1: Stripe-issued token (canonical, works in dev + prod) ──────────
  const stripeClaims = verifyStripeToken(token);
  if (stripeClaims) {
    const granted = productGrantsAccess(stripeClaims.product, requestedProduct);
    return res.json({ valid: granted });
  }

  // ── Path 2: Dev-bypass token (dev only) ───────────────────────────────────
  if (isDev) {
    const devClaims = verifyDevToken(token);
    return res.json({ valid: !!devClaims });
  }

  // Production: reject all non-Stripe tokens outright.
  return res.json({ valid: false });
});

export default router;
