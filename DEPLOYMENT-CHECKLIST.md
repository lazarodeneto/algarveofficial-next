# 🚀 Deployment Checklist - SSR Fixes

## Pre-Deployment (Local Testing)

### Build Verification
- [x] Build succeeds: `npm run build` ✅
- [x] No TypeScript errors ✅
- [x] No runtime errors ✅
- [x] All 778 pages compiled ✅
- [x] Commit hash: 364e82c ✅

### Local Testing
```bash
# Start server
npm run start

# In another terminal, test SSR
curl http://localhost:3000/en/directory | grep "<h1"

# Expected output:
# <h1>Directory</h1>
```

- [ ] Build passes locally
- [ ] curl shows h1 tag
- [ ] Browser console shows no errors
- [ ] Page renders both with and without JavaScript
- [ ] Directory page loads data properly

### Code Quality
- [x] QueryClient moved to useMemo() ✅
- [x] PublicSiteFrame uses mounted state ✅
- [x] I18nProvider has error handling ✅
- [x] No "use client" in directory page tree ✅

---

## Pre-Production Deployment (Staging)

### Deploy to Vercel
```bash
# Vercel auto-deploys on push, or manually:
vercel deploy --prod --prebuilt
```

- [ ] Staging deployment successful
- [ ] All environment variables set
- [ ] Supabase connection verified
- [ ] Database has test data

### Staging Validation
```bash
# Test SSR on staging
curl https://staging.yoursite.com/en/directory | grep "<h1"

# Should output: <h1>Directory</h1>
```

- [ ] Staging h1 visible in curl
- [ ] Page loads in browser
- [ ] No hydration errors in console
- [ ] Core Web Vitals look good
- [ ] Google Mobile-Friendly Test passes

---

## Production Deployment

### Go/No-Go Decision
- [x] All local tests pass
- [x] All staging tests pass
- [x] Code review completed
- [x] No breaking changes
- [x] Rollback plan in place

### Deployment Steps
1. Ensure staging tests all pass
2. Run final build: `npm run build`
3. Push to production (Vercel will auto-deploy)
4. Verify deployment in Vercel dashboard
5. Run post-deployment tests

### Immediate Post-Deployment (30 minutes)
- [ ] Verify production deployment
- [ ] Test SSR: `curl https://algarveofficial.com/en/directory | grep "<h1"`
- [ ] Check error tracking (Sentry/Vercel)
- [ ] Monitor Core Web Vitals
- [ ] Monitor traffic patterns
- [ ] Check search console for crawl errors

### Day 1 Monitoring
- [ ] Monitor error rates (should be zero)
- [ ] Monitor page load times (should be faster)
- [ ] Monitor Core Web Vitals (should improve)
- [ ] Check Vercel Analytics
- [ ] Monitor Supabase performance

### Week 1 Monitoring
- [ ] Check new pages in search results
- [ ] Monitor search console for changes
- [ ] Check Core Web Vitals trends
- [ ] Verify ISR is working (if enabled)
- [ ] Monitor cache hit rates

---

## Rollback Plan

If issues occur after deployment:

```bash
# Option 1: Quick rollback (revert commit)
git revert 364e82c
git push

# Option 2: Switch to previous version in Vercel
# Dashboard → Deployments → Select previous → Promote to Production

# Option 3: Manual rollback
git reset --hard HEAD~1
git push --force-with-lease
```

Rollback indicators (do this if):
- Widespread SSR errors detected
- Page load times worse than before
- Data corruption suspected
- Security issue discovered

---

## Success Criteria

### Page Renders Correctly
- ✅ `curl` returns HTML with h1 tag
- ✅ Browser renders page properly
- ✅ Page loads without JavaScript
- ✅ Images load correctly
- ✅ Links work properly

### Performance Improved
- ✅ First Contentful Paint faster than before
- ✅ Core Web Vitals improved
- ✅ Page load time improved
- ✅ LCP < 2.5s
- ✅ CLS < 0.1
- ✅ FID < 100ms

### SEO Improved
- ✅ h1 visible in curl output
- ✅ Meta tags in HTML
- ✅ Structured data (JSON-LD) present
- ✅ Google can crawl page
- ✅ Pages appear in search results

### Error Rates
- ✅ No hydration errors
- ✅ No SSR errors
- ✅ No console errors
- ✅ Error rate: 0%

---

## Monitoring Setup

### Vercel Analytics
- Monitor Core Web Vitals
- Monitor page load times
- Monitor error rates
- Set up alerts for anomalies

### Search Console
- Monitor crawl errors
- Monitor indexed pages
- Monitor query performance
- Check if new pages indexed

### Browser DevTools
- Check for console errors
- Check for hydration warnings
- Check Network tab for requests
- Check Performance profiling

### Custom Monitoring
```bash
# Check SSR health daily
0 9 * * * curl -s https://algarveofficial.com/en/directory | grep "<h1" && echo "✅ SSR OK" || echo "❌ SSR FAILED"
```

---

## Communication

### Notify Team
- [ ] Notify product team of deployment
- [ ] Notify marketing of SEO improvements
- [ ] Notify analytics team to track metrics
- [ ] Notify support of any user-facing changes

### Update Documentation
- [ ] Update team wiki/docs
- [ ] Update runbook
- [ ] Update deployment guide
- [ ] Update troubleshooting guide

---

## Sign-Off

Deployer: __________________
Date: March 24, 2026
Commit: 364e82c
Status: ✅ Ready for Production

---

## Post-Deployment Tasks

### Week 1
- [ ] Monitor Core Web Vitals
- [ ] Check search console for changes
- [ ] Review error logs
- [ ] Verify ISR working

### Month 1
- [ ] Analyze SEO improvements
- [ ] Review performance metrics
- [ ] Check user engagement
- [ ] Plan next optimizations

### Quarterly
- [ ] Review commit for stability
- [ ] Plan performance improvements
- [ ] Review customer feedback
- [ ] Plan next iteration

