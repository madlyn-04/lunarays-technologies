// GET /api/health -> quick check that the function is live and env vars are loaded.
// Returns only true/false flags. Never returns secret values.
const { sendJson } = require('./_lib/common');

module.exports = function handler(req, res) {
  sendJson(res, 200, {
    ok: true,
    sheetsUrlSet: !!process.env.SHEETS_WEB_APP_URL,
    sheetsTokenSet: !!process.env.SHEETS_WEB_APP_TOKEN
  });
};