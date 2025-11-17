-- Supabase Storage Setup for FireGuard Pro
-- Run these commands in your Supabase SQL Editor

-- Create the storage bucket (this might need to be done in the UI)
-- The bucket creation is typically done through the Supabase dashboard

-- Set up storage policies for the 'images' bucket
-- These policies allow public reading and authenticated writing

-- Policy for public read access
CREATE POLICY "Allow public read access on images" 
ON storage.objects FOR SELECT 
TO anon, authenticated 
USING (bucket_id = 'images');

-- Policy for authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

-- Policy for authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update own images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'images');

-- Policy for authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'images');

-- Grant necessary permissions
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;