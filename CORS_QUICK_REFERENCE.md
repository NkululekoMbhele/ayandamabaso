# CORS Configuration - Quick Reference

## Status: ACTIVE AND VERIFIED ✓

---

## Key Facts

| Detail | Value |
|--------|-------|
| **API Endpoint** | https://api.tredicik.com |
| **Allowed Domains** | https://www.ayandamabaso.co.za, https://ayandamabaso.co.za |
| **Configuration File** | /home/ubuntu/tredicik/tredicikapi/src/main.py |
| **Lines Modified** | 558-559 |
| **Service Status** | Running (PID: 1108479) |
| **Last Modified** | 2026-02-25 17:17:00 UTC |

---

## HTTP Methods Allowed

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS

---

## Headers Allowed

- Authorization
- Content-Type
- X-Tenant-ID
- X-Client-ID
- X-Requested-With
- Accept
- Origin
- User-Agent
- DNT
- Cache-Control
- X-Mx-ReqToken
- X-Request-ID
- X-API-Key
- x-api-key

---

## Response Headers

```
Access-Control-Allow-Origin: https://www.ayandamabaso.co.za
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: [see above]
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## Test CORS

```bash
# Quick test
curl -i -H "Origin: https://www.ayandamabaso.co.za" \
  https://api.tredicik.com/api/v1/ping

# Expected: HTTP 401 (auth required) but with CORS headers
```

---

## Frontend Integration

```javascript
// In your SvelteKit app
const API_BASE_URL = 'https://api.tredicik.com';

// Requests will now work
fetch(`${API_BASE_URL}/api/v1/endpoint`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

---

## Verification Results

- ✓ Access-Control-Allow-Origin header present
- ✓ Credentials enabled
- ✓ All HTTP methods supported
- ✓ Required headers allowed
- ✓ Both domain variants working
- ✓ Service stable and running

---

## Need to Change?

To add more origins, edit:
- File: `/home/ubuntu/tredicik/tredicikapi/src/main.py`
- Section: `PROD_ORIGINS` list (around line 530-560)
- The service auto-reloads changes within seconds

---

**Configuration Date:** 2026-02-25
**Verified:** 2026-02-25 17:19:38 UTC
