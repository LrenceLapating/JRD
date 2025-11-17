// Test Supabase Storage Connection
// Run this in browser console to test storage

const SUPABASE_URL = 'https://vhqwguqptzaogekpwbok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocXdndXFwdHphb2dla3B3Ym9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzg1NTAsImV4cCI6MjA3ODg1NDU1MH0.aRc7lzAGIiz0nVSBPhS84GAVLXmp50ZWA0W9tgIQj5M';

async function testStorage() {
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('Testing storage bucket...');
        
        // Test 1: List buckets
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        console.log('Buckets:', buckets);
        
        if (bucketError) {
            console.error('Bucket error:', bucketError);
            return;
        }
        
        // Test 2: Check if images bucket exists
        const imagesBucket = buckets.find(b => b.name === 'images');
        console.log('Images bucket:', imagesBucket);
        
        if (!imagesBucket) {
            console.error('❌ Images bucket not found');
            return;
        }
        
        // Test 3: Test upload permissions
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const fileName = `test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, testFile);
        
        if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            console.log('Error details:', uploadError.message);
        } else {
            console.log('✅ Upload successful:', uploadData);
            
            // Clean up test file
            await supabase.storage.from('images').remove([fileName]);
            console.log('✅ Test file cleaned up');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

console.log('Run: testStorage()');