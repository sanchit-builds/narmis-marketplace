-- ====================================================================
-- NARMIS MARKETPLACE MIGRATION
-- 1. Storage bucket setup for listing-images (Online Cloud Upload)
-- 2. Trade Subscriptions & Free Trial Tracking
-- ====================================================================

-- 1. Create listing-images storage bucket if not already existing
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure public read policy on listing-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public Access to Listing Images'
  ) THEN
    CREATE POLICY "Public Access to Listing Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-images');
  END IF;
END $$;

-- Allow authenticated users to upload to listing-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload listing images'
  ) THEN
    CREATE POLICY "Authenticated users can upload listing images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'listing-images');
  END IF;
END $$;

-- Allow anon upload for hackathon/demo listings if unauthenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow upload to listing-images'
  ) THEN
    CREATE POLICY "Allow upload to listing-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'listing-images');
  END IF;
END $$;

-- 2. Add Trade Subscription columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trade_trials_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_trade_subscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
