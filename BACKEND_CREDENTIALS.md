# Ayanda Mabaso - Backend & Payment Credentials

**Date**: February 14, 2026  
**Status**: ✅ **CONFIGURED**

---

## 🔐 Backend Authentication

### Tenant Information
| Field | Value |
|-------|-------|
| **Tenant ID** | 41 |
| **Tenant Name** | Ayanda Mabaso |
| **Status** | Active |

### API Configuration
| Field | Value |
|-------|-------|
| **API Base URL** | https://api.tredicik.com/api/external/v1 |
| **API Key** | pk_test_tenant_41 |
| **Portal Origin** | https://www.ayandamabaso.co.za |

### Environment Variables (Client Website)

```env
# .env.local or .env.production
VITE_API_URL=https://api.tredicik.com/api/external/v1
VITE_API_KEY=pk_test_tenant_41
VITE_TENANT_ID=41
```

---

## 💳 PayFast Payment Integration

### PayFast Credentials

| Field | Value | Environment |
|-------|-------|-------------|
| **Merchant ID** | 31822123 | Production |
| **Merchant Key** | 9kdy3vb59xtdw | Production |
| **Security Passphrase** | Sbani-O6mabaso\| | Production |

### PayFast URLs

| URL Type | URL |
|----------|-----|
| **Return URL** | https://www.ayandamabaso.co.za/payment-success |
| **Cancel URL** | https://www.ayandamabaso.co.za/payment-cancelled |
| **Notify URL (Webhook)** | https://api.tredicik.com/api/external/v1/payfast/webhook |

### PayFast Settings

```json
{
  "merchant_id": "31822123",
  "merchant_key": "9kdy3vb59xtdw",
  "passphrase": "Sbani-O6mabaso|",
  "is_sandbox": false,
  "is_active": true,
  "allowed_payment_types": ["SUBSCRIPTION", "ONE_TIME"],
  "processing_fee_percentage": 2.9,
  "processing_fee_fixed": 0.30,
  "min_amount": 5.00,
  "max_amount": 50000.00
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints

```bash
# Register new user
POST https://api.tredicik.com/api/external/v1/auth/register
Headers:
  Content-Type: application/json
  X-API-Key: pk_test_tenant_41
Body:
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe"
  }

# Login
POST https://api.tredicik.com/api/external/v1/auth/login
Headers:
  Content-Type: application/json
  X-API-Key: pk_test_tenant_41
Body:
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }

# Get current user
GET https://api.tredicik.com/api/external/v1/auth/me
Headers:
  Authorization: Bearer {access_token}
  X-API-Key: pk_test_tenant_41
```

### Payment Endpoints

```bash
# Create payment (example)
POST https://api.tredicik.com/api/external/v1/payments/create
Headers:
  Authorization: Bearer {access_token}
  X-API-Key: pk_test_tenant_41
  Content-Type: application/json
Body:
  {
    "amount": 100.00,
    "currency": "ZAR",
    "description": "Payment for services",
    "return_url": "https://www.ayandamabaso.co.za/payment-success",
    "cancel_url": "https://www.ayandamabaso.co.za/payment-cancelled"
  }
```

---

## 🧪 Testing

### Test Registration

```bash
curl -X POST "https://api.tredicik.com/api/external/v1/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_tenant_41" \
  -d '{
    "email": "test@ayandamabaso.co.za",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Login

```bash
curl -X POST "https://api.tredicik.com/api/external/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_tenant_41" \
  -d '{
    "email": "test@ayandamabaso.co.za",
    "password": "TestPassword123!"
  }'
```

---

## 📝 Implementation Notes

### Frontend Integration (SvelteKit)

**1. Install Portal SDK** (if using SDK):
```bash
npm install @tredicik/portal-sdk
```

**2. Configure SDK**:
```typescript
// src/lib/api.ts
import { TredicikPortal } from '@tredicik/portal-sdk';

export const sdk = new TredicikPortal({
  apiKey: 'pk_test_tenant_41',
  apiUrl: 'https://api.tredicik.com/api/external/v1',
  tenantId: 41
});
```

**3. Authentication Methods**:
```typescript
// Register
await sdk.auth.register({
  email,
  password,
  firstName,
  lastName
});

// Login
const response = await sdk.auth.login({ email, password });
const { access_token, user } = response.data;

// Get current user
const userData = await sdk.auth.getCurrentUser();
```

### Payment Integration

**1. Create PayFast Payment Form**:
```typescript
const paymentData = {
  merchant_id: '31822123',
  merchant_key: '9kdy3vb59xtdw',
  amount: '100.00',
  item_name: 'Product Name',
  return_url: 'https://www.ayandamabaso.co.za/payment-success',
  cancel_url: 'https://www.ayandamabaso.co.za/payment-cancelled',
  notify_url: 'https://api.tredicik.com/api/external/v1/payfast/webhook'
};

// Generate signature and submit to PayFast
```

**2. Handle Payment Webhook** (Backend handles this automatically at the notify_url)

**3. Handle Success/Cancel Pages** (Frontend):
- `/payment-success` - Show success message
- `/payment-cancelled` - Show cancelled message

---

## 🔒 Security Notes

1. **NEVER expose credentials in client-side code**:
   - ✅ Use environment variables (`VITE_API_KEY`)
   - ✅ PayFast credentials are stored securely in backend database
   - ❌ Do NOT hardcode merchant_id, merchant_key, or passphrase in frontend

2. **API Key Usage**:
   - API key (`pk_test_tenant_41`) is safe to use in frontend
   - It identifies the tenant but doesn't grant admin access
   - All sensitive operations require JWT tokens from authentication

3. **PayFast Integration**:
   - Payment forms are generated by backend
   - Webhook signature validation is handled by backend
   - Frontend only initiates payment flow and handles redirects

---

## ✅ Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Tenant** | ✅ Active | ID: 41 |
| **Portal Config** | ✅ Configured | API Key ready |
| **PayFast Credentials** | ✅ Configured | Production mode |
| **PayFast URLs** | ✅ Configured | Webhook ready |
| **API Endpoints** | ✅ Live | https://api.tredicik.com |

---

## 📞 Support

**Issues with authentication?**
- Check API key is correct: `pk_test_tenant_41`
- Verify API URL includes full path: `/api/external/v1`
- Check CORS is enabled for `https://www.ayandamabaso.co.za`

**Issues with payments?**
- Verify PayFast credentials in database (tenant_id=41)
- Check webhook URL is accessible: `https://api.tredicik.com/api/external/v1/payfast/webhook`
- Ensure return/cancel URLs match your domain

---

**Last Updated**: February 14, 2026  
**Configuration ID**: payfast_configurations.id = 2
