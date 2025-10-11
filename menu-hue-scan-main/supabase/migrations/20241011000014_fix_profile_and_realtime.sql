-- Fix missing profiles and enable realtime
-- First, remove the foreign key constraints temporarily to fix existing data
ALTER TABLE public.social_links DROP CONSTRAINT IF EXISTS social_links_restaurant_id_fkey;
ALTER TABLE public.menu_images DROP CONSTRAINT IF EXISTS menu_images_restaurant_id_fkey;

-- Create profiles for any users that don't have them
INSERT INTO public.profiles (id, restaurant_name, restaurant_description)
SELECT 
  au.id,
  'New Restaurant' as restaurant_name,
  'Welcome to our restaurant!' as restaurant_description
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Now add the foreign key constraints back
ALTER TABLE public.social_links 
ADD CONSTRAINT social_links_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.menu_images 
ADD CONSTRAINT menu_images_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable realtime for view_logs table for live analytics
ALTER PUBLICATION supabase_realtime ADD TABLE public.view_logs;

-- Enable realtime for feedback table for live feedback notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;

-- Enable realtime for menu_images table for live menu updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_images;

-- Create a function to ensure profile exists before operations
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, restaurant_name, restaurant_description)
    VALUES (user_id, 'New Restaurant', 'Welcome to our restaurant!')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(UUID) TO authenticated;