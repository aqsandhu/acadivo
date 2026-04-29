# Acadivo

<!-- Logo placeholder -->
<p align="center">
  <img src="./docs/assets/logo.png" alt="Acadivo Logo" width="200" />
</p>

<p align="center">
  <strong>Multi-tenant SaaS EdTech platform for Pakistani schools, colleges, and institutes</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status" /></a>
  <a href="#"><img src="https://img.shields.io/badge/tests-passing-brightgreen" alt="Tests" /></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-20+-green" alt="Node.js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-15-blue" alt="PostgreSQL" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Flutter-3.x-blue" alt="Flutter" /></a>
</p>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Documentation](#documentation)
- [Team](#team)
- [License](#license)

---

## Features

Acadivo is a complete school management system with role-based access for 6 user types:

### Platform Management
- **Multi-tenancy**: Each school/college is an isolated tenant
- **Subscription plans**: Free, Basic, Standard, Premium tiers
- **Advertisement system**: Targeted ads by city, school type, and user role
- **Platform analytics**: Usage statistics and engagement metrics
- **Announcement broadcasts**: Platform-wide announcements to all schools

### School Administration
- **User management**: Add/edit teachers, students, parents, admins
- **Class & section management**: Create classes with multiple sections
- **Subject management**: Assign subjects to classes and teachers
- **Timetable builder**: Drag-and-drop weekly schedule for each class
- **Fee management**: Fee structures, records, discounts, and payment tracking
- **Grading schemes**: Customizable grade boundaries per school
- **School settings**: Academic year, school info, preferences

### Teacher Features
- **Attendance marking**: Daily or period-wise attendance for classes
- **Homework management**: Create, assign, and grade homework
- **Marks entry**: Subject-wise marks with automatic grade calculation
- **Q&A forum**: Answer student and parent questions
- **Report generation**: Progress, attendance, and behavior reports
- **Messaging**: Direct chat with students, parents, and colleagues
- **Timetable view**: Personal weekly teaching schedule

### Student Features
- **Timetable view**: Weekly class schedule
- **Homework submission**: Upload assignments before due dates
- **Marks viewing**: Subject-wise marks and overall results
- **Attendance tracking**: View attendance history and percentages
- **Q&A forum**: Ask teachers academic questions
- **Messaging**: Chat with teachers and school admin
- **Notifications**: Fee dues, homework, timetable changes

### Parent Features
- **Child progress**: View attendance, marks, homework, and results
- **Fee payment**: View fee records and pay via JazzCash / EasyPaisa
- **Report requests**: Request detailed reports from class teachers
- **Q&A forum**: Ask teachers questions about child progress
- **Messaging**: Direct communication with teachers and admin
- **Announcements**: Stay updated with school notices

### Communication
- **Real-time messaging**: Socket.io powered chat with read receipts
- **Push notifications**: Firebase Cloud Messaging for mobile
- **SMS alerts**: Twilio and Pakistan telecom gateways for important alerts
- **Announcements**: Noticeboard with priority levels and target audiences
- **Notification center**: Centralized notification history

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web App** | Next.js 14, React 18, TypeScript, Tailwind CSS | Frontend web application |
| **Mobile App** | Flutter 3.x, Dart | Android + iOS application |
| **API Server** | Node.js 20, Express 4, TypeScript | REST API |
| **Real-time** | Socket.io 4, Redis Pub/Sub | Live chat and notifications |
| **Database** | PostgreSQL 15, Prisma 5 ORM | Primary data store |
| **Cache** | Redis 7 | Sessions, rate limiting, pub/sub |
| **Auth** | JWT, Passport.js, bcrypt | Authentication & authorization |
| **File Storage** | Cloudinary | Images and document uploads |
| **Push Notifications** | Firebase Cloud Messaging | Mobile push alerts |
| **SMS** | Twilio, JazzCash API, Zong API | SMS alerts for Pakistan |
| **Email** | SMTP / SendGrid | Email notifications |
| **Monorepo** | Turborepo, pnpm workspaces | Code organization |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Container** | Docker, Docker Compose | Development & production |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Web App    │  │ Flutter App  │  │   Web App    │                   │
│  │  (Next.js)   │  │ (Android/iOS)│  │   (Admin)    │                   │
│  │   Port 3000  │  │   Port N/A   │  │   Port 3000  │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼─────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────▼───────────────────────────────────────────┐
│                         REVERSE PROXY                                   │
│                           Nginx                                         │
│                    SSL Termination / Load Balancing                       │
└───────────────────────────┬───────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
┌─────────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
│   REST API       │ │  Socket.io   │ │  Static Assets │
│  (Express)       │ │   Server     │ │   (CDN)        │
│   Port 5000      │ │  Port 5001   │ │                │
└─────────┬────────┘ └──────┬───────┘ └────────────────┘
          │                 │
          └─────────────────┼─────────────────┐
                            │                 │
┌───────────────────────────▼────────┐ ┌──────▼────────┐
│         PostgreSQL 15              │ │  Redis 7     │
│     (Prisma ORM)                   │ │  (Cache/     │
│                                    │ │   Pub-Sub)   │
└────────────────────────────────────┘ └─────────────┘
```

**Multi-tenancy**: Shared database with `tenantId` column on every table. Row-level security ensures complete data isolation between schools.

---

## Quick Start

Get Acadivo running locally in 3 steps:

### Step 1: Clone & Install

```bash
git clone https://github.com/acadivo/acadivo.git
cd acadivo
pnpm install
```

### Step 2: Start Infrastructure

```bash
cd docker && docker-compose up -d postgres redis
```

### Step 3: Setup Database & Run

```bash
# Copy environment file
cp .env.example .env

# Generate Prisma client and run migrations
cd packages/api && npx prisma migrate dev && npx prisma generate

# Seed the database
npx prisma db seed

# Start all services
pnpm dev
```

**Services will be available at:**
- Web App: http://localhost:3000
- API Server: http://localhost:5000
- Socket Server: http://localhost:5001
- Prisma Studio: http://localhost:5555

For the complete setup guide, see [docs/SETUP.md](./docs/SETUP.md).

---

## Project Structure

```
acadivo/
├── apps/
│   ├── web/                    # Next.js 14 web application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router pages
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── context/       # React contexts (Auth, Socket, Notifications)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── services/      # API service layer
│   │   │   ├── i18n/          # English + Urdu translations
│   │   │   └── types/         # TypeScript type definitions
│   │   ├── next.config.js
│   │   └── package.json
│   └── mobile/                 # Flutter 3.x mobile app
│       ├── lib/
│       │   ├── screens/       # UI screens per role
│       │   ├── services/      # API & local services
│       │   ├── models/        # Data models
│       │   ├── providers/     # State management
│       │   ├── widgets/       # Reusable widgets
│       │   └── utils/         # Helpers & validators
│       ├── assets/languages/  # en.json, ur.json
│       └── pubspec.yaml
├── packages/
│   ├── api/                    # Node.js + Express REST API
│   │   ├── src/
│   │   │   ├── routes/        # API route handlers
│   │   │   ├── controllers/   # Business logic controllers
│   │   │   ├── middleware/    # Auth, validation, rate limiting
│   │   │   ├── services/      # Service layer
│   │   │   └── utils/         # Helpers, email, SMS
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema (33 models)
│   │   │   └── seed.ts        # Database seeding
│   │   └── package.json
│   ├── shared/                 # Shared types, constants, validation schemas
│   └── socket/                 # Socket.io real-time server
│       ├── src/
│       │   └── index.ts       # Socket event handlers
│       └── package.json
├── docker/                     # Docker Compose configurations
│   ├── docker-compose.yml     # Development stack
│   └── docker-compose.prod.yml # Production stack
├── scripts/
│   └── setup.sh               # One-command setup script
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SETUP.md
│   ├── DEPLOYMENT.md
│   ├── MOBILE_SETUP.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   ├── DATABASE.md
│   ├── CHANGELOG.md
│   └── USER_GUIDES/
│       ├── SUPER_ADMIN_GUIDE.md
│       ├── PRINCIPAL_GUIDE.md
│       ├── ADMIN_GUIDE.md
│       ├── TEACHER_GUIDE.md
│       ├── STUDENT_GUIDE.md
│       └── PARENT_GUIDE.md
├── .env.example
├── package.json
├── turbo.json
└── README.md
```

---

## Screenshots

> Place your actual screenshots in the paths below.

### Super Admin Dashboard
![Super Admin Dashboard](./docs/assets/screenshots/super-admin-dashboard.png)
*Platform-wide analytics, school management, and subscription control.*

### Principal Dashboard
![Principal Dashboard](./docs/assets/screenshots/principal-dashboard.png)
*School overview, announcements, attendance summary, and messaging.*

### School Admin Dashboard
![Admin Dashboard](./docs/assets/screenshots/admin-dashboard.png)
*User management, fee collection, timetable builder, and class management.*

### Teacher Dashboard
![Teacher Dashboard](./docs/assets/screenshots/teacher-dashboard.png)
*Attendance marking, homework creation, marks entry, and Q&A.*

### Student Dashboard
![Student Dashboard](./docs/assets/screenshots/student-dashboard.png)
*Timetable, homework submissions, marks, and results.*

### Parent Dashboard
![Parent Dashboard](./docs/assets/screenshots/parent-dashboard.png)
*Child progress, fee payment, report requests, and messaging.*

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture, multi-tenancy, auth flow, RBAC, data flow, deployment |
| [API.md](./docs/API.md) | Complete API reference with endpoints, request/response examples, WebSocket events |
| [SETUP.md](./docs/SETUP.md) | Local development setup guide with prerequisites and troubleshooting |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Production deployment with Docker, SSL, Nginx, monitoring, backups |
| [MOBILE_SETUP.md](./docs/MOBILE_SETUP.md) | Flutter SDK setup, Firebase configuration, build and deployment |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Code of conduct, branch naming, commit conventions, PR template |
| [SECURITY.md](./docs/SECURITY.md) | Authentication, encryption, tenant isolation, rate limiting, audit logs |
| [DATABASE.md](./docs/DATABASE.md) | Schema overview, all 33 tables, relationships, indexing strategy |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Version history, features, known issues, and roadmap |

### User Guides

| Guide | For |
|-------|-----|
| [Super Admin Guide](./docs/USER_GUIDES/SUPER_ADMIN_GUIDE.md) | Platform administrators |
| [Principal Guide](./docs/USER_GUIDES/PRINCIPAL_GUIDE.md) | School principals and heads |
| [Admin Guide](./docs/USER_GUIDES/ADMIN_GUIDE.md) | School administrators and clerks |
| [Teacher Guide](./docs/USER_GUIDES/TEACHER_GUIDE.md) | Teaching staff |
| [Student Guide](./docs/USER_GUIDES/STUDENT_GUIDE.md) | Students |
| [Parent Guide](./docs/USER_GUIDES/PARENT_GUIDE.md) | Parents and guardians |

---

## Team

Acadivo is built and maintained by a dedicated team of developers and education technology enthusiasts.

| Name | Role | Contact |
|------|------|---------|
| Core Team | Platform Development | dev@acadivo.com |

We welcome contributions! See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

---

## License

MIT License

Copyright (c) 2024 Acadivo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<p align="center">
  <strong>Built for Pakistani Education</strong>
</p>
