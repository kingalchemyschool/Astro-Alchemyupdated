import express, { type Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware.js";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { storeSessionToken } from "./routes/stripe.js";
import { getUncachableStripeClient } from "./stripeClient.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Clerk proxy — must come before body parsers (streams raw bytes)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// ── Stripe webhook — MUST be registered BEFORE express.json() ──────────────
// Raw body is required for Stripe signature verification.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    const sig = Array.isArray(signature) ? signature[0] : signature;

    // isDev mirrors the same flag used for CORS below: true outside production.
    const isDev = process.env.NODE_ENV !== "production";

    // In production, a missing webhook secret is a hard failure — we must not
    // accept unverified payloads that could forge entitlement mints.
    if (!isDev && !webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRET is not set in production — rejecting webhook");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    try {
      const stripe = await getUncachableStripeClient();
      const rawBody = req.body as Buffer;

      let event: any;
      if (webhookSecret) {
        // Verify Stripe signature (throws if invalid or replayed)
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } else {
        // Development only: STRIPE_WEBHOOK_SECRET is absent so we skip signature
        // verification. The guard above ensures this branch is unreachable in
        // production, so no unverified payload can ever reach the entitlement logic.
        event = JSON.parse(rawBody.toString("utf8"));
        logger.warn("STRIPE_WEBHOOK_SECRET not set — accepting unverified webhook (dev only)");
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data?.object;
        const product = session?.metadata?.product;
        const sessionId = session?.id;
        // Extract the authenticated buyer's Clerk userId if the checkout was
        // created while they were logged in (set as client_reference_id and metadata).
        const userId: string | undefined =
          session?.client_reference_id ||
          session?.metadata?.userId ||
          undefined;
        if (product && sessionId) {
          storeSessionToken(sessionId, product, userId);
          logger.info({ sessionId, product, userId: userId ?? "anonymous" }, "Minted entitlement token for session");
        }
      }

      return res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error({ err: err.message }, "Stripe webhook error");
      return res.status(400).json({ error: "Webhook error" });
    }
  },
);

// CORS — only allow explicitly listed origins; never reflect arbitrary origins
// with credentials. Set ALLOWED_ORIGINS to a comma-separated list of permitted
// frontend URLs (e.g. "https://myapp.replit.app,https://myapp.com").
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS ?? "";
const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== "production";

if (!isDev && allowedOrigins.length === 0) {
  logger.warn(
    "ALLOWED_ORIGINS is not set — CORS will block all cross-origin requests. " +
      "Set it to a comma-separated list of permitted frontend origins.",
  );
}

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow same-origin / server-to-server requests (no Origin header)
      if (!origin) return callback(null, true);
      // In development, allow all origins so local Replit preview works.
      if (isDev) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
  }),
);

// Rate limiting — applied globally; stricter limits on mutating routes are
// applied at the router level (see routes/charts.ts).
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // generous read budget per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Clerk auth middleware — resolves publishable key from request host
if (process.env.CLERK_SECRET_KEY) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
} else if (process.env.NODE_ENV !== "production") {
  logger.warn("CLERK_SECRET_KEY not set — running without Clerk authentication in development");
}

app.use("/api", router);

export default app;
