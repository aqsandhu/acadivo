# Acadivo EdTech Platform

A modern, full-stack education technology platform built as a Turborepo monorepo.

## Architecture

```
acadivo/
├── apps/
│   ├── web/          # Next.js 14 web application
│   └── mobile/       # Flutter 3.x mobile application
├── packages/
│   ├── api/          # Node.js + Express REST API
│   ├── shared/       # Shared types, constants, validation
│   └── socket/       # Socket.io real-time server
├── docker/           # Docker & Docker Compose configs
├── scripts/          # Automation scripts
└── docs/             # Documentation
```

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Web          | Next.js 14, React 18, TypeScript    |
| Mobile       | Flutter 3.x                         |
| API          | Node.js 20, Express 4, Prisma 5     |
| Real-time    | Socket.io 4, Redis Pub/Sub          |
| Database     | PostgreSQL 15                       |
| Cache        | Redis 7                             |
| Auth         | JWT, Passport.js                    |
| Monorepo     | Turborepo, npm workspaces             |
| CI/CD        | GitHub Actions                      |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 10+

### One-Command Setup

```bash
./scripts/setup.sh
```

This will:
1. Validate your environment
2. Install monorepo dependencies
3. Create `.env` from `.env.example`
4. Start PostgreSQL and Redis containers
5. Generate Prisma client and run migrations
6. Seed the database (when available)

### Manual Setup

```bash
# Install dependencies
npm install

# Start infrastructure
cd docker && docker-compose up -d postgres redis

# Setup database
cd packages/api && npx prisma migrate dev

# Start all services in dev mode
npm run dev
```

## Development

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start all services in development        |
| `npm run build`      | Build all packages                       |
| `npm run lint`       | Lint all packages                        |
| `npm run test`       | Run all test suites                      |
| `npm run db:migrate` | Run database migrations                  |
| `npm run db:seed`    | Seed the database                        |
| `npm run db:studio`  | Open Prisma Studio                       |
| `npm run format`     | Format code with Prettier                |

## Services & Ports

| Service     | Port | Description           |
| ----------- | ---- | --------------------- |
| Web         | 3000 | Next.js frontend      |
| API         | 5000 | Express REST API      |
| Socket      | 5001 | Socket.io server      |
| PostgreSQL  | 5432 | Primary database      |
| Redis       | 6379 | Cache & sessions      |

## Environment Variables

See `.env.example` for a complete list of required environment variables.

Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Authentication secrets
- `CLOUDINARY_*` — Image/media storage
- `TWILIO_*` / `SMS_*` — SMS provider credentials
- `FIREBASE_*` — Push notification credentials

## Docker

```bash
# Start all services (including app containers)
cd docker && docker-compose up -d

# View logs
cd docker && docker-compose logs -f api

# Rebuild after changes
cd docker && docker-compose up -d --build api
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure `npm run lint` and `npm run test` pass
4. Open a pull request

## License

UNLICENSED — Proprietary software.
