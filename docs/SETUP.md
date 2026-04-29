# Acadivo Setup Guide

Complete guide for setting up the Acadivo platform for local development.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Step-by-Step Setup](#step-by-step-setup)
- [One-Command Setup](#one-command-setup)
- [IDE Setup](#ide-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

| Software | Version | Purpose | Download |
|----------|---------|---------|----------|
| Node.js | 20+ | JavaScript runtime | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | Package manager | [pnpm.io](https://pnpm.io) |
| Docker | 24+ | Containers | [docker.com](https://docker.com) |
| Docker Compose | 2.20+ | Multi-container orchestration | Included with Docker |
| PostgreSQL | 15 (via Docker) | Database | Docker image |
| Redis | 7 (via Docker) | Cache | Docker image |
| Flutter SDK | 3.x | Mobile development | [flutter.dev](https://flutter.dev) |
| Git | 2.40+ | Version control | [git-scm.com](https://git-scm.com) |

### Verify Prerequisites

```bash
node --version      # Should be v20.x.x or higher
pnpm --version      # Should be 8.x.x or higher
docker --version    # Should be 24.x.x or higher
docker-compose --version  # Should be 2.20.x or higher
git --version       # Should be 2.40.x or higher
flutter --version   # Should be 3.x.x or higher
```

---

## Environment Variables

Acadivo uses environment variables for configuration. Copy `.env.example` to `.env` and fill in the values.

### Core Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `PORT` | Yes | `5000` | API server port |
| `API_URL` | Yes | `http://localhost:5000` | API base URL |
| `WEB_URL` | Yes | `http://localhost:3000` | Web app URL |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | - | Refresh token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiry |

### External Services

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | For file uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For file uploads | Cloudinary API key |
| `CLOUDINARY_SECRET` | For file uploads | Cloudinary secret |
| `FIREBASE_PROJECT_ID` | For push notifications | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | For push notifications | Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | For push notifications | Firebase client email |
| `SMTP_HOST` | For emails | SMTP server host |
| `SMTP_PORT` | For emails | SMTP server port |
| `SMTP_USER` | For emails | SMTP username |
| `SMTP_PASS` | For emails | SMTP password |
| `TWILIO_SID` | For SMS | Twilio account SID |
| `TWILIO_TOKEN` | For SMS | Twilio auth token |
| `SMS_JAZZ_API` | For SMS | JazzCash SMS API endpoint |
| `SMS_ZONG_API` | For SMS | Zong SMS API endpoint |

### Rate Limiting

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in ms (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

### Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Winston log level (debug, info, warn, error) |

### Example .env for Local Development

```bash
# Application
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
WEB_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://acadivo:acadivo_password@localhost:5432/acadivo_db?schema=public
REDIS_URL=redis://localhost:6379

# Authentication (generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloud Storage (optional for local dev)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET=your-secret

# Firebase (optional for local dev)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Email (optional for local dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (optional for local dev)
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
SMS_JAZZ_API=https://jazzsms.com/api/send
SMS_ZONG_API=https://zongsms.com/api/send

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## Step-by-Step Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/acadivo/acadivo.git
cd acadivo
```

### Step 2: Install Dependencies

```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install all monorepo dependencies
pnpm install
```

This installs dependencies for:
- `apps/web` — Next.js web application
- `apps/mobile` — Flutter mobile app (via pub get)
- `packages/api` — Express API server
- `packages/socket` — Socket.io server
- `packages/shared` — Shared utilities

### Step 3: Start Docker Compose (PostgreSQL + Redis)

```bash
cd docker
docker-compose up -d postgres redis
```

Verify containers are running:
```bash
docker-compose ps
# Should show postgres and redis as "running"
```

### Step 4: Generate Prisma Client

```bash
cd packages/api
npx prisma generate
```

This generates TypeScript types from the Prisma schema.

### Step 5: Run Migrations

```bash
npx prisma migrate dev
```

This will:
1. Create the database if it doesn't exist
2. Apply all pending migrations
3. Create a new migration if schema changed

### Step 6: Seed Database

```bash
npx prisma db seed
```

This populates the database with:
- Sample tenant (school)
- Sample users for each role
- Sample classes, sections, subjects
- Sample timetable entries

### Step 7: Start API Server

```bash
# From packages/api directory
pnpm dev
```

The API server will start on `http://localhost:5000`.

### Step 8: Start Socket Server

Open a new terminal:
```bash
cd packages/socket
pnpm dev
```

The Socket.io server will start on `http://localhost:5001`.

### Step 9: Start Web App

Open a new terminal:
```bash
cd apps/web
pnpm dev
```

The Next.js web app will start on `http://localhost:3000`.

### Step 10: Run Flutter App

Open a new terminal:
```bash
cd apps/mobile
flutter pub get
flutter run
```

This will launch the app on a connected device or emulator.

---

## One-Command Setup

For convenience, a setup script is provided at `./scripts/setup.sh`:

```bash
# Make the script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

### What the Script Does

1. Checks all prerequisites are installed
2. Creates `.env` from `.env.example` if it doesn't exist
3. Installs monorepo dependencies via `pnpm install`
4. Starts Docker containers (PostgreSQL + Redis)
5. Generates Prisma client
6. Runs database migrations
7. Seeds the database
8. Verifies all services are running

### After Running the Script

Start services individually:
```bash
# Terminal 1: API
pnpm dev:api

# Terminal 2: Socket
pnpm dev:socket

# Terminal 3: Web
pnpm dev:web

# Terminal 4: Mobile (optional)
cd apps/mobile && flutter run
```

Or start all development services with Turborepo:
```bash
pnpm dev
```

---

## IDE Setup

### VS Code Extensions

Install these extensions for the best development experience:

| Extension | Purpose |
|-----------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Prisma | Prisma schema support |
| Tailwind CSS IntelliSense | CSS autocomplete |
| Thunder Client / REST Client | API testing |
| Docker | Container management |
| Flutter | Mobile development |
| Dart | Dart language support |

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "prisma.format.enable": true,
  "files.associations": {
    "*.prisma": "prisma"
  }
}
```

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "API Server",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/packages/api",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal"
    },
    {
      "name": "Web App",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/apps/web",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Troubleshooting

### Database Connection Failed

**Error:** `Can't reach database server at localhost:5432`

**Solutions:**
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Start the container
docker-compose up -d postgres

# Check logs
docker-compose logs postgres

# Reset database (caution: deletes all data)
docker-compose down -v
docker-compose up -d postgres
```

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solutions:**
```bash
cd packages/api
npx prisma generate
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Flutter Build Errors

**Error:** `Could not find a valid Flutter SDK`

**Solutions:**
```bash
# Verify Flutter installation
flutter doctor

# Fix any issues shown by flutter doctor
# Common fixes:
flutter config --android-sdk /path/to/android/sdk
flutter doctor --android-licenses
```

### Redis Connection Failed

**Error:** `ECONNREFUSED 127.0.0.1:6379`

**Solutions:**
```bash
# Check if Redis container is running
docker-compose ps

# Start Redis
docker-compose up -d redis

# Test Redis connection
redis-cli ping  # Should respond with PONG
```

### pnpm Installation Issues

**Error:** `pnpm: command not found`

**Solutions:**
```bash
# Install pnpm via npm
npm install -g pnpm

# Or use corepack (included with Node.js 16+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Missing Environment Variables

**Error:** `JWT_SECRET is required`

**Solutions:**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and fill in all required values
nano .env
```

### Database Migration Conflicts

**Error:** `P3018: A migration failed to apply`

**Solutions:**
```bash
# Reset migrations (development only!)
npx prisma migrate reset

# Or resolve manually
npx prisma migrate resolve --applied <migration_name>
```

### Hot Reload Not Working

**Solutions:**
```bash
# For Next.js, check next.config.js has webpack dev config
# For API, use nodemon (included in dev script)
# Restart the dev server
```

---

*For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).*
*For mobile setup details, see [MOBILE_SETUP.md](./MOBILE_SETUP.md).*
*For API reference, see [API.md](./API.md).*
