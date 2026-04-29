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
  message: { create: jest.fn(), findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn() },
  conversation: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
  notification: { create: jest.fn(), createMany: jest.fn(), findMany: jest.fn() },
  group: { findUnique: jest.fn(), findMany: jest.fn() },
  groupMember: { findMany: jest.fn(), create: jest.fn() },
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

const { app } = await import('../../src/app');

describe('Integration: Communication Flow', () => {
  const schoolId = 'sch_govt_pilot_lhr';
  let teacherToken: string;
  let parentToken: string;
  let studentToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    const jwt = require('jsonwebtoken');
    teacherToken = jwt.sign(
      { id: 'usr_teacher_001', role: 'TEACHER', schoolId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
    parentToken = jwt.sign(
      { id: 'usr_parent_001', role: 'PARENT', schoolId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
    studentToken = jwt.sign(
      { id: 'usr_student_001', role: 'STUDENT', schoolId, type: 'access' },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '15m' }
    );
  });

  it('private message between teacher and parent', async () => {
    // Teacher sends message
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr_teacher_001', isActive: true });
    mockPrisma.conversation.findUnique.mockResolvedValue(null);
    mockPrisma.conversation.create.mockResolvedValue({ id: 'conv_001', participantIds: ['usr_teacher_001', 'usr_parent_001'] });
    mockPrisma.message.create.mockResolvedValue({
      id: 'msg_001',
      conversationId: 'conv_001',
      senderId: 'usr_teacher_001',
      content: 'Assalam-o-Alaikum, Ahmad is doing well in Mathematics.',
      status: 'DELIVERED',
      createdAt: new Date(),
    });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif_001' });

    const teacherMsg = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        receiverId: 'usr_parent_001',
        content: 'Assalam-o-Alaikum, Ahmad is doing well in Mathematics.',
      })
      .expect(201);

    expect(teacherMsg.body.content).toContain('Assalam-o-Alaikum');
    expect(teacherMsg.body.senderId).toBe('usr_teacher_001');

    // Parent replies
    mockPrisma.conversation.findUnique.mockResolvedValue({ id: 'conv_001', participantIds: ['usr_teacher_001', 'usr_parent_001'] });
    mockPrisma.message.create.mockResolvedValue({
      id: 'msg_002',
      conversationId: 'conv_001',
      senderId: 'usr_parent_001',
      content: 'JazakAllah, thanks for the update!',
      status: 'DELIVERED',
      createdAt: new Date(),
    });

    const parentReply = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        receiverId: 'usr_teacher_001',
        content: 'JazakAllah, thanks for the update!',
      })
      .expect(201);

    expect(parentReply.body.content).toContain('JazakAllah');
  });

  it('group message in class group', async () => {
    mockPrisma.group.findUnique.mockResolvedValue({
      id: 'grp_8th_a',
      name: '8th Grade A - 2024-2025',
      type: 'CLASS',
      schoolId,
    });

    mockPrisma.groupMember.findMany.mockResolvedValue([
      { userId: 'usr_student_001' },
      { userId: 'usr_student_002' },
      { userId: 'usr_student_003' },
      { userId: 'usr_teacher_001' },
      { userId: 'usr_parent_001' },
    ]);

    mockPrisma.message.create.mockResolvedValue({
      id: 'msg_003',
      groupId: 'grp_8th_a',
      senderId: 'usr_teacher_001',
      content: 'Reminder: Science project submissions are due tomorrow!',
      status: 'DELIVERED',
      createdAt: new Date(),
    });

    mockPrisma.notification.createMany.mockResolvedValue({ count: 4 });

    const response = await request(app)
      .post('/api/groups/grp_8th_a/messages')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        content: 'Reminder: Science project submissions are due tomorrow!',
      })
      .expect(201);

    expect(response.body.content).toContain('Science project');
    expect(mockPrisma.notification.createMany).toHaveBeenCalled();
  });

  it('notification delivery for homework assignment', async () => {
    mockPrisma.homework.findUnique.mockResolvedValue({ id: 'hw_001', classId: 'cls_8th_a' });
    mockPrisma.student.findMany.mockResolvedValue([
      { id: 'std_001', userId: 'usr_student_001' },
      { id: 'std_002', userId: 'usr_student_002' },
    ]);

    mockPrisma.notification.createMany.mockResolvedValue({ count: 2 });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif_002' });

    const response = await request(app)
      .post('/api/homework/hw_001/notify')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);

    expect(response.body.sent).toBe(2);
    expect(mockPrisma.notification.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'usr_student_001' }),
          expect.objectContaining({ userId: 'usr_student_002' }),
        ]),
      })
    );
  });

  it('notification delivery for fee due reminder', async () => {
    mockPrisma.feeRecord.findMany.mockResolvedValue([
      { id: 'fr_001', student: { parent: { userId: 'usr_parent_001' } } },
      { id: 'fr_002', student: { parent: { userId: 'usr_parent_002' } } },
    ]);

    mockPrisma.notification.createMany.mockResolvedValue({ count: 2 });

    const response = await request(app)
      .post('/api/fee-reminders/send')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        feeRecordIds: ['fr_001', 'fr_002'],
        message: 'Your fee payment is due. Please pay by 5th of this month to avoid late fee charges.',
      })
      .expect(200);

    expect(response.body.sent).toBe(2);
  });

  it('mark messages as read', async () => {
    mockPrisma.message.findMany.mockResolvedValue([
      { id: 'msg_001', status: 'DELIVERED', receiverId: 'usr_parent_001' },
      { id: 'msg_002', status: 'DELIVERED', receiverId: 'usr_parent_001' },
    ]);

    mockPrisma.message.updateMany.mockResolvedValue({ count: 2 });

    const response = await request(app)
      .post('/api/messages/mark-read')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ messageIds: ['msg_001', 'msg_002'] })
      .expect(200);

    expect(response.body.markedAsRead).toBe(2);
    expect(mockPrisma.message.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['msg_001', 'msg_002'] }, receiverId: 'usr_parent_001' },
      data: { status: 'READ', readAt: expect.any(Date) },
    });
  });

  it('get conversation history', async () => {
    mockPrisma.conversation.findUnique.mockResolvedValue({
      id: 'conv_001',
      participantIds: ['usr_teacher_001', 'usr_parent_001'],
    });

    mockPrisma.message.findMany.mockResolvedValue([
      {
        id: 'msg_001',
        senderId: 'usr_teacher_001',
        content: 'Hello, this is about Ahmad.',
        status: 'READ',
        createdAt: new Date('2024-03-01T10:00:00Z'),
      },
      {
        id: 'msg_002',
        senderId: 'usr_parent_001',
        content: 'Yes, please tell me.',
        status: 'READ',
        createdAt: new Date('2024-03-01T10:05:00Z'),
      },
      {
        id: 'msg_003',
        senderId: 'usr_teacher_001',
        content: 'He got 42/50 in the last test.',
        status: 'DELIVERED',
        createdAt: new Date('2024-03-01T10:10:00Z'),
      },
    ]);

    const response = await request(app)
      .get('/api/conversations/conv_001/messages')
      .set('Authorization', `Bearer ${parentToken}`)
      .expect(200);

    expect(response.body).toHaveLength(3);
    expect(response.body[0].content).toBe('Hello, this is about Ahmad.');
    expect(response.body[2].status).toBe('DELIVERED');
  });
});
