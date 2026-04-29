#!/bin/bash
# =============================================================================
# Acadivo — Database Restore Script
# Restore from a PostgreSQL dump with safety checks
# =============================================================================
# Usage: ./scripts/restore.sh <BACKUP_FILE> [--force]
#   BACKUP_FILE: path to the .sql.gz dump file
#   --force: skip confirmation prompt
# =============================================================================

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-acadivo}"
PG_DB="${PG_DB:-acadivo_db}"
PG_PASSWORD="${PG_PASSWORD:-}"

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

# ── Parse Arguments ──────────────────────────────────────────────────────────
if [ $# -lt 1 ]; then
    echo "Usage: $0 <BACKUP_FILE> [--force]"
    echo "  BACKUP_FILE: path to .sql.gz dump"
    echo "  --force: skip confirmation"
    exit 1
fi

BACKUP_FILE="$1"
FORCE=false

if [ "${2:-}" = "--force" ]; then
    FORCE=true
fi

# ── Validate Backup File ───────────────────────────────────────────────────
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

if [[ ! "$BACKUP_FILE" =~ \.sql\.gz$ ]]; then
    log_error "Invalid file format. Expected .sql.gz"
    exit 1
fi

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log_info "Backup file: $BACKUP_FILE ($FILE_SIZE)"

# ── Safety Confirmation ────────────────────────────────────────────────────
if [ "$FORCE" != true ]; then
    echo ""
    log_warn "⚠️  WARNING: This will DESTROY the current database '$PG_DB' and replace it!"
    log_warn "   Host: $PG_HOST:$PG_PORT"
    log_warn "   Database: $PG_DB"
    echo ""
    read -p "Are you sure you want to continue? Type 'RESTORE' to confirm: " CONFIRM

    if [ "$CONFIRM" != "RESTORE" ]; then
        log_info "Restore cancelled by user."
        exit 0
    fi
fi

# ── Pre-Restore Backup ─────────────────────────────────────────────────────
log_info "Creating pre-restore safety backup..."
PRE_RESTORE_BACKUP="pre-restore-$(date +%Y%m%d_%H%M%S).sql.gz"

if [ -n "$PG_PASSWORD" ]; then
    export PGPASSWORD="$PG_PASSWORD"
fi

pg_dump -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" \
    --verbose --no-owner --no-privileges \
    | gzip > "$PRE_RESTORE_BACKUP" \
    || log_warn "Pre-restore backup failed"

log_ok "Pre-restore backup: $PRE_RESTORE_BACKUP"

# ── Stop Application (Optional) ─────────────────────────────────────────────
log_warn "Consider stopping the API service to prevent writes during restore"
log_info "Run: docker compose stop api"
echo ""
read -p "Press Enter to continue with restore, or Ctrl+C to abort..."

# ── Restore Database ───────────────────────────────────────────────────────
log_info "Restoring database from backup..."

gunzip -c "$BACKUP_FILE" | psql \
    -h "$PG_HOST" \
    -p "$PG_PORT" \
    -U "$PG_USER" \
    -d "$PG_DB" \
    --set ON_ERROR_STOP=on \
    || { log_error "Restore failed!"; exit 1; }

log_ok "Database restore completed!"

# ── Post-Restore ───────────────────────────────────────────────────────────
log_info "Running post-restore checks..."

# Check table count
TABLE_COUNT=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" \
    -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" | xargs)
log_info "Tables restored: $TABLE_COUNT"

# Check user count
USER_COUNT=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" \
    -t -c "SELECT count(*) FROM users;" 2>/dev/null | xargs || echo "N/A")
log_info "Users in database: $USER_COUNT"

log_ok "✅ Restore completed successfully!"
log_info "Remember to restart the API service if it was stopped"
