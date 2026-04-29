# Acadivo Architecture Document

This document describes the architecture of the Acadivo platform. It is intended for developers, DevOps engineers, and technical decision-makers.

---

## Table of Contents

- [System Overview](#system-overview)
- [Multi-Tenancy Strategy](#multi-tenancy-strategy)
- [Authentication Flow](#authentication-flow)
- [Authorization (RBAC)](#authorization-rbac)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Communication Architecture](#communication-architecture)
- [Database Schema Overview](#database-schema-overview)
- [Deployment Architecture](#deployment-architecture)
- [Security Measures](#security-measures)
- [Scalability Considerations](#scalability-considerations)

---

## System Overview

Acadivo is a multi-tenant SaaS education management platform serving Pakistani schools, colleges, and institutes. It provides role-based dashboards for six user types across web and mobile applications.

### High-Level Architecture

```
                    +------------------+
                    |   Load Balancer  |
                    |     (Nginx)      |
                    +--------+---------+
                             |
           +-----------------+-----------------+
           |                 |                 |
    +------v------+  +-------v-------+  +------v------+
    |   Web App   |  |  Mobile App   |  |   CDN       |
    |  (Next.js)  |  |   (Flutter)   |  | (Static)    |
    +------+------+  +-------+-------+  +------+------+
           |                 |                 |
           +-----------------+-----------------+
                             | HTTPS / WSS
                    +--------v---------+
                    |   API Gateway    |
                    |    (Nginx)       |
                    +--------+---------+
                             |
           +-----------------+-----------------+
           |                 |                 |
    +------v------+  +-------v-------+  +------v------+
    |  REST API   |  |  Socket.io    |  |  Admin      |
    |  (Express)  |  |   Server      |  |  Panel      |
    +------+------+  +-------+-------+  +-------------+
           |                 |
           +-----------------+
                             |
           +-----------------+-----------------+
           |                 |                 |
    +------v------+  +-------v-------+  +------v------+
    | PostgreSQL  |  |    Redis      |  | Cloudinary  |
    |   (Prisma)  |  | (Cache/PubSub)|  |  (Files)    |
    +-------------+  +---------------+  +-------------+
```

### Service Responsibilities

| Service | Technology | Responsibility |
|---------|-----------|--------------|
| Web Application | Next.js 14 | SSR React frontend, role-based routing, i18n |
| Mobile Application | Flutter 3.x | Cross-platform iOS/Android app with offline support |
| REST API | Express + TypeScript | Business logic, CRUD operations, file handling |
| Socket Server | Socket.io + Redis | Real-time messaging, notifications, presence |
| Database | PostgreSQL 15 | Persistent data storage with Prisma ORM |
| Cache | Redis 7 | Sessions, rate limiting, pub/sub for sockets |
| File Storage | Cloudinary | Image/document uploads with transformation |
| Push Notifications | Firebase | Mobile push notification delivery |

---

## Multi-Tenancy Strategy

Acadivo uses a **shared database, tenant-isolated rows** approach. This provides the best balance of cost efficiency and data isolation for the Pakistani education market.

### Architecture

```
+----------------------------------------------------------+
|                   PostgreSQL Database                     |
|                                                          |
|  +----------------+  +----------------+  +---------------+ |
|  |   Tenant A     |  |   Tenant B     |  |  Tenant C    | |
|  | (Govt School)  |  | (Private Coll) |  | (University) | |
|  +----------------+  +----------------+  +---------------+ |
|                                                          |
|  All data in shared tables with tenantId column          |
|  Row-level security enforced at application layer         |
+----------------------------------------------------------+
```

### Tenant Isolation Mechanism

Every database table (except platform-level tables like `SubscriptionPlan` and `Advertisement`) contains a `tenantId` column. All queries automatically include `WHERE tenantId = ?` through Prisma middleware.

```typescript
// Prisma middleware example
prisma.$use(async (params, next) => {
  if (params.model && params.args) {
    const tenantModels = ['User', 'Student', 'Teacher', 'Class', 'Attendance'];
    if (tenantModels.includes(params.model) && !params.args.where?.tenantId) {
      params.args.where = {
        ...params.args.where,
        tenantId: getCurrentTenantId(),
      };
    }
  }
  return next(params);
});
```

### Tenant Model

| Field | Description |
|-------|-------------|
| `id` | UUID primary key |
| `name` | School/College name |
| `code` | Unique identifier (e.g., "gps-islamabad-001") |
| `type` | SCHOOL / COLLEGE / UNIVERSITY |
| `status` | ACTIVE / SUSPENDED / PENDING |
| `subscriptionPlan` | FREE / BASIC / STANDARD / PREMIUM |
| `maxTeachers` | Teacher limit based on plan |
| `maxStudents` | Student limit based on plan |

### Tenant Provisioning Flow

```
Super Admin creates tenant
        |
        v
Tenant created with PENDING status
        |
        v
Super Admin activates tenant
        |
        v
Principal account auto-created
        |
        v
Principal logs in and completes setup
        |
        v
School Admin, Teachers, Students added
```

---

## Authentication Flow

Acadivo implements a secure, multi-layered authentication system.

### Login Flow

```
User enters credentials (email + password + tenant code)
        |
        v
API validates credentials against bcrypt hash
        |
        v
If 2FA enabled -> Send OTP to phone/email
        |
        v
User enters OTP
        |
        v
API issues JWT (15min) + Refresh Token (7 days)
        |
        v
Client stores tokens (HTTP-only cookie for web,
secure storage for mobile)
```

### Token Structure

**Access Token (JWT)**
```json
{
  "sub": "user-uuid",
  "role": "TEACHER",
  "tenantId": "tenant-uuid",
  "iat": 1704067200,
  "exp": 1704068100
}
```

**Refresh Token**
```json
{
  "sub": "user-uuid",
  "tokenId": "refresh-token-uuid",
  "exp": 1704672000
}
```

### 2FA / OTP Flow

```
Login with credentials
        |
        v
If 2FA enabled:
  - Generate 6-digit OTP
  - Send via SMS (Twilio/JazzCash/Zong)
  - Or send via email
  - Store hashed OTP in Redis (5 min expiry)
        |
        v
User submits OTP
        |
        v
Verify OTP against Redis
        |
        v
Issue JWT + Refresh Token
```

### Password Reset Flow

```
User clicks "Forgot Password"
        |
        v
Enter email + tenant code
        |
        v
API sends reset link (token expires in 1 hour)
        |
        v
User clicks link and sets new password
        |
        v
Invalidate all existing sessions
```

---

## Authorization (RBAC)

Acadivo uses Role-Based Access Control with six roles. Each role has specific permissions.

### Role Hierarchy

```
SUPER_ADMIN (Platform level)
    |
    +-- PRINCIPAL (School level)
    |       |
    |       +-- ADMIN (School operations)
    |       |       |
    |       |       +-- TEACHER (Classroom)
    |       |       |       |
    |       |       |       +-- STUDENT (Self only)
    |       |       |       |
    |       |       |       +-- PARENT (Children only)
```

### RBAC Permission Matrix

| Feature | SUPER_ADMIN | PRINCIPAL | ADMIN | TEACHER | STUDENT | PARENT |
|---------|:-----------:|:---------:|:-----:|:-------:|:-------:|:------:|
| **Platform Management** |||||||
| Manage tenants/schools | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View platform analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage subscription plans | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage advertisements | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Platform announcements | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **School Management** |||||||
| School settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View school overview | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage users (all roles) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage classes/sections | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage subjects | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Build timetable | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Fee Management** |||||||
| Create fee structures | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View fee records | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Record fee payments | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Pay fee online | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Attendance** |||||||
| Mark attendance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View own attendance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View class attendance | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Homework** |||||||
| Create homework | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Submit homework | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Grade submissions | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View homework | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Marks & Results** |||||||
| Enter marks | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View own marks | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Generate results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View results | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Communication** |||||||
| Send announcements | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Send messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Request reports | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Generate reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Q&A forum | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Advertisements** |||||||
| Create ads | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View ads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Middleware Implementation

```typescript
// Role-based access middleware
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Required role: ${roles.join(' or ')}, got: ${req.user.role}`,
      });
    }
    next();
  };
};
```

---

## Data Flow Diagrams

### Attendance Marking Flow

```
Teacher opens attendance page
        |
        v
API: GET /api/teacher/classes (fetch assigned classes)
        |
        v
Teacher selects class + section + date
        |
        v
API: GET /api/teacher/students?classId=X&sectionId=Y
        |
        v
Teacher marks PRESENT / ABSENT / LATE for each student
        |
        v
API: POST /api/teacher/attendance (bulk insert)
        |
        v
Socket.io emits: attendance:marked
        |
        v
Students & Parents receive push notification
```

### Fee Payment Flow

```
Parent views fee records
        |
        v
API: GET /api/parent/fee-records
        |
        v
Parent selects unpaid fee
        |
        v
API: POST /api/parent/fee/initiate-payment
        |
        v
Gateway: JazzCash / EasyPaisa / Bank Transfer
        |
        v
Payment callback: POST /api/webhooks/payment-callback
        |
        v
API: Updates fee record status -> PAID
        |
        v
Socket.io + Push: Payment confirmation to parent
        |
        v
PDF receipt generated and available for download
```

### Homework Assignment Flow

```
Teacher creates homework
        |
        v
API: POST /api/teacher/homework
        |
        v
Students in class receive notification
        |
        v
Student uploads submission + files
        |
        v
API: POST /api/student/homework/:id/submit
        |
        v
Files uploaded to Cloudinary
        |
        v
Teacher views submissions
        |
        v
Teacher grades and provides feedback
        |
        v
API: PATCH /api/teacher/homework/:id/grade
        |
        v
Student receives result notification
```

---

## Communication Architecture

### Three-Layer Communication

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATION                     │
│            (Web: Socket.io-client | Mobile: FCM)          │
└─────────────────────────────────────────────────────────┘
                            |
           ┌────────────────┼────────────────┐
           |                |                |
    +------v-------+ +------v-------+ +------v-------+
    |  REST API    | |  Socket.io   | |  Push (FCM)  |
    |  (Request/   | |  (Real-time  | |  (Background |
    |   Response)  | |   Events)     | |   Alerts)    |
    +------+-------+ +------+-------+ +------+-------+
           |                |                |
           +----------------+----------------+
                            |
                    +-------v--------+
                    |    Redis       |
                    |  (Pub/Sub)     |
                    +----------------+
```

### REST API
- Standard HTTP methods (GET, POST, PATCH, DELETE)
- JSON request/response format
- Bearer token authentication
- Rate limiting per IP and per user

### Socket.io Events
- `connection`: User connects with JWT
- `message:send`: Send real-time chat message
- `message:read`: Mark messages as read
- `notification:new`: New notification received
- `attendance:marked`: Attendance updated
- `homework:assigned`: New homework notification
- `fee:paid`: Payment confirmation
- `announcement:new`: New announcement posted
- `typing`: Typing indicators in chat
- `presence`: User online/offline status

### Push Notifications (FCM)
- Triggered by API events via Firebase Admin SDK
- Delivered to mobile app in background
- Categories: announcement, message, fee_due, attendance_alert, homework, result

### SMS Notifications
- Triggered for critical events only
- Gateways: Twilio (international), JazzCash API, Zong API (Pakistan)
- Events: OTP, fee reminder, emergency announcement

---

## Database Schema Overview

Acadivo uses PostgreSQL with Prisma ORM. The schema contains **33 models** organized into logical groups.

### Entity Relationship Overview

```
Tenant (1)
  |
  +-- User (N) [Principal, Admin, Teacher, Student, Parent]
  |
  +-- Class (N)
  |     +-- Section (N)
  |     +-- ClassSchedule (N)
  |
  +-- Subject (N)
  |     +-- TeacherSubject (junction)
  |
  +-- Attendance (N)
  +-- Homework (N) -> HomeworkSubmission (N)
  +-- Mark (N)
  +-- Result (N) -> ResultDetail (N)
  +-- FeeStructure (N) -> FeeRecord (N)
  +-- Message (N)
  +-- Notification (N)
  +-- Announcement (N)
  +-- ReportRequest (N)
  +-- Setting (N)
  +-- GradingScheme (N)
  +-- SchoolSubscription (N)
  +-- AuditLog (N)

Advertisement (platform-level)
  +-- AdImpression (N)

SubscriptionPlan (platform-level)
  +-- SchoolSubscription (N)
```

For the complete schema documentation, see [DATABASE.md](./DATABASE.md).

---

## Deployment Architecture

### Development Environment

```
Developer Machine
  |
  +-- Docker Compose
  |     +-- PostgreSQL (port 5432)
  |     +-- Redis (port 6379)
  |
  +-- Next.js Dev Server (port 3000)
  +-- Express API (port 5000)
  +-- Socket.io Server (port 5001)
  +-- Flutter Dev (emulator/device)
```

### Production Environment

```
                         ┌─────────────┐
                         │   Users     │
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │ Cloudflare  │
                         │   CDN/DNS   │
                         └──────┬──────┘
                                │
                    ┌───────────▼──────────┐
                    │   Nginx (SSL/Proxy)  │
                    │  acadivo.com.pk      │
                    └───────────┬────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │  Web App    │    │   API       │    │  Socket     │
    │  Container  │    │  Container  │    │  Container  │
    │  (Port 3000)│    │  (Port 5000)│    │ (Port 5001) │
    └─────────────┘    └──────┬──────┘    └─────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
             ┌──────▼──────┐   ┌───────▼─────┐
             │ PostgreSQL  │   │   Redis     │
             │  (Primary)  │   │  (Cluster)  │
             └─────────────┘   └─────────────┘
```

### Docker Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `web` | Custom Next.js | 3000 | Web frontend |
| `api` | Custom Express | 5000 | REST API |
| `socket` | Custom Socket.io | 5001 | Real-time server |
| `postgres` | postgres:15 | 5432 | Database |
| `redis` | redis:7 | 6379 | Cache |
| `nginx` | nginx:alpine | 80/443 | Reverse proxy |

---

## Security Measures

### Authentication Security
- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days, stored hashed in database
- Account lockout after 5 failed login attempts
- 2FA with TOTP and SMS OTP support

### Data Security
- All API traffic over HTTPS (TLS 1.3)
- Database connections encrypted with SSL
- File uploads scanned for malware
- Sensitive data (CNIC, phone) encrypted at rest

### Application Security
- Rate limiting: 100 requests per 15 minutes per IP
- Rate limiting: 1000 requests per hour per user
- Helmet.js for security headers
- CORS configured for allowed origins only
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM (parameterized queries)
- XSS prevention with Content Security Policy
- CSRF tokens for state-changing operations

### Audit & Monitoring
- All CRUD operations logged to `AuditLog` table
- Login history tracked with IP, device, location
- Failed login attempts monitored
- Real-time security alerts for suspicious activity

For complete security details, see [SECURITY.md](./SECURITY.md).

---

## Scalability Considerations

### Horizontal Scaling

```
                    ┌───────────────┐
                    │ Load Balancer │
                    │   (Nginx)     │
                    └───────┬───────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐ ┌───────▼──────┐ ┌──────▼──────┐
    │  API Node 1 │ │  API Node 2  │ │  API Node N │
    │  (Docker)   │ │   (Docker)   │ │   (Docker)  │
    └──────┬──────┘ └───────┬──────┘ └──────┬──────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Redis Cluster  │
                    │  (Pub/Sub +    │
                    │   Sessions)    │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │ PostgreSQL     │
                    │ (Primary +     │
                    │  Read Replica) │
                    └────────────────┘
```

### Scaling Strategies

| Component | Scaling Strategy |
|-----------|-----------------|
| **API Servers** | Horizontal scaling with Docker Swarm / Kubernetes. Stateless design allows easy replication. |
| **Socket.io** | Redis Adapter enables multi-node Socket.io cluster. All nodes share events via Redis Pub/Sub. |
| **Database** | Read replicas for SELECT queries. Connection pooling via PgBouncer. |
| **Cache** | Redis Cluster for automatic sharding and failover. |
| **File Storage** | Cloudinary handles scaling automatically. CDN for fast delivery. |
| **Static Assets** | Next.js static files served via CDN. |

### Performance Optimizations
- Database query result caching in Redis (5-minute TTL)
- Prisma connection pooling (max 20 connections)
- API response compression with gzip
- Image optimization via Cloudinary transformations
- Pagination on all list endpoints (default 20 items, max 100)
- Debounced search queries
- Lazy loading for mobile app screens

---

*For the complete API reference, see [API.md](./API.md).*
*For setup instructions, see [SETUP.md](./SETUP.md).*
*For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).*
