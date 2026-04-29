import { jest } from '@jest/globals';
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma.mock';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

jest.mock('../../src/services/push.service', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({ success: true }),
}));

const { prisma } = await import('../../src/prisma/client');
const { NotificationService } = await import('../../src/services/notification.service');
const { sendPushNotification } = await import('../../src/services/push.service');

describe('Notification Service', () => {
  beforeEach(() => {
    resetPrismaMocks();
    jest.clearAllMocks();
  });

  describe('Create Notification', () => {
    it('should create a single notification', async () => {
      const mockNotification = {
        id: 'notif_001',
        userId: 'usr_123',
        title: 'Homework Assigned',
        body: 'Math homework for Grade 8 has been assigned.',
        type: 'HOMEWORK',
        isRead: false,
        data: { homeworkId: 'hw_001' },
        createdAt: new Date(),
      };
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.create({
        userId: 'usr_123',
        title: 'Homework Assigned',
        body: 'Math homework for Grade 8 has been assigned.',
        type: 'HOMEWORK',
        data: { homeworkId: 'hw_001' },
      });

      expect(result).toEqual(mockNotification);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'usr_123',
          title: 'Homework Assigned',
          type: 'HOMEWORK',
        }),
      });
    });

    it('should create notification with related entity IDs', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue({
        id: 'notif_002',
        userId: 'usr_parent_001',
        title: 'Fee Due',
        body: 'Monthly fee of PKR 5,000 is due by 5th of next month.',
        type: 'FEE',
        feeRecordId: 'fee_rec_001',
        isRead: false,
        createdAt: new Date(),
      });

      const result = await NotificationService.create({
        userId: 'usr_parent_001',
        title: 'Fee Due',
        body: 'Monthly fee of PKR 5,000 is due by 5th of next month.',
        type: 'FEE',
        feeRecordId: 'fee_rec_001',
      });

      expect(result).toHaveProperty('feeRecordId', 'fee_rec_001');
    });
  });

  describe('Bulk Create', () => {
    it('should create multiple notifications in bulk', async () => {
      (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await NotificationService.createBulk([
        {
          userId: 'usr_001',
          title: 'School Event',
          body: 'Annual sports day on 15th March.',
          type: 'ANNOUNCEMENT',
        },
        {
          userId: 'usr_002',
          title: 'School Event',
          body: 'Annual sports day on 15th March.',
          type: 'ANNOUNCEMENT',
        },
        {
          userId: 'usr_003',
          title: 'School Event',
          body: 'Annual sports day on 15th March.',
          type: 'ANNOUNCEMENT',
        },
      ]);

      expect(result.count).toBe(3);
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'usr_001' }),
          expect.objectContaining({ userId: 'usr_002' }),
          expect.objectContaining({ userId: 'usr_003' }),
        ]),
        skipDuplicates: true,
      });
    });

    it('should handle empty bulk create', async () => {
      (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await NotificationService.createBulk([]);

      expect(result.count).toBe(0);
    });

    it('should send push for bulk notifications when flag is set', async () => {
      (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { id: 'usr_001', pushToken: 'token_001' },
        { id: 'usr_002', pushToken: 'token_002' },
      ]);

      await NotificationService.createBulk(
        [
          { userId: 'usr_001', title: 'Test', body: 'Test body', type: 'GENERAL' },
          { userId: 'usr_002', title: 'Test', body: 'Test body', type: 'GENERAL' },
        ],
        { sendPush: true }
      );

      expect(sendPushNotification).toHaveBeenCalled();
    });
  });

  describe('Push Notifications', () => {
    it('should send push notification with token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_123',
        pushToken: 'expo-push-token-123',
      });

      await NotificationService.sendPush('usr_123', {
        title: 'New Homework',
        body: 'Physics homework assigned.',
        data: { homeworkId: 'hw_001' },
      });

      expect(sendPushNotification).toHaveBeenCalledWith(
        'expo-push-token-123',
        expect.objectContaining({
          title: 'New Homework',
          body: 'Physics homework assigned.',
        })
      );
    });

    it('should not send push if user has no push token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_123',
        pushToken: null,
      });

      await NotificationService.sendPush('usr_123', {
        title: 'New Homework',
        body: 'Physics homework assigned.',
      });

      expect(sendPushNotification).not.toHaveBeenCalled();
    });

    it('should mark notification as delivered after push', async () => {
      (prisma.notification.update as jest.Mock).mockResolvedValue({
        id: 'notif_001',
        isDelivered: true,
        deliveredAt: new Date(),
      });

      await NotificationService.markAsDelivered('notif_001');

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif_001' },
        data: { isDelivered: true, deliveredAt: expect.any(Date) },
      });
    });
  });

  describe('Mark as Read', () => {
    it('should mark single notification as read', async () => {
      (prisma.notification.update as jest.Mock).mockResolvedValue({
        id: 'notif_001',
        isRead: true,
        readAt: new Date(),
      });

      const result = await NotificationService.markAsRead('notif_001');

      expect(result.isRead).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif_001' },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });

    it('should mark all notifications as read for a user', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await NotificationService.markAllAsRead('usr_123');

      expect(result.count).toBe(5);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr_123', isRead: false },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });
  });

  describe('Get Notifications', () => {
    it('should get unread notifications for user', async () => {
      const notifications = [
        { id: 'notif_001', title: 'Homework', isRead: false, createdAt: new Date() },
        { id: 'notif_002', title: 'Fee Due', isRead: false, createdAt: new Date() },
      ];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

      const result = await NotificationService.getUnread('usr_123');

      expect(result).toHaveLength(2);
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'usr_123', isRead: false },
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should get notifications with pagination', async () => {
      const notifications = Array.from({ length: 10 }, (_, i) => ({
        id: `notif_${i}`,
        title: `Notification ${i}`,
        isRead: i < 5,
        createdAt: new Date(),
      }));

      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);
      (prisma.notification.count as jest.Mock).mockResolvedValue(25);

      const result = await NotificationService.findAll({
        userId: 'usr_123',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.total).toBe(25);
    });
  });
});
