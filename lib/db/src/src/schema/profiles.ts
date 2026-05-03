import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";
import { appUsers } from "./users";

const id = () => varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`);
const now = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updated = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const profiles = pgTable("profiles", {
  id: id(),
  userId: varchar("user_id", { length: 36 }).notNull().unique().references(() => appUsers.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  address: text("address"),
  city: text("city").default("Delhi"),
  ward: text("ward"),
  dustbinCode: text("dustbin_code").unique(),
  createdAt: now(),
  updatedAt: updated(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
