-- Fix profile creation by removing duplicate policies and ensuring proper RLS
-- Drop existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile during signup" ON public.profiles;

-- Create a single, clear INSERT policy
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has the correct structure
-- Add any missing columns if needed (this is safe if columns already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'restaurant_name') THEN
        ALTER TABLE public.profiles ADD COLUMN restaurant_name TEXT NOT NULL DEFAULT 'New Restaurant';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'restaurant_description') THEN
        ALTER TABLE public.profiles ADD COLUMN restaurant_description TEXT;
    END IF;
END $$;