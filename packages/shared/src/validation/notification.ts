/**
 * Notification validation schemas
 */

import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  type: z.enum([
    "ANNOUNCEMENT",
    "MESSAGE",
    "REPORT_READY",
    "FEE_DUE",
    "ATTENDANCE_ALERT",
    "HOMEWORK",
    "RESULT",
    "TIMETABLE_CHANGE",
    "ADVERTISEMENT",
  ]),
  category: z.enum(["ATTENDANCE", "HOMEWORK", "FEE", "RESULT", "MESSAGE", "ANNOUNCEMENT", "SYSTEM", "EVENT"]),
  data: z.record(z.unknown()).optional(),
  relatedId: z.string().optional(),
  link: z.string().url().optional(),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1),
});

export const notificationPreferenceSchema = z.object({
  channels: z.object({
    push: z.boolean().default(true),
    email: z.boolean().default(false),
    sms: z.boolean().default(false),
    inApp: z.boolean().default(true),
  }),
  categories: z.record(z.boolean()).optional(),
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
});
