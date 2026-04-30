import { PrismaClient, UserRole, TenantType, TenantStatus, SubscriptionPlan, StudentStatus, ParentRelation, AttendanceStatus, FeeType, FeeFrequency, FeeStatus, PaymentMethod, AnnouncementPriority, AnnouncementTargetAudience, NotificationType, MessageType, ExamType, HomeworkSubmissionStatus, ResultTerm, ResultStatus, ReportRequestStatus, ReportRequestType, SchoolSubscriptionStatus, AdStatus, LoginStatus, SettingCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helper: generate display ID ──
function makeId(role: string, schoolCode: string, num: number): string {
  const pad = (n: number) => String(n).padStart(3, '0');
  return `${role}-${schoolCode}-${pad(num)}`;
}

async function main() {
  console.log('🌱  Seeding Acadivo database…');

  // ───────────────────────────────────────────
  // 1. Subscription Plans
  // ───────────────────────────────────────────
  const planFree = await prisma.platformPlan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      maxSchools: 1,
      maxUsersPerSchool: 50,
      features: JSON.stringify(['basic_dashboard', '1_school']),
    },
  });

  const planStandard = await prisma.platformPlan.upsert({
    where: { name: 'Standard' },
    update: {},
    create: {
      name: 'Standard',
      priceMonthly: 4999.99,
      priceYearly: 49999.99,
      maxSchools: 1,
      maxUsersPerSchool: 500,
      features: JSON.stringify(['advanced_dashboard', 'sms_notifications', 'fee_management', 'result_generation']),
    },
  });

  // ───────────────────────────────────────────
  // 2. Super Admin (global — no tenant)
  // ───────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { uniqueId: 'ADM-SYS-001' },
    update: {},
    create: {
      uniqueId: 'ADM-SYS-001',
      email: 'superadmin@acadivo.com',
      passwordHash: '$2b$10$superadmin.hashplaceholder', // bcrypt hash in production
      role: UserRole.SUPER_ADMIN,
      tenantId: '00000000-0000-0000-0000-000000000000', // dummy tenant for SA
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+92-300-0000000',
      cnic: '00000-0000000-0',
      isActive: true,
      isVerified: true,
    },
  });

  // ───────────────────────────────────────────
  // 3. Sample School Tenant
  // ───────────────────────────────────────────
  const school = await prisma.tenant.upsert({
    where: { code: 'LHR001' },
    update: {},
    create: {
      name: 'Pakistan Grammar School — Lahore',
      code: 'LHR001',
      type: TenantType.SCHOOL,
      city: 'Lahore',
      address: '123 Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan',
      phone: '+92-42-35870001',
      email: 'info@pgs.edu.pk',
      status: TenantStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      subscriptionExpiry: new Date('2025-12-31'),
      maxTeachers: 50,
      maxStudents: 1000,
      createdBy: superAdmin.id,
    },
  });

  // Dummy tenant record for Super Admin
  await prisma.tenant.upsert({
    where: { code: 'SYSTEM' },
    update: {},
    create: {
      name: 'System',
      code: 'SYSTEM',
      type: TenantType.SCHOOL,
      city: 'Islamabad',
      address: 'System Tenant',
      phone: '0000000000',
      email: 'system@acadivo.com',
      status: TenantStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.PREMIUM,
      maxTeachers: 9999,
      maxStudents: 9999,
      createdBy: superAdmin.id,
    },
  });

  // ───────────────────────────────────────────
  // 4. School Subscription
  // ───────────────────────────────────────────
  await prisma.schoolSubscription.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000001',
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: school.id,
      planId: planStandard.id,
      status: SchoolSubscriptionStatus.ACTIVE,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      amountPaid: 49999.99,
      paymentMethod: 'BANK_TRANSFER',
      autoRenew: true,
    },
  });

  // ───────────────────────────────────────────
  // 5. Principal
  // ───────────────────────────────────────────
  const principalUser = await prisma.user.upsert({
    where: { uniqueId: makeId('PRL', 'LHR001', 1) },
    update: {},
    create: {
      uniqueId: makeId('PRL', 'LHR001', 1),
      email: 'principal@pgs.edu.pk',
      passwordHash: '$2b$10$principal.hashplaceholder',
      role: UserRole.PRINCIPAL,
      tenantId: school.id,
      firstName: 'Ahmed',
      lastName: 'Khan',
      phone: '+92-300-1111111',
      cnic: '35201-1234567-1',
      gender: 'MALE',
      city: 'Lahore',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.principal.upsert({
    where: { userId: principalUser.id },
    update: {},
    create: {
      userId: principalUser.id,
      tenantId: school.id,
      qualifications: 'M.Ed, M.Sc Mathematics',
      experience: 20,
      joiningDate: new Date('2015-03-01'),
      bio: 'Experienced educator with 20 years of leadership in Pakistani schools.',
    },
  });

  // ───────────────────────────────────────────
  // 6. School Admin
  // ───────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { uniqueId: makeId('ADM', 'LHR001', 1) },
    update: {},
    create: {
      uniqueId: makeId('ADM', 'LHR001', 1),
      email: 'admin@pgs.edu.pk',
      passwordHash: '$2b$10$admin.hashplaceholder',
      role: UserRole.ADMIN,
      tenantId: school.id,
      firstName: 'Sara',
      lastName: 'Malik',
      phone: '+92-300-2222222',
      cnic: '35201-2345678-2',
      gender: 'FEMALE',
      city: 'Lahore',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.schoolAdmin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      tenantId: school.id,
      department: 'Academic Affairs',
      permissions: JSON.stringify(['manage_students', 'manage_teachers', 'manage_fees', 'view_reports']),
      joiningDate: new Date('2018-07-15'),
    },
  });

  // ───────────────────────────────────────────
  // 7. Classes
  // ───────────────────────────────────────────
  const class10 = await prisma.class.upsert({
    where: { id: 'cls-10-lhr001' },
    update: {},
    create: {
      id: 'cls-10-lhr001',
      tenantId: school.id,
      name: '10th Grade',
      grade: '10',
      roomNumber: '101',
      capacity: 40,
      academicYear: '2024-2025',
      isActive: true,
    },
  });

  const class11 = await prisma.class.upsert({
    where: { id: 'cls-11-lhr001' },
    update: {},
    create: {
      id: 'cls-11-lhr001',
      tenantId: school.id,
      name: '11th Grade',
      grade: '11',
      roomNumber: '201',
      capacity: 35,
      academicYear: '2024-2025',
      isActive: true,
    },
  });

  // ───────────────────────────────────────────
  // 8. Sections
  // ───────────────────────────────────────────
  const sec10A = await prisma.section.upsert({
    where: { id: 'sec-10a-lhr001' },
    update: {},
    create: {
      id: 'sec-10a-lhr001',
      tenantId: school.id,
      classId: class10.id,
      name: 'A',
      roomNumber: '101-A',
      capacity: 20,
      isActive: true,
    },
  });

  const sec10B = await prisma.section.upsert({
    where: { id: 'sec-10b-lhr001' },
    update: {},
    create: {
      id: 'sec-10b-lhr001',
      tenantId: school.id,
      classId: class10.id,
      name: 'B',
      roomNumber: '101-B',
      capacity: 20,
      isActive: true,
    },
  });

  const sec11A = await prisma.section.upsert({
    where: { id: 'sec-11a-lhr001' },
    update: {},
    create: {
      id: 'sec-11a-lhr001',
      tenantId: school.id,
      classId: class11.id,
      name: 'A',
      roomNumber: '201-A',
      capacity: 18,
      isActive: true,
    },
  });

  // ───────────────────────────────────────────
  // 9. Subjects
  // ───────────────────────────────────────────
  const subjectsData = [
    { id: 'sub-math', name: 'Mathematics', code: 'MATH', creditHours: 4 },
    { id: 'sub-phy', name: 'Physics', code: 'PHY', creditHours: 4 },
    { id: 'sub-chem', name: 'Chemistry', code: 'CHEM', creditHours: 4 },
    { id: 'sub-bio', name: 'Biology', code: 'BIO', creditHours: 4 },
    { id: 'sub-eng', name: 'English', code: 'ENG', creditHours: 3 },
    { id: 'sub-urdu', name: 'Urdu', code: 'URD', creditHours: 3 },
    { id: 'sub-pk', name: 'Pakistan Studies', code: 'PKST', creditHours: 2 },
    { id: 'sub-cs', name: 'Computer Science', code: 'CS', creditHours: 3 },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectsData) {
    subjects[s.id] = await prisma.subject.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        tenantId: school.id,
        name: s.name,
        code: s.code,
        creditHours: s.creditHours,
        isActive: true,
      },
    });
  }

  // ───────────────────────────────────────────
  // 10. Teachers
  // ───────────────────────────────────────────
  const teacherUsers: any[] = [];
  const teacherData = [
    { i: 1, fname: 'Imran', lname: 'Hussain', spec: 'Mathematics', sub: 'sub-math', phone: '+92-300-3333331' },
    { i: 2, fname: 'Nadia', lname: 'Pervez', spec: 'Physics', sub: 'sub-phy', phone: '+92-300-3333332' },
    { i: 3, fname: 'Tariq', lname: 'Mehmood', spec: 'Chemistry', sub: 'sub-chem', phone: '+92-300-3333333' },
    { i: 4, fname: 'Faisal', lname: 'Raza', spec: 'English', sub: 'sub-eng', phone: '+92-300-3333334', classTeacher: true },
  ];

  for (const t of teacherData) {
    const u = await prisma.user.upsert({
      where: { uniqueId: makeId('TCH', 'LHR001', t.i) },
      update: {},
      create: {
        uniqueId: makeId('TCH', 'LHR001', t.i),
        email: `teacher${t.i}@pgs.edu.pk`,
        passwordHash: `$2b$10$teacher${t.i}.hashplaceholder`,
        role: UserRole.TEACHER,
        tenantId: school.id,
        firstName: t.fname,
        lastName: t.lname,
        phone: t.phone,
        cnic: `35201-${String(t.i).padStart(4, '0')}567-${t.i}`,
        gender: t.i === 2 ? 'FEMALE' : 'MALE',
        city: 'Lahore',
        isActive: true,
        isVerified: true,
      },
    });

    const teacherProfile = await prisma.teacher.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        tenantId: school.id,
        specialization: t.spec,
        qualifications: `M.${t.spec}, B.Ed`,
        experience: 5 + t.i,
        joiningDate: new Date(`2020-0${t.i}-15`),
        bio: `${t.fname} is a dedicated ${t.spec} teacher with ${5 + t.i} years of experience.`,
        isClassTeacher: t.classTeacher || false,
        assignedClassId: t.classTeacher ? class10.id : null,
        assignedSectionId: t.classTeacher ? sec10A.id : null,
      },
    });

    teacherUsers.push({ user: u, profile: teacherProfile, subjectId: t.sub });
  }

  // ───────────────────────────────────────────
  // 11. Teacher Subjects (junction)
  // ───────────────────────────────────────────
  for (const t of teacherUsers) {
    await prisma.teacherSubject.upsert({
      where: {
        teacherId_subjectId_classId_sectionId_academicYear: {
          teacherId: t.user.id,
          subjectId: t.subjectId,
          classId: class10.id,
          sectionId: sec10A.id,
          academicYear: '2024-2025',
        },
      },
      update: {},
      create: {
        teacherId: t.user.id,
        subjectId: t.subjectId,
        classId: class10.id,
        sectionId: sec10A.id,
        tenantId: school.id,
        academicYear: '2024-2025',
        isActive: true,
      },
    });
  }

  // ───────────────────────────────────────────
  // 12. Students
  // ───────────────────────────────────────────
  const studentUsers: any[] = [];
  const studentData = [
    { i: 1, fname: 'Ali', lname: 'Hassan', roll: '101', gender: 'MALE', guardian: 'Hassan Raza', gPhone: '+92-300-4444441' },
    { i: 2, fname: 'Aisha', lname: 'Noor', roll: '102', gender: 'FEMALE', guardian: 'Noor Ahmed', gPhone: '+92-300-4444442' },
    { i: 3, fname: 'Bilal', lname: 'Khalid', roll: '103', gender: 'MALE', guardian: 'Khalid Mehmood', gPhone: '+92-300-4444443' },
    { i: 4, fname: 'Fatima', lname: 'Sohail', roll: '104', gender: 'FEMALE', guardian: 'Sohail Akram', gPhone: '+92-300-4444444' },
    { i: 5, fname: 'Usman', lname: 'Tariq', roll: '105', gender: 'MALE', guardian: 'Tariq Ali', gPhone: '+92-300-4444445' },
  ];

  for (const s of studentData) {
    const u = await prisma.user.upsert({
      where: { uniqueId: makeId('STD', 'LHR001', s.i) },
      update: {},
      create: {
        uniqueId: makeId('STD', 'LHR001', s.i),
        email: `student${s.i}@pgs.edu.pk`,
        passwordHash: `$2b$10$student${s.i}.hashplaceholder`,
        role: UserRole.STUDENT,
        tenantId: school.id,
        firstName: s.fname,
        lastName: s.lname,
        phone: s.gPhone,
        gender: s.gender as any,
        dateOfBirth: new Date(`2008-0${(s.i % 9) + 1}-15`),
        city: 'Lahore',
        isActive: true,
        isVerified: true,
      },
    });

    const studentProfile = await prisma.student.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        tenantId: school.id,
        rollNumber: s.roll,
        classId: class10.id,
        sectionId: sec10A.id,
        admissionDate: new Date('2022-03-01'),
        guardianName: s.guardian,
        guardianPhone: s.gPhone,
        guardianRelation: 'Father',
        guardianCNIC: `35201-${String(s.i).padStart(4, '0')}111-1`,
        bloodGroup: s.i % 2 === 0 ? 'B+' : 'O+',
        medicalNotes: 'No known allergies',
        status: StudentStatus.ACTIVE,
      },
    });

    studentUsers.push({ user: u, profile: studentProfile });
  }

  // ───────────────────────────────────────────
  // 13. Parents
  // ═══════════════════════════════════════════════════
  const parentUsers: any[] = [];
  for (let i = 1; i <= 3; i++) {
    const p = await prisma.user.upsert({
      where: { uniqueId: makeId('PAR', 'LHR001', i) },
      update: {},
      create: {
        uniqueId: makeId('PAR', 'LHR001', i),
        email: `parent${i}@pgs.edu.pk`,
        passwordHash: `$2b$10$parent${i}.hashplaceholder`,
        role: UserRole.PARENT,
        tenantId: school.id,
        firstName: i === 2 ? 'Saima' : 'Muhammad',
        lastName: i === 2 ? 'Khalid' : `Parent${i}`,
        phone: `+92-300-555555${i}`,
        gender: i === 2 ? 'FEMALE' : 'MALE',
        city: 'Lahore',
        isActive: true,
        isVerified: true,
      },
    });

    const parentProfile = await prisma.parent.upsert({
      where: { userId: p.id },
      update: {},
      create: {
        userId: p.id,
        tenantId: school.id,
        occupation: i === 1 ? 'Businessman' : i === 2 ? 'Doctor' : 'Engineer',
        emergencyContact: `+92-300-666666${i}`,
        emergencyRelation: 'Brother',
      },
    });

    parentUsers.push({ user: p, profile: parentProfile });
  }

  // ───────────────────────────────────────────
  // 14. Student-Parent Links
  // ───────────────────────────────────────────
  const links = [
    { studentIdx: 0, parentIdx: 0, relation: ParentRelation.FATHER, isPrimary: true },
    { studentIdx: 1, parentIdx: 1, relation: ParentRelation.MOTHER, isPrimary: true },
    { studentIdx: 2, parentIdx: 0, relation: ParentRelation.FATHER, isPrimary: true },
    { studentIdx: 3, parentIdx: 1, relation: ParentRelation.MOTHER, isPrimary: true },
    { studentIdx: 4, parentIdx: 2, relation: ParentRelation.GUARDIAN, isPrimary: true },
  ];

  for (const l of links) {
    await prisma.studentParent.upsert({
      where: {
        studentId_parentId: {
          studentId: studentUsers[l.studentIdx].user.id,
          parentId: parentUsers[l.parentIdx].user.id,
        },
      },
      update: {},
      create: {
        studentId: studentUsers[l.studentIdx].user.id,
        parentId: parentUsers[l.parentIdx].user.id,
        relation: l.relation,
        isPrimary: l.isPrimary,
        canPickup: true,
        tenantId: school.id,
      },
    });
  }

  // ───────────────────────────────────────────
  // 15. Class Schedule (Timetable)
  // ───────────────────────────────────────────
  const scheduleSlots = [
    { day: 1, period: 1, sub: 'sub-math', tch: 0 },
    { day: 1, period: 2, sub: 'sub-phy', tch: 1 },
    { day: 1, period: 3, sub: 'sub-eng', tch: 3 },
    { day: 2, period: 1, sub: 'sub-chem', tch: 2 },
    { day: 2, period: 2, sub: 'sub-math', tch: 0 },
    { day: 2, period: 3, sub: 'sub-urdu', tch: 3 },
    { day: 3, period: 1, sub: 'sub-bio', tch: 2 },
    { day: 3, period: 2, sub: 'sub-cs', tch: 0 },
    { day: 3, period: 3, sub: 'sub-pk', tch: 3 },
  ];

  for (const [idx, slot] of scheduleSlots.entries()) {
    await prisma.classSchedule.upsert({
      where: { id: `sched-${idx}-lhr001` },
      update: {},
      create: {
        id: `sched-${idx}-lhr001`,
        tenantId: school.id,
        classId: class10.id,
        sectionId: sec10A.id,
        subjectId: subjects[slot.sub].id,
        teacherId: teacherUsers[slot.tch].user.id,
        dayOfWeek: slot.day,
        periodNumber: slot.period,
        startTime: `${8 + slot.period}:00`,
        endTime: `${9 + slot.period}:00`,
        roomNumber: '101-A',
        academicYear: '2024-2025',
        isActive: true,
      },
    });
  }

  // ───────────────────────────────────────────
  // 16. Attendance
  // ───────────────────────────────────────────
  const today = new Date();
  for (const [idx, stu] of studentUsers.entries()) {
    await prisma.attendance.upsert({
      where: {
        studentId_date_periodNumber: {
          studentId: stu.user.id,
          date: today,
          periodNumber: 1,
        },
      },
      update: {},
      create: {
        tenantId: school.id,
        studentId: stu.user.id,
        classId: class10.id,
        sectionId: sec10A.id,
        date: today,
        status: idx === 2 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        markedBy: teacherUsers[3].user.id,
        periodNumber: 1,
        remarks: idx === 2 ? 'Absent without leave' : undefined,
      },
    });
  }

  // ───────────────────────────────────────────
  // 17. Homework
  // ───────────────────────────────────────────
  const homework = await prisma.homework.upsert({
    where: { id: 'hw-001-lhr001' },
    update: {},
    create: {
      id: 'hw-001-lhr001',
      tenantId: school.id,
      teacherId: teacherUsers[0].user.id,
      classId: class10.id,
      sectionId: sec10A.id,
      subjectId: subjects['sub-math'].id,
      title: 'Quadratic Equations Exercise 4.1',
      description: 'Solve all problems from Exercise 4.1 in your Mathematics textbook. Show all working steps.',
      attachments: JSON.stringify([{ name: 'exercise_4_1.pdf', url: '/uploads/exercise_4_1.pdf' }]),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxMarks: 20,
      isActive: true,
      academicYear: '2024-2025',
    },
  });

  // Homework submissions
  for (const [idx, stu] of studentUsers.entries()) {
    await prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId: homework.id,
          studentId: stu.user.id,
        },
      },
      update: {},
      create: {
        tenantId: school.id,
        homeworkId: homework.id,
        studentId: stu.user.id,
        submissionText: idx === 2 ? undefined : 'Completed all problems.',
        attachments: idx === 2 ? undefined : JSON.stringify([{ name: 'submission.pdf', url: '/uploads/submission.pdf' }]),
        submittedAt: idx === 2 ? undefined : new Date(),
        status: idx === 2 ? HomeworkSubmissionStatus.PENDING : HomeworkSubmissionStatus.SUBMITTED,
        marks: idx === 2 ? undefined : 18,
        feedback: idx === 2 ? undefined : 'Excellent work! Minor calculation error in Q3.',
        gradedBy: idx === 2 ? undefined : teacherUsers[0].user.id,
        gradedAt: idx === 2 ? undefined : new Date(),
      },
    });
  }

  // ───────────────────────────────────────────
  // 18. Marks
  // ───────────────────────────────────────────
  for (const [idx, stu] of studentUsers.entries()) {
    const obtained = 75 + idx * 5;
    await prisma.mark.upsert({
      where: { id: `mark-math-${idx}-lhr001` },
      update: {},
      create: {
        id: `mark-math-${idx}-lhr001`,
        tenantId: school.id,
        studentId: stu.user.id,
        subjectId: subjects['sub-math'].id,
        classId: class10.id,
        sectionId: sec10A.id,
        teacherId: teacherUsers[0].user.id,
        examType: ExamType.QUIZ,
        totalMarks: 100,
        obtainedMarks: obtained,
        percentage: obtained,
        grade: obtained >= 80 ? 'A' : obtained >= 70 ? 'B' : 'C',
        remarks: 'Good performance',
        academicYear: '2024-2025',
      },
    });
  }

  // ───────────────────────────────────────────
  // 19. Result (compiled)
  // ───────────────────────────────────────────
  for (const [idx, stu] of studentUsers.entries()) {
    const total = 600;
    const obtained = 450 + idx * 20;
    const percentage = (obtained / total) * 100;

    const result = await prisma.result.upsert({
      where: {
        studentId_academicYear_term: {
          studentId: stu.user.id,
          academicYear: '2024-2025',
          term: ResultTerm.FIRST,
        },
      },
      update: {},
      create: {
        tenantId: school.id,
        studentId: stu.user.id,
        classId: class10.id,
        sectionId: sec10A.id,
        academicYear: '2024-2025',
        term: ResultTerm.FIRST,
        totalMarks: total,
        obtainedMarks: obtained,
        percentage,
        grade: percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : 'C',
        rank: idx + 1,
        status: ResultStatus.PASS,
        teacherRemarks: 'Consistent performer. Keep up the good work.',
        principalRemarks: 'Satisfactory overall performance.',
        generatedBy: teacherUsers[3].user.id,
      },
    });

    // Result details
    for (const subKey of ['sub-math', 'sub-phy', 'sub-chem', 'sub-eng', 'sub-urdu', 'sub-pk']) {
      const subTotal = 100;
      const subObtained = 70 + Math.floor(Math.random() * 25);
      await prisma.resultDetail.upsert({
        where: {
          id: `rd-${result.id}-${subKey}`,
        },
        update: {},
        create: {
          id: `rd-${result.id}-${subKey}`,
          tenantId: school.id,
          resultId: result.id,
          subjectId: subjects[subKey].id,
          totalMarks: subTotal,
          obtainedMarks: subObtained,
          grade: subObtained >= 80 ? 'A' : subObtained >= 70 ? 'B' : subObtained >= 60 ? 'C' : 'D',
          remarks: subObtained >= 80 ? 'Excellent' : subObtained >= 60 ? 'Good' : 'Needs improvement',
        },
      });
    }
  }

  // ───────────────────────────────────────────
  // 20. Fee Structures
  // ───────────────────────────────────────────
  const feeStructuresData = [
    { id: 'fs-tuition-10', type: FeeType.TUITION, amount: 8000, freq: FeeFrequency.MONTHLY, dueDay: 10 },
    { id: 'fs-admission-10', type: FeeType.ADMISSION, amount: 15000, freq: FeeFrequency.ONE_TIME, dueDay: null },
    { id: 'fs-exam-10', type: FeeType.EXAM, amount: 2000, freq: FeeFrequency.QUARTERLY, dueDay: 1 },
    { id: 'fs-lab-10', type: FeeType.LAB, amount: 3000, freq: FeeFrequency.YEARLY, dueDay: 5 },
  ];

  const feeStructures: any[] = [];
  for (const fs of feeStructuresData) {
    feeStructures.push(
      await prisma.feeStructure.upsert({
        where: { id: fs.id },
        update: {},
        create: {
          id: fs.id,
          tenantId: school.id,
          classId: class10.id,
          feeType: fs.type,
          amount: fs.amount,
          frequency: fs.freq,
          dueDay: fs.dueDay,
          lateFeePerDay: fs.type === FeeType.TUITION ? 50 : null,
          isActive: true,
          academicYear: '2024-2025',
        },
      }),
    );
  }

  // ───────────────────────────────────────────
  // 21. Fee Records
  // ───────────────────────────────────────────
  for (const [idx, stu] of studentUsers.entries()) {
    const finalAmt = 8000;
    const paid = idx === 4 ? 4000 : 8000; // one partial
    await prisma.feeRecord.upsert({
      where: { id: `fr-${stu.user.id}-jan` },
      update: {},
      create: {
        id: `fr-${stu.user.id}-jan`,
        tenantId: school.id,
        studentId: stu.user.id,
        feeStructureId: feeStructures[0].id,
        amount: 8000,
        discountAmount: idx === 0 ? 500 : 0,
        discountReason: idx === 0 ? 'Sibling discount' : undefined,
        finalAmount: finalAmt - (idx === 0 ? 500 : 0),
        paidAmount: paid - (idx === 0 ? 500 : 0),
        balance: idx === 4 ? 4000 : 0,
        status: idx === 4 ? FeeStatus.PARTIAL : FeeStatus.PAID,
        dueDate: new Date('2025-01-10'),
        paidDate: new Date('2025-01-05'),
        paymentMethod: idx === 1 ? PaymentMethod.JAZZCASH : idx === 2 ? PaymentMethod.EASYPAYSA : PaymentMethod.CASH,
        transactionId: `TXN-${stu.user.id.slice(0, 8)}`,
        receiptNumber: `RCP-${stu.user.id.slice(0, 8)}`,
        remarks: 'Fee paid for January 2025',
      },
    });
  }

  // ───────────────────────────────────────────
  // 22. Announcements
  // ───────────────────────────────────────────
  await prisma.announcement.upsert({
    where: { id: 'ann-001-lhr001' },
    update: {},
    create: {
      id: 'ann-001-lhr001',
      tenantId: school.id,
      postedBy: principalUser.id,
      title: 'Winter Vacations Notice',
      content: 'School will remain closed from December 20, 2024 to January 5, 2025 for winter vacations. Classes will resume on January 6, 2025.',
      priority: AnnouncementPriority.HIGH,
      targetAudience: AnnouncementTargetAudience.ALL,
      isPinned: true,
      expiresAt: new Date('2025-01-06'),
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'ann-002-lhr001' },
    update: {},
    create: {
      id: 'ann-002-lhr001',
      tenantId: school.id,
      postedBy: adminUser.id,
      title: 'Mid-Term Examination Schedule',
      content: 'Mid-term examinations for Grade 10 will commence from February 10, 2025. Please check the detailed schedule on the notice board.',
      priority: AnnouncementPriority.URGENT,
      targetAudience: AnnouncementTargetAudience.STUDENTS,
      targetClassId: class10.id,
      isPinned: false,
      expiresAt: new Date('2025-02-15'),
    },
  });

  // ───────────────────────────────────────────
  // 23. Messages
  // ───────────────────────────────────────────
  await prisma.message.upsert({
    where: { id: 'msg-001-lhr001' },
    update: {},
    create: {
      id: 'msg-001-lhr001',
      tenantId: school.id,
      senderId: parentUsers[0].user.id,
      receiverId: teacherUsers[3].user.id,
      content: 'Assalamu Alaikum, I would like to discuss my child\'s progress in English. Can we schedule a meeting?',
      messageType: MessageType.TEXT,
      isRead: false,
    },
  });

  await prisma.message.upsert({
    where: { id: 'msg-002-lhr001' },
    update: {},
    create: {
      id: 'msg-002-lhr001',
      tenantId: school.id,
      senderId: teacherUsers[3].user.id,
      receiverId: parentUsers[0].user.id,
      content: 'Wa Alaikum Assalam. Yes, I am available on Thursday after 2 PM.',
      messageType: MessageType.TEXT,
      isRead: true,
      readAt: new Date(),
    },
  });

  // ───────────────────────────────────────────
  // 24. Notifications
  // ───────────────────────────────────────────
  await prisma.notification.upsert({
    where: { id: 'notif-001-lhr001' },
    update: {},
    create: {
      id: 'notif-001-lhr001',
      tenantId: school.id,
      userId: studentUsers[0].user.id,
      title: 'New Homework Assigned',
      body: 'Mathematics: Quadratic Equations Exercise 4.1. Due in 3 days.',
      type: NotificationType.HOMEWORK,
      data: JSON.stringify({ homeworkId: homework.id, subject: 'Mathematics' }),
      senderId: teacherUsers[0].user.id,
    },
  });

  // ───────────────────────────────────────────
  // 25. Grading Scheme
  // ───────────────────────────────────────────
  await prisma.gradingScheme.upsert({
    where: { id: 'gs-default-lhr001' },
    update: {},
    create: {
      id: 'gs-default-lhr001',
      tenantId: school.id,
      name: 'Default Pakistani Grading',
      isDefault: true,
      grades: JSON.stringify([
        { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
        { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.7 },
        { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gpa: 3.0 },
        { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gpa: 2.0 },
        { grade: 'D', minPercentage: 50, maxPercentage: 59.99, gpa: 1.0 },
        { grade: 'F', minPercentage: 0, maxPercentage: 49.99, gpa: 0.0 },
      ]),
      academicYear: '2024-2025',
    },
  });

  // ───────────────────────────────────────────
  // 26. Settings
  // ───────────────────────────────────────────
  const settingsData = [
    { key: 'school_name', value: 'Pakistan Grammar School — Lahore', category: SettingCategory.GENERAL },
    { key: 'school_phone', value: '+92-42-35870001', category: SettingCategory.GENERAL },
    { key: 'attendance_start_time', value: '08:00', category: SettingCategory.ACADEMIC },
    { key: 'attendance_end_time', value: '14:00', category: SettingCategory.ACADEMIC },
    { key: 'fee_currency', value: 'PKR', category: SettingCategory.FEE },
    { key: 'late_fee_enabled', value: 'true', category: SettingCategory.FEE },
    { key: 'sms_notifications_enabled', value: 'true', category: SettingCategory.NOTIFICATION },
    { key: 'email_notifications_enabled', value: 'true', category: SettingCategory.NOTIFICATION },
    { key: 'parent_messaging_enabled', value: 'true', category: SettingCategory.COMMUNICATION },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: {
        tenantId_key: {
          tenantId: school.id,
          key: s.key,
        },
      },
      update: {},
      create: {
        tenantId: school.id,
        key: s.key,
        value: s.value,
        category: s.category,
        description: `${s.key} configuration for ${school.name}`,
      },
    });
  }

  // ───────────────────────────────────────────
  // 27. Report Request
  // ───────────────────────────────────────────
  await prisma.reportRequest.upsert({
    where: { id: 'rr-001-lhr001' },
    update: {},
    create: {
      id: 'rr-001-lhr001',
      tenantId: school.id,
      parentId: parentUsers[0].user.id,
      studentId: studentUsers[0].user.id,
      teacherId: teacherUsers[3].user.id,
      status: 'PENDING',
      reportType: ReportRequestType.PROGRESS,
      teacherRemarks: null,
      pdfUrl: null,
    },
  });

  // ───────────────────────────────────────────
  // 28. Audit Log
  // ───────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      tenantId: school.id,
      userId: adminUser.id,
      action: 'SCHOOL_CREATED',
      entityType: 'Tenant',
      entityId: school.id,
      oldValues: null,
      newValues: JSON.stringify({ name: school.name, code: school.code }),
      ipAddress: '127.0.0.1',
    },
  });

  // ───────────────────────────────────────────
  // 29. Login History
  // ───────────────────────────────────────────
  await prisma.loginHistory.create({
    data: {
      userId: principalUser.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      deviceType: 'Desktop',
      location: 'Lahore, Punjab, Pakistan',
      status: LoginStatus.SUCCESS,
    },
  });

  // ───────────────────────────────────────────
  // 30. Advertisement (Super Admin managed)
  // ───────────────────────────────────────────
  await prisma.advertisement.upsert({
    where: { id: 'ad-001-acadivo' },
    update: {},
    create: {
      id: 'ad-001-acadivo',
      title: 'Upgrade to Premium',
      description: 'Unlock unlimited students, advanced analytics, and custom branding with Acadivo Premium.',
      imageUrl: 'https://cdn.acadivo.com/ads/premium-banner.jpg',
      linkUrl: 'https://acadivo.com/pricing',
      targetAudience: 'ADMIN',
      targetCities: JSON.stringify(['Lahore', 'Karachi', 'Islamabad']),
      targetSchoolTypes: JSON.stringify(['SCHOOL', 'COLLEGE']),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      priority: 10,
      status: 'ACTIVE',
      createdBy: superAdmin.id,
    },
  });

  console.log('✅  Seed completed successfully!');
  console.log(`   → Subscription Plans: 2`);
  console.log(`   → Tenants: 2 (System + LHR001)`);
  console.log(`   → Users: 1 Super Admin + 1 Principal + 1 Admin + 4 Teachers + 5 Students + 3 Parents = 15`);
  console.log(`   → Classes: 2, Sections: 3, Subjects: 8`);
  console.log(`   → Timetable entries: ${scheduleSlots.length}`);
  console.log(`   → Fee Structures: ${feeStructures.length}`);
  console.log(`   → Results: ${studentUsers.length}`);
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {

  // ───────────────────────────────────────────
  // 14. Default Pakistani Grading Scheme
  // ───────────────────────────────────────────
  await prisma.gradingScheme.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      tenantId: school.id,
      name: 'Pakistani Standard Grading',
      isDefault: true,
      grades: JSON.stringify([
        { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
        { grade: 'A', minPercentage: 80, maxPercentage: 89, gpa: 3.7 },
        { grade: 'B', minPercentage: 70, maxPercentage: 79, gpa: 3.0 },
        { grade: 'C', minPercentage: 60, maxPercentage: 69, gpa: 2.0 },
        { grade: 'D', minPercentage: 50, maxPercentage: 59, gpa: 1.0 },
        { grade: 'F', minPercentage: 0, maxPercentage: 49, gpa: 0.0 },
      ]),
      academicYear: '2024-2025',
    },
  });

  console.log('✅  Pakistani grading scheme seeded');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
