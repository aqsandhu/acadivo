# Changelog

All notable changes to the Acadivo platform will be documented in this file.

---

## [1.0.0] - Initial Release

### Platform Foundation

- Multi-tenant SaaS architecture with shared database and `tenantId` row-level isolation
- Turborepo monorepo structure for scalable development
- Docker Compose development and production configurations
- GitHub Actions CI/CD pipeline setup

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC) with 6 user roles
- Two-factor authentication (2FA) via TOTP and SMS OTP
- Account lockout after failed login attempts
- Password reset via secure token links
- Login history tracking with IP and device info

### User Management
- Super Admin: Platform-wide management
- Principal: School overview and oversight
- School Admin: Day-to-day user and academic management
- Teacher: Classroom management and grading
- Student: Self-service academic portal
- Parent: Child progress monitoring and fee payment

### School/College Management
- Tenant provisioning with subscription plans (FREE, BASIC, STANDARD, PREMIUM)
- School profile management with logo upload
- User bulk import via Excel
- Class, section, and subject management
- Teacher-subject-class-section assignment
- Weekly timetable builder with conflict detection

### Attendance System
- Daily and period-wise attendance marking
- Bulk attendance entry with present/absent/late/leave/half-day status
- Attendance summary and analytics
- Low attendance alerts (< 75%)
- Monthly attendance reports

### Homework Management
- Homework creation with title, description, attachments, and due date
- Student submission with text and file uploads
- Teacher grading with marks and feedback
- Submission status tracking (pending, submitted, late, graded)
- Automatic notifications to students

### Marks & Results
- Subject-wise marks entry with exam type classification
- Automatic grade calculation based on school grading scheme
- Customizable grading schemes per school
- Term-wise result compilation
- Result card generation with PDF download
- Rank calculation within class/section

### Fee Management
- Fee structure creation (tuition, admission, exam, lab, sports, library, transport)
- Multiple frequencies: monthly, quarterly, yearly, one-time
- Automatic fee record generation for all students
- Late fee calculation
- Payment recording (cash, bank transfer, JazzCash, EasyPaisa)
- Online payment integration with JazzCash/EasyPaisa
- PDF receipt generation
- Overdue fee tracking and automated reminders

### Communication
- Real-time messaging between all user roles
- Message types: text, image, file, voice
- Read receipts and typing indicators
- School announcements with priority levels
- Targeted announcements (all, teachers, students, parents, specific classes)
- Pinned announcements
- Notification center with categorized alerts
- Push notifications via Firebase Cloud Messaging
- SMS alerts via Twilio, JazzCash, and Zong APIs

### Q&A Forum
- Students and parents can ask questions
- Teachers can answer questions
- Subject-based categorization
- Upvoting system for helpful answers
- Question and answer history

### Report System
- Progress reports, attendance reports, behavior reports, comprehensive reports
- Parent report requests to teachers
- Report generation with PDF download
- Teacher approval workflow for report requests

### Advertisement System
- Super Admin managed advertisements
- Targeting by audience, city, and school type
- Impression and click tracking
- Priority-based ad serving
- Active/pending/expired status management

### Mobile Application
- Flutter 3.x cross-platform app (Android + iOS)
- Role-based screens for all 6 user types
- Offline support with sync queue
- Urdu and English language support
- Push notification handling
- File upload and download

### Web Application
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS styling
- Role-based route protection
- Real-time Socket.io integration
- Urdu and English i18n
- Responsive design for all devices

### Security
- Password hashing with bcrypt (cost factor 12)
- HTTPS enforcement with TLS 1.3
- Rate limiting (IP and user-based)
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- XSS protection with Content Security Policy
- CSRF token validation
- Comprehensive audit logging

### Database
- PostgreSQL 15 with Prisma 5 ORM
- 33 models with complete relationships
- Soft delete support
- Indexed queries for performance
- Connection pooling
- Migration system

### Infrastructure
- Docker and Docker Compose configurations
- Nginx reverse proxy with SSL
- Redis for caching, sessions, and Socket.io pub/sub
- Cloudinary for file storage
- Firebase for push notifications
- Winston logging with rotation
- Health check endpoints

---

## Known Issues

### Critical
- None identified at this time

### Medium Priority
1. **Offline sync conflicts**: When multiple edits are made offline, the sync queue may occasionally apply updates in incorrect order
2. **SMS delivery in remote areas**: JazzCash/Zong SMS delivery may be delayed in areas with poor cellular coverage
3. **Large file uploads**: Files > 15MB may timeout on slow connections

### Low Priority
1. **Urdu text alignment**: Some Urdu text may not align perfectly right-to-left in PDF exports
2. **Notification grouping**: Push notifications are not yet grouped by type on iOS
3. **Search performance**: Search across large student lists (>5000) may take 2-3 seconds

---

## Future Roadmap

### Phase 2 - Enhanced Features (Q2 2025)

- **Transport Management**: Bus routes, stops, student transport assignments
- **Library Management**: Book catalog, issue/return tracking, fines
- **Inventory Management**: School assets, equipment tracking
- **Canteen Management**: Digital menu, prepaid cards, sales tracking
- **Online Exams**: Digital quiz creation with timer and auto-grading
- **Parent-Teacher Meetings**: Schedule and manage PTM slots
- **Certificate Generation**: Auto-generate character certificates, bonafide certificates
- **Admission Management**: Online admission forms, merit lists, waiting lists
- **Staff Payroll**: Teacher and staff salary management
- **Multi-branch Support**: Manage multiple campuses under one tenant

### Phase 3 - AI & Analytics (Q3 2025)

- **AI-Powered Insights**: Predict student performance based on attendance and marks trends
- **Automated Reporting**: AI-generated monthly progress summaries
- **Smart Timetable**: AI-optimized timetable based on teacher preferences and workload
- **Chatbot Assistant**: 24/7 chatbot for student and parent queries
- **Voice Commands**: Urdu and English voice commands for mobile app
- **Anomaly Detection**: Automatic flagging of unusual patterns (fee fraud, attendance manipulation)

### Phase 4 - Ecosystem (Q4 2025)

- **Parent Community**: Forum for parents to connect and share
- **Teacher Marketplace**: Share lesson plans, worksheets, and resources
- **Integration with Government Systems**: PEC, FBISE result integration
- **White-label Solution**: Custom branding for large school chains
- **API Marketplace**: Third-party integrations for textbooks, uniforms, supplies

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024 | Initial release with all core features |

---

For upcoming features and to request new functionality, please contact the Acadivo team at support@acadivo.com.pk.
