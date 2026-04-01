import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const drawsTable = pgTable("draws", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  status: text("status").notNull().default("pending"),
  prizePool: numeric("prize_pool", { precision: 12, scale: 2 }).notNull().default("0"),
  jackpotRollover: numeric("jackpot_rollover", { precision: 12, scale: 2 }).notNull().default("0"),
  drawnNumbers: text("drawn_numbers"),
  algorithm: text("algorithm").notNull().default("random"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDrawSchema = createInsertSchema(drawsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  drawnNumbers: true,
  publishedAt: true,
  status: true,
});
export type InsertDraw = z.infer<typeof insertDrawSchema>;
export type Draw = typeof drawsTable.$inferSelect;
