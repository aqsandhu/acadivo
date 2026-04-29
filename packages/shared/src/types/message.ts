/**
 * Messaging / Communication domain types
 */

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  tenantId: string;
  content: string;
  messageType: MessageType;
  attachments?: MessageAttachment[];
  replyToId?: string;
  isRead: boolean;
  readAt?: Date;
  editedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  AUDIO = "AUDIO",
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
  lastMessageAt?: Date;
  lastMessagePreview?: string;
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

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}
