import app from "./app.js";
import { logger } from "./lib/logger.js";
import { validateEnv } from "./lib/env.js";
import { ensureStripeProducts, setPriceIds } from "./routes/stripe.js";

// ── Startup environment validation ──────────────────────────────────────────
// Validates all required environment variables at once before any request is
// served. Exits with a clear fatal log listing every missing key if anything
// is wrong — see src/lib/env.ts for the full schema and documentation.
validateEnv();

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Ensure Stripe products exist and cache their price IDs.
 * Idempotent — safe to call on every startup.
 */
async function initStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    logger.warn("STRIPE_SECRET_KEY not set — Stripe payments will not work");
    return;
  }

  try {
    logger.info("Ensuring Stripe products exist…");
    const priceIds = await ensureStripeProducts();
    setPriceIds(priceIds);
    logger.info({ priceIds }, "Stripe products ready");
  } catch (err: unknown) {
    logger.error({ err }, "Stripe product setup failed — payments may not work");
    // Don't throw — let the server start so non-payment routes still work
  }
}

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
