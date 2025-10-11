-- Create storage bucket for menu images (if not exists)
INSERT INTO storage.buckets (id, name, public)
SELECT 'menu-images', 'menu-images', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'menu-images'
);

-- Storage RLS Policies
CREATE POLICY "Public can view menu images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Restaurant owners can upload menu images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Restaurant owners can delete their menu images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'menu-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to get public social links
CREATE OR REPLACE FUNCTION public.get_public_social_links(rest_id uuid)
RETURNS TABLE(
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,
  youtube TEXT,
  whatsapp TEXT,
  website TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    facebook,
    instagram,
    twitter,
    youtube,
    whatsapp,
    website
  FROM public.social_links
  WHERE restaurant_id = rest_id;
$$;