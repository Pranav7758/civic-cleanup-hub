import { pgTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

const id = () => varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`);
const now = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const appUsers = pgTable("app_users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: now(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: now(),
});

export const userRoles = pgTable("user_roles", {
  id: id(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
}, (table) => ({
  userRoleUnique: uniqueIndex("user_roles_user_role_unique").on(table.userId, table.role),
}));

export const insertUserSchema = createInsertSchema(appUsers).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AppUser = typeof appUsers.$inferSelect;
