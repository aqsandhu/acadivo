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
  user: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  school: { findUnique: jest.fn(), update: jest.fn() },
  teacher: { findMany: jest.fn(), count: jest.fn() },
  student: { findMany: jest.fn(), count: jest.fn() },
  parent: { findMany: jest.fn(), count: jest.fn() },
  class: { findMany: jest.fn(), count: jest.fn() },
  announcement: { create: jest.fn(), findMany: jest.fn() },
  notification: { create: jest.fn(), createMany: jest.fn(), findMany: jest.fn() },
  feePayment: { aggregate: jest.fn() },
  attendance: { aggregate: jest.fn(), findMany: jest.fn(), groupBy: jest.fn() },
  mark: { aggregate: jest.fn(), findMany: jest.fn(), groupBy: jest.fn() },
  auditLog: { create: jest.fn() },
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

const { app } = await import('../../src/app');

describe('Integration: Principal Flow', () => {
  const schoolId = 'sch_govt_pilot_lhr';
  let principalToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    const jwt = require('jsonwebtoken');
    principalToken = jwt.sign(
      { id: 'usr_principal_001', role: 'PRINCIPAL', schoolId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
  });

  it('principal sends announcement to entire school', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'usr_principal_001',
      role: 'PRINCIPAL',
      schoolId,
    });

    mockPrisma.announcement.create.mockResolvedValue({
      id: 'ann_001',
      title: 'Annual Sports Day - 15th March 2024',
      content: 'All students and parents are invited to the Annual Sports Day on Friday, 15th March 2024 at 9:00 AM.',
      schoolId,
      postedBy: 'usr_principal_001',
      targetAudience: 'ALL',
      priority: 'HIGH',
      createdAt: new Date(),
    });

    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'usr_teacher_001' },
      { id: 'usr_teacher_002' },
      { id: 'usr_parent_001' },
      { id: 'usr_parent_002' },
      { id: 'usr_student_001' },
    ]);

    mockPrisma.notification.createMany.mockResolvedValue({ count: 5 });

    const response = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${principalToken}`)
      .send({
        title: 'Annual Sports Day - 15th March 2024',
        content: 'All students and parents are invited to the Annual Sports Day on Friday, 15th March 2024 at 9:00 AM.',
        targetAudience: 'ALL',
        priority: 'HIGH',
      })
      .expect(201);

    expect(response.body.title).toContain('Annual Sports Day');
    expect(response.body.targetAudience).toBe('ALL');
    expect(mockPrisma.notification.createMany).toHaveBeenCalled();
  });

  it('principal views school statistics', async () => {
    mockPrisma.school.findUnique.mockResolvedValue({
      id: schoolId,
      name: 'Govt. Pilot Secondary School Lahore',
      status: 'ACTIVE',
    });

    mockPrisma.teacher.count.mockResolvedValue(28);
    mockPrisma.student.count.mockResolvedValue(450);
    mockPrisma.parent.count.mockResolvedValue(380);
    mockPrisma.class.count.mockResolvedValue(24);

    mockPrisma.student.findMany.mockResolvedValue([
      { gender: 'MALE' }, { gender: 'MALE' }, { gender: 'MALE' },
      { gender: 'FEMALE' }, { gender: 'FEMALE' },
    ]);

    mockPrisma.attendance.aggregate.mockResolvedValue({ _count: { id: 3800 } });
    mockPrisma.attendance.groupBy.mockResolvedValue([
      { status: 'PRESENT', _count: { id: 3420 } },
      { status: 'ABSENT', _count: { id: 280 } },
      { status: 'LATE', _count: { id: 100 } },
    ]);

    mockPrisma.feePayment.aggregate.mockResolvedValue({ _sum: { amount: 1250000 } });

    mockPrisma.mark.groupBy.mockResolvedValue([
      { grade: 'A+', _count: { id: 45 } },
      { grade: 'A', _count: { id: 120 } },
      { grade: 'B', _count: { id: 180 } },
      { grade: 'C', _count: { id: 85 } },
      { grade: 'D', _count: { id: 20 } },
    ]);

    const response = await request(app)
      .get('/api/school/stats')
      .set('Authorization', `Bearer ${principalToken}`)
      .expect(200);

    expect(response.body.teachers).toBe(28);
    expect(response.body.students).toBe(450);
    expect(response.body.parents).toBe(380);
    expect(response.body.classes).toBe(24);
    expect(response.body.attendance.presentPercentage).toBe(90);
    expect(response.body.feeCollection.total).toBe(1250000);
    expect(response.body.performanceDistribution.Aplus).toBe(45);
  });

  it('principal views teacher performance summary', async () => {
    mockPrisma.teacher.findMany.mockResolvedValue([
      {
        id: 'tch_001',
        employeeId: 'EMP-2024-001',
        user: { name: 'Fatima Zahra' },
        _count: { classSubjects: 3, homework: 12 },
        classSubjects: [
          { subject: { name: 'Mathematics' } },
          { subject: { name: 'Physics' } },
        ],
      },
      {
        id: 'tch_002',
        employeeId: 'EMP-2024-002',
        user: { name: 'Ayesha Siddiqui' },
        _count: { classSubjects: 2, homework: 8 },
        classSubjects: [
          { subject: { name: 'English' } },
        ],
      },
    ]);

    const response = await request(app)
      .get('/api/teachers/performance')
      .set('Authorization', `Bearer ${principalToken}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].user.name).toBe('Fatima Zahra');
    expect(response.body[0]._count.homework).toBe(12);
  });

  it('principal views attendance overview by class', async () => {
    mockPrisma.class.findMany.mockResolvedValue([
      { id: 'cls_6th', name: '6th Grade' },
      { id: 'cls_7th', name: '7th Grade' },
      { id: 'cls_8th', name: '8th Grade' },
    ]);

    mockPrisma.attendance.groupBy.mockResolvedValue([
      { classId: 'cls_6th', status: 'PRESENT', _count: { id: 120 } },
      { classId: 'cls_6th', status: 'ABSENT', _count: { id: 10 } },
      { classId: 'cls_7th', status: 'PRESENT', _count: { id: 135 } },
      { classId: 'cls_7th', status: 'ABSENT', _count: { id: 15 } },
      { classId: 'cls_8th', status: 'PRESENT', _count: { id: 140 } },
      { classId: 'cls_8th', status: 'ABSENT', _count: { id: 8 } },
    ]);

    const response = await request(app)
      .get('/api/attendance/overview?date=2024-03-15')
      .set('Authorization', `Bearer ${principalToken}`)
      .expect(200);

    expect(response.body).toHaveLength(3);
    expect(response.body[2].className).toBe('8th Grade');
    expect(response.body[2].presentPercentage).toBeGreaterThan(90);
  });

  it('principal creates urgent notice for specific grade', async () => {
    mockPrisma.announcement.create.mockResolvedValue({
      id: 'ann_002',
      title: '8th Grade Exam Schedule Update',
      content: 'Mid-term exams for 8th Grade have been rescheduled to 20th March.',
      schoolId,
      postedBy: 'usr_principal_001',
      targetAudience: 'STUDENTS',
      targetClassId: 'cls_8th_a',
      priority: 'URGENT',
      createdAt: new Date(),
    });

    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'usr_student_001' },
      { id: 'usr_student_002' },
      { id: 'usr_student_003' },
    ]);
    mockPrisma.notification.createMany.mockResolvedValue({ count: 3 });

    const response = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${principalToken}`)
      .send({
        title: '8th Grade Exam Schedule Update',
        content: 'Mid-term exams for 8th Grade have been rescheduled to 20th March.',
        targetAudience: 'STUDENTS',
        targetClassId: 'cls_8th_a',
        priority: 'URGENT',
      })
      .expect(201);

    expect(response.body.priority).toBe('URGENT');
    expect(response.body.targetClassId).toBe('cls_8th_a');
  });
});
