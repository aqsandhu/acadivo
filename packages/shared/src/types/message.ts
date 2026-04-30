/**
 * Messaging / Communication domain types
 */

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  conversationId?: string;
  tenantId: string;
  content: string;
  messageType: MessageType;
  attachments?: MessageAttachment[];
  replyToId?: string;
  isRead: boolean;
  readAt?: Date;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  VOICE = "VOICE",
  VIDEO = "VIDEO",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  tenantId: string;
  type: ConversationType;
  title?: string;
  classId?: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  isActive: boolean;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConversationType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
  CLASS = "CLASS",
  SCHOOL = "SCHOOL",
}

export interface ConversationMember {
  id: string;
  tenantId: string;
  conversationId: string;
  userId?: string;
  studentId?: string;
  parentId?: string;
  role: string;
  joinedAt: Date;
  leftAt?: Date;
  unreadCount: number;
  lastReadAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageReadReceipt {
  id: string;
  tenantId: string;
  messageId: string;
  userId?: string;
  studentId?: string;
  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}
