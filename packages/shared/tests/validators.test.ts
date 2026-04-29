import { describe, it, expect } from 'vitest';

// Validation schemas (mock implementations for testing)
function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, error: 'Email is required' };
  if (!emailRegex.test(email)) return { valid: false, error: 'Invalid email format' };
  if (email.length > 254) return { valid: false, error: 'Email too long' };
  return { valid: true };
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Password must contain number' };
  if (!/[!@#$%^&*]/.test(password)) return { valid: false, error: 'Password must contain special character' };
  return { valid: true };
}

function validatePhone(phone: string): { valid: boolean; error?: string } {
  const phoneRegex = /^\+92-[0-9]{3}-[0-9]{7}$/;
  if (!phone) return { valid: false, error: 'Phone is required' };
  if (!phoneRegex.test(phone)) return { valid: false, error: 'Invalid Pakistani phone format. Expected: +92-XXX-XXXXXXX' };
  return { valid: true };
}

function validateCNIC(cnic: string): { valid: boolean; error?: string } {
  const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
  if (!cnic) return { valid: false, error: 'CNIC is required' };
  if (!cnicRegex.test(cnic)) return { valid: false, error: 'Invalid CNIC format. Expected: XXXXX-XXXXXXX-X' };
  return { valid: true };
}

function validateName(name: string): { valid: boolean; error?: string } {
  if (!name) return { valid: false, error: 'Name is required' };
  if (name.length < 2) return { valid: false, error: 'Name too short' };
  if (name.length > 100) return { valid: false, error: 'Name too long' };
  if (!/^[a-zA-Z\s.\-]+$/.test(name)) return { valid: false, error: 'Name contains invalid characters' };
  return { valid: true };
}

function validateRollNumber(rollNumber: string): { valid: boolean; error?: string } {
  if (!rollNumber) return { valid: false, error: 'Roll number is required' };
  if (!/^R-[0-9]{4}-[0-9]{3}-[A-Z]$/.test(rollNumber)) {
    return { valid: false, error: 'Invalid roll number format. Expected: R-YYYY-NNN-X' };
  }
  return { valid: true };
}

function validateMarks(obtained: number, total: number): { valid: boolean; error?: string } {
  if (typeof obtained !== 'number' || typeof total !== 'number') {
    return { valid: false, error: 'Marks must be numbers' };
  }
  if (obtained < 0 || total < 0) return { valid: false, error: 'Marks cannot be negative' };
  if (obtained > total) return { valid: false, error: 'Obtained marks cannot exceed total' };
  if (total === 0) return { valid: false, error: 'Total marks cannot be zero' };
  return { valid: true };
}

function validateFeeAmount(amount: number): { valid: boolean; error?: string } {
  if (typeof amount !== 'number') return { valid: false, error: 'Amount must be a number' };
  if (amount <= 0) return { valid: false, error: 'Amount must be positive' };
  if (amount > 500000) return { valid: false, error: 'Amount exceeds maximum allowed' };
  return { valid: true };
}

describe('Input Validation Schemas', () => {
  describe('Email Validation', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('teacher@school.edu.pk')).toEqual({ valid: true });
      expect(validateEmail('student.name@example.com')).toEqual({ valid: true });
      expect(validateEmail('admin@acadivo.edu.pk')).toEqual({ valid: true });
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('not-an-email')).toEqual({ valid: false, error: 'Invalid email format' });
      expect(validateEmail('@school.edu.pk')).toEqual({ valid: false, error: 'Invalid email format' });
      expect(validateEmail('teacher@')).toEqual({ valid: false, error: 'Invalid email format' });
    });

    it('rejects empty email', () => {
      expect(validateEmail('')).toEqual({ valid: false, error: 'Email is required' });
    });

    it('rejects too long email', () => {
      const longEmail = 'a'.repeat(250) + '@school.edu.pk';
      expect(validateEmail(longEmail)).toEqual({ valid: false, error: 'Email too long' });
    });
  });

  describe('Password Validation', () => {
    it('validates strong password', () => {
      expect(validatePassword('SecurePass123!')).toEqual({ valid: true });
      expect(validatePassword('MyP@ssw0rd')).toEqual({ valid: true });
    });

    it('rejects short password', () => {
      expect(validatePassword('Short1!')).toEqual({ valid: false, error: 'Password must be at least 8 characters' });
    });

    it('rejects password without uppercase', () => {
      expect(validatePassword('securepass123!')).toEqual({ valid: false, error: 'Password must contain uppercase letter' });
    });

    it('rejects password without lowercase', () => {
      expect(validatePassword('SECUREPASS123!')).toEqual({ valid: false, error: 'Password must contain lowercase letter' });
    });

    it('rejects password without number', () => {
      expect(validatePassword('SecurePass!')).toEqual({ valid: false, error: 'Password must contain number' });
    });

    it('rejects password without special character', () => {
      expect(validatePassword('SecurePass123')).toEqual({ valid: false, error: 'Password must contain special character' });
    });

    it('rejects empty password', () => {
      expect(validatePassword('')).toEqual({ valid: false, error: 'Password is required' });
    });
  });

  describe('Phone Validation', () => {
    it('validates Pakistani phone numbers', () => {
      expect(validatePhone('+92-300-1234567')).toEqual({ valid: true });
      expect(validatePhone('+92-321-9876543')).toEqual({ valid: true });
      expect(validatePhone('+92-345-5555555')).toEqual({ valid: true });
    });

    it('rejects invalid phone formats', () => {
      expect(validatePhone('03001234567')).toEqual({ valid: false, error: 'Invalid Pakistani phone format. Expected: +92-XXX-XXXXXXX' });
      expect(validatePhone('+92-30-1234567')).toEqual({ valid: false, error: 'Invalid Pakistani phone format. Expected: +92-XXX-XXXXXXX' });
      expect(validatePhone('+92-300-123456')).toEqual({ valid: false, error: 'Invalid Pakistani phone format. Expected: +92-XXX-XXXXXXX' });
    });

    it('rejects empty phone', () => {
      expect(validatePhone('')).toEqual({ valid: false, error: 'Phone is required' });
    });
  });

  describe('CNIC Validation', () => {
    it('validates correct CNIC format', () => {
      expect(validateCNIC('35201-1234567-1')).toEqual({ valid: true });
      expect(validateCNIC('42101-9876543-2')).toEqual({ valid: true });
    });

    it('rejects invalid CNIC formats', () => {
      expect(validateCNIC('3520112345671')).toEqual({ valid: false, error: 'Invalid CNIC format. Expected: XXXXX-XXXXXXX-X' });
      expect(validateCNIC('35201-123456-1')).toEqual({ valid: false, error: 'Invalid CNIC format. Expected: XXXXX-XXXXXXX-X' });
      expect(validateCNIC('3520-1234567-11')).toEqual({ valid: false, error: 'Invalid CNIC format. Expected: XXXXX-XXXXXXX-X' });
    });

    it('rejects empty CNIC', () => {
      expect(validateCNIC('')).toEqual({ valid: false, error: 'CNIC is required' });
    });
  });

  describe('Name Validation', () => {
    it('validates correct names', () => {
      expect(validateName('Ahmad Raza')).toEqual({ valid: true });
      expect(validateName('Fatima Zahra')).toEqual({ valid: true });
      expect(validateName('Dr. Aslam Mehmood')).toEqual({ valid: true });
    });

    it('rejects empty name', () => {
      expect(validateName('')).toEqual({ valid: false, error: 'Name is required' });
    });

    it('rejects too short name', () => {
      expect(validateName('A')).toEqual({ valid: false, error: 'Name too short' });
    });

    it('rejects name with invalid characters', () => {
      expect(validateName('Ahmad123')).toEqual({ valid: false, error: 'Name contains invalid characters' });
      expect(validateName('Ahmad@Raza')).toEqual({ valid: false, error: 'Name contains invalid characters' });
    });
  });

  describe('Roll Number Validation', () => {
    it('validates correct roll numbers', () => {
      expect(validateRollNumber('R-2024-008-A')).toEqual({ valid: true });
      expect(validateRollNumber('R-2024-123-B')).toEqual({ valid: true });
    });

    it('rejects invalid roll numbers', () => {
      expect(validateRollNumber('2024-008-A')).toEqual({ valid: false, error: 'Invalid roll number format. Expected: R-YYYY-NNN-X' });
      expect(validateRollNumber('R-2024-8-A')).toEqual({ valid: false, error: 'Invalid roll number format. Expected: R-YYYY-NNN-X' });
      expect(validateRollNumber('R-2024-008')).toEqual({ valid: false, error: 'Invalid roll number format. Expected: R-YYYY-NNN-X' });
    });
  });

  describe('Marks Validation', () => {
    it('validates correct marks', () => {
      expect(validateMarks(42, 50)).toEqual({ valid: true });
      expect(validateMarks(0, 100)).toEqual({ valid: true });
      expect(validateMarks(100, 100)).toEqual({ valid: true });
    });

    it('rejects negative marks', () => {
      expect(validateMarks(-5, 50)).toEqual({ valid: false, error: 'Marks cannot be negative' });
    });

    it('rejects obtained greater than total', () => {
      expect(validateMarks(60, 50)).toEqual({ valid: false, error: 'Obtained marks cannot exceed total' });
    });

    it('rejects zero total marks', () => {
      expect(validateMarks(0, 0)).toEqual({ valid: false, error: 'Total marks cannot be zero' });
    });

    it('rejects non-numeric marks', () => {
      expect(validateMarks('50' as any, 100)).toEqual({ valid: false, error: 'Marks must be numbers' });
    });
  });

  describe('Fee Amount Validation', () => {
    it('validates correct fee amounts', () => {
      expect(validateFeeAmount(5000)).toEqual({ valid: true });
      expect(validateFeeAmount(2500)).toEqual({ valid: true });
      expect(validateFeeAmount(100000)).toEqual({ valid: true });
    });

    it('rejects zero or negative amounts', () => {
      expect(validateFeeAmount(0)).toEqual({ valid: false, error: 'Amount must be positive' });
      expect(validateFeeAmount(-100)).toEqual({ valid: false, error: 'Amount must be positive' });
    });

    it('rejects amounts exceeding maximum', () => {
      expect(validateFeeAmount(600000)).toEqual({ valid: false, error: 'Amount exceeds maximum allowed' });
    });

    it('rejects non-numeric amounts', () => {
      expect(validateFeeAmount('5000' as any)).toEqual({ valid: false, error: 'Amount must be a number' });
    });
  });
});
