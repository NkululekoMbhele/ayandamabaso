# Ayanda Mabaso - Production Readiness Checklist

Use this checklist to verify the website is ready for production deployment.

## Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved (`npm run check` passes)
- [ ] No console.log statements in production code (except intentional logging)
- [ ] No hardcoded development URLs
- [ ] All TODO/FIXME comments addressed
- [ ] Code reviewed by team member

### Build Verification
- [ ] `npm run build` completes without errors
- [ ] Build output size is reasonable (< 5MB for _app folder)
- [ ] All routes generate HTML files
- [ ] Static assets included (images, icons, fonts)

### Environment Configuration
- [ ] Production API URL configured: `https://api.tredicik.com/api/external/v1`
- [ ] Production API key configured: `pk_live_tenant_41`
- [ ] Environment variables NOT exposed in client code
- [ ] Correct tenant ID (41) in config

---

## Functionality Testing

### Critical User Flows

#### E-Commerce Flow
- [ ] Products display on store page
- [ ] Product detail page works
- [ ] Add to cart works
- [ ] Cart persists after page refresh
- [ ] Cart quantity update works
- [ ] Cart item removal works
- [ ] Promo code application works
- [ ] Checkout form validates
- [ ] Order creation succeeds
- [ ] PayFast redirect works
- [ ] Success page displays after payment
- [ ] Cancelled page displays after cancellation

#### Booking Flow
- [ ] Packages load from API
- [ ] Date selection works
- [ ] Time slots load for selected date
- [ ] Available slots are selectable
- [ ] Booking form validates
- [ ] Booking creation succeeds
- [ ] Confirmation displays

#### Authentication Flow
- [ ] Login modal opens
- [ ] Login with valid credentials works
- [ ] Registration works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] User data persists after refresh

### Page Verification

| Page | URL | Status |
|------|-----|--------|
| Home | / | [ ] |
| Store | /store | [ ] |
| Product Detail | /store/[id] | [ ] |
| Cart | /cart | [ ] |
| Checkout | /checkout | [ ] |
| Checkout Success | /checkout/success | [ ] |
| Checkout Cancelled | /checkout/cancelled | [ ] |
| Booking | /booking | [ ] |
| Dashboard | /dashboard | [ ] |
| Dashboard Orders | /dashboard/orders | [ ] |
| About | /about | [ ] |
| Contact | /contact | [ ] |
| Speaking | /speaking | [ ] |
| Services | /services | [ ] |

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile (iOS/Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet (Android)

### Responsive Design
- [ ] Mobile (375px - iPhone SE)
- [ ] Tablet (768px - iPad)
- [ ] Desktop (1024px+)
- [ ] Large Desktop (1440px+)

---

## Performance

### Load Times (Target: < 3s)
- [ ] Home page: ___s
- [ ] Store page: ___s
- [ ] Checkout page: ___s
- [ ] Booking page: ___s

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### Asset Optimization
- [ ] Images optimized (WebP where possible)
- [ ] CSS/JS minified
- [ ] Fonts subset (only needed characters)
- [ ] Gzip compression enabled (CloudFront)

---

## Security

### Data Protection
- [ ] HTTPS enforced (CloudFront redirect)
- [ ] Secure cookies (HttpOnly, Secure, SameSite)
- [ ] No sensitive data in localStorage (except tokens)
- [ ] Input sanitization (XSS prevention)
- [ ] CORS properly configured

### API Security
- [ ] API key not exposed in source
- [ ] Authentication tokens properly handled
- [ ] Session IDs regenerated on login
- [ ] Rate limiting in place (backend)

### Content Security
- [ ] No inline scripts (CSP ready)
- [ ] External resources from trusted sources
- [ ] Form action URLs validated

---

## SEO & Accessibility

### SEO
- [ ] Page titles unique and descriptive
- [ ] Meta descriptions on all pages
- [ ] Open Graph tags for social sharing
- [ ] Canonical URLs set
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Structured data (JSON-LD) for products

### Accessibility (WCAG 2.1 AA)
- [ ] All images have alt text
- [ ] Form labels properly associated
- [ ] Color contrast meets standards (4.5:1)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Skip links present
- [ ] ARIA labels where needed
- [ ] Screen reader tested

---

## Infrastructure

### AWS S3
- [ ] Bucket created in af-south-1
- [ ] Public access configured
- [ ] Static website hosting enabled
- [ ] Index/error documents set

### CloudFront
- [ ] Distribution created
- [ ] SSL certificate attached
- [ ] Custom domain configured (if applicable)
- [ ] Error pages configured (404 → /index.html)
- [ ] Cache behaviors set
- [ ] HTTPS redirect enabled

### DNS (if custom domain)
- [ ] A/AAAA records point to CloudFront
- [ ] WWW redirect configured
- [ ] SSL certificate covers all domains
- [ ] DNS propagation complete

---

## Backend Integration

### API Endpoints
- [ ] `/offerings` - Products load
- [ ] `/cart` - Cart operations work
- [ ] `/orders` - Order creation works
- [ ] `/checkout/orders/{id}/initialize` - Payment init works
- [ ] `/bookings/packages` - Packages load
- [ ] `/bookings/availability` - Slots load
- [ ] `/bookings` - Booking creation works
- [ ] `/auth/login` - Login works
- [ ] `/auth/register` - Registration works

### CORS Configuration
- [ ] Production domain in ALLOWED_ORIGINS
- [ ] X-Session-Id in allowed headers
- [ ] Authorization in allowed headers
- [ ] Content-Type in allowed headers

### Payment Integration
- [ ] PayFast credentials are production
- [ ] Return URLs point to production domain
- [ ] Cancel URLs point to production domain
- [ ] ITN (callback) URL configured

---

## Monitoring & Logging

### Error Tracking
- [ ] Error tracking service configured (Sentry, etc.)
- [ ] Unhandled errors captured
- [ ] Error alerts set up

### Analytics
- [ ] Google Analytics / Plausible configured
- [ ] E-commerce tracking enabled
- [ ] Conversion goals set up
- [ ] Privacy policy updated for tracking

### Uptime Monitoring
- [ ] Uptime monitor configured
- [ ] Alert contacts set
- [ ] Response time thresholds set

---

## Documentation

### Technical Docs
- [ ] README.md up to date
- [ ] DEPLOYMENT.md created
- [ ] TESTING.md created
- [ ] API documentation available
- [ ] Environment setup documented

### User Docs
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] FAQ/Help section
- [ ] Contact information accurate

---

## Final Verification

### Smoke Test
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can complete checkout (test transaction)
- [ ] Can create booking
- [ ] Can login/register
- [ ] Can view order history (when logged in)

### Sign-Off
- [ ] Developer sign-off: _________________ Date: _______
- [ ] QA sign-off: _________________ Date: _______
- [ ] Business owner sign-off: _________________ Date: _______

---

## Post-Deployment

### Immediate (Within 1 hour)
- [ ] Verify all critical flows work
- [ ] Check for console errors
- [ ] Monitor error tracking dashboard
- [ ] Test on mobile device
- [ ] Confirm email notifications working

### 24-Hour Check
- [ ] Review error logs
- [ ] Check analytics data flowing
- [ ] Monitor server performance
- [ ] Review customer feedback channels

### 1-Week Review
- [ ] Analyze performance metrics
- [ ] Review conversion rates
- [ ] Address any reported issues
- [ ] Plan optimization improvements
