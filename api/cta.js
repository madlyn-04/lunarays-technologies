const MAX_FIELD_LENGTHS = {
  name: 120,
  email: 254,
  company: 160,
  phone: 40,
  service: 120,
  message: 3000
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const rateBuckets = new Map();

function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function isRateLimited(req) {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.startedAt >= WINDOW_MS) rateBuckets.delete(key);
  }

  const key = req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || 'unknown';
  if (!rateBuckets.has(key) && rateBuckets.size >= 5000) {
    rateBuckets.delete(rateBuckets.keys().next().value);
  }
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count > MAX_REQUESTS_PER_WINDOW;
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim() : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Use POST to submit this form.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {
      return sendJson(res, 400, { error: 'Invalid request body.' });
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return sendJson(res, 400, { error: 'Invalid request body.' });
  }

  const fields = Object.fromEntries(
    Object.entries(MAX_FIELD_LENGTHS).map(([key, max]) => [key, cleanText(body[key], max)])
  );
  if (Object.entries(MAX_FIELD_LENGTHS).some(([key, max]) => fields[key].length > max)) {
    return sendJson(res, 400, { error: 'One or more form fields are too long.' });
  }
  if (!fields.name || !fields.email || !fields.phone
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return sendJson(res, 400, { error: 'Please provide a valid name, email, and phone number.' });
  }

  if (isRateLimited(req)) {
    return sendJson(res, 429, { error: 'Too many submissions. Please wait a minute and try again.' });
  }

  const { SHEETS_WEB_APP_URL, SHEETS_WEB_APP_TOKEN } = process.env;
  if (!SHEETS_WEB_APP_URL || !SHEETS_WEB_APP_TOKEN) {
    console.error('CTA sheet integration is not configured.');
    return sendJson(res, 503, { error: 'Spreadsheet storage is not configured yet.' });
  }

  try {
    const response = await fetch(SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, token: SHEETS_WEB_APP_TOKEN }),
      redirect: 'follow'
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      console.error('CTA sheet receiver rejected a submission.', { status: response.status });
      return sendJson(res, 502, { error: 'The spreadsheet could not save this enquiry.' });
    }
    return sendJson(res, 200, { success: true });
  } catch (error) {
    // Avoid logging request data, credentials, or upstream response contents.
    console.error('CTA sheet storage request failed.', { name: error?.name || 'Error' });
    return sendJson(res, 502, { error: 'The spreadsheet could not save this enquiry.' });
  }
};
