# Supabase Configuration Guide

## Setup Instructions

1. **Create Supabase Account and Project**
   - Go to https://supabase.com
   - Sign up for a free account
   - Create a new project
   - Note down your project URL and anon key

2. **Database Setup**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `schema.sql`
   - Run the SQL script to create all tables and insert demo data

3. **Authentication Setup**
   - Go to Authentication settings in Supabase dashboard
   - Enable Email authentication
   - Create an admin user with email and password
   - Note down the admin credentials for login

4. **Storage Setup**
   - Go to Storage settings in Supabase dashboard
   - Create a new bucket called "images"
   - Set bucket policies to allow public read access
   - Set write permissions for authenticated users

5. **Update Configuration Files**
   - Replace `YOUR_SUPABASE_URL` in these files with your actual Supabase URL:
     - `script.js`
     - `admin/login.html`
     - `admin/admin.js`
   - Replace `YOUR_SUPABASE_ANON_KEY` in the same files with your actual anon key

## Database Tables

### products
- Stores fire extinguisher product information
- Fields: id, title, description, price, image_url, created_at, updated_at

### about_us
- Stores about us content for the landing page
- Fields: id, description, mission, services, image_url, created_at, updated_at

### location
- Stores business location information
- Fields: id, address, latitude, longitude, created_at, updated_at

### sales_records
- Stores customer sales records
- Fields: id, customer_name, product_name, sale_date, receipt_url, created_at, updated_at

## Security Rules

The schema includes basic RLS (Row Level Security) permissions:
- **Anonymous users**: Can read all data (SELECT)
- **Authenticated users**: Can perform all operations (INSERT, SELECT, UPDATE, DELETE)

## Admin Access

- Hidden admin trigger: Click the fire extinguisher icon (🧯) 10 times in the top-right corner
- Admin login: `/admin/login.html`
- Admin dashboard: `/admin/dashboard.html`

## Image Storage

Images are stored in Supabase Storage:
- Product images: `products/` folder
- About images: `about/` folder  
- Receipt images: `receipts/` folder

## Google Maps Integration

Location coordinates are used to generate Google Maps embed URLs automatically. Update latitude and longitude in the admin dashboard to change the map location.