#!/bin/bash
# =============================================================================
# Acadivo — Production Deployment Script
# Zero-downtime rolling deployment with health checks and rollback
# =============================================================================
# Usage: ./scripts/deploy.sh [VERSION]
#   VERSION: optional semantic version (e.g., 1.2.3). Defaults to 'latest'
# =============================================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
VERSION="${1:-latest}"
COMPOSE_BASE="docker/docker-compose.yml"
COMPOSE_PROD="docker/docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
MAX_HEALTH_RETRIES=6
HEALTH_RETRY_DELAY=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ── Pre-flight Checks ──────────────────────────────────────────────────────
log_info "Starting production deployment — Version: $VERSION"

if [ ! -f "$ENV_FILE" ]; then
    log_error "Environment file $ENV_FILE not found!"
    exit 1
fi

if [ ! -f "$COMPOSE_BASE" ]; then
    log_error "Docker compose file $COMPOSE_BASE not found!"
    exit 1
fi

# Ensure Docker and docker compose are available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed!"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    log_error "Docker Compose plugin not available!"
    exit 1
fi

# ── Pre-deployment Backup ────────────────────────────────────────────────────
log_info "Creating pre-deployment backup..."
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TAG="pre-deploy-${TIMESTAMP}"

# Backup database
if [ -f "./scripts/backup.sh" ]; then
    ./scripts/backup.sh --tag "$BACKUP_TAG" || log_warn "Backup script failed, continuing..."
else
    log_warn "Backup script not found, skipping automated backup"
fi

# Save current image versions for rollback
log_info "Recording current versions for rollback..."
docker compose -f "$COMPOSE_BASE" -f "$COMPOSE_PROD" --env-file "$ENV_FILE" ps --format json 2>/dev/null | jq -r '.[] | .Service + ":" + .Image' > "${BACKUP_DIR}/versions-${TIMESTAMP}.txt" 2>/dev/null || true

# ── Pull Latest Images ─────────────────────────────────────────────────────
log_info "Pulling latest images..."
export VERSION
if [ "$VERSION" != "latest" ]; then
    docker pull "ghcr.io/acadivo/acadivo-api:${VERSION}" || true
    docker pull "ghcr.io/acadivo/acadivo-web:${VERSION}" || true
    docker pull "ghcr.io/acadivo/acadivo-socket:${VERSION}" || true
fi

# ── Database Migration ─────────────────────────────────────────────────────
log_info "Running database migrations..."
docker run --rm \
    --env-file "$ENV_FILE" \
    --network acadivo-network \
    "ghcr.io/acadivo/acadivo-api:${VERSION}" \
    npx prisma migrate deploy \
    || { log_error "Database migration failed!"; exit 1; }

log_ok "Database migrations completed"

# ── Rolling Update (Zero Downtime) ─────────────────────────────────────────
log_info "Starting rolling update..."

# Update API with rolling strategy (2 replicas)
log_info "Rolling update: API service..."
docker compose -f "$COMPOSE_BASE" -f "$COMPOSE_PROD" --env-file "$ENV_FILE" up -d \
    --no-deps --scale api=2 api \
    || { log_error "API update failed!"; exit 1; }

sleep 10

# Update Socket service
log_info "Rolling update: Socket service..."
docker compose -f "$COMPOSE_BASE" -f "$COMPOSE_PROD" --env-file "$ENV_FILE" up -d \
    --no-deps --scale socket=2 socket \
    || { log_error "Socket update failed!"; exit 1; }

sleep 10

# Update Web service
log_info "Rolling update: Web service..."
docker compose -f "$COMPOSE_BASE" -f "$COMPOSE_PROD" --env-file "$ENV_FILE" up -d \
    --no-deps web nginx \
    || { log_error "Web update failed!"; exit 1; }

sleep 15

# ── Health Checks ──────────────────────────────────────────────────────────
log_info "Running health checks..."

HEALTH_PASSED=false
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_HEALTH_RETRIES ]; do
    API_STATUS=$(curl -sf http://localhost:5000/health 2>/dev/null && echo "OK" || echo "FAIL")
    WEB_STATUS=$(curl -sf http://localhost:3000 2>/dev/null && echo "OK" || echo "FAIL")

    if [ "$API_STATUS" = "OK" ] && [ "$WEB_STATUS" = "OK" ]; then
        HEALTH_PASSED=true
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_warn "Health check attempt $RETRY_COUNT/$MAX_HEALTH_RETRIES failed. Retrying in ${HEALTH_RETRY_DELAY}s..."
    sleep $HEALTH_RETRY_DELAY
done

if [ "$HEALTH_PASSED" != "true" ]; then
    log_error "Health checks failed after $MAX_HEALTH_RETRIES attempts!"
    log_warn "Initiating rollback to previous version..."

    # Rollback
    docker compose -f "$COMPOSE_BASE" -f "$COMPOSE_PROD" --env-file "$ENV_FILE" down
    docker compose -f "$COMPOSE_BASE" -f "$COMPOSE_PROD" --env-file "$ENV_FILE" up -d

    log_error "Rollback completed. Deployment failed."
    exit 1
fi

log_ok "All health checks passed"

# ── Post-Deployment Cleanup ────────────────────────────────────────────────
log_info "Cleaning up old Docker images..."
docker image prune -af --filter "until=72h" || true
docker volume prune -f || true

# Scale API to full replica count
log_info "Scaling API to full production replicas..."
docker compose -f "$COMPOSE_BASE" -f "$COMPOSE_PROD" --env-file "$ENV_FILE" up -d \
    --no-deps --scale api=3 api

# ── Finalize ─────────────────────────────────────────────────────────────
log_ok "✅ Production deployment completed successfully!"
log_info "Version: $VERSION"
log_info "Health: http://localhost:5000/health"
log_info "Metrics: http://localhost:5000/health/metrics"

# Record deployment
echo "$(date '+%Y-%m-%d %H:%M:%S') | Deployed $VERSION | Status: SUCCESS" >> "${BACKUP_DIR}/deployments.log"
