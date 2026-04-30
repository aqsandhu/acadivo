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

// Type guards and type checking functions
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT';
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED' | 'HALF_DAY';
type FeeStatus = 'UNPAID' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'WAIVED';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

function isValidUserRole(role: string): role is UserRole {
  return ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'].includes(role);
}

function isValidAttendanceStatus(status: string): status is AttendanceStatus {
  return ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'EXCUSED', 'HALF_DAY'].includes(status);
}

function isValidFeeStatus(status: string): status is FeeStatus {
  return ['UNPAID', 'PAID', 'PARTIAL', 'OVERDUE', 'WAIVED'].includes(status);
}

function isValidGender(gender: string): gender is Gender {
  return ['MALE', 'FEMALE', 'OTHER'].includes(gender);
}

function assertType<T>(value: T): T {
  return value;
}

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

  describe('AttendanceStatus Type', () => {
    it('should validate all valid attendance statuses', () => {
      expect(isValidAttendanceStatus('PRESENT')).toBe(true);
      expect(isValidAttendanceStatus('ABSENT')).toBe(true);
      expect(isValidAttendanceStatus('LATE')).toBe(true);
      expect(isValidAttendanceStatus('LEAVE')).toBe(true);
      expect(isValidAttendanceStatus('EXCUSED')).toBe(true);
      expect(isValidAttendanceStatus('HALF_DAY')).toBe(true);
    });

    it('should reject invalid attendance statuses', () => {
      expect(isValidAttendanceStatus('present')).toBe(false);
      expect(isValidAttendanceStatus('')).toBe(false);
      expect(isValidAttendanceStatus('SICK')).toBe(false);
    });
  });

  describe('FeeStatus Type', () => {
    it('should validate all valid fee statuses', () => {
      expect(isValidFeeStatus('UNPAID')).toBe(true);
      expect(isValidFeeStatus('PAID')).toBe(true);
      expect(isValidFeeStatus('PARTIAL')).toBe(true);
      expect(isValidFeeStatus('OVERDUE')).toBe(true);
      expect(isValidFeeStatus('WAIVED')).toBe(true);
    });

    it('should reject invalid fee statuses', () => {
      expect(isValidFeeStatus('paid')).toBe(false);
      expect(isValidFeeStatus('PENDING')).toBe(false);
      expect(isValidFeeStatus('REFUNDED')).toBe(false);
      expect(isValidFeeStatus('')).toBe(false);
    });
  });

  describe('UserRole Type', () => {
    it('should validate all valid user roles', () => {
      expect(isValidUserRole('SUPER_ADMIN')).toBe(true);
      expect(isValidUserRole('ADMIN')).toBe(true);
      expect(isValidUserRole('PRINCIPAL')).toBe(true);
      expect(isValidUserRole('TEACHER')).toBe(true);
      expect(isValidUserRole('STUDENT')).toBe(true);
      expect(isValidUserRole('PARENT')).toBe(true);
    });

    it('should reject invalid user roles', () => {
      expect(isValidUserRole('student')).toBe(false);
      expect(isValidUserRole('')).toBe(false);
      expect(isValidUserRole('HEADMASTER')).toBe(false);
    });
  });

  describe('Gender Type', () => {
    it('should validate all valid genders', () => {
      expect(isValidGender('MALE')).toBe(true);
      expect(isValidGender('FEMALE')).toBe(true);
      expect(isValidGender('OTHER')).toBe(true);
    });

    it('should reject invalid genders', () => {
      expect(isValidGender('male')).toBe(false);
      expect(isValidGender('')).toBe(false);
      expect(isValidGender('UNKNOWN')).toBe(false);
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

  describe('Complex Objects', () => {
    it('should work with complex objects', () => {
      const student = assertType({
        id: 'std_001',
        firstName: 'Ahmad',
        lastName: 'Raza',
        class: { id: 'cls_8th_a', name: '8th Grade' },
        subjects: ['Mathematics', 'English', 'Science'],
      });
      expect(student.subjects).toHaveLength(3);
      expect(student.class.name).toBe('8th Grade');
    });
  });
});
