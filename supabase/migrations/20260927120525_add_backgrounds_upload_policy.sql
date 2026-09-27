/*
# Add storage upload policy for backgrounds bucket

1. Security
- Adds an INSERT policy on storage.objects for the `backgrounds` bucket.
- Allows anon + authenticated to upload files (needed for developer uploads via API).
- This is a public community background library; all uploads are public.
*/

DROP POLICY IF EXISTS "public_insert_backgrounds_bucket" ON storage.objects;
CREATE POLICY "public_insert_backgrounds_bucket" ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'backgrounds');
