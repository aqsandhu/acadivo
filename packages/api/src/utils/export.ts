// ═══════════════════════════════════════════════
// Data Export Service — CSV/Excel export for various entities
// ═══════════════════════════════════════════════

import { prisma } from "../lib/prisma";
import { logger } from "./logger";

// ── CSV Generator ──

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(headers: string[], rows: Record<string, unknown>[]): string {
  const headerRow = headers.map(escapeCSV).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCSV(row[h])).join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

function createCSVResponse(data: string, filename: string) {
  return {
    content: data,
    filename,
    contentType: "text/csv; charset=utf-8",
  };
}

// ── Students Export ──

export async function exportStudents(tenantId: string, filters?: { classId?: string; sectionId?: string; status?: string }) {
  const where: Record<string, unknown> = { tenantId };
  if (filters?.classId) where.classId = filters.classId;
  if (filters?.sectionId) where.sectionId = filters.sectionId;
  if (filters?.status) where.status = filters.status;

  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, gender: true, dateOfBirth: true, address: true, city: true, isActive: true, createdAt: true } },
      class: { select: { name: true, grade: true } },
      section: { select: { name: true } },
      parentLinks: {
        include: {
          parent: {
            include: {
              user: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
        },
      },
    },
    orderBy: { rollNumber: "asc" },
  });

  const headers = [
    "Roll Number", "First Name", "Last Name", "Email", "Phone", "Gender",
    "Date of Birth", "Address", "City", "Class", "Section", "Blood Group",
    "Guardian Name", "Guardian Phone", "Guardian Relation", "Medical Notes",
    "Status", "Is Active", "Joined At", "Primary Parent Name", "Primary Parent Phone",
  ];

  const rows = students.map((s) => {
    const primaryParent = s.parentLinks.find((p) => p.isPrimary);
    return {
      "Roll Number": s.rollNumber,
      "First Name": s.user.firstName,
      "Last Name": s.user.lastName,
      "Email": s.user.email,
      "Phone": s.user.phone,
      "Gender": s.user.gender,
      "Date of Birth": s.user.dateOfBirth ? new Date(s.user.dateOfBirth).toISOString().split("T")[0] : "",
      "Address": s.user.address,
      "City": s.user.city,
      "Class": s.class.name,
      "Section": s.section.name,
      "Blood Group": s.bloodGroup,
      "Guardian Name": s.guardianName,
      "Guardian Phone": s.guardianPhone,
      "Guardian Relation": s.guardianRelation,
      "Medical Notes": s.medicalNotes,
      "Status": s.status,
      "Is Active": s.user.isActive ? "Yes" : "No",
      "Joined At": new Date(s.admissionDate).toISOString().split("T")[0],
      "Primary Parent Name": primaryParent ? `${primaryParent.parent.user.firstName} ${primaryParent.parent.user.lastName}` : "",
      "Primary Parent Phone": primaryParent?.parent.user.phone || "",
    };
  });

  const csv = generateCSV(headers, rows);
  logger.info(`[Export] Exported ${students.length} students for tenant ${tenantId}`);
  return createCSVResponse(csv, `students_${tenantId}_${Date.now()}.csv`);
}

// ── Teachers Export ──

export async function exportTeachers(tenantId: string, filters?: { isClassTeacher?: boolean }) {
  const where: Record<string, unknown> = { tenantId };

  const teachers = await prisma.teacher.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, gender: true, dateOfBirth: true, address: true, city: true, isActive: true, cnic: true, createdAt: true } },
      assignedClass: { select: { name: true } },
      assignedSection: { select: { name: true } },
      subjects: {
        include: {
          subject: { select: { name: true, code: true } },
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
    },
    orderBy: { userId: "asc" },
  });

  const headers = [
    "First Name", "Last Name", "Email", "Phone", "Gender",
    "CNIC", "Date of Birth", "Address", "City",
    "Qualifications", "Specialization", "Experience",
    "Joining Date", "Bio", "Is Class Teacher", "Assigned Class",
    "Assigned Section", "Subjects", "Is Active", "Joined At",
  ];

  const rows = teachers.map((t) => ({
    "First Name": t.user.firstName,
    "Last Name": t.user.lastName,
    "Email": t.user.email,
    "Phone": t.user.phone,
    "Gender": t.user.gender,
    "CNIC": t.user.cnic,
    "Date of Birth": t.user.dateOfBirth ? new Date(t.user.dateOfBirth).toISOString().split("T")[0] : "",
    "Address": t.user.address,
    "City": t.user.city,
    "Qualifications": t.qualifications,
    "Specialization": t.specialization,
    "Experience": t.experience,
    "Joining Date": t.joiningDate ? new Date(t.joiningDate).toISOString().split("T")[0] : "",
    "Bio": t.bio,
    "Is Class Teacher": t.isClassTeacher ? "Yes" : "No",
    "Assigned Class": t.assignedClass?.name || "",
    "Assigned Section": t.assignedSection?.name || "",
    "Subjects": t.subjects.map((s) => `${s.subject.name} (${s.class.name}-${s.section.name})`).join("; "),
    "Is Active": t.user.isActive ? "Yes" : "No",
    "Joined At": new Date(t.user.createdAt).toISOString().split("T")[0],
  }));

  const csv = generateCSV(headers, rows);
  logger.info(`[Export] Exported ${teachers.length} teachers for tenant ${tenantId}`);
  return createCSVResponse(csv, `teachers_${tenantId}_${Date.now()}.csv`);
}

// ── Attendance Export ──

export async function exportAttendance(
  tenantId: string,
  filters?: { classId?: string; sectionId?: string; studentId?: string; month?: string; startDate?: string; endDate?: string }
) {
  const where: Record<string, unknown> = { tenantId };
  if (filters?.classId) where.classId = filters.classId;
  if (filters?.sectionId) where.sectionId = filters.sectionId;
  if (filters?.studentId) where.studentId = filters.studentId;

  if (filters?.month) {
    const [year, month] = filters.month.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    where.date = { gte: startDate, lte: endDate };
  } else if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) (where.date as any).gte = new Date(filters.startDate);
    if (filters.endDate) (where.date as any).lte = new Date(filters.endDate);
  }

  const attendanceRecords = await prisma.attendance.findMany({
    where,
    include: {
      student: {
        select: {
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      class: { select: { name: true } },
      section: { select: { name: true } },
      markedByTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { date: "desc" },
  });

  const headers = [
    "Date", "Student Roll Number", "Student Name", "Class", "Section",
    "Status", "Period", "Remarks", "Marked By", "Created At",
  ];

  const rows = attendanceRecords.map((a) => ({
    "Date": new Date(a.date).toISOString().split("T")[0],
    "Student Roll Number": a.student.rollNumber,
    "Student Name": `${a.student.user.firstName} ${a.student.user.lastName}`,
    "Class": a.class.name,
    "Section": a.section.name,
    "Status": a.status,
    "Period": a.periodNumber || "",
    "Remarks": a.remarks,
    "Marked By": a.markedByTeacher ? `${a.markedByTeacher.user.firstName} ${a.markedByTeacher.user.lastName}` : "",
    "Created At": new Date(a.createdAt).toISOString().split("T")[0],
  }));

  const csv = generateCSV(headers, rows);
  logger.info(`[Export] Exported ${attendanceRecords.length} attendance records for tenant ${tenantId}`);
  return createCSVResponse(csv, `attendance_${tenantId}_${Date.now()}.csv`);
}

// ── Fee Records Export ──

export async function exportFeeRecords(
  tenantId: string,
  filters?: { studentId?: string; status?: string; academicYear?: string }
) {
  const where: Record<string, unknown> = { tenantId };
  if (filters?.studentId) where.studentId = filters.studentId;
  if (filters?.status) where.status = filters.status;
  if (filters?.academicYear) {
    where.feeStructure = { academicYear: filters.academicYear };
  }

  const feeRecords = await prisma.feeRecord.findMany({
    where,
    include: {
      student: {
        select: {
          rollNumber: true,
          user: { select: { firstName: true, lastName: true, phone: true } },
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
      feeStructure: {
        select: { feeType: true, frequency: true, academicYear: true },
      },
    },
    orderBy: { dueDate: "desc" },
  });

  const headers = [
    "Student Roll Number", "Student Name", "Student Phone", "Class", "Section",
    "Fee Type", "Frequency", "Academic Year", "Amount", "Discount Amount",
    "Final Amount", "Paid Amount", "Balance", "Status", "Due Date",
    "Paid Date", "Payment Method", "Transaction ID", "Receipt Number", "Remarks",
  ];

  const rows = feeRecords.map((f) => ({
    "Student Roll Number": f.student.rollNumber,
    "Student Name": `${f.student.user.firstName} ${f.student.user.lastName}`,
    "Student Phone": f.student.user.phone,
    "Class": f.student.class.name,
    "Section": f.student.section.name,
    "Fee Type": f.feeStructure.feeType,
    "Frequency": f.feeStructure.frequency,
    "Academic Year": f.feeStructure.academicYear,
    "Amount": f.amount,
    "Discount Amount": f.discountAmount || 0,
    "Final Amount": f.finalAmount,
    "Paid Amount": f.paidAmount,
    "Balance": f.balance,
    "Status": f.status,
    "Due Date": new Date(f.dueDate).toISOString().split("T")[0],
    "Paid Date": f.paidDate ? new Date(f.paidDate).toISOString().split("T")[0] : "",
    "Payment Method": f.paymentMethod || "",
    "Transaction ID": f.transactionId || "",
    "Receipt Number": f.receiptNumber || "",
    "Remarks": f.remarks || "",
  }));

  const csv = generateCSV(headers, rows);
  logger.info(`[Export] Exported ${feeRecords.length} fee records for tenant ${tenantId}`);
  return createCSVResponse(csv, `fee_records_${tenantId}_${Date.now()}.csv`);
}

// ── Marks Export ──

export async function exportMarks(
  tenantId: string,
  filters?: { classId?: string; sectionId?: string; subjectId?: string; examType?: string; academicYear?: string }
) {
  const where: Record<string, unknown> = { tenantId };
  if (filters?.classId) where.classId = filters.classId;
  if (filters?.sectionId) where.sectionId = filters.sectionId;
  if (filters?.subjectId) where.subjectId = filters.subjectId;
  if (filters?.examType) where.examType = filters.examType;
  if (filters?.academicYear) where.academicYear = filters.academicYear;

  const marks = await prisma.mark.findMany({
    where,
    include: {
      student: {
        select: {
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      subject: { select: { name: true, code: true } },
      class: { select: { name: true } },
      section: { select: { name: true } },
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Student Roll Number", "Student Name", "Subject", "Subject Code",
    "Class", "Section", "Exam Type", "Academic Year",
    "Total Marks", "Obtained Marks", "Percentage", "Grade",
    "Remarks", "Teacher Name", "Created At",
  ];

  const rows = marks.map((m) => ({
    "Student Roll Number": m.student.rollNumber,
    "Student Name": `${m.student.user.firstName} ${m.student.user.lastName}`,
    "Subject": m.subject.name,
    "Subject Code": m.subject.code,
    "Class": m.class.name,
    "Section": m.section.name,
    "Exam Type": m.examType,
    "Academic Year": m.academicYear,
    "Total Marks": m.totalMarks,
    "Obtained Marks": m.obtainedMarks,
    "Percentage": m.percentage,
    "Grade": m.grade,
    "Remarks": m.remarks,
    "Teacher Name": `${m.teacher.user.firstName} ${m.teacher.user.lastName}`,
    "Created At": new Date(m.createdAt).toISOString().split("T")[0],
  }));

  const csv = generateCSV(headers, rows);
  logger.info(`[Export] Exported ${marks.length} marks for tenant ${tenantId}`);
  return createCSVResponse(csv, `marks_${tenantId}_${Date.now()}.csv`);
}
