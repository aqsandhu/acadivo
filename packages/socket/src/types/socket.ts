/**
 * Socket-specific TypeScript types and interfaces
 */

import { Socket } from "socket.io";
import { UserRole } from "@acadivo/shared";

export interface SocketUser {
  userId: string;
  role: UserRole;
  tenantId: string;
  uniqueId: string;
  email: string;
  name: string;
}

export interface AuthenticatedSocket extends Socket {
  user: SocketUser;
}

export interface PrivateMessageData {
  receiverId: string;
  content: string;
  messageType?: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "VIDEO";
  attachments?: MessageAttachment[];
  replyToId?: string;
}

export interface GroupMessageData {
  receiverIds: string[];
  content: string;
  messageType?: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "VIDEO";
  attachments?: MessageAttachment[];
  replyToId?: string;
}

export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size?: number;
}

export interface TypingData {
  receiverId: string;
  isTyping: boolean;
}

export interface ReadReceiptData {
  senderId: string;
  messageIds: string[];
}

export interface HistoryQueryData {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: {
    relatedId?: string;
    link?: string;
    action?: string;
  };
  senderId?: string;
  tenantId?: string;
  createdAt: string;
}

export interface NotificationMarkReadData {
  notificationIds: string[];
}

export interface NotificationUnreadData {
  userId: string;
}

export interface RoomJoinData {
  room: string;
}

export interface RoomLeaveData {
  room: string;
}

export interface PresenceUpdate {
  userId: string;
  tenantId: string;
  status: "online" | "offline";
  lastSeen?: string;
}
