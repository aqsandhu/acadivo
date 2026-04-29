import { FeeStatus, PaymentMethod } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";



// ──────────────────────────────────────────────
// Fee Structure Service
// ──────────────────────────────────────────────

export async function getFeeStructures(tenantId: string, academicYear?: string, classId?: string) {
  const where: Record<string, unknown> = { tenantId, isActive: true };
  if (academicYear) where.academicYear = academicYear;
  if (classId) where.classId = classId;

  return prisma.feeStructure.findMany({
    where,
    orderBy: [{ feeType: "asc" }, { createdAt: "desc" }],
    include: {
      class: { select: { id: true, name: true, grade: true } },
      _count: { select: { feeRecords: true } },
    },
  });
}

export async function getFeeStructureById(id: string, tenantId: string) {
  const feeStructure = await prisma.feeStructure.findFirst({
    where: { id, tenantId },
    include: {
      class: { select: { id: true, name: true, grade: true } },
      feeRecords: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              userId: true,
              rollNumber: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });
  if (!feeStructure) throw ApiError.notFound("Fee structure not found");
  return feeStructure;
}

export async function createFeeStructure(
  tenantId: string,
  data: {
    classId?: string;
    feeType: string;
    amount: number;
    frequency: string;
    dueDay?: number;
    lateFeePerDay?: number;
    academicYear: string;
  }
) {
  return prisma.feeStructure.create({
    data: {
      tenantId,
      classId: data.classId,
      feeType: data.feeType as any,
      amount: data.amount,
      frequency: data.frequency as any,
      dueDay: data.dueDay,
      lateFeePerDay: data.lateFeePerDay,
      academicYear: data.academicYear,
    },
    include: {
      class: { select: { id: true, name: true } },
    },
  });
}

export async function updateFeeStructure(
  id: string,
  tenantId: string,
  data: Partial<{
    classId: string;
    feeType: string;
    amount: number;
    frequency: string;
    dueDay: number;
    lateFeePerDay: number;
    academicYear: string;
    isActive: boolean;
  }>
) {
  const feeStructure = await prisma.feeStructure.findFirst({ where: { id, tenantId } });
  if (!feeStructure) throw ApiError.notFound("Fee structure not found");

  const updateData: Record<string, unknown> = {};
  if (data.classId !== undefined) updateData.classId = data.classId || null;
  if (data.feeType !== undefined) updateData.feeType = data.feeType;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.dueDay !== undefined) updateData.dueDay = data.dueDay;
  if (data.lateFeePerDay !== undefined) updateData.lateFeePerDay = data.lateFeePerDay;
  if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.feeStructure.update({
    where: { id },
    data: updateData,
    include: { class: { select: { id: true, name: true } } },
  });
}

export async function deactivateFeeStructure(id: string, tenantId: string) {
  const feeStructure = await prisma.feeStructure.findFirst({ where: { id, tenantId } });
  if (!feeStructure) throw ApiError.notFound("Fee structure not found");

  return prisma.feeStructure.update({
    where: { id },
    data: { isActive: false },
  });
}

// ──────────────────────────────────────────────
// Fee Record Service
// ──────────────────────────────────────────────

export async function getFeeRecords(
  tenantId: string,
  filters: {
    studentId?: string;
    status?: FeeStatus;
    academicYear?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { studentId, status, academicYear, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { tenantId };
  if (studentId) where.studentId = studentId;
  if (status) where.status = status;
  if (academicYear) {
    where.feeStructure = { academicYear };
  }

  const [records, totalCount] = await Promise.all([
    prisma.feeRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: {
          select: {
            userId: true,
            rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
        feeStructure: {
          select: { id: true, feeType: true, frequency: true, academicYear: true },
        },
      },
    }),
    prisma.feeRecord.count({ where }),
  ]);

  return { records, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getFeeRecordById(id: string, tenantId: string) {
  const record = await prisma.feeRecord.findFirst({
    where: { id, tenantId },
    include: {
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true, phone: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
      feeStructure: {
        select: { id: true, feeType: true, amount: true, frequency: true, academicYear: true },
      },
    },
  });
  if (!record) throw ApiError.notFound("Fee record not found");
  return record;
}

export async function createFeeRecord(
  tenantId: string,
  data: {
    studentId: string;
    feeStructureId: string;
    amount: number;
    discountAmount?: number;
    discountReason?: string;
    dueDate: string;
    remarks?: string;
  }
) {
  const feeStructure = await prisma.feeStructure.findFirst({
    where: { id: data.feeStructureId, tenantId },
  });
  if (!feeStructure) throw ApiError.notFound("Fee structure not found");

  const finalAmount = data.amount - (data.discountAmount || 0);

  return prisma.feeRecord.create({
    data: {
      tenantId,
      studentId: data.studentId,
      feeStructureId: data.feeStructureId,
      amount: data.amount,
      discountAmount: data.discountAmount || 0,
      discountReason: data.discountReason,
      finalAmount,
      paidAmount: 0,
      balance: finalAmount,
      status: "UNPAID",
      dueDate: new Date(data.dueDate),
      remarks: data.remarks,
    },
    include: {
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      feeStructure: { select: { id: true, feeType: true } },
    },
  });
}

export async function updateFeeRecord(
  id: string,
  tenantId: string,
  data: {
    amount?: number;
    discountAmount?: number;
    discountReason?: string;
    dueDate?: string;
    status?: FeeStatus;
    remarks?: string;
  }
) {
  const record = await prisma.feeRecord.findFirst({ where: { id, tenantId } });
  if (!record) throw ApiError.notFound("Fee record not found");

  const updateData: Record<string, unknown> = {};

  if (data.amount !== undefined) updateData.amount = data.amount;
  const discount = data.discountAmount !== undefined ? data.discountAmount : record.discountAmount || 0;
  const amount = data.amount !== undefined ? data.amount : record.amount;
  updateData.discountAmount = discount;
  updateData.finalAmount = amount - discount;
  if (data.discountReason !== undefined) updateData.discountReason = data.discountReason;
  if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;

  // Recalculate balance
  const finalAmount = (updateData.amount as number || record.amount) - (updateData.discountAmount as number || 0);
  updateData.finalAmount = finalAmount;
  updateData.balance = finalAmount - record.paidAmount;

  return prisma.feeRecord.update({
    where: { id },
    data: updateData,
    include: {
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      feeStructure: { select: { id: true, feeType: true } },
    },
  });
}

export async function recordPayment(
  id: string,
  tenantId: string,
  data: { amount: number; method: PaymentMethod; transactionId?: string }
) {
  const record = await prisma.feeRecord.findFirst({
    where: { id, tenantId },
  });
  if (!record) throw ApiError.notFound("Fee record not found");

  const newPaidAmount = parseFloat(record.paidAmount.toString()) + data.amount;
  const finalAmount = parseFloat(record.finalAmount.toString());
  const balance = finalAmount - newPaidAmount;

  let status: FeeStatus = "PARTIAL";
  if (balance <= 0) status = "PAID";
  if (balance === finalAmount) status = "UNPAID";

  const updated = await prisma.feeRecord.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      balance: balance > 0 ? balance : 0,
      status,
      paymentMethod: data.method,
      transactionId: data.transactionId,
      paidDate: new Date(),
      receiptNumber: generateReceiptNumber(tenantId),
    },
    include: {
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true, phone: true } },
        },
      },
      feeStructure: { select: { id: true, feeType: true } },
    },
  });

  // Update installments if any
  if (record.installments) {
    const installments = record.installments as Array<{
      installmentNo: number;
      amount: number;
      dueDate: string;
      status: string;
      paidDate?: string;
    }>;

    let remainingPayment = data.amount;
    for (const inst of installments) {
      if (inst.status === "PAID") continue;
      if (remainingPayment <= 0) break;
      if (remainingPayment >= inst.amount) {
        inst.status = "PAID";
        inst.paidDate = new Date().toISOString();
        remainingPayment -= inst.amount;
      } else {
        // Partially paid an installment — this is a simplified model
        inst.status = "PARTIAL";
        inst.paidDate = new Date().toISOString();
        remainingPayment = 0;
      }
    }

    await prisma.feeRecord.update({
      where: { id },
      data: { installments },
    });
  }

  return updated;
}

export async function getDefaulters(
  tenantId: string,
  filters: {
    classId?: string;
    daysOverdue?: number;
    page?: number;
    pageSize?: number;
  }
) {
  const { classId, daysOverdue = 0, page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = {
    tenantId,
    OR: [{ status: "UNPAID" }, { status: "PARTIAL" }],
  };

  if (daysOverdue > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOverdue);
    where.dueDate = { lt: cutoff };
  }

  if (classId) {
    where.student = { classId };
  }

  const [records, totalCount] = await Promise.all([
    prisma.feeRecord.findMany({
      where,
      orderBy: { dueDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: {
          select: {
            userId: true,
            rollNumber: true,
            user: { select: { firstName: true, lastName: true, phone: true } },
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
        feeStructure: { select: { id: true, feeType: true } },
      },
    }),
    prisma.feeRecord.count({ where }),
  ]);

  return { records, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getFeeSummary(tenantId: string, academicYear?: string) {
  const fsWhere: Record<string, unknown> = { tenantId };
  if (academicYear) fsWhere.academicYear = academicYear;

  const [totalRecords, paidRecords, unpaidRecords, partialRecords, waivedRecords, totalExpected, totalPaid, totalPending] =
    await Promise.all([
      prisma.feeRecord.count({ where: { tenantId } }),
      prisma.feeRecord.count({ where: { tenantId, status: "PAID" } }),
      prisma.feeRecord.count({ where: { tenantId, status: "UNPAID" } }),
      prisma.feeRecord.count({ where: { tenantId, status: "PARTIAL" } }),
      prisma.feeRecord.count({ where: { tenantId, status: "WAIVED" } }),
      prisma.feeRecord.aggregate({ where: { tenantId }, _sum: { finalAmount: true } }),
      prisma.feeRecord.aggregate({ where: { tenantId }, _sum: { paidAmount: true } }),
      prisma.feeRecord.aggregate({ where: { tenantId, status: { in: ["UNPAID", "PARTIAL"] } }, _sum: { balance: true } }),
    ]);

  return {
    totalRecords,
    paidRecords,
    unpaidRecords,
    partialRecords,
    waivedRecords,
    totalExpected: totalExpected._sum.finalAmount || 0,
    totalPaid: totalPaid._sum.paidAmount || 0,
    totalPending: totalPending._sum.balance || 0,
    collectionRate: totalExpected._sum.finalAmount
      ? (parseFloat(totalPaid._sum.paidAmount?.toString() || "0") / parseFloat(totalExpected._sum.finalAmount.toString())) * 100
      : 0,
    byFeeType: await getSummaryByFeeType(tenantId, academicYear),
  };
}

async function getSummaryByFeeType(tenantId: string, academicYear?: string) {
  const feeStructures = await prisma.feeStructure.findMany({
    where: { tenantId, ...(academicYear ? { academicYear } : {}) },
    select: { id: true, feeType: true },
  });

  const results = await Promise.all(
    feeStructures.map(async (fs) => {
      const agg = await prisma.feeRecord.aggregate({
        where: { tenantId, feeStructureId: fs.id },
        _sum: { finalAmount: true, paidAmount: true, balance: true },
        _count: { id: true },
      });
      return {
        feeType: fs.feeType,
        totalExpected: agg._sum.finalAmount || 0,
        totalPaid: agg._sum.paidAmount || 0,
        totalPending: agg._sum.balance || 0,
        recordCount: agg._count.id,
      };
    })
  );

  return results;
}

// ──────────────────────────────────────────────
// Installment Service
// ──────────────────────────────────────────────

export interface Installment {
  installmentNo: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
  paidDate?: string;
}

export async function createInstallments(
  id: string,
  tenantId: string,
  data: { count: number; startDate: string; intervalDays: number }
) {
  const record = await prisma.feeRecord.findFirst({
    where: { id, tenantId },
  });
  if (!record) throw ApiError.notFound("Fee record not found");

  const finalAmount = parseFloat(record.finalAmount.toString());
  const installmentAmount = parseFloat((finalAmount / data.count).toFixed(2));
  const remainder = parseFloat((finalAmount - installmentAmount * data.count).toFixed(2));

  const installments: Installment[] = [];
  let currentDate = new Date(data.startDate);

  for (let i = 0; i < data.count; i++) {
    const amount = i === data.count - 1 ? installmentAmount + remainder : installmentAmount;
    const dueDate = new Date(currentDate);
    const status = dueDate < new Date() ? "OVERDUE" : "PENDING";

    installments.push({
      installmentNo: i + 1,
      amount,
      dueDate: dueDate.toISOString(),
      status: record.status === "PAID" ? "PAID" : status,
      paidDate: record.status === "PAID" ? new Date().toISOString() : undefined,
    });

    currentDate.setDate(currentDate.getDate() + data.intervalDays);
  }

  const updated = await prisma.feeRecord.update({
    where: { id },
    data: { installments },
    include: {
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      feeStructure: { select: { id: true, feeType: true } },
    },
  });

  return { record: updated, installments };
}

export async function getInstallments(id: string, tenantId: string) {
  const record = await prisma.feeRecord.findFirst({
    where: { id, tenantId },
    select: { installments: true, finalAmount: true, paidAmount: true, status: true },
  });
  if (!record) throw ApiError.notFound("Fee record not found");

  const installments = (record.installments || []) as Installment[];

  // Update statuses based on current date
  const now = new Date();
  for (const inst of installments) {
    if (inst.status === "PENDING" && new Date(inst.dueDate) < now) {
      inst.status = "OVERDUE";
    }
  }

  return { installments, totalAmount: record.finalAmount, paidAmount: record.paidAmount, status: record.status };
}

function generateReceiptNumber(tenantId: string): string {
  const prefix = "RCP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = tenantId.substring(0, 4).toUpperCase();
  return `${prefix}-${suffix}-${timestamp}`;
}
