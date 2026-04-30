/**
 * Message validation schemas
 */

import { z } from "zod";

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
  messageType: z.enum(["TEXT", "IMAGE", "FILE", "VOICE", "VIDEO", "ANNOUNCEMENT"]).default("TEXT"),
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string(),
    size: z.number().optional(),
  })).max(10).optional(),
  replyToId: z.string().uuid().optional(),
}).refine((data) => data.receiverId || data.groupId, {
  message: "Either receiverId or groupId is required",
  path: ["receiverId"],
});

export const editMessageSchema = z.object({
  messageId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export const deleteMessageSchema = z.object({
  messageId: z.string().uuid(),
});

export const createConversationSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(2).max(500),
  type: z.enum(["DIRECT", "GROUP", "CLASS", "SCHOOL"]),
  title: z.string().max(200).optional(),
});

export const typingIndicatorSchema = z.object({
  conversationId: z.string().uuid(),
  isTyping: z.boolean(),
});
