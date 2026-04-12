import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  doublePrecision,
} from "drizzle-orm/pg-core";

const id = () => varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`);
const userId = (name: string) => varchar(name, { length: 36 }).notNull();
const optionalUserId = (name: string) => varchar(name, { length: 36 });
const now = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updated = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const appUsers = pgTable("app_users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: now(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: now(),
});

export const profiles = pgTable("profiles", {
  id: id(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }).unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  address: text("address"),
  city: text("city").default("Delhi"),
  ward: text("ward"),
  createdAt: now(),
  updatedAt: updated(),
});

export const userRoles = pgTable("user_roles", {
  id: id(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
}, table => ({
  userRoleUnique: uniqueIndex("user_roles_user_role_unique").on(table.userId, table.role),
}));

export const cleanlinessScores = pgTable("cleanliness_scores", {
  id: id(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }).unique(),
  score: integer("score").notNull().default(0),
  tier: text("tier").notNull().default("Bronze"),
  totalReports: integer("total_reports").default(0),
  totalScrapSold: integer("total_scrap_sold").default(0),
  totalDonations: integer("total_donations").default(0),
  totalEvents: integer("total_events").default(0),
  updatedAt: updated(),
});

export const trainingModules = pgTable("training_modules", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").default("BookOpen"),
  durationMinutes: integer("duration_minutes").default(15),
  lessonCount: integer("lesson_count").default(3),
  sortOrder: integer("sort_order").default(0),
  requiresPrevious: boolean("requires_previous").default(true),
  createdAt: now(),
});

export const trainingProgress = pgTable("training_progress", {
  id: id(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id", { length: 36 }).notNull().references(() => trainingModules.id, { onDelete: "cascade" }),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: updated(),
}, table => ({
  trainingProgressUnique: uniqueIndex("training_progress_user_module_unique").on(table.userId, table.moduleId),
}));

export const wasteReports = pgTable("waste_reports", {
  id: id(),
  citizenId: userId("citizen_id").references(() => appUsers.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  wasteType: text("waste_type").notNull().default("mixed"),
  description: text("description"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  status: text("status").notNull().default("pending"),
  assignedWorkerId: optionalUserId("assigned_worker_id").references(() => appUsers.id),
  completionImageUrl: text("completion_image_url"),
  rewardPoints: integer("reward_points").default(50),
  priority: text("priority").default("medium"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: now(),
  updatedAt: updated(),
}, table => ({
  citizenIdx: index("idx_waste_reports_citizen").on(table.citizenId),
  statusIdx: index("idx_waste_reports_status").on(table.status),
  workerIdx: index("idx_waste_reports_worker").on(table.assignedWorkerId),
}));

export const walletTransactions = pgTable("wallet_transactions", {
  id: id(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  action: text("action").notNull(),
  points: integer("points").notNull(),
  referenceId: varchar("reference_id", { length: 36 }),
  referenceType: text("reference_type"),
  createdAt: now(),
}, table => ({
  walletUserIdx: index("idx_wallet_transactions_user").on(table.userId),
}));

export const governmentBenefits = pgTable("government_benefits", {
  id: id(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  benefitType: text("benefit_type").notNull(),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  approvedBy: optionalUserId("approved_by").references(() => appUsers.id),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  provider: text("provider"),
  couponCode: text("coupon_code"),
  createdAt: now(),
  updatedAt: updated(),
});

export const scrapPrices = pgTable("scrap_prices", {
  id: id(),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  pricePerKg: numeric("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  dealerId: optionalUserId("dealer_id").references(() => appUsers.id),
  updatedAt: updated(),
});

export const scrapListings = pgTable("scrap_listings", {
  id: id(),
  citizenId: userId("citizen_id").references(() => appUsers.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"),
  dealerId: optionalUserId("dealer_id").references(() => appUsers.id),
  totalEstimate: numeric("total_estimate", { precision: 10, scale: 2 }).default("0"),
  totalWeight: numeric("total_weight", { precision: 10, scale: 2 }).default("0"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: now(),
  updatedAt: updated(),
}, table => ({
  scrapCitizenIdx: index("idx_scrap_listings_citizen").on(table.citizenId),
  scrapDealerIdx: index("idx_scrap_listings_dealer").on(table.dealerId),
}));

export const scrapListingItems = pgTable("scrap_listing_items", {
  id: id(),
  listingId: varchar("listing_id", { length: 36 }).notNull().references(() => scrapListings.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  weightKg: numeric("weight_kg", { precision: 10, scale: 2 }).notNull().default("1"),
  pricePerKg: numeric("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).default("0"),
});

export const donations = pgTable("donations", {
  id: id(),
  citizenId: userId("citizen_id").references(() => appUsers.id, { onDelete: "cascade" }),
  ngoId: optionalUserId("ngo_id").references(() => appUsers.id),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"),
  proofImageUrl: text("proof_image_url"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  rewardPoints: integer("reward_points").default(100),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: now(),
  updatedAt: updated(),
}, table => ({
  donationsCitizenIdx: index("idx_donations_citizen").on(table.citizenId),
  donationsNgoIdx: index("idx_donations_ngo").on(table.ngoId),
}));

export const communityEvents = pgTable("community_events", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").default("cleanup_drive"),
  location: text("location"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  maxParticipants: integer("max_participants"),
  rewardPoints: integer("reward_points").default(150),
  imageUrl: text("image_url"),
  organizerId: optionalUserId("organizer_id").references(() => appUsers.id),
  createdAt: now(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: id(),
  eventId: varchar("event_id", { length: 36 }).notNull().references(() => communityEvents.id, { onDelete: "cascade" }),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  attended: boolean("attended").default(false),
  createdAt: now(),
}, table => ({
  eventRegistrationUnique: uniqueIndex("event_registrations_event_user_unique").on(table.eventId, table.userId),
}));

export const notifications = pgTable("notifications", {
  id: id(),
  userId: userId("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type").default("info"),
  read: boolean("read").default(false),
  referenceId: varchar("reference_id", { length: 36 }),
  referenceType: text("reference_type"),
  createdAt: now(),
}, table => ({
  notificationsUserIdx: index("idx_notifications_user").on(table.userId),
}));

export const messages = pgTable("messages", {
  id: id(),
  senderId: userId("sender_id").references(() => appUsers.id, { onDelete: "cascade" }),
  receiverId: userId("receiver_id").references(() => appUsers.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: now(),
});

export const redeemItems = pgTable("redeem_items", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  stock: integer("stock").default(0),
  imageEmoji: text("image_emoji"),
  active: boolean("active").default(true),
  createdAt: now(),
});