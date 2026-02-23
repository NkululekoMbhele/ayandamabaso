# Ayanda Mabaso - DNS Records to Add NOW

## 🚨 ADD THESE 2 CNAME RECORDS AT YOUR DOMAIN REGISTRAR

**Pattern**: Same as ruraltothemoon.co.za - DNS at registrar (NOT Route53)

---

## SSL Validation Records (Add These Now)

Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

### Record 1:
```
Type:  CNAME
Name:  _ac45b972f9f9297194cf36d404731178
Value: _5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.
TTL:   3600 (or Auto)
```

### Record 2:
```
Type:  CNAME
Name:  _5af6a6027abb7017f735f04c26a7ed6a.www
Value: _931654cb08e28750d0ae90c39c13d9c6.jkddzztszm.acm-validations.aws.
TTL:   3600 (or Auto)
```

**⚠️ Note**: Some registrars want just the name part (as shown above), others want the full hostname including `.ayandamabaso.co.za`. Try without the domain first.

---

## After You Add These Records

1. **Wait 5-30 minutes** for SSL certificate to validate
2. **I'll create CloudFront distribution**
3. **You'll add 2 more DNS records** for the actual website (A and CNAME)
4. **Website goes live!**

---

## How It Works (Like ruraltothemoon.co.za)

**Current Setup**:
- ✅ S3 bucket: `ayandamabaso-production` (created)
- ✅ SSL cert: Requested (pending validation)
- ❌ DNS: Managed at YOUR domain registrar (NOT AWS Route53)
- ❌ CloudFront: Will create after SSL validates

**ruraltothemoon.co.za for reference**:
```
DNS Provider: GoDaddy (ns45.domaincontrol.com, ns46.domaincontrol.com)

Records:
  ruraltothemoon.co.za       → A      13.244.214.206
  www.ruraltothemoon.co.za   → CNAME  d1ct6iu4kz7t7h.cloudfront.net

CloudFront: E1X8MMAO5F5LG4 → S3 bucket
Certificate: ISSUED (validated via DNS CNAME)
```

**We're doing the same for ayandamabaso.co.za** 👍

---

## Quick Copy-Paste for Registrar

**GoDaddy / Namecheap / Most Registrars**:

1. Go to DNS settings for ayandamabaso.co.za
2. Click "Add Record" or "Add New Record"
3. Copy-paste these two records:

```
CNAME | _ac45b972f9f9297194cf36d404731178 | _5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.
CNAME | _5af6a6027abb7017f735f04c26a7ed6a.www | _931654cb08e28750d0ae90c39c13d9c6.jkddzztszm.acm-validations.aws.
```

4. Save
5. Wait 10-30 minutes
6. Let me know when done!

---

## Verify You Added Them Correctly

After adding, wait 10 minutes and run:

```bash
dig _ac45b972f9f9297194cf36d404731178.ayandamabaso.co.za CNAME +short
# Should show: _5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.

dig _5af6a6027abb7017f735f04c26a7ed6a.www.ayandamabaso.co.za CNAME +short
# Should show: _931654cb08e28750d0ae90c39c13d9c6.jkddzztszm.acm-validations.aws.
```

---

**That's it! Add these 2 CNAME records and let me know when done.** ✅
