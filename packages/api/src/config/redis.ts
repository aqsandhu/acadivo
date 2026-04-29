/**
 * @file src/config/redis.ts
 * @description Redis client setup using ioredis with connection pooling and error handling.
 */

import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

// ────────────────────────────────────────────────
// Redis Client Instance
// ────────────────────────────────────────────────

const redisConfig: Redis.RedisOptions = env.REDIS_URL
  ? { lazyConnect: true }
  : {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

export const redis = env.REDIS_URL ? new Redis(env.REDIS_URL, redisConfig) : new Redis(redisConfig);

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error("Redis error:", err));
redis.on("reconnecting", () => logger.warn("Redis reconnecting..."));

/**
 * Gracefully close the Redis connection.
 */
export async function closeRedis(): Promise<void> {
  await redis.quit();
  logger.info("Redis connection closed");
}

export default redis;
