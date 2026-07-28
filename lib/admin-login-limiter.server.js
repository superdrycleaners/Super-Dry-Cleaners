import crypto from 'node:crypto';

/**
 * Default failed-login protection values. The tracker is intentionally
 * process-local; deployment documentation must not treat it as distributed
 * protection.
 */
export const LOGIN_LIMIT_DEFAULTS = Object.freeze({
  failureThreshold: 5,
  cooldownMs: 15 * 60 * 1000,
  entryTtlMs: 60 * 60 * 1000,
  maxKeys: 10_000,
});

/**
 * Normalize an account identifier without retaining the submitted value.
 * @param {unknown} value - Submitted account identifier.
 * @returns {string} Bounded normalized identifier.
 */
export function normalizeAccountIdentifier(value) {
  return typeof value === 'string' ? value.trim().toLowerCase().slice(0, 254) : '';
}

/**
 * Normalize a network identifier supplied by the trusted hosting proxy.
 * @param {unknown} value - Network identifier, normally an IP address.
 * @returns {string} Bounded normalized identifier or an anonymous fallback.
 */
export function normalizeNetworkIdentifier(value) {
  if (typeof value !== 'string') return 'unknown';
  const normalized = value.trim().toLowerCase().slice(0, 128);
  return normalized || 'unknown';
}

/**
 * Hash normalized identifiers so the in-memory map does not retain raw
 * account or network data while keeping both values part of the key.
 * @param {string} networkIdentifier - Normalized network identifier.
 * @param {string} accountIdentifier - Normalized account identifier.
 * @returns {string} Non-reversible tracker key.
 */
export function createLoginAttemptKey(networkIdentifier, accountIdentifier) {
  return crypto
    .createHash('sha256')
    .update(`${normalizeNetworkIdentifier(networkIdentifier)}\u0000${normalizeAccountIdentifier(accountIdentifier)}`)
    .digest('hex');
}

/**
 * Read a positive integer environment setting with a safe bounded fallback.
 * @param {string} name - Environment variable name.
 * @param {number} fallback - Fallback value.
 * @param {number} minimum - Inclusive minimum.
 * @param {number} maximum - Inclusive maximum.
 * @returns {number} Bounded configuration value.
 */
export function readLoginLimitSetting(name, fallback, minimum, maximum) {
  const raw = process.env[name];
  if (!/^\d+$/.test(raw || '')) return fallback;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

/**
 * Bounded process-local tracker for failed admin login attempts.
 *
 * Only hashed network/account keys and counters are retained. The map is
 * best-effort protection for one Node.js instance, not a distributed boundary.
 */
export class FailedLoginTracker {
  /**
   * @param {object} [options] - Tracker settings.
   * @param {number} [options.failureThreshold=5] - Failures before cooldown.
   * @param {number} [options.cooldownMs=900000] - Cooldown duration.
   * @param {number} [options.entryTtlMs=3600000] - Stale-entry lifetime.
   * @param {number} [options.maxKeys=10000] - Maximum retained keys.
   * @param {() => number} [options.now=Date.now] - Clock for deterministic checks.
   */
  constructor({
    failureThreshold = LOGIN_LIMIT_DEFAULTS.failureThreshold,
    cooldownMs = LOGIN_LIMIT_DEFAULTS.cooldownMs,
    entryTtlMs = LOGIN_LIMIT_DEFAULTS.entryTtlMs,
    maxKeys = LOGIN_LIMIT_DEFAULTS.maxKeys,
    now = Date.now,
  } = {}) {
    this.failureThreshold = Math.max(1, Math.floor(failureThreshold));
    this.cooldownMs = Math.max(1, Math.floor(cooldownMs));
    this.entryTtlMs = Math.max(this.cooldownMs, Math.floor(entryTtlMs));
    this.maxKeys = Math.max(1, Math.floor(maxKeys));
    this.now = now;
    this.entries = new Map();
  }

  /**
   * Remove entries that can no longer affect a login attempt.
   * @param {number} timestamp - Current epoch time in milliseconds.
   * @returns {void}
   */
  prune(timestamp = this.now()) {
    for (const [key, entry] of this.entries) {
      if (timestamp - entry.lastFailureAt >= this.entryTtlMs) this.entries.delete(key);
    }
  }

  /**
   * Check whether a key is currently cooling down.
   * @param {string} key - Hashed network/account key.
   * @returns {boolean} Whether another attempt is blocked.
   */
  isCoolingDown(key) {
    const timestamp = this.now();
    this.prune(timestamp);
    const entry = this.entries.get(key);
    if (!entry) return false;
    if (entry.cooldownUntil > timestamp) return true;
    if (timestamp - entry.lastFailureAt >= this.entryTtlMs) this.entries.delete(key);
    return false;
  }

  /**
   * Record one failed attempt and start cooldown at the configured threshold.
   * @param {string} key - Hashed network/account key.
   * @returns {{coolingDown: boolean}} Public limiter state without counters.
   */
  recordFailure(key) {
    const timestamp = this.now();
    this.prune(timestamp);
    const existing = this.entries.get(key);
    const entry = existing && timestamp - existing.lastFailureAt < this.entryTtlMs
      ? existing
      : { failures: 0, cooldownUntil: 0, lastFailureAt: timestamp };

    entry.failures += 1;
    entry.lastFailureAt = timestamp;
    if (entry.failures >= this.failureThreshold) entry.cooldownUntil = timestamp + this.cooldownMs;
    this.entries.delete(key);
    this.entries.set(key, entry);
    this.enforceBound(timestamp);
    return { coolingDown: entry.cooldownUntil > timestamp };
  }

  /**
   * Clear failures after successful authentication.
   * @param {string} key - Hashed network/account key.
   * @returns {void}
   */
  clear(key) {
    this.entries.delete(key);
  }

  /**
   * Keep the newest entries when a burst of unique keys exceeds the cap.
   * @param {number} timestamp - Current epoch time in milliseconds.
   * @returns {void}
   */
  enforceBound(timestamp = this.now()) {
    this.prune(timestamp);
    while (this.entries.size > this.maxKeys) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }

  /**
   * Expose only a count for bounded-memory tests and operational inspection.
   * @returns {number} Number of retained hashed keys.
   */
  get size() {
    this.prune();
    return this.entries.size;
  }
}

/**
 * Create the process-local tracker used by the login route.
 * @returns {FailedLoginTracker} Configured bounded tracker.
 */
export function createLoginAttemptTracker() {
  return new FailedLoginTracker({
    failureThreshold: readLoginLimitSetting(
      'ADMIN_LOGIN_FAILURE_THRESHOLD',
      LOGIN_LIMIT_DEFAULTS.failureThreshold,
      1,
      100,
    ),
    cooldownMs: readLoginLimitSetting(
      'ADMIN_LOGIN_COOLDOWN_MS',
      LOGIN_LIMIT_DEFAULTS.cooldownMs,
      1_000,
      24 * 60 * 60 * 1000,
    ),
    entryTtlMs: readLoginLimitSetting(
      'ADMIN_LOGIN_ENTRY_TTL_MS',
      LOGIN_LIMIT_DEFAULTS.entryTtlMs,
      1_000,
      7 * 24 * 60 * 60 * 1000,
    ),
    maxKeys: readLoginLimitSetting(
      'ADMIN_LOGIN_MAX_KEYS',
      LOGIN_LIMIT_DEFAULTS.maxKeys,
      1,
      100_000,
    ),
  });
}
