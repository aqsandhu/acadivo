import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

describe('Rate Limiter Middleware', () => {
  // Simple in-memory rate limiter mock for testing
  const mockStore = new Map<string, { count: number; resetTime: number }>();

  function createRateLimiter(maxRequests: number, windowMs: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const now = Date.now();
      const record = mockStore.get(key as string);

      if (!record || now > record.resetTime) {
        mockStore.set(key as string, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (record.count >= maxRequests) {
        return res.status(429).json({
          message: 'Too many requests',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
      }

      record.count += 1;
      return next();
    };
  }

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockStore.clear();
    req = {
      ip: '192.168.1.1',
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('Request Counting', () => {
    it('should allow requests under the limit', () => {
      const limiter = createRateLimiter(5, 60000);

      for (let i = 0; i < 4; i++) {
        limiter(req as Request, res as Response, next);
      }

      expect(next).toHaveBeenCalledTimes(4);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should track requests per IP separately', () => {
      const limiter = createRateLimiter(2, 60000);

      limiter(req as Request, res as Response, next);

      const req2 = { ...req, ip: '192.168.1.2' };
      limiter(req2 as Request, res as Response, next);
      limiter(req2 as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(3);
    });

    it('should increment request count correctly', () => {
      const limiter = createRateLimiter(3, 60000);

      limiter(req as Request, res as Response, next);
      limiter(req as Request, res as Response, next);

      const record = mockStore.get('192.168.1.1');
      expect(record?.count).toBe(2);
    });
  });

  describe('Block After Limit', () => {
    it('should block requests after limit is reached', () => {
      const limiter = createRateLimiter(3, 60000);

      for (let i = 0; i < 3; i++) {
        limiter(req as Request, res as Response, next);
      }

      // Reset mock to check the 4th call
      (res.status as jest.Mock).mockClear();
      (res.json as jest.Mock).mockClear();

      limiter(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Too many requests',
        })
      );
    });

    it('should include retry-after header', () => {
      const limiter = createRateLimiter(2, 60000);

      limiter(req as Request, res as Response, next);
      limiter(req as Request, res as Response, next);

      limiter(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfter: expect.any(Number),
        })
      );
    });

    it('should reset count after window expires', () => {
      const windowMs = 100;
      const limiter = createRateLimiter(2, windowMs);

      limiter(req as Request, res as Response, next);
      limiter(req as Request, res as Response, next);
      limiter(req as Request, res as Response, next); // blocked

      expect(res.status).toHaveBeenCalledWith(429);

      // Modify the record to simulate window expiration
      const record = mockStore.get('192.168.1.1');
      if (record) {
        record.resetTime = Date.now() - 1; // expired
      }

      limiter(req as Request, res as Response, next);

      expect(mockStore.get('192.168.1.1')?.count).toBe(1);
    });
  });

  describe('Different Rate Limits', () => {
    it('should apply stricter limits for auth endpoints', () => {
      const authLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 per 15 min

      for (let i = 0; i < 5; i++) {
        authLimiter(req as Request, res as Response, next);
      }

      expect(next).toHaveBeenCalledTimes(5);

      authLimiter(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('should apply standard limits for API endpoints', () => {
      const apiLimiter = createRateLimiter(100, 60 * 1000); // 100 per min

      for (let i = 0; i < 100; i++) {
        apiLimiter(req as Request, res as Response, next);
      }

      expect(next).toHaveBeenCalledTimes(100);

      apiLimiter(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(429);
    });
  });
});
