// Shared helpers for the Lunarays Vercel functions.
// Files/folders starting with "_" inside /api are NOT deployed as routes.

const DEFAULT_ALLOWED_ORIGINS = [
  'https://lunaraystechnologies.com',
  'https://www.lunaraystechnologies.com'
];

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw || !raw.trim()) return DEFAULT_ALLOWED_ORIGINS;
  return raw.split(',').map(o => o.trim().replace(/\/+$/, '')).filter(Boolean);
}

function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/**
 * Applies CORS headers. Returns true if the response has already been sent
 * (preflight answered, or origin rejected) and the handler must stop.
 * Requests with no Origin header (curl, server-to-server) are not browsers and pass through.
 */
function handleCors(req, res) {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');

  if (origin) {
    if (!getAllowedOrigins().includes(origin)) {
      sendJson(res, 403, {
        success: false,
        message: 'This request is not allowed from your current website address.',
        error: 'This request is not allowed from your current website address.'
      });
      return true;
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function getClientKey(req) {
  return req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || 'unknown';
}

// Best-effort, per-serverless-instance limiter (resets on cold start).
function createRateLimiter(windowMs, maxRequests) {
  const buckets = new Map();
  return function isRateLimited(req) {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.startedAt >= windowMs) buckets.delete(key);
    }
    const key = getClientKey(req);
    if (!buckets.has(key) && buckets.size >= 5000) {
      buckets.delete(buckets.keys().next().value);
    }
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { startedAt: now, count: 0 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    return bucket.count > maxRequests;
  };
}

module.exports = { handleCors, sendJson, createRateLimiter };