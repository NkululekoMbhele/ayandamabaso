# 2-Hour Deployment & PVT Testing Plan
**Ayanda Mabaso - Booking Flow Simplification**

**Deadline**: 2 hours to complete setup → PVT testing starts
**Date**: 2026-02-23
**Status**: IN PROGRESS

---

## 🎯 What Changed

### Frontend Changes (PUSHED ✅)
- ✅ Booking flow simplified: Day selection only (no time slots)
- ✅ Added preferred time field to GuestInfoForm
- ✅ Added meeting type selection (virtual/in-person/both)
- ✅ Added preferred location field
- ✅ Updated all UI components
- ✅ Committed: `0479a50`
- ✅ Pushed to master

### Backend Changes (NEEDS DEPLOYMENT ⏳)
- ✅ Qualifying questions endpoint created
- ✅ Committed on feature/film-metadata-portfolio: `6036bc10`
- ⏳ Needs merge to develop
- ⏳ Needs production release

---

## 📋 Deployment Checklist

### STEP 1: Frontend Deployment (5-10 mins)

#### Build & Deploy
```bash
cd /Users/nkululekombhele/github/ayandamabaso

# Ensure .env.production exists
cp .env.example .env.production
# Update with production values:
# VITE_API_URL=https://api.ayandamabaso.co.za
# VITE_API_KEY=pk_live_tenant_41
# VITE_TENANT_ID=41

# Run deployment script
./scripts/deploy-production.sh
```

#### Manual Deployment (if script fails)
```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://ayandamabaso-production --delete \
  --region af-south-1 \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" --exclude "*.json"

aws s3 sync build/ s3://ayandamabaso-production \
  --region af-south-1 \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate"

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E2H8F5E7PSXPRH \
  --paths "/*"
```

**Verification**:
- [ ] Build completes without errors
- [ ] Files uploaded to S3
- [ ] CloudFront invalidation created
- [ ] Wait 2-3 minutes for cache clear

---

### STEP 2: Backend Deployment (20-30 mins)

⚠️ **IMPORTANT**: Backend follows release workflow, NOT direct deployment

#### Option A: Full Release Workflow (Recommended for Production)
```bash
cd /Users/nkululekombhele/github/tredicik

# 1. Merge feature branch to develop
git checkout develop
git pull origin develop
git merge feature/film-metadata-portfolio
git push origin develop

# 2. Create release branch
git checkout -b release/v1.18.0

# 3. Update version in 8 files (see release-workflow.md)
# - tredicikapi/__init__.py
# - tredicikweb/package.json
# - tredicikweb/Dockerfile
# - docker-compose.prod.yml
# - CHANGELOG.md
# - sidebar.svelte, footer.svelte
# - releases/v1.18.0.md

# 4. Commit and push release
git add -A
git commit -m "chore(release): bump version to v1.18.0 - add qualifying questions"
git push origin release/v1.18.0

# 5. Create PR: release/v1.18.0 → master
# 6. After approval, merge to master
# 7. SSH to production and deploy
```

#### Option B: Hot-patch Deployment (Quick, for urgent fixes only)
```bash
# SSH to production server
ssh tredicik-hub-prod  # or ssh ubuntu@13.247.62.100

# Navigate to project
cd /home/ubuntu/tredicik

# Pull latest changes
git fetch origin
git checkout develop
git pull origin develop

# Rebuild and restart containers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f tredicik-backend
```

**Verification**:
- [ ] Backend restarts successfully
- [ ] No errors in logs
- [ ] Health check passes: `curl https://api.ayandamabaso.co.za/health`
- [ ] Test endpoint: `curl https://api.ayandamabaso.co.za/api/external/v1/orders/1/qualifying-questions`

---

### STEP 3: Database Setup (5 mins)

⚠️ **CRITICAL**: Database offerings must be updated

```bash
# SSH to production server
ssh tredicik-hub-prod

# Connect to production database
# Option 1: Through docker
docker exec -it tredicik-postgres psql -U postgres -d tredicik_hub

# Option 2: Direct RDS connection
psql -h [RDS_ENDPOINT] -U tredicik_admin -d tredicik_hub
```

**SQL to Run**:
```sql
-- Deactivate old free consultation
UPDATE offerings
SET is_active = false, is_public = false
WHERE tenant_id = 41 AND base_price = 0 AND offering_type = 'service';

-- Verify current offerings
SELECT id, name, base_price, offering_type, is_active, is_public
FROM offerings
WHERE tenant_id = 41 AND offering_type = 'service';

-- Create new consultation offerings
INSERT INTO offerings (
  tenant_id, name, slug, description, offering_type, pricing_model,
  base_price, currency, duration_minutes, requires_booking,
  capacity_per_slot, features, offering_metadata,
  is_active, is_public, created_at, updated_at
) VALUES
-- 1 Hour Consultation
(41, '1 Hour Consultation', '1-hour-consultation',
 'Focused one-on-one consultation session', 'service', 'FIXED',
 2500.00, 'ZAR', 60, true, 1,
 '["One-on-one session", "Strategic guidance", "Actionable insights", "Post-session summary"]'::jsonb,
 '{"package_type": "standard", "buffer_minutes": 15}'::jsonb,
 true, true, NOW(), NOW()),

-- 2 Hours Deep Dive
(41, '2 Hours Deep Dive', '2-hour-deep-dive',
 'In-depth consultation for comprehensive strategies', 'service', 'FIXED',
 4000.00, 'ZAR', 120, true, 1,
 '["Extended session", "Deep strategy", "Business audit", "Action plan", "Follow-up support"]'::jsonb,
 '{"package_type": "strategy", "buffer_minutes": 15, "popular": true}'::jsonb,
 true, true, NOW(), NOW()),

-- Live Group Session
(41, 'Live Group Session Teaching', 'live-group-session',
 'Interactive 2-hour group training session', 'service', 'FIXED',
 15000.00, 'ZAR', 120, true, 10,
 '["2-hour interactive training", "5-10 participants", "Perfect for corporate teams", "Social media strategy", "Marketing best practices", "Q&A session", "Course materials included"]'::jsonb,
 '{"package_type": "group", "buffer_minutes": 30, "min_participants": 5, "max_participants": 10}'::jsonb,
 true, true, NOW(), NOW());

-- Verify new offerings created
SELECT id, name, base_price, offering_metadata->>'package_type' as package_type
FROM offerings
WHERE tenant_id = 41 AND is_active = true
ORDER BY base_price;
```

**Verification**:
- [ ] Old free consultation deactivated
- [ ] 3 new offerings created
- [ ] package_type metadata correct
- [ ] Pricing correct (R2,500, R4,000, R15,000)

---

### STEP 4: PayFast Configuration (5 mins)

#### Verify PayFast Settings

**Environment Variables (Backend)**:
```bash
# On production server
ssh tredicik-hub-prod
cd /home/ubuntu/tredicik

# Check .env.production file
cat .env.production | grep PAYFAST
```

**Expected Values**:
```
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_SANDBOX=false  # MUST be false for production
PAYFAST_RETURN_URL=https://ayandamabaso.co.za/checkout/success
PAYFAST_CANCEL_URL=https://ayandamabaso.co.za/checkout/cancelled
PAYFAST_NOTIFY_URL=https://api.ayandamabaso.co.za/api/external/v1/payments/payfast/notify
```

**Test PayFast Integration**:
```bash
# Test order creation
curl -X POST https://api.ayandamabaso.co.za/api/external/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_live_tenant_41" \
  -d '{
    "items": [{"offering_id": [NEW_OFFERING_ID], "quantity": 1}],
    "customer": {"email": "test@example.com", "name": "Test User"}
  }'
```

**Verification**:
- [ ] PayFast credentials correct
- [ ] Sandbox mode disabled
- [ ] Return/Cancel URLs point to production domain
- [ ] Notify URL accessible from PayFast servers

---

### STEP 5: Email Configuration (Optional - 10 mins)

⚠️ **Note**: Qualifying questions endpoint doesn't send emails yet. If needed:

**Backend Email Service**:
```python
# tredicikapi/src/services/template_email_service.py
# Add method to send qualifying questions email
```

**Configuration**:
- SMTP settings in .env.production
- Email templates in backend

**Skip for now** - Can add post-PVT if client requests it.

---

## 🧪 PVT (Private Verification Testing) Checklist

### Pre-PVT Verification (Before Client Tests)

#### 1. Homepage Verification
```bash
# Check if new packages showing
curl -s https://ayandamabaso.co.za | grep -o "1 Hour Consultation\|2 Hours Deep Dive\|Live Group Session"
```

- [ ] Homepage loads
- [ ] New packages visible (1Hr, 2Hrs, Group)
- [ ] "R10M+ Revenue Generated" stat shows
- [ ] Hero message updated

#### 2. Booking Flow Test
- [ ] Navigate to /booking
- [ ] Packages load from API
- [ ] Select package → redirects to date selection
- [ ] Date picker shows (no time slots)
- [ ] Select date → proceed to guest info
- [ ] Guest info form shows new fields:
  - [ ] Preferred time (optional)
  - [ ] Meeting type (virtual/in-person/both)
  - [ ] Preferred location (optional, conditional)
- [ ] Fill form and add to cart
- [ ] Cart persists after refresh

#### 3. Checkout & Payment Test
- [ ] Checkout page loads
- [ ] Customer details pre-filled (if logged in)
- [ ] Click "Proceed to Payment"
- [ ] Redirects to PayFast
- [ ] **Use test card** (DO NOT charge real card):
  - Card Number: 4000 0000 0000 0002
  - Expiry: 12/25
  - CVV: 123
- [ ] Complete payment
- [ ] Redirects to success page

#### 4. Qualifying Questions Test
- [ ] Success page shows qualifying questions form
- [ ] Form has 4 required fields:
  - [ ] What are you hoping to achieve?
  - [ ] Who is your target audience?
  - [ ] What is the nature of your business?
  - [ ] What challenges are you facing?
- [ ] Try submitting empty → validation works
- [ ] Fill all fields and submit
- [ ] Success message appears
- [ ] Can proceed to view orders

#### 5. Backend Verification
```bash
# SSH to production
ssh tredicik-hub-prod

# Check order in database
docker exec -it tredicik-postgres psql -U postgres -d tredicik_hub -c \
  "SELECT order_number, extra_data FROM external_orders WHERE tenant_id = 41 ORDER BY created_at DESC LIMIT 1;"

# Verify qualifying_questions stored in extra_data
```

- [ ] Order created successfully
- [ ] Qualifying questions stored in `extra_data` JSON field
- [ ] All 4 responses captured
- [ ] Timestamp recorded

#### 6. Email Verification (if configured)
- [ ] Customer receives order confirmation email
- [ ] Admin/Ayanda receives qualifying questions email
- [ ] Booking confirmation scheduled for next 24 hours

---

## 🚨 Rollback Plan (If Issues Occur)

### Frontend Rollback
```bash
cd /Users/nkululekombhele/github/ayandamabaso

# Revert to previous commit
git log --oneline -5
git revert 0479a50  # Booking changes
git revert a426803  # Package changes
git push origin master

# Redeploy
./scripts/deploy-production.sh
```

### Backend Rollback
```bash
ssh tredicik-hub-prod
cd /home/ubuntu/tredicik

# Checkout previous version
git checkout master
git pull origin master

# Restart containers
docker-compose -f docker-compose.prod.yml restart
```

### Database Rollback
```sql
-- Reactivate old free consultation
UPDATE offerings SET is_active = true, is_public = true
WHERE tenant_id = 41 AND name = 'Discovery Call';

-- Deactivate new consultations
UPDATE offerings SET is_active = false, is_public = false
WHERE tenant_id = 41 AND base_price IN (2500, 4000, 15000);
```

---

## 📊 Timeline Estimate

| Task | Time | Status |
|------|------|--------|
| Frontend deployment | 10 mins | ⏳ Pending |
| Backend deployment | 30 mins | ⏳ Pending |
| Database setup | 5 mins | ⏳ Pending |
| PayFast verification | 5 mins | ⏳ Pending |
| Pre-PVT testing | 20 mins | ⏳ Pending |
| **TOTAL** | **70 mins** | **Within 2-hour deadline** |
| Buffer for issues | 50 mins | Available |

---

## ✅ Go-Live Criteria

Before declaring PVT-ready:

- [ ] Frontend shows new packages
- [ ] Booking flow works end-to-end
- [ ] Date selection works (no time required)
- [ ] Guest info captures preferred time & location
- [ ] Cart persists
- [ ] Checkout creates order
- [ ] PayFast payment processes
- [ ] Qualifying questions form appears
- [ ] Form submission works
- [ ] Data stored in database
- [ ] No JavaScript errors in console
- [ ] No API errors in logs

---

## 📞 Support Contacts

**Technical Issues**:
- Backend: Tredicik API logs on EC2
- Frontend: Browser console + CloudFront logs
- Database: RDS query logs

**Client Contact**:
- Ayanda Mabaso: [contact info]
- Testing window: Next 2 hours
- PVT starts: After deployment complete

---

## 🎉 Post-PVT

After successful PVT:

1. **Monitor for 24 hours**:
   - Check error logs
   - Monitor API performance
   - Watch for customer complaints

2. **Document any issues**:
   - Create tickets for bugs
   - Note feature requests
   - Log performance issues

3. **Communicate with client**:
   - Confirm PVT results
   - Discuss any changes needed
   - Plan follow-up improvements

---

**Last Updated**: 2026-02-23
**Prepared By**: Claude Sonnet 4.5
**Review Required**: YES - Before deployment
