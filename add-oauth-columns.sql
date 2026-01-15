-- Add OAuth columns to Users table
-- Run this on your AWS RDS PostgreSQL database

-- Add columns only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='googleId') THEN
        ALTER TABLE "Users" ADD COLUMN "googleId" VARCHAR(255);
        ALTER TABLE "Users" ADD CONSTRAINT "Users_googleId_key" UNIQUE ("googleId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='facebookId') THEN
        ALTER TABLE "Users" ADD COLUMN "facebookId" VARCHAR(255);
        ALTER TABLE "Users" ADD CONSTRAINT "Users_facebookId_key" UNIQUE ("facebookId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='linkedinId') THEN
        ALTER TABLE "Users" ADD COLUMN "linkedinId" VARCHAR(255);
        ALTER TABLE "Users" ADD CONSTRAINT "Users_linkedinId_key" UNIQUE ("linkedinId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='twitterId') THEN
        ALTER TABLE "Users" ADD COLUMN "twitterId" VARCHAR(255);
        ALTER TABLE "Users" ADD CONSTRAINT "Users_twitterId_key" UNIQUE ("twitterId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Users' AND column_name='instagramId') THEN
        ALTER TABLE "Users" ADD COLUMN "instagramId" VARCHAR(255);
        ALTER TABLE "Users" ADD CONSTRAINT "Users_instagramId_key" UNIQUE ("instagramId");
    END IF;
END $$;
