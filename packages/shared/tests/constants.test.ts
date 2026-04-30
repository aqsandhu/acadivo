import { describe, it, expect } from 'vitest';
import { APP_NAME, APP_VERSION, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, HTTP_STATUS, CACHE_TTL } from '../src/constants';

describe('Constant Values Tests', () => {
  describe('Application Constants', () => {
    it('has correct app name', () => {
      expect(APP_NAME).toBe('Acadivo');
    });

    it('has correct app version format', () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Pagination', () => {
    it('has correct default limit', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(20);
    });

    it('has correct max limit', () => {
      expect(MAX_PAGE_SIZE).toBe(100);
    });

    it('max limit is greater than default', () => {
      expect(MAX_PAGE_SIZE).toBeGreaterThan(DEFAULT_PAGE_SIZE);
    });
  });

  describe('HTTP Status Codes', () => {
    it('has OK status', () => {
      expect(HTTP_STATUS.OK).toBe(200);
    });

    it('has CREATED status', () => {
      expect(HTTP_STATUS.CREATED).toBe(201);
    });

    it('has BAD_REQUEST status', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    });

    it('has UNAUTHORIZED status', () => {
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    });

    it('has FORBIDDEN status', () => {
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    });

    it('has NOT_FOUND status', () => {
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    });

    it('has CONFLICT status', () => {
      expect(HTTP_STATUS.CONFLICT).toBe(409);
    });

    it('has UNPROCESSABLE status', () => {
      expect(HTTP_STATUS.UNPROCESSABLE).toBe(422);
    });

    it('has INTERNAL_ERROR status', () => {
      expect(HTTP_STATUS.INTERNAL_ERROR).toBe(500);
    });
  });

  describe('Cache TTL', () => {
    it('has short TTL of 60 seconds', () => {
      expect(CACHE_TTL.SHORT).toBe(60);
    });

    it('has medium TTL of 300 seconds', () => {
      expect(CACHE_TTL.MEDIUM).toBe(300);
    });

    it('has long TTL of 3600 seconds', () => {
      expect(CACHE_TTL.LONG).toBe(3600);
    });

    it('has day TTL of 86400 seconds', () => {
      expect(CACHE_TTL.DAY).toBe(86400);
    });

    it('TTL values increase in ascending order', () => {
      expect(CACHE_TTL.SHORT).toBeLessThan(CACHE_TTL.MEDIUM);
      expect(CACHE_TTL.MEDIUM).toBeLessThan(CACHE_TTL.LONG);
      expect(CACHE_TTL.LONG).toBeLessThan(CACHE_TTL.DAY);
    });
  });
});
