# Acadivo Socket.io Event Reference

Complete list of events supported by the Acadivo real-time Socket.io server.

---

## Client -> Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connection` | `{ auth: { token: string } }` | Connect with JWT token in handshake auth |
| `message:private` | `{ receiverId, content, messageType?, attachments?, replyToId? }` | Send a private message to another user |
| `message:group` | `{ receiverIds[], content, messageType?, attachments?, replyToId? }` | Send a group message to multiple users |
| `message:typing` | `{ receiverId, isTyping: boolean }` | Send typing indicator to a specific user |
| `message:read` | `{ senderId, messageIds[] }` | Mark messages as read and notify sender |
| `message:history` | `{ userId, page?, pageSize? }` | Fetch conversation history with a user |
| `notification:subscribe` | `{}` | (Re)subscribe to personal notification room |
| `notification:mark-read` | `{ notificationIds[] }` | Mark notifications as read |
| `notification:get-unread` | `{}` | Request unread notification count |
| `join:room` | `{ room: string }` | Join a specific custom room |
| `leave:room` | `{ room: string }` | Leave a specific custom room |
| `disconnect:request` | `{ reason? }` | Request server-side disconnection |

---

## Server -> Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ socketId, user, onlineUsers[], timestamp }` | Connection successful, includes user data and online list |
| `message:receive` | `{ id, senderId, senderName, senderRole, receiverId, content, messageType, attachments, replyToId, createdAt, isRead }` | New message received from another user |
| `message:sent` | `{ ...message, status: "delivered" }` | Confirmation that your message was sent |
| `message:typing` | `{ senderId, senderName, senderRole, isTyping, timestamp }` | Another user is typing |
| `message:read` | `{ readerId, readerName, messageIds[], readAt }` | Your messages were read by the recipient |
| `message:history` | `{ userId, page, pageSize, messages[] }` | Conversation history response |
| `notification:receive` | `{ id, title, body, type, data, senderId, tenantId, createdAt }` | New notification received |
| `notification:unread` | `{ count, notifications[] }` | Unread notification count and list |
| `presence:update` | `{ userId, tenantId, status: "online" \| "offline", lastSeen? }` | User online/offline status change |
| `room:joined` | `{ room }` | Confirmation of room join |
| `room:left` | `{ room }` | Confirmation of room leave |
| `error` | `{ code, message }` | Error occurred on the server |

---

## Room Naming Convention

| Room Pattern | Purpose |
|--------------|---------|
| `user:{userId}` | Personal room for direct messages to a user |
| `tenant:{tenantId}` | School-wide broadcast room |
| `role:{role}:{tenantId}` | Role-specific room (e.g., `role:TEACHER:tenant_123`) |
| `notification:{userId}` | Personal notification delivery room |

---

## Authentication

Connect to the socket server with a JWT token:

```javascript
const socket = io("http://localhost:5001", {
  auth: {
    token: "<jwt_access_token>",
  },
  transports: ["websocket", "polling"],
});
```

The server verifies the token on connection and attaches user info (`userId`, `role`, `tenantId`, `uniqueId`, `email`, `name`) to the socket.

---

## Presence / Online Status

- Users are automatically tracked as `online` on connection and `offline` on disconnect.
- Online status is stored in Redis with TTL (default 300s) for automatic expiry.
- The server broadcasts `presence:update` events to the tenant room when users come online or go offline.
- Heartbeat intervals refresh the TTL while the user remains connected.

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PAYLOAD` | Missing or invalid event payload |
| `AUTHENTICATION_ERROR` | JWT verification failed |
| `MESSAGE_SEND_FAILED` | Could not send/save message |
| `READ_RECEIPT_FAILED` | Could not mark messages as read |
| `HISTORY_FETCH_FAILED` | Could not fetch conversation history |
| `CONNECTION_SETUP_FAILED` | Room join or presence setup failed |

---

## Multi-Node Scaling

The server uses `@socket.io/redis-adapter` to broadcast events across multiple Node.js instances. All rooms and presence data are synchronized through Redis.

---

## Firebase Push Integration

When a user is offline (no active socket connection), notifications are also sent via Firebase Cloud Messaging (FCM) using stored device tokens. FCM is initialized automatically if `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are provided.
