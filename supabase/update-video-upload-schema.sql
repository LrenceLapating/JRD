-- Update videos table to support file uploads instead of URLs

-- Add new column for video file URL
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS video_file_url TEXT;

-- Update existing records to move video_url to video_file_url
UPDATE videos 
SET video_file_url = video_url 
WHERE video_url IS NOT NULL AND video_url != '';

-- Make video_url nullable since we'll use video_file_url instead
ALTER TABLE videos 
ALTER COLUMN video_url DROP NOT NULL;

-- Add file size and duration columns for better video management
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Create an index for better performance when filtering active videos
CREATE INDEX IF NOT EXISTS idx_videos_active_order ON videos(is_active, display_order);

-- Grant permissions for video management
GRANT ALL ON videos TO authenticated;
GRANT SELECT ON videos TO anon;