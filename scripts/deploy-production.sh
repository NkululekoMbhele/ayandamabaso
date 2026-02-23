#!/bin/bash
# Deploy to Production Environment
# Ayanda Mabaso - Production Deployment Script

set -e

# Configuration
S3_BUCKET="ayandamabaso-production"
CLOUDFRONT_DISTRIBUTION_ID="E2H8F5E7PSXPRH"  # Will be updated after CloudFront creation
AWS_REGION="af-south-1"
AWS_PROFILE="default"

echo "================================================"
echo "  Ayanda Mabaso - PRODUCTION Deployment"
echo "================================================"
echo ""

# Safety check
read -p "⚠️  Deploy to PRODUCTION? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Deployment cancelled."
  exit 0
fi

# Step 1: Copy production environment file
echo ""
echo "📋 Step 1: Setting up production environment..."
if [ -f .env.production ]; then
  cp .env.production .env
  echo "   ✅ Environment configured for production"
else
  echo "   ❌ .env.production not found!"
  exit 1
fi

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

# Check build directory exists
if [ ! -d "build" ]; then
  echo "   ❌ Build directory not found!"
  exit 1
fi

# Step 4: Upload to S3
echo ""
echo "☁️  Step 4: Uploading to S3..."

# Upload all files with long cache (except HTML/JSON)
aws s3 sync build/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE} \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json" \
  --exclude "*.txt"

# Upload HTML files with no-cache
aws s3 sync build/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE} \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate"

# Upload JSON files with no-cache
aws s3 sync build/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE} \
  --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

# Upload txt files (robots.txt, etc.)
aws s3 sync build/ s3://${S3_BUCKET}/ \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE} \
  --include "*.txt" \
  --cache-control "public, max-age=3600"

echo "   ✅ Files uploaded to S3"

# Step 5: Invalidate CloudFront cache (if distribution exists)
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "PENDING" ]; then
  echo ""
  echo "🔄 Step 5: Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text \
    --profile ${AWS_PROFILE}
  echo "   ✅ Cache invalidation started"
else
  echo ""
  echo "⚠️  Step 5: Skipping CloudFront invalidation (distribution not created yet)"
fi

# Step 6: Restore local development environment
echo ""
echo "🔧 Step 6: Restoring local environment..."
if [ -f .env.local ]; then
  cp .env.local .env
elif [ -f .env.example ]; then
  cp .env.example .env
fi
echo "   ✅ Local environment restored"

echo ""
echo "================================================"
echo "  ✅ PRODUCTION Deployment Complete!"
echo "================================================"
echo ""
echo "  🌐 Production URL: https://ayandamabaso.co.za"
echo "  🌐 WWW URL: https://www.ayandamabaso.co.za"
echo "  📊 CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
echo "  🪣 S3 Bucket: ${S3_BUCKET}"
echo ""
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "PENDING" ]; then
  echo "  Note: CloudFront may take a few minutes to"
  echo "        propagate changes globally."
else
  echo "  ⚠️  CloudFront not yet configured."
  echo "      Website accessible via S3 endpoint only."
fi
echo ""
