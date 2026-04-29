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
  parent: { findUnique: jest.fn(), findFirst: jest.fn() },
  student: { findUnique: jest.fn(), findMany: jest.fn() },
  result: { findUnique: jest.fn(), findMany: jest.fn() },
  feeStructure: { findMany: jest.fn() },
  feeRecord: { findMany: jest.fn() },
  feePayment: { findMany: jest.fn(), create: jest.fn() },
  message: { create: jest.fn(), findMany: jest.fn() },
  notification: { create: jest.fn(), findMany: jest.fn() },
  reportRequest: { create: jest.fn(), findMany: jest.fn() },
  attendance: { findMany: jest.fn() },
  mark: { findMany: jest.fn() },
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

const { app } = await import('../../src/app');

describe('Integration: Parent Flow', () => {
  const schoolId = 'sch_govt_pilot_lhr';
  let parentToken: string;
  const parentId = 'prt_001';
  const userId = 'usr_parent_001';
  const studentId = 'std_001';

  beforeEach(() => {
    jest.clearAllMocks();
    const jwt = require('jsonwebtoken');
    parentToken = jwt.sign(
      { id: userId, role: 'PARENT', schoolId, parentId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
  });

  it('parent views their child profile', async () => {
    mockPrisma.parent.findFirst.mockResolvedValue({
      id: parentId,
      userId,
      children: [
        {
          id: studentId,
          rollNumber: 'R-2024-008-A',
          user: { name: 'Ahmad Raza', email: 'ahmad.raza.student@example.com' },
          class: { name: '8th Grade', section: { name: 'A' } },
          dateOfBirth: new Date('2010-05-15'),
          gender: 'MALE',
        },
      ],
    });

    const response = await request(app)
      .get('/api/parent/children')
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].user.name).toBe('Ahmad Raza');
    expect(response.body[0].rollNumber).toBe('R-2024-008-A');
  });

  it('parent requests progress report', async () => {
    mockPrisma.parent.findFirst.mockResolvedValue({ id: parentId, children: [{ id: studentId }] });
    mockPrisma.reportRequest.create.mockResolvedValue({
      id: 'rr_001',
      parentId,
      studentId,
      type: 'PROGRESS_REPORT',
      status: 'PENDING',
      requestedAt: new Date(),
    });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif_003' });

    const response = await request(app)
      .post('/api/report-requests')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        studentId,
        type: 'PROGRESS_REPORT',
        message: 'Please provide the monthly progress report for Ahmad.',
      })
      .expect(201);

    expect(response.body.status).toBe('PENDING');
    expect(response.body.type).toBe('PROGRESS_REPORT');
  });

  it('parent views fee details for child', async () => {
    mockPrisma.parent.findFirst.mockResolvedValue({ id: parentId, children: [{ id: studentId }] });

    mockPrisma.feeStructure.findMany.mockResolvedValue([
      {
        id: 'fs_001',
        name: 'Monthly Tuition Fee',
        amount: 5000,
        frequency: 'MONTHLY',
        category: 'TUITION',
        academicYear: '2024-2025',
      },
      {
        id: 'fs_002',
        name: 'Annual Exam Fee',
        amount: 2500,
        frequency: 'ANNUAL',
        category: 'EXAM',
        academicYear: '2024-2025',
      },
      {
        id: 'fs_003',
        name: 'Library Fee',
        amount: 500,
        frequency: 'ANNUAL',
        category: 'LIBRARY',
        academicYear: '2024-2025',
      },
    ]);

    mockPrisma.feeRecord.findMany.mockResolvedValue([
      {
        id: 'fr_001',
        feeStructureId: 'fs_001',
        studentId,
        amount: 5000,
        dueDate: new Date('2024-03-05'),
        status: 'PAID',
        paidAmount: 5000,
      },
      {
        id: 'fr_002',
        feeStructureId: 'fs_001',
        studentId,
        amount: 5000,
        dueDate: new Date('2024-04-05'),
        status: 'OVERDUE',
        paidAmount: 0,
      },
    ]);

    const response = await request(app)
      .get(`/api/fee/student/${studentId}`)
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(200);

    expect(response.body.feeStructures).toHaveLength(3);
    expect(response.body.feeRecords).toHaveLength(2);
    expect(response.body.feeRecords[1].status).toBe('OVERDUE');
  });

  it('parent makes fee payment with installment', async () => {
    mockPrisma.parent.findFirst.mockResolvedValue({ id: parentId, children: [{ id: studentId }] });
    mockPrisma.feeRecord.findUnique.mockResolvedValue({
      id: 'fr_002',
      studentId,
      amount: 5000,
      paidAmount: 0,
      status: 'OVERDUE',
    });
    mockPrisma.feePayment.create.mockResolvedValue({
      id: 'fp_001',
      feeRecordId: 'fr_002',
      amount: 2500,
      paymentMethod: 'EASYPAISA',
      transactionId: 'EP-2024-12345678',
      status: 'SUCCESS',
      paidAt: new Date(),
    });
    mockPrisma.feeRecord.findMany.mockResolvedValue([
      { id: 'fr_002', studentId, amount: 5000, paidAmount: 2500, status: 'PARTIAL' },
    ]);

    const response = await request(app)
      .post('/api/fee-payments')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        feeRecordId: 'fr_002',
        amount: 2500,
        paymentMethod: 'EASYPAISA',
        transactionId: 'EP-2024-12345678',
      })
      .expect(201);

    expect(response.body.status).toBe('SUCCESS');
    expect(response.body.amount).toBe(2500);

    // Check remaining balance
    const remainingRes = await request(app)
      .get('/api/fee-payments/remaining/fr_002')
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(200);

    expect(remainingRes.body.remaining).toBe(2500);
  });

  it('parent messages teacher', async () => {
    mockPrisma.parent.findFirst.mockResolvedValue({ id: parentId, userId, children: [{ id: studentId }] });
    mockPrisma.student.findUnique.mockResolvedValue({
      id: studentId,
      class: { classSubjects: [{ teacher: { userId: 'usr_teacher_001', user: { name: 'Fatima Zahra' } } }] },
    });
    mockPrisma.message.create.mockResolvedValue({
      id: 'msg_001',
      senderId: userId,
      receiverId: 'usr_teacher_001',
      content: 'Assalam-o-Alaikum, can we schedule a meeting to discuss Ahmad progress in Mathematics?',
      status: 'SENT',
      createdAt: new Date(),
    });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif_004' });

    const response = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        receiverId: 'usr_teacher_001',
        content: 'Assalam-o-Alaikum, can we schedule a meeting to discuss Ahmad progress in Mathematics?',
      })
      .expect(201);

    expect(response.body.content).toContain('Assalam-o-Alaikum');
    expect(response.body.status).toBe('SENT');
  });

  it('parent views child attendance summary', async () => {
    mockPrisma.parent.findFirst.mockResolvedValue({ id: parentId, children: [{ id: studentId }] });
    mockPrisma.attendance.findMany.mockResolvedValue([
      { date: '2024-03-01', status: 'PRESENT' },
      { date: '2024-03-02', status: 'PRESENT' },
      { date: '2024-03-04', status: 'ABSENT' },
      { date: '2024-03-05', status: 'PRESENT' },
      { date: '2024-03-06', status: 'PRESENT' },
    ]);

    const response = await request(app)
      .get(`/api/attendance/student/${studentId}?month=2024-03`)
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(200);

    expect(response.body.summary.present).toBe(4);
    expect(response.body.summary.absent).toBe(1);
  });
});
