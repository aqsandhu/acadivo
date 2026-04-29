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

jest.mock('../../src/services/cloudinary.service', () => ({
  uploadFile: jest.fn().mockResolvedValue({ url: 'https://mock.cloudinary.com/test.png', publicId: 'test-id' }),
  deleteFile: jest.fn().mockResolvedValue(true),
}));

const mockPrisma = {
  user: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  school: { findUnique: jest.fn(), create: jest.fn() },
  teacher: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  student: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  class: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  classSection: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  subject: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  classSubject: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  attendance: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), createMany: jest.fn() },
  homework: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  homeworkSubmission: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  mark: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  result: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  feeStructure: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  feeRecord: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  feePayment: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  message: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  notification: { create: jest.fn(), createMany: jest.fn(), findMany: jest.fn() },
  auditLog: { create: jest.fn() },
  refreshToken: { create: jest.fn() },
  $transaction: jest.fn((args) => Promise.all(args)),
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

const { app } = await import('../../src/app');

describe('Integration: School Admin Flow', () => {
  const schoolId = 'sch_govt_pilot_lhr';
  let adminToken: string;
  let teacherId: string;
  let studentId: string;
  let classId: string;
  let subjectId: string;
  let homeworkId: string;
  let markId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: 'usr_admin_001', role: 'PRINCIPAL', schoolId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
  });

  it('full flow: create teacher → create student → create class → assign teacher → mark attendance → create homework → submit homework → grade → enter marks → compile result', async () => {
    // 1. Create Teacher
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 'usr_teacher_001',
      email: 'fatima.zahra@govtpilot.edu.pk',
      name: 'Fatima Zahra',
      role: 'TEACHER',
      schoolId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.teacher.create.mockResolvedValue({
      id: 'tch_001',
      userId: 'usr_teacher_001',
      employeeId: 'EMP-2024-001',
      qualification: 'MSc Mathematics',
      specialization: 'Mathematics',
      joinDate: new Date(),
    });

    const teacherRes = await request(app)
      .post('/api/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'fatima.zahra@govtpilot.edu.pk',
        password: 'TeacherPass123!',
        name: 'Fatima Zahra',
        employeeId: 'EMP-2024-001',
        qualification: 'MSc Mathematics',
        specialization: 'Mathematics',
        phone: '+92-300-1112223',
      })
      .expect(201);

    teacherId = teacherRes.body.id;
    expect(teacherRes.body.role).toBe('TEACHER');
    expect(teacherRes.body.email).toBe('fatima.zahra@govtpilot.edu.pk');

    // 2. Create Student
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 'usr_student_001',
      email: 'ahmad.raza.student@example.com',
      name: 'Ahmad Raza',
      role: 'STUDENT',
      schoolId,
      isActive: true,
      createdAt: new Date(),
    });
    mockPrisma.student.create.mockResolvedValue({
      id: 'std_001',
      userId: 'usr_student_001',
      rollNumber: 'R-2024-008-A',
      admissionDate: new Date(),
      dateOfBirth: new Date('2010-05-15'),
      gender: 'MALE',
      address: '45 Model Town, Lahore',
    });
    mockPrisma.parent.create = jest.fn().mockResolvedValue({ id: 'prt_001', userId: 'usr_parent_001' });

    const studentRes = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'ahmad.raza.student@example.com',
        password: 'StudentPass123!',
        name: 'Ahmad Raza',
        rollNumber: 'R-2024-008-A',
        dateOfBirth: '2010-05-15',
        gender: 'MALE',
        address: '45 Model Town, Lahore',
        parentName: 'Raza Ahmed',
        parentPhone: '+92-300-4445556',
        parentEmail: 'raza.ahmed@example.com',
      })
      .expect(201);

    studentId = studentRes.body.id;
    expect(studentRes.body.rollNumber).toBe('R-2024-008-A');

    // 3. Create Class
    mockPrisma.class.create.mockResolvedValue({
      id: 'cls_8th_a',
      name: '8th Grade',
      section: 'A',
      schoolId,
      roomNumber: 'Room 105',
      createdAt: new Date(),
    });
    mockPrisma.classSection.create.mockResolvedValue({
      id: 'sec_8th_a',
      classId: 'cls_8th_a',
      name: 'A',
      roomNumber: 'Room 105',
      capacity: 35,
    });

    const classRes = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '8th Grade',
        section: 'A',
        roomNumber: 'Room 105',
        capacity: 35,
      })
      .expect(201);

    classId = classRes.body.id;
    expect(classRes.body.name).toBe('8th Grade');

    // 4. Create Subject
    mockPrisma.subject.create.mockResolvedValue({
      id: 'sub_math_8',
      name: 'Mathematics',
      code: 'MATH-08',
      schoolId,
    });

    const subjectRes = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mathematics',
        code: 'MATH-08',
      })
      .expect(201);

    subjectId = subjectRes.body.id;
    expect(subjectRes.body.code).toBe('MATH-08');

    // 5. Assign Teacher to Class + Subject
    mockPrisma.classSubject.create.mockResolvedValue({
      id: 'cs_001',
      classId,
      subjectId,
      teacherId: 'tch_001',
      academicYear: '2024-2025',
    });

    const assignRes = await request(app)
      .post('/api/class-subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        classId,
        subjectId,
        teacherId: 'tch_001',
        academicYear: '2024-2025',
      })
      .expect(201);

    expect(assignRes.body.teacherId).toBe('tch_001');

    // 6. Mark Attendance
    mockPrisma.attendance.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.attendance.findMany.mockResolvedValue([
      { id: 'att_001', studentId: 'std_001', classId, date: new Date(), status: 'PRESENT' },
    ]);

    const attendanceRes = await request(app)
      .post('/api/attendance/bulk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        classId,
        date: new Date().toISOString().split('T')[0],
        records: [
          { studentId: 'std_001', status: 'PRESENT' },
        ],
      })
      .expect(201);

    expect(attendanceRes.body.count).toBe(1);

    // 7. Create Homework
    mockPrisma.homework.create.mockResolvedValue({
      id: 'hw_001',
      title: 'Quadratic Equations - Exercise 5.2',
      description: 'Solve all problems from Exercise 5.2 in Mathematics textbook.',
      subjectId,
      classId,
      teacherId: 'tch_001',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxMarks: 20,
      schoolId,
      createdAt: new Date(),
    });

    const homeworkRes = await request(app)
      .post('/api/homework')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Quadratic Equations - Exercise 5.2',
        description: 'Solve all problems from Exercise 5.2 in Mathematics textbook.',
        subjectId,
        classId,
        teacherId: 'tch_001',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: 20,
      })
      .expect(201);

    homeworkId = homeworkRes.body.id;
    expect(homeworkRes.body.title).toContain('Quadratic Equations');

    // 8. Submit Homework
    mockPrisma.homeworkSubmission.create.mockResolvedValue({
      id: 'sub_001',
      homeworkId,
      studentId: 'std_001',
      submissionText: 'Completed all 12 problems.',
      attachmentUrl: 'https://mock.cloudinary.com/homework.png',
      submittedAt: new Date(),
      status: 'SUBMITTED',
    });

    const submitRes = await request(app)
      .post(`/api/homework/${homeworkId}/submit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: 'std_001',
        submissionText: 'Completed all 12 problems.',
        attachmentUrl: 'https://mock.cloudinary.com/homework.png',
      })
      .expect(201);

    expect(submitRes.body.status).toBe('SUBMITTED');

    // 9. Grade Homework
    mockPrisma.homeworkSubmission.update.mockResolvedValue({
      id: 'sub_001',
      homeworkId,
      studentId: 'std_001',
      marks: 18,
      feedback: 'Excellent work! Minor calculation error in Q7.',
      status: 'GRADED',
      gradedAt: new Date(),
    });

    const gradeRes = await request(app)
      .put(`/api/homework-submissions/sub_001/grade`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        marks: 18,
        feedback: 'Excellent work! Minor calculation error in Q7.',
      })
      .expect(200);

    expect(gradeRes.body.marks).toBe(18);
    expect(gradeRes.body.status).toBe('GRADED');

    // 10. Enter Exam Marks
    mockPrisma.mark.create.mockResolvedValue({
      id: 'mark_001',
      studentId: 'std_001',
      subjectId,
      classId,
      examType: 'MID_TERM',
      totalMarks: 50,
      obtainedMarks: 42,
      percentage: 84,
      grade: 'A',
      academicYear: '2024-2025',
      recordedBy: 'tch_001',
    });

    const markRes = await request(app)
      .post('/api/marks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: 'std_001',
        subjectId,
        classId,
        examType: 'MID_TERM',
        totalMarks: 50,
        obtainedMarks: 42,
        academicYear: '2024-2025',
      })
      .expect(201);

    markId = markRes.body.id;
    expect(markRes.body.obtainedMarks).toBe(42);
    expect(markRes.body.grade).toBe('A');

    // 11. Compile Result
    mockPrisma.result.create.mockResolvedValue({
      id: 'res_001',
      studentId: 'std_001',
      classId,
      academicYear: '2024-2025',
      term: 'MID_TERM',
      totalMarks: 300,
      obtainedMarks: 255,
      percentage: 85,
      grade: 'A',
      rank: 3,
      status: 'PUBLISHED',
      compiledAt: new Date(),
    });
    mockPrisma.mark.findMany.mockResolvedValue([
      { id: 'mark_001', subjectId, obtainedMarks: 42, totalMarks: 50 },
      { id: 'mark_002', subjectId: 'sub_eng_8', obtainedMarks: 38, totalMarks: 50 },
      { id: 'mark_003', subjectId: 'sub_sci_8', obtainedMarks: 45, totalMarks: 50 },
      { id: 'mark_004', subjectId: 'sub_urdu_8', obtainedMarks: 40, totalMarks: 50 },
      { id: 'mark_005', subjectId: 'sub_ss_8', obtainedMarks: 44, totalMarks: 50 },
      { id: 'mark_006', subjectId: 'sub_isl_8', obtainedMarks: 46, totalMarks: 50 },
    ]);

    const resultRes = await request(app)
      .post('/api/results/compile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: 'std_001',
        classId,
        academicYear: '2024-2025',
        term: 'MID_TERM',
      })
      .expect(201);

    expect(resultRes.body.status).toBe('PUBLISHED');
    expect(resultRes.body.percentage).toBe(85);
    expect(resultRes.body.grade).toBe('A');
  });
});
