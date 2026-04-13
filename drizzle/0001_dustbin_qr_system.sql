-- =============================================
-- Migration: QR Dustbin Incentive System
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Dustbin Collections table — tracks every garbage van pickup
CREATE TABLE IF NOT EXISTS "dustbin_collections" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid()::varchar NOT NULL,
	"citizen_id" varchar(36) NOT NULL,
	"worker_id" varchar(36) NOT NULL,
	"fill_level" text NOT NULL,
	"points_awarded" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Add dustbin_code to profiles (unique QR identifier per citizen)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "dustbin_code" varchar(12);

-- 3. Generate dustbin codes for all existing profiles that don't have one
UPDATE "profiles" 
SET "dustbin_code" = 'ECO-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8))
WHERE "dustbin_code" IS NULL;

-- 4. Add coupon_code column to government_benefits if missing
ALTER TABLE "government_benefits" ADD COLUMN IF NOT EXISTS "coupon_code" text;

-- 5. Add total_collections to cleanliness_scores for tracking
ALTER TABLE "cleanliness_scores" ADD COLUMN IF NOT EXISTS "total_collections" integer DEFAULT 0;

-- 6. Foreign keys for dustbin_collections
ALTER TABLE "dustbin_collections" 
  ADD CONSTRAINT "dustbin_collections_citizen_id_app_users_id_fk" 
  FOREIGN KEY ("citizen_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "dustbin_collections" 
  ADD CONSTRAINT "dustbin_collections_worker_id_app_users_id_fk" 
  FOREIGN KEY ("worker_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;

-- 7. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS "idx_dustbin_collections_citizen" ON "dustbin_collections" USING btree ("citizen_id");
CREATE INDEX IF NOT EXISTS "idx_dustbin_collections_worker" ON "dustbin_collections" USING btree ("worker_id");
CREATE INDEX IF NOT EXISTS "idx_dustbin_collections_created" ON "dustbin_collections" USING btree ("created_at" DESC);

-- 8. Add unique constraint on dustbin_code
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_dustbin_code_unique" ON "profiles" USING btree ("dustbin_code");
