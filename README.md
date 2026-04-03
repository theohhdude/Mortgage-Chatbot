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
cd C:\Github\mortgage-lead-chatbot
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Next upgrades

- POST the `lead` object in `script.js` to your backend or CRM webhook
- Add consent language and TCPA-compliant contact opt-in copy
- Add ZIP code, veteran status, occupancy, or self-employed branching if your funnel needs deeper qualification
- Connect rate calculators or appointment booking once a visitor is warmed up
