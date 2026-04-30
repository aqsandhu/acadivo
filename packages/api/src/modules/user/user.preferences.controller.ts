// ═══════════════════════════════════════════════════
// User Preferences Controller
// GET /preferences — get current preferences
// PUT /preferences — update preferences (sound, notification types, language)
// ═══════════════════════════════════════════════════

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

export interface UserPreferences {
  notificationSound?: boolean;
  notificationTypes?: string[];
  language?: string;
  theme?: "light" | "dark" | "system";
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  notificationSound: true,
  notificationTypes: [
    "ANNOUNCEMENT",
    "MESSAGE",
    "REPORT_READY",
    "FEE_DUE",
    "ATTENDANCE_ALERT",
    "HOMEWORK",
    "RESULT",
    "TIMETABLE_CHANGE",
    "ADVERTISEMENT",
  ],
  language: "en",
  theme: "system",
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: true,
};

// ── GET /preferences ──

export const getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user) throw ApiError.notFound("User not found");

  const stored = (user.preferences || {}) as Record<string, any>;
  const preferences = { ...DEFAULT_PREFERENCES, ...stored };

  return ApiResponse.success(res, preferences, "Preferences fetched");
});

// ── PUT /preferences ──

export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const body = req.body as Partial<UserPreferences>;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  if (!user) throw ApiError.notFound("User not found");

  const stored = (user.preferences || {}) as Record<string, any>;

  // Validate notificationTypes if provided
  if (body.notificationTypes !== undefined) {
    const validTypes = [
      "ANNOUNCEMENT",
      "MESSAGE",
      "REPORT_READY",
      "FEE_DUE",
      "ATTENDANCE_ALERT",
      "HOMEWORK",
      "RESULT",
      "TIMETABLE_CHANGE",
      "ADVERTISEMENT",
    ];
    const invalid = body.notificationTypes.filter((t) => !validTypes.includes(t));
    if (invalid.length > 0) {
      throw ApiError.badRequest(
        `Invalid notification types: ${invalid.join(", ")}`,
        "INVALID_NOTIFICATION_TYPES"
      );
    }
  }

  // Validate language if provided
  if (body.language !== undefined && !["en", "ur"].includes(body.language)) {
    throw ApiError.badRequest("Supported languages: en, ur", "INVALID_LANGUAGE");
  }

  // Merge updates
  const updatedPreferences = {
    ...stored,
    ...(body.notificationSound !== undefined && { notificationSound: body.notificationSound }),
    ...(body.notificationTypes !== undefined && { notificationTypes: body.notificationTypes }),
    ...(body.language !== undefined && { language: body.language }),
    ...(body.theme !== undefined && { theme: body.theme }),
    ...(body.pushNotifications !== undefined && { pushNotifications: body.pushNotifications }),
    ...(body.emailNotifications !== undefined && { emailNotifications: body.emailNotifications }),
    ...(body.smsNotifications !== undefined && { smsNotifications: body.smsNotifications }),
  };

  await prisma.user.update({
    where: { id: userId },
    data: { preferences: updatedPreferences },
  });

  return ApiResponse.success(
    res,
    { ...DEFAULT_PREFERENCES, ...updatedPreferences },
    "Preferences updated"
  );
});
