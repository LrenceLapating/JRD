# JRD Fire Fighting Equipment Trading - Landing Page

A professional fire extinguisher business landing page with admin panel for content management.

## Features

### Landing Page
- ✅ Modern, responsive design
- ✅ Product showcase with image slider
- ✅ Video gallery with YouTube-style player
- ✅ Business information display
- ✅ Contact section with business hours
- ✅ Smooth navigation between sections
- ✅ Facebook integration
- ✅ Mobile-optimized

### Admin Panel
- ✅ Complete content management system
- ✅ Dynamic product management
- ✅ Video upload and management
- ✅ Business details editing
- ✅ Sales records management
- ✅ Image slider management
- ✅ About us content editing
- ✅ Location management

### Content Management (14 Database Tables)
- Site settings (title, meta, theme)
- Section headers and subheaders
- Hero content and features
- Business statistics and features
- CTA buttons
- Location hours
- Form texts and UI texts
- Footer settings

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Vercel
- **Styling**: Custom CSS with modern features
- **Icons**: SVG and emoji
- **Fonts**: Inter (Google Fonts)

## Prerequisites

Before deploying, ensure you have:
1. A Supabase account and project set up
2. Vercel account
3. The database migration applied to your Supabase project

## Deployment Instructions

### 1. Database Setup (Supabase)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Apply Database Migration**:
   ```sql
   -- Run the complete migration file in Supabase SQL editor
   -- File: supabase/complete-content-management.sql
   ```

3. **Configure Storage Buckets**:
   - Create buckets for: `products`, `videos`, `slider-images`
   - Set appropriate access policies

### 2. Environment Configuration

1. **Update Supabase Configuration**:
   - In `script.js`, update the Supabase client initialization:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

2. **Update Admin Configuration**:
   - In `admin/script.js`, update the same Supabase credentials

### 3. Vercel Deployment

#### Option A: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)

2. **Configure Project**:
   - Framework Preset: **Other** (important: select "Other", not "Static")
   - Root Directory: `./`
   - Build Command: (leave empty - Vercel will auto-detect this as static)
   - Output Directory: `./`
   
   **Note**: Vercel will automatically detect this as a static site since there's no package.json build script. The "Other" preset ensures proper static file serving.

3. **Environment Variables** (Optional):
   - Add any environment variables if needed
   
4. **What Vercel Will Do**:
   - Automatically detect this as a static site
   - Deploy all HTML, CSS, and JavaScript files
   - Handle the admin panel routing correctly
   - Apply proper caching headers for performance

5. **Deploy**:
   - Click "Deploy" and wait for the build to complete

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy Project**:
   ```bash
   cd /path/to/your/project
   vercel
   ```

4. **Follow Prompts**:
   - Set up and deploy: **Y**
   - Which scope: Select your team or personal account
   - Link to existing project: **N** (for new deployment)
   - Project name: Enter your preferred name
   - Directory: **./**
   - Override settings: **N**

### 4. Post-Deployment Configuration

**Note**: The `vercel.json` configuration has been simplified to the minimal required setup. The current configuration only includes:
- `rewrites` for admin panel routing (`/admin/*` → `/admin/$1`)
- Basic static file handling (Vercel handles the rest automatically)

1. **Update Supabase URLs**:
   - After deployment, update your Supabase URLs to match your deployed domain
   - Add your Vercel domain to Supabase authentication settings

2. **Test Functionality**:
   - Visit your deployed landing page
   - Test the admin panel access (10 clicks on 🔥 icon)
   - Verify all dynamic content loads correctly
   - Test file uploads in admin panel

## File Structure

```
├── index.html              # Main landing page
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript
├── admin/                  # Admin panel
│   ├── index.html         # Admin dashboard
│   ├── script.js          # Admin JavaScript
│   └── styles.css         # Admin styles
├── supabase/              # Database migrations
│   └── complete-content-management.sql
├── vercel.json            # Vercel configuration (simplified for static sites)
├── package.json           # Project configuration
└── README.md              # This file
```

## Customization

### Colors and Theme
- Primary: `#ff6b35` (orange)
- Secondary: `#f7931e` (yellow-orange)
- Dark: `#2c3e50` (dark blue)
- Light: `#ffffff` (white)

### Fonts
- Main font: Inter (Google Fonts)
- Fallback: system-ui, sans-serif

### Images and Assets
- Replace placeholder images in `images/` folder
- Update favicon and social media images
- Customize hero background images

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify Supabase URL and anon key are correct
   - Check network connectivity
   - Ensure RLS policies are configured

2. **File Upload Issues**:
   - Check Supabase storage bucket permissions
   - Verify file size limits
   - Ensure proper authentication

3. **Admin Panel Not Accessible**:
   - Make sure to click the 🔥 icon exactly 10 times
   - Check browser console for errors
   - Verify admin redirect URL is correct
   - Note: Admin panel files are now cached like regular content (simplified configuration)

4. **Content Not Loading**:
   - Check browser console for JavaScript errors
   - Verify all database tables exist
   - Check Supabase row-level security policies

### Support

For issues related to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Project-specific**: Review the codebase or contact support

## Security Considerations

- Always use environment variables for sensitive data
- Implement proper authentication for admin functions
- Regularly update dependencies
- Monitor database access and storage usage
- Use HTTPS for production deployments

## Performance Optimization

- Images are optimized for web
- CSS and JavaScript are minified
- Lazy loading for images and videos
- Efficient database queries with proper indexing
- CDN usage for static assets (Vercel automatically handles this)

---

**Happy Deploying! 🚀**

Your JRD Fire Fighting Equipment Trading landing page should now be live and ready to showcase your fire safety business professionally.