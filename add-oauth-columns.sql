-- Add OAuth columns to Users table
-- Run this on your AWS RDS PostgreSQL database

ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "googleId" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "facebookId" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "linkedinId" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "twitterId" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "instagramId" VARCHAR(255);

-- Add unique constraints
ALTER TABLE "Users" ADD CONSTRAINT "Users_googleId_key" UNIQUE ("googleId");
ALTER TABLE "Users" ADD CONSTRAINT "Users_facebookId_key" UNIQUE ("facebookId");
ALTER TABLE "Users" ADD CONSTRAINT "Users_linkedinId_key" UNIQUE ("linkedinId");
ALTER TABLE "Users" ADD CONSTRAINT "Users_twitterId_key" UNIQUE ("twitterId");
ALTER TABLE "Users" ADD CONSTRAINT "Users_instagramId_key" UNIQUE ("instagramId");
