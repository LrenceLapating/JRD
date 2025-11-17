-- Create slider_images table for product image carousel
CREATE TABLE IF NOT EXISTS slider_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    contact_link TEXT DEFAULT 'https://www.facebook.com/',
    contact_link_type TEXT DEFAULT 'facebook' CHECK (contact_link_type IN ('facebook', 'messenger', 'website', 'phone', 'email')),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_slider_images_order ON slider_images(display_order);
CREATE INDEX IF NOT EXISTS idx_slider_images_active ON slider_images(is_active);

-- Insert default slider images (up to 10)
INSERT INTO slider_images (title, description, image_url, contact_link, contact_link_type, display_order, is_active) VALUES
('Fire Extinguisher Type A', 'Professional fire extinguisher for Class A fires involving ordinary combustibles like wood, paper, and textiles.', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20fire%20extinguisher%20Type%20A%20on%20clean%20white%20background%2C%20high%20quality%20product%20photography%2C%20commercial%20lighting%2C%20professional%20marketing%20image&image_size=landscape_16_9', 'https://www.facebook.com/', 'facebook', 1, true),
('Fire Extinguisher Type B', 'Specialized extinguisher for Class B fires involving flammable liquids like gasoline, oil, and grease.', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20fire%20extinguisher%20Type%20B%20on%20clean%20white%20background%2C%20high%20quality%20product%20photography%2C%20commercial%20lighting%2C%20professional%20marketing%20image&image_size=landscape_16_9', 'https://www.facebook.com/', 'facebook', 2, true),
('Fire Extinguisher Type C', 'Electrical fire extinguisher safe for Class C fires involving energized electrical equipment.', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20fire%20extinguisher%20Type%20C%20on%20clean%20white%20background%2C%20high%20quality%20product%20photography%2C%20commercial%20lighting%2C%20professional%20marketing%20image&image_size=landscape_16_9', 'https://www.facebook.com/', 'facebook', 3, true),
('Multi-Purpose ABC Extinguisher', 'Versatile multi-class extinguisher suitable for homes, offices, and commercial spaces.', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20multi-purpose%20ABC%20fire%20extinguisher%20on%20clean%20white%20background%2C%20high%20quality%20product%20photography%2C%20commercial%20lighting%2C%20professional%20marketing%20image&image_size=landscape_16_9', 'https://www.facebook.com/', 'facebook', 4, true),
('CO2 Fire Extinguisher', 'Clean agent extinguisher perfect for offices, server rooms, and areas with sensitive equipment.', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20CO2%20fire%20extinguisher%20on%20clean%20white%20background%2C%20high%20quality%20product%20photography%2C%20commercial%20lighting%2C%20professional%20marketing%20image&image_size=landscape_16_9', 'https://www.facebook.com/', 'facebook', 5, true);

-- Grant permissions for anon and authenticated roles
GRANT SELECT ON slider_images TO anon;
GRANT SELECT ON slider_images TO authenticated;
GRANT INSERT, UPDATE, DELETE ON slider_images TO authenticated;

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_slider_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER trigger_update_slider_images_updated_at
    BEFORE UPDATE ON slider_images
    FOR EACH ROW
    EXECUTE FUNCTION update_slider_images_updated_at();