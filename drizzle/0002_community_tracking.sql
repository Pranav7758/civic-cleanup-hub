-- 0002_community_tracking.sql
-- Add capabilities for negotiation tracking and community posts

CREATE TABLE IF NOT EXISTS "community_posts" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donation_id" varchar(36),
	"ngo_id" varchar(36) NOT NULL,
	"citizen_id" varchar(36) NOT NULL,
	"image_url" text NOT NULL,
	"content" text NOT NULL,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Alter messages table for contextual negotiation
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "reference_id" varchar(36);
