#!/bin/bash
# =============================================================================
# Acadivo — Database Migration Helper
# Run Prisma migrations in Docker or locally
# =============================================================================
# Usage: ./scripts/migrate.sh [dev|deploy|status|reset|seed]
#   dev:    Run migrations in development (with shadow DB)
#   deploy: Run production migrations (no shadow DB)
#   status: Check migration status
#   reset:  ⚠️  Reset database (DESTRUCTIVE)
#   seed:   Run seed script after migration
# =============================================================================

set -euo pipefail

COMMAND="${1:-deploy}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env"

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

log_info "Migration command: $COMMAND"

# Detect if running inside Docker
cd "$PROJECT_ROOT"

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

SCHEMA="packages/api/prisma/schema.prisma"

case "$COMMAND" in
    dev)
        log_info "Running development migration..."
        npx prisma migrate dev --schema="$SCHEMA"
        ;;

    deploy)
        log_info "Running production migration (deploy)..."
        npx prisma migrate deploy --schema="$SCHEMA"
        log_ok "Production migrations applied"
        ;;

    status)
        log_info "Checking migration status..."
        npx prisma migrate status --schema="$SCHEMA"
        ;;

    reset)
        log_warn "⚠️  WARNING: This will RESET the database (all data will be lost)!"
        read -p "Type 'RESET' to confirm: " CONFIRM
        if [ "$CONFIRM" = "RESET" ]; then
            npx prisma migrate reset --schema="$SCHEMA" --force
            log_ok "Database reset completed"
        else
            log_info "Reset cancelled"
        fi
        ;;

    seed)
        log_info "Running seed script..."
        npx prisma db seed --schema="$SCHEMA"
        log_ok "Seed completed"
        ;;

    generate)
        log_info "Generating Prisma Client..."
        npx prisma generate --schema="$SCHEMA"
        log_ok "Prisma Client generated"
        ;;

    studio)
        log_info "Starting Prisma Studio..."
        npx prisma studio --schema="$SCHEMA"
        ;;

    *)
        echo "Usage: $0 [dev|deploy|status|reset|seed|generate|studio]"
        echo ""
        echo "Commands:"
        echo "  dev      Run development migrations (with shadow DB)"
        echo "  deploy   Run production migrations (for CI/CD)"
        echo "  status   Show migration status"
        echo "  reset    ⚠️  Reset database (DESTRUCTIVE)"
        echo "  seed     Run seed script"
        echo "  generate Generate Prisma Client"
        echo "  studio   Open Prisma Studio"
        exit 1
        ;;
esac

log_ok "Migration command '$COMMAND' completed"
