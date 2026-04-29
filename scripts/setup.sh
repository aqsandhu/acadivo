#!/usr/bin/env bash
# =============================================================================
# Acadivo — One-Command Development Setup
# =============================================================================
# Usage: ./scripts/setup.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════════"
echo "  Acadivo Monorepo Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── Step 1: Validate Environment ─────────────────────────────────────────────
echo "📋 Step 1/6 — Validating environment..."

if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose is not installed. Please install it first."
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 20+."
  exit 1
fi

NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "❌ Node.js 20+ is required. Found: $(node -v)"
  exit 1
fi

echo "✅ Environment validated (Node $(node -v), Docker OK)"
echo ""

# ── Step 2: Install Dependencies ─────────────────────────────────────────────
echo "📦 Step 2/6 — Installing monorepo dependencies..."
cd "$PROJECT_ROOT"
npm install
echo "✅ Dependencies installed"
echo ""

# ── Step 3: Copy Environment File ────────────────────────────────────────────
echo "🔧 Step 3/6 — Setting up environment..."
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
  echo "✅ Created .env from .env.example (please review and update values)"
else
  echo "⚠️  .env already exists, skipping copy"
fi
echo ""

# ── Step 4: Start Docker Services ────────────────────────────────────────────
echo "🐳 Step 4/6 — Starting Docker services (PostgreSQL + Redis)..."
cd "$PROJECT_ROOT/docker"
docker-compose up -d postgres redis

# Wait for PostgreSQL to be healthy
echo "⏳ Waiting for PostgreSQL to be healthy..."
for i in {1..30}; do
  if docker-compose ps postgres | grep -q "healthy"; then
    echo "✅ PostgreSQL is healthy"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "❌ PostgreSQL failed to become healthy in time"
    exit 1
  fi
  sleep 2
done

# Wait for Redis to be healthy
echo "⏳ Waiting for Redis to be healthy..."
for i in {1..30}; do
  if docker-compose ps redis | grep -q "healthy"; then
    echo "✅ Redis is healthy"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "❌ Redis failed to become healthy in time"
    exit 1
  fi
  sleep 2
done

echo ""

# ── Step 5: Generate Prisma Client & Migrate ─────────────────────────────────
echo "🗄️  Step 5/6 — Generating Prisma client & running migrations..."
cd "$PROJECT_ROOT/packages/api"
npx prisma generate
npx prisma migrate dev --name init --skip-seed || npx prisma migrate deploy
echo "✅ Database schema ready"
echo ""

# ── Step 6: Seed Database ────────────────────────────────────────────────────
echo "🌱 Step 6/6 — Seeding database..."
cd "$PROJECT_ROOT"
npm run db:seed || echo "⚠️  Seed script not yet available (will be provided by DB_Architect)"
echo ""

# ── Done ─────────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ Setup complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Services:"
echo "    • PostgreSQL  →  localhost:5432"
echo "    • Redis       →  localhost:6379"
echo ""
echo "  Next steps:"
echo "    1. Review and update .env with real credentials"
echo "    2. npm run dev      → Start all services in dev mode"
echo "    3. npm run db:studio → Open Prisma Studio"
echo ""
