# Ayanda Mabaso - Backend Data Provisioning

## Overview

This document outlines the data that needs to be provisioned in the Tredicik backend for the Ayanda Mabaso production deployment (tenant_id=41).

---

## Database Requirements

### 1. Tenant Configuration (Already Exists)

**Table**: `tenants`

```sql
-- Verify tenant exists
SELECT id, name, domain, type, is_active, subscription_plan
FROM tenants
WHERE id = 41;

-- Expected result:
-- id: 41
-- name: Ayanda Mabaso
-- domain: ayandamabaso.co.za
-- type: EMBEDDED
-- is_active: true
-- subscription_plan: white_label
```

### 2. Portal Configuration (Critical for API Access)

**Table**: `portal_configs`

```sql
-- Check portal config
SELECT tenant_id, api_key, cors_origins, rate_limit_per_minute
FROM portal_configs
WHERE tenant_id = 41;

-- Required configuration:
{
  "tenant_id": 41,
  "api_key": "pk_live_tenant_41",  -- Production API key
  "cors_origins": [
    "https://ayandamabaso.co.za",
    "https://www.ayandamabaso.co.za",
    "http://localhost:5176"  -- Dev only
  ],
  "rate_limit_per_minute": 60,
  "is_active": true
}
```

**If portal_config doesn't exist, create it:**

```sql
-- Create production portal config
INSERT INTO portal_configs (
  tenant_id,
  api_key,
  cors_origins,
  rate_limit_per_minute,
  is_active,
  created_at,
  updated_at
) VALUES (
  41,
  'pk_live_tenant_41',
  '["https://ayandamabaso.co.za", "https://www.ayandamabaso.co.za", "http://localhost:5176"]'::jsonb,
  60,
  true,
  NOW(),
  NOW()
);
```

### 3. Backend CORS Configuration

**File**: `tredicikapi/src/main.py`

```python
# Add to CORS_ORIGINS list
CORS_ORIGINS = [
    # ... existing origins
    "https://ayandamabaso.co.za",
    "https://www.ayandamabaso.co.za",
    "http://localhost:5176",  # Dev
]
```

**After updating, restart backend:**
```bash
ssh tredicik-hub-prod "cd /home/ubuntu/tredicik && docker restart tredicik-backend-prod"
```

---

## Production Data to Provision

### 1. Products (E-commerce Store)

**Table**: `products`

Ayanda Mabaso is a fashion & style consultancy. Sample products:

```sql
-- Example: Fashion consultation package
INSERT INTO products (
  tenant_id,
  name,
  description,
  price,
  category,
  is_active,
  stock_quantity,
  images,
  created_at,
  updated_at
) VALUES (
  41,
  'Personal Style Consultation',
  'One-on-one 90-minute style consultation session',
  1500.00,
  'consultation',
  true,
  100,
  '["https://example.com/image1.jpg"]'::jsonb,
  NOW(),
  NOW()
);

-- Example: Wardrobe styling service
INSERT INTO products (
  tenant_id,
  name,
  description,
  price,
  category,
  is_active,
  stock_quantity,
  images,
  created_at,
  updated_at
) VALUES (
  41,
  'Complete Wardrobe Makeover',
  'Full wardrobe audit and styling session',
  3500.00,
  'consultation',
  true,
  50,
  '["https://example.com/image2.jpg"]'::jsonb,
  NOW(),
  NOW()
);
```

**Categories for Ayanda Mabaso:**
- `consultation` - Style consultations
- `fashion` - Fashion items/accessories
- `course` - Online courses/workshops

### 2. Business Hours (For Booking System)

**Table**: `tenant_configs`

```sql
-- Set business hours
INSERT INTO tenant_configs (
  tenant_id,
  config_key,
  config_value,
  created_at,
  updated_at
) VALUES (
  41,
  'business_hours',
  '{
    "monday": {"open": "09:00", "close": "17:00"},
    "tuesday": {"open": "09:00", "close": "17:00"},
    "wednesday": {"open": "09:00", "close": "17:00"},
    "thursday": {"open": "09:00", "close": "17:00"},
    "friday": {"open": "09:00", "close": "17:00"},
    "saturday": {"open": "09:00", "close": "14:00"},
    "sunday": {"closed": true}
  }'::jsonb,
  NOW(),
  NOW()
);

-- Set booking rules
INSERT INTO tenant_configs (
  tenant_id,
  config_key,
  config_value,
  created_at,
  updated_at
) VALUES (
  41,
  'booking_rules',
  '{
    "advance_booking_days": 30,
    "min_advance_hours": 24,
    "max_advance_days": 90,
    "slot_duration_minutes": 90,
    "buffer_minutes": 15
  }'::jsonb,
  NOW(),
  NOW()
);
```

### 3. Payment Configuration (PayFast)

**Table**: `tenant_configs`

```sql
-- PayFast configuration for production
INSERT INTO tenant_configs (
  tenant_id,
  config_key,
  config_value,
  created_at,
  updated_at
) VALUES (
  41,
  'payment_gateway',
  '{
    "provider": "payfast",
    "merchant_id": "MERCHANT_ID_HERE",
    "merchant_key": "MERCHANT_KEY_HERE",
    "passphrase": "PASSPHRASE_HERE",
    "sandbox": false
  }'::jsonb,
  NOW(),
  NOW()
);
```

**⚠️ NOTE**: Real PayFast credentials will be needed from Ayanda Mabaso.

### 4. Email Configuration (SES)

**Table**: `tenant_configs`

```sql
-- Email sender configuration
INSERT INTO tenant_configs (
  tenant_id,
  config_key,
  config_value,
  created_at,
  updated_at
) VALUES (
  41,
  'email_sender',
  '{
    "from_email": "noreply@ayandamabaso.co.za",
    "from_name": "Ayanda Mabaso",
    "reply_to": "support@ayandamabaso.co.za"
  }'::jsonb,
  NOW(),
  NOW()
);
```

**AWS SES Setup Required:**
1. Verify domain: `ayandamabaso.co.za`
2. Add SPF, DKIM, DMARC records
3. Move out of sandbox mode

### 5. Feature Flags

**Table**: `tenant_feature_flags`

```sql
-- Enable features for Ayanda Mabaso
INSERT INTO tenant_feature_flags (tenant_id, feature_key, is_enabled, config, created_at, updated_at)
VALUES
  (41, 'store', true, '{}'::jsonb, NOW(), NOW()),
  (41, 'booking', true, '{}'::jsonb, NOW(), NOW()),
  (41, 'blog', false, '{}'::jsonb, NOW(), NOW()),
  (41, 'newsletter', true, '{}'::jsonb, NOW(), NOW()),
  (41, 'rewards', false, '{}'::jsonb, NOW(), NOW());
```

---

## Sample Test Data (Optional - For UAT/Testing)

### Test Customer Account

```sql
-- Create test customer
INSERT INTO users (
  tenant_id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  41,
  'test@ayandamabaso.co.za',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oPOaS.zJGjhu',  -- Password: Test123!
  'Test',
  'Customer',
  'customer',
  true,
  NOW(),
  NOW()
);
```

### Test Booking

```sql
-- Create test consultation booking
INSERT INTO bookings (
  tenant_id,
  customer_id,
  service_type,
  booking_date,
  booking_time,
  duration_minutes,
  status,
  amount,
  created_at,
  updated_at
) VALUES (
  41,
  (SELECT id FROM users WHERE email = 'test@ayandamabaso.co.za' AND tenant_id = 41),
  'consultation',
  '2026-02-20',
  '10:00:00',
  90,
  'confirmed',
  1500.00,
  NOW(),
  NOW()
);
```

---

## Scripts to Run

### 1. Check Tenant Configuration

```bash
# SSH to production server
ssh tredicik-hub-prod

# Run Django/FastAPI shell or connect to database
docker exec -it tredicik-backend-prod psql -U tredicik_user -d tredicik_production -c "
SELECT
  t.id,
  t.name,
  t.domain,
  t.is_active,
  pc.api_key,
  pc.cors_origins
FROM tenants t
LEFT JOIN portal_configs pc ON t.id = pc.tenant_id
WHERE t.id = 41;
"
```

### 2. Create Production API Key (If Not Exists)

```bash
# Generate secure API key
python -c "import secrets; print('pk_live_tenant_41_' + secrets.token_urlsafe(32))"

# Update portal_configs with new key
```

### 3. Update CORS Origins

```bash
ssh tredicik-hub-prod

# Edit main.py
docker exec -it tredicik-backend-prod bash
vi /app/src/main.py

# Add CORS origins for ayandamabaso.co.za
# Restart backend
exit
docker restart tredicik-backend-prod
```

---

## Frontend Environment Configuration

### Production Environment File

**File**: `~/github/ayandamabaso/.env.production`

```bash
# API Configuration - Production Backend
VITE_API_URL=https://api.tredicik.com/api/external/v1
VITE_API_KEY=pk_live_tenant_41_XXXXX  # Get from backend team
VITE_TENANT_ID=41

# Environment Identifier
NODE_ENV=production
VITE_ENV=production

# PayFast - Live Mode
VITE_PAYFAST_SANDBOX=false
VITE_PAYFAST_MERCHANT_ID=MERCHANT_ID_HERE
```

**⚠️ CRITICAL**: Replace `pk_live_tenant_41_XXXXX` with actual production API key from backend.

---

## Deployment Checklist

### Backend Provisioning
- [ ] Verify tenant_id=41 exists in `tenants` table
- [ ] Create/update `portal_configs` with production API key
- [ ] Add CORS origins to `main.py` and restart backend
- [ ] Create sample products (consultation packages)
- [ ] Configure business hours and booking rules
- [ ] Set up PayFast payment configuration
- [ ] Configure email sender (SES)
- [ ] Enable feature flags (store, booking, newsletter)
- [ ] (Optional) Create test customer account

### Frontend Configuration
- [ ] Update `.env.production` with production API key
- [ ] Verify `src/lib/config.ts` has correct tenant_id (41)
- [ ] Test local build: `npm run build && npm run preview`

### AWS Infrastructure
- [ ] S3 bucket created: `ayandamabaso-production`
- [ ] SSL certificate validated
- [ ] CloudFront distribution created
- [ ] DNS records configured

### Domain Setup
- [ ] Nameservers updated at registrar
- [ ] SSL certificate validated (ISSUED status)
- [ ] DNS A records pointing to CloudFront
- [ ] Test website loads at https://ayandamabaso.co.za

### PayFast Setup (External)
- [ ] Get PayFast merchant credentials from Ayanda Mabaso
- [ ] Configure PayFast return URLs
- [ ] Test payment in sandbox first
- [ ] Switch to live mode

### AWS SES Email Setup
- [ ] Verify domain `ayandamabaso.co.za` in SES
- [ ] Add SPF record to DNS
- [ ] Add DKIM records to DNS
- [ ] Add DMARC record to DNS
- [ ] Request production access (move out of sandbox)
- [ ] Test email sending

---

## Testing After Provisioning

### 1. Test API Connectivity
```bash
curl -X POST "https://api.tredicik.com/api/external/v1/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_live_tenant_41_XXXXX" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. Test CORS
```bash
curl -I -X OPTIONS "https://api.tredicik.com/api/external/v1/auth/login" \
  -H "Origin: https://ayandamabaso.co.za" \
  -H "Access-Control-Request-Method: POST"
```

### 3. Test Products API
```bash
curl "https://api.tredicik.com/api/external/v1/products" \
  -H "X-API-Key: pk_live_tenant_41_XXXXX"
```

### 4. Test Booking API
```bash
curl "https://api.tredicik.com/api/external/v1/bookings/availability?date=2026-02-20" \
  -H "X-API-Key: pk_live_tenant_41_XXXXX"
```

---

## Support & Documentation

- **Multi-Tenant Architecture**: See `~/github/tredicik/context/architecture/multi-tenant-architecture.md`
- **Portal SDK Integration**: See `~/github/tredicik/context/features/portal-sdk-client-onboarding.md`
- **Backend Patterns**: See `~/github/tredicik/context/core/backend-code-review.md`

---

**Next Steps**: Once DNS is configured and SSL is validated, proceed with data provisioning and deployment.
