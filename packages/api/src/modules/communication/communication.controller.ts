import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as communicationService from "./communication.service";
import * as notificationService from "./notification.service";

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await communicationService.getMyNotifications(userId, tenantId, {
    type: req.query.type as any,
    isRead: req.query.isRead !== undefined ? req.query.isRead === "true" : undefined,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.notifications, page, pageSize, result.totalCount, "Notifications fetched");
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
  return ApiResponse.success(res, notification, "Notification marked as read");
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await notificationService.markAllAsRead(req.user!.userId);
  return ApiResponse.success(res, { updatedCount: result.count }, "All notifications marked as read");
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await communicationService.deleteNotification(req.params.id, req.user!.userId);
  return ApiResponse.success(res, result, "Notification deleted");
});

export const getUnreadNotificationCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  return ApiResponse.success(res, { count }, "Unread count fetched");
});

// ──────────────────────────────────────────────
// Announcements
// ──────────────────────────────────────────────

export const getAnnouncements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await communicationService.getAnnouncements(
    tenantId,
    req.user!.role,
    req.query.classId as string,
    {
      priority: req.query.priority as any,
      targetAudience: req.query.targetAudience as any,
      fromDate: req.query.fromDate as string,
      toDate: req.query.toDate as string,
      page,
      pageSize,
    }
  );

  return ApiResponse.paginated(res, result.announcements, page, pageSize, result.totalCount, "Announcements fetched");
});

export const getAnnouncementById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const announcement = await communicationService.getAnnouncementById(req.params.id, tenantId);
  return ApiResponse.success(res, announcement, "Announcement fetched");
});

export const createAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const announcement = await communicationService.createAnnouncement(
    tenantId,
    req.user!.userId,
    req.body
  );
  return ApiResponse.success(res, announcement, "Announcement created", 201);
});

export const updateAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const announcement = await communicationService.updateAnnouncement(
    req.params.id,
    tenantId,
    req.body
  );
  return ApiResponse.success(res, announcement, "Announcement updated");
});

export const pinAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const isPinned = req.body.isPinned ?? true;
  const announcement = await communicationService.pinAnnouncement(
    req.params.id,
    tenantId,
    isPinned
  );
  return ApiResponse.success(res, announcement, "Announcement pin status updated");
});

export const deleteAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await communicationService.deleteAnnouncement(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Announcement deleted");
});

export const getSchoolAnnouncements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const result = await communicationService.getSchoolAnnouncements(
    req.params.schoolId,
    page,
    pageSize
  );

  return ApiResponse.paginated(res, result.announcements, page, pageSize, result.totalCount, "School announcements fetched");
});

// ──────────────────────────────────────────────
// Messages (Chat)
// ──────────────────────────────────────────────

export const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const result = await communicationService.getConversations(userId, tenantId);
  return ApiResponse.success(res, result.conversations, "Conversations fetched");
});

export const getMessagesWithUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 50;

  const result = await communicationService.getMessagesWithUser(
    userId,
    req.params.userId,
    tenantId,
    page,
    pageSize
  );

  return ApiResponse.paginated(res, result.messages, page, pageSize, result.totalCount, "Messages fetched");
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const message = await communicationService.sendMessage(tenantId, req.user!.userId, req.body);
  return ApiResponse.success(res, message, "Message sent", 201);
});

export const markMessageRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const message = await communicationService.markMessageAsRead(
    req.params.id,
    req.user!.userId,
    tenantId
  );
  return ApiResponse.success(res, message, "Message marked as read");
});

export const deleteMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const result = await communicationService.softDeleteMessage(
    req.params.id,
    req.user!.userId,
    tenantId
  );
  return ApiResponse.success(res, result, "Message deleted");
});

export const getUnreadMessageCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId || (req.query.tenantId as string);
  const result = await communicationService.getUnreadMessageCount(userId, tenantId);
  return ApiResponse.success(res, result, "Unread message count fetched");
});

export const sendGroupMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await communicationService.sendGroupMessage(tenantId, req.user!.userId, req.body);
  return ApiResponse.success(res, result, "Group message sent", 201);
});
