import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Records server-confirmed premium purchases per authenticated user.
 * A row here is the authoritative source of truth for premium entitlement —
 * tokens presented by the client are verified against this table.
 */
export const premiumPurchasesTable = pgTable("premium_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Clerk user ID — one row per user is enough; duplicate inserts are idempotent. */
  userId: text("user_id").notNull().unique(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PremiumPurchase = typeof premiumPurchasesTable.$inferSelect;
