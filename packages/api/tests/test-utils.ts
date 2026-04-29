import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/acadivo_test',
    },
  },
});

/**
 * Generate a mock JWT access token for a user
 */
export function generateAccessToken(userId: string, role: string, schoolId?: string): string {
  return jwt.sign(
    { id: userId, role, schoolId, type: 'access' },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '15m' }
  );
}

/**
 * Generate a mock JWT refresh token
 */
export function generateRefreshToken(userId: string, jti: string): string {
  return jwt.sign(
    { id: userId, jti, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
    { expiresIn: '7d' }
  );
}

/**
 * Hash a password for test users
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Create a test user in the database
 */
export async function createTestUser(data: {
  email: string;
  password?: string;
  role: string;
  name?: string;
  schoolId?: string;
  isActive?: boolean;
}) {
  const password = data.password || 'TestPassword123!';
  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
      name: data.name || 'Test User',
      schoolId: data.schoolId,
      isActive: data.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Create a test school/tenant
 */
export async function createTestSchool(data?: { name?: string; subdomain?: string }) {
  return prisma.school.create({
    data: {
      name: data?.name || 'Govt. Pilot Secondary School Lahore',
      subdomain: data?.subdomain || `test-school-${Date.now()}`,
      address: '123 Education Road, Lahore',
      city: 'Lahore',
      province: 'Punjab',
      phone: '+92-42-1234567',
      email: 'principal@test-school.edu.pk',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Clean up database after tests
 */
export async function cleanupDatabase() {
  const tables = [
    'Result',
    'Mark',
    'HomeworkSubmission',
    'Homework',
    'Attendance',
    'FeePayment',
    'FeeRecord',
    'FeeStructure',
    'Message',
    'Notification',
    'AuditLog',
    'ClassSubject',
    'ClassSection',
    'Subject',
    'Class',
    'Student',
    'Teacher',
    'Parent',
    'User',
    'School',
  ];

  for (const table of tables) {
    // @ts-ignore
    await prisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany().catch(() => {});
  }
}

/**
 * Get test app instance
 */
export function getTestApp() {
  // Lazy require to avoid loading before env is set
  const { app } = require('../src/app');
  return app;
}

/**
 * Mock external services
 */
export function mockExternalServices() {
  jest.mock('../src/services/sms.service', () => ({
    sendSMS: jest.fn().mockResolvedValue({ messageId: 'mock-sms-id' }),
  }));

  jest.mock('../src/services/email.service', () => ({
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' }),
  }));

  jest.mock('../src/services/push.service', () => ({
    sendPushNotification: jest.fn().mockResolvedValue({ success: true }),
  }));

  jest.mock('../src/services/cloudinary.service', () => ({
    uploadFile: jest.fn().mockResolvedValue({ url: 'https://mock.cloudinary.com/test.png', publicId: 'test-id' }),
    deleteFile: jest.fn().mockResolvedValue(true),
  }));
}

export { prisma };
