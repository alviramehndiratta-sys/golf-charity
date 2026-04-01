import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { charitiesTable } from "./charities";

export const userCharitiesTable = pgTable("user_charities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  charityId: integer("charity_id").notNull().references(() => charitiesTable.id, { onDelete: "restrict" }),
  charityPercent: integer("charity_percent").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserCharitySchema = createInsertSchema(userCharitiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserCharity = z.infer<typeof insertUserCharitySchema>;
export type UserCharity = typeof userCharitiesTable.$inferSelect;
