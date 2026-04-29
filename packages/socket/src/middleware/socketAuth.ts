/**
 * Socket.io JWT authentication middleware
 * Verifies token from handshake.auth.token on connection
 * Supports all roles including PRINCIPAL
 */

import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AuthenticatedSocket, SocketUser } from "../types/socket";

interface JwtPayload {
  userId: string;
  role: string;
  tenantId: string;
  uniqueId: string;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

const VALID_ROLES = ["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"];

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): void {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      logger.warn(`Authentication failed for socket ${socket.id}: No token provided`);
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Validate role
    if (!VALID_ROLES.includes(decoded.role)) {
      logger.warn(`Authentication failed: invalid role '${decoded.role}'`);
      return next(new Error("Authentication error: Invalid role"));
    }

    const user: SocketUser = {
      userId: decoded.userId,
      role: decoded.role as any,
      tenantId: decoded.tenantId,
      uniqueId: decoded.uniqueId,
      email: decoded.email,
      name: decoded.name || "",
    };

    (socket as AuthenticatedSocket).user = user;
    logger.info(`Socket ${socket.id} authenticated as user ${user.userId} (${user.role})`);
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid token";
    logger.warn(`Authentication failed for socket ${socket.id}: ${message}`);
    next(new Error(`Authentication error: ${message}`));
  }
}
