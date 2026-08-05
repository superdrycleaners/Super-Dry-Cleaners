/**
 * In-memory sliding-window rate limiter for server actions and API routes.
 *
 * Tracks requests per client IP / identifier over a sliding time window.
 * Stale records are cleaned up automatically to avoid memory growth.
 */

/**
 * In-memory store for rate limit windows.
 * Maps `key` -> `number[]` (timestamps of requests within current window).
 * @type {Map<string, number[]>}
 */
const rateLimitStore = new Map();

/**
 * Extract client IP from Next.js request headers.
 *
 * Checks standard proxy headers in order of prevalence.
 *
 * @param {Headers|import('next/headers').HeadersAdapter|Record<string,string>} headers - Headers instance.
 * @returns {string} Client IP address or '127.0.0.1' fallback.
 */
export function getClientIp(headers) {
  if (!headers) return '127.0.0.1';

  const getHeader = (name) => {
    if (typeof headers.get === 'function') {
      return headers.get(name);
    }
    return headers[name.toLowerCase()] || headers[name];
  };

  const xForwardedFor = getHeader('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const cfConnectingIp = getHeader('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xRealIp = getHeader('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const fastlyClientIp = getHeader('fastly-client-ip');
  if (fastlyClientIp) return fastlyClientIp.trim();

  return '127.0.0.1';
}

/**
 * Clean up expired rate-limit records across the store.
 * @param {number} windowMs - Window duration in milliseconds.
 */
function cleanupExpiredRecords(windowMs) {
  const now = Date.now();
  const threshold = now - windowMs;

  for (const [key, timestamps] of rateLimitStore.entries()) {
    const active = timestamps.filter((t) => t > threshold);
    if (active.length === 0) {
      rateLimitStore.delete(key);
    } else if (active.length !== timestamps.length) {
      rateLimitStore.set(key, active);
    }
  }
}

/**
 * Check and record a rate-limited action for a given key.
 *
 * Uses a sliding-window counter algorithm.
 *
 * @param {string} key - Unique identifier (e.g. IP or IP:action).
 * @param {object} [options]
 * @param {number} [options.limit=5] - Maximum requests allowed within window.
 * @param {number} [options.windowMs=600000] - Window duration in ms (default: 10 mins).
 * @returns {{ success: boolean, limit: number, remaining: number, resetMs: number }}
 */
export function checkRateLimit(key, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const threshold = now - windowMs;

  // Periodic cleanup if store grows
  if (rateLimitStore.size > 500) {
    cleanupExpiredRecords(windowMs);
  }

  const timestamps = rateLimitStore.get(key) || [];
  const activeTimestamps = timestamps.filter((t) => t > threshold);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const resetMs = Math.max(0, oldest + windowMs - now);
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(key, activeTimestamps);

  return {
    success: true,
    limit,
    remaining: limit - activeTimestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Specialized rate limiter for collection booking submissions.
 * Limit: 5 submissions per 10 minutes per IP.
 *
 * @param {string} ip - Client IP.
 * @returns {{ success: boolean, remaining: number, resetMs: number }}
 */
export function checkBookingRateLimit(ip) {
  return checkRateLimit(`booking:${ip}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Reset rate limit for a specific key or all keys (useful for testing).
 * @param {string} [key]
 */
export function resetRateLimit(key) {
  if (key) {
    rateLimitStore.delete(key);
  } else {
    rateLimitStore.clear();
  }
}
