/**
 * Presence service for tracking online/offline user status
 * Uses Redis with TTL for automatic expiry
 */

import { Server } from "socket.io";
import { redisClient } from "../config/redis";
import { env } from "../config/env";
import { getTenantRoom, getUserRoom } from "./room.service";
import { PresenceUpdate } from "../types/socket";
import { logger } from "../utils/logger";

const PRESENCE_KEY_PREFIX = "presence:";
const ONLINE_SET_KEY = (tenantId: string) => `${PRESENCE_KEY_PREFIX}online:${tenantId}`;
const USER_STATUS_KEY = (userId: string) => `${PRESENCE_KEY_PREFIX}user:${userId}`;

export async function setOnline(userId: string, tenantId: string): Promise<void> {
  const pipeline = redisClient.pipeline();
  const now = new Date().toISOString();

  // Add to tenant's online set with TTL
  pipeline.sadd(ONLINE_SET_KEY(tenantId), userId);
  pipeline.expire(ONLINE_SET_KEY(tenantId), env.PRESENCE_TTL_SECONDS);

  // Set user status with TTL
  pipeline.setex(
    USER_STATUS_KEY(userId),
    env.PRESENCE_TTL_SECONDS,
    JSON.stringify({ tenantId, status: "online", lastSeen: now })
  );

  await pipeline.exec();
  logger.debug(`User ${userId} set as online in tenant ${tenantId}`);
}

export async function setOffline(userId: string, tenantId: string): Promise<void> {
  const pipeline = redisClient.pipeline();
  const now = new Date().toISOString();

  // Remove from tenant's online set
  pipeline.srem(ONLINE_SET_KEY(tenantId), userId);

  // Update user status
  pipeline.setex(
    USER_STATUS_KEY(userId),
    env.PRESENCE_TTL_SECONDS,
    JSON.stringify({ tenantId, status: "offline", lastSeen: now })
  );

  await pipeline.exec();
  logger.debug(`User ${userId} set as offline in tenant ${tenantId}`);
}

export async function getOnlineUsers(tenantId: string): Promise<string[]> {
  try {
    const users = await redisClient.smembers(ONLINE_SET_KEY(tenantId));
    return users;
  } catch (error) {
    logger.error("Error fetching online users:", error);
    return [];
  }
}

export async function isUserOnline(userId: string): Promise<boolean> {
  try {
    const status = await redisClient.get(USER_STATUS_KEY(userId));
    if (!status) return false;
    const parsed = JSON.parse(status);
    return parsed.status === "online";
  } catch (error) {
    logger.error("Error checking user status:", error);
    return false;
  }
}

export async function getUserPresence(userId: string): Promise<PresenceUpdate | null> {
  try {
    const status = await redisClient.get(USER_STATUS_KEY(userId));
    if (!status) return null;
    return JSON.parse(status) as PresenceUpdate;
  } catch (error) {
    logger.error("Error fetching user presence:", error);
    return null;
  }
}

export async function refreshOnlineStatus(userId: string, tenantId: string): Promise<void> {
  // Refresh TTL for online users to prevent expiry while still connected
  const pipeline = redisClient.pipeline();
  pipeline.expire(ONLINE_SET_KEY(tenantId), env.PRESENCE_TTL_SECONDS);
  pipeline.expire(USER_STATUS_KEY(userId), env.PRESENCE_TTL_SECONDS);
  await pipeline.exec();
}

export async function broadcastPresenceUpdate(
  io: Server,
  userId: string,
  tenantId: string,
  status: "online" | "offline"
): Promise<void> {
  const update: PresenceUpdate = {
    userId,
    tenantId,
    status,
    lastSeen: new Date().toISOString(),
  };

  // Broadcast to tenant room so all users in the school see status changes
  io.to(getTenantRoom(tenantId)).emit("presence:update", update);

  // Also send to user's own room (for multi-device sync)
  io.to(getUserRoom(userId)).emit("presence:update", update);
}
