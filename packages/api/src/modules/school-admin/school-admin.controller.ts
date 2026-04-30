// ═══════════════════════════════════════════════════
// School Admin Controller
// ═══════════════════════════════════════════════════

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import {
  successResponse,
  errorResponse,
  paginate,
} from '../../utils/response';
import * as AdminService from './school-admin.service';
import * as AuditService from '../../services/audit.service';

// ── Helpers ──

function getTenantAndUser(req: Request): { tenantId: string; userId: string } | null {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return null;
  return { tenantId, userId };
}

function getPagination(req: Request) {
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
  const search = (req.query.search as string) || undefined;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
  return { page, limit, search, sortBy, sortOrder };
}

async function getSchoolCode(tenantId: string): Promise<string> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { code: true } });
  return tenant?.code || tenantId.slice(0, 6).toUpperCase();
}

// ═══════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════

export async function getDashboard(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const stats = await AdminService.getDashboardStats(ctx.tenantId);
    return res.json(successResponse(stats, 'Admin dashboard retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Teachers
// ═══════════════════════════════════════════════════

export async function createTeacher(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const schoolCode = await getSchoolCode(ctx.tenantId);
    const result = await AdminService.createTeacher(ctx.tenantId, schoolCode, req.body);

    await AuditService.createAuditLog(prisma, {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      action: 'CREATE_TEACHER',
      entityType: 'Teacher',
      entityId: result.user.id,
      newValues: { email: result.user.email, uniqueId: result.user.uniqueId },
    });

    return res.status(201).json(successResponse(result, 'Teacher created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getTeachers(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, search, sortBy, sortOrder } = getPagination(req);
    const { teachers, total } = await AdminService.listTeachers(ctx.tenantId, {
      page, limit, search, sortBy, sortOrder,
    });
    const { data, meta } = paginate(teachers, total, page, limit);
    return res.json(successResponse(data, 'Teachers retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getTeacherById(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const teacher = await AdminService.getTeacherById(ctx.tenantId, req.params.id);
    if (!teacher) return res.status(404).json(errorResponse('NOT_FOUND', 'Teacher not found'));
    return res.json(successResponse(teacher, 'Teacher retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateTeacher(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const teacher = await AdminService.updateTeacher(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(teacher, 'Teacher updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteTeacher(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    await AdminService.deactivateTeacher(ctx.tenantId, req.params.id);
    return res.json(successResponse(null, 'Teacher deactivated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Students
// ═══════════════════════════════════════════════════

export async function createStudent(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const schoolCode = await getSchoolCode(ctx.tenantId);
    const result = await AdminService.createStudent(ctx.tenantId, schoolCode, req.body);

    await AuditService.createAuditLog(prisma, {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      action: 'CREATE_STUDENT',
      entityType: 'Student',
      entityId: result.user.id,
      newValues: { email: result.user.email, uniqueId: result.user.uniqueId, rollNumber: result.student.rollNumber },
    });

    return res.status(201).json(successResponse(result, 'Student created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getStudents(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, search, sortBy, sortOrder } = getPagination(req);
    const classId = (req.query.classId as string) || undefined;
    const sectionId = (req.query.sectionId as string) || undefined;
    const { students, total } = await AdminService.listStudents(ctx.tenantId, {
      page, limit, search, sortBy, sortOrder, classId, sectionId,
    });
    const { data, meta } = paginate(students, total, page, limit);
    return res.json(successResponse(data, 'Students retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getStudentById(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const student = await AdminService.getStudentById(ctx.tenantId, req.params.id);
    if (!student) return res.status(404).json(errorResponse('NOT_FOUND', 'Student not found'));
    return res.json(successResponse(student, 'Student retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateStudent(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const student = await AdminService.updateStudent(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(student, 'Student updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteStudent(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    await AdminService.deactivateStudent(ctx.tenantId, req.params.id);
    return res.json(successResponse(null, 'Student deactivated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Parents
// ═══════════════════════════════════════════════════

export async function createParent(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const schoolCode = await getSchoolCode(ctx.tenantId);
    const result = await AdminService.createParent(ctx.tenantId, schoolCode, req.body);

    await AuditService.createAuditLog(prisma, {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      action: 'CREATE_PARENT',
      entityType: 'Parent',
      entityId: result.user.id,
      newValues: { email: result.user.email, uniqueId: result.user.uniqueId },
    });

    return res.status(201).json(successResponse(result, 'Parent created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getParents(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, search, sortBy, sortOrder } = getPagination(req);
    const { parents, total } = await AdminService.listParents(ctx.tenantId, {
      page, limit, search, sortBy, sortOrder,
    });
    const { data, meta } = paginate(parents, total, page, limit);
    return res.json(successResponse(data, 'Parents retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getParentById(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const parent = await AdminService.getParentById(ctx.tenantId, req.params.id);
    if (!parent) return res.status(404).json(errorResponse('NOT_FOUND', 'Parent not found'));
    return res.json(successResponse(parent, 'Parent retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateParent(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const parent = await AdminService.updateParent(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(parent, 'Parent updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Bulk Import
// ═══════════════════════════════════════════════════

export async function bulkImport(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { entityType, records } = req.body;
    const schoolCode = await getSchoolCode(ctx.tenantId);
    const result = await AdminService.bulkImport(ctx.tenantId, schoolCode, entityType, records);
    return res.status(201).json(successResponse(result, 'Bulk import completed'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Classes
// ═══════════════════════════════════════════════════

export async function createClass(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const cls = await AdminService.createClass(ctx.tenantId, req.body);
    return res.status(201).json(successResponse(cls, 'Class created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getClasses(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { classes, total } = await AdminService.listClasses(ctx.tenantId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(classes, total, page, limit);
    return res.json(successResponse(data, 'Classes retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getClassById(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const cls = await AdminService.getClassById(ctx.tenantId, req.params.id);
    if (!cls) return res.status(404).json(errorResponse('NOT_FOUND', 'Class not found'));
    return res.json(successResponse(cls, 'Class retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateClass(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const cls = await AdminService.updateClass(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(cls, 'Class updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteClass(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    await AdminService.deleteClass(ctx.tenantId, req.params.id);
    return res.json(successResponse(null, 'Class deleted'));
  } catch (err: any) {
    return res.status(400).json(errorResponse('DELETE_FAILED', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Sections
// ═══════════════════════════════════════════════════

export async function createSection(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const section = await AdminService.createSection(ctx.tenantId, req.body);
    return res.status(201).json(successResponse(section, 'Section created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateSection(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const section = await AdminService.updateSection(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(section, 'Section updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteSection(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    await AdminService.deleteSection(ctx.tenantId, req.params.id);
    return res.json(successResponse(null, 'Section deleted'));
  } catch (err: any) {
    return res.status(400).json(errorResponse('DELETE_FAILED', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Subjects
// ═══════════════════════════════════════════════════

export async function createSubject(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const subject = await AdminService.createSubject(ctx.tenantId, req.body);
    return res.status(201).json(successResponse(subject, 'Subject created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getSubjects(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { subjects, total } = await AdminService.listSubjects(ctx.tenantId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(subjects, total, page, limit);
    return res.json(successResponse(data, 'Subjects retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateSubject(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const subject = await AdminService.updateSubject(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(subject, 'Subject updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteSubject(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    await AdminService.deleteSubject(ctx.tenantId, req.params.id);
    return res.json(successResponse(null, 'Subject deleted'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Teacher Subject Assignments
// ═══════════════════════════════════════════════════

export async function assignSubject(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const assignment = await AdminService.assignTeacherToSubject(ctx.tenantId, req.body);
    return res.status(201).json(successResponse(assignment, 'Subject assigned to teacher'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getTeacherAssignments(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const assignments = await AdminService.listTeacherAssignments(ctx.tenantId);
    return res.json(successResponse(assignments, 'Teacher assignments retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Timetable
// ═══════════════════════════════════════════════════

export async function createTimetableEntry(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const entry = await AdminService.createTimetableEntry(ctx.tenantId, req.body);
    return res.status(201).json(successResponse(entry, 'Timetable entry created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getTimetable(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const classId = (req.query.classId as string) || undefined;
    const academicYear = (req.query.academicYear as string) || undefined;
    const entries = await AdminService.listTimetable(ctx.tenantId, { classId, academicYear });
    return res.json(successResponse(entries, 'Timetable retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getClassTimetable(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const entries = await AdminService.listTimetable(ctx.tenantId, { classId: req.params.classId });
    return res.json(successResponse(entries, 'Class timetable retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateTimetableEntry(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const entry = await AdminService.updateTimetableEntry(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(entry, 'Timetable entry updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteTimetableEntry(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    await AdminService.deleteTimetableEntry(ctx.tenantId, req.params.id);
    return res.json(successResponse(null, 'Timetable entry deleted'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Announcements (Noticeboard)
// ═══════════════════════════════════════════════════

export async function createAnnouncement(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const announcement = await AdminService.createAnnouncement(ctx.tenantId, ctx.userId, req.body);
    return res.status(201).json(successResponse(announcement, 'Announcement posted'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getAnnouncements(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { announcements, total } = await AdminService.listAnnouncements(ctx.tenantId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(announcements, total, page, limit);
    return res.json(successResponse(data, 'Announcements retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateAnnouncement(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const announcement = await AdminService.updateAnnouncement(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(announcement, 'Announcement updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    await AdminService.deleteAnnouncement(ctx.tenantId, req.params.id);
    return res.json(successResponse(null, 'Announcement deleted'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Fee Structure
// ═══════════════════════════════════════════════════

export async function createFeeStructure(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const feeStructure = await AdminService.createFeeStructure(ctx.tenantId, req.body);
    return res.status(201).json(successResponse(feeStructure, 'Fee structure created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getFeeStructures(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { feeStructures, total } = await AdminService.listFeeStructures(ctx.tenantId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(feeStructures, total, page, limit);
    return res.json(successResponse(data, 'Fee structures retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateFeeStructure(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const feeStructure = await AdminService.updateFeeStructure(ctx.tenantId, req.params.id, req.body);
    return res.json(successResponse(feeStructure, 'Fee structure updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getFeeDefaulters(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { feeRecords, total } = await AdminService.getFeeDefaulters(ctx.tenantId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(feeRecords, total, page, limit);
    return res.json(successResponse(data, 'Fee defaulters retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function createFeeRecord(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const feeRecord = await AdminService.createFeeRecord(ctx.tenantId, req.body);
    return res.status(201).json(successResponse(feeRecord, 'Fee payment recorded'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getFeeRecords(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { feeRecords, total } = await AdminService.listFeeRecords(ctx.tenantId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(feeRecords, total, page, limit);
    return res.json(successResponse(data, 'Fee records retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Reports
// ═══════════════════════════════════════════════════

export async function getEnrollmentReport(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const report = await AdminService.getEnrollmentReport(ctx.tenantId);
    return res.json(successResponse(report, 'Enrollment report retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getAttendanceReport(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;
    const report = await AdminService.getAttendanceReport(ctx.tenantId, from, to);
    return res.json(successResponse(report, 'Attendance report retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getFeeCollectionReport(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;
    const report = await AdminService.getFeeCollectionReport(ctx.tenantId, from, to);
    return res.json(successResponse(report, 'Fee collection report retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getTeacherPerformanceReport(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const report = await AdminService.getTeacherPerformanceReport(ctx.tenantId);
    return res.json(successResponse(report, 'Teacher performance report retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════════

export async function sendNotification(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { targetRole, targetUserIds, title, body, type, targetClassId, data } = req.body;
    const result = await AdminService.sendNotifications(
      ctx.tenantId,
      ctx.userId,
      targetRole,
      targetUserIds,
      title,
      body,
      type,
      targetClassId,
      data
    );
    return res.status(201).json(successResponse(result, `${result.count} notifications sent`));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getNotifications(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { notifications, total } = await AdminService.listNotifications(ctx.tenantId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(notifications, total, page, limit);
    return res.json(successResponse(data, 'Notifications retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Settings
// ═══════════════════════════════════════════════════

export async function getSettings(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const settings = await AdminService.getSettings(ctx.tenantId);
    return res.json(successResponse(settings, 'Settings retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function updateSettings(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    // Support single setting or batch update
    const settings = Array.isArray(req.body) ? req.body : [req.body];
    const results = await Promise.all(
      settings.map((s: any) => AdminService.updateSetting(ctx.tenantId, s))
    );
    return res.json(successResponse(results, 'Settings updated'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}
