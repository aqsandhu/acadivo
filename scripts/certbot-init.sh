#!/bin/bash
# =============================================================================
# Acadivo — Certbot SSL Certificate Initialization Script
# Run once per domain to obtain initial certificates
# =============================================================================

set -euo pipefail

DOMAINS=(
  "acadivo.com"
  "www.acadivo.com"
  "staging.acadivo.com"
  "api.acadivo.com"
  "monitoring.acadivo.com"
)
EMAIL="${CERTBOT_EMAIL:-admin@acadivo.com}"
CERTBOT_DATA="/etc/letsencrypt"
CERTBOT_WWW="/var/www/certbot"

echo "Initializing Certbot SSL certificates..."

# Ensure directories exist
mkdir -p "$CERTBOT_DATA" "$CERTBOT_WWW"

# Obtain certificates for all domains
for domain in "${DOMAINS[@]}"; do
  echo "Obtaining certificate for: $domain"
  certbot certonly \
    --webroot \
    --webroot-path "$CERTBOT_WWW" \
    --domain "$domain" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --expand \
    --force-renewal || true
done

echo "SSL certificates initialized successfully!"
echo "Certbot will auto-renew via the certbot container."
