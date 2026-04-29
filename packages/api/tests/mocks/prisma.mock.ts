import { jest } from '@jest/globals';

/**
 * Mock PrismaClient for unit tests
 * Provides mock implementations for all Prisma models and operations
 */
export const mockPrismaClient = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn((args) => Promise.all(args)),
  $queryRaw: jest.fn().mockResolvedValue([]),
  $executeRaw: jest.fn().mockResolvedValue(0),

  // Models
  user: createMockModel(),
  school: createMockModel(),
  student: createMockModel(),
  teacher: createMockModel(),
  parent: createMockModel(),
  class: createMockModel(),
  classSection: createMockModel(),
  subject: createMockModel(),
  classSubject: createMockModel(),
  attendance: createMockModel(),
  homework: createMockModel(),
  homeworkSubmission: createMockModel(),
  mark: createMockModel(),
  result: createMockModel(),
  feeStructure: createMockModel(),
  feeRecord: createMockModel(),
  feePayment: createMockModel(),
  message: createMockModel(),
  notification: createMockModel(),
  auditLog: createMockModel(),
};

function createMockModel() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findFirstOrThrow: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn().mockImplementation((args) =>
      Promise.resolve({ id: 'mock-id', ...args?.data, createdAt: new Date(), updatedAt: new Date() })
    ),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((args) =>
      Promise.resolve({ id: args.where?.id, ...args?.data, updatedAt: new Date() })
    ),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn(),
    delete: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _count: 0 }),
    groupBy: jest.fn().mockResolvedValue([]),
  };
}

// Helper to reset all mocks
export function resetPrismaMocks() {
  const allMethods = [
    '$connect', '$disconnect', '$transaction', '$queryRaw', '$executeRaw',
    'user', 'school', 'student', 'teacher', 'parent', 'class',
    'classSection', 'subject', 'classSubject', 'attendance',
    'homework', 'homeworkSubmission', 'mark', 'result',
    'feeStructure', 'feeRecord', 'feePayment',
    'message', 'notification', 'auditLog',
  ];

  for (const model of allMethods) {
    const mockModel = (mockPrismaClient as any)[model];
    if (mockModel && typeof mockModel === 'object') {
      Object.values(mockModel).forEach((fn: any) => {
        if (typeof fn === 'function' && 'mockReset' in fn) {
          fn.mockReset();
        }
      });
    } else if (mockModel && typeof mockModel === 'function' && 'mockReset' in mockModel) {
      mockModel.mockReset();
    }
  }
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));
