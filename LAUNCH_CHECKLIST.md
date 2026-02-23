# Ayanda Mabaso - Production Launch Checklist

## 🚀 Quick Start - What to Do RIGHT NOW

**Status**: Infrastructure 70% complete, waiting for DNS configuration

---

## ⚡ IMMEDIATE ACTION REQUIRED (5 minutes)

### Update Domain Nameservers

**Where**: Log into your domain registrar (where you registered ayandamabaso.co.za)

**Update these 4 nameservers**:
```
ns-1088.awsdns-08.org
ns-347.awsdns-43.com
ns-918.awsdns-50.net
ns-1800.awsdns-33.co.uk
```

**How to find your domain registrar**:
```bash
# Check current registrar
whois ayandamabaso.co.za | grep -i registrar
```

**Common registrars and where to update nameservers**:
- **GoDaddy**: My Products → Domains → ayandamabaso.co.za → Manage DNS → Nameservers
- **Namecheap**: Domain List → Manage → Nameservers → Custom DNS
- **Cloudflare**: Dashboard → ayandamabaso.co.za → DNS → Nameservers
- **Domain.com**: My Account → Manage Domains → DNS & Nameservers
- **Google Domains**: My Domains → ayandamabaso.co.za → DNS → Name servers

---

## 📊 Infrastructure Status

### ✅ COMPLETED (Today - Feb 14, 2026)

| Component | Status | Details |
|-----------|--------|---------|
| **S3 Bucket** | ✅ Created | `ayandamabaso-production` (af-south-1) |
| **S3 Website Hosting** | ✅ Configured | index.html / error.html |
| **S3 Public Access** | ✅ Enabled | Bucket policy set |
| **SSL Certificate** | ⏳ Pending | Waiting for DNS validation |
| **Route53 Hosted Zone** | ✅ Created | Zone ID: `Z06069901F4UIGRZH97TY` |
| **Nameservers** | 🔴 Required | **YOU MUST UPDATE** |

### ⏳ PENDING (After Nameservers Update)

| Component | Status | Depends On |
|-----------|--------|------------|
| **SSL Validation** | ⏳ Waiting | Nameservers updated (5-30 min) |
| **CloudFront Distribution** | 🔴 Not Started | SSL validated |
| **DNS A Records** | 🔴 Not Started | CloudFront created |
| **Website Deployment** | 🔴 Not Started | CloudFront ready |
| **Backend Data** | 🔴 Not Started | Website deployed |

---

## 📋 Complete Launch Timeline

### Phase 1: DNS Configuration (NOW - 30 minutes)
1. ✅ **YOU**: Update nameservers at domain registrar
2. ⏳ **AUTO**: DNS propagation (10-30 minutes)
3. ⏳ **AUTO**: SSL certificate validation

**Verify nameservers updated**:
```bash
dig NS ayandamabaso.co.za +short
# Should show the 4 AWS nameservers
```

### Phase 2: CloudFront Setup (After SSL validates - 20 minutes)
1. **Create CloudFront distribution** with validated SSL
2. **Add DNS A records** pointing to CloudFront
3. **Test DNS resolution**

### Phase 3: Website Deployment (30 minutes)
1. **Build production website**:
   ```bash
   cd ~/github/ayandamabaso
   npm run build
   ```

2. **Deploy to S3**:
   ```bash
   ./scripts/deploy-production.sh
   ```

3. **Verify website loads** at https://ayandamabaso.co.za

### Phase 4: Backend Data Provisioning (30-60 minutes)
1. **Verify tenant configuration** (tenant_id=41)
2. **Create production API key**
3. **Add CORS origins** to backend
4. **Provision sample products**
5. **Configure business hours**
6. **Set up payment gateway** (PayFast)
7. **Test API connectivity**

### Phase 5: Final Testing & Launch (30 minutes)
1. **Test all features**:
   - Customer registration
   - Login/authentication
   - Product catalog
   - Booking system
   - Checkout process
2. **Performance testing**
3. **Security verification**
4. **Go live** 🚀

**Total estimated time**: 2-3 hours (mostly waiting for DNS)

---

## 🔧 Commands You'll Need

### Check DNS Propagation
```bash
# Check nameservers
dig NS ayandamabaso.co.za +short

# Check website resolution
dig ayandamabaso.co.za +short
dig www.ayandamabaso.co.za +short

# Test from different DNS servers
dig @8.8.8.8 ayandamabaso.co.za  # Google DNS
dig @1.1.1.1 ayandamabaso.co.za  # Cloudflare DNS
```

### Check SSL Certificate Status
```bash
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f" \
  --region us-east-1 \
  --profile agentic-admin \
  --query "Certificate.Status" \
  --output text

# Should show: ISSUED (after nameservers propagate)
```

### Test Website Locally Before Deploy
```bash
cd ~/github/ayandamabaso

# Build for production
npm run build

# Preview production build
npm run preview

# Visit: http://localhost:4173
```

### Deploy to Production (After CloudFront ready)
```bash
cd ~/github/ayandamabaso

# Run production deployment
./scripts/deploy-production.sh

# Manually deploy if script doesn't exist
aws s3 sync build/ s3://ayandamabaso-production/ \
  --region af-south-1 \
  --delete \
  --profile default
```

---

## 📁 Important Files Created

### DNS Configuration
- **`DNS_RECORDS_TO_UPDATE.md`** - Complete DNS setup guide
  - Nameservers to update
  - SSL validation records
  - Website A records

### Backend Setup
- **`BACKEND_DATA_PROVISIONING.md`** - Data provisioning guide
  - Tenant configuration
  - Products/services
  - Business hours
  - Payment setup
  - Email configuration

### Deployment
- **`DEPLOYMENT_PLAN.md`** - Complete deployment strategy
- **`DEPLOYMENT_COMMANDS.md`** - Copy-paste AWS commands
- **`scripts/deploy-production.sh`** - Automated deployment script (to be created)

---

## 🎯 Success Criteria

Before going live, verify:

- [ ] Website loads at https://ayandamabaso.co.za (no SSL warnings)
- [ ] Website loads at https://www.ayandamabaso.co.za (redirects properly)
- [ ] Customer can register new account
- [ ] Customer can login
- [ ] Products display correctly
- [ ] Booking calendar shows availability
- [ ] Checkout process works (test mode)
- [ ] Payment gateway configured (PayFast)
- [ ] Email sending works (registration confirmation)
- [ ] Mobile responsive design works
- [ ] Page load time < 3 seconds
- [ ] No console errors in browser
- [ ] API calls return correct tenant data (tenant_id=41)

---

## 🆘 Troubleshooting

### Nameservers not propagating?
```bash
# Wait 10-30 minutes, then check
dig NS ayandamabaso.co.za +short

# If still old nameservers:
# 1. Double-check you updated at correct registrar
# 2. Clear local DNS cache:
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# 3. Wait up to 24 hours (rare)
```

### SSL certificate stuck in PENDING_VALIDATION?
```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn "arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f" \
  --region us-east-1 \
  --profile agentic-admin

# Verify nameservers are correct
# Wait 5-30 minutes after nameservers propagate
```

### Website shows 404 or Access Denied?
```bash
# Check S3 bucket has files
aws s3 ls s3://ayandamabaso-production/ --profile default

# Check bucket policy is public
aws s3api get-bucket-policy --bucket ayandamabaso-production --profile default

# Redeploy website
cd ~/github/ayandamabaso
./scripts/deploy-production.sh
```

### API calls failing (CORS error)?
```bash
# Check CORS configuration in backend
ssh tredicik-hub-prod "docker exec tredicik-backend-prod grep -A 5 'ayandamabaso' /app/src/main.py"

# Verify portal_configs has correct CORS origins
# Restart backend after updating
```

---

## 📞 Next Steps After DNS Update

Once you've updated the nameservers, let me know and I'll:

1. ✅ **Monitor SSL validation** (5-30 minutes)
2. ✅ **Create CloudFront distribution** (10 minutes)
3. ✅ **Add DNS A records** (immediate)
4. ✅ **Create deployment script** (5 minutes)
5. ✅ **Deploy website** to production (5 minutes)
6. ✅ **Provision backend data** (30 minutes)
7. ✅ **Run final testing** (15 minutes)
8. ✅ **Go live!** 🚀

**Estimated time after DNS update**: 1-2 hours

---

## 📚 Reference Documents

- **DNS Setup**: `DNS_RECORDS_TO_UPDATE.md`
- **Backend Data**: `BACKEND_DATA_PROVISIONING.md`
- **Full Deployment**: `DEPLOYMENT_PLAN.md`
- **Quick Commands**: `DEPLOYMENT_COMMANDS.md`
- **Multi-Tenant Docs**: `~/github/tredicik/context/architecture/multi-tenant-architecture.md`
- **Client Template**: `~/github/tredicik/context/architecture/client-website-template.md`

---

## 🎉 Current Progress

```
[████████████████░░░░] 70% Complete

✅ S3 bucket created
✅ SSL certificate requested
✅ Route53 hosted zone created
✅ Nameservers configured (AWS side)
⏳ Waiting for DNS update (YOUR ACTION)
🔴 CloudFront pending SSL
🔴 Website deployment pending
🔴 Backend data pending
```

---

**UPDATE YOUR NAMESERVERS NOW** and let me know when done! 🚀
