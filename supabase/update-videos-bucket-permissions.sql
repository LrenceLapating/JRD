-- Ensure videos bucket exists with proper configuration
-- This migration handles cases where the bucket might already exist

-- Check if bucket exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']);
    END IF;
END $$;

-- Update bucket settings if it exists
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 524288000, -- 500MB limit
    allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
WHERE id = 'videos';

-- Grant permissions for video uploads
-- Allow anon users to read videos
GRANT SELECT ON storage.objects TO anon;

-- Allow authenticated users to read and write videos
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive storage policies for videos bucket
DROP POLICY IF EXISTS "Public Access videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete videos" ON storage.objects;

-- Public read access for videos
CREATE POLICY "Public Access videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update videos they own
CREATE POLICY "Authenticated update videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete videos they own
CREATE POLICY "Authenticated delete videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos' AND auth.role() = 'authenticated');