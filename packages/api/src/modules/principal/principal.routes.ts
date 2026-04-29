// ═══════════════════════════════════════════════════
// Principal Routes
// ═══════════════════════════════════════════════════

import { Router } from 'express';
import * as PrincipalController from './principal.controller';

const router = Router();

// ── Dashboard ──
router.get('/dashboard', PrincipalController.getDashboard);

// ── Users ──
router.get('/teachers', PrincipalController.getTeachers);
router.get('/students', PrincipalController.getStudents);
router.get('/parents', PrincipalController.getParents);
router.get('/admins', PrincipalController.getAdmins);

// ── Announcements ──
router.post('/announcements', PrincipalController.createAnnouncement);
router.get('/announcements', PrincipalController.getAnnouncements);
router.delete('/announcements/:id', PrincipalController.deleteAnnouncement);

// ── Messages ──
router.post('/messages', PrincipalController.sendMessage);
router.get('/messages', PrincipalController.getMessages);

// ── Notifications ──
router.post('/notifications', PrincipalController.sendBulkNotification);

// ── Attendance ──
router.get('/attendance-summary', PrincipalController.getAttendanceSummary);

// ── Fee ──
router.get('/fee-summary', PrincipalController.getFeeSummary);

// ── Performance ──
router.get('/performance', PrincipalController.getPerformance);

// ── Reports ──
router.get('/reports', PrincipalController.getReports);

export default router;
