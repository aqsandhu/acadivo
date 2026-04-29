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
  teacher: { findUnique: jest.fn(), findFirst: jest.fn() },
  student: { findUnique: jest.fn(), findMany: jest.fn() },
  class: { findMany: jest.fn(), findUnique: jest.fn() },
  classSubject: { findMany: jest.fn() },
  attendance: { createMany: jest.fn(), findMany: jest.fn() },
  homework: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  homeworkSubmission: { findMany: jest.fn(), update: jest.fn() },
  mark: { create: jest.fn(), findMany: jest.fn() },
  message: { create: jest.fn(), findMany: jest.fn() },
  qna: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  notification: { create: jest.fn(), createMany: jest.fn() },
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

const { app } = await import('../../src/app');

describe('Integration: Teacher Flow', () => {
  const schoolId = 'sch_govt_pilot_lhr';
  let teacherToken: string;
  const teacherId = 'tch_001';
  const classId = 'cls_8th_a';

  beforeEach(() => {
    jest.clearAllMocks();
    const jwt = require('jsonwebtoken');
    teacherToken = jwt.sign(
      { id: 'usr_teacher_001', role: 'TEACHER', schoolId, teacherId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
  });

  it('teacher marks attendance for their class', async () => {
    mockPrisma.teacher.findFirst.mockResolvedValue({
      id: teacherId,
      userId: 'usr_teacher_001',
      classAssignments: [{ classId, sectionId: 'sec_8th_a' }],
    });

    mockPrisma.student.findMany.mockResolvedValue([
      { id: 'std_001', rollNumber: 'R-2024-008-A', user: { name: 'Ahmad Raza' } },
      { id: 'std_002', rollNumber: 'R-2024-008-B', user: { name: 'Sana Malik' } },
      { id: 'std_003', rollNumber: 'R-2024-008-C', user: { name: 'Bilal Khan' } },
    ]);

    mockPrisma.attendance.createMany.mockResolvedValue({ count: 3 });
    mockPrisma.attendance.findMany.mockResolvedValue([
      { id: 'att_001', studentId: 'std_001', status: 'PRESENT' },
      { id: 'att_002', studentId: 'std_002', status: 'PRESENT' },
      { id: 'att_003', studentId: 'std_003', status: 'ABSENT' },
    ]);

    const response = await request(app)
      .post('/api/attendance/bulk')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        classId,
        date: '2024-03-15',
        records: [
          { studentId: 'std_001', status: 'PRESENT' },
          { studentId: 'std_002', status: 'PRESENT' },
          { studentId: 'std_003', status: 'ABSENT' },
        ],
      })
      .expect(201);

    expect(response.body.count).toBe(3);
    expect(mockPrisma.attendance.createMany).toHaveBeenCalled();
  });

  it('teacher creates homework for assigned subject', async () => {
    mockPrisma.teacher.findUnique.mockResolvedValue({
      id: teacherId,
      userId: 'usr_teacher_001',
    });
    mockPrisma.classSubject.findMany.mockResolvedValue([
      { classId, subjectId: 'sub_math_8', subject: { name: 'Mathematics' } },
    ]);

    mockPrisma.homework.create.mockResolvedValue({
      id: 'hw_002',
      title: 'Algebraic Identities - Exercise 3.4',
      description: 'Prove all identities and solve examples 1-10.',
      subjectId: 'sub_math_8',
      classId,
      teacherId,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxMarks: 15,
      schoolId,
      createdAt: new Date(),
    });

    mockPrisma.student.findMany.mockResolvedValue([
      { id: 'std_001', userId: 'usr_student_001' },
      { id: 'std_002', userId: 'usr_student_002' },
    ]);
    mockPrisma.notification.createMany.mockResolvedValue({ count: 2 });

    const response = await request(app)
      .post('/api/homework')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Algebraic Identities - Exercise 3.4',
        description: 'Prove all identities and solve examples 1-10.',
        subjectId: 'sub_math_8',
        classId,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: 15,
      })
      .expect(201);

    expect(response.body.title).toContain('Algebraic Identities');
    expect(response.body.teacherId).toBe(teacherId);
  });

  it('teacher grades homework submissions', async () => {
    mockPrisma.homeworkSubmission.findMany.mockResolvedValue([
      {
        id: 'sub_001',
        studentId: 'std_001',
        homeworkId: 'hw_002',
        status: 'SUBMITTED',
        submissionText: 'All identities proved.',
      },
      {
        id: 'sub_002',
        studentId: 'std_002',
        homeworkId: 'hw_002',
        status: 'SUBMITTED',
        submissionText: 'Completed 8 out of 10.',
      },
    ]);

    mockPrisma.homeworkSubmission.update.mockResolvedValue({
      id: 'sub_001',
      marks: 14,
      feedback: 'Good work. Minor errors in Q3.',
      status: 'GRADED',
    });

    const response = await request(app)
      .put('/api/homework-submissions/sub_001/grade')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        marks: 14,
        feedback: 'Good work. Minor errors in Q3.',
      })
      .expect(200);

    expect(response.body.marks).toBe(14);
    expect(response.body.status).toBe('GRADED');
  });

  it('teacher enters exam marks for all students', async () => {
    mockPrisma.student.findMany.mockResolvedValue([
      { id: 'std_001', user: { name: 'Ahmad Raza' } },
      { id: 'std_002', user: { name: 'Sana Malik' } },
      { id: 'std_003', user: { name: 'Bilal Khan' } },
    ]);

    mockPrisma.mark.create.mockResolvedValue({
      id: 'mark_001',
      studentId: 'std_001',
      subjectId: 'sub_math_8',
      examType: 'QUIZ_1',
      totalMarks: 20,
      obtainedMarks: 18,
      percentage: 90,
      grade: 'A+',
    });

    const response = await request(app)
      .post('/api/marks')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        studentId: 'std_001',
        subjectId: 'sub_math_8',
        classId,
        examType: 'QUIZ_1',
        totalMarks: 20,
        obtainedMarks: 18,
      })
      .expect(201);

    expect(response.body.obtainedMarks).toBe(18);
    expect(response.body.grade).toBe('A+');
  });

  it('teacher answers student Q&A', async () => {
    mockPrisma.qna.findMany.mockResolvedValue([
      {
        id: 'qna_001',
        studentId: 'std_001',
        question: 'How do we factorize quadratic equations?',
        answer: null,
        status: 'PENDING',
        createdAt: new Date(),
      },
    ]);

    mockPrisma.qna.update.mockResolvedValue({
      id: 'qna_001',
      studentId: 'std_001',
      question: 'How do we factorize quadratic equations?',
      answer: 'Use the method of splitting the middle term or apply the quadratic formula.',
      answeredBy: teacherId,
      status: 'ANSWERED',
      answeredAt: new Date(),
    });

    mockPrisma.notification.create.mockResolvedValue({ id: 'notif_001' });

    const response = await request(app)
      .put('/api/qna/qna_001/answer')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        answer: 'Use the method of splitting the middle term or apply the quadratic formula.',
      })
      .expect(200);

    expect(response.body.status).toBe('ANSWERED');
    expect(response.body.answer).toContain('splitting the middle term');
  });
});
