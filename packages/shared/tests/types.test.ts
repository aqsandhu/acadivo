import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  uuidSchema,
  paginationSchema,
  loginSchema,
  registerSchema,
} from '../src/validation';

describe('Type Validation Tests', () => {
  describe('Email Schema', () => {
    it('validates correct email addresses', () => {
      expect(() => emailSchema.parse('teacher@school.edu.pk')).not.toThrow();
      expect(() => emailSchema.parse('student.name@example.com')).not.toThrow();
      expect(() => emailSchema.parse('admin@acadivo.edu.pk')).not.toThrow();
    });

    it('rejects invalid email formats', () => {
      expect(() => emailSchema.parse('not-an-email')).toThrow();
      expect(() => emailSchema.parse('@school.edu.pk')).toThrow();
      expect(() => emailSchema.parse('teacher@')).toThrow();
    });

    it('rejects empty email', () => {
      expect(() => emailSchema.parse('')).toThrow();
    });

    it('rejects too long email', () => {
      const longEmail = 'a'.repeat(250) + '@school.edu.pk';
      expect(() => emailSchema.parse(longEmail)).toThrow();
    });
  });

  describe('Password Schema', () => {
    it('validates strong password', () => {
      expect(() => passwordSchema.parse('SecurePass123')).not.toThrow();
      expect(() => passwordSchema.parse('MyP@ssw0rd')).not.toThrow();
    });

    it('rejects short password', () => {
      expect(() => passwordSchema.parse('Short1!')).toThrow();
    });

    it('rejects password without uppercase', () => {
      expect(() => passwordSchema.parse('securepass123!')).toThrow();
    });

    it('rejects password without lowercase', () => {
      expect(() => passwordSchema.parse('SECUREPASS123!')).toThrow();
    });

    it('rejects password without number', () => {
      expect(() => passwordSchema.parse('SecurePass!')).toThrow();
    });

    it('rejects empty password', () => {
      expect(() => passwordSchema.parse('')).toThrow();
    });
  });

  describe('UUID Schema', () => {
    it('validates correct UUID', () => {
      expect(() => uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
    });

    it('rejects invalid UUID', () => {
      expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
      expect(() => uuidSchema.parse('12345')).toThrow();
    });
  });

  describe('Pagination Schema', () => {
    it('validates default pagination', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('validates custom pagination', () => {
      const result = paginationSchema.parse({ page: 2, pageSize: 50 });
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(50);
    });

    it('rejects page less than 1', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
    });

    it('rejects pageSize greater than 100', () => {
      expect(() => paginationSchema.parse({ pageSize: 101 })).toThrow();
    });
  });

  describe('Login Schema', () => {
    it('validates correct login data', () => {
      expect(() =>
        loginSchema.parse({ email: 'admin@acadivo.com', password: 'password123' })
      ).not.toThrow();
    });

    it('rejects invalid email in login', () => {
      expect(() =>
        loginSchema.parse({ email: 'invalid', password: 'password123' })
      ).toThrow();
    });

    it('rejects empty password in login', () => {
      expect(() =>
        loginSchema.parse({ email: 'admin@acadivo.com', password: '' })
      ).toThrow();
    });
  });

  describe('Register Schema', () => {
    it('validates correct register data', () => {
      expect(() =>
        registerSchema.parse({
          email: 'new@acadivo.com',
          password: 'SecurePass123',
          name: 'John Doe',
        })
      ).not.toThrow();
    });

    it('rejects short name', () => {
      expect(() =>
        registerSchema.parse({
          email: 'new@acadivo.com',
          password: 'SecurePass123',
          name: 'J',
        })
      ).toThrow();
    });

    it('rejects weak password', () => {
      expect(() =>
        registerSchema.parse({
          email: 'new@acadivo.com',
          password: 'weak',
          name: 'John Doe',
        })
      ).toThrow();
    });
  });
});
