import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";

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

// Middleware
import { globalErrorHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT || 5000;
const API_V1 = "/api/v1";

// ── Middleware ─────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL || "http://localhost:3000" }));
app.use(morgan("combined"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ─────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "acadivo-api", timestamp: new Date().toISOString() });
});

// ── Root ─────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Acadivo API", version: "0.1.0" });
});

// ── API Routes ─────────────────────────────
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/teacher`, teacherRoutes);
app.use(`${API_V1}/student`, studentRoutes);
app.use(`${API_V1}/parent`, parentRoutes);
app.use(`${API_V1}/principal`, principalRoutes);
app.use(`${API_V1}/school-admin`, schoolAdminRoutes);
app.use(`${API_V1}/super-admin`, superAdminRoutes);
app.use(`${API_V1}/fee`, feeRoutes);
app.use(`${API_V1}/result`, resultRoutes);
app.use(`${API_V1}/report`, reportRoutes);
app.use(`${API_V1}/communication`, communicationRoutes);
app.use(`${API_V1}/advertisement`, advertisementRoutes);

// ── 404 Fallback ──
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// ── Global Error Handler ───────────────────
app.use(globalErrorHandler);

// ── Start Server ───────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🚀 Acadivo API running on http://localhost:${PORT}`);
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

export { app };
export default app;
