import { pgTable, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { drawsTable } from "./draws";
import { usersTable } from "./users";

export const drawResultsTable = pgTable("draw_results", {
  id: serial("id").primaryKey(),
  drawId: integer("draw_id").notNull().references(() => drawsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  matchTier: integer("match_tier").notNull(),
  prizeAmount: numeric("prize_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDrawResultSchema = createInsertSchema(drawResultsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertDrawResult = z.infer<typeof insertDrawResultSchema>;
export type DrawResult = typeof drawResultsTable.$inferSelect;
