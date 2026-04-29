# Acadivo API Documentation

Complete reference for the Acadivo REST API and WebSocket events.

**Base URL:** `https://api.acadivo.com.pk/v1`

**WebSocket URL:** `wss://socket.acadivo.com.pk`

---

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Rate Limits](#rate-limits)
- [Pagination](#pagination)
- [Endpoint Reference](#endpoint-reference)
  - [Auth](#auth-endpoints)
  - [Super Admin](#super-admin-endpoints)
  - [Principal](#principal-endpoints)
  - [School Admin](#school-admin-endpoints)
  - [Teacher](#teacher-endpoints)
  - [Student](#student-endpoints)
  - [Parent](#parent-endpoints)
  - [Communication](#communication-endpoints)
  - [Fee](#fee-endpoints)
  - [Result](#result-endpoints)
  - [Report](#report-endpoints)
  - [Advertisement](#advertisement-endpoints)
- [WebSocket Events](#websocket-events)
- [File Upload](#file-upload)

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

### Obtaining Tokens

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@school.edu.pk",
  "password": "securePassword123",
  "tenantCode": "gps-islamabad-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "teacher@school.edu.pk",
      "role": "TEACHER",
      "firstName": "Ali",
      "lastName": "Khan",
      "tenantId": "tenant-uuid"
    }
  }
}
```

### Refreshing Tokens

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Response Format

All API responses follow a standardized format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Valid email is required" }
    ]
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `TENANT_NOT_FOUND` | 404 | Tenant code invalid |
| `RATE_LIMITED` | 429 | Too many requests |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |
| `PAYMENT_REQUIRED` | 402 | Subscription expired |
| `ACCOUNT_LOCKED` | 423 | Too many failed attempts |
| `OTP_EXPIRED` | 400 | OTP code expired |
| `INVALID_OTP` | 400 | OTP code incorrect |

---

## Rate Limits

| Endpoint Type | Limit | Window |
|----------------|-------|--------|
| Authentication | 5 requests | Per IP per minute |
| General API | 100 requests | Per user per 15 minutes |
| File upload | 10 uploads | Per user per hour |
| Messaging | 50 messages | Per user per minute |

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704068100
```

---

## Pagination

List endpoints support pagination via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `sort` | string | `createdAt` | Sort field |
| `order` | string | `desc` | Sort order (`asc` or `desc`) |
| `search` | string | - | Search query |

**Example:**
```
GET /api/admin/students?page=2&limit=50&sort=rollNumber&order=asc&search=Ali
```

---

## Endpoint Reference

### Auth Endpoints (15)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `POST` | `/api/auth/register` | No | Register new user (Super Admin only) |
| 2 | `POST` | `/api/auth/login` | No | Login with credentials |
| 3 | `POST` | `/api/auth/verify-otp` | No | Verify 2FA OTP |
| 4 | `POST` | `/api/auth/resend-otp` | No | Resend OTP code |
| 5 | `POST` | `/api/auth/refresh-token` | No | Refresh access token |
| 6 | `POST` | `/api/auth/logout` | Yes | Logout and invalidate tokens |
| 7 | `POST` | `/api/auth/forgot-password` | No | Request password reset |
| 8 | `POST` | `/api/auth/reset-password` | No | Reset password with token |
| 9 | `GET` | `/api/auth/me` | Yes | Get current user profile |
| 10 | `PATCH` | `/api/auth/me` | Yes | Update current user profile |
| 11 | `POST` | `/api/auth/change-password` | Yes | Change password |
| 12 | `POST` | `/api/auth/setup-2fa` | Yes | Enable 2FA |
| 13 | `POST` | `/api/auth/verify-2fa` | Yes | Verify 2FA setup |
| 14 | `POST` | `/api/auth/disable-2fa` | Yes | Disable 2FA |
| 15 | `GET` | `/api/auth/login-history` | Yes | Get login history |

**Login Request:**
```json
{
  "email": "user@school.edu.pk",
  "password": "password123",
  "tenantCode": "gps-islamabad-001"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 900,
    "requires2FA": false,
    "user": {
      "id": "uuid",
      "email": "user@school.edu.pk",
      "role": "TEACHER",
      "firstName": "Ali",
      "lastName": "Khan",
      "tenant": {
        "id": "tenant-uuid",
        "name": "Govt Pilot School",
        "code": "gps-islamabad-001"
      }
    }
  }
}
```

---

### Super Admin Endpoints (18)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/super-admin/dashboard` | SA | Platform dashboard stats |
| 2 | `GET` | `/api/super-admin/schools` | SA | List all schools/tenants |
| 3 | `POST` | `/api/super-admin/schools` | SA | Create new school/tenant |
| 4 | `GET` | `/api/super-admin/schools/:id` | SA | Get school details |
| 5 | `PATCH` | `/api/super-admin/schools/:id` | SA | Update school |
| 6 | `DELETE` | `/api/super-admin/schools/:id` | SA | Suspend/delete school |
| 7 | `GET` | `/api/super-admin/users` | SA | List all platform users |
| 8 | `GET` | `/api/super-admin/analytics` | SA | Platform analytics data |
| 9 | `GET` | `/api/super-admin/subscriptions` | SA | List all subscriptions |
| 10 | `PATCH` | `/api/super-admin/subscriptions/:id` | SA | Update subscription |
| 11 | `GET` | `/api/super-admin/advertisements` | SA | List all ads |
| 12 | `POST` | `/api/super-admin/advertisements` | SA | Create advertisement |
| 13 | `GET` | `/api/super-admin/advertisements/:id` | SA | Get ad details |
| 14 | `PATCH` | `/api/super-admin/advertisements/:id` | SA | Update ad |
| 15 | `DELETE` | `/api/super-admin/advertisements/:id` | SA | Delete ad |
| 16 | `GET` | `/api/super-admin/audit-logs` | SA | View audit logs |
| 17 | `GET` | `/api/super-admin/settings` | SA | Platform settings |
| 18 | `PATCH` | `/api/super-admin/settings` | SA | Update platform settings |

**Create School Request:**
```json
{
  "name": "Pakistan Public School",
  "code": "pps-lahore-001",
  "type": "SCHOOL",
  "city": "Lahore",
  "address": "123 Main Road, Lahore",
  "phone": "+92-300-1234567",
  "email": "info@pps.edu.pk",
  "subscriptionPlan": "STANDARD",
  "principalEmail": "principal@pps.edu.pk",
  "principalFirstName": "Muhammad",
  "principalLastName": "Ahmad",
  "principalPhone": "+92-300-7654321"
}
```

---

### Principal Endpoints (14)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/principal/dashboard` | P | School overview dashboard |
| 2 | `GET` | `/api/principal/school` | P | Get school profile |
| 3 | `PATCH` | `/api/principal/school` | P | Update school profile |
| 4 | `GET` | `/api/principal/students` | P | List all students |
| 5 | `GET` | `/api/principal/teachers` | P | List all teachers |
| 6 | `GET` | `/api/principal/parents` | P | List all parents |
| 7 | `GET` | `/api/principal/attendance/summary` | P | Daily attendance summary |
| 8 | `GET` | `/api/principal/fee/summary` | P | Fee collection summary |
| 9 | `GET` | `/api/principal/reports` | P | School reports |
| 10 | `POST` | `/api/principal/announcements` | P | Post announcement |
| 11 | `GET` | `/api/principal/announcements` | P | List announcements |
| 12 | `GET` | `/api/principal/messages` | P | List conversations |
| 13 | `GET` | `/api/principal/notifications` | P | Get notifications |
| 14 | `PATCH` | `/api/principal/notifications/:id/read` | P | Mark notification read |

**School Overview Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 1250,
    "totalTeachers": 45,
    "totalParents": 980,
    "todayAttendance": {
      "present": 1180,
      "absent": 45,
      "late": 25,
      "percentage": 94.4
    },
    "feeCollection": {
      "totalExpected": 2500000,
      "totalCollected": 2100000,
      "pending": 400000
    },
    "recentAnnouncements": [...],
    "upcomingEvents": [...]
  }
}
```

---

### School Admin Endpoints (40+)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/admin/dashboard` | A | Admin dashboard |
| 2 | `GET` | `/api/admin/classes` | A | List classes |
| 3 | `POST` | `/api/admin/classes` | A | Create class |
| 4 | `GET` | `/api/admin/classes/:id` | A | Get class details |
| 5 | `PATCH` | `/api/admin/classes/:id` | A | Update class |
| 6 | `DELETE` | `/api/admin/classes/:id` | A | Delete class |
| 7 | `GET` | `/api/admin/sections` | A | List sections |
| 8 | `POST` | `/api/admin/sections` | A | Create section |
| 9 | `GET` | `/api/admin/sections/:id` | A | Get section details |
| 10 | `PATCH` | `/api/admin/sections/:id` | A | Update section |
| 11 | `DELETE` | `/api/admin/sections/:id` | A | Delete section |
| 12 | `GET` | `/api/admin/subjects` | A | List subjects |
| 13 | `POST` | `/api/admin/subjects` | A | Create subject |
| 14 | `GET` | `/api/admin/subjects/:id` | A | Get subject |
| 15 | `PATCH` | `/api/admin/subjects/:id` | A | Update subject |
| 16 | `DELETE` | `/api/admin/subjects/:id` | A | Delete subject |
| 17 | `GET` | `/api/admin/teachers` | A | List teachers |
| 18 | `POST` | `/api/admin/teachers` | A | Add teacher |
| 19 | `GET` | `/api/admin/teachers/:id` | A | Get teacher |
| 20 | `PATCH` | `/api/admin/teachers/:id` | A | Update teacher |
| 21 | `DELETE` | `/api/admin/teachers/:id` | A | Remove teacher |
| 22 | `GET` | `/api/admin/students` | A | List students |
| 23 | `POST` | `/api/admin/students` | A | Add student |
| 24 | `GET` | `/api/admin/students/:id` | A | Get student |
| 25 | `PATCH` | `/api/admin/students/:id` | A | Update student |
| 26 | `DELETE` | `/api/admin/students/:id` | A | Remove student |
| 27 | `GET` | `/api/admin/parents` | A | List parents |
| 28 | `POST` | `/api/admin/parents` | A | Add parent |
| 29 | `GET` | `/api/admin/parents/:id` | A | Get parent |
| 30 | `PATCH` | `/api/admin/parents/:id` | A | Update parent |
| 31 | `DELETE` | `/api/admin/parents/:id` | A | Remove parent |
| 32 | `GET` | `/api/admin/timetable` | A | Get school timetable |
| 33 | `POST` | `/api/admin/timetable` | A | Create timetable entry |
| 34 | `PATCH` | `/api/admin/timetable/:id` | A | Update timetable entry |
| 35 | `DELETE` | `/api/admin/timetable/:id` | A | Delete timetable entry |
| 36 | `GET` | `/api/admin/announcements` | A | List announcements |
| 37 | `POST` | `/api/admin/announcements` | A | Post announcement |
| 38 | `GET` | `/api/admin/settings` | A | Get school settings |
| 39 | `PATCH` | `/api/admin/settings` | A | Update school settings |
| 40 | `GET` | `/api/admin/fee/structures` | A | List fee structures |
| 41 | `POST` | `/api/admin/fee/structures` | A | Create fee structure |
| 42 | `GET` | `/api/admin/fee/records` | A | List fee records |
| 43 | `POST` | `/api/admin/fee/records` | A | Create fee record |
| 44 | `POST` | `/api/admin/fee/records/:id/pay` | A | Record cash payment |

**Create Student Request:**
```json
{
  "email": "student@pps.edu.pk",
  "password": "tempPassword123",
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "phone": "+92-300-1112222",
  "gender": "MALE",
  "dateOfBirth": "2010-05-15",
  "address": "House 123, Street 4, Lahore",
  "city": "Lahore",
  "rollNumber": "2024-001",
  "classId": "class-uuid",
  "sectionId": "section-uuid",
  "guardianName": "Hassan Ali",
  "guardianPhone": "+92-300-3334444",
  "guardianRelation": "FATHER",
  "guardianCNIC": "35201-1234567-8",
  "bloodGroup": "B+",
  "medicalNotes": "No allergies"
}
```

---

### Teacher Endpoints (20+)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/teacher/dashboard` | T | Teacher dashboard |
| 2 | `GET` | `/api/teacher/classes` | T | Assigned classes |
| 3 | `GET` | `/api/teacher/timetable` | T | Personal timetable |
| 4 | `GET` | `/api/teacher/students` | T | Students in assigned classes |
| 5 | `GET` | `/api/teacher/attendance` | T | Attendance records |
| 6 | `POST` | `/api/teacher/attendance` | T | Mark attendance |
| 7 | `GET` | `/api/teacher/attendance/:date/:classId` | T | Get class attendance |
| 8 | `GET` | `/api/teacher/homework` | T | List homework |
| 9 | `POST` | `/api/teacher/homework` | T | Create homework |
| 10 | `GET` | `/api/teacher/homework/:id` | T | Get homework details |
| 11 | `PATCH` | `/api/teacher/homework/:id` | T | Update homework |
| 12 | `DELETE` | `/api/teacher/homework/:id` | T | Delete homework |
| 13 | `GET` | `/api/teacher/homework/:id/submissions` | T | List submissions |
| 14 | `PATCH` | `/api/teacher/homework/:id/grade` | T | Grade submission |
| 15 | `GET` | `/api/teacher/marks` | T | List marks entries |
| 16 | `POST` | `/api/teacher/marks` | T | Enter marks |
| 17 | `PATCH` | `/api/teacher/marks/:id` | T | Update marks |
| 18 | `GET` | `/api/teacher/qa` | T | Q&A questions for me |
| 19 | `POST` | `/api/teacher/qa/:id/answer` | T | Answer question |
| 20 | `GET` | `/api/teacher/reports` | T | Available reports |
| 21 | `POST` | `/api/teacher/reports` | T | Generate report |
| 22 | `GET` | `/api/teacher/notifications` | T | Notifications |
| 23 | `GET` | `/api/teacher/messages` | T | Messages |

**Mark Attendance Request:**
```json
{
  "classId": "class-uuid",
  "sectionId": "section-uuid",
  "date": "2024-01-15",
  "attendance": [
    { "studentId": "student-1", "status": "PRESENT" },
    { "studentId": "student-2", "status": "ABSENT", "remarks": "Sick leave" },
    { "studentId": "student-3", "status": "LATE" }
  ]
}
```

---

### Student Endpoints (15+)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/student/dashboard` | S | Student dashboard |
| 2 | `GET` | `/api/student/timetable` | S | Weekly timetable |
| 3 | `GET` | `/api/student/attendance` | S | Attendance history |
| 4 | `GET` | `/api/student/homework` | S | Assigned homework |
| 5 | `GET` | `/api/student/homework/:id` | S | Homework details |
| 6 | `POST` | `/api/student/homework/:id/submit` | S | Submit homework |
| 7 | `GET` | `/api/student/marks` | S | Subject-wise marks |
| 8 | `GET` | `/api/student/results` | S | Term results |
| 9 | `GET` | `/api/student/results/:id` | S | Result details |
| 10 | `GET` | `/api/student/qa` | S | Q&A forum |
| 11 | `POST` | `/api/student/qa` | S | Ask question |
| 12 | `GET` | `/api/student/messages` | S | Messages |
| 13 | `GET` | `/api/student/notifications` | S | Notifications |
| 14 | `GET` | `/api/student/fee` | S | Fee records |
| 15 | `GET` | `/api/student/profile` | S | Student profile |

**Submit Homework Request:**
```json
{
  "submissionText": "Here is my solution to problem 3...",
  "attachments": [
    { "url": "https://cloudinary.com/...", "type": "pdf", "name": "homework.pdf" }
  ]
}
```

---

### Parent Endpoints (15+)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/parent/dashboard` | P | Parent dashboard |
| 2 | `GET` | `/api/parent/children` | P | List children |
| 3 | `GET` | `/api/parent/children/:id` | P | Child details |
| 4 | `GET` | `/api/parent/children/:id/attendance` | P | Child attendance |
| 5 | `GET` | `/api/parent/children/:id/homework` | P | Child homework |
| 6 | `GET` | `/api/parent/children/:id/marks` | P | Child marks |
| 7 | `GET` | `/api/parent/children/:id/results` | P | Child results |
| 8 | `GET` | `/api/parent/fee` | P | Fee records for all children |
| 9 | `POST` | `/api/parent/fee/:id/pay` | P | Initiate fee payment |
| 10 | `GET` | `/api/parent/fee/:id/receipt` | P | Download fee receipt |
| 11 | `GET` | `/api/parent/reports` | P | Requested reports |
| 12 | `POST` | `/api/parent/reports` | P | Request report from teacher |
| 13 | `GET` | `/api/parent/qa` | P | Q&A forum |
| 14 | `POST` | `/api/parent/qa` | P | Ask question |
| 15 | `GET` | `/api/parent/messages` | P | Messages |
| 16 | `GET` | `/api/parent/notifications` | P | Notifications |

**Request Report:**
```json
{
  "studentId": "child-uuid",
  "teacherId": "teacher-uuid",
  "reportType": "PROGRESS",
  "remarks": "Need detailed progress report for mid-term parent meeting"
}
```

---

### Communication Endpoints (20+)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/messages` | Yes | List conversations |
| 2 | `GET` | `/api/messages/:userId` | Yes | Chat history with user |
| 3 | `POST` | `/api/messages` | Yes | Send message |
| 4 | `PATCH` | `/api/messages/:id/read` | Yes | Mark message read |
| 5 | `DELETE` | `/api/messages/:id` | Yes | Delete message |
| 6 | `GET` | `/api/messages/unread-count` | Yes | Count unread messages |
| 7 | `GET` | `/api/announcements` | Yes | List announcements |
| 8 | `GET` | `/api/announcements/:id` | Yes | Get announcement |
| 9 | `POST` | `/api/announcements` | P/A/T | Create announcement |
| 10 | `PATCH` | `/api/announcements/:id` | P/A/T | Update announcement |
| 11 | `DELETE` | `/api/announcements/:id` | P/A/T | Delete announcement |
| 12 | `POST` | `/api/announcements/:id/pin` | P/A/T | Pin/unpin announcement |
| 13 | `GET` | `/api/notifications` | Yes | List notifications |
| 14 | `PATCH` | `/api/notifications/:id/read` | Yes | Mark notification read |
| 15 | `PATCH` | `/api/notifications/read-all` | Yes | Mark all read |
| 16 | `DELETE` | `/api/notifications/:id` | Yes | Delete notification |
| 17 | `GET` | `/api/notifications/unread-count` | Yes | Count unread |
| 18 | `GET` | `/api/qa` | Yes | List Q&A questions |
| 19 | `GET` | `/api/qa/:id` | Yes | Get Q&A thread |
| 20 | `POST` | `/api/qa` | S/P | Ask question |
| 21 | `POST` | `/api/qa/:id/answer` | T | Answer question |
| 22 | `POST` | `/api/qa/:id/vote` | Yes | Upvote answer |

**Send Message Request:**
```json
{
  "receiverId": "user-uuid",
  "content": "Assalam-o-Alaikum, can we discuss...",
  "messageType": "TEXT",
  "attachments": []
}
```

---

### Fee Endpoints (15)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/fee/structures` | A | List fee structures |
| 2 | `POST` | `/api/fee/structures` | A | Create fee structure |
| 3 | `GET` | `/api/fee/structures/:id` | A | Get fee structure |
| 4 | `PATCH` | `/api/fee/structures/:id` | A | Update fee structure |
| 5 | `DELETE` | `/api/fee/structures/:id` | A | Delete fee structure |
| 6 | `GET` | `/api/fee/records` | A | List all fee records |
| 7 | `GET` | `/api/fee/records/:id` | A/P/S | Get fee record |
| 8 | `POST` | `/api/fee/records` | A | Create fee record |
| 9 | `PATCH` | `/api/fee/records/:id` | A | Update fee record |
| 10 | `POST` | `/api/fee/records/:id/pay` | A/P | Record payment |
| 11 | `POST` | `/api/fee/initiate-payment` | P | Initiate online payment |
| 12 | `POST` | `/api/fee/verify-payment` | P | Verify JazzCash/EasyPaisa |
| 13 | `GET` | `/api/fee/receipt/:id` | A/P/S | Download PDF receipt |
| 14 | `GET` | `/api/fee/summary` | P/A | Fee collection summary |
| 15 | `GET` | `/api/fee/overdue` | A | Overdue fee records |

**Create Fee Structure Request:**
```json
{
  "classId": "class-uuid",
  "feeType": "TUITION",
  "amount": 5000.00,
  "frequency": "MONTHLY",
  "dueDay": 10,
  "lateFeePerDay": 50.00,
  "academicYear": "2024-2025"
}
```

---

### Result Endpoints (12)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/results` | A/T | List results |
| 2 | `GET` | `/api/results/:id` | Yes | Get result details |
| 3 | `POST` | `/api/results` | A/T | Generate result |
| 4 | `PATCH` | `/api/results/:id` | A/T | Update result |
| 5 | `DELETE` | `/api/results/:id` | A/T | Delete result |
| 6 | `GET` | `/api/results/student/:studentId` | Yes | Student all results |
| 7 | `GET` | `/api/results/class/:classId` | A/T | Class results |
| 8 | `GET` | `/api/results/class/:classId/section/:sectionId` | A/T | Section results |
| 9 | `POST` | `/api/results/generate-batch` | A/T | Batch generate results |
| 10 | `GET` | `/api/results/:id/pdf` | Yes | Download result PDF |
| 11 | `GET` | `/api/grading-schemes` | A | List grading schemes |
| 12 | `POST` | `/api/grading-schemes` | A | Create grading scheme |

**Generate Result Request:**
```json
{
  "studentId": "student-uuid",
  "classId": "class-uuid",
  "sectionId": "section-uuid",
  "academicYear": "2024-2025",
  "term": "MIDTERM"
}
```

---

### Report Endpoints (8)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/reports` | P/T/A | List report requests |
| 2 | `POST` | `/api/reports` | P | Request report |
| 3 | `GET` | `/api/reports/:id` | P/T/A | Get report request |
| 4 | `PATCH` | `/api/reports/:id` | T/A | Update/complete report |
| 5 | `POST` | `/api/reports/:id/reject` | T/A | Reject report request |
| 6 | `GET` | `/api/reports/:id/pdf` | P | Download report PDF |
| 7 | `GET` | `/api/reports/pending` | T/A | Pending requests for teacher |
| 8 | `GET` | `/api/reports/templates` | A | Available report templates |

---

### Advertisement Endpoints (10)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | `GET` | `/api/advertisements` | Yes | Active ads for user |
| 2 | `GET` | `/api/advertisements/:id` | SA | Get ad details |
| 3 | `POST` | `/api/advertisements` | SA | Create ad |
| 4 | `PATCH` | `/api/advertisements/:id` | SA | Update ad |
| 5 | `DELETE` | `/api/advertisements/:id` | SA | Delete ad |
| 6 | `POST` | `/api/advertisements/:id/impression` | Yes | Record impression |
| 7 | `POST` | `/api/advertisements/:id/click` | Yes | Record click |
| 8 | `GET` | `/api/advertisements/:id/stats` | SA | Ad statistics |
| 9 | `GET` | `/api/advertisements/admin/all` | SA | All ads (admin) |
| 10 | `PATCH` | `/api/advertisements/:id/status` | SA | Change ad status |

**Create Ad Request:**
```json
{
  "title": "Summer Camp 2024",
  "description": "Join our amazing summer camp...",
  "imageUrl": "https://cloudinary.com/...",
  "linkUrl": "https://example.com/camp",
  "targetAudience": "STUDENTS",
  "targetCities": ["Islamabad", "Lahore"],
  "targetSchoolTypes": ["SCHOOL"],
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "priority": 1
}
```

---

## WebSocket Events

### Connection

```javascript
// Client connects with JWT
const socket = io('wss://socket.acadivo.com.pk', {
  auth: { token: 'access_token' }
});
```

### Event Reference

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | C->S | `{ token }` | Authenticate connection |
| `message:send` | C->S | `{ receiverId, content, type }` | Send chat message |
| `message:receive` | S->C | `{ message }` | Receive new message |
| `message:read` | C->S | `{ messageIds }` | Mark messages as read |
| `typing:start` | C->S | `{ receiverId }` | Typing indicator on |
| `typing:stop` | C->S | `{ receiverId }` | Typing indicator off |
| `notification:new` | S->C | `{ notification }` | New notification |
| `notification:read` | C->S | `{ notificationId }` | Mark notification read |
| `announcement:new` | S->C | `{ announcement }` | New announcement |
| `attendance:marked` | S->C | `{ classId, date, summary }` | Attendance updated |
| `homework:assigned` | S->C | `{ homework }` | New homework assigned |
| `homework:submitted` | S->C | `{ submission }` | Student submitted homework |
| `fee:due` | S->C | `{ feeRecord }` | Fee due reminder |
| `fee:paid` | S->C | `{ feeRecord }` | Payment confirmation |
| `result:published` | S->C | `{ result }` | Result published |
| `report:completed` | S->C | `{ reportRequest }` | Report ready |
| `presence:update` | S->C | `{ userId, status }` | User online/offline |
| `join:room` | C->S | `{ roomId }` | Join a chat room |
| `leave:room` | C->S | `{ roomId }` | Leave a chat room |

### Example: Chat Implementation

```javascript
// React/Web client
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  auth: { token: localStorage.getItem('accessToken') }
});

// Send message
socket.emit('message:send', {
  receiverId: 'user-uuid',
  content: 'Assalam-o-Alaikum!',
  messageType: 'TEXT'
});

// Receive message
socket.on('message:receive', (data) => {
  console.log('New message:', data.message);
});

// Typing indicator
socket.emit('typing:start', { receiverId: 'user-uuid' });
setTimeout(() => socket.emit('typing:stop', { receiverId: 'user-uuid' }), 3000);
```

---

## File Upload

Files are uploaded directly to Cloudinary via signed uploads.

### Upload Flow

1. Client requests upload signature from API
2. API returns Cloudinary signature + timestamp
3. Client uploads file directly to Cloudinary
4. Cloudinary returns file URL
5. Client sends URL to API with other data

### Get Upload Signature

```http
GET /api/upload/signature?folder=homework&fileType=image
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "abc123...",
    "timestamp": 1704067200,
    "apiKey": "123456789012345",
    "cloudName": "acadivo-cloud",
    "folder": "homework"
  }
}
```

### Upload to Cloudinary

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('api_key', signature.apiKey);
formData.append('timestamp', signature.timestamp);
formData.append('signature', signature.signature);
formData.append('folder', signature.folder);

fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/upload`, {
  method: 'POST',
  body: formData
});
```

### Supported File Types

| Context | Max Size | Allowed Types |
|---------|----------|---------------|
| Avatar | 5 MB | jpg, png |
| Homework | 20 MB | pdf, doc, docx, jpg, png |
| Result PDF | 10 MB | pdf |
| Receipt | 5 MB | pdf |
| Announcement | 10 MB | jpg, png, pdf |

---

*For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
*For setup instructions, see [SETUP.md](./SETUP.md).*
*For the complete database schema, see [DATABASE.md](./DATABASE.md).*
