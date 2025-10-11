-- Fix social_links table constraints and RLS issues
-- Add unique constraint on restaurant_id for social_links to enable upsert
ALTER TABLE public.social_links 
ADD CONSTRAINT social_links_restaurant_id_unique UNIQUE (restaurant_id);

-- Add foreign key constraints for data integrity
ALTER TABLE public.social_links 
ADD CONSTRAINT social_links_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.menu_images 
ADD CONSTRAINT menu_images_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix RLS policies for social_links - remove conflicting policies
DROP POLICY IF EXISTS "Restaurant owners can manage their social links" ON public.social_links;
DROP POLICY IF EXISTS "Restaurant owners can view their social links" ON public.social_links;
DROP POLICY IF EXISTS "Public can view social links" ON public.social_links;

-- Create clear, non-conflicting RLS policies for social_links
CREATE POLICY "Users can view their own social links"
ON public.social_links
FOR SELECT
USING (auth.uid() = restaurant_id);

CREATE POLICY "Users can insert their own social links"
ON public.social_links
FOR INSERT
WITH CHECK (auth.uid() = restaurant_id);

CREATE POLICY "Users can update their own social links"
ON public.social_links
FOR UPDATE
USING (auth.uid() = restaurant_id);

CREATE POLICY "Users can delete their own social links"
ON public.social_links
FOR DELETE
USING (auth.uid() = restaurant_id);

CREATE POLICY "Public can view social links for display"
ON public.social_links
FOR SELECT
USING (true);

-- Fix RLS policies for menu_images - remove conflicting policies
DROP POLICY IF EXISTS "Restaurant owners can view their menu images" ON public.menu_images;
DROP POLICY IF EXISTS "Restaurant owners can insert their menu images" ON public.menu_images;
DROP POLICY IF EXISTS "Restaurant owners can update their menu images" ON public.menu_images;
DROP POLICY IF EXISTS "Restaurant owners can delete their menu images" ON public.menu_images;
DROP POLICY IF EXISTS "Anyone can view menu images for public display" ON public.menu_images;

-- Create clear, non-conflicting RLS policies for menu_images
CREATE POLICY "Users can view their own menu images"
ON public.menu_images
FOR SELECT
USING (auth.uid() = restaurant_id);

CREATE POLICY "Users can insert their own menu images"
ON public.menu_images
FOR INSERT
WITH CHECK (auth.uid() = restaurant_id);

CREATE POLICY "Users can update their own menu images"
ON public.menu_images
FOR UPDATE
USING (auth.uid() = restaurant_id);

CREATE POLICY "Users can delete their own menu images"
ON public.menu_images
FOR DELETE
USING (auth.uid() = restaurant_id);

CREATE POLICY "Public can view menu images for display"
ON public.menu_images
FOR SELECT
USING (true);