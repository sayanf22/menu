-- Create menu_images table
CREATE TABLE public.menu_images (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  dominant_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.menu_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_images
CREATE POLICY "Restaurant owners can view their menu images"
ON public.menu_images
FOR SELECT
USING (auth.uid() = restaurant_id);

CREATE POLICY "Restaurant owners can insert their menu images"
ON public.menu_images
FOR INSERT
WITH CHECK (auth.uid() = restaurant_id);

CREATE POLICY "Restaurant owners can update their menu images"
ON public.menu_images
FOR UPDATE
USING (auth.uid() = restaurant_id);

CREATE POLICY "Restaurant owners can delete their menu images"
ON public.menu_images
FOR DELETE
USING (auth.uid() = restaurant_id);

CREATE POLICY "Anyone can view menu images for public display"
ON public.menu_images
FOR SELECT
USING (true);