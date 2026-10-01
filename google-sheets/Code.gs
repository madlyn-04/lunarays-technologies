/**
 * Google Apps Script receiver for the Lunarays CTA form.
 * Set SPREADSHEET_ID and SHEETS_WEB_APP_TOKEN in Project Settings > Script properties.
 */
function doPost(e) {
  try {
    var settings = PropertiesService.getScriptProperties();
    var expectedToken = settings.getProperty('SHEETS_WEB_APP_TOKEN');
    var spreadsheetId = settings.getProperty('SPREADSHEET_ID');
    var payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (!expectedToken || !spreadsheetId || payload.token !== expectedToken) {
      return jsonResponse({ success: false, error: 'Unauthorized or not configured.' });
    }

    var values = [
      safeCell(payload.name, 120),
      safeCell(payload.email, 254),
      safeCell(payload.company, 160),
      safeCell(payload.phone, 40),
      safeCell(payload.service, 120),
      safeCell(payload.message, 3000)
    ];
    if (!values[0] || !values[1] || !values[3]) {
      return jsonResponse({ success: false, error: 'Required fields are missing.' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName('Website Enquiries') || spreadsheet.insertSheet('Website Enquiries');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Submitted At', 'Full Name', 'Email', 'Company / Organization', 'Phone', 'Service', 'Query Details']);
        sheet.setFrozenRows(1);
      }
      sheet.appendRow([new Date()].concat(values));
    } finally {
      lock.releaseLock();
    }
    return jsonResponse({ success: true });
  } catch (error) {
    // Do not log the incoming payload or any contact details.
    console.error('CTA enquiry could not be stored: ' + (error && error.name ? error.name : 'Error'));
    return jsonResponse({ success: false, error: 'Could not store enquiry.' });
  }
}

function safeCell(value, maxLength) {
  var text = typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
  // Prevent untrusted form values from being interpreted as spreadsheet formulas.
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
