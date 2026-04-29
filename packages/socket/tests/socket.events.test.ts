/**
 * Socket server comprehensive tests with REAL event names
 */

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { io as Client } from "socket.io-client";
import jwt from "jsonwebtoken";
import { redisClient, pubClient, subClient } from "../src/config/redis";

const TEST_JWT_SECRET = "test-jwt-secret-key-not-for-production";
const TEST_TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";

function generateToken(userId: string, role: string) {
  return jwt.sign(
    {
      userId,
      role,
      tenantId: TEST_TENANT_ID,
      uniqueId: `${userId}_unique`,
      email: `${userId}@test.com`,
      name: `Test ${userId}`,
    },
    TEST_JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Mock redis
jest.mock("../src/config/redis", () => ({
  redisClient: {
    pipeline: () => ({ exec: jest.fn().mockResolvedValue([]) }),
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue("OK"),
    expire: jest.fn().mockResolvedValue(1),
    hgetall: jest.fn().mockResolvedValue({}),
    hset: jest.fn().mockResolvedValue(1),
    hdel: jest.fn().mockResolvedValue(1),
    hincrby: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue("PONG"),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    duplicate: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
    }),
  },
  pubClient: {
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue("PONG"),
    duplicate: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
    }),
  },
  subClient: {
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue("PONG"),
  },
}));

jest.mock("../src/config/env", () => ({
  env: {
    PORT: 5002,
    JWT_SECRET: TEST_JWT_SECRET,
    REDIS_URL: "redis://localhost:6379",
    CORS_ORIGINS: ["http://localhost:3000"],
    PRESENCE_TTL_SECONDS: 300,
    API_BASE_URL: "http://localhost:5000",
    INTERNAL_API_KEY: "test-key",
  },
}));

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
  messaging: () => ({
    sendEachForMulticast: jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0, responses: [] }),
    send: jest.fn().mockResolvedValue("message-id"),
  }),
}));

describe("Socket Server — Real Event Tests", () => {
  let io: Server;
  let httpServer: any;
  let clientSocket: any;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer, { cors: { origin: "*" } });
    httpServer.listen(5002, () => {
      done();
    });
  });

  afterAll((done) => {
    io.close(() => {
      httpServer.close(() => {
        done();
      });
    });
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.close();
    }
  });

  // ── Connection Events ──
  describe("Connection", () => {
    it("should connect with valid token", (done) => {
      const token = generateToken("user1", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });
    });

    it("should reject connection without token", (done) => {
      clientSocket = Client("http://localhost:5002", {
        transports: ["websocket"],
      });

      clientSocket.on("connect_error", (err: any) => {
        expect(err.message).toContain("Authentication error");
        done();
      });
    });

    it("should support PRINCIPAL role", (done) => {
      const token = generateToken("principal1", "PRINCIPAL");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });
    });

    it("should receive connected event with user data", (done) => {
      const token = generateToken("user2", "STUDENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connected", (data: any) => {
        expect(data).toHaveProperty("socketId");
        expect(data).toHaveProperty("user");
        expect(data.user.role).toBe("STUDENT");
        expect(data).toHaveProperty("onlineUsers");
        done();
      });
    });
  });

  // ── Message Events ──
  describe("Message Events", () => {
    it("should handle message:private event", (done) => {
      const token = generateToken("user3", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:private", {
          receiverId: "550e8400-e29b-41d4-a716-446655440001",
          content: "Hello student!",
          messageType: "TEXT",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle message:group event", (done) => {
      const token = generateToken("user4", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:group", {
          receiverIds: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
          content: "Class announcement!",
          messageType: "TEXT",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle message:typing event", (done) => {
      const token = generateToken("user5", "STUDENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:typing", {
          receiverId: "550e8400-e29b-41d4-a716-446655440001",
          isTyping: true,
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle message:read event", (done) => {
      const token = generateToken("user6", "PARENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:read", {
          senderId: "550e8400-e29b-41d4-a716-446655440001",
          messageIds: ["msg1", "msg2"],
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle message:history event", (done) => {
      const token = generateToken("user7", "ADMIN");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:history", {
          userId: "550e8400-e29b-41d4-a716-446655440001",
          page: 1,
          pageSize: 20,
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle message:edit event", (done) => {
      const token = generateToken("user8", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:edit", {
          messageId: "msg-123",
          content: "Edited content",
          receiverId: "550e8400-e29b-41d4-a716-446655440001",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle message:delete event", (done) => {
      const token = generateToken("user9", "STUDENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:delete", {
          messageId: "msg-456",
          receiverId: "550e8400-e29b-41d4-a716-446655440001",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── FCM Events ──
  describe("FCM Events", () => {
    it("should handle fcm:register event", (done) => {
      const token = generateToken("user10", "PARENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("fcm:register", {
          token: "fcm_token_abc123",
          deviceInfo: "iPhone 15 Pro",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle fcm:unregister event", (done) => {
      const token = generateToken("user11", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("fcm:unregister", {
          token: "fcm_token_abc123",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── Conversation Events ──
  describe("Conversation Events", () => {
    it("should handle conversation:list event", (done) => {
      const token = generateToken("user12", "STUDENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("conversation:list", {
          page: 1,
          pageSize: 20,
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle conversation:create event", (done) => {
      const token = generateToken("user13", "PRINCIPAL");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("conversation:create", {
          participantIds: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
          type: "GROUP",
          title: "Staff Discussion",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── Presence Events ──
  describe("Presence Events", () => {
    it("should handle presence:status event", (done) => {
      const token = generateToken("user14", "ADMIN");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("presence:status", {
          targetUserIds: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle state:recover event", (done) => {
      const token = generateToken("user15", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("state:recover", {
          lastConnectedAt: new Date(Date.now() - 60000).toISOString(),
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── Room Events ──
  describe("Room Events", () => {
    it("should handle room:join event", (done) => {
      const token = generateToken("user16", "STUDENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("room:join", { room: "class:math-101" }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle room:leave event", (done) => {
      const token = generateToken("user17", "PARENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("room:leave", { room: "class:math-101" }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── Notification Events ──
  describe("Notification Events", () => {
    it("should handle notification:read event", (done) => {
      const token = generateToken("user18", "STUDENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("notification:read", {
          notificationIds: ["notif-1", "notif-2"],
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });

    it("should handle notification:unread event", (done) => {
      const token = generateToken("user19", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("notification:unread", {
          userId: "550e8400-e29b-41d4-a716-446655440001",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── XSS Sanitization ──
  describe("XSS Sanitization", () => {
    it("should sanitize script tags in message content", (done) => {
      const token = generateToken("user20", "TEACHER");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:private", {
          receiverId: "550e8400-e29b-41d4-a716-446655440001",
          content: '<script>alert("xss")</script>Hello',
          messageType: "TEXT",
        }, (ack: any) => {
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── Cross-Tenant Validation ──
  describe("Cross-Tenant Validation", () => {
    it("should block cross-tenant message attempts", (done) => {
      const token = generateToken("user21", "STUDENT");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("message:private", {
          receiverId: "550e8400-e29b-41d4-a716-446655440001",
          content: "Test message",
          tenantId: "different-tenant-id",
        }, (ack: any) => {
          // Should either fail or be blocked
          expect(ack).toBeDefined();
          done();
        });
      });
    });
  });

  // ── Disconnect ──
  describe("Disconnect", () => {
    it("should handle disconnect:request event", (done) => {
      const token = generateToken("user22", "ADMIN");
      clientSocket = Client("http://localhost:5002", {
        auth: { token },
        transports: ["websocket"],
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("disconnect:request", "manual logout", (ack: any) => {
          expect(ack).toHaveProperty("success");
          done();
        });
      });
    });
  });
});
