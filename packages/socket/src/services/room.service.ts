/**
 * Room management service for Socket.io
 * Handles user, tenant, and role-based room subscriptions
 */

import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import { logger } from "../utils/logger";

export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function getTenantRoom(tenantId: string): string {
  return `tenant:${tenantId}`;
}

export function getRoleRoom(role: string, tenantId: string): string {
  return `role:${role}:${tenantId}`;
}

export function getNotificationRoom(userId: string): string {
  return `notification:${userId}`;
}

export function joinUserRoom(socket: Socket, userId: string): void {
  const room = getUserRoom(userId);
  socket.join(room);
  logger.debug(`Socket ${socket.id} joined user room: ${room}`);
}

export function joinTenantRoom(socket: Socket, tenantId: string): void {
  const room = getTenantRoom(tenantId);
  socket.join(room);
  logger.debug(`Socket ${socket.id} joined tenant room: ${room}`);
}

export function joinRoleRoom(socket: Socket, role: string, tenantId: string): void {
  const room = getRoleRoom(role, tenantId);
  socket.join(room);
  logger.debug(`Socket ${socket.id} joined role room: ${room}`);
}

export function joinNotificationRoom(socket: Socket, userId: string): void {
  const room = getNotificationRoom(userId);
  socket.join(room);
  logger.debug(`Socket ${socket.id} joined notification room: ${room}`);
}

export function leaveAllRooms(socket: Socket): void {
  const rooms = Array.from(socket.rooms);
  // Skip the socket's own room (socket.id)
  rooms.forEach((room) => {
    if (room !== socket.id) {
      socket.leave(room);
      logger.debug(`Socket ${socket.id} left room: ${room}`);
    }
  });
}

export function getSocketRooms(socket: Socket): string[] {
  return Array.from(socket.rooms).filter((room) => room !== socket.id);
}

export function setupRooms(socket: AuthenticatedSocket): void {
  const { userId, role, tenantId } = socket.user;

  joinUserRoom(socket, userId);
  joinTenantRoom(socket, tenantId);
  joinRoleRoom(socket, role, tenantId);
  joinNotificationRoom(socket, userId);
}
