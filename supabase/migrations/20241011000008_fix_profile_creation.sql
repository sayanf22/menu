-- Drop the automatic profile creation trigger as it's causing RLS issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update RLS policies to allow users to insert their own profile during signup
-- This policy allows a user to insert their own profile when they first sign up
CREATE POLICY "Users can insert their own profile during signup"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);