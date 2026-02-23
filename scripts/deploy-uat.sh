#!/bin/bash
# Deploy to UAT Environment
# Ayanda Mabaso - UAT Deployment Script

set -e

# Configuration
S3_BUCKET="ayandamabaso-uat"
CLOUDFRONT_DISTRIBUTION_ID="E1RQIB2S8IIL4"
AWS_REGION="af-south-1"

echo "================================================"
echo "  Ayanda Mabaso - UAT Deployment"
echo "================================================"

# Step 1: Copy UAT environment file
echo ""
echo "📋 Step 1: Setting up UAT environment..."
cp .env.uat .env
echo "   ✅ Environment configured for UAT"

# Step 2: Install dependencies (if needed)
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
echo "  ✅ UAT Deployment Complete!"
echo "================================================"
echo ""
echo "  🌐 UAT URL: https://d1s5gxldjthzj1.cloudfront.net"
echo "  📊 CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
echo "  🪣 S3 Bucket: ${S3_BUCKET}"
echo ""
echo "  Note: CloudFront may take a few minutes to"
echo "        propagate changes globally."
echo ""
