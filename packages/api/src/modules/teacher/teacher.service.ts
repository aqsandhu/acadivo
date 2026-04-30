// ─────────────────────────────────────────────
// Teacher Service — Business logic for teacher academic workflows
// ─────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  calculateGrade,
  calculatePercentage,
  summarizeAttendance,
  getStartOfMonth,
  getEndOfMonth,
  checkConsecutiveAbsences,
  isLateSubmission,
} from "../../lib/academic";

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayOfWeek() {
  return new Date().getDay();
}

// ═══════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════

export async function getTeacherDashboard(userId: string, tenantId: string) {
  const teacher = await prisma.teacher.findFirst({
    where: { userId, user: { tenantId } },
    include: {
      subjects: { include: { class: true, section: true, subject: true } },
      assignedClass: true,
      assignedSection: true,
    },
  });

  if (!teacher) throw ApiError.notFound("Teacher profile not found");

  const today = getToday();
  const dayOfWeek = getDayOfWeek();

  // Classes today from timetable
  const classesToday = await prisma.classSchedule.findMany({
    where: { teacherId: userId, dayOfWeek, tenantId, isActive: true },
    include: { class: true, section: true, subject: true },
    orderBy: { periodNumber: "asc" },
  });

  // Pending homework (not yet past due and active)
  const pendingHomework = await prisma.homework.count({
    where: { teacherId: userId, tenantId, dueDate: { gte: today }, isActive: true },
  });

  // Unread messages
  const unreadMessages = await prisma.message.count({
    where: { receiverId: userId, tenantId, isRead: false },
  });

  // Pending report requests
  const reportRequests = await prisma.reportRequest.count({
    where: { teacherId: userId, tenantId, status: "PENDING" },
  });

  return {
    classesToday: classesToday.map((c) => ({
      id: c.id,
      period: c.periodNumber,
      time: `${c.startTime} - ${c.endTime}`,
      class: c.class.name,
      section: c.section.name,
      subject: c.subject.name,
      room: c.roomNumber,
    })),
    pendingHomework,
    unreadMessages,
    reportRequests,
    assignedClass: teacher.assignedClass
      ? { id: teacher.assignedClass.id, name: teacher.assignedClass.name }
      : null,
    assignedSection: teacher.assignedSection
      ? { id: teacher.assignedSection.id, name: teacher.assignedSection.name }
      : null,
    subjects: teacher.subjects.map((s) => ({
      subject: s.subject.name,
      class: s.class.name,
      section: s.section.name,
      academicYear: s.academicYear,
    })),
  };
}

// ═══════════════════════════════════════════════
// Classes & Timetable
// ═══════════════════════════════════════════════

export async function getTeacherClasses(userId: string, tenantId: string) {
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { teacherId: userId, tenantId, isActive: true },
    include: { class: true, section: true, subject: true },
  });

  return teacherSubjects.map((ts) => ({
    id: ts.id,
    classId: ts.classId,
    className: ts.class.name,
    sectionId: ts.sectionId,
    sectionName: ts.section.name,
    subjectId: ts.subjectId,
    subjectName: ts.subject.name,
    academicYear: ts.academicYear,
  }));
}

export async function getTeacherTimetable(userId: string, tenantId: string) {
  const schedules = await prisma.classSchedule.findMany({
    where: { teacherId: userId, tenantId, isActive: true },
    include: { class: true, section: true, subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
  });

  const grouped: Record<number, any[]> = {};
  for (const s of schedules) {
    if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = [];
    grouped[s.dayOfWeek].push({
      id: s.id,
      period: s.periodNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      class: s.class.name,
      section: s.section.name,
      subject: s.subject.name,
      room: s.roomNumber,
    });
  }

  return grouped;
}

// ═══════════════════════════════════════════════
// Attendance
// ═══════════════════════════════════════════════

export async function getClassAttendance(
  teacherId: string,
  tenantId: string,
  classId: string,
  sectionId: string
) {
  const today = getToday();

  // Verify teacher teaches this class/section
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, tenantId, classId, sectionId },
  });

  if (!assignment) {
    // Also allow class teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      select: { assignedClassId: true, assignedSectionId: true },
    });
    if (teacher?.assignedClassId !== classId || teacher?.assignedSectionId !== sectionId) {
      throw ApiError.forbidden("You are not assigned to this class/section");
    }
  }

  const students = await prisma.student.findMany({
    where: { classId, sectionId, tenantId, status: "ACTIVE" },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    orderBy: { rollNumber: "asc" },
  });

  const attendance = await prisma.attendance.findMany({
    where: { classId, sectionId, tenantId, date: today },
  });

  const attendanceMap = new Map(attendance.map((a) => [a.studentId, a]));

  return students.map((s) => {
    const a = attendanceMap.get(s.userId);
    return {
      studentId: s.userId,
      rollNumber: s.rollNumber,
      name: `${s.user.firstName} ${s.user.lastName}`,
      avatar: s.user.avatar,
      status: a?.status || null,
      remarks: a?.remarks || null,
      attendanceId: a?.id || null,
    };
  });
}

export async function markAttendance(
  teacherId: string,
  tenantId: string,
  data: { classId: string; sectionId: string; records: { studentId: string; status: string; remarks?: string }[] }
) {
  const today = getToday();

  // Verify teacher assignment
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, tenantId, classId: data.classId, sectionId: data.sectionId },
  });

  if (!assignment) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      select: { assignedClassId: true, assignedSectionId: true },
    });
    if (teacher?.assignedClassId !== data.classId || teacher?.assignedSectionId !== data.sectionId) {
      throw ApiError.forbidden("You are not assigned to this class/section");
    }
  }

  const created: any[] = [];
  for (const record of data.records) {
    const existing = await prisma.attendance.findFirst({
      where: { studentId: record.studentId, classId: data.classId, sectionId: data.sectionId, tenantId, date: today },
    });

    if (existing) {
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: record.status as any, remarks: record.remarks, markedBy: teacherId },
      });
      created.push(updated);
    } else {
      const createdRecord = await prisma.attendance.create({
        data: {
          tenantId,
          studentId: record.studentId,
          classId: data.classId,
          sectionId: data.sectionId,
          date: today,
          status: record.status as any,
          remarks: record.remarks,
          markedBy: teacherId,
        },
      });
      created.push(createdRecord);
    }

    // Check consecutive absences and alert parents
    if (record.status === "ABSENT") {
      const consecutive = await checkConsecutiveAbsences(
        prisma,
        record.studentId,
        tenantId,
        data.classId,
        data.sectionId,
        today
      );
      if (consecutive >= 3) {
        const parentLinks = await prisma.studentParent.findMany({
          where: { studentId: record.studentId },
          include: { parent: { include: { user: true } } },
        });
        for (const pl of parentLinks) {
          await prisma.notification.create({
            data: {
              tenantId,
              userId: pl.parent.userId,
              title: "Attendance Alert",
              body: `Your child has been absent for ${consecutive} consecutive days.`,
              type: "ATTENDANCE_ALERT",
              data: { studentId: record.studentId, consecutive },
              senderId: teacherId,
            },
          });
        }
      }
    }
  }

  return created;
}

export async function updateAttendance(
  teacherId: string,
  tenantId: string,
  attendanceId: string,
  data: { status: string; remarks?: string }
) {
  const attendance = await prisma.attendance.findFirst({
    where: { id: attendanceId, tenantId, markedBy: teacherId },
  });

  if (!attendance) throw ApiError.notFound("Attendance record not found or not authorized");

  return prisma.attendance.update({
    where: { id: attendanceId },
    data: { status: data.status as any, remarks: data.remarks },
  });
}

export async function getAttendanceReport(
  teacherId: string,
  tenantId: string,
  classId?: string,
  sectionId?: string,
  month?: string // YYYY-MM
) {
  // Build date range
  let startDate: Date, endDate: Date;
  if (month) {
    const [year, m] = month.split("-").map(Number);
    startDate = new Date(year, m - 1, 1);
    endDate = new Date(year, m, 0, 23, 59, 59, 999);
  } else {
    startDate = getStartOfMonth(new Date());
    endDate = getEndOfMonth(new Date());
  }

  const where: Prisma.AttendanceWhereInput = {
    tenantId,
    date: { gte: startDate, lte: endDate },
  };

  // Scope to teacher's classes
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { teacherId, tenantId, isActive: true },
    select: { classId: true, sectionId: true },
  });

  const teacherClass = await prisma.teacher.findUnique({
    where: { userId: teacherId },
    select: { assignedClassId: true, assignedSectionId: true },
  });

  const classSectionPairs = new Set<string>();
  for (const ts of teacherSubjects) {
    classSectionPairs.add(`${ts.classId}|${ts.sectionId}`);
  }
  if (teacherClass?.assignedClassId && teacherClass?.assignedSectionId) {
    classSectionPairs.add(`${teacherClass.assignedClassId}|${teacherClass.assignedSectionId}`);
  }

  if (classId && sectionId) {
    const key = `${classId}|${sectionId}`;
    if (!classSectionPairs.has(key)) throw ApiError.forbidden("Not your assigned class/section");
    where.classId = classId;
    where.sectionId = sectionId;
  } else {
    const orArray = Array.from(classSectionPairs).map((pair) => {
      const [cid, sid] = pair.split("|");
      return { classId: cid, sectionId: sid };
    });
    if (orArray.length) {
      where.OR = orArray;
    }
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      class: true,
      section: true,
    },
    orderBy: { date: "desc" },
  });

  const grouped = new Map<string, { student: any; records: typeof records; summary: ReturnType<typeof summarizeAttendance> }>();

  for (const r of records) {
    const key = r.studentId;
    if (!grouped.has(key)) {
      grouped.set(key, {
        student: {
          id: r.studentId,
          name: `${r.student.user.firstName} ${r.student.user.lastName}`,
          rollNumber: r.student.rollNumber,
          class: r.class.name,
          section: r.section.name,
        },
        records: [],
        summary: { present: 0, absent: 0, late: 0, leave: 0, halfDay: 0, total: 0, percentage: 0 },
      });
    }
    grouped.get(key)!.records.push(r);
  }

  for (const entry of grouped.values()) {
    entry.summary = summarizeAttendance(entry.records);
  }

  return Array.from(grouped.values());
}

// ═══════════════════════════════════════════════
// Homework
// ═══════════════════════════════════════════════

export async function createHomework(
  teacherId: string,
  tenantId: string,
  data: {
    title: string;
    description: string;
    subjectId: string;
    classId: string;
    sectionId: string;
    dueDate: string;
    attachments?: any[];
    maxMarks?: number;
  }
) {
  // Verify teacher teaches this subject/class/section
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, tenantId, subjectId: data.subjectId, classId: data.classId, sectionId: data.sectionId },
  });

  if (!assignment) throw ApiError.forbidden("You do not teach this subject in the selected class/section");

  const homework = await prisma.homework.create({
    data: {
      tenantId,
      teacherId,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      maxMarks: data.maxMarks,
      attachments: data.attachments as any,
    },
    include: { class: true, section: true, subject: true },
  });

  // Notify students in class
  const students = await prisma.student.findMany({
    where: { classId: data.classId, sectionId: data.sectionId, tenantId, status: "ACTIVE" },
    select: { userId: true },
  });

  for (const s of students) {
    await prisma.notification.create({
      data: {
        tenantId,
        userId: s.userId,
        title: "New Homework",
        body: `${data.title} assigned. Due: ${new Date(data.dueDate).toLocaleDateString()}`,
        type: "HOMEWORK",
        data: { homeworkId: homework.id },
        senderId: teacherId,
      },
    });
  }

  return homework;
}

export async function getTeacherHomework(teacherId: string, tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [homeworks, total] = await Promise.all([
    prisma.homework.findMany({
      where: { teacherId, tenantId, isActive: true },
      include: { class: true, section: true, subject: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.homework.count({ where: { teacherId, tenantId, isActive: true } }),
  ]);

  return { homeworks, total, page, limit };
}

export async function getHomeworkById(teacherId: string, tenantId: string, homeworkId: string) {
  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, teacherId, tenantId, isActive: true },
    include: {
      class: true,
      section: true,
      subject: true,
      submissions: {
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
          gradedByTeacher: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!homework) throw ApiError.notFound("Homework not found");
  return homework;
}

export async function updateHomework(
  teacherId: string,
  tenantId: string,
  homeworkId: string,
  data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    attachments: any[];
    maxMarks: number;
    isActive: boolean;
  }>
) {
  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, teacherId, tenantId },
  });

  if (!homework) throw ApiError.notFound("Homework not found");

  const updateData: Prisma.HomeworkUpdateInput = {};
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.attachments !== undefined) updateData.attachments = data.attachments as any;
  if (data.maxMarks !== undefined) updateData.maxMarks = data.maxMarks;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.homework.update({
    where: { id: homeworkId },
    data: updateData,
    include: { class: true, section: true, subject: true },
  });
}

export async function deleteHomework(teacherId: string, tenantId: string, homeworkId: string) {
  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, teacherId, tenantId },
  });

  if (!homework) throw ApiError.notFound("Homework not found");
  return prisma.homework.delete({ where: { id: homeworkId } });
}

export async function getHomeworkSubmissions(teacherId: string, tenantId: string, homeworkId: string) {
  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, teacherId, tenantId, isActive: true },
  });

  if (!homework) throw ApiError.notFound("Homework not found");

  const submissions = await prisma.homeworkSubmission.findMany({
    where: { homeworkId, tenantId },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
      gradedByTeacher: { select: { firstName: true, lastName: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return submissions;
}

export async function gradeSubmission(
  teacherId: string,
  tenantId: string,
  homeworkId: string,
  data: { submissionId: string; marks: number; feedback?: string }
) {
  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, teacherId, tenantId },
  });

  if (!homework) throw ApiError.notFound("Homework not found");

  const submission = await prisma.homeworkSubmission.findFirst({
    where: { id: data.submissionId, homeworkId, tenantId },
  });

  if (!submission) throw ApiError.notFound("Submission not found");

  const updated = await prisma.homeworkSubmission.update({
    where: { id: data.submissionId },
    data: {
      marks: data.marks,
      feedback: data.feedback,
      gradedBy: teacherId,
      gradedAt: new Date(),
    },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      tenantId,
      userId: submission.studentId,
      title: "Homework Graded",
      body: `Your submission for "${homework.title}" has been graded.`,
      type: "HOMEWORK",
      data: { homeworkId, submissionId: data.submissionId, marks: data.marks },
      senderId: teacherId,
    },
  });

  return updated;
}

// ═══════════════════════════════════════════════
// Marks
// ═══════════════════════════════════════════════

export async function enterMarks(
  teacherId: string,
  tenantId: string,
  data: {
    studentId: string;
    subjectId: string;
    classId: string;
    sectionId: string;
    examType: string;
    totalMarks: number;
    obtainedMarks: number;
    remarks?: string;
    academicYear?: string;
  }
) {
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, tenantId, subjectId: data.subjectId, classId: data.classId, sectionId: data.sectionId },
  });

  if (!assignment) throw ApiError.forbidden("You do not teach this subject in the selected class/section");

  const percentage = calculatePercentage(data.obtainedMarks, data.totalMarks);
  const grade = calculateGrade(percentage);
  const academicYear = data.academicYear || new Date().getFullYear().toString();

  const existing = await prisma.mark.findFirst({
    where: {
      studentId: data.studentId,
      subjectId: data.subjectId,
      examType: data.examType as any,
      academicYear,
      tenantId,
    },
  });

  if (existing) {
    return prisma.mark.update({
      where: { id: existing.id },
      data: {
        totalMarks: data.totalMarks,
        obtainedMarks: data.obtainedMarks,
        percentage,
        grade,
        remarks: data.remarks,
        teacherId,
      },
    });
  }

  return prisma.mark.create({
    data: {
      tenantId,
      studentId: data.studentId,
      subjectId: data.subjectId,
      classId: data.classId,
      sectionId: data.sectionId,
      teacherId,
      examType: data.examType as any,
      totalMarks: data.totalMarks,
      obtainedMarks: data.obtainedMarks,
      percentage,
      grade,
      remarks: data.remarks,
      academicYear,
    },
  });
}

export async function getTeacherMarks(teacherId: string, tenantId: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [marks, total] = await Promise.all([
    prisma.mark.findMany({
      where: { teacherId, tenantId },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        subject: true,
        class: true,
        section: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.mark.count({ where: { teacherId, tenantId } }),
  ]);

  return { marks, total, page, limit };
}

export async function updateMark(teacherId: string, tenantId: string, markId: string, data: { totalMarks?: number; obtainedMarks?: number; remarks?: string }) {
  const mark = await prisma.mark.findFirst({
    where: { id: markId, teacherId, tenantId },
  });

  if (!mark) throw ApiError.notFound("Mark record not found or unauthorized");

  const updateData: Prisma.MarkUpdateInput = {};
  if (data.totalMarks !== undefined) updateData.totalMarks = data.totalMarks;
  if (data.obtainedMarks !== undefined) updateData.obtainedMarks = data.obtainedMarks;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;

  if (data.totalMarks !== undefined || data.obtainedMarks !== undefined) {
    const total = data.totalMarks ?? mark.totalMarks;
    const obtained = data.obtainedMarks ?? mark.obtainedMarks;
    updateData.percentage = calculatePercentage(obtained, total);
    updateData.grade = calculateGrade(updateData.percentage as number);
  }

  return prisma.mark.update({ where: { id: markId }, data: updateData });
}

export async function getClassMarksSheet(teacherId: string, tenantId: string, classId: string, examType?: string) {
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, tenantId, classId },
  });

  const teacher = await prisma.teacher.findUnique({
    where: { userId: teacherId },
    select: { assignedClassId: true },
  });

  if (!assignment && teacher?.assignedClassId !== classId) {
    throw ApiError.forbidden("You are not assigned to this class");
  }

  const where: Prisma.MarkWhereInput = { tenantId, classId };
  if (examType) where.examType = examType as any;

  const marks = await prisma.mark.findMany({
    where,
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      subject: true,
      section: true,
    },
    orderBy: [{ student: { rollNumber: "asc" } }, { createdAt: "desc" }],
  });

  const groupedByStudent = new Map<string, any>();
  for (const m of marks) {
    if (!groupedByStudent.has(m.studentId)) {
      groupedByStudent.set(m.studentId, {
        student: {
          id: m.studentId,
          name: `${m.student.user.firstName} ${m.student.user.lastName}`,
          rollNumber: m.student.rollNumber,
          section: m.section.name,
        },
        subjects: [],
      });
    }
    groupedByStudent.get(m.studentId).subjects.push({
      subjectId: m.subjectId,
      subjectName: m.subject.name,
      examType: m.examType,
      totalMarks: m.totalMarks,
      obtainedMarks: m.obtainedMarks,
      percentage: m.percentage,
      grade: m.grade,
      remarks: m.remarks,
    });
  }

  return Array.from(groupedByStudent.values());
}

// ═══════════════════════════════════════════════
// Q&A
// ═══════════════════════════════════════════════

export async function getTeacherQA(teacherId: string, tenantId: string) {
  const questions = await prisma.message.findMany({
    where: {
      receiverId: teacherId,
      tenantId,
      // Q&A uses messages with replyTo indicating a question thread
    },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      replyTo: true,
      replies: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return questions;
}

export async function answerQuestion(
  teacherId: string,
  tenantId: string,
  questionId: string,
  data: { answer: string; isPublic: boolean; classId?: string; sectionId?: string }
) {
  // In this design, Q&A is modelled using messages.
  // A question is a message from student to teacher.
  // An answer is a reply message from teacher to student.

  const question = await prisma.message.findFirst({
    where: { id: questionId, receiverId: teacherId, tenantId },
    include: { sender: { select: { id: true, firstName: true, lastName: true } } },
  });

  if (!question) throw ApiError.notFound("Question not found");

  // Create reply message
  const answer = await prisma.message.create({
    data: {
      tenantId,
      senderId: teacherId,
      receiverId: question.senderId,
      content: data.answer,
      replyToId: questionId,
      messageType: "TEXT",
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      tenantId,
      userId: question.senderId,
      title: "Your question was answered",
      body: data.answer.substring(0, 100),
      type: "MESSAGE",
      data: { messageId: answer.id, questionId },
      senderId: teacherId,
    },
  });

  // If public, also notify all students in class
  if (data.isPublic && data.classId && data.sectionId) {
    const students = await prisma.student.findMany({
      where: { classId: data.classId, sectionId: data.sectionId, tenantId, status: "ACTIVE" },
      select: { userId: true },
    });

    for (const s of students) {
      if (s.userId === question.senderId) continue;
      await prisma.notification.create({
        data: {
          tenantId,
          userId: s.userId,
          title: "New public Q&A answer",
          body: data.answer.substring(0, 100),
          type: "MESSAGE",
          data: { messageId: answer.id, questionId, isPublic: true },
          senderId: teacherId,
        },
      });
    }
  }

  return answer;
}

export async function getPublicQA(teacherId: string, tenantId: string, classId?: string, sectionId?: string) {
  // Public Q&A stored in messages where we track public answers via notifications or a flag.
  // Since schema doesn't have an isPublic flag on messages, we use a convention:
  // Messages with replyTo where the reply contains "[PUBLIC]" in content or we track via notifications data.
  // For simplicity, we return all Q&A threads for the teacher's classes.

  const where: any = { tenantId, receiverId: teacherId };
  if (classId || sectionId) {
    // Filter by sender students in specific class/section
    const students = await prisma.student.findMany({
      where: { tenantId, ...(classId ? { classId } : {}), ...(sectionId ? { sectionId } : {}) },
      select: { userId: true },
    });
    const studentIds = students.map((s) => s.userId);
    where.senderId = { in: studentIds };
  }

  const questions = await prisma.message.findMany({
    where,
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      replies: {
        include: { sender: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return questions;
}

// ═══════════════════════════════════════════════
// Reports
// ═══════════════════════════════════════════════

export async function getPendingReportRequests(teacherId: string, tenantId: string) {
  return prisma.reportRequest.findMany({
    where: { teacherId, tenantId, status: "PENDING" },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      parent: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function generateReport(
  teacherId: string,
  tenantId: string,
  requestId: string,
  data: {
    attendancePercentage: number;
    behaviorAssessment: string;
    teacherComments: string;
    pdfUrl?: string;
  }
) {
  const request = await prisma.reportRequest.findFirst({
    where: { id: requestId, teacherId, tenantId, status: "PENDING" },
    include: { student: true },
  });

  if (!request) throw ApiError.notFound("Report request not found or already completed");

  // Get marks summary
  const marks = await prisma.mark.findMany({
    where: { studentId: request.studentId, tenantId },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });

  const marksSummary = marks.map((m) => ({
    subject: m.subject.name,
    examType: m.examType,
    total: m.totalMarks,
    obtained: m.obtainedMarks,
    percentage: m.percentage,
    grade: m.grade,
  }));

  // Get attendance summary
  const attendanceRecords = await prisma.attendance.findMany({
    where: { studentId: request.studentId, tenantId },
  });
  const attendanceSummary = summarizeAttendance(attendanceRecords);

  // Update request
  const updated = await prisma.reportRequest.update({
    where: { id: requestId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      teacherRemarks: JSON.stringify({
        marksSummary,
        attendancePercentage: data.attendancePercentage,
        behaviorAssessment: data.behaviorAssessment,
        teacherComments: data.teacherComments,
        calculatedAttendance: attendanceSummary,
      }),
      pdfUrl: data.pdfUrl,
    },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      parent: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  // Notify parent
  await prisma.notification.create({
    data: {
      tenantId,
      userId: request.parentId,
      title: "Report Ready",
      body: `Your requested ${request.reportType.toLowerCase()} report for ${updated.student.user.firstName} is now ready.`,
      type: "REPORT_READY",
      data: { reportRequestId: requestId, pdfUrl: data.pdfUrl },
      senderId: teacherId,
    },
  });

  return updated;
}

export async function getTeacherReports(teacherId: string, tenantId: string) {
  return prisma.reportRequest.findMany({
    where: { teacherId, tenantId, status: "COMPLETED" },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      parent: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { completedAt: "desc" },
  });
}

// ═══════════════════════════════════════════════
// Messages
// ═══════════════════════════════════════════════

export async function getTeacherMessages(teacherId: string, tenantId: string) {
  const messages = await prisma.message.findMany({
    where: {
      tenantId,
      OR: [{ senderId: teacherId }, { receiverId: teacherId }],
    },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true, avatar: true } },
      receiver: { select: { firstName: true, lastName: true, role: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Group by conversation partner
  const threads = new Map<string, any>();
  for (const m of messages) {
    const partnerId = m.senderId === teacherId ? m.receiverId : m.senderId;
    if (!threads.has(partnerId)) {
      threads.set(partnerId, {
        partnerId,
        partnerName: m.senderId === teacherId
          ? `${m.receiver.firstName} ${m.receiver.lastName}`
          : `${m.sender.firstName} ${m.sender.lastName}`,
        partnerRole: m.senderId === teacherId ? m.receiver.role : m.sender.role,
        partnerAvatar: m.senderId === teacherId ? m.receiver.avatar : m.sender.avatar,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      });
    }
    if (m.receiverId === teacherId && !m.isRead) {
      threads.get(partnerId).unreadCount++;
    }
  }

  return Array.from(threads.values()).sort((a, b) =>
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function getConversation(teacherId: string, tenantId: string, threadId: string) {
  // threadId is the partner's userId
  const messages = await prisma.message.findMany({
    where: {
      tenantId,
      OR: [
        { senderId: teacherId, receiverId: threadId },
        { senderId: threadId, receiverId: teacherId },
      ],
    },
    include: {
      sender: { select: { firstName: true, lastName: true, avatar: true } },
      receiver: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark as read
  await prisma.message.updateMany({
    where: { receiverId: teacherId, senderId: threadId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return messages;
}

export async function sendMessage(
  teacherId: string,
  tenantId: string,
  data: { receiverId: string; content: string; attachments?: any[]; messageType?: string }
) {
  const message = await prisma.message.create({
    data: {
      tenantId,
      senderId: teacherId,
      receiverId: data.receiverId,
      content: data.content,
      attachments: data.attachments as any,
      messageType: (data.messageType as any) || "TEXT",
    },
    include: {
      sender: { select: { firstName: true, lastName: true } },
      receiver: { select: { firstName: true, lastName: true } },
    },
  });

  await prisma.notification.create({
    data: {
      tenantId,
      userId: data.receiverId,
      title: "New Message",
      body: data.content.substring(0, 100),
      type: "MESSAGE",
      data: { messageId: message.id },
      senderId: teacherId,
    },
  });

  return message;
}

// ═══════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════

export async function notifyClass(
  teacherId: string,
  tenantId: string,
  data: { classId: string; sectionId: string; title: string; body: string }
) {
  // Verify teacher assignment
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, tenantId, classId: data.classId, sectionId: data.sectionId },
  });
  const teacher = await prisma.teacher.findUnique({
    where: { userId: teacherId },
    select: { assignedClassId: true, assignedSectionId: true },
  });

  if (!assignment && (teacher?.assignedClassId !== data.classId || teacher?.assignedSectionId !== data.sectionId)) {
    throw ApiError.forbidden("You are not assigned to this class/section");
  }

  const students = await prisma.student.findMany({
    where: { classId: data.classId, sectionId: data.sectionId, tenantId, status: "ACTIVE" },
    select: { userId: true },
  });

  const notifications = [];
  for (const s of students) {
    const n = await prisma.notification.create({
      data: {
        tenantId,
        userId: s.userId,
        title: data.title,
        body: data.body,
        type: "ANNOUNCEMENT",
        data: { classId: data.classId, sectionId: data.sectionId },
        senderId: teacherId,
      },
    });
    notifications.push(n);
  }

  return { sentCount: notifications.length };
}

export async function notifyStudent(
  teacherId: string,
  tenantId: string,
  data: { studentId: string; title: string; body: string }
) {
  const student = await prisma.student.findUnique({
    where: { userId: data.studentId, tenantId },
    select: { classId: true, sectionId: true },
  });

  if (!student) throw ApiError.notFound("Student not found");

  return prisma.notification.create({
    data: {
      tenantId,
      userId: data.studentId,
      title: data.title,
      body: data.body,
      type: "MESSAGE",
      data: { sender: "teacher" },
      senderId: teacherId,
    },
  });
}

export async function notifyParents(
  teacherId: string,
  tenantId: string,
  data: { classId: string; sectionId: string; title: string; body: string }
) {
  // Verify teacher assignment
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, tenantId, classId: data.classId, sectionId: data.sectionId },
  });
  const teacher = await prisma.teacher.findUnique({
    where: { userId: teacherId },
    select: { assignedClassId: true, assignedSectionId: true },
  });

  if (!assignment && (teacher?.assignedClassId !== data.classId || teacher?.assignedSectionId !== data.sectionId)) {
    throw ApiError.forbidden("You are not assigned to this class/section");
  }

  const parentLinks = await prisma.studentParent.findMany({
    where: {
      student: { classId: data.classId, sectionId: data.sectionId, tenantId },
    },
    select: { parentId: true },
    distinct: ["parentId"],
  });

  const notifications = [];
  for (const pl of parentLinks) {
    const n = await prisma.notification.create({
      data: {
        tenantId,
        userId: pl.parentId,
        title: data.title,
        body: data.body,
        type: "ANNOUNCEMENT",
        data: { classId: data.classId, sectionId: data.sectionId },
        senderId: teacherId,
      },
    });
    notifications.push(n);
  }

  return { sentCount: notifications.length };
}
