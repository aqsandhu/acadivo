// ─────────────────────────────────────────────
// Export Routes — CSV data export endpoints
// ─────────────────────────────────────────────

import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const router = Router();

// ── CSV Helpers ──

function toCSV(headers: string[], rows: any[]): string {
  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.join(",");
  const lines = rows.map((row) => headers.map((h) => escape(row[h])).join(","));
  return [headerLine, ...lines].join("\n");
}

function sendCSV(res: Response, filename: string, csv: string) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}

// ── GET /admin/export/students ──

router.get("/students", async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const students = await prisma.student.findMany({
    where: { tenantId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, gender: true } },
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
    orderBy: { rollNumber: "asc" },
  });

  const rows = students.map((s) => ({
    rollNumber: s.rollNumber,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    email: s.user.email,
    phone: s.user.phone,
    gender: s.user.gender,
    className: s.class.name,
    sectionName: s.section.name,
    guardianName: s.guardianName,
    guardianPhone: s.guardianPhone,
    guardianRelation: s.guardianRelation,
    bloodGroup: s.bloodGroup,
    status: s.status,
    admissionDate: s.admissionDate.toISOString().split("T")[0],
  }));

  const csv = toCSV(
    ["rollNumber", "firstName", "lastName", "email", "phone", "gender", "className", "sectionName", "guardianName", "guardianPhone", "guardianRelation", "bloodGroup", "status", "admissionDate"],
    rows
  );
  sendCSV(res, `students_${tenantId.slice(0, 8)}_${Date.now()}.csv`, csv);
});

// ── GET /admin/export/teachers ──

router.get("/teachers", async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const teachers = await prisma.teacher.findMany({
    where: { tenantId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, gender: true, isActive: true } },
      assignedClass: { select: { name: true } },
      assignedSection: { select: { name: true } },
    },
    orderBy: { joiningDate: "desc" },
  });

  const rows = teachers.map((t) => ({
    firstName: t.user.firstName,
    lastName: t.user.lastName,
    email: t.user.email,
    phone: t.user.phone,
    gender: t.user.gender,
    specialization: t.specialization,
    experience: t.experience,
    qualifications: t.qualifications,
    joiningDate: t.joiningDate ? t.joiningDate.toISOString().split("T")[0] : "",
    isClassTeacher: t.isClassTeacher,
    assignedClass: t.assignedClass?.name || "",
    assignedSection: t.assignedSection?.name || "",
    isActive: t.user.isActive,
  }));

  const csv = toCSV(
    ["firstName", "lastName", "email", "phone", "gender", "specialization", "experience", "qualifications", "joiningDate", "isClassTeacher", "assignedClass", "assignedSection", "isActive"],
    rows
  );
  sendCSV(res, `teachers_${tenantId.slice(0, 8)}_${Date.now()}.csv`, csv);
});

// ── GET /admin/export/attendance ──

router.get("/attendance", async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const from = (req.query.from as string) || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const to = (req.query.to as string) || new Date().toISOString().split("T")[0];

  const records = await prisma.attendance.findMany({
    where: {
      tenantId,
      date: { gte: new Date(from), lte: new Date(to + "T23:59:59.999Z") },
    },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 10000,
  });

  const rows = records.map((r) => ({
    date: r.date.toISOString().split("T")[0],
    studentName: `${r.student.user.firstName} ${r.student.user.lastName}`,
    className: r.class.name,
    sectionName: r.section.name,
    status: r.status,
    periodNumber: r.periodNumber || "",
    remarks: r.remarks || "",
  }));

  const csv = toCSV(
    ["date", "studentName", "className", "sectionName", "status", "periodNumber", "remarks"],
    rows
  );
  sendCSV(res, `attendance_${tenantId.slice(0, 8)}_${Date.now()}.csv`, csv);
});

// ── GET /admin/export/fee ──

router.get("/fee", async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const records = await prisma.feeRecord.findMany({
    where: { tenantId },
    include: {
      feeStructure: { select: { feeType: true, frequency: true } },
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const rows = records.map((r) => ({
    studentName: `${r.student.user.firstName} ${r.student.user.lastName}`,
    feeType: r.feeStructure.feeType,
    frequency: r.feeStructure.frequency,
    amount: r.amount,
    discountAmount: r.discountAmount || 0,
    finalAmount: r.finalAmount,
    paidAmount: r.paidAmount,
    balance: r.balance,
    status: r.status,
    dueDate: r.dueDate ? r.dueDate.toISOString().split("T")[0] : "",
    paidDate: r.paidDate ? r.paidDate.toISOString().split("T")[0] : "",
    paymentMethod: r.paymentMethod || "",
  }));

  const csv = toCSV(
    ["studentName", "feeType", "frequency", "amount", "discountAmount", "finalAmount", "paidAmount", "balance", "status", "dueDate", "paidDate", "paymentMethod"],
    rows
  );
  sendCSV(res, `fee_records_${tenantId.slice(0, 8)}_${Date.now()}.csv`, csv);
});

export default router;
