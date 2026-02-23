#!/bin/bash
# Cloudflare DNS Update Script
# Updates dev.api.tredicik.com A record

set -e

# Configuration
DOMAIN="tredicik.com"
RECORD_NAME="dev.api.tredicik.com"
OLD_IP="3.248.170.247"
NEW_IP="34.242.134.202"
RECORD_TYPE="A"
TTL=60

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if credentials are provided
if [ -z "$CLOUDFLARE_API_TOKEN" ] && [ -z "$CLOUDFLARE_API_KEY" ]; then
    echo -e "${RED}Error: Cloudflare credentials not found${NC}"
    echo ""
    echo "Please set one of the following:"
    echo "  export CLOUDFLARE_API_TOKEN='your_api_token'"
    echo "  OR"
    echo "  export CLOUDFLARE_API_KEY='your_api_key'"
    echo "  export CLOUDFLARE_EMAIL='your_email@example.com'"
    echo ""
    echo "Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    exit 1
fi

# Set authentication headers
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
    echo -e "${GREEN}Using API Token authentication${NC}"
else
    if [ -z "$CLOUDFLARE_EMAIL" ]; then
        echo -e "${RED}Error: CLOUDFLARE_EMAIL required when using API Key${NC}"
        exit 1
    fi
    AUTH_HEADER="X-Auth-Email: $CLOUDFLARE_EMAIL"
    AUTH_KEY_HEADER="X-Auth-Key: $CLOUDFLARE_API_KEY"
    echo -e "${GREEN}Using API Key authentication${NC}"
fi

echo ""
echo "==================================================="
echo "Cloudflare DNS Update"
echo "==================================================="
echo "Domain:       $DOMAIN"
echo "Record:       $RECORD_NAME"
echo "Type:         $RECORD_TYPE"
echo "Current IP:   $OLD_IP"
echo "New IP:       $NEW_IP"
echo "==================================================="
echo ""

# Step 1: Get Zone ID
echo -e "${YELLOW}Step 1: Getting Zone ID for $DOMAIN...${NC}"

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json")
else
    ZONE_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
        -H "$AUTH_HEADER" \
        -H "$AUTH_KEY_HEADER" \
        -H "Content-Type: application/json")
fi

# Check if request was successful
SUCCESS=$(echo "$ZONE_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}Error: Failed to get zone information${NC}"
    echo "$ZONE_RESPONSE" | jq '.'
    exit 1
fi

ZONE_ID=$(echo "$ZONE_RESPONSE" | jq -r '.result[0].id')

if [ -z "$ZONE_ID" ] || [ "$ZONE_ID" == "null" ]; then
    echo -e "${RED}Error: Zone not found for domain $DOMAIN${NC}"
    exit 1
fi

echo -e "${GREEN}Zone ID: $ZONE_ID${NC}"
echo ""

# Step 2: Get DNS Record ID
echo -e "${YELLOW}Step 2: Finding DNS record for $RECORD_NAME...${NC}"

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    RECORD_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=$RECORD_TYPE&name=$RECORD_NAME" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json")
else
    RECORD_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=$RECORD_TYPE&name=$RECORD_NAME" \
        -H "$AUTH_HEADER" \
        -H "$AUTH_KEY_HEADER" \
        -H "Content-Type: application/json")
fi

SUCCESS=$(echo "$RECORD_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}Error: Failed to get DNS records${NC}"
    echo "$RECORD_RESPONSE" | jq '.'
    exit 1
fi

RECORD_ID=$(echo "$RECORD_RESPONSE" | jq -r '.result[0].id')
CURRENT_IP=$(echo "$RECORD_RESPONSE" | jq -r '.result[0].content')

if [ -z "$RECORD_ID" ] || [ "$RECORD_ID" == "null" ]; then
    echo -e "${RED}Error: DNS record not found for $RECORD_NAME${NC}"
    exit 1
fi

echo -e "${GREEN}Record ID: $RECORD_ID${NC}"
echo -e "${GREEN}Current IP: $CURRENT_IP${NC}"

# Verify current IP matches what we expect
if [ "$CURRENT_IP" != "$OLD_IP" ]; then
    echo -e "${YELLOW}Warning: Current IP ($CURRENT_IP) differs from expected ($OLD_IP)${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""

# Step 3: Update DNS Record
echo -e "${YELLOW}Step 3: Updating DNS record to $NEW_IP...${NC}"

UPDATE_DATA=$(cat <<EOF
{
  "type": "$RECORD_TYPE",
  "name": "$RECORD_NAME",
  "content": "$NEW_IP",
  "ttl": $TTL,
  "proxied": false
}
EOF
)

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d "$UPDATE_DATA")
else
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
        -H "$AUTH_HEADER" \
        -H "$AUTH_KEY_HEADER" \
        -H "Content-Type: application/json" \
        -d "$UPDATE_DATA")
fi

SUCCESS=$(echo "$UPDATE_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" != "true" ]; then
    echo -e "${RED}Error: Failed to update DNS record${NC}"
    echo "$UPDATE_RESPONSE" | jq '.'
    exit 1
fi

NEW_CONTENT=$(echo "$UPDATE_RESPONSE" | jq -r '.result.content')

echo -e "${GREEN}Success! DNS record updated${NC}"
echo -e "${GREEN}New IP: $NEW_CONTENT${NC}"
echo ""
echo "==================================================="
echo -e "${GREEN}DNS update completed successfully!${NC}"
echo "==================================================="
echo ""
echo "Note: DNS changes may take a few minutes to propagate."
echo "You can verify with: dig dev.api.tredicik.com"
echo ""
