// Supabase Configuration Test
// This file tests if your Supabase credentials are working correctly

const SUPABASE_URL = 'https://vhqwguqptzaogekpwbok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocXdndXFwdHphb2dla3B3Ym9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3ODU1MCwiZXhwIjoyMDc4ODU0NTUwfQ.aRc7lzAGIiz0nVSBPhS84GAVLXmp50ZWA0W9tgIQj5M';

// Test function to check Supabase connection
async function testSupabaseConnection() {
    try {
        // Initialize Supabase
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase client created successfully');
        console.log('📍 URL:', SUPABASE_URL);
        console.log('🔑 Key length:', SUPABASE_ANON_KEY.length);
        
        // Test basic query
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Query error:', error.message);
            console.log('💡 This might mean:');
            console.log('   - Database tables not created (run schema.sql)');
            console.log('   - RLS policies blocking access');
            console.log('   - Network connectivity issues');
        } else {
            console.log('✅ Database connection successful!');
            console.log('📊 Found', data ? data.length : 0, 'products');
        }
        
    } catch (error) {
        console.error('❌ Supabase initialization error:', error.message);
        console.log('💡 Check if:');
        console.log('   - Supabase URL is correct');
        console.log('   - ANON key is valid');
        console.log('   - CORS settings allow your domain');
        console.log('   - Project is active in Supabase dashboard');
    }
}

// Run the test
testSupabaseConnection();