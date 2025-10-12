# 🚀 Deployment Guide - AddMenu

## Pre-Deployment Checklist

### ✅ Security
- [x] All secrets in .env (not committed to Git)
- [x] .env.example created
- [x] .gitignore includes .env
- [x] No hardcoded API keys
- [x] RLS policies applied
- [x] Security headers configured

### ✅ Performance
- [x] Production build tested
- [x] Bundle size optimized (183 KB)
- [x] Images optimized
- [x] Caching configured
- [x] Lazy loading implemented

### ✅ SEO
- [x] Meta tags configured
- [x] Sitemap.xml created
- [x] Robots.txt configured
- [x] Structured data added
- [x] Open Graph tags
- [x] Canonical URLs

### ✅ Testing
- [x] Authentication tested
- [x] File uploads tested
- [x] QR code generation tested
- [x] Analytics tested
- [x] Mobile responsive tested
- [x] Dark mode tested

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

**Why Cloudflare Pages?**
- ✅ Free tier available
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Fast deployment
- ✅ Great for static sites

**Steps:**

1. **Connect GitHub Repository**
   ```bash
   # Push to GitHub first
   git remote add origin https://github.com/YOUR_USERNAME/addmenu.git
   git push -u origin main
   ```

2. **Create Cloudflare Pages Project**
   - Go to: https://dash.cloudflare.com/
   - Click "Pages" → "Create a project"
   - Connect your GitHub account
   - Select your repository
   - Configure build settings:
     ```
     Build command: npm run build
     Build output directory: dist
     ```

3. **Add Environment Variables**
   - In Cloudflare Pages dashboard
   - Go to Settings → Environment variables
   - Add:
     ```
     VITE_SUPABASE_PROJECT_ID=your-project-id
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
     ```

4. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete
   - Your site will be live at: `your-project.pages.dev`

### Option 2: Vercel

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add your Supabase credentials

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

### Option 3: Netlify

**Steps:**

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Add Environment Variables**
   - Netlify dashboard → Site settings → Environment variables

## Post-Deployment Steps

### 1. Update Supabase Settings

**Auth Settings:**
- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/url-configuration
- Add your production URL to "Site URL"
- Add to "Redirect URLs":
  ```
  https://your-domain.com/auth
  https://your-domain.com/dashboard
  ```

**Email Templates:**
- Update email templates with your production URL
- Test email confirmation flow

### 2. Test Production Site

**Critical Tests:**
- [ ] Sign up new account
- [ ] Confirm email
- [ ] Log in
- [ ] Upload menu images
- [ ] Generate QR code
- [ ] View public menu page
- [ ] Submit feedback
- [ ] Check analytics
- [ ] Test dark mode
- [ ] Test on mobile

### 3. Configure Custom Domain (Optional)

**Cloudflare Pages:**
1. Go to Custom domains
2. Add your domain
3. Update DNS records
4. Wait for SSL certificate

**Vercel:**
1. Project Settings → Domains
2. Add domain
3. Configure DNS
4. SSL auto-configured

### 4. Set Up Monitoring

**Recommended Tools:**
- Google Analytics (add tracking code)
- Sentry (error tracking)
- Uptime monitoring (UptimeRobot)
- Performance monitoring (Lighthouse CI)

### 5. Update Documentation

- [ ] Update README with production URL
- [ ] Update API documentation
- [ ] Update user guides
- [ ] Create changelog

## Environment Variables Reference

### Required for Frontend
```bash
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Required for Edge Functions (Supabase)
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key (if using email)
ADMIN_EMAIL=your-admin-email
SITE_URL=https://your-production-url.com
```

## Rollback Plan

If something goes wrong:

1. **Cloudflare Pages:**
   - Go to Deployments
   - Click on previous working deployment
   - Click "Rollback to this deployment"

2. **Vercel:**
   - Go to Deployments
   - Find working deployment
   - Click "Promote to Production"

3. **Netlify:**
   - Go to Deploys
   - Find working deploy
   - Click "Publish deploy"

## Performance Optimization

### After Deployment

1. **Test with Lighthouse**
   ```bash
   npm install -g lighthouse
   lighthouse https://your-site.com --view
   ```

2. **Check Bundle Size**
   ```bash
   npm run build
   # Check dist/ folder size
   ```

3. **Monitor Loading Speed**
   - Use Google PageSpeed Insights
   - Target: < 3s on 3G
   - Target: < 1s on 4G/5G

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Check variable names match exactly
- Restart deployment after adding variables
- Verify in build logs

### 404 Errors on Refresh
- Configure SPA redirect rules
- For Cloudflare Pages: Add `_redirects` file
  ```
  /* /index.html 200
  ```

### CORS Errors
- Check Supabase CORS settings
- Verify production URL is whitelisted
- Check API endpoint URLs

## Security Reminders

- ✅ Never commit .env file
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS (automatic on most platforms)
- ✅ Keep dependencies updated
- ✅ Monitor for security vulnerabilities
- ✅ Regular security audits

## Support

For deployment issues:
- Check platform documentation
- Review build logs
- Test locally first
- Contact support if needed

---

**Ready to deploy? Follow the checklist and you'll be live in minutes!** 🚀
