/**
 * Bounded server-side login abuse protection for /api/admin/login.
 *
 * BEST-EFFORT INTERIM PROTECTION — NOT A DISTRIBUTED PRODUCTION BOUNDARY.
 *
 * This module provides a process-local in-memory failed-login tracker that
 * limits brute-force attempts against the admin login endpoint. Because it
 * resides in memory, it is scoped to a single Node.js process and will not
 * protect across multiple Vercel instances or serverless invocations.
 *
 * Before treating this as production-grade security, a persistent edge-based
 * rate limiter or provider-backed mechanism (e.g., Vercel Edge Middleware with
 * KV, Cloudflare, or a database-backed limiter) must replace or supplement
 * this module.
 *
 * Privacy considerations:
 * - Keys are hashed (SHA-256) before storage; no raw IPs or emails are retained.
 * - Only failure counters and timestamps are tracked.
 * - No passwords, tokens, or personal data are stored in the tracker.
 * - Tracker state is never exposed to clients.
 *
 * @module lib/login-protection
 */

import crypto from 'node:crypto';

/**
 * Default protection settings.
 * - 5 consecutive failures trigger a 15-minute cooldown.
 * - Stale entries are removed after 24 hours.
 * - Maximum 1000 keys retained; oldest evicted when full.
 */
export const PROTECTION_DEFAULTS = Object.freeze({
  /** Number of consecutive failures before cooldown activates. */
  failureThreshold: 5,
  /** Duration of cooldown period in milliseconds (15 minutes). */
  cooldownMs: 15 * 60 * 1000,
  /** Time-to-live for stale entries in milliseconds (24 hours). */
  entryTtlMs: 24 * 60 * 60 * 1000,
  /** Maximum number of hashed keys retained in memory. */
  maxKeys: 1000,
});

/**
 * Normalize an account identifier (email) for consistent keying.
 * Trims whitespace, lowercases, and caps length to prevent abuse.
 *
 * @param {unknown} value - Submitted account identifier.
 * @returns {string} Normalized identifier, or empty string for non-string input.
 */
export function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().slice(0, 254);
}

/**
 * Extract and normalize the network identifier from request headers.
 * Uses the first value from x-forwarded-for, or x-real-ip as fallback,
 * or 'unknown' for direct connections without proxy headers.
 *
 * @param {Headers} headers - Request headers object.
 * @returns {string} Normalized network identifier.
 */
export function extractNetworkId(headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    const normalized = typeof first === 'string' ? first.trim().toLowerCase() : '';
    return normalized || 'unknown';
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    const normalized = typeof realIp === 'string' ? realIp.trim().toLowerCase() : '';
    return normalized || 'unknown';
  }
  return 'unknown';
}

/**
 * Create a non-reversible composite key from normalized network and account
 * identifiers. The key is a SHA-256 hash so no raw IP or email is stored.
 *
 * @param {string} networkId - Normalized network identifier.
 * @param {string} email - Normalized account identifier.
 * @returns {string} Hex-encoded SHA-256 hash suitable as a map key.
 */
export function createAttemptKey(networkId, email) {
  return crypto
    .createHash('sha256')
    .update(`${networkId}\u0000${email}`)
    .digest('hex');
}

/**
 * Bounded in-memory failed-login tracker.
 *
 * Best-effort interim protection for a single Node.js process. Not suitable
 * as a distributed production security boundary without a persistent backing
 * store. Tracker state, cooldown duration, attempt counts, and account
 * existence are never exposed to clients.
 */
export class LoginProtectionTracker {
  /**
   * @param {object} [options] - Configuration options.
   * @param {number} [options.failureThreshold=5] - Failures before cooldown starts.
   * @param {number} [options.cooldownMs=900000] - Cooldown duration in ms (15 min).
   * @param {number} [options.entryTtlMs=86400000] - Stale entry TTL in ms (24 hours).
   * @param {number} [options.maxKeys=1000] - Maximum retained keys.
   * @param {() => number} [options.now=Date.now] - Clock function for testing.
   */
  constructor({
    failureThreshold = PROTECTION_DEFAULTS.failureThreshold,
    cooldownMs = PROTECTION_DEFAULTS.cooldownMs,
    entryTtlMs = PROTECTION_DEFAULTS.entryTtlMs,
    maxKeys = PROTECTION_DEFAULTS.maxKeys,
    now = Date.now,
  } = {}) {
    this.failureThreshold = Math.max(1, Math.floor(failureThreshold));
    this.cooldownMs = Math.max(1, Math.floor(cooldownMs));
    this.entryTtlMs = Math.max(this.cooldownMs, Math.floor(entryTtlMs));
    this.maxKeys = Math.max(1, Math.floor(maxKeys));
    this.now = now;
    /** @private */
    this._entries = new Map();
  }

  /**
   * Remove entries older than the configured TTL.
   * Called automatically on each check to prevent unbounded growth.
   *
   * @param {number} [timestamp] - Current time in ms.
   * @returns {void}
   */
  _prune(timestamp = this.now()) {
    for (const [key, entry] of this._entries) {
      if (timestamp - entry.lastFailureAt >= this.entryTtlMs) {
        this._entries.delete(key);
      }
    }
  }

  /**
   * Evict the oldest entries when the map exceeds the configured cap.
   * Map iteration order is insertion order, so the first keys are oldest.
   *
   * @param {number} [timestamp] - Current time in ms.
   * @returns {void}
   */
  _enforceBound(timestamp = this.now()) {
    this._prune(timestamp);
    while (this._entries.size > this.maxKeys) {
      const oldestKey = this._entries.keys().next().value;
      if (oldestKey === undefined) break;
      this._entries.delete(oldestKey);
    }
  }

  /**
   * Check whether a key is currently in cooldown and should be blocked.
   * Also prunes stale entries on each call to keep memory bounded.
   *
   * Never returns information about WHY the block is active — callers must
   * return a generic error regardless of the result.
   *
   * @param {string} key - Hashed attempt key from createAttemptKey.
   * @returns {boolean} True if the key is cooling down and attempts should be blocked.
   */
  isBlocked(key) {
    const timestamp = this.now();
    this._prune(timestamp);
    const entry = this._entries.get(key);
    if (!entry) return false;
    if (entry.cooldownUntil > timestamp) return true;
    // Entry exists but not in cooldown — check if it's stale
    if (timestamp - entry.lastFailureAt >= this.entryTtlMs) {
      this._entries.delete(key);
    }
    return false;
  }

  /**
   * Record a failed login attempt. When the threshold is reached, the
   * cooldown period begins.
   *
   * @param {string} key - Hashed attempt key from createAttemptKey.
   * @returns {void}
   */
  recordFailure(key) {
    const timestamp = this.now();
    this._prune(timestamp);
    const existing = this._entries.get(key);
    const entry =
      existing && timestamp - existing.lastFailureAt < this.entryTtlMs
        ? existing
        : { failures: 0, cooldownUntil: 0, lastFailureAt: timestamp };

    entry.failures += 1;
    entry.lastFailureAt = timestamp;

    if (entry.failures >= this.failureThreshold) {
      entry.cooldownUntil = timestamp + this.cooldownMs;
    }

    // Re-insert to update Map insertion order (for eviction)
    this._entries.delete(key);
    this._entries.set(key, entry);
    this._enforceBound(timestamp);
  }

  /**
   * Clear the failure record for a key after successful authentication.
   * This prevents accumulated failures from blocking future legitimate logins.
   *
   * @param {string} key - Hashed attempt key from createAttemptKey.
   * @returns {void}
   */
  clearOnSuccess(key) {
    this._entries.delete(key);
  }

  /**
   * Number of currently tracked keys (after pruning stale entries).
   * Exposed only for bounded-memory tests and operational monitoring.
   *
   * @returns {number} Count of active entries.
   */
  get size() {
    this._prune();
    return this._entries.size;
  }
}

/**
 * Create the process-local tracker instance with default or environment-
 * overridden settings.
 *
 * @returns {LoginProtectionTracker} Configured tracker instance.
 */
export function createTracker() {
  return new LoginProtectionTracker({
    failureThreshold: PROTECTION_DEFAULTS.failureThreshold,
    cooldownMs: PROTECTION_DEFAULTS.cooldownMs,
    entryTtlMs: PROTECTION_DEFAULTS.entryTtlMs,
    maxKeys: PROTECTION_DEFAULTS.maxKeys,
  });
}
