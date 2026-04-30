/**
 * @file src/modules/super-admin/super-admin.routes.ts
 * @description Super Admin route definitions with RBAC protection.
 */

import { Router } from "express";
import * as controller from "./super-admin.controller";
import * as validator from "./super-admin.validator";
import { validateBody, validateQuery } from "../../middleware/validateRequest";
import { authMiddleware } from "../../middleware/auth";
import { rbacMiddleware } from "../../middleware/rbac";
import { tenantGuard } from "../../middleware/tenantGuard";
import { uploadSingle } from "../../middleware/uploadMiddleware";
import { UserRole } from "@prisma/client";

const router = Router();

// All super-admin routes require authentication + SUPER_ADMIN role
router.use(authMiddleware);
router.use(rbacMiddleware([UserRole.SUPER_ADMIN]));

// Dashboard
router.get("/dashboard", controller.getDashboard);

// Schools
router.get("/schools", controller.listSchools);
router.get("/schools/:id", controller.getSchool);
router.post("/schools", uploadSingle("logo"), validateBody(validator.onboardSchoolValidator), controller.onboardSchool);
router.put("/schools/:id", uploadSingle("logo"), validateBody(validator.updateSchoolValidator), controller.updateSchool);
router.put("/schools/:id/status", validateBody(validator.updateSchoolStatusValidator), controller.updateSchoolStatus);
router.delete("/schools/:id", controller.deleteSchool);

// Subscriptions
router.get("/subscriptions", controller.listSubscriptions);
router.put("/subscriptions/:id", validateBody(validator.updateSubscriptionValidator), controller.updateSubscription);

// Analytics
router.get("/analytics", controller.getAnalytics);

// Users
router.get("/users", controller.listUsers);

// Announcements
router.post("/announcements", validateBody(validator.createAnnouncementValidator), controller.createAnnouncement);

// Advertisements
router.get("/advertisements", controller.listAds);
router.post("/advertisements", uploadSingle("image"), validateBody(validator.createAdValidator), controller.createAd);
router.put("/advertisements/:id", uploadSingle("image"), validateBody(validator.updateAdValidator), controller.updateAd);
router.delete("/advertisements/:id", controller.deleteAd);
router.get("/advertisements/:id/stats", controller.getAdStats);
router.post("/ads/:id/toggle", controller.toggleAd);

// Bulk Users
router.post("/users/bulk", controller.bulkCreateUsers);

// System-wide Settings
router.get("/settings", controller.getSystemSettings);
router.put("/settings", validateBody(validator.updateSystemSettingValidator), controller.updateSystemSetting);
router.delete("/settings/:key", controller.deleteSystemSetting);

export default router;
