import { jest } from '@jest/globals';
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma.mock';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

const { prisma } = await import('../../src/prisma/client');
const { AuditService } = await import('../../src/services/audit.service');

describe('Audit Service', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe('Log Creation', () => {
    it('should create an audit log entry', async () => {
      const mockLog = {
        id: 'audit_001',
        userId: 'usr_123',
        action: 'CREATE_STUDENT',
        entity: 'Student',
        entityId: 'std_001',
        oldValue: null,
        newValue: { name: 'Ahmad Raza', grade: '8th' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
      };
      (prisma.auditLog.create as jest.Mock).mockResolvedValue(mockLog);

      const result = await AuditService.log({
        userId: 'usr_123',
        action: 'CREATE_STUDENT',
        entity: 'Student',
        entityId: 'std_001',
        newValue: { name: 'Ahmad Raza', grade: '8th' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      });

      expect(result).toEqual(mockLog);
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'usr_123',
          action: 'CREATE_STUDENT',
          entity: 'Student',
          entityId: 'std_001',
        }),
      });
    });

    it('should create audit log for update operation', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit_002',
        userId: 'usr_teacher_001',
        action: 'UPDATE_MARKS',
        entity: 'Mark',
        entityId: 'mark_001',
        oldValue: { obtained: 75 },
        newValue: { obtained: 85 },
        createdAt: new Date(),
      });

      const result = await AuditService.log({
        userId: 'usr_teacher_001',
        action: 'UPDATE_MARKS',
        entity: 'Mark',
        entityId: 'mark_001',
        oldValue: { obtained: 75 },
        newValue: { obtained: 85 },
      });

      expect(result.oldValue).toEqual({ obtained: 75 });
      expect(result.newValue).toEqual({ obtained: 85 });
    });

    it('should create audit log for delete operation', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit_003',
        userId: 'usr_admin_001',
        action: 'DELETE_HOMEWORK',
        entity: 'Homework',
        entityId: 'hw_001',
        oldValue: { title: 'Math Chapter 5', subjectId: 'sub_math' },
        newValue: null,
        createdAt: new Date(),
      });

      const result = await AuditService.log({
        userId: 'usr_admin_001',
        action: 'DELETE_HOMEWORK',
        entity: 'Homework',
        entityId: 'hw_001',
        oldValue: { title: 'Math Chapter 5', subjectId: 'sub_math' },
      });

      expect(result.oldValue).toBeDefined();
      expect(result.newValue).toBeNull();
    });

    it('should create audit log without user for system events', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit_004',
        userId: null,
        action: 'SYSTEM_BACKUP',
        entity: 'System',
        entityId: null,
        oldValue: null,
        newValue: { backupPath: '/backups/daily.sql' },
        createdAt: new Date(),
      });

      const result = await AuditService.log({
        action: 'SYSTEM_BACKUP',
        entity: 'System',
        newValue: { backupPath: '/backups/daily.sql' },
      });

      expect(result.userId).toBeNull();
      expect(result.action).toBe('SYSTEM_BACKUP');
    });
  });

  describe('Query Audit Logs', () => {
    it('should query logs by user', async () => {
      const logs = [
        { id: 'audit_001', userId: 'usr_123', action: 'CREATE_STUDENT', createdAt: new Date() },
        { id: 'audit_002', userId: 'usr_123', action: 'UPDATE_MARKS', createdAt: new Date() },
      ];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(logs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(2);

      const result = await AuditService.findAll({
        userId: 'usr_123',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'usr_123' },
        })
      );
    });

    it('should query logs by action type', async () => {
      const logs = [
        { id: 'audit_005', action: 'LOGIN', entity: 'User', createdAt: new Date() },
        { id: 'audit_006', action: 'LOGIN', entity: 'User', createdAt: new Date() },
      ];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(logs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(2);

      const result = await AuditService.findAll({
        action: 'LOGIN',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { action: 'LOGIN' },
        })
      );
    });

    it('should query logs by entity', async () => {
      const logs = [
        { id: 'audit_007', action: 'UPDATE', entity: 'Student', entityId: 'std_001', createdAt: new Date() },
      ];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(logs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await AuditService.findAll({
        entity: 'Student',
        entityId: 'std_001',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entity: 'Student', entityId: 'std_001' },
        })
      );
    });

    it('should query logs by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const logs = [
        { id: 'audit_008', action: 'CREATE', createdAt: new Date('2024-01-15') },
      ];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(logs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await AuditService.findAll({
        startDate,
        endDate,
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });

    it('should return paginated results', async () => {
      const logs = Array.from({ length: 5 }, (_, i) => ({
        id: `audit_${i}`,
        action: `ACTION_${i}`,
        createdAt: new Date(),
      }));
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(logs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(50);

      const result = await AuditService.findAll({
        page: 2,
        limit: 5,
      });

      expect(result.data).toHaveLength(5);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 50,
        totalPages: 10,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle large newValue/oldValue objects', async () => {
      const largeValue = Array.from({ length: 100 }, (_, i) => ({
        field: `field_${i}`,
        value: `value_${i}`,
      }));

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit_009',
        userId: 'usr_123',
        action: 'BULK_UPDATE',
        newValue: largeValue,
        createdAt: new Date(),
      });

      const result = await AuditService.log({
        userId: 'usr_123',
        action: 'BULK_UPDATE',
        newValue: largeValue,
      });

      expect(Array.isArray(result.newValue)).toBe(true);
      expect(result.newValue).toHaveLength(100);
    });

    it('should handle empty query results', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      const result = await AuditService.findAll({
        action: 'NONEXISTENT_ACTION',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});
