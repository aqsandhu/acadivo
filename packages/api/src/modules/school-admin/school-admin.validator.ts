// ═══════════════════════════════════════════════════
// School Admin Validator — Request Validation Schemas
// ═══════════════════════════════════════════════════

import { z } from 'zod';

// ── Dashboard ──
export const dashboardQuerySchema = z.object({
  date: z.string().optional(),
});

// ── Teacher ──
export const createTeacherSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(1),
  cnic: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  qualifications: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.coerce.number().int().min(0).optional(),
  joiningDate: z.string().datetime().optional(),
  bio: z.string().optional(),
});

export const updateTeacherSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  qualifications: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.coerce.number().int().min(0).optional(),
  isClassTeacher: z.boolean().optional(),
  assignedClassId: z.string().optional(),
  assignedSectionId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ── Student ──
export const createStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(1),
  rollNumber: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(1),
  guardianRelation: z.string().min(1),
  guardianCNIC: z.string().optional(),
  guardianGender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  parentEmail: z.string().email().optional(),
  parentPassword: z.string().min(6).optional(),
  parentOccupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyRelation: z.string().optional(),
  bloodGroup: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  rollNumber: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianCNIC: z.string().optional(),
  bloodGroup: z.string().optional(),
  medicalNotes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED']).optional(),
  isActive: z.boolean().optional(),
});

// ── Parent ──
export const createParentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(1),
  cnic: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyRelation: z.string().optional(),
  children: z.array(z.object({
    studentId: z.string().min(1),
    relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN']),
    isPrimary: z.boolean().default(false),
    canPickup: z.boolean().default(true),
  })).optional(),
});

export const updateParentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyRelation: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ── Bulk Import ──
export const bulkImportSchema = z.object({
  entityType: z.enum(['STUDENT', 'TEACHER']),
  records: z.array(z.record(z.unknown())).min(1),
});

// ── Class ──
export const createClassSchema = z.object({
  name: z.string().min(1).max(50),
  grade: z.string().min(1).max(10),
  academicYear: z.string().min(1),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().int().min(1).max(200).default(30),
});

export const updateClassSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  grade: z.string().min(1).max(10).optional(),
  academicYear: z.string().optional(),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().int().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
});

// ── Section ──
export const createSectionSchema = z.object({
  classId: z.string().min(1),
  name: z.string().min(1).max(20),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().int().min(1).max(200).default(30),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().int().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
});

// ── Subject ──
export const createSubjectSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  description: z.string().optional(),
  creditHours: z.coerce.number().int().min(1).max(20).default(3),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(20).optional(),
  description: z.string().optional(),
  creditHours: z.coerce.number().int().min(1).max(20).optional(),
  isActive: z.boolean().optional(),
});

// ── Assign Subject ──
export const assignSubjectSchema = z.object({
  teacherId: z.string().min(1),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  academicYear: z.string().min(1),
});

// ── Timetable ──
export const createTimetableSchema = z.object({
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  periodNumber: z.coerce.number().int().min(1).max(20),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  roomNumber: z.string().optional(),
  academicYear: z.string().min(1),
});

export const updateTimetableSchema = z.object({
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  periodNumber: z.coerce.number().int().min(1).max(20).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  roomNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ── Announcement ──
export const createAdminAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'ADMIN', 'CLASS']).default('ALL'),
  targetClassId: z.string().optional(),
  targetSectionId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'ADMIN', 'CLASS']).optional(),
  targetClassId: z.string().optional(),
  targetSectionId: z.string().optional(),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ── Fee Structure ──
export const createFeeStructureSchema = z.object({
  classId: z.string().optional(),
  feeType: z.enum(['TUITION', 'ADMISSION', 'EXAM', 'LAB', 'SPORTS', 'LIBRARY', 'TRANSPORT', 'MISC']),
  amount: z.coerce.number().min(0),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  lateFeePerDay: z.coerce.number().min(0).optional(),
  academicYear: z.string().min(1),
});

export const updateFeeStructureSchema = z.object({
  classId: z.string().optional(),
  feeType: z.enum(['TUITION', 'ADMISSION', 'EXAM', 'LAB', 'SPORTS', 'LIBRARY', 'TRANSPORT', 'MISC']).optional(),
  amount: z.coerce.number().min(0).optional(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']).optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional(),
  lateFeePerDay: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ── Fee Record ──
export const createFeeRecordSchema = z.object({
  studentId: z.string().min(1),
  feeStructureId: z.string().min(1),
  amount: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).optional(),
  discountReason: z.string().optional(),
  finalAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0),
  dueDate: z.string().datetime(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'EASYPAYSA', 'JAZZCASH']).optional(),
  transactionId: z.string().optional(),
  remarks: z.string().optional(),
});

// ── Notification ──
export const sendNotificationSchema = z.object({
  targetRole: z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'ADMIN']).default('ALL'),
  targetUserIds: z.array(z.string()).optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  type: z.enum([
    'ANNOUNCEMENT', 'MESSAGE', 'REPORT_READY', 'FEE_DUE',
    'ATTENDANCE_ALERT', 'HOMEWORK', 'RESULT', 'TIMETABLE_CHANGE',
  ]).default('ANNOUNCEMENT'),
  targetClassId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

// ── Settings ──
export const updateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  category: z.enum(['GENERAL', 'ACADEMIC', 'FEE', 'COMMUNICATION', 'NOTIFICATION']).optional(),
  description: z.string().optional(),
});
