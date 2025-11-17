-- Complete Content Management System Migration
-- This migration makes every part of the landing page editable from the admin panel

-- 1. Site Settings Table (for global settings like page title)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_title TEXT DEFAULT 'FireGuard Pro - Professional Fire Extinguisher Solutions',
    meta_description TEXT,
    theme_color TEXT DEFAULT '#ff6b35',
    favicon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (page_title, meta_description) VALUES 
('FireGuard Pro - Professional Fire Extinguisher Solutions', 'Professional fire extinguisher sales, installation, and maintenance services. Your trusted partner in fire safety.');

-- 2. Section Headers Table (for all section titles and subtitles)
CREATE TABLE IF NOT EXISTS section_headers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default section headers
INSERT INTO section_headers (section_key, title, subtitle, display_order) VALUES 
('hero', 'FireGuard Pro', 'Your Trusted Partner in Fire Safety Solutions', 1),
('products', 'Our Fire Extinguisher Products', 'Premium quality fire safety equipment', 2),
('business', 'JRD Fire Fighting Equipment Trading', 'A Product of RD RAC''S MARKETING', 3),
('about', 'About Us', 'Learn more about our fire safety expertise', 4),
('location', 'Find Us', 'Visit our store location', 5),
('videos', 'Installation', 'Watch our installation videos', 6),
('sales', 'Recent Sales', 'See what our customers are buying', 7),
('contact', 'Contact Us', 'Get in touch with our fire safety experts', 8),
('footer', 'Contact Us', 'Professional Fire Safety Solutions', 9);

-- 3. Section Subheaders Table (for subsection labels)
CREATE TABLE IF NOT EXISTS section_subheaders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT NOT NULL,
    subkey TEXT NOT NULL,
    text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section_key, subkey)
);

-- Insert default section subheaders
INSERT INTO section_subheaders (section_key, subkey, text, display_order) VALUES 
('contact', 'call_us', '📞 Call Us', 1),
('contact', 'our_location', '📍 Our Location', 2),
('contact', 'social_media', '📱 Social Media', 3),
('contact', 'business_hours', '⏰ Business Hours', 4),
('contact', 'contact_form', 'Send Us a Message', 5),
('location', 'store_heading', 'Visit Our Store', 1),
('location', 'business_hours', 'Business Hours', 2);

-- 4. Hero Content Table (for hero section specific content)
CREATE TABLE IF NOT EXISTS hero_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT DEFAULT 'FireGuard Pro',
    subtitle TEXT DEFAULT 'Your Trusted Partner in Fire Safety Solutions',
    background_image_url TEXT,
    cta_text TEXT DEFAULT 'Get Started',
    cta_link TEXT DEFAULT '#contact',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default hero content
INSERT INTO hero_content (title, subtitle, cta_text, cta_link) VALUES 
('FireGuard Pro', 'Your Trusted Partner in Fire Safety Solutions', 'Get Started', '#contact');

-- 5. Hero Features Table (for hero feature badges)
CREATE TABLE IF NOT EXISTS hero_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default hero features
INSERT INTO hero_features (label, icon, display_order) VALUES 
('Professional Grade', '⭐', 1),
('24/7 Support', '🕐', 2),
('Certified Products', '✅', 3);

-- 6. Business Statistics Table (for business section stats)
CREATE TABLE IF NOT EXISTS business_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    value_text TEXT NOT NULL,
    label TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default business stats
INSERT INTO business_stats (value_text, label, display_order) VALUES 
('5+', 'Years Experience', 1),
('1000+', 'Happy Customers', 2),
('24/7', 'Emergency Support', 3);

-- 7. Business Features Table (for business section features)
CREATE TABLE IF NOT EXISTS business_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    icon TEXT NOT NULL DEFAULT '✓',
    label TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default business features
INSERT INTO business_features (icon, label, display_order) VALUES 
('✓', 'Certified Equipment', 1),
('✓', 'Professional Service', 2),
('✓', 'Competitive Pricing', 3);

-- 8. Business Overlay Texts Table (for image overlay content)
CREATE TABLE IF NOT EXISTS business_overlay_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    overlay_key TEXT NOT NULL UNIQUE,
    text TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default overlay text
INSERT INTO business_overlay_texts (overlay_key, text, icon) VALUES 
('main_overlay', 'Your Safety is Our Priority', '🛡️');

-- 9. CTA Buttons Table (for call-to-action buttons)
CREATE TABLE IF NOT EXISTS cta_buttons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT NOT NULL,
    text TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('section', 'url', 'phone', 'email')),
    target_value TEXT NOT NULL,
    variant TEXT DEFAULT 'primary' CHECK (variant IN ('primary', 'secondary', 'outline')),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default CTA buttons
INSERT INTO cta_buttons (section_key, text, target_type, target_value, variant, display_order) VALUES 
('business', 'Get Free Consultation', 'section', 'contact', 'primary', 1),
('business', 'View Our Products', 'section', 'products', 'secondary', 2);

-- 10. Location Hours Table (for business hours)
CREATE TABLE IF NOT EXISTS location_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    label TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(day_of_week)
);

-- Insert default location hours
INSERT INTO location_hours (day_of_week, open_time, close_time, is_closed, label) VALUES 
(1, '08:00:00', '18:00:00', false, 'Monday - Friday: 8:00 AM - 6:00 PM'),
(6, '09:00:00', '16:00:00', false, 'Saturday: 9:00 AM - 4:00 PM'),
(0, NULL, NULL, true, 'Sunday: Closed');

-- 11. Form Texts Table (for form labels and placeholders)
CREATE TABLE IF NOT EXISTS form_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_key TEXT NOT NULL,
    field_key TEXT NOT NULL,
    label TEXT,
    placeholder TEXT,
    button_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(form_key, field_key)
);

-- Insert default form texts
INSERT INTO form_texts (form_key, field_key, placeholder, display_order) VALUES 
('contact', 'name', 'Your Name', 1),
('contact', 'phone', 'Your Phone Number', 2),
('contact', 'message', 'Your Message', 3);

INSERT INTO form_texts (form_key, field_key, button_text, display_order) VALUES 
('contact', 'submit', 'Send Message', 4);

-- 12. UI Texts Table (for small UI elements)
CREATE TABLE IF NOT EXISTS ui_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ui_key TEXT NOT NULL UNIQUE,
    text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default UI texts
INSERT INTO ui_texts (ui_key, text) VALUES 
('slider_prev_label', 'Previous image'),
('slider_next_label', 'Next image'),
('about_image_alt', 'About FireGuard Pro'),
('business_image_alt', 'JRD Fire Fighting Equipment Trading');

-- 13. Footer Settings Table (for footer content)
CREATE TABLE IF NOT EXISTS footer_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT DEFAULT 'FireGuard Pro',
    tagline TEXT DEFAULT 'Professional Fire Safety Solutions',
    extra_line TEXT DEFAULT 'Protecting lives and property since 2010',
    contact_title TEXT DEFAULT 'Contact Us',
    copyright_text TEXT DEFAULT '© 2024 FireGuard Pro. All rights reserved.',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default footer settings
INSERT INTO footer_settings (title, tagline, extra_line, contact_title, copyright_text) VALUES 
('FireGuard Pro', 'Professional Fire Safety Solutions', 'Protecting lives and property since 2010', 'Contact Us', '© 2024 FireGuard Pro. All rights reserved.');

-- 14. Update existing tables to add missing columns
-- Add title to about_us table
ALTER TABLE about_us ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'About Us';
ALTER TABLE about_us ADD COLUMN IF NOT EXISTS image_alt TEXT DEFAULT 'About FireGuard Pro';

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all new tables
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_headers_updated_at BEFORE UPDATE ON section_headers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_subheaders_updated_at BEFORE UPDATE ON section_subheaders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_content_updated_at BEFORE UPDATE ON hero_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_features_updated_at BEFORE UPDATE ON hero_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_stats_updated_at BEFORE UPDATE ON business_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_features_updated_at BEFORE UPDATE ON business_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_overlay_texts_updated_at BEFORE UPDATE ON business_overlay_texts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cta_buttons_updated_at BEFORE UPDATE ON cta_buttons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_hours_updated_at BEFORE UPDATE ON location_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_texts_updated_at BEFORE UPDATE ON form_texts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ui_texts_updated_at BEFORE UPDATE ON ui_texts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_settings_updated_at BEFORE UPDATE ON footer_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for public access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;