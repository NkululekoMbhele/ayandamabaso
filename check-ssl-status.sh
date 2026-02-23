#!/bin/bash
# Check SSL Certificate Validation Status
# Ayanda Mabaso - Certificate Monitor

CERT_ARN="arn:aws:acm:us-east-1:534712420350:certificate/d0aa634b-0666-4125-8417-83113b65696f"

echo "================================================"
echo "  SSL Certificate Validation Monitor"
echo "================================================"
echo ""

# Check certificate status
echo "📋 Certificate Status:"
STATUS=$(aws acm describe-certificate \
  --certificate-arn "$CERT_ARN" \
  --region us-east-1 \
  --profile agentic-admin \
  --query "Certificate.Status" \
  --output text 2>&1)

echo "   Status: $STATUS"
echo ""

if [ "$STATUS" == "ISSUED" ]; then
  echo "✅ Certificate is VALIDATED!"
  echo ""

  # Get certificate details
  aws acm describe-certificate \
    --certificate-arn "$CERT_ARN" \
    --region us-east-1 \
    --profile agentic-admin \
    --query "Certificate.{Domain:DomainName,IssuedAt:IssuedAt,NotAfter:NotAfter}" \
    --output table

  echo ""
  echo "🚀 Ready to create CloudFront distribution!"
  echo ""
  exit 0
elif [ "$STATUS" == "PENDING_VALIDATION" ]; then
  echo "⏳ Certificate is still pending validation..."
  echo ""

  # Check DNS records
  echo "📋 Checking DNS Validation Records:"
  echo ""

  echo "   Record 1 (apex):"
  RECORD1=$(dig _ac45b972f9f9297194cf36d404731178.ayandamabaso.co.za CNAME +short)
  if [ -n "$RECORD1" ]; then
    echo "   ✅ $RECORD1"
  else
    echo "   ❌ Not found"
  fi

  echo ""
  echo "   Record 2 (www):"
  RECORD2=$(dig _5af6a6027abb7017f735f04c26a7ed6a.www.ayandamabaso.co.za CNAME +short)
  if [ -n "$RECORD2" ]; then
    echo "   ✅ $RECORD2"
  else
    echo "   ❌ Not found"
  fi

  echo ""
  echo "⏱️  AWS typically validates within 5-30 minutes after DNS records are added."
  echo "   Run this script again in a few minutes to check status."
  echo ""
  exit 1
else
  echo "❌ Unexpected status: $STATUS"
  echo ""
  exit 1
fi
