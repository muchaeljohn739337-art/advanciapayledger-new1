import Redis from "ioredis";
import { logger } from "./logger";

const ENABLE_REDIS = process.env.ENABLE_REDIS === "true";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Lazily-created Redis client singleton.
 * Returns null when ENABLE_REDIS is false or the connection fails.
 */
let redisClient: Redis | null = null;
let connectionAttempted = false;

export function getRedisClient(): Redis | null {
  if (!ENABLE_REDIS) return null;
  if (connectionAttempted) return redisClient;

  connectionAttempted = true;

  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 5000,
    });

    client.on("connect", () => logger.info("[Redis] Connected"));
    client.on("error", (err) => {
      logger.warn("[Redis] Connection error — falling back to in-memory store", { error: err.message });
      redisClient = null;
    });

    // Kick off connection; if it fails the error handler above clears the ref
    client.connect().catch(() => {
      redisClient = null;
    });

    redisClient = client;
  } catch (err) {
    logger.warn("[Redis] Failed to initialise client — using in-memory rate-limit store", { error: (err as Error).message });
    redisClient = null;
  }

  return redisClient;
}

export default getRedisClient;
