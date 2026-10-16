/**
 * Medicus waitlist → Google Sheet.
 *
 * Paste this into Extensions → Apps Script on the Google Sheet that will hold
 * the waitlist, then deploy it as a web app (see README.md). The landing page
 * POSTs each sign-up here; this script appends it as a row. Someone who signs
 * up again with the same email updates their existing row instead of adding
 * a duplicate. Columns you add to the right of "Updated" (Status, Notes, …)
 * are yours: the script never touches them.
 */

var SHEET_NAME = "Waitlist";
var HEADERS = ["Joined", "Name", "Email", "Role", "Organisation", "Country", "Message", "Updated"];
var MAX_LEN = 1000;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var p = (e && e.parameter) || {};

    // Honeypot: a hidden field real visitors never fill in. Pretend success so bots move on.
    if (p.website) return reply({ ok: true });

    var entry = {
      name: clean(p.name),
      email: clean(p.email).toLowerCase(),
      role: clean(p.role),
      organization: clean(p.organization),
      country: clean(p.country),
      note: clean(p.note)
    };
    if (!entry.name || !entry.role || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) {
      return reply({ ok: false, error: "invalid" });
    }

    lock.waitLock(10000);
    var sheet = getSheet();
    var now = new Date();
    var row = [now, entry.name, entry.email, entry.role, entry.organization, entry.country, entry.note, now];

    var existing = findRowByEmail(sheet, entry.email);
    if (existing) {
      row[0] = sheet.getRange(existing, 1).getValue() || now; // keep the original join date
      sheet.getRange(existing, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: "server" });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

// Visiting the /exec URL in a browser shows this, which confirms the deployment works.
function doGet() {
  return reply({ ok: true, service: "medicus-waitlist" });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function findRowByEmail(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var emails = sheet.getRange(2, 3, last - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === email) return i + 2;
  }
  return 0;
}

// Trim, cap length, and stop spreadsheet formula injection (=, +, -, @ at the start).
function clean(v) {
  v = String(v == null ? "" : v).trim().slice(0, MAX_LEN);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
