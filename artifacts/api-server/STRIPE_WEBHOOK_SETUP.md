# Stripe Webhook Setup

## Current status

**No webhook endpoint has been registered in Stripe yet.**

The Stripe account for this project currently has zero webhook endpoints. Payments will process successfully through Stripe Checkout, but the server-side entitlement logic (minting the session token via `storeSessionToken`) will only fire if a webhook is registered.

The fallback path in `GET /api/stripe/session/:id` (direct Stripe API verification) will still grant access to buyers, but it is slower and depends on the Stripe API being reachable at redemption time. Registering the webhook is required for reliable, near-instant entitlement delivery.

## Why no webhook exists yet

The app has not been published. There is no stable production URL to register with Stripe — the `*.replit.dev` development domain is not a valid webhook target because it is tied to an active workspace session and is not publicly reachable by Stripe.

## Steps to complete after the first publish

Run these commands once `getDeploymentInfo()` returns a non-empty `primaryUrl`:

```bash
# 1. Create the webhook endpoint
#    Replace <PRODUCTION_URL> with the value from getDeploymentInfo().primaryUrl
curl -X POST https://api.stripe.com/v1/webhook_endpoints \
  -u "$STRIPE_SECRET_KEY:" \
  -d "url=https://<PRODUCTION_URL>/api/stripe/webhook" \
  -d "enabled_events[]=checkout.session.completed"

# The response contains a `secret` field (whsec_...).
# Copy it — it is only shown once.

# 2. Update the Replit secret
#    Set STRIPE_WEBHOOK_SECRET to the `secret` value from the response above.
#    This can be done in the Replit Secrets UI or via the environment-secrets skill.

# 3. Verify
#    In the Stripe Dashboard → Developers → Webhooks, select the new endpoint
#    and send a test `checkout.session.completed` event.
#    The production server should return HTTP 200.
```

## Relevant implementation files

| File | Purpose |
|------|---------|
| `src/app.ts` | Webhook handler at `POST /api/stripe/webhook` — verifies Stripe signature, calls `storeSessionToken` |
| `src/routes/stripe.ts` | `storeSessionToken` mints the entitlement token; `GET /api/stripe/session/:id` is the fallback |
| `src/stripeClient.js` | Initialises the Stripe SDK — reads `STRIPE_SECRET_KEY` |

## Security notes

- `STRIPE_WEBHOOK_SECRET` must be set in production. The handler (`src/app.ts` lines 62–65) hard-fails with HTTP 500 in production when the secret is absent, preventing unverified payloads from minting entitlements.
- The signing secret changes every time you delete and re-create a webhook endpoint. Always update `STRIPE_WEBHOOK_SECRET` when rotating the endpoint.
