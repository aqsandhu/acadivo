/**
 * Presence service with multi-device tracking
 * Uses Redis with device counter for accurate online status
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
const USER_DEVICES_KEY = (userId: string) => `${PRESENCE_KEY_PREFIX}devices:${userId}`;

export async function setOnline(userId: string, tenantId: string, deviceId?: string): Promise<void> {
  const pipeline = redisClient.pipeline();
  const now = new Date().toISOString();
  const device = deviceId || "default";

  // Increment device counter for multi-device tracking
  pipeline.hincrby(USER_DEVICES_KEY(userId), device, 1);
  pipeline.expire(USER_DEVICES_KEY(userId), env.PRESENCE_TTL_SECONDS);

  // Add to tenant's online set
  pipeline.sadd(ONLINE_SET_KEY(tenantId), userId);
  pipeline.expire(ONLINE_SET_KEY(tenantId), env.PRESENCE_TTL_SECONDS);

  // Set user status
  pipeline.setex(
    USER_STATUS_KEY(userId),
    env.PRESENCE_TTL_SECONDS,
    JSON.stringify({ tenantId, status: "online", lastSeen: now })
  );

  await pipeline.exec();
  logger.debug(`User ${userId} set as online (device: ${device}) in tenant ${tenantId}`);
}

export async function setOffline(userId: string, tenantId: string, deviceId?: string): Promise<void> {
  const pipeline = redisClient.pipeline();
  const now = new Date().toISOString();
  const device = deviceId || "default";

  // Decrement device counter
  pipeline.hincrby(USER_DEVICES_KEY(userId), device, -1);

  // Check if any devices remain for this user
  const devices = await redisClient.hgetall(USER_DEVICES_KEY(userId));
  const totalDevices = Object.values(devices).reduce((sum, count) => sum + parseInt(count, 10), 0);

  // Only mark offline if no devices remain
  if (totalDevices <= 1) {
    pipeline.del(USER_DEVICES_KEY(userId));
    pipeline.srem(ONLINE_SET_KEY(tenantId), userId);
    pipeline.setex(
      USER_STATUS_KEY(userId),
      env.PRESENCE_TTL_SECONDS,
      JSON.stringify({ tenantId, status: "offline", lastSeen: now })
    );
    logger.debug(`User ${userId} fully offline in tenant ${tenantId}`);
  } else {
    pipeline.expire(USER_DEVICES_KEY(userId), env.PRESENCE_TTL_SECONDS);
    logger.debug(`User ${userId} disconnected device ${device}, still online (${totalDevices - 1} devices)`);
  }

  await pipeline.exec();
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

export async function getUserDeviceCount(userId: string): Promise<number> {
  try {
    const devices = await redisClient.hgetall(USER_DEVICES_KEY(userId));
    return Object.values(devices).reduce((sum, count) => sum + parseInt(count, 10), 0);
  } catch (error) {
    logger.error("Error fetching device count:", error);
    return 0;
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
  pipeline.expire(USER_DEVICES_KEY(userId), env.PRESENCE_TTL_SECONDS);
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
