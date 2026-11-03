import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const LIMIT = 3;
const WINDOW_MS = 10 * 60 * 1000;

export type RateLimitResult = "allowed" | "limited" | "unavailable";

let upstash: Ratelimit | undefined;
let warnedAboutMemory = false;
const memoryHits = new Map<string, number[]>();

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Only for local development: it does not work across serverless instances.
function memoryLimit(key: string, now: number): boolean {
  const recent = (memoryHits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMIT) {
    memoryHits.set(key, recent);
    return false;
  }
  memoryHits.set(key, [...recent, now]);
  return true;
}

// 3 requests per 10 minutes per key. Upstash is required in production;
// without it the route refuses messages rather than accepting them unprotected.
export async function checkRateLimit(key: string, now = Date.now()): Promise<RateLimitResult> {
  if (hasUpstash()) {
    upstash ??= new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(LIMIT, "10 m"),
      prefix: "portfolio:contact",
    });
    const { success } = await upstash.limit(key);
    return success ? "allowed" : "limited";
  }

  if (process.env.NODE_ENV === "production") return "unavailable";

  if (!warnedAboutMemory) {
    console.warn("Upstash is not configured. Using an in-memory rate limiter (development only).");
    warnedAboutMemory = true;
  }
  return memoryLimit(key, now) ? "allowed" : "limited";
}
