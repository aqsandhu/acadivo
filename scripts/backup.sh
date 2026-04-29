#!/bin/bash
# =============================================================================
# Acadivo — Database Backup Script
# Daily PostgreSQL dump with S3 upload and retention policy
# =============================================================================
# Usage: ./scripts/backup.sh [--tag TAG]
#   --tag: optional tag for backup naming (e.g., pre-deploy)
# =============================================================================

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
WEEK=$(date +%Y%U)
MONTH=$(date +%Y%m)
TAG="${2:-daily}"

# PostgreSQL config (override via env)
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-acadivo}"
PG_DB="${PG_DB:-acadivo_db}"
PG_PASSWORD="${PG_PASSWORD:-}"

# S3 config
S3_BUCKET="${S3_BUCKET:-acadivo-backups}"
S3_REGION="${S3_REGION:-ap-south-1}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

# Retention (days)
RETENTION_DAILY=7
RETENTION_WEEKLY=28   # 4 weeks
RETENTION_MONTHLY=365 # 12 months

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
while [[ $# -gt 0 ]]; do
    case $1 in
        --tag)
            TAG="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

log_info "Starting backup — Tag: $TAG | DB: $PG_DB"

# ── Create Backup Directory ──────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
DUMP_FILE="${BACKUP_DIR}/acadivo_${TAG}_${TIMESTAMP}.sql.gz"

# ── Run PostgreSQL Dump ────────────────────────────────────────────────────
log_info "Dumping database..."

if [ -n "$PG_PASSWORD" ]; then
    export PGPASSWORD="$PG_PASSWORD"
fi

pg_dump \
    -h "$PG_HOST" \
    -p "$PG_PORT" \
    -U "$PG_USER" \
    -d "$PG_DB" \
    --verbose \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    | gzip > "$DUMP_FILE" \
    || { log_error "pg_dump failed!"; exit 1; }

FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
log_ok "Database dump completed: $DUMP_FILE ($FILE_SIZE)"

# ── Upload to S3 / Cloud Storage ───────────────────────────────────────────
if command -v aws &> /dev/null && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    log_info "Uploading to S3..."

    S3_KEY="backups/acadivo/${TAG}/${DATE}/acadivo_${TAG}_${TIMESTAMP}.sql.gz"

    if [ -n "$S3_ENDPOINT" ]; then
        aws s3 cp "$DUMP_FILE" "s3://${S3_BUCKET}/${S3_KEY}" \
            --endpoint-url "$S3_ENDPOINT" \
            --region "$S3_REGION" \
            || log_warn "S3 upload failed"
    else
        aws s3 cp "$DUMP_FILE" "s3://${S3_BUCKET}/${S3_KEY}" \
            --region "$S3_REGION" \
            || log_warn "S3 upload failed"
    fi

    log_ok "Uploaded to S3: s3://${S3_BUCKET}/${S3_KEY}"
else
    log_warn "AWS CLI not available or credentials missing. Skipping S3 upload."
fi

# ── Retention Policy ───────────────────────────────────────────────────────
log_info "Applying retention policy..."

# Daily backups — keep 7 days
find "$BACKUP_DIR" -name "acadivo_daily_*.sql.gz" -mtime +$RETENTION_DAILY -delete 2>/dev/null || true

# Weekly backups — keep 4 weeks (copied on Sundays)
if [ "$(date +%u)" = "7" ]; then
    WEEKLY_FILE="${BACKUP_DIR}/acadivo_weekly_${WEEK}_${TIMESTAMP}.sql.gz"
    cp "$DUMP_FILE" "$WEEKLY_FILE"
    log_ok "Created weekly backup: $WEEKLY_FILE"
fi
find "$BACKUP_DIR" -name "acadivo_weekly_*.sql.gz" -mtime +$RETENTION_WEEKLY -delete 2>/dev/null || true

# Monthly backups — keep 12 months (copied on 1st of month)
if [ "$(date +%d)" = "01" ]; then
    MONTHLY_FILE="${BACKUP_DIR}/acadivo_monthly_${MONTH}_${TIMESTAMP}.sql.gz"
    cp "$DUMP_FILE" "$MONTHLY_FILE"
    log_ok "Created monthly backup: $MONTHLY_FILE"
fi
find "$BACKUP_DIR" -name "acadivo_monthly_*.sql.gz" -mtime +$RETENTION_MONTHLY -delete 2>/dev/null || true

# ── Cleanup ──────────────────────────────────────────────────────────────────
log_info "Cleaning up old local backups..."
find "$BACKUP_DIR" -name "acadivo_*.sql.gz" -mtime +$RETENTION_DAILY -delete 2>/dev/null || true

# ── Summary ──────────────────────────────────────────────────────────────────
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "acadivo_*.sql.gz" | wc -l)
log_ok "✅ Backup completed!"
log_info "Local backups: $BACKUP_COUNT files"
log_info "Retention: ${RETENTION_DAILY} daily | ${RETENTION_WEEKLY} weekly | ${RETENTION_MONTHLY} monthly"
