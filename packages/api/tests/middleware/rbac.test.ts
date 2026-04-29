import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

const { requireRole } = await import('../../src/middleware/rbac.middleware');

describe('RBAC Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      user: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('Allowed Roles', () => {
    it('should allow access for allowed role', () => {
      req.user = { id: 'usr_123', role: 'PRINCIPAL', schoolId: 'sch_001' };
      const middleware = requireRole(['PRINCIPAL', 'ADMIN']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access for one of multiple allowed roles', () => {
      req.user = { id: 'usr_123', role: 'TEACHER', schoolId: 'sch_001' };
      const middleware = requireRole(['TEACHER', 'PRINCIPAL']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should allow ADMIN for any role requirement', () => {
      req.user = { id: 'usr_123', role: 'ADMIN', schoolId: 'sch_001' };
      const middleware = requireRole(['PRINCIPAL']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Forbidden Roles', () => {
    it('should deny access for forbidden role', () => {
      req.user = { id: 'usr_123', role: 'STUDENT', schoolId: 'sch_001' };
      const middleware = requireRole(['PRINCIPAL', 'TEACHER']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should deny access for wrong role even if authenticated', () => {
      req.user = { id: 'usr_123', role: 'PARENT', schoolId: 'sch_001' };
      const middleware = requireRole(['TEACHER']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Missing User', () => {
    it('should deny access when user is missing from request', () => {
      req.user = undefined;
      const middleware = requireRole(['TEACHER']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should deny access when user role is missing', () => {
      req.user = { id: 'usr_123', role: undefined as any, schoolId: 'sch_001' };
      const middleware = requireRole(['TEACHER']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Edge Cases', () => {
    it('should allow if allowedRoles is empty (public route pattern)', () => {
      req.user = { id: 'usr_123', role: 'STUDENT', schoolId: 'sch_001' };
      const middleware = requireRole([]);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should handle case sensitivity correctly', () => {
      req.user = { id: 'usr_123', role: 'teacher', schoolId: 'sch_001' };
      const middleware = requireRole(['TEACHER']);

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
