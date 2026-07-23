import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savedChartsTable = pgTable("saved_charts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull().default("My Blueprint"),
  birthInput: jsonb("birth_input").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSavedChartSchema = createInsertSchema(savedChartsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSavedChart = z.infer<typeof insertSavedChartSchema>;
export type SavedChart = typeof savedChartsTable.$inferSelect;
