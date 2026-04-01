import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { drawsTable } from "./draws";
import { usersTable } from "./users";

export const winnersTable = pgTable("winners", {
  id: serial("id").primaryKey(),
  drawId: integer("draw_id").notNull().references(() => drawsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  matchTier: integer("match_tier").notNull(),
  prizeAmount: numeric("prize_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("pending"),
  proofUrl: text("proof_url"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWinnerSchema = createInsertSchema(winnersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  proofUrl: true,
  adminNote: true,
});
export type InsertWinner = z.infer<typeof insertWinnerSchema>;
export type Winner = typeof winnersTable.$inferSelect;
