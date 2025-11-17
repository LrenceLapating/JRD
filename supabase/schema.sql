-- FireGuard Pro Database Schema
-- This script creates all necessary tables for the fire extinguisher business landing page

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Us table
CREATE TABLE IF NOT EXISTS about_us (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    mission TEXT NOT NULL,
    services TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location table
CREATE TABLE IF NOT EXISTS location (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Records table
CREATE TABLE IF NOT EXISTS sales_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    sale_date DATE NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_us_updated_at BEFORE UPDATE ON about_us
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_updated_at BEFORE UPDATE ON location
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_records_updated_at BEFORE UPDATE ON sales_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for anon and authenticated roles
GRANT SELECT ON products TO anon;
GRANT SELECT ON about_us TO anon;
GRANT SELECT ON location TO anon;
GRANT SELECT ON sales_records TO anon;

GRANT ALL ON products TO authenticated;
GRANT ALL ON about_us TO authenticated;
GRANT ALL ON location TO authenticated;
GRANT ALL ON sales_records TO authenticated;

-- Insert demo data
INSERT INTO products (title, description, price, image_url) VALUES
('ABC Dry Chemical Extinguisher', 'Multi-purpose fire extinguisher suitable for Class A, B, and C fires. Perfect for offices and homes.', 89.99, 'https://via.placeholder.com/300x250?text=ABC+Fire+Extinguisher'),
('CO2 Fire Extinguisher', 'Clean agent extinguisher ideal for electrical fires and sensitive equipment areas.', 129.99, 'https://via.placeholder.com/300x250?text=CO2+Fire+Extinguisher'),
('Water Mist Extinguisher', 'Eco-friendly extinguisher using deionized water mist for Class A and C fires.', 159.99, 'https://via.placeholder.com/300x250?text=Water+Mist+Extinguisher');

INSERT INTO about_us (description, mission, services, image_url) VALUES
('FireGuard Pro is your trusted partner in fire safety solutions. We provide professional-grade fire extinguishers and safety equipment to protect lives and property.', 
 'Our mission is to ensure every home and business is equipped with reliable fire safety equipment and knowledge to prevent and respond to fire emergencies.',
 'We offer fire extinguisher sales, installation, maintenance, and training services for residential, commercial, and industrial clients.',
 'https://via.placeholder.com/500x300?text=Fire+Safety+Team');

INSERT INTO location (address, latitude, longitude) VALUES
('123 Fire Safety Street, Safety City, SC 12345', 40.7128, -74.0060);

INSERT INTO sales_records (customer_name, product_name, sale_date, receipt_url) VALUES
('John Smith', 'ABC Dry Chemical Extinguisher', '2024-01-15', null),
('Sarah Johnson', 'CO2 Fire Extinguisher', '2024-01-14', null),
('Mike Wilson', 'Water Mist Extinguisher', '2024-01-13', null);