# Ayanda Mabaso - Quick Deployment Commands

## Check Current Status

```bash
# Check S3 buckets
aws s3 ls --profile default | grep ayanda

# Check CloudFront distributions
aws cloudfront list-distributions --profile default \
  --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'ayandamabaso')].[Id,DomainName,Status]" \
  --output table

# Check Route53 zones
aws route53 list-hosted-zones --profile default \
  --query "HostedZones[?contains(Name, 'ayandamabaso')].[Name,Id]" \
  --output table
```

## 1. Create Production S3 Bucket

```bash
# Create bucket
aws s3 mb s3://ayandamabaso-production --region af-south-1 --profile default

# Enable static website hosting
aws s3 website s3://ayandamabaso-production \
  --index-document index.html \
  --error-document index.html \
  --region af-south-1

# Make bucket public
aws s3api put-bucket-policy --bucket ayandamabaso-production --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::ayandamabaso-production/*"
  }]
}'

# Verify
aws s3api get-bucket-website --bucket ayandamabaso-production --region af-south-1
```

## 2. Request SSL Certificate

```bash
# Request certificate (MUST be in us-east-1 for CloudFront)
aws acm request-certificate \
  --domain-name ayandamabaso.co.za \
  --subject-alternative-names www.ayandamabaso.co.za \
  --validation-method DNS \
  --region us-east-1 \
  --profile default

# Get certificate ARN (save this!)
aws acm list-certificates --region us-east-1 --profile default \
  --query "CertificateSummaryList[?contains(DomainName, 'ayandamabaso')].CertificateArn" \
  --output text

# Get validation DNS records
aws acm describe-certificate \
  --certificate-arn <ARN_FROM_ABOVE> \
  --region us-east-1 \
  --profile default \
  --query "Certificate.DomainValidationOptions[*].[ResourceRecord.Name,ResourceRecord.Value]" \
  --output table
```

## 3. Create CloudFront Distribution

```bash
# First, save this config to cloudfront-config.json
cat > cloudfront-config.json << 'CLOUDFRONT'
{
  "CallerReference": "ayandamabaso-prod-$(date +%s)",
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
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "Compress": true
  },
  "Comment": "Ayanda Mabaso Production Website",
  "Enabled": true,
  "ViewerCertificate": {
    "ACMCertificateArn": "<CERTIFICATE_ARN_HERE>",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [{
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    }]
  }
}
CLOUDFRONT

# Create distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --profile default

# Get distribution ID (save this!)
aws cloudfront list-distributions --profile default \
  --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'ayandamabaso-production')].Id" \
  --output text
```

## 4. Configure Route53 DNS

```bash
# Create hosted zone (if doesn't exist)
aws route53 create-hosted-zone \
  --name ayandamabaso.co.za \
  --caller-reference $(date +%s) \
  --profile default

# Get hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones --profile default \
  --query "HostedZones[?Name=='ayandamabaso.co.za.'].Id" \
  --output text | cut -d'/' -f3)

# Get CloudFront domain name
CF_DOMAIN=$(aws cloudfront list-distributions --profile default \
  --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'ayandamabaso-production')].DomainName" \
  --output text)

# Create A record for apex domain
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "ayandamabaso.co.za",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'$CF_DOMAIN'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }' \
  --profile default

# Create A record for www subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.ayandamabaso.co.za",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'$CF_DOMAIN'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }' \
  --profile default

# Get nameservers (update at domain registrar)
aws route53 get-hosted-zone --id $ZONE_ID \
  --query "DelegationSet.NameServers" \
  --output table
```

## 5. Deploy Website

```bash
# UAT deployment (existing)
cd ~/github/ayandamabaso
./scripts/deploy-uat.sh

# Production deployment (after infrastructure setup)
./scripts/deploy-production.sh
```

## Verification Commands

```bash
# Test DNS resolution
dig ayandamabaso.co.za
dig www.ayandamabaso.co.za

# Test SSL certificate
curl -I https://ayandamabaso.co.za

# Check CloudFront distribution status
aws cloudfront get-distribution --id <DISTRIBUTION_ID> \
  --query "Distribution.Status" \
  --profile default

# Check S3 bucket contents
aws s3 ls s3://ayandamabaso-production/ --profile default
```

## Troubleshooting

```bash
# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*" \
  --profile default

# Check certificate validation status
aws acm describe-certificate \
  --certificate-arn <CERTIFICATE_ARN> \
  --region us-east-1 \
  --profile default \
  --query "Certificate.Status"

# Check bucket policy
aws s3api get-bucket-policy \
  --bucket ayandamabaso-production \
  --profile default
```
