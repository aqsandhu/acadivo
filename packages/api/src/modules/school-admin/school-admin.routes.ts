// ═══════════════════════════════════════════════════
// School Admin Routes
// ═══════════════════════════════════════════════════

import { Router } from 'express';
import * as AdminController from './school-admin.controller';

const router = Router();

// ── Dashboard ──
router.get('/dashboard', AdminController.getDashboard);

// ── Teachers ──
router.post('/teachers', AdminController.createTeacher);
router.get('/teachers', AdminController.getTeachers);
router.get('/teachers/:id', AdminController.getTeacherById);
router.put('/teachers/:id', AdminController.updateTeacher);
router.delete('/teachers/:id', AdminController.deleteTeacher);

// ── Students ──
router.post('/students', AdminController.createStudent);
router.get('/students', AdminController.getStudents);
router.get('/students/:id', AdminController.getStudentById);
router.put('/students/:id', AdminController.updateStudent);
router.delete('/students/:id', AdminController.deleteStudent);

// ── Parents ──
router.post('/parents', AdminController.createParent);
router.get('/parents', AdminController.getParents);
router.get('/parents/:id', AdminController.getParentById);
router.put('/parents/:id', AdminController.updateParent);

// ── Bulk Import ──
router.post('/bulk-import', AdminController.bulkImport);

// ── Classes ──
router.post('/classes', AdminController.createClass);
router.get('/classes', AdminController.getClasses);
router.get('/classes/:id', AdminController.getClassById);
router.put('/classes/:id', AdminController.updateClass);
router.delete('/classes/:id', AdminController.deleteClass);

// ── Sections ──
router.post('/sections', AdminController.createSection);
router.put('/sections/:id', AdminController.updateSection);
router.delete('/sections/:id', AdminController.deleteSection);

// ── Subjects ──
router.post('/subjects', AdminController.createSubject);
router.get('/subjects', AdminController.getSubjects);
router.put('/subjects/:id', AdminController.updateSubject);
router.delete('/subjects/:id', AdminController.deleteSubject);

// ── Teacher Subject Assignments ──
router.post('/assign-subject', AdminController.assignSubject);
router.get('/teacher-assignments', AdminController.getTeacherAssignments);

// ── Timetable ──
router.post('/timetable', AdminController.createTimetableEntry);
router.get('/timetable', AdminController.getTimetable);
router.get('/timetable/class/:classId', AdminController.getClassTimetable);
router.put('/timetable/:id', AdminController.updateTimetableEntry);
router.delete('/timetable/:id', AdminController.deleteTimetableEntry);

// ── Announcements ──
router.post('/announcements', AdminController.createAnnouncement);
router.get('/announcements', AdminController.getAnnouncements);
router.put('/announcements/:id', AdminController.updateAnnouncement);
router.delete('/announcements/:id', AdminController.deleteAnnouncement);

// ── Fee Structure ──
router.post('/fee-structure', AdminController.createFeeStructure);
router.get('/fee-structure', AdminController.getFeeStructures);
router.put('/fee-structure/:id', AdminController.updateFeeStructure);

// ── Fee Defaulters ──
router.get('/fee-defaulters', AdminController.getFeeDefaulters);

// ── Fee Records ──
router.post('/fee-record', AdminController.createFeeRecord);
router.get('/fee-records', AdminController.getFeeRecords);

// ── Reports ──
router.get('/reports/enrollment', AdminController.getEnrollmentReport);
router.get('/reports/attendance', AdminController.getAttendanceReport);
router.get('/reports/fee-collection', AdminController.getFeeCollectionReport);
router.get('/reports/teacher-performance', AdminController.getTeacherPerformanceReport);

// ── Notifications ──
router.post('/notifications', AdminController.sendNotification);
router.get('/notifications', AdminController.getNotifications);

// ── Settings ──
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

export default router;
