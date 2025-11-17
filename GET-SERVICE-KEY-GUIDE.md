# 🚀 Quick Fix Guide - Get Your Service Role Key

## Step 1: Get Your Service Role Key

1. **Open**: https://app.supabase.com
2. **Click your project** (vhqwguqptzaogekpwbok)
3. **Click "Settings"** (bottom left)
4. **Click "API"** in the settings menu
5. **Find "service_role" section**
6. **Click the "Reveal" button** (eye icon)
7. **Copy the entire key** (starts with `eyJ...`)

## Step 2: Update Your Code

**Replace this line in admin.js:**
```javascript
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with your service_role key
```

**With your actual key:**
```javascript
const SUPABASE_SERVICE_KEY = 'paste-your-service-role-key-here';
```

## Step 3: Test It

1. **Save the file**
2. **Refresh your admin dashboard**
3. **Try uploading an image** - it should work!

## 🔑 What This Does:

- **Service Role Key** bypasses all RLS policies
- **Allows direct uploads** without permission issues
- **Works immediately** - no complex setup needed

## ⚠️ Important:

- **Only use Service Role Key in admin pages** (never in public pages)
- **Keep it secret** - don't share it publicly
- **For production**, we'll set up proper RLS policies later

## 📞 If You Need Help:

1. **Check browser console** for error messages
2. **Send me the exact error** you see
3. **Let me know if the key works**!

Your image uploads should work perfectly once you add the Service Role Key! 🎯