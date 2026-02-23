# Ayanda Mabaso - Deployment & Debugging Guide

Complete guide for deploying the Ayanda Mabaso website to AWS S3/CloudFront and debugging production issues.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development](#local-development)
3. [Build Process](#build-process)
4. [AWS S3 Deployment](#aws-s3-deployment)
5. [CloudFront Configuration](#cloudfront-configuration)
6. [Iterative Debugging Process](#iterative-debugging-process)
7. [Common Deployment Issues](#common-deployment-issues)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Alerts](#monitoring--alerts)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                          │
│                   (d1s5gxldjthzj1.cloudfront.net)               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          S3 Bucket                              │
│              (ayandamabaso-site-af-south-1)                     │
│                    Region: af-south-1                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                        │
│              (api-uat.tredicik.com / api.tredicik.com)          │
│                    Tenant ID: 41                                │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | SvelteKit 5 + Svelte 5 | Static site with client-side routing |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Components | shadcn-svelte | Pre-built UI components |
| Hosting | AWS S3 | Static file storage |
| CDN | AWS CloudFront | Global content delivery |
| Backend | FastAPI | REST API (multi-tenant) |
| Payments | PayFast | Payment processing |

---

## Local Development

### Starting Development Server

```bash
# Install dependencies (first time or after package changes)
npm install

# Start development server
npm run dev

# Server runs at http://localhost:5176
```

### Environment Configuration

Create `.env.local` for local development:

```env
VITE_API_URL=http://localhost:8080/api/external/v1
VITE_API_KEY=pk_test_tenant_41
```

### Testing Against UAT Backend

```env
VITE_API_URL=https://api-uat.tredicik.com/api/external/v1
VITE_API_KEY=pk_test_tenant_41
```

---

## Build Process

### Standard Build

```bash
# Build for production
npm run build

# Output directory: ./build/
```

### Build Verification

```bash
# Preview production build locally
npm run preview

# Verify build output
ls -la build/

# Expected structure:
# build/
# ├── _app/
# │   ├── immutable/
# │   │   ├── assets/
# │   │   ├── chunks/
# │   │   ├── entry/
# │   │   └── nodes/
# │   └── env.js
# ├── favicon.ico
# ├── favicon-16.png
# ├── favicon-32.png
# ├── apple-touch-icon.png
# ├── payfast.svg
# ├── index.html
# ├── store.html
# ├── booking.html
# ├── cart.html
# ├── checkout.html
# ├── about.html
# ├── contact.html
# └── ... (other pages)
```

### Pre-Build Checks

```bash
# Type check
npm run check

# Fix any TypeScript errors before building
```

---

## AWS S3 Deployment

### Prerequisites

```bash
# Install AWS CLI
brew install awscli  # macOS

# Configure AWS credentials
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: af-south-1
```

### Deployment Commands

```bash
# Build the application
npm run build

# Sync to S3 bucket
aws s3 sync build/ s3://ayandamabaso-site-af-south-1 --delete

# Verify deployment
aws s3 ls s3://ayandamabaso-site-af-south-1/
```

### S3 Bucket Configuration

The bucket should have:

1. **Static Website Hosting**: Enabled
   - Index document: `index.html`
   - Error document: `index.html` (for SPA routing)

2. **Public Access**: Configured via bucket policy
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::ayandamabaso-site-af-south-1/*"
       }
     ]
   }
   ```

3. **CORS Configuration** (if needed):
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

---

## CloudFront Configuration

### Cache Invalidation

After every deployment, invalidate the CloudFront cache:

```bash
# Create invalidation for all files
aws cloudfront create-invalidation \
  --distribution-id E2XXXXXXXXXXXXX \
  --paths "/*"

# Invalidate specific files
aws cloudfront create-invalidation \
  --distribution-id E2XXXXXXXXXXXXX \
  --paths "/index.html" "/checkout.html" "/_app/*"

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id E2XXXXXXXXXXXXX \
  --id IXXXXXXXXXXXX
```

### CloudFront Settings

| Setting | Value |
|---------|-------|
| Origin | S3 bucket (ayandamabaso-site-af-south-1) |
| Origin Path | (empty) |
| Viewer Protocol Policy | Redirect HTTP to HTTPS |
| Allowed HTTP Methods | GET, HEAD, OPTIONS |
| Cache Policy | CachingOptimized |
| Error Pages | 404 → /index.html (200) |

### Custom Error Responses

For SPA routing, configure custom error responses:

| HTTP Error Code | Response Page | HTTP Response Code |
|-----------------|---------------|-------------------|
| 403 | /index.html | 200 |
| 404 | /index.html | 200 |

---

## Iterative Debugging Process

### Step-by-Step Debug Workflow

```
┌────────────────────────────────────────────────────────────────┐
│  1. IDENTIFY ISSUE                                             │
│     - Check browser console for errors                         │
│     - Check Network tab for failed requests                    │
│     - Note exact error messages                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  2. REPRODUCE LOCALLY                                          │
│     - Run `npm run dev`                                        │
│     - Try to reproduce the issue                               │
│     - Check if issue is frontend or backend                    │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  3. IMPLEMENT FIX                                              │
│     - Make code changes                                        │
│     - Test locally                                             │
│     - Run type check: `npm run check`                          │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  4. BUILD & DEPLOY                                             │
│     - `npm run build`                                          │
│     - `aws s3 sync build/ s3://bucket-name --delete`           │
│     - `aws cloudfront create-invalidation ...`                 │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  5. VERIFY FIX                                                 │
│     - Wait for invalidation to complete (~2-5 minutes)         │
│     - Hard refresh browser (Cmd+Shift+R)                       │
│     - Clear localStorage if needed                             │
│     - Test the specific functionality                          │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  6. DOCUMENT & COMMIT                                          │
│     - If fixed, commit changes                                 │
│     - If not fixed, return to step 1                           │
└────────────────────────────────────────────────────────────────┘
```

### Quick Debug Commands

```bash
# Full deploy cycle (build + sync + invalidate)
npm run build && \
aws s3 sync build/ s3://ayandamabaso-site-af-south-1 --delete && \
aws cloudfront create-invalidation --distribution-id E2XXXXXXXXXXXXX --paths "/*"

# Check what's in S3
aws s3 ls s3://ayandamabaso-site-af-south-1/ --recursive | head -20

# Download a file to verify content
aws s3 cp s3://ayandamabaso-site-af-south-1/index.html - | head -50
```

### Browser Debugging

```javascript
// Check session ID (cart persistence)
console.log('Session ID:', localStorage.getItem('ayanda_cart_session'));

// Check auth token
console.log('Auth Token:', localStorage.getItem('ayanda_token'));

// Check cart state
console.log('Cart Storage:', localStorage.getItem('ayanda_cart'));

// Clear all storage (reset state)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Network Tab Analysis

Check these headers on API requests:

| Header | Expected Value |
|--------|----------------|
| X-API-Key | pk_test_tenant_41 (UAT) or pk_live_tenant_41 (Prod) |
| X-Session-Id | sess_xxx... (for cart operations) |
| Authorization | Bearer xxx... (when logged in) |
| Content-Type | application/json (for POST/PUT) |

### Common Console Errors

| Error | Cause | Solution |
|-------|-------|----------|
| CORS error | Backend not allowing origin | Add CloudFront URL to ALLOWED_ORIGINS |
| 401 Unauthorized | Invalid API key | Check VITE_API_KEY env var |
| 400 Bad Request | Missing session/data | Check X-Session-Id header |
| 404 Not Found | Wrong API URL | Check VITE_API_URL env var |
| Network Error | CORS or connectivity | Check backend CORS config |

---

## Common Deployment Issues

### Issue: Old Code Still Showing

**Symptoms:** Changes not visible after deployment

**Solution:**
1. Verify build completed: `ls -la build/`
2. Verify S3 upload: `aws s3 ls s3://bucket-name/`
3. Create CloudFront invalidation
4. Hard refresh browser: `Cmd+Shift+R`
5. Try incognito/private window

### Issue: Page Returns 404

**Symptoms:** Direct URL navigation returns 404

**Solution:**
1. Configure CloudFront error responses (404 → /index.html, 200)
2. Ensure all HTML files were uploaded
3. Check S3 bucket policy allows public read

### Issue: Assets Not Loading

**Symptoms:** CSS/JS files return 404

**Solution:**
1. Check `_app/` directory was uploaded
2. Verify file paths in HTML use correct base path
3. Check CloudFront origin settings

### Issue: API Calls Fail

**Symptoms:** Network errors on API requests

**Solution:**
1. Verify environment variables are baked into build
2. Check browser console for CORS errors
3. Verify backend ALLOWED_ORIGINS includes CloudFront URL
4. Check API key is correct for environment

### Issue: Cart Not Persisting

**Symptoms:** Cart empties on refresh

**Solution:**
1. Check localStorage for `ayanda_cart_session`
2. Verify X-Session-Id header on cart API calls
3. Check backend accepts X-Session-Id header (CORS)
4. Verify cart store logic loads from storage

---

## Rollback Procedures

### Quick Rollback

```bash
# If you have a previous build saved
aws s3 sync backup-build/ s3://ayandamabaso-site-af-south-1 --delete
aws cloudfront create-invalidation --distribution-id E2XXXXXXXXXXXXX --paths "/*"
```

### Git-Based Rollback

```bash
# Find previous working commit
git log --oneline -10

# Checkout previous commit
git checkout <commit-hash>

# Rebuild and deploy
npm install
npm run build
aws s3 sync build/ s3://ayandamabaso-site-af-south-1 --delete
aws cloudfront create-invalidation --distribution-id E2XXXXXXXXXXXXX --paths "/*"

# Return to main branch
git checkout main
```

### Backup Before Deploy

```bash
# Create backup of current production
mkdir -p backups/$(date +%Y%m%d)
aws s3 sync s3://ayandamabaso-site-af-south-1 backups/$(date +%Y%m%d)/

# Then deploy new version
aws s3 sync build/ s3://ayandamabaso-site-af-south-1 --delete
```

---

## Monitoring & Alerts

### CloudFront Metrics

Monitor in AWS Console:
- Requests
- Bytes Downloaded
- Error Rate (4xx, 5xx)
- Cache Hit Rate

### S3 Metrics

Monitor:
- Number of Objects
- Bucket Size
- Request Metrics (if enabled)

### Browser-Based Monitoring

```javascript
// Add to app for error tracking
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Error:', msg, url, lineNo);
  // Send to logging service
  return false;
};

// Performance monitoring
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
});
```

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

SITE_URL="https://d1s5gxldjthzj1.cloudfront.net"

echo "Checking site health..."

# Check main page
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SITE_URL)
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✓ Main page: OK ($HTTP_STATUS)"
else
  echo "✗ Main page: FAIL ($HTTP_STATUS)"
fi

# Check store page
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SITE_URL/store)
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✓ Store page: OK ($HTTP_STATUS)"
else
  echo "✗ Store page: FAIL ($HTTP_STATUS)"
fi

# Check checkout page
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SITE_URL/checkout)
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✓ Checkout page: OK ($HTTP_STATUS)"
else
  echo "✗ Checkout page: FAIL ($HTTP_STATUS)"
fi

echo "Health check complete."
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Type check passes: `npm run check`
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] Environment variables are correct
- [ ] Backup current production (optional but recommended)
- [ ] Create deployment during low-traffic period
- [ ] Have rollback plan ready
- [ ] Test critical flows after deployment:
  - [ ] Home page loads
  - [ ] Store products load
  - [ ] Add to cart works
  - [ ] Cart persists after refresh
  - [ ] Checkout creates order
  - [ ] PayFast redirect works
  - [ ] Booking flow works
