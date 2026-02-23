# Ayanda Mabaso - DNS Records for Domain Registrar

## 🎯 DNS Setup (WITHOUT Route53)

**Pattern**: Same as ruraltothemoon.co.za - DNS managed at domain registrar

---

## STEP 1: SSL Certificate Validation (DO THIS FIRST)

**Add these CNAME records at your domain registrar** to validate the SSL certificate:

### Record 1 - For ayandamabaso.co.za
```
Type:  CNAME
Name:  _ac45b972f9f9297194cf36d404731178
Host:  _ac45b972f9f9297194cf36d404731178.ayandamabaso.co.za
Value: _5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.
TTL:   3600 (1 hour) or Auto
```

### Record 2 - For www.ayandamabaso.co.za
```
Type:  CNAME
Name:  _5af6a6027abb7017f735f04c26a7ed6a.www
Host:  _5af6a6027abb7017f735f04c26a7ed6a.www.ayandamabaso.co.za
Value: _931654cb08e28750d0ae90c39c13d9c6.jkddzztszm.acm-validations.aws.
TTL:   3600 (1 hour) or Auto
```

**⚠️ IMPORTANT**:
- Different registrars have different name formats
- Some want just the subdomain part: `_ac45b972f9f9297194cf36d404731178`
- Some want the full hostname: `_ac45b972f9f9297194cf36d404731178.ayandamabaso.co.za`
- Try the subdomain first, if it fails, use full hostname

### How to Add at Common Registrars:

**GoDaddy:**
1. My Products → Domains → ayandamabaso.co.za → DNS
2. Click "Add" under Records
3. Type: CNAME
4. Name: `_ac45b972f9f9297194cf36d404731178` (just the subdomain part)
5. Value: `_5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.`
6. Repeat for second record

**Cloudflare:**
1. Select domain → DNS → Add record
2. Type: CNAME
3. Name: `_ac45b972f9f9297194cf36d404731178`
4. Target: `_5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.`
5. Proxy status: DNS only (gray cloud)
6. Repeat for second record

**Namecheap:**
1. Domain List → Manage → Advanced DNS
2. Add New Record → CNAME
3. Host: `_ac45b972f9f9297194cf36d404731178`
4. Value: `_5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.`
5. Repeat for second record

**⏱️ After adding**: Wait 5-30 minutes for SSL validation to complete.

---

## STEP 2: Website DNS Records (After SSL Validates & CloudFront Created)

**These will be added AFTER CloudFront distribution is created.**

### Option A: Modern Approach (RECOMMENDED - Both use CloudFront)

**Apex Domain (ayandamabaso.co.za):**
```
Type:  A
Name:  @ or blank or ayandamabaso.co.za
Value: [CloudFront IP - will use ALIAS if supported]
TTL:   Auto or 3600

OR if your registrar supports CNAME at apex:
Type:  CNAME
Name:  @ or blank
Value: [CloudFront domain - TBD after creation]
TTL:   Auto or 3600
```

**WWW Subdomain (www.ayandamabaso.co.za):**
```
Type:  CNAME
Name:  www
Value: [CloudFront domain - TBD after creation]
TTL:   Auto or 3600
```

### Option B: ruraltothemoon Pattern (Apex → EC2, WWW → CloudFront)

If you want apex to redirect via nginx (like ruraltothemoon):

**Apex Domain:**
```
Type:  A
Name:  @ or blank
Value: [EC2 Instance IP - e.g., 34.242.134.202]
TTL:   Auto or 3600
```

**WWW Subdomain:**
```
Type:  CNAME
Name:  www
Value: [CloudFront domain - TBD]
TTL:   Auto or 3600
```

**⚠️ We recommend Option A** (both use CloudFront) for better performance and simplicity.

---

## Current Status

### ✅ Completed:
- [x] S3 bucket created: `ayandamabaso-production`
- [x] SSL certificate requested: `d0aa634b-0666-4125-8417-83113b65696f`
- [x] Route53 zone deleted (not needed - using registrar DNS)

### ⏳ Pending:
- [ ] SSL validation CNAME records added at registrar (STEP 1 - YOU)
- [ ] SSL certificate validates (automatic after STEP 1, 5-30 min)
- [ ] CloudFront distribution created (after SSL validates)
- [ ] Website DNS records added at registrar (STEP 2 - after CloudFront)

---

## Verification Commands

### Check SSL Certificate Status
```bash
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f" \
  --region us-east-1 \
  --profile agentic-admin \
  --query "Certificate.Status" \
  --output text

# Should show: ISSUED (after validation)
```

### Check DNS Propagation
```bash
# Check validation CNAME records
dig _ac45b972f9f9297194cf36d404731178.ayandamabaso.co.za CNAME +short
dig _5af6a6027abb7017f735f04c26a7ed6a.www.ayandamabaso.co.za CNAME +short

# After website DNS added
dig ayandamabaso.co.za +short
dig www.ayandamabaso.co.za +short
```

---

## Reference: ruraltothemoon.co.za Setup

**DNS Provider**: GoDaddy (ns45.domaincontrol.com, ns46.domaincontrol.com)

**DNS Records**:
```
ruraltothemoon.co.za       A      13.244.214.206 (nginx redirect)
www.ruraltothemoon.co.za   CNAME  d1ct6iu4kz7t7h.cloudfront.net
```

**CloudFront**:
- Distribution: E1X8MMAO5F5LG4
- Aliases: ruraltothemoon.co.za, www.ruraltothemoon.co.za
- Origin: ruraltothemoon-web.s3-website.af-south-1.amazonaws.com
- Certificate: 276ab58a-7f77-41c9-b414-24bfc9aa0057 (ISSUED)

---

## AWS Resources

| Resource | ID/ARN |
|----------|--------|
| **S3 Bucket** | `ayandamabaso-production` |
| **SSL Certificate** | `arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f` |
| **CloudFront** | Will be created after SSL validates |

---

## Next Steps

1. **NOW**: Add SSL validation CNAME records at your domain registrar (STEP 1)
2. **Wait 5-30 min**: For SSL certificate to validate
3. **I'll create CloudFront**: After SSL validates
4. **You add website DNS**: A and CNAME records (STEP 2)
5. **Deploy website**: Build and upload to S3
6. **Go live!** 🚀

---

**Let me know once you've added the SSL validation CNAME records!**
