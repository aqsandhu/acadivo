/**
 * Chat service for private and group messaging, typing indicators, and read receipts
 */

import { Server, Socket } from "socket.io";
import { AuthenticatedSocket, PrivateMessageData, GroupMessageData, TypingData, ReadReceiptData, HistoryQueryData } from "../types/socket";
import { saveMessage, markMessagesRead, getConversation } from "./api.service";
import { getUserRoom } from "./room.service";
import { sendUserNotification } from "./notification.service";
import { logger } from "../utils/logger";

export async function handlePrivateMessage(
  io: Server,
  socket: AuthenticatedSocket,
  data: PrivateMessageData
): Promise<void> {
  const sender = socket.user;
  const { receiverId, content, messageType = "TEXT", attachments, replyToId } = data;

  if (!receiverId || !content?.trim()) {
    socket.emit("error", { code: "INVALID_PAYLOAD", message: "receiverId and content are required" });
    return;
  }

  try {
    // Save message to database via API
    const savedMessage = await saveMessage({
      senderId: sender.userId,
      receiverId,
      content: content.trim(),
      messageType,
      attachments: attachments || [],
      replyToId: replyToId || null,
      tenantId: sender.tenantId,
      createdAt: new Date().toISOString(),
    });

    const messagePayload = {
      id: savedMessage?.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      senderId: sender.userId,
      senderName: sender.name,
      senderRole: sender.role,
      receiverId,
      content: content.trim(),
      messageType,
      attachments: attachments || [],
      replyToId: replyToId || null,
      tenantId: sender.tenantId,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Emit to receiver's personal room
    io.to(getUserRoom(receiverId)).emit("message:receive", messagePayload);

    // Emit confirmation to sender
    socket.emit("message:sent", {
      ...messagePayload,
      status: "delivered",
    });

    // Create notification for receiver
    await sendUserNotification(io, receiverId, {
      id: `notif_${Date.now()}`,
      title: `New message from ${sender.name || sender.role}`,
      body: content.trim().slice(0, 100),
      type: "CHAT_MESSAGE",
      data: {
        relatedId: messagePayload.id,
        link: `/chat/${sender.userId}`,
        action: "OPEN_CHAT",
      },
      senderId: sender.userId,
      tenantId: sender.tenantId,
      createdAt: new Date().toISOString(),
    });

    logger.info(`Private message sent from ${sender.userId} to ${receiverId}`);
  } catch (error) {
    logger.error("Error sending private message:", error);
    socket.emit("error", { code: "MESSAGE_SEND_FAILED", message: "Failed to send message" });
  }
}

export async function handleGroupMessage(
  io: Server,
  socket: AuthenticatedSocket,
  data: GroupMessageData
): Promise<void> {
  const sender = socket.user;
  const { receiverIds, content, messageType = "TEXT", attachments, replyToId } = data;

  if (!receiverIds?.length || !content?.trim()) {
    socket.emit("error", { code: "INVALID_PAYLOAD", message: "receiverIds and content are required" });
    return;
  }

  try {
    const savedMessage = await saveMessage({
      senderId: sender.userId,
      receiverIds,
      content: content.trim(),
      messageType,
      attachments: attachments || [],
      replyToId: replyToId || null,
      tenantId: sender.tenantId,
      isGroup: true,
      createdAt: new Date().toISOString(),
    });

    const messagePayload = {
      id: savedMessage?.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      senderId: sender.userId,
      senderName: sender.name,
      senderRole: sender.role,
      receiverIds,
      content: content.trim(),
      messageType,
      attachments: attachments || [],
      replyToId: replyToId || null,
      tenantId: sender.tenantId,
      isGroup: true,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Emit to all receiver rooms
    receiverIds.forEach((receiverId) => {
      io.to(getUserRoom(receiverId)).emit("message:receive", messagePayload);
    });

    // Emit confirmation to sender
    socket.emit("message:sent", {
      ...messagePayload,
      status: "delivered",
    });

    logger.info(`Group message sent from ${sender.userId} to ${receiverIds.length} recipients`);
  } catch (error) {
    logger.error("Error sending group message:", error);
    socket.emit("error", { code: "MESSAGE_SEND_FAILED", message: "Failed to send group message" });
  }
}

export function handleTyping(
  socket: AuthenticatedSocket,
  data: TypingData
): void {
  const sender = socket.user;
  const { receiverId, isTyping } = data;

  if (!receiverId) {
    socket.emit("error", { code: "INVALID_PAYLOAD", message: "receiverId is required" });
    return;
  }

  socket.to(getUserRoom(receiverId)).emit("message:typing", {
    senderId: sender.userId,
    senderName: sender.name,
    senderRole: sender.role,
    isTyping,
    timestamp: new Date().toISOString(),
  });
}

export async function handleReadReceipt(
  io: Server,
  socket: AuthenticatedSocket,
  data: ReadReceiptData
): Promise<void> {
  const reader = socket.user;
  const { senderId, messageIds } = data;

  if (!senderId || !messageIds?.length) {
    socket.emit("error", { code: "INVALID_PAYLOAD", message: "senderId and messageIds are required" });
    return;
  }

  try {
    // Mark messages as read in database
    await markMessagesRead(messageIds, reader.userId);

    // Notify the original sender that their messages were read
    io.to(getUserRoom(senderId)).emit("message:read", {
      readerId: reader.userId,
      readerName: reader.name,
      messageIds,
      readAt: new Date().toISOString(),
    });

    logger.debug(`Read receipt: ${reader.userId} read ${messageIds.length} messages from ${senderId}`);
  } catch (error) {
    logger.error("Error handling read receipt:", error);
    socket.emit("error", { code: "READ_RECEIPT_FAILED", message: "Failed to mark messages as read" });
  }
}

export async function getConversationHistory(
  socket: AuthenticatedSocket,
  data: HistoryQueryData
): Promise<void> {
  const user = socket.user;
  const { userId: otherUserId, page = 1, pageSize = 20 } = data;

  if (!otherUserId) {
    socket.emit("error", { code: "INVALID_PAYLOAD", message: "userId is required" });
    return;
  }

  try {
    const messages = await getConversation(user.userId, otherUserId, page, pageSize);

    socket.emit("message:history", {
      userId: otherUserId,
      page,
      pageSize,
      messages,
    });
  } catch (error) {
    logger.error("Error fetching conversation history:", error);
    socket.emit("error", { code: "HISTORY_FETCH_FAILED", message: "Failed to fetch conversation history" });
  }
}
