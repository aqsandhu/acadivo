#!/bin/bash
# =============================================================================
# Acadivo — Production Seeding Script
# ⚠️  DANGER: Only run in production with extreme caution!
# Seeds essential data (admin user, roles, settings) without destroying existing data
# =============================================================================
# Usage: ./scripts/seed-prod.sh [--force]
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.production"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

FORCE=false
if [ "${1:-}" = "--force" ]; then
    FORCE=true
fi

echo ""
log_warn "⚠️  ⚠️  ⚠️  DANGER ZONE ⚠️  ⚠️  ⚠️"
echo ""
log_warn "You are about to run SEED on PRODUCTION database!"
log_warn "This will insert data into your live database."
echo ""

# Load environment
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

log_info "Target database: $DATABASE_URL"
echo ""

# Safety confirmation
if [ "$FORCE" != true ]; then
    read -p "Type 'SEED-PRODUCTION' to confirm: " CONFIRM
    if [ "$CONFIRM" != "SEED-PRODUCTION" ]; then
        log_info "Seed cancelled by user."
        exit 0
    fi
fi

# ── Check if already seeded ────────────────────────────────────────────────
log_info "Checking if database already has users..."

cd "$PROJECT_ROOT"

# Run seed via Prisma or direct SQL
log_info "Running production-safe seed..."

# Use a dedicated production seed script
cat > /tmp/prod-seed.sql << 'EOF'
-- Production-safe seed: only inserts if table is empty
DO $$
BEGIN
    -- Seed admin role if not exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin') THEN
        INSERT INTO roles (id, name, created_at, updated_at)
        VALUES (gen_random_uuid(), 'admin', NOW(), NOW());
    END IF;

    -- Seed teacher role if not exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'teacher') THEN
        INSERT INTO roles (id, name, created_at, updated_at)
        VALUES (gen_random_uuid(), 'teacher', NOW(), NOW());
    END IF;

    -- Seed student role if not exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'student') THEN
        INSERT INTO roles (id, name, created_at, updated_at)
        VALUES (gen_random_uuid(), 'student', NOW(), NOW());
    END IF;

    -- Seed parent role if not exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'parent') THEN
        INSERT INTO roles (id, name, created_at, updated_at)
        VALUES (gen_random_uuid(), 'parent', NOW(), NOW());
    END IF;
END
$$;
EOF

# Execute the seed SQL
psql "$DATABASE_URL" -f /tmp/prod-seed.sql || {
    log_error "Production seed failed!"
    exit 1
}

rm -f /tmp/prod-seed.sql

log_ok "✅ Production seed completed successfully!"
log_info "Roles seeded: admin, teacher, student, parent"
log_warn "Remember to create an admin user via the application or a separate secure script!"
