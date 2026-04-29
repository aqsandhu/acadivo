import request from 'supertest';
import { jest } from '@jest/globals';

jest.mock('../../src/services/sms.service', () => ({
  sendSMS: jest.fn().mockResolvedValue({ messageId: 'mock-sms-id' }),
}));

jest.mock('../../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' }),
}));

jest.mock('../../src/services/push.service', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({ success: true }),
}));

const mockPrisma = {
  user: { findUnique: jest.fn(), findFirst: jest.fn() },
  school: { findUnique: jest.fn() },
  feeStructure: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  feeRecord: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  feePayment: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), aggregate: jest.fn() },
  student: { findUnique: jest.fn(), findMany: jest.fn() },
  notification: { create: jest.fn(), createMany: jest.fn() },
  auditLog: { create: jest.fn() },
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

const { app } = await import('../../src/app');

describe('Integration: Fee Flow', () => {
  const schoolId = 'sch_govt_pilot_lhr';
  let adminToken: string;
  const feeStructureId = 'fs_tuition_monthly';
  const feeRecordId = 'fr_001';
  const studentId = 'std_001';

  beforeEach(() => {
    jest.clearAllMocks();
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: 'usr_admin_001', role: 'ADMIN', schoolId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
  });

  it('full flow: fee structure → record → payment → installment', async () => {
    // 1. Create Fee Structure
    mockPrisma.school.findUnique.mockResolvedValue({ id: schoolId, status: 'ACTIVE' });
    mockPrisma.feeStructure.create.mockResolvedValue({
      id: feeStructureId,
      name: 'Monthly Tuition Fee - 2024-2025',
      amount: 5000,
      frequency: 'MONTHLY',
      category: 'TUITION',
      academicYear: '2024-2025',
      schoolId,
      dueDay: 5,
      lateFee: 200,
      createdAt: new Date(),
    });

    const structureRes = await request(app)
      .post('/api/fee-structures')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Monthly Tuition Fee - 2024-2025',
        amount: 5000,
        frequency: 'MONTHLY',
        category: 'TUITION',
        academicYear: '2024-2025',
        dueDay: 5,
        lateFee: 200,
      })
      .expect(201);

    expect(structureRes.body.amount).toBe(5000);
    expect(structureRes.body.frequency).toBe('MONTHLY');

    // 2. Generate Fee Records for all students
    mockPrisma.student.findMany.mockResolvedValue([
      { id: 'std_001', userId: 'usr_student_001', classId: 'cls_8th_a' },
      { id: 'std_002', userId: 'usr_student_002', classId: 'cls_8th_a' },
      { id: 'std_003', userId: 'usr_student_003', classId: 'cls_7th_a' },
    ]);

    mockPrisma.feeRecord.create.mockResolvedValue({
      id: feeRecordId,
      feeStructureId,
      studentId,
      amount: 5000,
      dueDate: new Date('2024-03-05'),
      status: 'PENDING',
      month: 'March',
      academicYear: '2024-2025',
    });

    const recordsRes = await request(app)
      .post('/api/fee-records/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        feeStructureId,
        month: 'March',
        dueDate: '2024-03-05',
        classIds: ['cls_8th_a', 'cls_7th_a'],
      })
      .expect(201);

    expect(recordsRes.body.generated).toBe(3);

    // 3. Parent makes full payment
    mockPrisma.feeRecord.findUnique.mockResolvedValue({
      id: feeRecordId,
      studentId,
      amount: 5000,
      paidAmount: 0,
      status: 'PENDING',
    });

    mockPrisma.feePayment.create.mockResolvedValue({
      id: 'fp_001',
      feeRecordId,
      amount: 5000,
      paymentMethod: 'JAZZCASH',
      transactionId: 'JC-2024-87654321',
      status: 'SUCCESS',
      paidAt: new Date(),
    });

    mockPrisma.feeRecord.update.mockResolvedValue({
      id: feeRecordId,
      paidAmount: 5000,
      status: 'PAID',
      paidAt: new Date(),
    });

    const paymentRes = await request(app)
      .post('/api/fee-payments')
      .send({
        feeRecordId,
        amount: 5000,
        paymentMethod: 'JAZZCASH',
        transactionId: 'JC-2024-87654321',
      })
      .expect(201);

    expect(paymentRes.body.status).toBe('SUCCESS');
    expect(paymentRes.body.amount).toBe(5000);

    // 4. Create another fee record and make installment payment
    mockPrisma.feeRecord.create.mockResolvedValue({
      id: 'fr_002',
      feeStructureId,
      studentId,
      amount: 5000,
      dueDate: new Date('2024-04-05'),
      status: 'PENDING',
      month: 'April',
    });

    mockPrisma.feeRecord.findUnique.mockResolvedValue({
      id: 'fr_002',
      amount: 5000,
      paidAmount: 0,
      status: 'PENDING',
    });

    mockPrisma.feePayment.create.mockResolvedValue({
      id: 'fp_002',
      feeRecordId: 'fr_002',
      amount: 2500,
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'BT-2024-11223344',
      status: 'SUCCESS',
      paidAt: new Date(),
    });

    mockPrisma.feeRecord.update.mockResolvedValue({
      id: 'fr_002',
      paidAmount: 2500,
      status: 'PARTIAL',
    });

    const installmentRes = await request(app)
      .post('/api/fee-payments')
      .send({
        feeRecordId: 'fr_002',
        amount: 2500,
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'BT-2024-11223344',
      })
      .expect(201);

    expect(installmentRes.body.amount).toBe(2500);

    // 5. Check remaining balance
    mockPrisma.feeRecord.findUnique.mockResolvedValue({
      id: 'fr_002',
      amount: 5000,
      paidAmount: 2500,
      status: 'PARTIAL',
    });

    const remainingRes = await request(app)
      .get('/api/fee-records/fr_002/balance')
      .expect(200);

    expect(remainingRes.body.totalAmount).toBe(5000);
    expect(remainingRes.body.paidAmount).toBe(2500);
    expect(remainingRes.body.remaining).toBe(2500);
    expect(remainingRes.body.status).toBe('PARTIAL');

    // 6. Apply late fee
    mockPrisma.feeStructure.findUnique.mockResolvedValue({
      id: feeStructureId,
      lateFee: 200,
    });
    mockPrisma.feeRecord.update.mockResolvedValue({
      id: 'fr_003',
      amount: 5200,
      paidAmount: 0,
      status: 'OVERDUE',
      lateFeeApplied: 200,
    });

    const lateFeeRes = await request(app)
      .post('/api/fee-records/fr_003/apply-late-fee')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(lateFeeRes.body.amount).toBe(5200);
    expect(lateFeeRes.body.lateFeeApplied).toBe(200);
  });

  it('should handle fee waiver for deserving student', async () => {
    mockPrisma.feeRecord.findUnique.mockResolvedValue({
      id: 'fr_004',
      studentId: 'std_deserving',
      amount: 5000,
      paidAmount: 0,
      status: 'PENDING',
    });

    mockPrisma.feeRecord.update.mockResolvedValue({
      id: 'fr_004',
      amount: 0,
      paidAmount: 0,
      status: 'WAIVED',
      waiverAmount: 5000,
      waiverReason: 'Orphan student - full scholarship',
    });

    mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit_001' });

    const response = await request(app)
      .post('/api/fee-records/fr_004/waive')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        waiverAmount: 5000,
        waiverReason: 'Orphan student - full scholarship',
      })
      .expect(200);

    expect(response.body.status).toBe('WAIVED');
    expect(response.body.waiverReason).toContain('Orphan student');
  });

  it('should generate fee collection report', async () => {
    mockPrisma.feePayment.aggregate.mockResolvedValue({
      _sum: { amount: 875000 },
      _count: { id: 175 },
    });

    mockPrisma.feeRecord.findMany.mockResolvedValue([
      { status: 'PAID', amount: 5000, paidAmount: 5000 },
      { status: 'PAID', amount: 5000, paidAmount: 5000 },
      { status: 'PARTIAL', amount: 5000, paidAmount: 2500 },
      { status: 'PENDING', amount: 5000, paidAmount: 0 },
      { status: 'OVERDUE', amount: 5200, paidAmount: 0 },
    ]);

    const response = await request(app)
      .get('/api/fee-reports/collection?month=March&year=2024')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.totalCollected).toBe(875000);
    expect(response.body.totalTransactions).toBe(175);
    expect(response.body.breakdown.paid).toBe(2);
    expect(response.body.breakdown.partial).toBe(1);
    expect(response.body.breakdown.pending).toBe(1);
    expect(response.body.breakdown.overdue).toBe(1);
  });
});
