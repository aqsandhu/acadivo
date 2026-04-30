import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./config/database";

// Route modules
import authRoutes from "./modules/auth/auth.routes";
import teacherRoutes from "./modules/teacher/teacher.routes";
import studentRoutes from "./modules/student/student.routes";
import parentRoutes from "./modules/parent/parent.routes";
import principalRoutes from "./modules/principal/principal.routes";
import schoolAdminRoutes from "./modules/school-admin/school-admin.routes";
import superAdminRoutes from "./modules/super-admin/super-admin.routes";
import feeRoutes from "./modules/fee/fee.routes";
import resultRoutes from "./modules/result/result.routes";
import reportRoutes from "./modules/report/report.routes";
import communicationRoutes from "./modules/communication/communication.routes";
import advertisementRoutes from "./modules/advertisement/advertisement.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import qaRoutes from "./modules/qa/qa.routes";
import examRoutes from "./modules/exam/exam.routes";
import healthRoutes from "./modules/health/health.routes";
import exportRoutes from "./modules/export/export.routes";
// import importRoutes from "./modules/import/import.routes"; // Module not yet implemented
import { getPreferences, updatePreferences } from "./modules/user/user.preferences.controller";

// Middleware
import { globalErrorHandler } from "./middleware/errorHandler";
import { generalLimiter, authLimiter, uploadLimiter, writeLimiter } from "./middleware/rateLimiter";
import { authMiddleware, authorize } from "./middleware/auth";
import { tenantGuard } from "./middleware/tenantGuard";
import { sanitizeBody } from "./middleware/sanitize";
import { enforceHTTPS } from "./middleware/httpsEnforcement";
import { verifyToken } from "./utils/jwt";

// Services
import { initFeeReminderCron } from "./services/cron.service";

// Load environment variables
dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT || 5000;
const API_V1 = "/api/v1";

// ── Create HTTP server (required for Socket.io) ──
const httpServer = createServer(app);

// ── Socket.io with JWT auth ──

interface AuthenticatedSocket {
  user: {
    userId: string;
    tenantId: string;
    role: string;
    uniqueId: string;
  };
}

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.WEB_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication token required"));
  }
  try {
    const decoded = verifyToken(token as string, "access");
    (socket as unknown as AuthenticatedSocket & typeof socket).user = decoded as AuthenticatedSocket["user"];
    next();
  } catch {
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  const user = (socket as unknown as AuthenticatedSocket & typeof socket).user;
  if (user?.tenantId) {
    socket.join(`tenant:${user.tenantId}`);
  }
  socket.join(`user:${user?.userId}`);

  // Real-time messaging events
  socket.on("send_message", async (data: { receiverId: string; content: string; messageType?: string }) => {
    try {
      // Verify receiver belongs to the same tenant
      const receiver = await prisma.user.findFirst({
        where: { id: data.receiverId, tenantId: user.tenantId },
      });
      if (!receiver) {
        socket.emit("error", { message: "Receiver not found in your school" });
        return;
      }
      const message = await prisma.message.create({
        data: {
          tenantId: user.tenantId,
          senderId: user.userId,
          receiverId: data.receiverId,
          content: data.content,
          messageType: (data.messageType as "TEXT" | "IMAGE" | "FILE" | "VOICE" | "VIDEO") || "TEXT",
        },
      });
      // Emit to receiver's user room and tenant room
      io.to(`user:${data.receiverId}`).emit("receive_message", message);
      io.to(`user:${user.userId}`).emit("message_sent", message);
    } catch (err: any) {
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("typing", (data: { receiverId: string; isTyping: boolean }) => {
    io.to(`user:${data.receiverId}`).emit("typing", { senderId: user.userId, isTyping: data.isTyping });
  });

  socket.on("mark_read", async (data: { messageId: string }) => {
    try {
      // Verify message exists and belongs to user's tenant
      const message = await prisma.message.findFirst({
        where: { id: data.messageId, receiverId: user.userId, tenantId: user.tenantId },
      });
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }
      await prisma.message.update({
        where: { id: data.messageId },
        data: { isRead: true, readAt: new Date() },
      });
      // Notify sender
      io.to(`user:${message.senderId}`).emit("message_read", { messageId: data.messageId, readAt: new Date() });
    } catch (err: any) {
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("disconnect", () => {
    // Cleanup handled automatically by Socket.io
  });
});

// Make io available globally for notifications
(global as any).io = io;

// ── Security & Core Middleware ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.WEB_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
}));

app.use(morgan("combined"));
app.use(compression());

// ── HTTPS Enforcement (production only) ──
app.use(enforceHTTPS);

// ── Request Size Limits ──
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// ── XSS Sanitization ──
app.use(sanitizeBody);

// ── Security Headers ──
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// ── Rate Limiters ──
// Apply general rate limiter to all routes
app.use(generalLimiter);

// ── Health Check ──
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "acadivo-api", timestamp: new Date().toISOString() });
});

// ── Root ──
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Acadivo API", version: "0.1.0" });
});

// ── API Routes with targeted rate limiting ──
app.use(`${API_V1}/auth`, authLimiter, authRoutes);
app.use(`${API_V1}/teacher`, authMiddleware, tenantGuard(), teacherRoutes);
app.use(`${API_V1}/student`, authMiddleware, tenantGuard(), studentRoutes);
app.use(`${API_V1}/parent`, authMiddleware, tenantGuard(), parentRoutes);
app.use(`${API_V1}/principal`, authMiddleware, tenantGuard(), principalRoutes);
app.use(`${API_V1}/school-admin`, authMiddleware, tenantGuard(), writeLimiter, schoolAdminRoutes);
app.use(`${API_V1}/super-admin`, authMiddleware, tenantGuard(), writeLimiter, superAdminRoutes);
app.use(`${API_V1}/fee`, authMiddleware, tenantGuard(), feeRoutes);
app.use(`${API_V1}/result`, authMiddleware, tenantGuard(), resultRoutes);
app.use(`${API_V1}/report`, authMiddleware, tenantGuard(), reportRoutes);
app.use(`${API_V1}/communication`, authMiddleware, tenantGuard(), communicationRoutes);
app.use(`${API_V1}/advertisement`, authMiddleware, tenantGuard(), advertisementRoutes);
app.use(`${API_V1}/upload`, authMiddleware, tenantGuard(), uploadLimiter, uploadRoutes);
app.use(`${API_V1}/qa`, authMiddleware, tenantGuard(), qaRoutes);
app.use(`${API_V1}/exams`, authMiddleware, tenantGuard(), examRoutes);
app.use(`${API_V1}/health`, healthRoutes);
app.use(`${API_V1}/export`, authMiddleware, tenantGuard(), authorize("ADMIN", "PRINCIPAL", "SUPER_ADMIN"), exportRoutes);
// app.use(`${API_V1}/import`, authMiddleware, tenantGuard(), authorize("ADMIN", "PRINCIPAL", "SUPER_ADMIN"), importRoutes); // Disabled - module not yet implemented

// ── User Preferences ──
app.get(`${API_V1}/user/preferences`, authMiddleware, tenantGuard(), getPreferences);
app.put(`${API_V1}/user/preferences`, authMiddleware, tenantGuard(), updatePreferences);

// ── 404 Fallback ──
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// ── Global Error Handler ──
app.use(globalErrorHandler);

// ── Start Server ──
const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Acadivo API running on http://localhost:${PORT}`);
  // Initialize cron jobs
  initFeeReminderCron();
});

// ── Graceful Shutdown ──
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

export { app, io };
export default app;
