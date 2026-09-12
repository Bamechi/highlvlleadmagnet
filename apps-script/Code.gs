// Standalone Apps Script — opens the target sheet by ID.
const SHEET_ID = "1yXlFl50aI6wdS0MwNcbxyH3d-jvazw5IuBnd24qgBAY";
const TAB_NAME = "Submissions";

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(TAB_NAME) || ss.getSheets()[0];
}

function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents);

  if (data.action === "update_tier") {
    updateTierStatus(sheet, data.email, data.tier, data.plan);
    return json({ status: "tier_updated" });
  }

  sheet.appendRow([
    data.email, data.topic, data.mode,
    JSON.stringify(data.filters || {}),
    data.tier, "", data.resultsCount, data.timestamp,
  ]);
  return json({ status: "logged" });
}

// Writes tier into column E and the plan name into column F (Results).
function updateTierStatus(sheet, email, tier, plan) {
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (values[i][0] === email) {
      sheet.getRange(i + 1, 5).setValue(tier);
      if (plan) sheet.getRange(i + 1, 6).setValue(plan);
      return;
    }
  }
  sheet.appendRow([email, "", "", "{}", tier, plan || "", 0, new Date().toISOString()]);
}

function doGet(e) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const action = e && e.parameter ? e.parameter.action : null;

  // Access gate: does this email have a paid plan?
  if (action === "check_tier") {
    const email = e.parameter.email;
    for (let i = values.length - 1; i >= 1; i--) {
      if (values[i][0] === email && values[i][4] === "paid") {
        return json({ tier: "paid", plan: values[i][5] || "" });
      }
    }
    return json({ tier: "free" });
  }

  // Monthly cron: every paid subscriber's most recent topic.
  const latestByEmail = {};
  for (let i = 1; i < values.length; i++) {
    const [email, topic, mode, filters, tier] = values[i];
    if (tier === "paid" && topic) latestByEmail[email] = { email, topic, mode, filters };
  }
  return json(Object.values(latestByEmail));
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run THIS to test, not doPost. Writes one dummy row.
function testWrite() {
  getSheet().appendRow(["test@test.com", "test topic", "unified", "{}", "free", "", 5, new Date().toISOString()]);
  Logger.log("Wrote test row.");
}
