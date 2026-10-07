// POST /api/submit  -> validates the CTA enquiry and forwards it to Google Apps Script (Google Sheets).
// Env vars: SHEETS_WEB_APP_URL, SHEETS_WEB_APP_TOKEN, (optional) ALLOWED_ORIGINS

const { handleCors, sendJson, createRateLimiter } = require('./_lib/common');

const MAX_BODY_BYTES = 20 * 1024;
const FIELD_LIMITS = {
  name: 120, company: 160, email: 254, phone: 40,
  service: 120, subject: 200, message: 3000, sourcePage: 200
};
// Keep in sync with the <select name="service"> options in index.html
const ALLOWED_SERVICES = [
  'Microsoft 365 Services',
  'Cloud Services',
  'IT Infrastructure & Managed Services',
  'Application Services',
  'Infor Services',
  'Database Support Services',
  'Oracle Retail & Fusion',
  'Mobility Services'
];
const DEFAULT_SUBJECT = 'New enquiry from the Lunarays website';
const APPS_SCRIPT_TIMEOUT_MS = 15000;
const isRateLimited = createRateLimiter(60_000, 8);

const GENERIC_FAILURE = 'Unable to submit your enquiry at the moment. Please try again later.';
const fail = (res, status, message = GENERIC_FAILURE) => sendJson(res, status, { success: false, message });

function clean(value) {
  // trim + drop control characters (keeps normal newlines/tabs in messages)
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
    : '';
}

function validate(body) {
  const f = {};
  for (const key of Object.keys(FIELD_LIMITS)) {
    f[key] = clean(body[key]);
    if (f[key].length > FIELD_LIMITS[key]) return { error: 'One or more fields are too long.' };
  }
  if (!f.name || !f.email || !f.phone) {
    return { error: 'Please provide your name, email address and phone number.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    return { error: 'Please enter a valid email address.' };
  }
  const digits = f.phone.replace(/\D/g, '');
  if (!/^\+?[\d\s().-]{7,40}$/.test(f.phone) || digits.length < 7 || digits.length > 15) {
    return { error: 'Please enter a valid phone number.' };
  }
  if (f.service && !ALLOWED_SERVICES.includes(f.service)) {
    return { error: 'Please choose a service from the list.' };
  }
  // Basic spam guard: link-stuffed messages
  if ((f.message.match(/https?:\/\/|www\./gi) || []).length > 3) {
    return { error: 'Please remove extra links from your message.' };
  }
  return {
    data: {
      name: f.name,
      company: f.company,
      email: f.email,
      phone: f.phone,
      service: f.service,
      subject: f.subject || DEFAULT_SUBJECT,
      message: f.message,
      source: 'website',
      sourcePage: f.sourcePage
    }
  };
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return fail(res, 405, 'Use POST to submit this form.');
  }

  const declaredLength = Number(req.headers['content-length'] || 0);
  if (declaredLength > MAX_BODY_BYTES) return fail(res, 413, 'The submission is too large.');

  let body = req.body;
  if (typeof body === 'string') {
    if (body.length > MAX_BODY_BYTES) return fail(res, 413, 'The submission is too large.');
    try { body = JSON.parse(body); } catch { return fail(res, 400, 'Invalid request.'); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(res, 400, 'Invalid request.');

  const { data, error } = validate(body);
  if (error) return fail(res, 400, error);

  if (isRateLimited(req)) return fail(res, 429, 'Too many submissions. Please wait a minute and try again.');

  const { SHEETS_WEB_APP_URL, SHEETS_WEB_APP_TOKEN } = process.env;
  if (!SHEETS_WEB_APP_URL || !SHEETS_WEB_APP_TOKEN) {
    console.error('[submit] SHEETS_WEB_APP_URL or SHEETS_WEB_APP_TOKEN is not configured.');
    return fail(res, 503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), APPS_SCRIPT_TIMEOUT_MS);
  try {
    const upstream = await fetch(SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, token: SHEETS_WEB_APP_TOKEN }),
      redirect: 'follow',
      signal: controller.signal
    });
    const text = await upstream.text();
    let result = null;
    try { result = JSON.parse(text); } catch { result = null; }

    if (!upstream.ok || !result?.success) {
      const known = new Set(['MISSING_CONFIG', 'TOKEN_MISMATCH', 'INVALID_FIELDS', 'SHEET_WRITE_FAILED']);
      const reason = known.has(result?.code)
        ? result.code
        : text.trim().startsWith('<')
          ? 'HTML_RESPONSE_CHECK_DEPLOYMENT_ACCESS'
          : 'NON_JSON_OR_UNKNOWN_RESPONSE';
      // Never log the enquiry contents, the token, or the raw upstream body.
      console.error('[submit] Apps Script rejected a submission.', { status: upstream.status, reason });
      return fail(res, 502);
    }
    return sendJson(res, 200, { success: true, message: 'Your enquiry has been submitted successfully.' });
  } catch (err) {
    console.error('[submit] Request to Apps Script failed.', { name: err?.name || 'Error' });
    return fail(res, 502);
  } finally {
    clearTimeout(timer);
  }
};