export interface FeeStructureFactoryOptions {
  name?: string;
  amount: number;
  frequency?: string;
  category?: string;
  schoolId: string;
  academicYear?: string;
  dueDay?: number;
  lateFee?: number;
  description?: string;
}

export interface FeeRecordFactoryOptions {
  feeStructureId: string;
  studentId: string;
  amount?: number;
  dueDate?: Date;
  month?: string;
  academicYear?: string;
  status?: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'WAIVED';
  paidAmount?: number;
  lateFeeApplied?: number;
}

export interface FeePaymentFactoryOptions {
  feeRecordId: string;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  status?: string;
  paidBy?: string;
}

let feeStructureCounter = 0;
let feeRecordCounter = 0;
let feePaymentCounter = 0;

export async function createFeeStructure(options: FeeStructureFactoryOptions, prisma: any) {
  feeStructureCounter++;
  return prisma.feeStructure.create({
    data: {
      id: `fs_test_${feeStructureCounter}`,
      name: options.name || `Fee Structure #${feeStructureCounter}`,
      amount: options.amount,
      frequency: options.frequency || 'MONTHLY',
      category: options.category || 'TUITION',
      schoolId: options.schoolId,
      academicYear: options.academicYear || '2024-2025',
      dueDay: options.dueDay || 5,
      lateFee: options.lateFee || 200,
      description: options.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createFeeRecord(options: FeeRecordFactoryOptions, prisma: any) {
  feeRecordCounter++;
  const now = new Date();
  return prisma.feeRecord.create({
    data: {
      id: `fr_test_${feeRecordCounter}`,
      feeStructureId: options.feeStructureId,
      studentId: options.studentId,
      amount: options.amount || 5000,
      dueDate: options.dueDate || new Date(now.getFullYear(), now.getMonth(), 5),
      month: options.month || now.toLocaleString('default', { month: 'long' }),
      academicYear: options.academicYear || '2024-2025',
      status: options.status || 'PENDING',
      paidAmount: options.paidAmount || 0,
      lateFeeApplied: options.lateFeeApplied || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createFeePayment(options: FeePaymentFactoryOptions, prisma: any) {
  feePaymentCounter++;
  return prisma.feePayment.create({
    data: {
      id: `fp_test_${feePaymentCounter}`,
      feeRecordId: options.feeRecordId,
      amount: options.amount,
      paymentMethod: options.paymentMethod || 'CASH',
      transactionId: options.transactionId || `TXN-${Date.now()}-${feePaymentCounter}`,
      status: options.status || 'SUCCESS',
      paidBy: options.paidBy || null,
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function generateFeeRecordsForClass(
  feeStructureId: string,
  studentIds: string[],
  month: string,
  dueDate: Date,
  prisma: any
) {
  const records = [];
  for (const studentId of studentIds) {
    const record = await createFeeRecord(
      {
        feeStructureId,
        studentId,
        month,
        dueDate,
      },
      prisma
    );
    records.push(record);
  }
  return records;
}

export function resetFeeCounter() {
  feeStructureCounter = 0;
  feeRecordCounter = 0;
  feePaymentCounter = 0;
}
