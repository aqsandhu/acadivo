# Acadivo Security Document

This document describes the security architecture, measures, and policies of the Acadivo platform.

---

## Table of Contents

- [Authentication Mechanisms](#authentication-mechanisms)
- [Authorization Matrix](#authorization-matrix)
- [Data Encryption](#data-encryption)
- [Tenant Isolation](#tenant-isolation)
- [Rate Limiting](#rate-limiting)
- [Input Validation](#input-validation)
- [XSS and CSRF Protection](#xss-and-csrf-protection)
- [SQL Injection Prevention](#sql-injection-prevention)
- [Security Headers](#security-headers)
- [Audit Logging](#audit-logging)
- [Incident Response Plan](#incident-response-plan)
- [Responsible Disclosure](#responsible-disclosure)

---

## Authentication Mechanisms

### Password Security

- **Hashing Algorithm**: bcrypt with cost factor 12
- **Minimum Requirements**:
  - 8 characters minimum
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password History**: Last 5 passwords cannot be reused
- **Expiry**: Optional password expiry policy (configurable per school)

### JWT Token Security

| Token Type | Expiry | Storage |
|------------|--------|---------|
| Access Token | 15 minutes | HTTP-only cookie (web) / Secure storage (mobile) |
| Refresh Token | 7 days | Database (hashed) + HTTP-only cookie |

```typescript
// JWT signing
const accessToken = jwt.sign(
  { sub: user.id, role: user.role, tenantId: user.tenantId },
  process.env.JWT_SECRET,
  { expiresIn: '15m', algorithm: 'HS256' }
);
```

### Two-Factor Authentication (2FA)

- **TOTP**: Time-based One-Time Password using authenticator apps (Google Authenticator, Authy)
- **SMS OTP**: 6-digit code sent via SMS, valid for 5 minutes
- **Recovery Codes**: 10 single-use recovery codes generated during 2FA setup

### Account Security

| Feature | Implementation |
|---------|---------------|
| Account Lockout | 5 failed attempts = 30-minute lockout |
| Login History | IP, user agent, device, location, timestamp |
| Concurrent Sessions | Max 5 active sessions per user |
| Session Expiry | Automatic logout after 24 hours of inactivity |
| Password Reset | Secure token (1-hour expiry) sent via email |

---

## Authorization Matrix

### Role Hierarchy and Permissions

```
SUPER_ADMIN
  ├── Full platform access
  ├── All tenant data read access
  └── Cannot be deleted

PRINCIPAL (per tenant)
  ├── School-wide read access
  ├── Announcement creation
  ├── Message all roles
  └── Read-only on admin-managed data

ADMIN (per tenant)
  ├── CRUD on users, classes, subjects
  ├── Fee management
  ├── Timetable management
  └── Report generation

TEACHER (per tenant)
  ├── Attendance marking (assigned classes)
  ├── Homework creation (assigned subjects)
  ├── Marks entry (assigned subjects)
  ├── Q&A answering
  └── Messaging

STUDENT (per tenant, self only)
  ├── View own timetable
  ├── Submit homework
  ├── View own marks and results
  ├── View own attendance
  └── Ask questions

PARENT (per tenant, children only)
  ├── View children's data
  ├── Pay fees
  ├── Request reports
  ├── Ask questions
  └── Messaging
```

### Middleware Chain

```typescript
// Example: Teacher-only route
app.post('/api/teacher/marks',
  authenticateJWT,        // Verify token
  requireTenant,        // Extract and validate tenant
  requireRole('TEACHER', 'ADMIN', 'PRINCIPAL'),  // Check role
  validateBody(markSchema),  // Validate input
  rateLimit('marks'),   // Apply rate limit
  async (req, res) => { ... }
);
```

---

## Data Encryption

### Encryption in Transit

- **Protocol**: TLS 1.3
- **Certificate**: Let's Encrypt (auto-renewing)
- **HSTS**: max-age=31536000; includeSubDomains; preload
- **Cipher Suites**: ECDHE with AES-128-GCM or AES-256-GCM

### Encryption at Rest

| Data Type | Encryption Method |
|-----------|-------------------|
| Passwords | bcrypt hashing |
| Refresh Tokens | SHA-256 hashing |
| 2FA Secrets | AES-256 encryption |
| CNIC Numbers | AES-256 encryption |
| Phone Numbers | AES-256 encryption |
| API Keys | AES-256 encryption |
| Database | PostgreSQL SSL connections |
| Backups | GPG encrypted before upload |

### Key Management

- Encryption keys stored in environment variables
- Separate keys for different purposes (JWT, 2FA, database)
- Key rotation policy: every 90 days
- Old keys retained for 30 days after rotation

---

## Tenant Isolation

### Shared Database, Isolated Rows

Every table (except platform-level tables) contains a `tenantId` column. All queries automatically filter by the current tenant.

```typescript
// Prisma middleware for tenant isolation
prisma.$use(async (params, next) => {
  if (params.model && !isPlatformModel(params.model)) {
    const tenantId = getCurrentTenantId();
    
    if (params.args?.where) {
      params.args.where.tenantId = tenantId;
    } else {
      params.args = { ...params.args, where: { tenantId } };
    }
  }
  return next(params);
});
```

### Tenant Validation

```typescript
// Every authenticated request includes tenant validation
const validateTenantAccess = (req, res, next) => {
  const userTenantId = req.user.tenantId;
  const requestedTenantId = req.params.tenantId || req.body.tenantId;
  
  if (requestedTenantId && requestedTenantId !== userTenantId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
};
```

### Data Leak Prevention

- API responses never include `tenantId` field to clients
- Error messages do not expose tenant information
- Logs do not include sensitive tenant data
- Database backups are encrypted and separated by tenant

---

## Rate Limiting

### Tiered Rate Limiting

| Tier | Window | Max Requests | Applies To |
|------|--------|-------------|------------|
| **Auth** | 1 minute | 5 | Login, forgot password, OTP |
| **General** | 15 minutes | 100 | All authenticated API calls |
| **Upload** | 1 hour | 10 | File uploads |
| **Messaging** | 1 minute | 50 | Send message, create post |
| **Export** | 1 hour | 5 | Report/PDF generation |

### Implementation

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});
```

---

## Input Validation

### Validation Strategy

All user input is validated using Zod schemas before processing.

```typescript
import { z } from 'zod';

const createStudentSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+92-\d{3}-\d{7}$/),
  rollNumber: z.string().min(1).max(20),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  guardianName: z.string().min(2).max(100),
  guardianPhone: z.string().regex(/^\+92-\d{3}-\d{7}$/),
  guardianCNIC: z.string().regex(/^\d{5}-\d{7}-\d$/).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});
```

### Sanitization

- All strings are trimmed before validation
- HTML is escaped in text fields
- File names are sanitized before storage
- No raw user input is ever logged

---

## XSS and CSRF Protection

### XSS Prevention

| Measure | Implementation |
|---------|---------------|
| Content Security Policy | `default-src 'self'; script-src 'self';` |
| Output Encoding | All dynamic content escaped in React/Next.js |
| Input Sanitization | DOMPurify for any HTML content |
| Cookie Flags | `HttpOnly`, `Secure`, `SameSite=Strict` |

### CSRF Protection

```typescript
// CSRF token middleware
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply to state-changing routes
app.post('/api/auth/logout', csrfProtection, handler);
```

---

## SQL Injection Prevention

### Prisma ORM Protection

Prisma ORM automatically parameterizes all queries, preventing SQL injection.

```typescript
// Safe - Prisma parameterizes this
const students = await prisma.student.findMany({
  where: {
    classId: req.body.classId,  // Safely parameterized
    status: 'ACTIVE'
  }
});

// Never do this - raw queries without parameterization
const unsafe = await prisma.$queryRaw`
  SELECT * FROM students WHERE name = ${req.body.name}
`;  // Prisma still parameterizes this, but avoid raw queries
```

### Raw Query Guidelines

- Avoid raw queries whenever possible
- If absolutely necessary, use Prisma's tagged template literals (auto-parameterized)
- Never concatenate user input into SQL strings
- All raw queries must be reviewed by security team

---

## Security Headers

### Helmet.js Configuration

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "wss://socket.acadivo.com.pk"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### Complete Header List

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |
| `Content-Security-Policy` | See above | XSS prevention |
| `Permissions-Policy` | `geolocation=(), microphone=()` | Feature restrictions |

---

## Audit Logging

### What is Logged

| Event | Fields Captured |
|-------|----------------|
| Login | userId, ip, userAgent, device, location, status, timestamp |
| Logout | userId, sessionId, timestamp |
| Password Change | userId, ip, timestamp |
| User Created | creatorId, targetUserId, role, tenantId, timestamp |
| User Updated | userId, changedFields, oldValues, newValues, ip |
| User Deleted | userId, deletedBy, tenantId, timestamp |
| Data Access | userId, entityType, entityId, action, ip |
| Permission Change | userId, changedBy, oldPerms, newPerms |
| Failed Login | email, ip, userAgent, reason, timestamp |
| API Error | userId, endpoint, error, stack, timestamp |

### Audit Log Schema

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  tenantId    String
  userId      String?
  action      String
  entityType  String
  entityId    String
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  createdAt   DateTime @default(now())
}
```

### Log Retention

| Log Type | Retention Period |
|----------|-----------------|
| Audit Logs | 2 years |
| Login History | 1 year |
| API Access Logs | 6 months |
| Error Logs | 3 months |

---

## Incident Response Plan

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Data breach, unauthorized access | 1 hour |
| **High** | Service disruption, potential exposure | 4 hours |
| **Medium** | Vulnerability discovery, suspicious activity | 24 hours |
| **Low** | Minor issue, policy violation | 72 hours |

### Response Steps

1. **Detection**
   - Automated monitoring alerts
   - User reports
   - Security audit findings

2. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block suspicious IP addresses
   - Enable emergency read-only mode if needed

3. **Investigation**
   - Review audit logs
   - Identify scope of impact
   - Determine root cause
   - Document timeline

4. **Remediation**
   - Patch vulnerabilities
   - Reset affected passwords
   - Reissue tokens
   - Update security controls

5. **Communication**
   - Notify affected tenants within 24 hours
   - Post status updates
   - Report to authorities if required by law

6. **Post-Incident**
   - Conduct post-mortem
   - Update incident response plan
   - Implement preventive measures

---

## Responsible Disclosure

### Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

**Email:** security@acadivo.com.pk

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information (optional)

### Our Commitment

- We will acknowledge receipt within 24 hours
- We will investigate and respond within 7 days
- We will not take legal action against reporters who act in good faith
- We will credit reporters (with their permission) in security advisories
- We will fix confirmed vulnerabilities promptly

### Out of Scope

The following are not considered security issues:
- Social engineering attacks
- Physical access to devices
- Issues in third-party services beyond our control
- Rate limiting bypasses using distributed IP addresses (expected behavior)

---

*For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
*For API security considerations, see [API.md](./API.md).*
