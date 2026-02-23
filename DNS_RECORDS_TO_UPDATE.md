# Ayanda Mabaso - DNS Records to Update

## 🚀 Production Launch - DNS Configuration

**Domain**: `ayandamabaso.co.za`
**Status**: Infrastructure created, pending DNS configuration
**Created**: February 14, 2026

---

## STEP 1: Update Nameservers (CRITICAL - Do This First!)

**At your domain registrar** (where you registered ayandamabaso.co.za), update the nameservers to these AWS Route53 nameservers:

### Nameservers to Set:
```
ns-1088.awsdns-08.org
ns-347.awsdns-43.com
ns-918.awsdns-50.net
ns-1800.awsdns-33.co.uk
```

### Instructions by Registrar:

**If using Cloudflare, GoDaddy, Namecheap, or similar:**
1. Log into your domain registrar account
2. Find "ayandamabaso.co.za" in your domain list
3. Look for "Nameservers" or "DNS Settings" or "Custom Nameservers"
4. Replace existing nameservers with the 4 AWS nameservers above
5. Save changes

**⚠️ IMPORTANT**:
- DNS propagation can take 24-48 hours, but typically happens within 1-2 hours
- The SSL certificate validation will only work after nameservers are updated
- Do not proceed to Step 2 until nameservers have propagated

### Verify Nameserver Update:
```bash
# Run this command after updating nameservers (wait 10-30 minutes first)
dig NS ayandamabaso.co.za +short

# You should see the 4 AWS nameservers listed above
```

---

## STEP 2: SSL Certificate Validation (Automatic After Nameservers Update)

After nameservers are updated, AWS will automatically add these DNS records to validate the SSL certificate:

### SSL Validation Records (Will be auto-added by Route53):

**Record 1 - For ayandamabaso.co.za:**
```
Name:  _ac45b972f9f9297194cf36d404731178.ayandamabaso.co.za
Type:  CNAME
Value: _5a568b9b3c5f104bce7a29168f8d1204.jkddzztszm.acm-validations.aws.
TTL:   300 (5 minutes)
```

**Record 2 - For www.ayandamabaso.co.za:**
```
Name:  _5af6a6027abb7017f735f04c26a7ed6a.www.ayandamabaso.co.za
Type:  CNAME
Value: _931654cb08e28750d0ae90c39c13d9c6.jkddzztszm.acm-validations.aws.
TTL:   300 (5 minutes)
```

**⚠️ NOTE**: These records will be added automatically to Route53. You only need to add them manually if NOT using AWS nameservers.

### Verify SSL Certificate Status:
```bash
# Check certificate validation status
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f" \
  --region us-east-1 \
  --profile agentic-admin \
  --query "Certificate.Status" \
  --output text

# Should show "ISSUED" after validation completes (5-30 minutes)
```

---

## STEP 3: Website DNS Records (Will be added after CloudFront creation)

After the SSL certificate is validated, we will create the CloudFront distribution and add these DNS records:

### Website A Records (Pointing to CloudFront):

**Apex domain:**
```
Name:  ayandamabaso.co.za (or @ or blank)
Type:  A (Alias)
Value: [CloudFront Distribution Domain - TBD]
Alias: Yes (Route53 Alias to CloudFront)
```

**WWW subdomain:**
```
Name:  www.ayandamabaso.co.za
Type:  A (Alias)
Value: [Same CloudFront Distribution - TBD]
Alias: Yes (Route53 Alias to CloudFront)
```

**⚠️ NOTE**: These will be created AFTER CloudFront distribution is set up (next step in deployment).

---

## Current Infrastructure Status

### ✅ Created:
- [x] S3 Bucket: `ayandamabaso-production` (af-south-1)
- [x] S3 Static Website Hosting: Enabled
- [x] S3 Public Access: Configured
- [x] SSL Certificate: Requested (ARN: `d0aa634b-0666-4125-8417-83113b65696f`)
- [x] Route53 Hosted Zone: Created (ID: `Z06069901F4UIGRZH97TY`)

### ⏳ Pending:
- [ ] Nameservers updated at domain registrar (USER ACTION REQUIRED)
- [ ] SSL certificate validation (automatic after nameservers)
- [ ] CloudFront distribution creation (after SSL validation)
- [ ] Website deployment to S3
- [ ] DNS A records for website (after CloudFront)

---

## Next Steps After Nameserver Update

Once you've updated the nameservers at your domain registrar:

1. **Wait 10-30 minutes** for DNS propagation
2. **Verify nameservers** are updated:
   ```bash
   dig NS ayandamabaso.co.za +short
   ```

3. **Check SSL validation status** (should auto-complete):
   ```bash
   aws acm describe-certificate \
     --certificate-arn "arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f" \
     --region us-east-1 \
     --profile agentic-admin \
     --query "Certificate.Status"
   ```

4. **I'll create CloudFront distribution** once certificate is validated

5. **Deploy website** to production S3 bucket

6. **Test live website** at https://ayandamabaso.co.za

---

## Summary of What You Need to Do NOW:

### 🎯 IMMEDIATE ACTION REQUIRED:

1. **Log into your domain registrar** (where you bought ayandamabaso.co.za)

2. **Update nameservers to these 4 AWS nameservers:**
   ```
   ns-1088.awsdns-08.org
   ns-347.awsdns-43.com
   ns-918.awsdns-50.net
   ns-1800.awsdns-33.co.uk
   ```

3. **Wait 10-30 minutes** for DNS propagation

4. **Let me know** when nameservers are updated, and I'll:
   - Wait for SSL certificate to validate
   - Create CloudFront distribution
   - Deploy the website
   - Add final DNS A records
   - Provision live data in backend

---

## Reference Information

### AWS Resources Created:

| Resource | ID/ARN | Region |
|----------|--------|--------|
| **S3 Bucket** | `ayandamabaso-production` | af-south-1 |
| **SSL Certificate** | `arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f` | us-east-1 |
| **Route53 Hosted Zone** | `Z06069901F4UIGRZH97TY` | Global |

### Backend Configuration:
- **Tenant ID**: 41
- **API Endpoint**: `https://api.tredicik.com/api/external/v1`
- **API Key**: Will be provisioned after deployment

---

## Troubleshooting

### Nameserver update not propagating?
```bash
# Check current nameservers
dig NS ayandamabaso.co.za +short

# Clear local DNS cache (macOS)
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Check from multiple DNS servers
dig @8.8.8.8 NS ayandamabaso.co.za +short  # Google DNS
dig @1.1.1.1 NS ayandamabaso.co.za +short  # Cloudflare DNS
```

### SSL certificate stuck in PENDING_VALIDATION?
- Ensure nameservers are properly updated
- Wait up to 30 minutes for validation
- Check Route53 has the validation CNAME records

### Need to cancel and restart?
If you need to restart the process:
```bash
# Delete SSL certificate
aws acm delete-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f" \
  --region us-east-1 \
  --profile agentic-admin

# Delete hosted zone (warning: loses all DNS records)
aws route53 delete-hosted-zone \
  --id Z06069901F4UIGRZH97TY \
  --profile agentic-admin
```

---

**Questions? Need help?** Let me know once the nameservers are updated!
