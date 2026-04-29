# Acadivo Database Schema Documentation

Complete documentation of the Acadivo PostgreSQL database schema managed by Prisma ORM.

---

## Table of Contents

- [Schema Overview](#schema-overview)
- [Tables Reference](#tables-reference)
- [Relationships Diagram](#relationships-diagram)
- [Indexing Strategy](#indexing-strategy)
- [Soft Delete Implementation](#soft-delete-implementation)
- [Tenant Isolation](#tenant-isolation)
- [Migration Guide](#migration-guide)

---

## Schema Overview

The Acadivo database uses **PostgreSQL 15** with **Prisma 5 ORM**. It contains **33 models** organized into logical groups:

| Group | Models | Description |
|-------|--------|-------------|
| **Tenant & Platform** | Tenant, SubscriptionPlan, SchoolSubscription, Setting | Multi-tenancy and platform config |
| **Users & Roles** | User, Principal, SchoolAdmin, Teacher, Student, Parent, StudentParent | User management with role profiles |
| **Academic** | Class, Section, Subject, TeacherSubject, ClassSchedule | Classes, subjects, and timetables |
| **Attendance** | Attendance | Daily and period-wise attendance |
| **Homework** | Homework, HomeworkSubmission | Assignment creation and grading |
| **Assessment** | Mark, Result, ResultDetail, GradingScheme | Marks entry and result compilation |
| **Communication** | Message, Notification, Announcement | Chat, notifications, and announcements |
| **Fee** | FeeStructure, FeeRecord | Fee management and payments |
| **Reports** | ReportRequest | Parent report requests |
| **Advertising** | Advertisement, AdImpression | Ad management and tracking |
| **Security & Audit** | LoginHistory, AuditLog | Login tracking and audit trails |

---

## Tables Reference

### 1. Tenant

The root entity for multi-tenancy. Each school, college, or university is a tenant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | String | - | Institution name |
| `code` | String | Unique | Unique code (e.g., "gps-islamabad-001") |
| `type` | Enum | - | SCHOOL / COLLEGE / UNIVERSITY |
| `city` | String | - | City location |
| `address` | String | Text | Full address |
| `phone` | String | - | Contact phone |
| `email` | String | - | Contact email |
| `logo` | String | Nullable | Logo image URL |
| `status` | Enum | Default: PENDING | ACTIVE / SUSPENDED / PENDING |
| `subscriptionPlan` | Enum | Default: FREE | FREE / BASIC / STANDARD / PREMIUM |
| `subscriptionExpiry` | DateTime | Nullable | Subscription end date |
| `maxTeachers` | Int | Default: 10 | Teacher limit |
| `maxStudents` | Int | Default: 100 | Student limit |
| `createdBy` | String | - | User ID who created the tenant |
| `createdAt` | DateTime | Default: now | Creation timestamp |
| `updatedAt` | DateTime | Auto-update | Last update timestamp |

**Indexes:** `code`, `status`, `createdAt`

---

### 2. User

Base user table shared by all roles. Contains authentication and profile data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `uniqueId` | String | Unique | System-generated unique ID |
| `email` | String | Unique per tenant | Login email |
| `passwordHash` | String | - | bcrypt hashed password |
| `role` | Enum | - | SUPER_ADMIN / PRINCIPAL / ADMIN / TEACHER / STUDENT / PARENT |
| `tenantId` | String | FK -> Tenant | Tenant isolation key |
| `firstName` | String | - | First name |
| `lastName` | String | - | Last name |
| `phone` | String | - | Phone number |
| `cnic` | String | Nullable | CNIC number |
| `avatar` | String | Nullable | Profile image URL |
| `gender` | Enum | Nullable | MALE / FEMALE / OTHER |
| `dateOfBirth` | DateTime | Nullable | Date of birth |
| `address` | String | Nullable, Text | Home address |
| `city` | String | Nullable | City |
| `isActive` | Boolean | Default: true | Account active status |
| `isVerified` | Boolean | Default: false | Email verified |
| `twoFactorEnabled` | Boolean | Default: false | 2FA enabled |
| `twoFactorSecret` | String | Nullable | 2FA TOTP secret |
| `lastLoginAt` | DateTime | Nullable | Last login timestamp |
| `loginAttempts` | Int | Default: 0 | Failed login attempts |
| `lockUntil` | DateTime | Nullable | Account lockout expiry |
| `passwordChangedAt` | DateTime | Nullable | Last password change |
| `createdAt` | DateTime | Default: now | Creation timestamp |
| `updatedAt` | DateTime | Auto-update | Last update timestamp |

**Indexes:** `tenantId`, `role`, `uniqueId`, `isActive`, `createdAt`
**Unique:** `[email, tenantId]`

---

### 3. Principal

Profile extension for Principal role.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `userId` | String | PK, FK -> User | User ID |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `qualifications` | String | Nullable, Text | Academic qualifications |
| `experience` | Int | Nullable | Years of experience |
| `joiningDate` | DateTime | Nullable | Date joined |
| `bio` | String | Nullable, Text | Brief biography |

**Indexes:** `tenantId`

---

### 4. SchoolAdmin

Profile extension for School Admin role.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `userId` | String | PK, FK -> User | User ID |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `department` | String | Nullable | Department |
| `permissions` | Json | Nullable | Custom permissions array |
| `joiningDate` | DateTime | Nullable | Date joined |

**Indexes:** `tenantId`

---

### 5. Teacher

Profile extension for Teacher role.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `userId` | String | PK, FK -> User | User ID |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `qualifications` | String | Nullable, Text | Academic qualifications |
| `specialization` | String | Nullable | Subject specialization |
| `experience` | Int | Nullable | Years of experience |
| `joiningDate` | DateTime | Nullable | Date joined |
| `bio` | String | Nullable, Text | Brief biography |
| `isClassTeacher` | Boolean | Default: false | Is class teacher |
| `assignedClassId` | String | Nullable, FK -> Class | Assigned class |
| `assignedSectionId` | String | Nullable, FK -> Section | Assigned section |

**Indexes:** `tenantId`, `assignedClassId`, `assignedSectionId`

---

### 6. Student

Profile extension for Student role.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `userId` | String | PK, FK -> User | User ID |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `rollNumber` | String | - | Unique roll number |
| `classId` | String | FK -> Class | Enrolled class |
| `sectionId` | String | FK -> Section | Enrolled section |
| `admissionDate` | DateTime | Default: now | Admission date |
| `guardianName` | String | - | Guardian name |
| `guardianPhone` | String | - | Guardian phone |
| `guardianRelation` | String | - | Guardian relation |
| `guardianCNIC` | String | Nullable | Guardian CNIC |
| `bloodGroup` | String | Nullable | Blood group |
| `medicalNotes` | String | Nullable, Text | Medical information |
| `status` | Enum | Default: ACTIVE | ACTIVE / INACTIVE / GRADUATED / SUSPENDED |

**Indexes:** `tenantId`, `classId`, `sectionId`, `status`
**Unique:** `[rollNumber, tenantId]`

---

### 7. Parent

Profile extension for Parent role.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `userId` | String | PK, FK -> User | User ID |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `occupation` | String | Nullable | Occupation |
| `emergencyContact` | String | Nullable | Emergency contact number |
| `emergencyRelation` | String | Nullable | Emergency contact relation |

**Indexes:** `tenantId`

---

### 8. StudentParent

Junction table linking students to parents.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `studentId` | String | FK -> Student | Student user ID |
| `parentId` | String | FK -> Parent | Parent user ID |
| `relation` | Enum | - | FATHER / MOTHER / GUARDIAN |
| `isPrimary` | Boolean | Default: false | Is primary contact |
| `canPickup` | Boolean | Default: true | Authorized for pickup |
| `tenantId` | String | FK -> Tenant | Tenant isolation |

**Indexes:** `tenantId`, `studentId`, `parentId`
**Unique:** `[studentId, parentId]`

---

### 9. Class

Academic class (grade level).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `name` | String | - | Class name (e.g., "10th Grade") |
| `grade` | String | - | Grade level (e.g., "10") |
| `classTeacherId` | String | Nullable, FK -> Teacher | Assigned class teacher |
| `roomNumber` | String | Nullable | Room number |
| `capacity` | Int | Default: 30 | Max students |
| `academicYear` | String | - | Academic year (e.g., "2024-2025") |
| `isActive` | Boolean | Default: true | Active status |

**Indexes:** `tenantId`, `academicYear`, `isActive`

---

### 10. Section

Division of a class (A, B, C, etc.).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `classId` | String | FK -> Class | Parent class |
| `name` | String | - | Section name (e.g., "A") |
| `capacity` | Int | Default: 30 | Max students |
| `roomNumber` | String | Nullable | Room number |
| `isActive` | Boolean | Default: true | Active status |

**Indexes:** `tenantId`, `classId`
**Unique:** `[classId, name]`

---

### 11. Subject

Academic subject taught in the school.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `name` | String | - | Subject name |
| `code` | String | - | Subject code |
| `description` | String | Nullable, Text | Description |
| `creditHours` | Int | Default: 3 | Credit hours |
| `isActive` | Boolean | Default: true | Active status |

**Indexes:** `tenantId`, `isActive`
**Unique:** `[code, tenantId]`

---

### 12. TeacherSubject

Junction table assigning teachers to subjects for specific class-section combinations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `teacherId` | String | FK -> Teacher | Teacher user ID |
| `subjectId` | String | FK -> Subject | Subject ID |
| `classId` | String | FK -> Class | Class ID |
| `sectionId` | String | FK -> Section | Section ID |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `academicYear` | String | - | Academic year |
| `isActive` | Boolean | Default: true | Active status |

**Indexes:** `tenantId`, `teacherId`, `subjectId`, `classId`, `sectionId`
**Unique:** `[teacherId, subjectId, classId, sectionId, academicYear]`

---

### 13. ClassSchedule

Weekly timetable entries (periods).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `classId` | String | FK -> Class | Class ID |
| `sectionId` | String | FK -> Section | Section ID |
| `subjectId` | String | FK -> Subject | Subject ID |
| `teacherId` | String | FK -> Teacher | Teacher ID |
| `dayOfWeek` | Int | - | 0=Sunday, 6=Saturday |
| `periodNumber` | Int | - | Period number (1-8) |
| `startTime` | String | - | Start time "HH:MM" |
| `endTime` | String | - | End time "HH:MM" |
| `roomNumber` | String | Nullable | Room number |
| `academicYear` | String | - | Academic year |
| `isActive` | Boolean | Default: true | Active status |

**Indexes:** `tenantId`, `classId`, `sectionId`, `teacherId`, `dayOfWeek`, `academicYear`
**Unique:** `[classId, sectionId, dayOfWeek, periodNumber, academicYear]`

---

### 14. Attendance

Student attendance records.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `studentId` | String | FK -> Student | Student ID |
| `classId` | String | FK -> Class | Class ID |
| `sectionId` | String | FK -> Section | Section ID |
| `date` | DateTime | - | Attendance date |
| `status` | Enum | - | PRESENT / ABSENT / LATE / LEAVE / HALF_DAY |
| `markedBy` | String | FK -> Teacher | Teacher who marked |
| `periodNumber` | Int | Nullable | Period number (null = full day) |
| `remarks` | String | Nullable, Text | Remarks |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `studentId`, `classId`, `sectionId`, `date`, `status`, `markedBy`
**Unique:** `[studentId, date, periodNumber]`

---

### 15. Homework

Homework assignments created by teachers.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `teacherId` | String | FK -> Teacher | Creator teacher |
| `classId` | String | FK -> Class | Target class |
| `sectionId` | String | FK -> Section | Target section |
| `subjectId` | String | FK -> Subject | Subject |
| `title` | String | - | Homework title |
| `description` | String | Text | Full instructions |
| `attachments` | Json | Nullable | File attachments array |
| `dueDate` | DateTime | - | Due date and time |
| `maxMarks` | Int | Nullable | Maximum marks |
| `isActive` | Boolean | Default: true | Active status |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `teacherId`, `classId`, `sectionId`, `subjectId`, `dueDate`

---

### 16. HomeworkSubmission

Student submissions for homework.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `homeworkId` | String | FK -> Homework | Homework ID |
| `studentId` | String | FK -> Student | Student ID |
| `submissionText` | String | Nullable, Text | Text submission |
| `attachments` | Json | Nullable | File attachments |
| `submittedAt` | DateTime | Nullable | Submission timestamp |
| `status` | Enum | Default: PENDING | PENDING / SUBMITTED / LATE |
| `marks` | Int | Nullable | Marks awarded |
| `feedback` | String | Nullable, Text | Teacher feedback |
| `gradedBy` | String | Nullable, FK -> User | Grading teacher |
| `gradedAt` | DateTime | Nullable | Grading timestamp |

**Indexes:** `tenantId`, `homeworkId`, `studentId`, `status`, `gradedBy`
**Unique:** `[homeworkId, studentId]`

---

### 17. Mark

Subject-wise marks/assessments.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `studentId` | String | FK -> Student | Student ID |
| `subjectId` | String | FK -> Subject | Subject ID |
| `classId` | String | FK -> Class | Class ID |
| `sectionId` | String | FK -> Section | Section ID |
| `teacherId` | String | FK -> Teacher | Entering teacher |
| `examType` | Enum | - | QUIZ / MIDTERM / FINAL / ASSIGNMENT / PROJECT |
| `totalMarks` | Int | - | Total possible marks |
| `obtainedMarks` | Int | - | Marks obtained |
| `percentage` | Float | - | Calculated percentage |
| `grade` | String | - | Letter grade |
| `remarks` | String | Nullable, Text | Remarks |
| `academicYear` | String | - | Academic year |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `studentId`, `subjectId`, `classId`, `sectionId`, `teacherId`, `examType`, `academicYear`, `createdAt`

---

### 18. Result

Compiled final result per student per term.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `studentId` | String | FK -> Student | Student ID |
| `classId` | String | FK -> Class | Class ID |
| `sectionId` | String | FK -> Section | Section ID |
| `academicYear` | String | - | Academic year |
| `term` | Enum | - | FIRST / SECOND / THIRD / FINAL |
| `totalMarks` | Int | - | Total marks |
| `obtainedMarks` | Int | - | Obtained marks |
| `percentage` | Float | - | Percentage |
| `grade` | String | - | Overall grade |
| `rank` | Int | Nullable | Class rank |
| `status` | Enum | - | PASS / FAIL / PROMOTED |
| `teacherRemarks` | String | Nullable, Text | Teacher comments |
| `principalRemarks` | String | Nullable, Text | Principal comments |
| `generatedAt` | DateTime | Default: now | Generation timestamp |
| `generatedBy` | String | Nullable, FK -> User | Generated by user |

**Indexes:** `tenantId`, `studentId`, `classId`, `sectionId`, `academicYear`, `term`, `status`
**Unique:** `[studentId, academicYear, term]`

---

### 19. ResultDetail

Individual subject results within a compiled result.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `resultId` | String | FK -> Result | Parent result |
| `subjectId` | String | FK -> Subject | Subject ID |
| `totalMarks` | Int | - | Total marks |
| `obtainedMarks` | Int | - | Obtained marks |
| `grade` | String | - | Subject grade |
| `remarks` | String | Nullable, Text | Remarks |

**Indexes:** `tenantId`, `resultId`, `subjectId`

---

### 20. ReportRequest

Parent requests for detailed reports from teachers.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `parentId` | String | FK -> Parent | Requesting parent |
| `studentId` | String | FK -> Student | Target student |
| `teacherId` | String | FK -> User | Requested teacher |
| `status` | Enum | Default: PENDING | PENDING / COMPLETED / REJECTED |
| `requestedAt` | DateTime | Default: now | Request timestamp |
| `completedAt` | DateTime | Nullable | Completion timestamp |
| `reportType` | Enum | - | PROGRESS / ATTENDANCE / BEHAVIOR / COMPREHENSIVE |
| `teacherRemarks` | String | Nullable, Text | Teacher comments |
| `pdfUrl` | String | Nullable | Generated PDF URL |

**Indexes:** `tenantId`, `parentId`, `studentId`, `teacherId`, `status`, `requestedAt`

---

### 21. Message

Chat messages between users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `senderId` | String | FK -> User | Sender |
| `receiverId` | String | FK -> User | Receiver |
| `content` | String | Text | Message content |
| `attachments` | Json | Nullable | File attachments |
| `isRead` | Boolean | Default: false | Read status |
| `readAt` | DateTime | Nullable | Read timestamp |
| `messageType` | Enum | Default: TEXT | TEXT / IMAGE / FILE / VOICE |
| `replyToId` | String | Nullable, FK -> Message | Reply to message |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `senderId`, `receiverId`, `isRead`, `createdAt`

---

### 22. Notification

System notifications for users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `userId` | String | FK -> User | Target user |
| `title` | String | - | Notification title |
| `body` | String | Text | Notification body |
| `type` | Enum | - | ANNOUNCEMENT / MESSAGE / REPORT_READY / FEE_DUE / ATTENDANCE_ALERT / HOMEWORK / RESULT / TIMETABLE_CHANGE / ADVERTISEMENT |
| `isRead` | Boolean | Default: false | Read status |
| `readAt` | DateTime | Nullable | Read timestamp |
| `data` | Json | Nullable | Metadata payload |
| `senderId` | String | Nullable, FK -> User | Sender |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `userId`, `type`, `isRead`, `createdAt`

---

### 23. Announcement

School and platform announcements (noticeboard).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `postedBy` | String | FK -> User | Author |
| `title` | String | - | Announcement title |
| `content` | String | Text | Full content |
| `attachments` | Json | Nullable | File attachments |
| `priority` | Enum | Default: NORMAL | LOW / NORMAL / HIGH / URGENT |
| `targetAudience` | Enum | Default: ALL | ALL / TEACHERS / STUDENTS / PARENTS / ADMIN / CLASS |
| `targetClassId` | String | Nullable, FK -> Class | Target class |
| `targetSectionId` | String | Nullable | Target section |
| `isPinned` | Boolean | Default: false | Pinned to top |
| `expiresAt` | DateTime | Nullable | Expiry date |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `postedBy`, `priority`, `targetAudience`, `targetClassId`, `isPinned`, `expiresAt`, `createdAt`

---

### 24. FeeStructure

Fee structure definitions per class/fee type.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `classId` | String | Nullable, FK -> Class | Target class (null = all) |
| `feeType` | Enum | - | TUITION / ADMISSION / EXAM / LAB / SPORTS / LIBRARY / TRANSPORT / MISC |
| `amount` | Decimal | Decimal(10,2) | Fee amount |
| `frequency` | Enum | - | MONTHLY / QUARTERLY / YEARLY / ONE_TIME |
| `dueDay` | Int | Nullable | Day of month due |
| `lateFeePerDay` | Decimal | Nullable, Decimal(10,2) | Late fee per day |
| `isActive` | Boolean | Default: true | Active status |
| `academicYear` | String | - | Academic year |

**Indexes:** `tenantId`, `classId`, `feeType`, `academicYear`, `isActive`

---

### 25. FeeRecord

Individual fee records per student.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `studentId` | String | FK -> Student | Student ID |
| `feeStructureId` | String | FK -> FeeStructure | Fee structure |
| `amount` | Decimal | Decimal(10,2) | Base amount |
| `discountAmount` | Decimal | Nullable, Decimal(10,2) | Discount |
| `discountReason` | String | Nullable | Discount reason |
| `finalAmount` | Decimal | Decimal(10,2) | Amount after discount |
| `paidAmount` | Decimal | Decimal(10,2) | Amount paid |
| `balance` | Decimal | Decimal(10,2) | Remaining balance |
| `status` | Enum | Default: UNPAID | PAID / UNPAID / PARTIAL / WAIVED |
| `dueDate` | DateTime | - | Due date |
| `paidDate` | DateTime | Nullable | Payment date |
| `paymentMethod` | Enum | Nullable | CASH / BANK_TRANSFER / EASYPAYSA / JAZZCASH |
| `transactionId` | String | Nullable | Payment transaction ID |
| `installments` | Json | Nullable | Installment details |
| `receiptNumber` | String | Nullable | Receipt number |
| `remarks` | String | Nullable, Text | Remarks |
| `notifiedAt` | DateTime | Nullable | Last notification |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `studentId`, `feeStructureId`, `status`, `dueDate`, `paidDate`, `createdAt`

---

### 26. Advertisement

Platform advertisements managed by Super Admin.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `title` | String | - | Ad title |
| `description` | String | Text | Ad body |
| `imageUrl` | String | Nullable | Ad image |
| `linkUrl` | String | Nullable | Click-through URL |
| `targetAudience` | Enum | Default: ALL | ALL / STUDENTS / PARENTS / TEACHERS / PRINCIPALS / ADMIN |
| `targetCities` | Json | Nullable | City filter array |
| `targetSchoolTypes` | Json | Nullable | School type filter array |
| `startDate` | DateTime | - | Campaign start |
| `endDate` | DateTime | - | Campaign end |
| `priority` | Int | Default: 0 | Display priority |
| `status` | Enum | Default: PENDING | ACTIVE / PENDING / EXPIRED |
| `clickCount` | Int | Default: 0 | Click counter |
| `impressionCount` | Int | Default: 0 | Impression counter |
| `createdBy` | String | FK -> User | Creator |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `status`, `startDate`, `endDate`, `targetAudience`, `priority`, `createdAt`

---

### 27. AdImpression

Ad view and click tracking.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `adId` | String | FK -> Advertisement | Ad ID |
| `userId` | String | FK -> User | Viewer |
| `tenantId` | String | FK -> Tenant | Tenant |
| `studentId` | String | Nullable, FK -> Student | Related student |
| `impressionType` | Enum | - | VIEW / CLICK |
| `createdAt` | DateTime | Default: now | Timestamp |

**Indexes:** `adId`, `userId`, `tenantId`, `studentId`, `impressionType`, `createdAt`

---

### 28. SubscriptionPlan

Platform subscription tier definitions.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `name` | String | Unique | Plan name |
| `priceMonthly` | Decimal | Decimal(10,2) | Monthly price |
| `priceYearly` | Decimal | Decimal(10,2) | Yearly price |
| `maxSchools` | Int | Nullable | Max schools (for platform) |
| `maxUsersPerSchool` | Int | Nullable | Max users per school |
| `features` | Json | - | Feature list array |
| `isActive` | Boolean | Default: true | Active status |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `isActive`

---

### 29. SchoolSubscription

Tenant subscription records.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant |
| `planId` | String | FK -> SubscriptionPlan | Plan |
| `status` | Enum | Default: TRIAL | ACTIVE / TRIAL / EXPIRED / CANCELLED |
| `startDate` | DateTime | - | Start date |
| `endDate` | DateTime | - | End date |
| `amountPaid` | Decimal | Nullable, Decimal(10,2) | Paid amount |
| `paymentMethod` | String | Nullable | Payment method |
| `autoRenew` | Boolean | Default: false | Auto-renewal |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `planId`, `status`, `endDate`

---

### 30. LoginHistory

User login attempt tracking.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `userId` | String | FK -> User | User ID |
| `ipAddress` | String | Nullable | IP address |
| `userAgent` | String | Nullable, Text | Browser/device info |
| `deviceType` | String | Nullable | Device type |
| `location` | String | Nullable | Geolocation |
| `status` | Enum | - | SUCCESS / FAILED |
| `failureReason` | String | Nullable, Text | Failure reason |
| `createdAt` | DateTime | Default: now | Timestamp |

**Indexes:** `userId`, `status`, `createdAt`

---

### 31. AuditLog

Comprehensive audit trail for all data changes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant |
| `userId` | String | Nullable, FK -> User | Actor |
| `action` | String | - | Action performed |
| `entityType` | String | - | Affected entity type |
| `entityId` | String | - | Affected entity ID |
| `oldValues` | Json | Nullable | Previous values |
| `newValues` | Json | Nullable | New values |
| `ipAddress` | String | Nullable | Actor IP |
| `createdAt` | DateTime | Default: now | Timestamp |

**Indexes:** `tenantId`, `userId`, `action`, `entityType`, `entityId`, `createdAt`

---

### 32. GradingScheme

Per-school grade boundary definitions.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `name` | String | - | Scheme name |
| `isDefault` | Boolean | Default: false | Default scheme |
| `grades` | Json | - | Grade boundaries array |
| `academicYear` | String | - | Academic year |
| `createdAt` | DateTime | Default: now | Creation timestamp |

**Indexes:** `tenantId`, `academicYear`
**Unique:** `[tenantId, isDefault]`

---

### 33. Setting

Per-school configuration settings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `tenantId` | String | FK -> Tenant | Tenant isolation |
| `key` | String | - | Setting key |
| `value` | String | Text | Setting value |
| `category` | Enum | Default: GENERAL | GENERAL / ACADEMIC / FEE / COMMUNICATION / NOTIFICATION |
| `description` | String | Nullable | Description |
| `createdAt` | DateTime | Default: now | Creation timestamp |
| `updatedAt` | DateTime | Auto-update | Last update |

**Indexes:** `tenantId`, `category`, `key`
**Unique:** `[tenantId, key]`

---

## Relationships Diagram

```
Tenant (1)
  ├── User (N)
  │     ├── Principal (1) [role=PRINCIPAL]
  │     ├── SchoolAdmin (1) [role=ADMIN]
  │     ├── Teacher (1) [role=TEACHER]
  │     │     ├── TeacherSubject (N) [junction]
  │     │     ├── ClassSchedule (N)
  │     │     ├── Attendance (N) [as marker]
  │     │     ├── Homework (N)
  │     │     ├── Mark (N)
  │     │     └── Result (N) [as generator]
  │     ├── Student (1) [role=STUDENT]
  │     │     ├── StudentParent (N) [junction]
  │     │     ├── Attendance (N)
  │     │     ├── HomeworkSubmission (N)
  │     │     ├── Mark (N)
  │     │     ├── Result (N)
  │     │     ├── FeeRecord (N)
  │     │     └── ReportRequest (N)
  │     ├── Parent (1) [role=PARENT]
  │     │     ├── StudentParent (N) [junction]
  │     │     └── ReportRequest (N)
  │     ├── Message (N) [sent]
  │     ├── Message (N) [received]
  │     ├── Notification (N) [received]
  │     ├── LoginHistory (N)
  │     └── AuditLog (N)
  ├── Class (N)
  │     ├── Section (N)
  │     ├── ClassSchedule (N)
  │     ├── Student (N)
  │     ├── TeacherSubject (N)
  │     ├── Attendance (N)
  │     ├── Homework (N)
  │     ├── Mark (N)
  │     ├── Result (N)
  │     ├── FeeStructure (N)
  │     └── Announcement (N) [target]
  ├── Section (N)
  │     ├── ClassSchedule (N)
  │     ├── Student (N)
  │     ├── TeacherSubject (N)
  │     ├── Teacher (N) [as section teacher]
  │     ├── Attendance (N)
  │     ├── Homework (N)
  │     ├── Mark (N)
  │     └── Result (N)
  ├── Subject (N)
  │     ├── TeacherSubject (N)
  │     ├── ClassSchedule (N)
  │     ├── Mark (N)
  │     ├── Homework (N)
  │     └── ResultDetail (N)
  ├── FeeStructure (N)
  │     └── FeeRecord (N)
  ├── Message (N)
  ├── Notification (N)
  ├── Announcement (N)
  ├── ReportRequest (N)
  ├── SchoolSubscription (N)
  ├── AdImpression (N)
  ├── GradingScheme (N)
  ├── Setting (N)
  └── AuditLog (N)

SubscriptionPlan (1)
  └── SchoolSubscription (N)

Advertisement (1)
  └── AdImpression (N)
```

---

## Indexing Strategy

### Primary Indexes

Every table has a primary index on its `id` field (UUID). This ensures fast lookups by primary key.

### Foreign Key Indexes

All foreign key columns are indexed for efficient joins:
- `tenantId` on every tenant-scoped table
- `userId`, `studentId`, `teacherId` on relationship tables
- `classId`, `sectionId`, `subjectId` on academic tables

### Performance Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `User` | `[email, tenantId]` | Fast login lookup |
| `User` | `role` | Role-based filtering |
| `User` | `uniqueId` | Public profile lookup |
| `Student` | `[rollNumber, tenantId]` | Roll number lookup |
| `Student` | `status` | Active student filtering |
| `Class` | `academicYear` | Year-based filtering |
| `Section` | `[classId, name]` | Unique section per class |
| `TeacherSubject` | `[teacherId, subjectId, classId, sectionId, academicYear]` | Unique assignment |
| `ClassSchedule` | `[classId, sectionId, dayOfWeek, periodNumber, academicYear]` | Timetable conflict check |
| `Attendance` | `[studentId, date, periodNumber]` | Unique attendance per student per period |
| `HomeworkSubmission` | `[homeworkId, studentId]` | Unique submission per student |
| `Result` | `[studentId, academicYear, term]` | Unique result per term |
| `FeeRecord` | `status`, `dueDate` | Overdue fee queries |
| `Announcement` | `priority`, `isPinned`, `expiresAt`, `createdAt` | Feed sorting |
| `AuditLog` | `createdAt`, `action`, `entityType` | Audit queries |

---

## Soft Delete Implementation

Acadivo uses a **status-based soft delete** approach rather than a deleted-at timestamp.

### Implementation Pattern

```prisma
enum StudentStatus {
  ACTIVE
  INACTIVE
  GRADUATED
  SUSPENDED
}

model Student {
  status StudentStatus @default(ACTIVE)
  // ... other fields
}
```

### Query Patterns

```typescript
// Active records only
const activeStudents = await prisma.student.findMany({
  where: {
    tenantId: currentTenantId,
    status: 'ACTIVE'
  }
});

// Soft delete (deactivate)
await prisma.student.update({
  where: { userId: studentId },
  data: { status: 'INACTIVE' }
});

// Hard delete (rare, for GDPR compliance)
await prisma.student.delete({
  where: { userId: studentId }
});
```

### Benefits

- Historical data preservation
- Easy recovery of "deleted" records
- Audit trail completeness
- Referential integrity maintenance

---

## Tenant Isolation Explanation

### Shared Database Strategy

Acadivo uses a **shared database with row-level isolation**:

1. **Every table** has a `tenantId` column (except platform-level tables)
2. **Prisma middleware** automatically adds `tenantId` filter to all queries
3. **API layer** validates the user belongs to the requested tenant
4. **No cross-tenant queries** are possible without explicit authorization

### Tenant Isolation Middleware

```typescript
prisma.$use(async (params, next) => {
  if (params.model && params.args) {
    const tenantModels = [
      'User', 'Student', 'Teacher', 'Parent',
      'Class', 'Section', 'Subject', 'Attendance',
      'Homework', 'Mark', 'Result', 'FeeRecord'
    ];
    
    if (tenantModels.includes(params.model)) {
      const tenantId = getCurrentTenantId();
      
      if (params.args.where) {
        params.args.where.tenantId = tenantId;
      } else {
        params.args.where = { tenantId };
      }
    }
  }
  
  return next(params);
});
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **Cost Efficiency** | Single database reduces hosting costs |
| **Easy Scaling** | Add tenants without infrastructure changes |
| **Centralized Management** | Backup, monitoring, and maintenance are simpler |
| **Fast Provisioning** | New school setup in under 2 minutes |
| **Shared Features** | Platform-wide announcements and ads work seamlessly |

### Trade-offs

| Trade-off | Mitigation |
|-----------|-----------|
| Data isolation risk | Prisma middleware + API validation + audit logging |
| Noisy neighbor effect | Query timeouts, connection pooling, rate limiting |
| Custom schema needs | Per-tenant settings table for customization |

---

## Migration Guide

### Creating a Migration

```bash
cd packages/api

# Create migration from schema changes
npx prisma migrate dev --name add-homework-attachments

# This will:
# 1. Create a new migration file in prisma/migrations/
# 2. Apply the migration to the development database
# 3. Regenerate the Prisma client
```

### Migration File Structure

```
prisma/migrations/
├── 20240115000000_init/
│   └── migration.sql
├── 20240120000000_add_fee_discount/
│   └── migration.sql
├── 20240201000000_add_homework_attachments/
│   └── migration.sql
└── migration_lock.toml
```

### Applying Migrations

**Development:**
```bash
npx prisma migrate dev
```

**Production:**
```bash
npx prisma migrate deploy
```

### Resolving Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Reset all migrations (development only!)
npx prisma migrate reset

# Resolve a failed migration
npx prisma migrate resolve --applied <migration_name>
```

### Seeding

```bash
# Run seed script
npx prisma db seed

# Seed is defined in prisma/seed.ts
```

---

*For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).*
*For API reference, see [API.md](./API.md).*
