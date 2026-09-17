# Trigger a sync from a button in the sheet

Yes — a bound Google Apps Script can call `/api/sync` directly, so you can
trigger a sync without waiting for the daily cron. Two ways to expose it in
the sheet; do the setup once, then use whichever you prefer.

## Setup (do this once)

1. In the "OAAN data sync" spreadsheet: **Extensions → Apps Script**.
2. Delete whatever's in the default `Code.gs` file and paste this in:

   ```javascript
   function runOAANSync() {
     const props = PropertiesService.getScriptProperties();
     const siteUrl = props.getProperty("SITE_URL");
     const secret = props.getProperty("CRON_SECRET");

     const response = UrlFetchApp.fetch(siteUrl + "/api/sync", {
       method: "post",
       headers: { Authorization: "Bearer " + secret },
       muteHttpExceptions: true,
     });

     const body = response.getContentText();
     SpreadsheetApp.getUi().alert(
       "Sync finished (status " + response.getResponseCode() + ")\n\n" + body,
     );
   }

   function onOpen() {
     SpreadsheetApp.getUi()
       .createMenu("OAAN Sync")
       .addItem("Run Sync Now", "runOAANSync")
       .addToUi();
   }
   ```

3. Set the two values the script reads, without hardcoding them into the
   visible code: **Project Settings** (gear icon, left sidebar) → **Script
   Properties** → **Add script property** →
   - `SITE_URL` = your deployed site's URL (currently
     `https://open-air-allergy-network.vercel.app`)
   - `CRON_SECRET` = the same value as `CRON_SECRET` in the project's `.env`
4. Save the script (the disk icon, or Ctrl/Cmd+S).
5. Reload the spreadsheet tab. A new **OAAN Sync** menu appears next to
   Help — that's `onOpen()` running automatically.

## Option A — menu item (simplest, no further setup)

Reloading the sheet after the setup above already gives you this:
**OAAN Sync → Run Sync Now** in the menu bar. Click it, and it runs the
sync and pops up an alert with the result (created/updated/errors, same
JSON the endpoint returns). No visible button to place — it's always
available from the menu.

## Option B — an actual clickable button on the sheet

If you'd rather have a literal button sitting in the spreadsheet body:

1. **Insert → Drawing**, draw a simple button shape (a rectangle with
   "Sync Now" text works fine), click **Save and Close**.
2. Click the inserted image once to select it, click the **⋮** (three dots)
   in its top-right corner → **Assign script**.
3. Type `runOAANSync` (must match the function name exactly, no
   parentheses) → **OK**.

Clicking the drawing now runs the same sync as the menu item.

## Notes

- Running this doesn't replace the daily automatic sync (`vercel.json`'s
  cron at 9am UTC) — it's just a way to trigger one on demand, e.g. right
  after you finish editing a batch of rows.
- The alert box shows the full result, including any `errors` array — if a
  row fails (bad slug, missing required field, etc.), it'll show up there
  by row identifier rather than silently vanishing.
- If you ever rotate `CRON_SECRET` (e.g. after regenerating it in `.env`
  and Vercel), update the Script Property to match, or this button will
  start getting `401 Unauthorized` back.
