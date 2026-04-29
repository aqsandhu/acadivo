/**
 * Redis client configuration for Socket.io pub/sub adapter and presence store
 */

import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

const redisOptions = {
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error("Redis retry limit exceeded");
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  maxRetriesPerRequest: 3,
};

export const pubClient = new Redis(env.REDIS_URL, redisOptions);
export const subClient = pubClient.duplicate();
export const redisClient = pubClient.duplicate();

export async function connectRedis(): Promise<void> {
  try {
    await pubClient.connect();
    await subClient.connect();
    await redisClient.connect();
    logger.info("Redis clients connected successfully");
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    throw error;
  }
}

export function getRedisAdapter() {
  return createAdapter(pubClient, subClient, {
    key: "acadivo:socket.io",
  });
}

export async function disconnectRedis(): Promise<void> {
  await pubClient.quit();
  await subClient.quit();
  await redisClient.quit();
  logger.info("Redis clients disconnected");
}
