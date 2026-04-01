import { pgTable, text, serial, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const charitiesTable = pgTable("charities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"),
  imageUrl: text("image_url"),
  websiteUrl: text("website_url"),
  featured: boolean("featured").notNull().default(false),
  totalContributions: numeric("total_contributions", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCharitySchema = createInsertSchema(charitiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalContributions: true,
});
export type InsertCharity = z.infer<typeof insertCharitySchema>;
export type Charity = typeof charitiesTable.$inferSelect;
