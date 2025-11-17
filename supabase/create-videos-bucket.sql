-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']);

-- Set up storage policies for videos bucket
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Allow users to update their own videos
CREATE POLICY "Users can update own videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos' AND auth.uid() = owner);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos' AND auth.uid() = owner);