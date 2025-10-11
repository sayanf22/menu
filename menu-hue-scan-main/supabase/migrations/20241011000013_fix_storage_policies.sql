-- Fix storage policies to match the actual file upload pattern
-- Drop existing storage policies
DROP POLICY IF EXISTS "Restaurant owners can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can delete their menu images" ON storage.objects;

-- Create new storage policies that work with the current file naming pattern
-- Files are named like: {restaurantId}-{timestamp}-{index}.{ext}
CREATE POLICY "Authenticated users can upload to menu-images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own menu images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'menu-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  OR name LIKE auth.uid()::text || '-%'
);

-- Also allow users to update their files (for potential future use)
CREATE POLICY "Users can update their own menu images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'menu-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  OR name LIKE auth.uid()::text || '-%'
);