/**
 * Notification domain types
 */

export interface Notification {
  id: string;
  userId: string;
  tenantId: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  data?: Record<string, unknown>;
  senderId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationType {
  ANNOUNCEMENT = "ANNOUNCEMENT",
  MESSAGE = "MESSAGE",
  REPORT_READY = "REPORT_READY",
  FEE_DUE = "FEE_DUE",
  ATTENDANCE_ALERT = "ATTENDANCE_ALERT",
  HOMEWORK = "HOMEWORK",
  RESULT = "RESULT",
  TIMETABLE_CHANGE = "TIMETABLE_CHANGE",
  ADVERTISEMENT = "ADVERTISEMENT",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum NotificationCategory {
  ATTENDANCE = "ATTENDANCE",
  HOMEWORK = "HOMEWORK",
  FEE = "FEE",
  RESULT = "RESULT",
  MESSAGE = "MESSAGE",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  SYSTEM = "SYSTEM",
  EVENT = "EVENT",
}

export interface NotificationPreference {
  id?: string;
  userId: string;
  tenantId: string;
  category: NotificationCategory;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
