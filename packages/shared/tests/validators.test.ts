import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  uuidSchema,
  paginationSchema,
  loginSchema,
  registerSchema,
} from '../src/validation';

describe('Input Validation Schemas', () => {
  describe('Email Validation', () => {
    it('validates correct email addresses', () => {
      expect(emailSchema.safeParse('teacher@school.edu.pk').success).toBe(true);
      expect(emailSchema.safeParse('student.name@example.com').success).toBe(true);
      expect(emailSchema.safeParse('admin@acadivo.edu.pk').success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
      expect(emailSchema.safeParse('@school.edu.pk').success).toBe(false);
      expect(emailSchema.safeParse('teacher@').success).toBe(false);
    });

    it('rejects empty email', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
    });

    it('rejects too long email', () => {
      const longEmail = 'a'.repeat(250) + '@school.edu.pk';
      expect(emailSchema.safeParse(longEmail).success).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('validates strong password', () => {
      expect(passwordSchema.safeParse('SecurePass123').success).toBe(true);
      expect(passwordSchema.safeParse('MyP@ssw0rd').success).toBe(true);
    });

    it('rejects short password', () => {
      expect(passwordSchema.safeParse('Short1!').success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      expect(passwordSchema.safeParse('securepass123!').success).toBe(false);
    });

    it('rejects password without lowercase', () => {
      expect(passwordSchema.safeParse('SECUREPASS123!').success).toBe(false);
    });

    it('rejects password without number', () => {
      expect(passwordSchema.safeParse('SecurePass!').success).toBe(false);
    });

    it('rejects empty password', () => {
      expect(passwordSchema.safeParse('').success).toBe(false);
    });
  });

  describe('UUID Validation', () => {
    it('validates correct UUID', () => {
      expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
    });

    it('rejects invalid UUID', () => {
      expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(uuidSchema.safeParse('12345').success).toBe(false);
    });
  });

  describe('Pagination Validation', () => {
    it('validates default pagination', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('validates custom pagination', () => {
      const result = paginationSchema.safeParse({ page: 2, pageSize: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(50);
      }
    });

    it('rejects page less than 1', () => {
      expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false);
    });

    it('rejects pageSize greater than 100', () => {
      expect(paginationSchema.safeParse({ pageSize: 101 }).success).toBe(false);
    });
  });

  describe('Login Schema Validation', () => {
    it('validates correct login data', () => {
      expect(
        loginSchema.safeParse({ email: 'admin@acadivo.com', password: 'password123' }).success
      ).toBe(true);
    });

    it('rejects invalid email in login', () => {
      expect(
        loginSchema.safeParse({ email: 'invalid', password: 'password123' }).success
      ).toBe(false);
    });

    it('rejects empty password in login', () => {
      expect(
        loginSchema.safeParse({ email: 'admin@acadivo.com', password: '' }).success
      ).toBe(false);
    });
  });

  describe('Register Schema Validation', () => {
    it('validates correct register data', () => {
      expect(
        registerSchema.safeParse({
          email: 'new@acadivo.com',
          password: 'SecurePass123',
          name: 'John Doe',
        }).success
      ).toBe(true);
    });

    it('rejects short name', () => {
      expect(
        registerSchema.safeParse({
          email: 'new@acadivo.com',
          password: 'SecurePass123',
          name: 'J',
        }).success
      ).toBe(false);
    });

    it('rejects weak password', () => {
      expect(
        registerSchema.safeParse({
          email: 'new@acadivo.com',
          password: 'weak',
          name: 'John Doe',
        }).success
      ).toBe(false);
    });
  });
});
