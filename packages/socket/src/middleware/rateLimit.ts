/**
 * Socket rate limiting middleware using Redis
 * Uses rate-limiter-flexible with Redis store
 */

import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisClient } from "../config/redis";
import { logger } from "../utils/logger";

const RATE_LIMIT_PREFIX = "rl:socket:";

// Per-user rate limiter: 120 events per minute
const userRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: `${RATE_LIMIT_PREFIX}user`,
  points: 120,
  duration: 60,
});

// Per-event rate limiter: 30 per minute for sensitive events
const eventRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: `${RATE_LIMIT_PREFIX}event`,
  points: 30,
  duration: 60,
});

const SENSITIVE_EVENTS = [
  "message:private",
  "message:group",
  "message:edit",
  "message:delete",
  "fcm:register",
  "fcm:unregister",
];

export async function socketRateLimitMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): Promise<void> {
  const userId = (socket as any).user?.userId || socket.id;

  try {
    await userRateLimiter.consume(userId, 1);
    next();
  } catch (_rejRes) {
    logger.warn(`Rate limit exceeded for user ${userId} on socket ${socket.id}`);
    next(new Error("Rate limit exceeded. Please slow down."));
  }
}

export function createEventRateLimit() {
  return async (socket: Socket, eventName: string): Promise<boolean> => {
    const userId = (socket as any).user?.userId || socket.id;
    const key = `${userId}:${eventName}`;

    if (!SENSITIVE_EVENTS.includes(eventName)) {
      return true;
    }

    try {
      await eventRateLimiter.consume(key, 1);
      return true;
    } catch (_rejRes) {
      logger.warn(`Event rate limit exceeded: ${eventName} for user ${userId}`);
      socket.emit("error", { code: "RATE_LIMITED", message: `Too many ${eventName} requests` });
      return false;
    }
  };
}
