import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

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

// Middleware
import { globalErrorHandler } from "./middleware/errorHandler";
import { generalLimiter, authLimiter, uploadLimiter, writeLimiter } from "./middleware/rateLimiter";
import { authMiddleware } from "./middleware/auth";
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
    (socket as any).user = decoded;
    next();
  } catch {
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  const user = (socket as any).user;
  if (user?.tenantId) {
    socket.join(`tenant:${user.tenantId}`);
  }
  socket.join(`user:${user?.userId}`);

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.use(`${API_V1}/teacher`, authMiddleware, teacherRoutes);
app.use(`${API_V1}/student`, authMiddleware, studentRoutes);
app.use(`${API_V1}/parent`, authMiddleware, parentRoutes);
app.use(`${API_V1}/principal`, authMiddleware, principalRoutes);
app.use(`${API_V1}/school-admin`, authMiddleware, writeLimiter, schoolAdminRoutes);
app.use(`${API_V1}/super-admin`, authMiddleware, writeLimiter, superAdminRoutes);
app.use(`${API_V1}/fee`, authMiddleware, feeRoutes);
app.use(`${API_V1}/result`, authMiddleware, resultRoutes);
app.use(`${API_V1}/report`, authMiddleware, reportRoutes);
app.use(`${API_V1}/communication`, authMiddleware, communicationRoutes);
app.use(`${API_V1}/advertisement`, authMiddleware, advertisementRoutes);
app.use(`${API_V1}/upload`, authMiddleware, uploadLimiter, uploadRoutes);
app.use(`${API_V1}/qa`, authMiddleware, qaRoutes);

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
