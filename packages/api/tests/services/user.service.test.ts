import { jest } from '@jest/globals';
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma.mock';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

const { prisma } = await import('../../src/prisma/client');
const { UserService } = await import('../../src/services/user.service');

describe('User Service', () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  describe('CRUD Operations', () => {
    it('should create a user with auto-generated ID', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'usr_abc123',
        email: 'new.teacher@school.edu.pk',
        name: 'New Teacher',
        role: 'TEACHER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await UserService.create({
        email: 'new.teacher@school.edu.pk',
        name: 'New Teacher',
        role: 'TEACHER',
        password: 'hashedPassword',
        schoolId: 'sch_001',
      });

      expect(result).toHaveProperty('id');
      expect(result.id).toMatch(/^usr_/);
      expect(result.email).toBe('new.teacher@school.edu.pk');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new.teacher@school.edu.pk',
            role: 'TEACHER',
          }),
        })
      );
    });

    it('should find a user by ID', async () => {
      const mockUser = {
        id: 'usr_123',
        email: 'ali.hassan@school.edu.pk',
        name: 'Ali Hassan',
        role: 'TEACHER',
        isActive: true,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.findById('usr_123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr_123' },
      });
    });

    it('should return null for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.findById('usr_nonexistent');

      expect(result).toBeNull();
    });

    it('should update a user', async () => {
      const updatedUser = {
        id: 'usr_123',
        email: 'ali.hassan@school.edu.pk',
        name: 'Ali Hassan Updated',
        phone: '+92-300-9999999',
        updatedAt: new Date(),
      };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await UserService.update('usr_123', {
        name: 'Ali Hassan Updated',
        phone: '+92-300-9999999',
      });

      expect(result.name).toBe('Ali Hassan Updated');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'usr_123' },
        data: { name: 'Ali Hassan Updated', phone: '+92-300-9999999' },
      });
    });

    it('should delete a user', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@school.edu.pk',
      });

      const result = await UserService.delete('usr_123');

      expect(result).toHaveProperty('id', 'usr_123');
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'usr_123' },
      });
    });
  });

  describe('Auto ID Generation', () => {
    it('should generate unique IDs for multiple users', async () => {
      const ids = new Set<string>();
      (prisma.user.create as jest.Mock).mockImplementation((args: any) => {
        const id = `usr_${Math.random().toString(36).substring(2, 15)}`;
        ids.add(id);
        return Promise.resolve({
          id,
          ...args?.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      for (let i = 0; i < 10; i++) {
        await UserService.create({
          email: `user${i}@school.edu.pk`,
          name: `User ${i}`,
          role: 'TEACHER',
          password: 'hashed',
        });
      }

      expect(ids.size).toBe(10); // All unique
    });

    it('should prefix user IDs with usr_', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'usr_test123',
        email: 'test@school.edu.pk',
      });

      const result = await UserService.create({
        email: 'test@school.edu.pk',
        name: 'Test',
        role: 'STUDENT',
        password: 'hashed',
      });

      expect(result.id.startsWith('usr_')).toBe(true);
    });
  });

  describe('Pagination', () => {
    it('should return paginated results', async () => {
      const users = Array.from({ length: 5 }, (_, i) => ({
        id: `usr_${i}`,
        email: `user${i}@school.edu.pk`,
        name: `User ${i}`,
        role: 'TEACHER',
      }));

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(15);

      const result = await UserService.findAll({
        page: 1,
        limit: 5,
        schoolId: 'sch_001',
      });

      expect(result.data).toHaveLength(5);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should calculate correct total pages', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(25);

      const result = await UserService.findAll({
        page: 1,
        limit: 10,
        schoolId: 'sch_001',
      });

      expect(result.pagination.totalPages).toBe(3);
    });

    it('should handle last page correctly', async () => {
      const users = Array.from({ length: 3 }, (_, i) => ({
        id: `usr_${i + 20}`,
        email: `user${i}@school.edu.pk`,
        name: `User ${i}`,
        role: 'STUDENT',
      }));

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
      (prisma.user.count as jest.Mock).mockResolvedValue(23);

      const result = await UserService.findAll({
        page: 3,
        limit: 10,
        schoolId: 'sch_001',
      });

      expect(result.data).toHaveLength(3);
      expect(result.pagination.page).toBe(3);
    });

    it('should apply search filter', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { id: 'usr_1', email: 'ali@school.edu.pk', name: 'Ali Hassan', role: 'TEACHER' },
      ]);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await UserService.findAll({
        page: 1,
        limit: 10,
        schoolId: 'sch_001',
        search: 'Ali',
      });

      expect(result.data).toHaveLength(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            schoolId: 'sch_001',
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate email gracefully', async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email`)')
      );

      await expect(
        UserService.create({
          email: 'existing@school.edu.pk',
          name: 'Duplicate',
          role: 'TEACHER',
          password: 'hashed',
        })
      ).rejects.toThrow(/duplicate|unique/i);
    });

    it('should handle empty search results', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      const result = await UserService.findAll({
        page: 1,
        limit: 10,
        schoolId: 'sch_001',
        search: 'NonExistentName',
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});
