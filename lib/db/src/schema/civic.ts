import { pgTable, text, timestamp, varchar, integer, boolean, doublePrecision, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { appUsers } from "./users";

const id = () => varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`);
const now = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updated = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const cleanlinessScores = pgTable("cleanliness_scores", {
  id: id(),
  userId: varchar("user_id", { length: 36 }).notNull().unique().references(() => appUsers.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  tier: text("tier").notNull().default("Bronze"),
  totalReports: integer("total_reports").default(0),
  totalScrapSold: integer("total_scrap_sold").default(0),
  totalDonations: integer("total_donations").default(0),
  totalEvents: integer("total_events").default(0),
  updatedAt: updated(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: id(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'earned' | 'spent'
  action: text("action").notNull(),
  points: integer("points").notNull(),
  referenceId: varchar("reference_id", { length: 36 }),
  referenceType: text("reference_type"),
  createdAt: now(),
});

export const governmentBenefits = pgTable("government_benefits", {
  id: id(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  benefitType: text("benefit_type").notNull(), // 'light_bill' | 'water_tax' | 'property_tax'
  discountPercent: integer("discount_percent"),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'expired'
  provider: text("provider"),
  couponCode: text("coupon_code"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdAt: now(),
  updatedAt: updated(),
});

export const redeemItems = pgTable("redeem_items", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  stock: integer("stock"),
  imageEmoji: text("image_emoji"),
  active: boolean("active").default(true),
  createdAt: now(),
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
  userId: varchar("user_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  moduleId: varchar("module_id", { length: 36 }).notNull().references(() => trainingModules.id, { onDelete: "cascade" }),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: updated(),
}, (table) => ({
  trainingProgressUnique: uniqueIndex("training_progress_user_module_unique").on(table.userId, table.moduleId),
}));

export const wasteReports = pgTable("waste_reports", {
  id: id(),
  citizenId: varchar("citizen_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  wasteType: text("waste_type").notNull().default("mixed"),
  description: text("description"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  status: text("status").notNull().default("pending"), // 'pending' | 'assigned' | 'completed' | 'rejected'
  assignedWorkerId: varchar("assigned_worker_id", { length: 36 }),
  completionImageUrl: text("completion_image_url"),
  rewardPoints: integer("reward_points").default(50),
  priority: text("priority").default("normal"), // 'low' | 'normal' | 'high' | 'urgent'
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: now(),
  updatedAt: updated(),
});

export const scrapPrices = pgTable("scrap_prices", {
  id: id(),
  category: text("category").notNull(), // 'metal' | 'paper' | 'plastic' | 'ewaste'
  itemName: text("item_name").notNull(),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  updatedAt: updated(),
});

export const scrapListings = pgTable("scrap_listings", {
  id: id(),
  citizenId: varchar("citizen_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'completed' | 'cancelled'
  dealerId: varchar("dealer_id", { length: 36 }),
  totalEstimate: doublePrecision("total_estimate"),
  totalWeight: doublePrecision("total_weight"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: now(),
  updatedAt: updated(),
});

export const scrapListingItems = pgTable("scrap_listing_items", {
  id: id(),
  listingId: varchar("listing_id", { length: 36 }).notNull().references(() => scrapListings.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  weightKg: doublePrecision("weight_kg").notNull(),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  totalPrice: doublePrecision("total_price"),
});

export const donations = pgTable("donations", {
  id: id(),
  citizenId: varchar("citizen_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  ngoId: varchar("ngo_id", { length: 36 }),
  category: text("category").notNull(), // 'clothes' | 'food' | 'electronics' | 'furniture' | 'books' | 'other'
  description: text("description"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // 'pending' | 'scheduled' | 'completed' | 'cancelled'
  proofImageUrl: text("proof_image_url"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  rewardPoints: integer("reward_points"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: now(),
  updatedAt: updated(),
});

export const communityEvents = pgTable("community_events", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull().default("cleanup"), // 'cleanup' | 'plantation' | 'awareness' | 'workshop'
  location: text("location"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  maxParticipants: integer("max_participants"),
  rewardPoints: integer("reward_points").default(100),
  imageUrl: text("image_url"),
  organizerId: varchar("organizer_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  createdAt: now(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: id(),
  eventId: varchar("event_id", { length: 36 }).notNull().references(() => communityEvents.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  attended: boolean("attended").default(false),
  createdAt: now(),
}, (table) => ({
  eventRegUnique: uniqueIndex("event_reg_unique").on(table.eventId, table.userId),
}));

export const communityPosts = pgTable("community_posts", {
  id: id(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  ngoId: varchar("ngo_id", { length: 36 }),
  citizenId: varchar("citizen_id", { length: 36 }),
  donationId: varchar("donation_id", { length: 36 }),
  createdAt: now(),
});

export const notifications = pgTable("notifications", {
  id: id(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // 'info' | 'success' | 'warning' | 'report' | 'wallet' | 'event'
  read: boolean("read").default(false),
  referenceId: varchar("reference_id", { length: 36 }),
  referenceType: text("reference_type"),
  createdAt: now(),
});

export const messages = pgTable("messages", {
  id: id(),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  referenceId: varchar("reference_id", { length: 36 }),
  createdAt: now(),
});

export const dustbins = pgTable("dustbins", {
  id:             id(),
  citizenId:      varchar("citizen_id", { length: 36 }).notNull().unique().references(() => appUsers.id, { onDelete: "cascade" }),
  qrCode:         varchar("qr_code", { length: 24 }).notNull().unique(),
  address:        text("address"),
  fillLevel:      integer("fill_level").notNull().default(0),
  lastLevelAt:    timestamp("last_level_at", { withTimezone: true }),
  lastCollectedAt:timestamp("last_collected_at", { withTimezone: true }),
  collectingWorkerId: varchar("collecting_worker_id", { length: 36 }),
  createdAt:      now(),
  updatedAt:      updated(),
});

export const dustbinCollections = pgTable("dustbin_collections", {
  id: id(),
  citizenId: varchar("citizen_id", { length: 36 }).notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id", { length: 36 }),
  fillLevel: integer("fill_level"),
  pointsAwarded: integer("points_awarded").default(10),
  notes: text("notes"),
  createdAt: now(),
});
