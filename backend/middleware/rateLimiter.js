/**
 * LeadFlow CRM — Auth Rate Limiter Middleware
 *
 * In-memory sliding window rate limiter for abuse protection on password reset endpoints.
 * Tracks requests by combination of client IP and normalized email.
 *
 * Note for Production Scaling:
 * In multi-instance / cluster deployments with a load balancer,
 * replace this in-memory store with an external Redis store.
 */

const requestStore = new Map();

// Default: 5 requests per 15 minutes
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 5;

/**
 * Creates a rate limiter middleware
 *
 * @param {Object} options
 * @param {number} [options.windowMs] - Sliding window duration in milliseconds
 * @param {number} [options.max] - Maximum allowed requests within window
 * @param {string} [options.message] - Error message on 429
 */
const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const max = options.max || DEFAULT_MAX_REQUESTS;
  const message = options.message || 'Too many password reset requests. Please wait a few minutes before trying again.';

  return (req, res, next) => {
    // Determine client identifier: IP + optional normalized email
    const ip = req.ip || req.connection?.remoteAddress || 'unknown-ip';
    const email = (req.body?.email ? String(req.body.email).toLowerCase().trim() : '');
    const key = `${ip}:${email}`;
    const now = Date.now();

    let record = requestStore.get(key);

    if (!record) {
      record = { timestamps: [] };
      requestStore.set(key, record);
    }

    // Filter out timestamps outside current sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= max) {
      const oldestTimestamp = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);

      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds
      });
    }

    record.timestamps.push(now);
    next();
  };
};

// Periodic garbage collection every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < DEFAULT_WINDOW_MS);
    if (record.timestamps.length === 0) {
      requestStore.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Reset all rate limit tracking (useful for automated test teardown)
 */
const resetRateLimiter = () => {
  requestStore.clear();
};

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts. Please try again later.'
});

module.exports = {
  createRateLimiter,
  forgotPasswordLimiter,
  resetRateLimiter
};
