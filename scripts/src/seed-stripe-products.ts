/**
 * Seed script: creates Stripe products and prices for Astral Forge.
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-stripe-products.ts
 *
 * Products created:
 *   Full Blueprint     — $44 one-time
 *   Conscious Wealth   — $22 one-time
 *   Bundle (Blueprint + Lab Synastry Premium) — $60 one-time
 */

async function getStripeCredentials(): Promise<{ secretKey: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error(
      "Missing Replit environment variables. Ensure the Stripe integration is connected.",
    );
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!resp.ok) {
    throw new Error(
      `Failed to fetch Stripe credentials: ${resp.status} ${resp.statusText}`,
    );
  }

  const data = await resp.json();
  const settings = data.items?.[0]?.settings;
  if (!settings?.secret_key) {
    throw new Error("Stripe integration not connected or missing secret key.");
  }
  return { secretKey: settings.secret_key };
}

async function createProducts() {
  const { secretKey } = await getStripeCredentials();

  // Dynamically import Stripe to avoid top-level issues
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(secretKey);

  const PRODUCTS = [
    {
      key: "blueprint",
      name: "Full Blueprint Reading",
      description:
        "A complete exploration of your personal blueprint, revealing the core patterns, strengths, and themes that shape how you think, create, relate, and build your life. Gain deeper insight into your natural tendencies, untapped potential, and the unique architecture behind your path forward.",
      amount: 4400, // $44
    },
    {
      key: "wealth",
      name: "Conscious Wealth Reading",
      description:
        "A focused exploration of your relationship with value, creation, and prosperity. Discover the patterns that influence how you generate impact, cultivate resources, and build wealth that aligns with your deeper potential.",
      amount: 2200, // $22
    },
    {
      key: "bundle",
      name: "Full Blueprint + Lab Synastry Bundle",
      description:
        "Unlocks the Full Blueprint Reading AND a premium synastry narrative layer on the Lab Compare page — the complete creation architecture plus collaborative dynamics in one purchase.",
      amount: 6000, // $60
    },
  ];

  const results: Record<string, { productId: string; priceId: string }> = {};

  for (const p of PRODUCTS) {
    console.log(`\n→ Processing: ${p.name}`);

    // Check if product already exists
    const existing = await stripe.products.search({
      query: `metadata['key']:'${p.key}'`,
    });

    let productId: string;
    if (existing.data.length > 0) {
      productId = existing.data[0].id;
      console.log(`  Product already exists: ${productId}`);
    } else {
      const product = await stripe.products.create({
        name: p.name,
        description: p.description,
        metadata: { key: p.key },
      });
      productId = product.id;
      console.log(`  Created product: ${productId}`);
    }

    // Check if active one-time price exists
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });
    const oneTimePrice = prices.data.find((pr) => !pr.recurring);

    let priceId: string;
    if (oneTimePrice) {
      priceId = oneTimePrice.id;
      console.log(`  Price already exists: ${priceId} ($${p.amount / 100})`);
    } else {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: p.amount,
        currency: "usd",
      });
      priceId = price.id;
      console.log(`  Created price: ${priceId} ($${p.amount / 100})`);
    }

    results[p.key] = { productId, priceId };
  }

  console.log("\n✓ Done! Add these to your API server secrets/env vars:");
  console.log(`STRIPE_PRICE_BLUEPRINT=${results.blueprint?.priceId}`);
  console.log(`STRIPE_PRICE_WEALTH=${results.wealth?.priceId}`);
  console.log(`STRIPE_PRICE_BUNDLE=${results.bundle?.priceId}`);
}

createProducts().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
