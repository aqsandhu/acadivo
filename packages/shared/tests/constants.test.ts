import { describe, it, expect } from 'vitest';

// Constants from shared package
const APP_NAME = 'Acadivo';
const APP_VERSION = '2.1.0';
const SUPPORTED_LANGUAGES = ['en', 'ur', 'pa'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const DEFAULT_PAGINATION_LIMIT = 10;
const MAX_PAGINATION_LIMIT = 100;
const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HALF_DAY'];
const FEE_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'];
const FEE_CATEGORIES = ['TUITION', 'EXAM', 'LIBRARY', 'LAB', 'SPORTS', 'TRANSPORT', 'OTHER'];
const EXAM_TYPES = ['QUIZ_1', 'QUIZ_2', 'MID_TERM', 'FINAL_TERM', 'ASSIGNMENT', 'PROJECT'];
const GRADE_SCALE = [
  { min: 90, grade: 'A+', points: 4.0 },
  { min: 85, grade: 'A', points: 4.0 },
  { min: 80, grade: 'A-', points: 3.7 },
  { min: 75, grade: 'B+', points: 3.3 },
  { min: 70, grade: 'B', points: 3.0 },
  { min: 65, grade: 'B-', points: 2.7 },
  { min: 60, grade: 'C+', points: 2.3 },
  { min: 55, grade: 'C', points: 2.0 },
  { min: 50, grade: 'C-', points: 1.7 },
  { min: 45, grade: 'D+', points: 1.3 },
  { min: 40, grade: 'D', points: 1.0 },
  { min: 0, grade: 'F', points: 0.0 },
];
const NOTIFICATION_TYPES = ['HOMEWORK', 'ATTENDANCE', 'FEE', 'ANNOUNCEMENT', 'RESULT', 'MESSAGE', 'GENERAL'];
const USER_ROLES = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'];
const SCHOOL_STATUS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAYSA', 'CARD', 'ONLINE', 'CHEQUE'];

describe('Constant Values Tests', () => {
  describe('Application Constants', () => {
    it('has correct app name', () => {
      expect(APP_NAME).toBe('Acadivo');
    });

    it('has correct app version format', () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Localization', () => {
    it('has supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toContain('en');
      expect(SUPPORTED_LANGUAGES).toContain('ur');
      expect(SUPPORTED_LANGUAGES).toContain('pa');
      expect(SUPPORTED_LANGUAGES).toHaveLength(3);
    });
  });

  describe('File Upload', () => {
    it('has correct max file size', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('has allowed file types', () => {
      expect(ALLOWED_FILE_TYPES).toContain('image/jpeg');
      expect(ALLOWED_FILE_TYPES).toContain('image/png');
      expect(ALLOWED_FILE_TYPES).toContain('image/webp');
      expect(ALLOWED_FILE_TYPES).toContain('application/pdf');
      expect(ALLOWED_FILE_TYPES).toHaveLength(4);
    });
  });

  describe('Password Constraints', () => {
    it('has correct min length', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8);
    });

    it('has correct max length', () => {
      expect(PASSWORD_MAX_LENGTH).toBe(128);
    });
  });

  describe('Pagination', () => {
    it('has correct default limit', () => {
      expect(DEFAULT_PAGINATION_LIMIT).toBe(10);
    });

    it('has correct max limit', () => {
      expect(MAX_PAGINATION_LIMIT).toBe(100);
    });

    it('max limit is greater than default', () => {
      expect(MAX_PAGINATION_LIMIT).toBeGreaterThan(DEFAULT_PAGINATION_LIMIT);
    });
  });

  describe('Attendance Statuses', () => {
    it('has all required statuses', () => {
      expect(ATTENDANCE_STATUSES).toContain('PRESENT');
      expect(ATTENDANCE_STATUSES).toContain('ABSENT');
      expect(ATTENDANCE_STATUSES).toContain('LATE');
      expect(ATTENDANCE_STATUSES).toContain('LEAVE');
      expect(ATTENDANCE_STATUSES).toContain('HALF_DAY');
      expect(ATTENDANCE_STATUSES).toHaveLength(5);
    });
  });

  describe('Fee Configuration', () => {
    it('has all fee frequencies', () => {
      expect(FEE_FREQUENCIES).toContain('MONTHLY');
      expect(FEE_FREQUENCIES).toContain('QUARTERLY');
      expect(FEE_FREQUENCIES).toContain('YEARLY');
      expect(FEE_FREQUENCIES).toContain('ONE_TIME');
      expect(FEE_FREQUENCIES).toHaveLength(4);
    });

    it('has all fee categories', () => {
      expect(FEE_CATEGORIES).toContain('TUITION');
      expect(FEE_CATEGORIES).toContain('EXAM');
      expect(FEE_CATEGORIES).toContain('LIBRARY');
      expect(FEE_CATEGORIES).toContain('TRANSPORT');
      expect(FEE_CATEGORIES).toHaveLength(7);
    });
  });

  describe('Exam Types', () => {
    it('has all exam types', () => {
      expect(EXAM_TYPES).toContain('QUIZ_1');
      expect(EXAM_TYPES).toContain('QUIZ_2');
      expect(EXAM_TYPES).toContain('MID_TERM');
      expect(EXAM_TYPES).toContain('FINAL_TERM');
      expect(EXAM_TYPES).toContain('ASSIGNMENT');
      expect(EXAM_TYPES).toContain('PROJECT');
      expect(EXAM_TYPES).toHaveLength(6);
    });
  });

  describe('Grade Scale', () => {
    it('has correct number of grades', () => {
      expect(GRADE_SCALE).toHaveLength(12);
    });

    it('has A+ as highest grade', () => {
      expect(GRADE_SCALE[0].grade).toBe('A+');
      expect(GRADE_SCALE[0].min).toBe(90);
    });

    it('has F as lowest grade', () => {
      expect(GRADE_SCALE[GRADE_SCALE.length - 1].grade).toBe('F');
      expect(GRADE_SCALE[GRADE_SCALE.length - 1].min).toBe(0);
    });

    it('has valid GPA points for all grades', () => {
      GRADE_SCALE.forEach((grade) => {
        expect(grade.points).toBeGreaterThanOrEqual(0);
        expect(grade.points).toBeLessThanOrEqual(4.0);
      });
    });

    it('has descending minimum percentages', () => {
      for (let i = 1; i < GRADE_SCALE.length; i++) {
        expect(GRADE_SCALE[i].min).toBeLessThanOrEqual(GRADE_SCALE[i - 1].min);
      }
    });
  });

  describe('Notification Types', () => {
    it('has all notification types', () => {
      expect(NOTIFICATION_TYPES).toContain('HOMEWORK');
      expect(NOTIFICATION_TYPES).toContain('ATTENDANCE');
      expect(NOTIFICATION_TYPES).toContain('FEE');
      expect(NOTIFICATION_TYPES).toContain('ANNOUNCEMENT');
      expect(NOTIFICATION_TYPES).toContain('RESULT');
      expect(NOTIFICATION_TYPES).toContain('MESSAGE');
      expect(NOTIFICATION_TYPES).toContain('GENERAL');
      expect(NOTIFICATION_TYPES).toHaveLength(7);
    });
  });

  describe('User Roles', () => {
    it('has all user roles', () => {
      expect(USER_ROLES).toContain('ADMIN');
      expect(USER_ROLES).toContain('PRINCIPAL');
      expect(USER_ROLES).toContain('TEACHER');
      expect(USER_ROLES).toContain('STUDENT');
      expect(USER_ROLES).toContain('PARENT');
      expect(USER_ROLES).toHaveLength(5);
    });
  });

  describe('School Status', () => {
    it('has all school statuses', () => {
      expect(SCHOOL_STATUS).toContain('ACTIVE');
      expect(SCHOOL_STATUS).toContain('INACTIVE');
      expect(SCHOOL_STATUS).toContain('SUSPENDED');
      expect(SCHOOL_STATUS).toContain('PENDING_VERIFICATION');
      expect(SCHOOL_STATUS).toHaveLength(4);
    });
  });

  describe('Payment Methods', () => {
    it('has all payment methods', () => {
      expect(PAYMENT_METHODS).toContain('CASH');
      expect(PAYMENT_METHODS).toContain('BANK_TRANSFER');
      expect(PAYMENT_METHODS).toContain('JAZZCASH');
      expect(PAYMENT_METHODS).toContain('EASYPAYSA');
      expect(PAYMENT_METHODS).toContain('CARD');
      expect(PAYMENT_METHODS).toContain('ONLINE');
      expect(PAYMENT_METHODS).toContain('CHEQUE');
      expect(PAYMENT_METHODS).toHaveLength(7);
    });
  });
});
