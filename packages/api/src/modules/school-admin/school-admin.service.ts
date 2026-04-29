// ═══════════════════════════════════════════════════
// School Admin Service
// ═══════════════════════════════════════════════════

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { generateUniqueId } from '../../services/user.service';
import { hashPassword } from '../../utils/password';

// ── Dashboard Stats ──

export async function getDashboardStats(tenantId: string) {
  const [
    teacherCount,
    studentCount,
    parentCount,
    classCount,
    sectionCount,
    subjectCount,
    pendingFeeRecords,
    todayAttendance,
  ] = await Promise.all([
    prisma.teacher.count({ where: { tenantId, user: { isActive: true } } }),
    prisma.student.count({ where: { tenantId, status: 'ACTIVE' } }),
    prisma.parent.count({ where: { tenantId, user: { isActive: true } } }),
    prisma.class.count({ where: { tenantId, isActive: true } }),
    prisma.section.count({ where: { tenantId, isActive: true } }),
    prisma.subject.count({ where: { tenantId, isActive: true } }),
    prisma.feeRecord.count({ where: { tenantId, status: 'UNPAID' } }),
    prisma.attendance.count({
      where: { tenantId, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  return {
    teacherCount,
    studentCount,
    parentCount,
    classCount,
    sectionCount,
    subjectCount,
    pendingFeeRecords,
    todayAttendance,
  };
}

// ── Teacher CRUD ──

export async function createTeacher(tenantId: string, schoolCode: string, data: any) {
  const uniqueId = await generateUniqueId(prisma, 'TEACHER', tenantId, schoolCode);
  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        uniqueId,
        email: data.email,
        passwordHash,
        role: 'TEACHER',
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        cnic: data.cnic,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address,
        city: data.city,
      },
    });

    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        tenantId,
        qualifications: data.qualifications,
        specialization: data.specialization,
        experience: data.experience,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
        bio: data.bio,
      },
    });

    return { user, teacher };
  });
}

export async function listTeachers(tenantId: string, options: ListQueryOptions) {
  const { page, limit, search, sortBy, sortOrder } = options;
  const where: Prisma.TeacherWhereInput = { tenantId, user: { isActive: true } };
  if (search) {
    where.user = {
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true, gender: true } },
        assignedClass: { select: { id: true, name: true } },
        assignedSection: { select: { id: true, name: true } },
        subjects: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { user: { [sortBy]: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.teacher.count({ where }),
  ]);

  return { teachers, total };
}

export async function getTeacherById(tenantId: string, id: string) {
  return prisma.teacher.findFirst({
    where: { userId: id, tenantId },
    include: {
      user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true, gender: true, cnic: true, dateOfBirth: true, address: true, city: true } },
      assignedClass: true,
      assignedSection: true,
      subjects: {
        include: {
          subject: true,
          class: true,
          section: true,
        },
      },
    },
  });
}

export async function updateTeacher(tenantId: string, id: string, data: any) {
  const { isActive, ...userData } = data;
  return prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id },
        data: userData,
      });
    }
    const teacher = await tx.teacher.update({
      where: { userId: id },
      data: {
        qualifications: data.qualifications,
        specialization: data.specialization,
        experience: data.experience,
        isClassTeacher: data.isClassTeacher,
        assignedClassId: data.assignedClassId,
        assignedSectionId: data.assignedSectionId,
      },
    });
    return teacher;
  });
}

export async function deactivateTeacher(tenantId: string, id: string) {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}

// ── Student CRUD ──

export async function createStudent(tenantId: string, schoolCode: string, data: any) {
  const uniqueId = await generateUniqueId(prisma, 'STUDENT', tenantId, schoolCode);
  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        uniqueId,
        email: data.email,
        passwordHash,
        role: 'STUDENT',
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address,
        city: data.city,
      },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        tenantId,
        rollNumber: data.rollNumber,
        classId: data.classId,
        sectionId: data.sectionId,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianRelation: data.guardianRelation,
        guardianCNIC: data.guardianCNIC,
        bloodGroup: data.bloodGroup,
        medicalNotes: data.medicalNotes,
      },
    });

    return { user, student };
  });
}

export async function listStudents(tenantId: string, options: ListQueryOptions & { classId?: string; sectionId?: string }) {
  const { page, limit, search, sortBy, sortOrder, classId, sectionId } = options;
  const where: Prisma.StudentWhereInput = { tenantId, status: 'ACTIVE' };
  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (search) {
    where.user = {
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true, gender: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: { user: { [sortBy]: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return { students, total };
}

export async function getStudentById(tenantId: string, id: string) {
  return prisma.student.findFirst({
    where: { userId: id, tenantId },
    include: {
      user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true, gender: true, cnic: true, dateOfBirth: true, address: true, city: true } },
      class: true,
      section: true,
      parentLinks: {
        include: {
          parent: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
            },
          },
        },
      },
      attendances: { orderBy: { date: 'desc' }, take: 30 },
      marks: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { subject: { select: { id: true, name: true } } },
      },
      feeRecords: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { feeStructure: true },
      },
    },
  });
}

export async function updateStudent(tenantId: string, id: string, data: any) {
  const { isActive, status, rollNumber, classId, sectionId, guardianName, guardianPhone, guardianRelation, guardianCNIC, bloodGroup, medicalNotes, ...userData } = data;

  return prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id }, data: userData });
    }
    const student = await tx.student.update({
      where: { userId: id },
      data: {
        status,
        rollNumber,
        classId,
        sectionId,
        guardianName,
        guardianPhone,
        guardianRelation,
        guardianCNIC,
        bloodGroup,
        medicalNotes,
      },
    });
    return student;
  });
}

export async function deactivateStudent(tenantId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.student.update({
      where: { userId: id },
      data: { status: 'INACTIVE' },
    });
    await tx.user.update({
      where: { id },
      data: { isActive: false },
    });
  });
}

// ── Parent CRUD ──

export async function createParent(tenantId: string, schoolCode: string, data: any) {
  const uniqueId = await generateUniqueId(prisma, 'PARENT', tenantId, schoolCode);
  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        uniqueId,
        email: data.email,
        passwordHash,
        role: 'PARENT',
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        cnic: data.cnic,
        gender: data.gender,
      },
    });

    const parent = await tx.parent.create({
      data: {
        userId: user.id,
        tenantId,
        occupation: data.occupation,
        emergencyContact: data.emergencyContact,
        emergencyRelation: data.emergencyRelation,
      },
    });

    if (data.children && data.children.length > 0) {
      await tx.studentParent.createMany({
        data: data.children.map((c: any) => ({
          studentId: c.studentId,
          parentId: parent.userId,
          relation: c.relation,
          isPrimary: c.isPrimary ?? false,
          canPickup: c.canPickup ?? true,
          tenantId,
        })),
      });
    }

    return { user, parent };
  });
}

export async function listParents(tenantId: string, options: ListQueryOptions) {
  const { page, limit, search, sortBy, sortOrder } = options;
  const where: Prisma.ParentWhereInput = { tenantId, user: { isActive: true } };
  if (search) {
    where.user = {
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [parents, total] = await Promise.all([
    prisma.parent.findMany({
      where,
      include: {
        user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true } },
        children: {
          include: {
            student: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true } },
                class: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { user: { [sortBy]: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.parent.count({ where }),
  ]);

  return { parents, total };
}

export async function getParentById(tenantId: string, id: string) {
  return prisma.parent.findFirst({
    where: { userId: id, tenantId },
    include: {
      user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true, gender: true, cnic: true } },
      children: {
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
              class: true,
              section: true,
            },
          },
        },
      },
    },
  });
}

export async function updateParent(tenantId: string, id: string, data: any) {
  const { isActive, occupation, emergencyContact, emergencyRelation, ...userData } = data;

  return prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id }, data: userData });
    }
    const parent = await tx.parent.update({
      where: { userId: id },
      data: { occupation, emergencyContact, emergencyRelation },
    });
    return parent;
  });
}

// ── Bulk Import ──

export async function bulkImport(tenantId: string, schoolCode: string, entityType: string, records: any[]) {
  const results = [];
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const record = records[i];
      if (entityType === 'STUDENT') {
        const result = await createStudent(tenantId, schoolCode, record);
        results.push({ index: i, id: result.user.id, uniqueId: result.user.uniqueId });
      } else if (entityType === 'TEACHER') {
        const result = await createTeacher(tenantId, schoolCode, record);
        results.push({ index: i, id: result.user.id, uniqueId: result.user.uniqueId });
      }
    } catch (err: any) {
      errors.push({ index: i, error: err.message });
    }
  }

  return { imported: results.length, failed: errors.length, results, errors };
}

// ── Class CRUD ──

export async function createClass(tenantId: string, data: any) {
  return prisma.class.create({
    data: {
      tenantId,
      name: data.name,
      grade: data.grade,
      academicYear: data.academicYear,
      roomNumber: data.roomNumber,
      capacity: data.capacity,
    },
  });
}

export async function listClasses(tenantId: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.ClassWhereInput = { tenantId, isActive: true };

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      include: {
        sections: true,
        students: { select: { userId: true } },
        subjects: { include: { subject: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.class.count({ where }),
  ]);

  return { classes, total };
}

export async function getClassById(tenantId: string, id: string) {
  return prisma.class.findFirst({
    where: { id, tenantId },
    include: {
      sections: true,
      students: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, uniqueId: true } },
        },
      },
      subjects: {
        include: {
          subject: true,
          teacher: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          section: true,
        },
      },
      schedules: {
        include: {
          subject: { select: { id: true, name: true } },
          teacher: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          section: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
      },
      classTeacher: {
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });
}

export async function updateClass(tenantId: string, id: string, data: any) {
  return prisma.class.update({
    where: { id },
    data: {
      name: data.name,
      grade: data.grade,
      academicYear: data.academicYear,
      roomNumber: data.roomNumber,
      capacity: data.capacity,
      isActive: data.isActive,
    },
  });
}

export async function deleteClass(tenantId: string, id: string) {
  const studentCount = await prisma.student.count({ where: { classId: id, tenantId } });
  if (studentCount > 0) {
    throw new Error('Cannot delete class with enrolled students');
  }
  return prisma.class.delete({ where: { id } });
}

// ── Section CRUD ──

export async function createSection(tenantId: string, data: any) {
  return prisma.section.create({
    data: {
      tenantId,
      classId: data.classId,
      name: data.name,
      roomNumber: data.roomNumber,
      capacity: data.capacity,
    },
  });
}

export async function updateSection(tenantId: string, id: string, data: any) {
  return prisma.section.update({
    where: { id },
    data: {
      name: data.name,
      roomNumber: data.roomNumber,
      capacity: data.capacity,
      isActive: data.isActive,
    },
  });
}

export async function deleteSection(tenantId: string, id: string) {
  const studentCount = await prisma.student.count({ where: { sectionId: id, tenantId } });
  if (studentCount > 0) {
    throw new Error('Cannot delete section with enrolled students');
  }
  return prisma.section.delete({ where: { id } });
}

// ── Subject CRUD ──

export async function createSubject(tenantId: string, data: any) {
  return prisma.subject.create({
    data: {
      tenantId,
      name: data.name,
      code: data.code,
      description: data.description,
      creditHours: data.creditHours,
    },
  });
}

export async function listSubjects(tenantId: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.SubjectWhereInput = { tenantId, isActive: true };

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.subject.count({ where }),
  ]);

  return { subjects, total };
}

export async function updateSubject(tenantId: string, id: string, data: any) {
  return prisma.subject.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      creditHours: data.creditHours,
      isActive: data.isActive,
    },
  });
}

export async function deleteSubject(tenantId: string, id: string) {
  return prisma.subject.delete({ where: { id } });
}

// ── Teacher Subject Assignment ──

export async function assignTeacherToSubject(tenantId: string, data: any) {
  return prisma.teacherSubject.create({
    data: {
      tenantId,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
      classId: data.classId,
      sectionId: data.sectionId,
      academicYear: data.academicYear,
    },
  });
}

export async function listTeacherAssignments(tenantId: string) {
  return prisma.teacherSubject.findMany({
    where: { tenantId, isActive: true },
    include: {
      teacher: { include: { user: { select: { id: true, firstName: true, lastName: true, uniqueId: true } } } },
      subject: true,
      class: true,
      section: true,
    },
  });
}

// ── Timetable CRUD ──

export async function createTimetableEntry(tenantId: string, data: any) {
  return prisma.classSchedule.create({
    data: {
      tenantId,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      periodNumber: data.periodNumber,
      startTime: data.startTime,
      endTime: data.endTime,
      roomNumber: data.roomNumber,
      academicYear: data.academicYear,
    },
  });
}

export async function listTimetable(tenantId: string, options?: { classId?: string; academicYear?: string }) {
  const where: Prisma.ClassScheduleWhereInput = { tenantId, isActive: true };
  if (options?.classId) where.classId = options.classId;
  if (options?.academicYear) where.academicYear = options.academicYear;

  return prisma.classSchedule.findMany({
    where,
    include: {
      class: { select: { id: true, name: true, grade: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
  });
}

export async function updateTimetableEntry(tenantId: string, id: string, data: any) {
  return prisma.classSchedule.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      periodNumber: data.periodNumber,
      startTime: data.startTime,
      endTime: data.endTime,
      roomNumber: data.roomNumber,
      isActive: data.isActive,
    },
  });
}

export async function deleteTimetableEntry(tenantId: string, id: string) {
  return prisma.classSchedule.delete({ where: { id } });
}

// ── Announcement CRUD ──

export async function createAnnouncement(tenantId: string, postedBy: string, data: any) {
  return prisma.announcement.create({
    data: {
      tenantId,
      postedBy,
      title: data.title,
      content: data.content,
      priority: data.priority,
      targetAudience: data.targetAudience,
      targetClassId: data.targetClassId || null,
      targetSectionId: data.targetSectionId || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
}

export async function listAnnouncements(tenantId: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.AnnouncementWhereInput = { tenantId };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        postedByUser: { select: { id: true, firstName: true, lastName: true, role: true } },
        targetClass: { select: { id: true, name: true } },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return { announcements, total };
}

export async function updateAnnouncement(tenantId: string, id: string, data: any) {
  return prisma.announcement.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority,
      targetAudience: data.targetAudience,
      targetClassId: data.targetClassId,
      targetSectionId: data.targetSectionId,
      isPinned: data.isPinned,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
}

export async function deleteAnnouncement(tenantId: string, id: string) {
  return prisma.announcement.delete({ where: { id } });
}

// ── Fee Structure CRUD ──

export async function createFeeStructure(tenantId: string, data: any) {
  return prisma.feeStructure.create({
    data: {
      tenantId,
      classId: data.classId || null,
      feeType: data.feeType,
      amount: data.amount,
      frequency: data.frequency,
      dueDay: data.dueDay,
      lateFeePerDay: data.lateFeePerDay,
      academicYear: data.academicYear,
    },
  });
}

export async function listFeeStructures(tenantId: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.FeeStructureWhereInput = { tenantId };

  const [feeStructures, total] = await Promise.all([
    prisma.feeStructure.findMany({
      where,
      include: { class: { select: { id: true, name: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.feeStructure.count({ where }),
  ]);

  return { feeStructures, total };
}

export async function updateFeeStructure(tenantId: string, id: string, data: any) {
  return prisma.feeStructure.update({
    where: { id },
    data: {
      classId: data.classId,
      feeType: data.feeType,
      amount: data.amount,
      frequency: data.frequency,
      dueDay: data.dueDay,
      lateFeePerDay: data.lateFeePerDay,
      isActive: data.isActive,
    },
  });
}

export async function getFeeDefaulters(tenantId: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.FeeRecordWhereInput = { tenantId, status: 'UNPAID' };

  const [feeRecords, total] = await Promise.all([
    prisma.feeRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, uniqueId: true } },
            class: true,
            section: true,
          },
        },
        feeStructure: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.feeRecord.count({ where }),
  ]);

  return { feeRecords, total };
}

export async function createFeeRecord(tenantId: string, data: any) {
  return prisma.feeRecord.create({
    data: {
      tenantId,
      studentId: data.studentId,
      feeStructureId: data.feeStructureId,
      amount: data.amount,
      discountAmount: data.discountAmount || 0,
      discountReason: data.discountReason,
      finalAmount: data.finalAmount,
      paidAmount: data.paidAmount,
      balance: data.finalAmount - data.paidAmount,
      dueDate: new Date(data.dueDate),
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      remarks: data.remarks,
      status: data.paidAmount >= data.finalAmount ? 'PAID' : data.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
    },
  });
}

export async function listFeeRecords(tenantId: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.FeeRecordWhereInput = { tenantId };

  const [feeRecords, total] = await Promise.all([
    prisma.feeRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, uniqueId: true } },
          },
        },
        feeStructure: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.feeRecord.count({ where }),
  ]);

  return { feeRecords, total };
}

// ── Reports ──

export async function getEnrollmentReport(tenantId: string) {
  const [teacherCount, studentCount, parentCount, classCount] = await Promise.all([
    prisma.teacher.count({ where: { tenantId, user: { isActive: true } } }),
    prisma.student.count({ where: { tenantId, status: 'ACTIVE' } }),
    prisma.parent.count({ where: { tenantId, user: { isActive: true } } }),
    prisma.class.count({ where: { tenantId, isActive: true } }),
  ]);

  const classWise = await prisma.student.groupBy({
    by: ['classId'],
    where: { tenantId, status: 'ACTIVE' },
    _count: { classId: true },
  });

  return { teacherCount, studentCount, parentCount, classCount, classWise };
}

export async function getAttendanceReport(tenantId: string, from?: string, to?: string) {
  const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
  const toDate = to ? new Date(to) : new Date();

  const stats = await prisma.attendance.groupBy({
    by: ['status'],
    where: { tenantId, date: { gte: fromDate, lte: toDate } },
    _count: { status: true },
  });

  const classWise = await prisma.attendance.groupBy({
    by: ['classId', 'status'],
    where: { tenantId, date: { gte: fromDate, lte: toDate } },
    _count: { classId: true },
  });

  return { from, to, stats, classWise };
}

export async function getFeeCollectionReport(tenantId: string, from?: string, to?: string) {
  const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
  const toDate = to ? new Date(to) : new Date();

  const records = await prisma.feeRecord.findMany({
    where: { tenantId, createdAt: { gte: fromDate, lte: toDate } },
    select: { status: true, paidAmount: true, finalAmount: true },
  });

  const totalDue = records.reduce((s, r) => s + Number(r.finalAmount), 0);
  const totalCollected = records.filter((r) => r.status === 'PAID').reduce((s, r) => s + Number(r.paidAmount), 0);

  return { from, to, totalDue, totalCollected, recordCount: records.length };
}

export async function getTeacherPerformanceReport(tenantId: string) {
  const teachers = await prisma.teacher.findMany({
    where: { tenantId, user: { isActive: true } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, uniqueId: true } },
      marks: { select: { obtainedMarks: true, totalMarks: true } },
      homeworks: { select: { id: true } },
    },
  });

  return teachers.map((t) => ({
    teacherId: t.userId,
    name: `${t.user.firstName} ${t.user.lastName}`,
    uniqueId: t.user.uniqueId,
    homeworkCount: t.homeworks.length,
    marksGiven: t.marks.length,
    averageMarks: t.marks.length > 0
      ? t.marks.reduce((s, m) => s + m.obtainedMarks / m.totalMarks, 0) / t.marks.length
      : 0,
  }));
}

// ── Notifications ──

export async function sendNotifications(
  tenantId: string,
  senderId: string,
  targetRole: string,
  targetUserIds: string[] | undefined,
  title: string,
  body: string,
  type: any,
  targetClassId?: string,
  data?: Record<string, unknown>
) {
  let userIds: string[] = targetUserIds || [];

  if (!targetUserIds || targetUserIds.length === 0) {
    if (targetRole === 'ALL') {
      const users = await prisma.user.findMany({
        where: { tenantId, isActive: true, role: { in: ['TEACHER', 'STUDENT', 'PARENT', 'ADMIN', 'PRINCIPAL'] } },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    } else {
      const roleMap: Record<string, string> = {
        TEACHERS: 'TEACHER',
        STUDENTS: 'STUDENT',
        PARENTS: 'PARENT',
        ADMIN: 'ADMIN',
      };
      const users = await prisma.user.findMany({
        where: { tenantId, isActive: true, role: roleMap[targetRole] as any },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }
  }

  if (targetClassId && userIds.length === 0) {
    const students = await prisma.student.findMany({
      where: { tenantId, classId: targetClassId, user: { isActive: true } },
      select: { userId: true },
    });
    const parents = await prisma.studentParent.findMany({
      where: { studentId: { in: students.map((s) => s.userId) } },
      select: { parentId: true },
    });
    userIds = [...new Set([...students.map((s) => s.userId), ...parents.map((p) => p.parentId)])];
  }

  if (userIds.length === 0) return { count: 0 };

  await prisma.$transaction(
    userIds.map((uid) =>
      prisma.notification.create({
        data: {
          tenantId,
          userId: uid,
          title,
          body,
          type,
          senderId,
          data: data ? (JSON.parse(JSON.stringify(data)) as Prisma.JsonObject) : undefined,
        },
      })
    )
  );

  return { count: userIds.length };
}

export async function listNotifications(tenantId: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.NotificationWhereInput = { tenantId };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total };
}

// ── Settings ──

export async function getSettings(tenantId: string) {
  return prisma.setting.findMany({
    where: { tenantId },
    orderBy: { category: 'asc' },
  });
}

export async function updateSetting(tenantId: string, data: any) {
  return prisma.setting.upsert({
    where: { tenantId_key: { tenantId, key: data.key } },
    create: {
      tenantId,
      key: data.key,
      value: data.value,
      category: data.category || 'GENERAL',
      description: data.description,
    },
    update: {
      value: data.value,
      category: data.category || 'GENERAL',
      description: data.description,
    },
  });
}

// ── Shared Types ──

export interface ListQueryOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
