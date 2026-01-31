-- Migration: Rename "Basic Plus" to "Standard" and add business_type to profiles
-- Date: 2025-01-31

-- Step 1: Rename "Basic Plus" to "Standard" in subscription_plans
UPDATE subscription_plans
SET name = 'Standard'
WHERE LOWER(name) = 'basic plus';

-- Step 2: Add business_type column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_type text DEFAULT 'restaurant'
CHECK (business_type IN ('hotel', 'restaurant'));

-- Add comment
COMMENT ON COLUMN profiles.business_type IS 'Type of business: hotel or restaurant. Affects UI labels (Room Number vs Table Number for bell service)';

-- Step 3: Update existing profiles to default to 'restaurant'
UPDATE profiles
SET business_type = 'restaurant'
WHERE business_type IS NULL;
