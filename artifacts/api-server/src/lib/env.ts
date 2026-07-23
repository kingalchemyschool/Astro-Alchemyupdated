/**
 * Central environment-variable validation.
 *
 * Call `validateEnv()` once at startup (before any other initialisation).
 * It uses Zod to parse `process.env` against a schema and fatally exits if
 * anything required is absent or invalid, printing every failing key at once
 * so operators can fix all problems in a single deploy cycle.
 *
 * Required vars  — the server will NOT start without them.
 * Optional vars  — documented here; absent values are handled gracefully at
 *                  the call-site (e.g. a warn log or a fallback).
 *
 * ─── Required ────────────────────────────────────────────────────────────────
 *   NODE_ENV            "production" | "development" | "test"
 *   CLERK_SECRET_KEY    Clerk backend secret key (sk_live_… / sk_test_…)
 *   DATABASE_URL        PostgreSQL connection string
 *
 * ─── Required in production only ─────────────────────────────────────────────
 *   STRIPE_WEBHOOK_SECRET   Stripe webhook signing secret (whsec_…)
 *
 * ─── Optional ────────────────────────────────────────────────────────────────
 *   PORT                    HTTP port (default 8080)
 *   LOG_LEVEL               pino log level (default "info")
 *   ALLOWED_ORIGINS         Comma-separated CORS allowed origins
 *   CLERK_PUBLISHABLE_KEY   Clerk publishable key for middleware hint
 *   SESSION_SECRET          Cookie / session signing secret
 *   STRIPE_SECRET_KEY       Stripe secret key (falls back to Replit connector)
 *   REPLIT_CONNECTORS_HOSTNAME  Replit managed-connector endpoint
 *   REPL_IDENTITY               Replit identity token
 *   WEB_REPL_RENEWAL            Replit renewal token
 */

import { z } from "zod";
import { logger } from "./logger.js";

const envSchema = z
  .object({
    // ── Always required ────────────────────────────────────────────────────
    NODE_ENV: z.enum(["production", "development", "test"], {
      errorMap: () => ({
        message: 'must be one of "production", "development", or "test"',
      }),
    }),
    CLERK_SECRET_KEY: z
      .string({ required_error: "required for Clerk authentication" })
      .min(1, "must not be empty"),
    DATABASE_URL: z
      .string({ required_error: "required for database access" })
      .min(1, "must not be empty"),

    // ── Required in production only (validated below) ──────────────────────
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // ── Optional ───────────────────────────────────────────────────────────
    PORT: z.string().optional(),
    LOG_LEVEL: z.string().optional(),
    ALLOWED_ORIGINS: z.string().optional(),
    CLERK_PUBLISHABLE_KEY: z.string().optional(),
    SESSION_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    REPLIT_CONNECTORS_HOSTNAME: z.string().optional(),
    REPL_IDENTITY: z.string().optional(),
    WEB_REPL_RENEWAL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (
      env.NODE_ENV === "production" &&
      !env.STRIPE_WEBHOOK_SECRET
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STRIPE_WEBHOOK_SECRET"],
        message: "required in production to verify Stripe webhook signatures",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Validates `process.env` against the schema.
 * On success returns the parsed (typed) env object.
 * On failure logs every missing / invalid variable and exits with code 1.
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues.map((issue) => {
    const key = issue.path.join(".") || "(root)";
    return `  • ${key}: ${issue.message}`;
  });

  logger.fatal(
    `Server cannot start — ${issues.length} environment variable(s) are missing or invalid:\n` +
      issues.join("\n") +
      "\n\nFix the above in your deployment environment or Replit Secrets panel, then restart.",
  );

  process.exit(1);
}
