# Mortgage Lead Chatbot

A lightweight front-end prototype for a mortgage lead generation site. It includes:

- A polished landing section for a mortgage marketing page
- A conversational chatbot that branches for purchase vs refinance intent
- Lead qualification prompts for loan type, budget, timeline, credit, and down payment or equity
- A final lead summary panel that shows the data you would typically send to a CRM

## Run locally

Open `index.html` in a browser.

If you want a local server from PowerShell:

```powershell
cd C:\Github\Mortgage-Chatbot
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Send leads to Google Sheets

The chatbot builds a `lead` object in `script.js`. When the flow finishes, `submitLeadToGoogleSheets()` posts that lead to a Google Apps Script web app.

1. Create a Google Sheet.
2. In the Sheet, open `Extensions > Apps Script`.
3. Paste this script:

```javascript
const SHEET_NAME = "Leads";

const HEADERS = [
  "submittedAt",
  "source",
  "fullName",
  "email",
  "phone",
  "intent",
  "firstTimeBuyer",
  "purchasePropertyUse",
  "refinancePurpose",
  "state",
  "creditRange",
  "downPayment",
  "purchasePriceRange",
  "desiredHomeType",
  "bankruptcy",
  "veteran",
  "borrowAmount",
  "equity",
  "homeValue",
  "refinancePropertyUse",
  "currentHomeType",
  "currentMortgage",
  "interestRate",
  "secondMortgage",
  "amountOwed",
  "adverseCreditEvents",
  "bestContactTime",
  "wantsApplication",
  "contactConsent",
  "consentDisclosure",
  "consentedAt"
];

function doPost(e) {
  const sheet = getLeadSheet();
  const payload = JSON.parse(e.parameter.payload || "{}");
  const row = HEADERS.map((header) => payload[header] || "");

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  return sheet;
}
```

4. Click `Deploy > New deployment`.
5. Choose `Web app`.
6. Set `Execute as` to `Me`.
7. Set `Who has access` to `Anyone`.
8. Deploy and copy the web app URL.
9. In `script.js`, paste that URL into:

```javascript
const googleSheetsWebAppUrl = "";
```

## Next upgrades

- Add spam protection or server-side validation before sending paid traffic to the page
- Add consent language and TCPA-compliant contact opt-in copy
- Add ZIP code, veteran status, occupancy, or self-employed branching if your funnel needs deeper qualification
- Connect rate calculators or appointment booking once a visitor is warmed up
