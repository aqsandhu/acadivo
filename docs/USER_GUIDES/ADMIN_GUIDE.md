# School Admin User Guide

Complete guide for School Administrators using the Acadivo platform.

---

## Table of Contents

- [Role Description](#role-description)
- [Dashboard Overview](#dashboard-overview)
- [User Management](#user-management)
- [Class and Section Management](#class-and-section-management)
- [Subject Management](#subject-management)
- [Timetable Builder](#timetable-builder)
- [Fee Management](#fee-management)
- [School Settings](#school-settings)
- [Announcements](#announcements)
- [FAQ](#faq)
- [Tips and Tricks](#tips-and-tricks)

---

## Role Description

The **School Admin** is the operational manager of a school. School Admins handle day-to-day administrative tasks including:

- Adding and managing users (teachers, students, parents)
- Creating classes, sections, and subjects
- Building the school timetable
- Managing fee structures and payments
- Posting school announcements
- Configuring school settings

> **Note:** School Admins work under the Principal's oversight. Some sensitive actions may require Principal approval.

---

## Dashboard Overview

The Admin Dashboard shows your daily tasks and school status.

### Dashboard Sections

| Section | Description |
|---------|-------------|
| **Quick Stats** | Total users, classes, pending tasks |
| **Recent Activity** | Latest user additions, fee payments |
| **Pending Approvals** | Items needing attention |
| **Today's Schedule** | Overview of classes and activities |
| **Fee Summary** | This month's collection status |
| **Birthdays Today** | Students and staff with birthdays |

### Screenshot Placeholder
![Admin Dashboard](../assets/screenshots/admin-dashboard.png)
*The School Admin dashboard shows operational metrics and task reminders.*

---

## User Management

### Adding a Teacher

1. Go to **Users > Teachers > Add Teacher**
2. Fill in details:
   - First name, last name
   - Email (used for login)
   - Phone number
   - CNIC (for verification)
   - Gender
   - Qualifications
   - Specialization
   - Experience (years)
   - Joining date
   - Address
3. Assign subjects (optional, can be done later)
4. Click **Add Teacher**
5. Teacher receives email with login credentials

### Adding a Student

1. Go to **Users > Students > Add Student**
2. Fill in details:
   - First name, last name
   - Email (optional for young students)
   - Phone
   - Gender
   - Date of birth
   - Address and city
   - Roll number (unique)
   - Class and section
   - Guardian name, phone, relation, CNIC
   - Blood group
   - Medical notes
3. Click **Add Student**
4. If a parent email is provided, a parent account is auto-created

### Adding a Parent

1. Go to **Users > Parents > Add Parent**
2. Fill in:
   - First name, last name
   - Email and phone
   - Occupation
   - Emergency contact
3. Link to children:
   - Select existing students from dropdown
   - Specify relation (Father, Mother, Guardian)
   - Mark primary contact
4. Click **Add Parent**
5. Parent receives email to set password

### Bulk Import

For adding many users at once:

1. Go to **Users > Bulk Import**
2. Download the Excel template
3. Fill in user data following the template format
4. Upload the filled file
5. Review the preview
6. Click **Confirm Import**

### Editing and Deactivating Users

1. Go to the user list (Teachers/Students/Parents)
2. Find the user and click **Edit**
3. Update fields as needed
4. Click **Save**

To deactivate:
1. Find the user
2. Click **More Actions > Deactivate**
3. The user can no longer log in but data is preserved

---

## Class and Section Management

### Creating a Class

1. Go to **Academics > Classes > Add Class**
2. Fill in:
   - Class name (e.g., "10th Grade")
   - Grade level (e.g., "10")
   - Academic year (e.g., "2024-2025")
   - Room number (optional)
   - Capacity (default 30)
3. Click **Create Class**

### Creating a Section

1. Go to **Academics > Classes > [Class Name] > Add Section**
2. Fill in:
   - Section name (e.g., "A", "B", "C")
   - Capacity (default 30)
   - Room number (optional)
3. Click **Create Section**

### Assigning Class Teacher

1. Go to **Academics > Classes > [Class Name]**
2. Click **Assign Class Teacher**
3. Select a teacher from the dropdown
4. The teacher will be notified

### Viewing Class Roster

1. Go to **Academics > Classes > [Class Name] > [Section Name]**
2. View all students in the section
3. Export roster as PDF or Excel

---

## Subject Management

### Adding a Subject

1. Go to **Academics > Subjects > Add Subject**
2. Fill in:
   - Subject name (e.g., "Mathematics")
   - Subject code (e.g., "MATH-10")
   - Description (optional)
   - Credit hours (default 3)
3. Click **Add Subject**

### Assigning Subjects to Teachers

1. Go to **Academics > Teacher Subjects**
2. Click **Assign Subject**
3. Select:
   - Teacher
   - Subject
   - Class
   - Section
   - Academic year
4. Click **Assign**
5. The teacher can now mark attendance and enter marks for this class/subject

### Viewing Subject Assignments

1. Go to **Academics > Teacher Subjects**
2. Filter by teacher, class, or subject
3. View all assignments in a table format
4. Click **Edit** to change or **Delete** to remove

---

## Timetable Builder

### Creating a Timetable Entry

1. Go to **Academics > Timetable**
2. Select:
   - Class
   - Section
   - Day of week
   - Period number
3. Assign:
   - Subject
   - Teacher (dropdown shows only teachers assigned to this subject/class)
   - Start time (e.g., "08:00")
   - End time (e.g., "08:45")
   - Room number (optional)
4. Click **Add Entry**

### Timetable Rules

- Each class-section combination has one timetable
- Maximum 8 periods per day
- A teacher cannot be assigned to two classes at the same time
- The system warns if there's a conflict

### Viewing the Timetable

1. Go to **Academics > Timetable**
2. Select class and section
3. View the weekly schedule in a grid format
4. Export as PDF or image

### Editing the Timetable

1. Find the entry in the timetable grid
2. Click **Edit** to change subject, teacher, or time
3. Or click **Delete** to remove the entry
4. Changes are immediately visible to teachers and students

---

## Fee Management

### Creating a Fee Structure

1. Go to **Fee > Structures > Create**
2. Fill in:
   - Fee type: TUITION / ADMISSION / EXAM / LAB / SPORTS / LIBRARY / TRANSPORT / MISC
   - Amount (e.g., 5000.00)
   - Frequency: MONTHLY / QUARTERLY / YEARLY / ONE_TIME
   - Due day (e.g., 10th of month)
   - Late fee per day (e.g., 50.00)
   - Class (optional, leave blank for all classes)
   - Academic year
3. Click **Create**

### Generating Fee Records

1. Go to **Fee > Generate Records**
2. Select:
   - Fee structure
   - Month/Period
   - Class (optional)
3. Click **Generate**
4. System creates fee records for all applicable students
5. Parents and students receive notifications

### Recording a Payment

1. Go to **Fee > Records**
2. Find the fee record
3. Click **Record Payment**
4. Fill in:
   - Paid amount
   - Payment method: CASH / BANK_TRANSFER / EASYPAYSA / JAZZCASH
   - Transaction ID (for digital payments)
   - Date
5. Click **Confirm**
6. Receipt is auto-generated and can be printed

### Applying Discounts

1. Find the fee record
2. Click **Apply Discount**
3. Enter:
   - Discount amount
   - Reason (e.g., "Staff child", "Merit scholarship")
4. Final amount is recalculated automatically

### Overdue Fees

1. Go to **Fee > Overdue**
2. View all overdue fee records
3. Actions:
   - **Send Reminder**: Notify parent via app and SMS
   - **Waive**: Cancel fee (with reason)
   - **Extend Due Date**: Give more time

---

## School Settings

### General Settings

1. Go to **Settings > General**
2. Configure:
   - School name and contact info
   - Academic year (e.g., 2024-2025)
   - Default language (English/Urdu)
   - Time zone (Asia/Karachi)
   - Currency (PKR)

### Academic Settings

1. Go to **Settings > Academic**
2. Configure:
   - Grading scheme (default boundaries)
   - Passing percentage
   - Maximum periods per day
   - Class start time
   - Break duration

### Notification Settings

1. Go to **Settings > Notifications**
2. Configure:
   - Auto-reminders for fee payment
   - Attendance alert threshold
   - Homework notification timing
   - SMS vs. in-app notification preferences

---

## Announcements

### Posting an Announcement

1. Go to **Announcements > New**
2. Fill in:
   - Title and content
   - Priority level
   - Target audience (all or specific groups)
   - Attachments (optional)
3. Click **Post**

### Managing Announcements

1. Go to **Announcements > All**
2. View, edit, or delete announcements
3. See view counts and engagement

---

## FAQ

**Q: How do I change a student's class?**
A: Go to Users > Students, find the student, click Edit, and change the Class and Section fields. The change takes effect immediately.

**Q: Can I import students from an Excel file?**
A: Yes! Use the Bulk Import feature. Download the template, fill it, and upload. The system validates the data before importing.

**Q: What happens if two teachers are assigned to the same period?**
A: The timetable builder will show a conflict warning. You must resolve the conflict before saving.

**Q: How do I handle a student who leaves mid-year?**
A: Go to the student's profile, click More Actions > Mark as Inactive (or Graduated if completed). Their data is preserved but they can no longer log in.

**Q: Can parents pay fees online?**
A: Yes, if you have enabled JazzCash/EasyPaisa integration. Parents can pay through the mobile app.

**Q: How do I reset a forgotten password?**
A: Go to the user's profile, click Reset Password. A reset link is sent to their email.

---

## Tips and Tricks

1. **Copy Timetable**: When creating a new academic year, copy the previous year's timetable and make adjustments

2. **Bulk Fee Generation**: Generate fee records for all students at once at the start of each month

3. **Duplicate Prevention**: The system checks for duplicate roll numbers and emails automatically

4. **Quick Search**: Use Ctrl+K to quickly search for any user, class, or subject

5. **Export Rosters**: Export class rosters with parent contact info for emergency use

6. **Attendance Shortcut**: From the timetable view, click any period to quickly mark attendance for that class

7. **Fee Reports**: Generate monthly fee reports on the 1st of each month to track collection

---

*For other user guides, see the [User Guides directory](../USER_GUIDES/).*
