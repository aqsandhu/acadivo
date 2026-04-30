import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import * as controller from "./communication.controller";
import * as validator from "./communication.validator";

const router = Router();

// All communication routes require authentication
router.use(authenticate);

// ── Notifications ─────────────────────────────
router.get("/notifications", controller.getNotifications);
router.get("/notifications/unread-count", controller.getUnreadNotificationCount);
router.put("/notifications/:id/read", controller.markNotificationRead);
router.put("/notifications/read-all", controller.markAllNotificationsRead);
router.delete("/notifications/:id", controller.deleteNotification);

// ── Announcements ─────────────────────────────
router.get("/announcements", controller.getAnnouncements);
router.get("/announcements/:id", controller.getAnnouncementById);
router.post(
  "/announcements",
  authorize("PRINCIPAL", "ADMIN", "SUPER_ADMIN"),
  validator.createAnnouncement,
  validateRequest,
  controller.createAnnouncement
);
router.put(
  "/announcements/:id",
  authorize("PRINCIPAL", "ADMIN", "SUPER_ADMIN"),
  validator.updateAnnouncement,
  validateRequest,
  controller.updateAnnouncement
);
router.put("/announcements/:id/pin", authorize("PRINCIPAL", "ADMIN", "SUPER_ADMIN"), controller.pinAnnouncement);
router.delete("/announcements/:id", authorize("PRINCIPAL", "ADMIN", "SUPER_ADMIN"), controller.deleteAnnouncement);
router.get(
  "/announcements/school/:schoolId",
  authorize("SUPER_ADMIN"),
  controller.getSchoolAnnouncements
);

// ── Messages (Chat) ───────────────────────────
router.get("/messages/conversations", controller.getConversations);
router.get("/messages/conversations/:userId", controller.getMessagesWithUser);
router.post("/messages", validator.sendMessage, validateRequest, controller.sendMessage);
router.post(
  "/messages/group",
  authorize("PRINCIPAL", "ADMIN", "TEACHER"),
  validator.sendGroupMessage,
  validateRequest,
  controller.sendGroupMessage
);
router.put("/messages/:id/read", controller.markMessageRead);
router.delete("/messages/:id", controller.deleteMessage);
router.get("/messages/unread-count", controller.getUnreadMessageCount);

export default router;
