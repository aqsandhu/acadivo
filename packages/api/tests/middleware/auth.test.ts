import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../src/prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = await import('../../src/prisma/client');
const { authenticate } = await import('../../src/middleware/auth.middleware');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('JWT Verification', () => {
    it('should authenticate valid access token', async () => {
      const jwt = await import('jsonwebtoken');
      const token = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', schoolId: 'sch_001', type: 'access' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '15m' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_123',
        email: 'ali.hassan@school.edu.pk',
        role: 'TEACHER',
        isActive: true,
        schoolId: 'sch_001',
      });

      req.headers = { authorization: `Bearer ${token}` };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('usr_123');
      expect(req.user.role).toBe('TEACHER');
    });

    it('should reject request without authorization header', async () => {
      req.headers = {};

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject request with malformed authorization header', async () => {
      req.headers = { authorization: 'Basic dXNlcjpwYXNz' };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject expired token', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', schoolId: 'sch_001', type: 'access', exp: Math.floor(Date.now() / 1000) - 60 },
        process.env.JWT_SECRET || 'test-jwt-secret'
      );

      req.headers = { authorization: `Bearer ${expiredToken}` };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject token with wrong secret', async () => {
      const jwt = await import('jsonwebtoken');
      const badToken = jwt.sign(
        { id: 'usr_123', role: 'TEACHER', schoolId: 'sch_001', type: 'access' },
        'wrong-secret',
        { expiresIn: '15m' }
      );

      req.headers = { authorization: `Bearer ${badToken}` };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject malformed JWT string', async () => {
      req.headers = { authorization: 'Bearer not.a.jwt' };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject token for inactive user', async () => {
      const jwt = await import('jsonwebtoken');
      const token = jwt.sign(
        { id: 'usr_inactive', role: 'TEACHER', schoolId: 'sch_001', type: 'access' },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '15m' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_inactive',
        email: 'inactive@school.edu.pk',
        role: 'TEACHER',
        isActive: false,
        schoolId: 'sch_001',
      });

      req.headers = { authorization: `Bearer ${token}` };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should reject refresh token used as access token', async () => {
      const jwt = await import('jsonwebtoken');
      const refreshToken = jwt.sign(
        { id: 'usr_123', jti: 'jti_001', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
        { expiresIn: '7d' }
      );

      req.headers = { authorization: `Bearer ${refreshToken}` };

      await authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
