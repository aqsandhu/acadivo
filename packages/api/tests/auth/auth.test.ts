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
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  otp: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordResetToken: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

// Import app after mocks
const { app } = await import('../../src/app');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@test-school.edu.pk',
        name: 'Ali Hassan',
        role: 'TEACHER',
        isActive: true,
        schoolId: 'sch_001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'ali.hassan@test-school.edu.pk',
          password: 'SecurePass123!',
          name: 'Ali Hassan',
          role: 'TEACHER',
          schoolId: 'sch_001',
          phone: '+92-300-1234567',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('ali.hassan@test-school.edu.pk');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should reject registration with duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'usr_existing',
        email: 'ali.hassan@test-school.edu.pk',
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'ali.hassan@test-school.edu.pk',
          password: 'SecurePass123!',
          name: 'Ali Hassan',
          role: 'TEACHER',
          schoolId: 'sch_001',
        })
        .expect(409);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/already exists|duplicate/i);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject registration with invalid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: '123', // too short
          name: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject weak password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'new.teacher@school.edu.pk',
          password: 'password',
          name: 'New Teacher',
          role: 'TEACHER',
          schoolId: 'sch_001',
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('SecurePass123!', 10);

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@test-school.edu.pk',
        password: hashedPassword,
        name: 'Ali Hassan',
        role: 'TEACHER',
        isActive: true,
        schoolId: 'sch_001',
      });

      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt_001',
        token: 'mock-jti',
        userId: 'usr_123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'ali.hassan@test-school.edu.pk',
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('ali.hassan@test-school.edu.pk');
    });

    it('should reject login with wrong password', async () => {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('DifferentPass123!', 10);

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@test-school.edu.pk',
        password: hashedPassword,
        name: 'Ali Hassan',
        role: 'TEACHER',
        isActive: true,
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'ali.hassan@test-school.edu.pk',
          password: 'WrongPass123!',
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid|incorrect|unauthorized/i);
    });

    it('should reject login for inactive user', async () => {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('SecurePass123!', 10);

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'usr_inactive',
        email: 'inactive@school.edu.pk',
        password: hashedPassword,
        name: 'Inactive User',
        role: 'TEACHER',
        isActive: false,
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'inactive@school.edu.pk',
          password: 'SecurePass123!',
        })
        .expect(403);

      expect(response.body.message).toMatch(/inactive|disabled|not allowed/i);
    });

    it('should reject login for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@school.edu.pk',
          password: 'SecurePass123!',
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid|not found/i);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt_001',
        token: 'valid-jti-123',
        userId: 'usr_123',
        revoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: {
          id: 'usr_123',
          email: 'ali.hassan@test-school.edu.pk',
          role: 'TEACHER',
          isActive: true,
        },
      });

      mockPrisma.refreshToken.update.mockResolvedValue({
        id: 'rt_001',
        revoked: true,
      });

      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'rt_002',
        token: 'new-jti-456',
        userId: 'usr_123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const jwt = await import('jsonwebtoken');
      const refreshToken = jwt.sign(
        { id: 'usr_123', jti: 'valid-jti-123', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'not.a.valid.token' })
        .expect(401);

      expect(response.body.message).toMatch(/invalid|unauthorized/i);
    });

    it('should reject expired refresh token', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt_001',
        token: 'expired-jti',
        userId: 'usr_123',
        revoked: false,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // expired
      });

      const jwt = await import('jsonwebtoken');
      const refreshToken = jwt.sign(
        { id: 'usr_123', jti: 'expired-jti', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toMatch(/expired|invalid/i);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt_001',
        token: 'valid-jti',
        userId: 'usr_123',
        revoked: false,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({ id: 'rt_001', revoked: true });

      const jwt = await import('jsonwebtoken');
      const accessToken = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', type: 'access' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toMatch(/success|logged out/i);
    });

    it('should handle already logged out user gracefully', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

      const jwt = await import('jsonwebtoken');
      const accessToken = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', type: 'access' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toMatch(/success/i);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send reset email for existing user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@test-school.edu.pk',
        name: 'Ali Hassan',
      });
      mockPrisma.passwordResetToken.create.mockResolvedValue({
        id: 'prt_001',
        token: 'reset-token-123',
        userId: 'usr_123',
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'ali.hassan@test-school.edu.pk' })
        .expect(200);

      expect(response.body.message).toMatch(/sent|check your email/i);
    });

    it('should return success even if user not found (security)', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@school.edu.pk' })
        .expect(200);

      expect(response.body.message).toMatch(/sent|check your email/i);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt_001',
        token: 'valid-reset-token',
        userId: 'usr_123',
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        used: false,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@test-school.edu.pk',
      });
      mockPrisma.passwordResetToken.update.mockResolvedValue({
        id: 'prt_001',
        used: true,
      });

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'valid-reset-token',
          password: 'NewSecurePass123!',
          confirmPassword: 'NewSecurePass123!',
        })
        .expect(200);

      expect(response.body.message).toMatch(/success|updated/i);
    });

    it('should reject invalid reset token', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewSecurePass123!',
          confirmPassword: 'NewSecurePass123!',
        })
        .expect(400);

      expect(response.body.message).toMatch(/invalid|expired|not found/i);
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should verify correct OTP', async () => {
      mockPrisma.otp.findFirst.mockResolvedValue({
        id: 'otp_001',
        code: '123456',
        userId: 'usr_123',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      });
      mockPrisma.otp.update.mockResolvedValue({
        id: 'otp_001',
        verified: true,
      });

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          userId: 'usr_123',
          code: '123456',
        })
        .expect(200);

      expect(response.body.message).toMatch(/verified|success/i);
    });

    it('should reject wrong OTP', async () => {
      mockPrisma.otp.findFirst.mockResolvedValue({
        id: 'otp_001',
        code: '123456',
        userId: 'usr_123',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      });

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          userId: 'usr_123',
          code: '999999',
        })
        .expect(400);

      expect(response.body.message).toMatch(/invalid|wrong|incorrect/i);
    });
  });

  describe('POST /auth/setup-parent-password', () => {
    it('should complete full setup-parent-password flow', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_parent_001',
        email: 'parent.ahmed@example.com',
        name: 'Ahmed Khan',
        role: 'PARENT',
        password: null, // parent has no password yet
        isActive: true,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'usr_parent_001',
        email: 'parent.ahmed@example.com',
        name: 'Ahmed Khan',
        role: 'PARENT',
        isActive: true,
      });
      mockPrisma.otp.findFirst.mockResolvedValue({
        id: 'otp_002',
        code: '654321',
        userId: 'usr_parent_001',
        verified: true,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const response = await request(app)
        .post('/auth/setup-parent-password')
        .send({
          userId: 'usr_parent_001',
          otp: '654321',
          password: 'ParentPass123!',
          confirmPassword: 'ParentPass123!',
        })
        .expect(200);

      expect(response.body.message).toMatch(/success|set up|created/i);
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should reject setup with wrong OTP', async () => {
      mockPrisma.otp.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/setup-parent-password')
        .send({
          userId: 'usr_parent_001',
          otp: '000000',
          password: 'ParentPass123!',
          confirmPassword: 'ParentPass123!',
        })
        .expect(400);

      expect(response.body.message).toMatch(/invalid|wrong|otp/i);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user profile with valid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@test-school.edu.pk',
        name: 'Ali Hassan',
        role: 'TEACHER',
        schoolId: 'sch_001',
        phone: '+92-300-1234567',
        avatar: null,
        isActive: true,
        createdAt: new Date(),
      });

      const jwt = await import('jsonwebtoken');
      const accessToken = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', schoolId: 'sch_001', type: 'access' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 'usr_123');
      expect(response.body).toHaveProperty('email', 'ali.hassan@test-school.edu.pk');
      expect(response.body).toHaveProperty('role', 'TEACHER');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/auth/me').expect(401);
      expect(response.body.message).toMatch(/unauthorized|token|missing/i);
    });
  });

  describe('PUT /auth/me', () => {
    it('should update current user profile', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@test-school.edu.pk',
        name: 'Ali Hassan Updated',
        role: 'TEACHER',
        phone: '+92-300-9999999',
        updatedAt: new Date(),
      });

      const jwt = await import('jsonwebtoken');
      const accessToken = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', schoolId: 'sch_001', type: 'access' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .put('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Ali Hassan Updated',
          phone: '+92-300-9999999',
        })
        .expect(200);

      expect(response.body.name).toBe('Ali Hassan Updated');
      expect(response.body.phone).toBe('+92-300-9999999');
    });

    it('should reject update with invalid data', async () => {
      const jwt = await import('jsonwebtoken');
      const accessToken = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', schoolId: 'sch_001', type: 'access' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .put('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '', // empty name
          phone: 'invalid-phone',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
