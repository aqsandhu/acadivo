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
  category: NotificationCategory;
  data?: Record<string, unknown>;
  relatedId?: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  sentViaPush: boolean;
  fcmToken?: string;
  createdAt: Date;
}

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
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
  userId: string;
  tenantId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  categories: Record<NotificationCategory, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
