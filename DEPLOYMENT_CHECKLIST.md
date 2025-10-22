# 🚀 Deployment Checklist - WC26 Fan Zone

## Pre-Deployment Checklist

### ✅ Environment Variables
Configure these in your hosting platform (Vercel, Netlify, etc.):

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional but Recommended
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Google Analytics
GEMINI_API_KEY=your-gemini-api-key          # For AI travel planner
```

### ✅ Build Verification
- [x] All routes compile successfully (70+ pages)
- [x] No TypeScript errors
- [x] No ESLint critical errors
- [x] Bundle size under 250 KB (currently 203 KB ✅)

### ✅ SEO Setup
- [x] Sitemap.xml configured with all routes
- [x] Robots.txt properly configured
- [x] Meta tags on all pages (title, description, OG, Twitter)
- [x] Canonical URLs set
- [x] Schema.org markup on team pages

### ✅ Performance
- [x] Web Vitals monitoring enabled
- [x] Images optimized (Next.js Image component where applicable)
- [x] Code splitting with dynamic imports
- [x] Static generation for teams and guides (SSG)

### ✅ Analytics & Tracking
- [x] Google Analytics component added
- [x] Event tracking setup (share, newsletter, etc.)
- [x] Web Vitals tracking
- [x] Vercel Analytics enabled

### ✅ User Experience
- [x] Loading states for key pages
- [x] Error boundaries and 404 page
- [x] Scroll-to-top button
- [x] Print-friendly styles
- [x] Responsive design tested

### ✅ Functionality
- [x] Authentication flow (Supabase)
- [x] Newsletter signup
- [x] Contact form
- [x] Forum basic structure
- [x] Language switching (5 languages)

## Deployment Steps

### 1. Database Setup (Supabase)

```sql
-- Run migrations in order:
-- 1. db/migrations/001_create_subscriptions_table.sql
-- 2. db/migrations/002_create_forum_tables.sql
-- 3. db/migrations/003_forum_profiles_and_policies.sql
-- 4. db/migrations/004_blog_admin_schema.sql
-- 5. db/migrations/005_add_subscription_tier.sql
-- 6. db/migrations/006_travel_brain_schema.sql
```

### 2. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from site-overhaul branch
cd web
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID
```

### 3. Post-Deployment Verification

#### Test Critical Routes
- [ ] Homepage: https://your-domain.com
- [ ] Teams index: https://your-domain.com/teams
- [ ] Team detail (sample): https://your-domain.com/teams/united-states
- [ ] Guides index: https://your-domain.com/guides
- [ ] Guide detail (Dallas): https://your-domain.com/guides/dallas
- [ ] Planner hub: https://your-domain.com/planner
- [ ] Forums: https://your-domain.com/forums
- [ ] Blog: https://your-domain.com/blog

#### Test Functionality
- [ ] Newsletter signup works
- [ ] Language switcher works
- [ ] Authentication flow works
- [ ] Social sharing works
- [ ] Scroll-to-top appears
- [ ] Mobile menu works
- [ ] Contact form submits

#### Verify SEO
- [ ] Sitemap accessible: https://your-domain.com/sitemap.xml
- [ ] Robots.txt accessible: https://your-domain.com/robots.txt
- [ ] Google Search Console submitted
- [ ] Meta tags showing in view-source

#### Analytics Check
- [ ] Google Analytics tracking pageviews
- [ ] Event tracking working (share, newsletter)
- [ ] Web Vitals reporting
- [ ] Vercel Analytics dashboard showing data

## Known Issues & Future Work

### Current Limitations
1. **Dallas Guide Only**: Only Dallas city guide is marked as available, others show "Coming Soon"
2. **Trip Builder**: Full AI planner is on separate branch (ai-travel-planner)
3. **Forum Posts**: Forum structure exists but needs content moderation features
4. **Blog Articles**: Admin panel exists but may need additional content

### Future Enhancements
1. **Sprint 7 (if needed)**:
   - Add remaining city guide PDFs
   - Enable more team pages with full data
   - Complete forum moderation tools
   - Add more blog articles

2. **Phase 2 Features**:
   - Full AI travel planner integration
   - Real-time match updates
   - User profiles and saved trips
   - Premium subscription features

## Performance Targets

### Current Metrics (Development)
- First Load JS: 203 KB ✅
- Total Routes: 70+ pages ✅
- Static Generation: 56 pages (teams + guides) ✅

### Production Targets
- Lighthouse Score: 90+ ✅
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Support & Monitoring

### Error Tracking
- Monitor Console for client-side errors
- Check Vercel logs for server errors
- Web Vitals dashboard for performance issues

### User Feedback Channels
- Contact form submissions
- Newsletter list for announcements
- Social media monitoring

## Rollback Plan

If issues arise:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy from main branch
git checkout main
vercel --prod
```

## Launch Announcement

Once verified:
1. Announce on social media
2. Email newsletter subscribers
3. Update README with live URL
4. Submit to search engines
5. Monitor analytics for first 48 hours

---

**Prepared by:** Site Overhaul Team
**Last Updated:** Sprint 6 Completion
**Status:** Ready for Testing → Deployment
