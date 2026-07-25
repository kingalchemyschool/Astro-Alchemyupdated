---
name: Development API auth fallback
description: Clerk backend credential behavior for AstroAlchemy's development API workflow
---

The AstroAlchemy API may run in a Replit development preview without a `CLERK_SECRET_KEY`. In that environment, the server should start without Clerk middleware so public routes and development-only tooling remain usable. Production must continue requiring the Clerk secret and Stripe webhook secret.

**Why:** The frontend already has a graceful unauthenticated preview fallback, and the development unlock endpoint cannot be tested if API startup exits before registering routes.

**How to apply:** Keep Clerk middleware conditional on the secret in development, validate the secret in production, and restart the API workflow after backend changes so its bundled route code is rebuilt.