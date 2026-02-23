# Ayanda Mabaso - Production Deployment Plan

## Current Status

**UAT Environment** ✅
- S3: `ayandamabaso-uat`
- CloudFront: `E1RQIB2S8IIL4` → `d1s5gxldjthzj1.cloudfront.net`
- Status: Deployed and working

**Production Environment** ❌
- Not yet configured
- Domain: `ayandamabaso.co.za` (needs setup)

---

## Production Deployment Steps

### 1. AWS Infrastructure Setup

#### a) Create Production S3 Bucket
```bash
# Create S3 bucket
aws s3 mb s3://ayandamabaso-production \
  --region af-south-1 \
  --profile default

# Enable static website hosting
aws s3 website s3://ayandamabaso-production \
  --index-document index.html \
  --error-document index.html \
  --region af-south-1 \
  --profile default

# Configure bucket policy for public read
aws s3api put-bucket-policy \
  --bucket ayandamabaso-production \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ayandamabaso-production/*"
    }]
  }' \
  --region af-south-1 \
  --profile default
```

#### b) Create CloudFront Distribution
```bash
# Create distribution (requires JSON config file)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --profile default

# Get distribution ID after creation
aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'ayandamabaso-production')].Id" \
  --output text \
  --profile default
```

**CloudFront Config Template** (`cloudfront-config.json`):
```json
{
  "CallerReference": "ayandamabaso-production-$(date +%s)",
  "Aliases": {
    "Quantity": 2,
    "Items": ["ayandamabaso.co.za", "www.ayandamabaso.co.za"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-ayandamabaso-production",
      "DomainName": "ayandamabaso-production.s3-website.af-south-1.amazonaws.com",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "http-only"
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-ayandamabaso-production",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Comment": "Ayanda Mabaso Production Website",
  "Enabled": true,
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

#### c) SSL Certificate (AWS ACM)
```bash
# Request certificate (must be in us-east-1 for CloudFront)
aws acm request-certificate \
  --domain-name ayandamabaso.co.za \
  --subject-alternative-names www.ayandamabaso.co.za \
  --validation-method DNS \
  --region us-east-1 \
  --profile default

# Get validation records
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID \
  --region us-east-1 \
  --profile default
```

#### d) Route53 DNS Configuration
```bash
# Create hosted zone (if doesn't exist)
aws route53 create-hosted-zone \
  --name ayandamabaso.co.za \
  --caller-reference $(date +%s) \
  --profile default

# Get hosted zone ID
aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='ayandamabaso.co.za.'].Id" \
  --output text \
  --profile default

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "ayandamabaso.co.za",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "CLOUDFRONT_DISTRIBUTION.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }' \
  --profile default
```

---

### 2. Production Environment Configuration

#### Update `.env.production`
```bash
# Production Environment Configuration
VITE_API_URL=https://api.tredicik.com/api/external/v1
VITE_API_KEY=pk_live_tenant_41
VITE_TENANT_ID=41

# Environment Identifier
NODE_ENV=production
VITE_ENV=production

# PayFast - Live Mode
VITE_PAYFAST_SANDBOX=false
```

**⚠️ Note**: Need to get production API key from backend team.

---

### 3. Deployment Script

#### Create `scripts/deploy-production.sh`
```bash
#!/bin/bash
# Deploy to Production Environment
# Ayanda Mabaso - Production Deployment Script

set -e

# Configuration
S3_BUCKET="ayandamabaso-production"
CLOUDFRONT_DISTRIBUTION_ID="EXXXXXXXXXXX"  # Get after CloudFront creation
AWS_REGION="af-south-1"

echo "================================================"
echo "  Ayanda Mabaso - PRODUCTION Deployment"
echo "================================================"
echo ""
read -p "⚠️  Deploy to PRODUCTION? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Deployment cancelled."
  exit 0
fi

# Step 1: Copy production environment file
echo ""
echo "📋 Step 1: Setting up production environment..."
cp .env.production .env
echo "   ✅ Environment configured for production"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm ci --silent
echo "   ✅ Dependencies installed"

# Step 3: Build the application
echo ""
echo "🔨 Step 3: Building application..."
npm run build
echo "   ✅ Build complete"

# Step 4: Upload to S3
echo ""
echo "☁️  Step 4: Uploading to S3..."
aws s3 sync build/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML files with no-cache
aws s3 sync build/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate"

# Upload JSON files with no-cache
aws s3 sync build/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

echo "   ✅ Files uploaded to S3"

# Step 5: Invalidate CloudFront cache
echo ""
echo "🔄 Step 5: Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text
echo "   ✅ Cache invalidation started"

# Step 6: Restore local development environment
echo ""
echo "🔧 Step 6: Restoring local environment..."
cp .env.local .env 2>/dev/null || cp .env.example .env 2>/dev/null || true
echo "   ✅ Local environment restored"

echo ""
echo "================================================"
echo "  ✅ PRODUCTION Deployment Complete!"
echo "================================================"
echo ""
echo "  🌐 Production URL: https://ayandamabaso.co.za"
echo "  🌐 Alt URL: https://www.ayandamabaso.co.za"
echo "  📊 CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
echo "  🪣 S3 Bucket: ${S3_BUCKET}"
echo ""
echo "  Note: CloudFront may take a few minutes to"
echo "        propagate changes globally."
echo ""
```

---

### 4. Backend Configuration

Ensure tenant is configured in Tredicik backend:

```sql
-- Check tenant exists
SELECT id, name, domain, is_active FROM tenants WHERE id = 41;

-- Check portal config
SELECT tenant_id, api_key, cors_origins FROM portal_configs WHERE tenant_id = 41;

-- Update CORS origins for production
UPDATE portal_configs
SET cors_origins = '["https://ayandamabaso.co.za", "https://www.ayandamabaso.co.za", "http://localhost:5176"]'
WHERE tenant_id = 41;
```

**Backend CORS Configuration** (`tredicikapi/src/main.py`):
```python
CORS_ORIGINS = [
    "https://ayandamabaso.co.za",
    "https://www.ayandamabaso.co.za",
    "http://localhost:5176",  # Dev
    # ... other origins
]
```

---

## Deployment Workflow

### UAT Deployment (Existing)
```bash
cd ~/github/ayandamabaso
./scripts/deploy-uat.sh
```
**URL**: https://d1s5gxldjthzj1.cloudfront.net

### Production Deployment (After Setup)
```bash
cd ~/github/ayandamabaso
./scripts/deploy-production.sh
```
**URL**: https://ayandamabaso.co.za

---

## Pre-Deployment Checklist

### Infrastructure
- [ ] S3 bucket created (`ayandamabaso-production`)
- [ ] CloudFront distribution created
- [ ] SSL certificate issued and validated
- [ ] Route53 hosted zone created
- [ ] DNS records configured (A records for apex and www)
- [ ] Domain nameservers updated (if external registrar)

### Backend
- [ ] Tenant record exists (tenant_id=41)
- [ ] Portal config with production API key
- [ ] CORS origins updated for production domain
- [ ] Backend API accessible at `https://api.tredicik.com/api/external/v1`

### Frontend
- [ ] `.env.production` configured with correct values
- [ ] Production API key obtained
- [ ] Build tested locally (`npm run build && npm run preview`)
- [ ] All features tested in UAT environment

### Deployment Script
- [ ] `scripts/deploy-production.sh` created
- [ ] Script has execute permissions (`chmod +x`)
- [ ] CloudFront distribution ID configured in script

---

## Rollback Plan

If issues occur after production deployment:

1. **Revert S3 files**:
   ```bash
   aws s3 sync s3://ayandamabaso-uat/ s3://ayandamabaso-production/ \
     --region af-south-1 \
     --delete
   ```

2. **Clear CloudFront cache**:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id EXXXXXXXXXXX \
     --paths "/*"
   ```

3. **Redeploy previous version** from git:
   ```bash
   git checkout <previous-commit>
   ./scripts/deploy-production.sh
   ```

---

## Monitoring

After deployment, verify:

1. **Website loads**: https://ayandamabaso.co.za
2. **SSL certificate**: Valid and trusted
3. **API connectivity**: Check browser console for API calls
4. **Features**: Test registration, login, store, booking
5. **Performance**: Check CloudFront cache hit ratio

---

## Cost Estimate (AWS)

- **S3**: ~$0.02/GB storage + $0.09/GB transfer
- **CloudFront**: ~$0.085/GB transfer (first 10TB)
- **Route53**: $0.50/month per hosted zone
- **ACM Certificate**: Free

**Estimated monthly cost**: ~$5-10/month (low traffic)

---

## References

- **Similar Deployments**:
  - Matasaa: `matasaa-co-za-website` (S3) → `matasaa.co.za`
  - Rural: `ruraltothemoon-web` (S3) → `www.ruraltothemoon.co.za`
- **UAT Script**: `scripts/deploy-uat.sh`
- **Architecture**: Multi-tenant client website pattern
- **Tenant Config**: `src/lib/config.ts` (tenant_id=41)
