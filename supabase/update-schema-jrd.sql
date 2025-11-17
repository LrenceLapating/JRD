-- Create business_details table for JRD Fire Fighting Equipment Trading
CREATE TABLE IF NOT EXISTS business_details (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL DEFAULT 'JRD Fire Fighting Equipment Trading',
    tagline VARCHAR(255) NOT NULL DEFAULT 'A Product of RD RAC''S MARKETING',
    description TEXT,
    services TEXT[], -- Array of services
    phone_numbers TEXT[], -- Array of phone numbers
    address TEXT,
    facebook_page VARCHAR(255),
    email VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table for video content
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default JRD business details
INSERT INTO business_details (
    business_name,
    tagline,
    description,
    services,
    phone_numbers,
    address,
    facebook_page,
    email
) VALUES (
    'JRD Fire Fighting Equipment Trading',
    'A Product of RD RAC''S MARKETING',
    'Your trusted partner in fire safety solutions. We provide professional-grade fire extinguishers and safety equipment to protect lives and property in Panabo City and surrounding areas.',
    ARRAY[
        'Fire Extinguisher Sales',
        'Fire Extinguisher Installation',
        'Fire Extinguisher Maintenance & Refilling',
        'Fire Safety Training',
        'Fire Safety Consultation',
        'Emergency Fire Equipment'
    ],
    ARRAY[
        '09460341076',
        '09219771021'
    ],
    'Blk 2 Lot 21 Ricsyl Village New Visayas, Panabo City',
    'JRD Fire Fighting Equipment Trading',
    'jrd.fire.fighting@email.com'
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_business_details_updated_at 
    BEFORE UPDATE ON business_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON business_details TO authenticated;
GRANT ALL ON videos TO authenticated;
GRANT SELECT ON business_details TO anon;
GRANT SELECT ON videos TO anon;