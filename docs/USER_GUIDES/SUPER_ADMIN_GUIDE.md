# Super Admin User Guide

Complete guide for Super Admin users of the Acadivo platform.

---

## Table of Contents

- [Role Description](#role-description)
- [Dashboard Overview](#dashboard-overview)
- [Managing Schools/Tenants](#managing-schoolstenants)
- [Platform Analytics](#platform-analytics)
- [Subscription Management](#subscription-management)
- [Advertisement Management](#advertisement-management)
- [Platform Announcements](#platform-announcements)
- [User Management](#user-management)
- [Audit Logs](#audit-logs)
- [FAQ](#faq)
- [Tips and Tricks](#tips-and-tricks)

---

## Role Description

The **Super Admin** is the platform-level administrator responsible for managing the entire Acadivo ecosystem. This role has the highest level of access and can:

- Create and manage schools/tenants
- View platform-wide analytics
- Manage subscription plans
- Create and manage advertisements
- Post platform-wide announcements
- View audit logs for security monitoring
- Configure platform settings

> **Note:** Super Admin access should be limited to trusted personnel only. Do not share Super Admin credentials.

---

## Dashboard Overview

When you log in as a Super Admin, you see the **Platform Dashboard**.

### Dashboard Sections

| Section | Description |
|---------|-------------|
| **Total Schools** | Number of registered schools/colleges |
| **Active Users** | Total users across all tenants |
| **Revenue** | Monthly recurring revenue from subscriptions |
| **Platform Health** | API uptime, error rates, response times |
| **Recent Activity** | Latest actions across the platform |
| **Pending Approvals** | Schools awaiting activation |

### Screenshot Placeholder
![Super Admin Dashboard](../assets/screenshots/super-admin-dashboard.png)
*The Super Admin dashboard shows platform-wide metrics and quick action buttons.*

---

## Managing Schools/Tenants

### Creating a New School

1. Navigate to **Schools > Add School**
2. Fill in the school details:
   - **Name**: Full name of the institution
   - **Code**: Unique identifier (e.g., `gps-islamabad-001`)
   - **Type**: School / College / University
   - **City**: City where the school is located
   - **Address**: Complete address
   - **Phone**: Contact phone number
   - **Email**: Official email address
   - **Subscription Plan**: FREE / BASIC / STANDARD / PREMIUM
3. Enter **Principal Details**:
   - First name, last name, email, phone
4. Click **Create School**
5. The principal will receive an email with login credentials

### Activating a School

1. Go to **Schools > Pending**
2. Find the school in the list
3. Click the **Activate** button
4. Confirm activation
5. The school status changes to **ACTIVE**

### Suspending a School

1. Go to **Schools > Active**
2. Find the school you want to suspend
3. Click **More Actions > Suspend**
4. Enter a reason for suspension
5. The school will be suspended immediately
6. All school users will see a suspension notice on login

### Viewing School Details

1. Go to **Schools > All Schools**
2. Click on any school name
3. View:
   - School profile and contact info
   - User count by role
   - Subscription details
   - Recent activity
   - Resource usage (storage, bandwidth)

---

## Platform Analytics

### Overview

The Analytics section provides insights into platform usage and performance.

### Available Reports

| Report | Description |
|--------|-------------|
| **User Growth** | New users registered per month |
| **Active Sessions** | Daily active users (DAU) and monthly active users (MAU) |
| **Revenue Trends** | Subscription revenue over time |
| **School Growth** | New schools registered per month |
| **Feature Usage** | Most used features across the platform |
| **Error Rates** | API errors and their frequency |
| **Geographic Distribution** | Schools by city and province |

### Generating a Report

1. Go to **Analytics > Reports**
2. Select the report type
3. Choose date range
4. Click **Generate Report**
5. Download as PDF or Excel

---

## Subscription Management

### Subscription Plans

| Plan | Max Teachers | Max Students | Price/Month |
|------|-------------|-------------|-------------|
| **FREE** | 3 | 50 | Rs. 0 |
| **BASIC** | 10 | 200 | Rs. 2,500 |
| **STANDARD** | 25 | 500 | Rs. 5,000 |
| **PREMIUM** | Unlimited | Unlimited | Rs. 10,000 |

### Managing Subscriptions

1. Go to **Subscriptions > All**
2. View all active, trial, and expired subscriptions
3. Filter by status, plan, or date range
4. Actions available:
   - **Upgrade**: Move to a higher plan
   - **Downgrade**: Move to a lower plan
   - **Renew**: Extend subscription period
   - **Cancel**: Cancel subscription (school becomes FREE)

### Trial Periods

- New schools get a **14-day FREE trial** of the STANDARD plan
- During trial, all STANDARD features are available
- No payment required during trial
- Automatic downgrade to FREE if not upgraded

---

## Advertisement Management

### Creating an Advertisement

1. Go to **Advertisements > Create**
2. Fill in ad details:
   - **Title**: Ad headline (max 100 characters)
   - **Description**: Ad body text (max 500 characters)
   - **Image**: Upload ad image (recommended: 1200x628px)
   - **Link URL**: Where users go when they click
   - **Target Audience**: ALL / STUDENTS / PARENTS / TEACHERS / PRINCIPALS / ADMIN
   - **Target Cities**: Select specific cities or all
   - **Target School Types**: SCHOOL / COLLEGE / UNIVERSITY / ALL
   - **Start Date**: When the ad goes live
   - **End Date**: When the ad expires
   - **Priority**: Higher priority ads show first (0-10)
3. Click **Publish**
4. Ad status becomes **PENDING** until approved

### Ad Approval

1. Go to **Advertisements > Pending**
2. Review the ad content
3. Click **Approve** or **Reject**
4. If rejected, provide a reason

### Ad Statistics

1. Go to **Advertisements > Statistics**
2. View metrics for each ad:
   - **Impressions**: How many times the ad was shown
   - **Clicks**: How many times the ad was clicked
   - **CTR**: Click-through rate (clicks / impressions)
   - **Reach**: Unique users who saw the ad

---

## Platform Announcements

### Posting an Announcement

1. Go to **Announcements > New**
2. Fill in details:
   - **Title**: Announcement headline
   - **Content**: Full announcement text
   - **Priority**: LOW / NORMAL / HIGH / URGENT
   - **Target Audience**: All schools or specific schools
   - **Attachments**: Optional files (PDF, images)
3. Click **Post**
4. Announcement is delivered to all targeted users

### Announcement Priority Levels

| Priority | Use Case | Delivery |
|----------|----------|----------|
| **LOW** | General updates | In-app only |
| **NORMAL** | Scheduled maintenance | In-app + email |
| **HIGH** | Feature releases | In-app + email + push |
| **URGENT** | Security updates | In-app + email + push + SMS |

---

## User Management

### Viewing All Users

1. Go to **Users > All Users**
2. Filter by:
   - Role (Super Admin, Principal, Admin, Teacher, Student, Parent)
   - School/Tenant
   - Status (Active, Inactive)
   - Date range
3. Search by name, email, or unique ID

### Managing Users

1. Find the user in the list
2. Click on the user to view details
3. Available actions:
   - **View Profile**: See all user details
   - **Deactivate**: Disable account temporarily
   - **Reset Password**: Send password reset email
   - **Delete**: Permanently remove account

---

## Audit Logs

### What is Logged

Every action on the platform is recorded for security and compliance:

| Action | Details Captured |
|--------|---------------|
| Login | IP address, device, location, timestamp, status |
| Data changes | User, entity type, old values, new values |
| User creation | Creator, created user details, timestamp |
| Deletion | Who deleted, what was deleted, timestamp |
| Permission changes | Who changed, what changed, old/new permissions |

### Viewing Audit Logs

1. Go to **Security > Audit Logs**
2. Filter by:
   - Date range
   - User
   - Action type
   - Entity type
3. Export logs as CSV for offline analysis

### Retention Policy

- Audit logs are retained for **2 years**
- After 2 years, logs are archived to cold storage
- Login history is retained for **1 year**

---

## FAQ

**Q: Can a Super Admin access school-specific data?**
A: Yes, Super Admins can view all data across all tenants for support and monitoring purposes. However, this access is logged in the audit log.

**Q: How do I handle a school that stopped paying?**
A: Go to Schools > Active, find the school, and click Suspend. The school will be downgraded to the FREE plan with limited features.

**Q: Can I customize subscription plans per school?**
A: Not directly. Create custom plans under Subscriptions > Plans. All schools using that plan will have the same limits.

**Q: What happens if the platform goes down?**
A: Schools can still access cached data on mobile apps. Web access will be unavailable. We recommend having a status page at status.acadivo.com.pk.

**Q: How do I add a new Super Admin?**
A: Go to Users > Add User, select role "Super Admin", and fill in the details. The new Super Admin will receive an email to set their password.

---

## Tips and Tricks

1. **Bulk Operations**: Use the checkbox on the schools list to perform bulk actions (activate, suspend, delete)

2. **Export Data**: All tables support CSV export for reporting and analysis

3. **Keyboard Shortcuts**:
   - `Ctrl + K`: Quick search
   - `Ctrl + N`: Create new item
   - `Escape`: Close modal dialogs

4. **Dark Mode**: Toggle dark mode from the top-right profile menu for comfortable night-time use

5. **Notifications**: Enable browser notifications to get real-time alerts about pending approvals and critical issues

6. **Mobile Access**: The Super Admin dashboard is fully responsive. You can manage the platform from your mobile device.

7. **Scheduled Announcements**: Write announcements in advance and schedule them to post at a specific time

---

*For other user guides, see the [User Guides directory](../USER_GUIDES/).*
