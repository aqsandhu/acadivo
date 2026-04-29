import { describe, it, expect } from 'vitest';

// Type guards and type checking functions
type UserRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT';
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY';
type FeeStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'WAIVED';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

function isValidUserRole(role: string): role is UserRole {
  return ['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'].includes(role);
}

function isValidAttendanceStatus(status: string): status is AttendanceStatus {
  return ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HALF_DAY'].includes(status);
}

function isValidFeeStatus(status: string): status is FeeStatus {
  return ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'WAIVED'].includes(status);
}

function isValidGender(gender: string): gender is Gender {
  return ['MALE', 'FEMALE', 'OTHER'].includes(gender);
}

function assertType<T>(value: T): T {
  return value;
}

describe('Type Validation Tests', () => {
  describe('UserRole Type', () => {
    it('should validate all valid user roles', () => {
      expect(isValidUserRole('ADMIN')).toBe(true);
      expect(isValidUserRole('PRINCIPAL')).toBe(true);
      expect(isValidUserRole('TEACHER')).toBe(true);
      expect(isValidUserRole('STUDENT')).toBe(true);
      expect(isValidUserRole('PARENT')).toBe(true);
    });

    it('should reject invalid user roles', () => {
      expect(isValidUserRole('SUPERADMIN')).toBe(false);
      expect(isValidUserRole('LECTURER')).toBe(false);
      expect(isValidUserRole('')).toBe(false);
      expect(isValidUserRole('admin')).toBe(false); // case sensitive
      expect(isValidUserRole('Teacher')).toBe(false); // case sensitive
    });
  });

  describe('AttendanceStatus Type', () => {
    it('should validate all valid attendance statuses', () => {
      expect(isValidAttendanceStatus('PRESENT')).toBe(true);
      expect(isValidAttendanceStatus('ABSENT')).toBe(true);
      expect(isValidAttendanceStatus('LATE')).toBe(true);
      expect(isValidAttendanceStatus('LEAVE')).toBe(true);
      expect(isValidAttendanceStatus('HALF_DAY')).toBe(true);
    });

    it('should reject invalid attendance statuses', () => {
      expect(isValidAttendanceStatus('present')).toBe(false);
      expect(isValidAttendanceStatus('ON_DUTY')).toBe(false);
      expect(isValidAttendanceStatus('SICK')).toBe(false);
      expect(isValidAttendanceStatus('')).toBe(false);
    });
  });

  describe('FeeStatus Type', () => {
    it('should validate all valid fee statuses', () => {
      expect(isValidFeeStatus('PENDING')).toBe(true);
      expect(isValidFeeStatus('PAID')).toBe(true);
      expect(isValidFeeStatus('PARTIAL')).toBe(true);
      expect(isValidFeeStatus('OVERDUE')).toBe(true);
      expect(isValidFeeStatus('WAIVED')).toBe(true);
    });

    it('should reject invalid fee statuses', () => {
      expect(isValidFeeStatus('paid')).toBe(false);
      expect(isValidFeeStatus('UNPAID')).toBe(false);
      expect(isValidFeeStatus('REFUNDED')).toBe(false);
      expect(isValidFeeStatus('')).toBe(false);
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
      expect(isValidGender('boy')).toBe(false);
      expect(isValidGender('girl')).toBe(false);
      expect(isValidGender('')).toBe(false);
    });
  });

  describe('Type Assertions', () => {
    it('should assert correct types', () => {
      const user = assertType({
        id: 'usr_123',
        email: 'test@school.edu.pk',
        role: 'TEACHER',
      });
      expect(user.id).toBe('usr_123');
      expect(user.email).toBe('test@school.edu.pk');
      expect(user.role).toBe('TEACHER');
    });

    it('should work with arrays', () => {
      const numbers = assertType([1, 2, 3, 4, 5]);
      expect(numbers).toHaveLength(5);
      expect(numbers[0]).toBe(1);
    });

    it('should work with complex objects', () => {
      const student = assertType({
        id: 'std_001',
        name: 'Ahmad Raza',
        class: { id: 'cls_8th_a', name: '8th Grade' },
        subjects: ['Mathematics', 'English', 'Science'],
      });
      expect(student.subjects).toHaveLength(3);
      expect(student.class.name).toBe('8th Grade');
    });
  });
});
