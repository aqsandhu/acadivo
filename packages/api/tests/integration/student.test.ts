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
  student: { findUnique: jest.fn(), findFirst: jest.fn() },
  timetable: { findMany: jest.fn(), findUnique: jest.fn() },
  homework: { findMany: jest.fn(), findUnique: jest.fn() },
  homeworkSubmission: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  attendance: { findMany: jest.fn() },
  mark: { findMany: jest.fn() },
  result: { findUnique: jest.fn(), findMany: jest.fn() },
  qna: { create: jest.fn(), findMany: jest.fn() },
  message: { create: jest.fn(), findMany: jest.fn() },
  notification: { create: jest.fn(), findMany: jest.fn() },
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

const { app } = await import('../../src/app');

describe('Integration: Student Flow', () => {
  const schoolId = 'sch_govt_pilot_lhr';
  let studentToken: string;
  const studentId = 'std_001';
  const userId = 'usr_student_001';

  beforeEach(() => {
    jest.clearAllMocks();
    const jwt = require('jsonwebtoken');
    studentToken = jwt.sign(
      { id: userId, role: 'STUDENT', schoolId, studentId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
  });

  it('student views their timetable', async () => {
    mockPrisma.student.findUnique.mockResolvedValue({
      id: studentId,
      classId: 'cls_8th_a',
      sectionId: 'sec_8th_a',
      userId,
    });

    mockPrisma.timetable.findMany.mockResolvedValue([
      {
        id: 'tt_001',
        day: 'MONDAY',
        period: 1,
        startTime: '08:00',
        endTime: '08:45',
        subject: { name: 'Mathematics', code: 'MATH-08' },
        teacher: { user: { name: 'Fatima Zahra' } },
        roomNumber: 'Room 105',
      },
      {
        id: 'tt_002',
        day: 'MONDAY',
        period: 2,
        startTime: '08:45',
        endTime: '09:30',
        subject: { name: 'English', code: 'ENG-08' },
        teacher: { user: { name: 'Ayesha Siddiqui' } },
        roomNumber: 'Room 102',
      },
      {
        id: 'tt_003',
        day: 'MONDAY',
        period: 3,
        startTime: '09:30',
        endTime: '10:15',
        subject: { name: 'Science', code: 'SCI-08' },
        teacher: { user: { name: 'Dr. Imran Ali' } },
        roomNumber: 'Lab 1',
      },
      {
        id: 'tt_004',
        day: 'MONDAY',
        period: 4,
        startTime: '10:15',
        endTime: '10:45',
        subject: { name: 'Break', code: 'BRK' },
        teacher: null,
        roomNumber: null,
      },
      {
        id: 'tt_005',
        day: 'MONDAY',
        period: 5,
        startTime: '10:45',
        endTime: '11:30',
        subject: { name: 'Urdu', code: 'URD-08' },
        teacher: { user: { name: 'Khalid Mehmood' } },
        roomNumber: 'Room 105',
      },
    ]);

    const response = await request(app)
      .get('/api/timetable/my')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(response.body).toHaveLength(5);
    expect(response.body[0].subject.name).toBe('Mathematics');
    expect(response.body[2].roomNumber).toBe('Lab 1');
  });

  it('student views assigned homework', async () => {
    mockPrisma.student.findUnique.mockResolvedValue({ id: studentId, classId: 'cls_8th_a' });

    mockPrisma.homework.findMany.mockResolvedValue([
      {
        id: 'hw_001',
        title: 'Quadratic Equations - Exercise 5.2',
        description: 'Solve all problems.',
        subject: { name: 'Mathematics' },
        teacher: { user: { name: 'Fatima Zahra' } },
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        maxMarks: 20,
      },
      {
        id: 'hw_002',
        title: 'Essay: My Favorite Festival',
        description: 'Write 300 words.',
        subject: { name: 'English' },
        teacher: { user: { name: 'Ayesha Siddiqui' } },
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxMarks: 15,
      },
    ]);

    const response = await request(app)
      .get('/api/homework/my')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toContain('Quadratic');
  });

  it('student submits homework', async () => {
    mockPrisma.student.findUnique.mockResolvedValue({ id: studentId, userId });
    mockPrisma.homework.findUnique.mockResolvedValue({
      id: 'hw_001',
      classId: 'cls_8th_a',
      status: 'ACTIVE',
    });
    mockPrisma.homeworkSubmission.findUnique.mockResolvedValue(null);
    mockPrisma.homeworkSubmission.create.mockResolvedValue({
      id: 'sub_003',
      homeworkId: 'hw_001',
      studentId,
      submissionText: 'Completed all 12 problems with detailed steps.',
      attachmentUrl: 'https://mock.cloudinary.com/submission.png',
      status: 'SUBMITTED',
      submittedAt: new Date(),
    });

    const response = await request(app)
      .post('/api/homework/hw_001/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        submissionText: 'Completed all 12 problems with detailed steps.',
        attachmentUrl: 'https://mock.cloudinary.com/submission.png',
      })
      .expect(201);

    expect(response.body.status).toBe('SUBMITTED');
    expect(response.body.submissionText).toContain('detailed steps');
  });

  it('student asks a question in Q&A', async () => {
    mockPrisma.student.findUnique.mockResolvedValue({ id: studentId, classId: 'cls_8th_a', userId });
    mockPrisma.qna.create.mockResolvedValue({
      id: 'qna_002',
      studentId,
      question: 'What is the difference between linear and quadratic equations?',
      subjectId: 'sub_math_8',
      status: 'PENDING',
      createdAt: new Date(),
    });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif_002' });

    const response = await request(app)
      .post('/api/qna')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        question: 'What is the difference between linear and quadratic equations?',
        subjectId: 'sub_math_8',
      })
      .expect(201);

    expect(response.body.status).toBe('PENDING');
    expect(response.body.question).toContain('linear and quadratic');
  });

  it('student views their marks and result', async () => {
    mockPrisma.student.findUnique.mockResolvedValue({ id: studentId, classId: 'cls_8th_a' });

    mockPrisma.mark.findMany.mockResolvedValue([
      { subject: { name: 'Mathematics' }, examType: 'MID_TERM', obtainedMarks: 42, totalMarks: 50, grade: 'A' },
      { subject: { name: 'English' }, examType: 'MID_TERM', obtainedMarks: 38, totalMarks: 50, grade: 'B+' },
      { subject: { name: 'Science' }, examType: 'MID_TERM', obtainedMarks: 45, totalMarks: 50, grade: 'A+' },
    ]);

    mockPrisma.result.findUnique.mockResolvedValue({
      id: 'res_001',
      studentId,
      academicYear: '2024-2025',
      term: 'MID_TERM',
      totalMarks: 300,
      obtainedMarks: 255,
      percentage: 85,
      grade: 'A',
      rank: 3,
      status: 'PUBLISHED',
    });

    const marksRes = await request(app)
      .get('/api/marks/my')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(marksRes.body).toHaveLength(3);
    expect(marksRes.body[2].grade).toBe('A+');

    const resultRes = await request(app)
      .get('/api/results/my')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(resultRes.body.percentage).toBe(85);
    expect(resultRes.body.rank).toBe(3);
  });

  it('student views attendance summary', async () => {
    mockPrisma.student.findUnique.mockResolvedValue({ id: studentId });
    mockPrisma.attendance.findMany.mockResolvedValue([
      { date: '2024-03-01', status: 'PRESENT' },
      { date: '2024-03-02', status: 'PRESENT' },
      { date: '2024-03-04', status: 'ABSENT' },
      { date: '2024-03-05', status: 'PRESENT' },
      { date: '2024-03-06', status: 'PRESENT' },
      { date: '2024-03-07', status: 'LATE' },
      { date: '2024-03-08', status: 'PRESENT' },
      { date: '2024-03-09', status: 'PRESENT' },
      { date: '2024-03-11', status: 'PRESENT' },
      { date: '2024-03-12', status: 'PRESENT' },
    ]);

    const response = await request(app)
      .get('/api/attendance/my?month=2024-03')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(response.body.summary.present).toBe(8);
    expect(response.body.summary.absent).toBe(1);
    expect(response.body.summary.late).toBe(1);
    expect(response.body.summary.percentage).toBe(80);
  });
});
