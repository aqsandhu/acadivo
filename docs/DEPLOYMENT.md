# Acadivo Deployment Guide

Complete guide for deploying Acadivo to production environments.

---

## Table of Contents

- [Deployment Prerequisites](#deployment-prerequisites)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migration Strategy](#database-migration-strategy)
- [SSL/TLS Setup](#ssltls-setup)
- [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
- [CDN Setup](#cdn-setup)
- [Firebase Setup](#firebase-setup)
- [SMS Gateway Setup](#sms-gateway-setup)
- [Email Service Setup](#email-service-setup)
- [Cloudinary Setup](#cloudinary-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup Strategy](#backup-strategy)
- [Scaling Strategy](#scaling-strategy)
- [Cost Estimation](#cost-estimation)

---

## Deployment Prerequisites

### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 50 GB SSD | 100+ GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Network | 100 Mbps | 1 Gbps |

### Required Accounts

| Service | Purpose |
|---------|---------|
| Cloudflare | DNS + CDN + SSL |
| DigitalOcean / AWS / GCP | VPS / Cloud hosting |
| Cloudinary | File storage |
| Firebase | Push notifications |
| SendGrid / AWS SES | Email delivery |
| Twilio | International SMS |
| JazzCash / EasyPaisa | Pakistan mobile payments |

### Installed Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm
```

---

## Docker Deployment

### Production Docker Compose

The production stack is defined in `docker/docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - acadivo_network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - acadivo_network

  api:
    build:
      context: ../packages/api
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    ports:
      - "127.0.0.1:5000:5000"
    depends_on:
      - postgres
      - redis
    networks:
      - acadivo_network

  socket:
    build:
      context: ../packages/socket
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      REDIS_URL: ${REDIS_URL}
    ports:
      - "127.0.0.1:5001:5001"
    depends_on:
      - redis
    networks:
      - acadivo_network

  web:
    build:
      context: ../apps/web
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      API_URL: ${API_URL}
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      - api
    networks:
      - acadivo_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot_data:/etc/letsencrypt
    depends_on:
      - web
      - api
      - socket
    networks:
      - acadivo_network

volumes:
  postgres_data:
  redis_data:
  certbot_data:

networks:
  acadivo_network:
    driver: bridge
```

### Deploy Steps

```bash
# 1. Clone repository on server
git clone https://github.com/acadivo/acadivo.git /opt/acadivo
cd /opt/acadivo

# 2. Create production environment file
nano .env

# 3. Build and start containers
cd docker
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Run database migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# 5. Verify all services are running
docker-compose -f docker-compose.prod.yml ps
```

### Useful Docker Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f socket
docker-compose -f docker-compose.prod.yml logs -f web

# Restart a service
docker-compose -f docker-compose.prod.yml restart api

# Update after code changes
docker-compose -f docker-compose.prod.yml up -d --build api

# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U acadivo -d acadivo_db

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U acadivo acadivo_db > backup.sql
```

---

## Environment Configuration for Production

### Production .env Template

```bash
# Application
NODE_ENV=production
PORT=5000
API_URL=https://api.acadivo.com.pk
WEB_URL=https://acadivo.com.pk
APP_URL=https://acadivo.com.pk

# Database (use strong passwords)
DATABASE_URL=postgresql://acadivo_prod:STRONG_PASSWORD@postgres:5432/acadivo_prod?schema=public
REDIS_URL=redis://redis:6379

# Authentication (use cryptographically secure secrets)
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET=your-secret

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Email (SendGrid recommended for production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# SMS
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
SMS_JAZZ_API=https://jazzsms.com/api/send
SMS_JAZZ_API_KEY=your-jazz-api-key
SMS_ZONG_API=https://zongsms.com/api/send
SMS_ZONG_API_KEY=your-zong-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=warn
```

### Generating Secure Secrets

```bash
# Generate JWT secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using openssl
openssl rand -hex 32
```

---

## Database Migration Strategy

### Migration Workflow

```
Local Development
      |
      v
Create/Edit Prisma Schema
      |
      v
Run: npx prisma migrate dev --name <description>
      |
      v
Test migrations locally
      |
      v
Commit migration file to Git
      |
      v
Deploy to Production
      |
      v
Run: npx prisma migrate deploy (non-interactive)
```

### Production Migration Commands

```bash
# Deploy migrations (production-safe, non-interactive)
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Check migration status
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate status

# Generate Prisma client after deployment
docker-compose -f docker-compose.prod.yml exec api npx prisma generate
```

### Zero-Downtime Migrations

1. **Backward-compatible migrations only** in production
2. **Add columns** as nullable first, then backfill
3. **Create indexes** with `CONCURRENTLY` (PostgreSQL)
4. **Deploy during low-traffic hours**

---

## SSL/TLS Setup

### Using Let's Encrypt + Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificates
sudo certbot --nginx -d acadivo.com.pk -d www.acadivo.com.pk -d api.acadivo.com.pk

# Auto-renewal (Certbot sets this up automatically)
sudo certbot renew --dry-run
```

### Manual Certificate (if needed)

```bash
# Generate private key
sudo openssl genrsa -out /etc/ssl/private/acadivo.key 4096

# Generate CSR
sudo openssl req -new -key /etc/ssl/private/acadivo.key -out /etc/ssl/certs/acadivo.csr

# Obtain certificate from CA and save to:
# /etc/ssl/certs/acadivo.crt
# /etc/ssl/certs/ca-bundle.crt
```

---

## Reverse Proxy (Nginx)

### Nginx Configuration

Create `/opt/acadivo/docker/nginx/nginx.conf`:

```nginx
# /opt/acadivo/docker/nginx/nginx.conf

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Web Application
    server {
        listen 80;
        server_name acadivo.com.pk www.acadivo.com.pk;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name acadivo.com.pk www.acadivo.com.pk;

        ssl_certificate /etc/letsencrypt/live/acadivo.com.pk/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/acadivo.com.pk/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Static assets (cache for 1 year)
        location /_next/static/ {
            proxy_pass http://web:3000;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # All other requests to Next.js
        location / {
            proxy_pass http://web:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # API Server
    server {
        listen 80;
        server_name api.acadivo.com.pk;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.acadivo.com.pk;

        ssl_certificate /etc/letsencrypt/live/acadivo.com.pk/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/acadivo.com.pk/privkey.pem;

        # API rate limiting
        limit_req zone=api burst=20 nodelay;

        location / {
            proxy_pass http://api:5000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
        }
    }

    # Socket.io Server
    server {
        listen 80;
        server_name socket.acadivo.com.pk;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name socket.acadivo.com.pk;

        ssl_certificate /etc/letsencrypt/live/acadivo.com.pk/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/acadivo.com.pk/privkey.pem;

        location / {
            proxy_pass http://socket:5001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
        }
    }
}
```

### Test Nginx Configuration

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## CDN Setup for Static Assets

### Cloudflare CDN Configuration

1. **Add domain to Cloudflare**
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Add your domain and update nameservers

2. **Configure DNS Records**

   | Type | Name | Content | Proxy Status |
   |------|------|---------|-------------|
   | A | `@` | Your server IP | Proxied |
   | A | `www` | Your server IP | Proxied |
   | A | `api` | Your server IP | Proxied |
   | A | `socket` | Your server IP | Proxied |

3. **Enable Features**
   - SSL/TLS: Full (strict)
   - Always Use HTTPS: ON
   - Auto Minify: JS, CSS, HTML
   - Brotli Compression: ON
   - Browser Cache TTL: 4 hours

4. **Page Rules (Free tier: 3 rules)**
   - `acadivo.com.pk/_next/static/*` — Cache Level: Cache Everything, Edge Cache TTL: 1 month
   - `api.acadivo.com.pk/*` — Cache Level: Bypass
   - `socket.acadivo.com.pk/*` — Cache Level: Bypass

---

## Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project" and name it `acadivo-prod`
3. Enable Google Analytics (optional)

### Add Android App

1. Project Settings > Add App > Android
2. Package name: `com.acadivo.app`
3. Download `google-services.json`
4. Place in `apps/mobile/android/app/`

### Add iOS App

1. Project Settings > Add App > iOS
2. Bundle ID: `com.acadivo.app`
3. Download `GoogleService-Info.plist`
4. Place in `apps/mobile/ios/Runner/`

### Enable Cloud Messaging

1. Go to Project Settings > Cloud Messaging
2. Note the **Server Key**
3. Go to Service Accounts > Generate New Private Key
4. Download the JSON credentials file
5. Set `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` in `.env`

### Firebase Admin SDK Setup

```bash
# Convert private key for .env
cat your-firebase-credentials.json | jq -r '.private_key'
# Copy the output (with \n preserved) into FIREBASE_PRIVATE_KEY
```

---

## SMS Gateway Setup

### Twilio (International)

```bash
# Set in .env
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### JazzCash (Pakistan)

1. Register at [JazzCash Business](https://business.jazzcash.com.pk)
2. Obtain API credentials
3. Set in .env:

```bash
SMS_JAZZ_API=https://jazzsms.com/api/send
SMS_JAZZ_API_KEY=your-jazz-api-key
SMS_JAZZ_MERCHANT_ID=your-merchant-id
```

### Zong (Pakistan)

1. Register at [Zong Business](https://zong.com.pk/business)
2. Obtain API credentials
3. Set in .env:

```bash
SMS_ZONG_API=https://zongsms.com/api/send
SMS_ZONG_API_KEY=your-zong-api-key
```

---

## Email Service Setup

### SendGrid (Recommended)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API Key with "Mail Send" permissions
3. Verify sender identity (domain or single sender)
4. Configure in `.env`:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Gmail SMTP (Development Only)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

---

## Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard and note:
   - Cloud Name
   - API Key
   - API Secret
3. Configure in `.env`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET=your-secret
```

4. Create upload presets:
   - `avatars` — Image only, 5MB max
   - `homework` — All files, 20MB max
   - `receipts` — PDF only, 5MB max

---

## Monitoring and Logging

### Winston Logger Configuration

The API uses Winston for structured logging:

```javascript
// packages/api/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Health Check Endpoint

```http
GET /api/health

Response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "database": "connected",
      "redis": "connected",
      "uptime": 86400
    }
  }
}
```

### Log Rotation

```bash
# Install logrotate if not present
sudo apt install logrotate -y

# Create config
sudo tee /etc/logrotate.d/acadivo << 'EOF'
/opt/acadivo/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        /usr/bin/docker kill --signal="USR1" acadivo-api
    endscript
}
EOF
```

---

## Backup Strategy

### Automated PostgreSQL Backups

Create backup script at `/opt/acadivo/scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/acadivo/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="acadivo_prod"
RETENTION_DAYS=30

# Create backup
docker exec acadivo-postgres pg_dump -U acadivo $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/db_$DATE.sql.gz" s3://acadivo-backups/

# Delete old backups
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
```

### Cron Job

```bash
# Run backup daily at 2 AM
0 2 * * * /opt/acadivo/scripts/backup.sh >> /var/log/acadivo-backup.log 2>&1
```

### Restore from Backup

```bash
# Restore database
gunzip < /opt/acadivo/backups/db_20240115_020000.sql.gz | docker exec -i acadivo-postgres psql -U acadivo -d acadivo_prod
```

---

## Scaling Strategy

### Horizontal Scaling with Docker Swarm

```bash
# Initialize Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml acadivo

# Scale API to 3 instances
docker service scale acadivo_api=3

# Scale Socket to 2 instances
docker service scale acadivo_socket=2
```

### Redis Adapter for Socket.io

When running multiple Socket.io nodes, use Redis Adapter:

```javascript
// packages/socket/src/index.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const io = new Server();

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Read Replicas for PostgreSQL

For read-heavy workloads, configure read replicas:

```bash
# Prisma read replica setup
# packages/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

---

## Cost Estimation

### DigitalOcean (Recommended for Pakistan)

| Service | Specs | Monthly Cost |
|---------|-------|-------------|
| Droplet (API + Web) | 4 vCPU, 8GB RAM | $48 |
| Droplet (Database) | 2 vCPU, 4GB RAM | $24 |
| Droplet (Redis) | 1 vCPU, 1GB RAM | $6 |
| Spaces (S3-like) | 250GB + 1TB transfer | $5 |
| Load Balancer | - | $12 |
| **Total** | | **~$95/month** |

### AWS

| Service | Specs | Monthly Cost |
|---------|-------|-------------|
| EC2 (API + Web) | t3.medium | ~$33 |
| RDS PostgreSQL | db.t3.medium | ~$52 |
| ElastiCache Redis | cache.t3.micro | ~$13 |
| S3 Storage | 250GB | ~$6 |
| ALB Load Balancer | - | ~$16 |
| **Total** | | **~$120/month** |

### External Services

| Service | Monthly Cost |
|---------|-------------|
| Cloudflare Pro | $20 |
| Cloudinary | Free tier (25GB) |
| Firebase Cloud Messaging | Free |
| SendGrid | Free tier (100/day) |
| Twilio SMS | Pay-as-you-go |
| Domain (.com.pk) | ~$10/year |

---

*For local development setup, see [SETUP.md](./SETUP.md).*
*For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
