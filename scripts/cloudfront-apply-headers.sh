#!/usr/bin/env bash
# Apply the Ayanda Mabaso CloudFront Response Headers Policy.
#
# Prerequisites:
#   - AWS CLI v2 configured with credentials that can manage CloudFront.
#   - Run from the repo root so the relative path below resolves correctly.
#
# 1) Create the policy (records the returned Id and ETag):
#
#      aws cloudfront create-response-headers-policy \
#        --response-headers-policy-config file://scripts/cloudfront-security-headers.json
#
# 2) Attach the returned policy Id to your distribution's default cache
#    behaviour. Fetch the current distribution config:
#
#      DIST_ID="<your-distribution-id>"
#      aws cloudfront get-distribution-config --id "$DIST_ID" > dist.json
#      # Edit dist.json: set DefaultCacheBehavior.ResponseHeadersPolicyId to the new Id
#      ETAG=$(jq -r '.ETag' dist.json)
#      jq '.DistributionConfig' dist.json > dist-config.json
#      aws cloudfront update-distribution \
#        --id "$DIST_ID" \
#        --if-match "$ETAG" \
#        --distribution-config file://dist-config.json
#
# 3) Wait for the distribution to redeploy ("InProgress" -> "Deployed").
#
# 4) Verify headers in the browser DevTools or with curl -I against the
#    CloudFront-hosted domain.

set -euo pipefail

POLICY_FILE="$(dirname "$0")/cloudfront-security-headers.json"

if [ ! -f "$POLICY_FILE" ]; then
	echo "Policy file not found: $POLICY_FILE" >&2
	exit 1
fi

echo "Creating CloudFront response headers policy from $POLICY_FILE"
aws cloudfront create-response-headers-policy \
	--response-headers-policy-config "file://$POLICY_FILE"
