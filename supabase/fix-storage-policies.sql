-- Fix Supabase Storage RLS Policies for FireGuard Pro
-- Run these commands in your Supabase SQL Editor

-- First, ensure the bucket exists and is public
-- This should already be done, but just in case:
UPDATE storage.buckets 
SET public = true 
WHERE id = 'images';

-- Create comprehensive storage policies

-- 1. Allow public to read all objects in images bucket
CREATE POLICY "Allow public read on images bucket" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'images');

-- 2. Allow authenticated users to insert objects
CREATE POLICY "Allow authenticated insert on images bucket" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

-- 3. Allow authenticated users to update objects
CREATE POLICY "Allow authenticated update on images bucket" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'images') 
WITH CHECK (bucket_id = 'images');

-- 4. Allow authenticated users to delete objects
CREATE POLICY "Allow authenticated delete on images bucket" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'images');

-- 5. More permissive policy for development (optional)
-- This allows any authenticated user to manage any file
CREATE POLICY "Allow all operations for authenticated users" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id = 'images') 
WITH CHECK (bucket_id = 'images');

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Verify policies are created
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';