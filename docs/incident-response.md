# Security incident and data breach response plan

What to do if personal information may have been exposed: a hacked
account, a leaked password or key, a vendor reporting a breach, or data
sent somewhere it shouldn't have gone. Keep it short enough to follow
under stress. Not legal advice; the attorney reviews this plan before
launch. Last updated 2026-09-29.

**The first call is the attorney.** Breach notification is required by law
in every US state, whether or not OAAN has a policy. Several states,
including California, count medical information tied to a name as
reportable, and consumer inquiries can contain it. Some states set
deadlines as short as 30 days. Don't notify anyone publicly, delete
evidence, or make promises before talking to counsel.

## 1. Spot it

Warning signs worth treating as a possible incident:
- A security alert or breach notice from a vendor (Vercel, Neon, Resend,
  Google, GitHub, Cloudflare, Cloudinary, Mapbox).
- A login, password reset, or 2FA prompt you didn't start, on any of those
  accounts.
- Database activity you can't explain: records changed or deleted, or a
  sudden spike in reads.
- Unusual form traffic: a burst of submissions, or leads arriving somewhere
  they shouldn't.
- A practice or consumer reporting a lead or email that didn't come from
  them, or a message reaching the wrong practice.
- The `.env` file, or a key from it, showing up anywhere public (a
  screenshot, a shared file, a code commit).
- A lost or stolen laptop that holds the project.

Write down the time you noticed and what you saw. Screenshots help.

## 2. Contain it

Stop further exposure first. Change only what's affected, but when unsure,
change it.

**Account passwords:** reset the password and sign out other sessions on
the affected account. Confirm 2FA is still on and wasn't changed.

**Site keys.** Each lives in Vercel (Project → Settings → Environment
Variables) and in the local `.env` file. After changing any of them in
Vercel, **redeploy** so the site uses the new value.

| Key | Where to generate a new one | Also update |
|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Neon: reset the database role's password | Vercel, local `.env` |
| `CRON_SECRET` | Any new long random string | Vercel, local `.env`, GitHub repo secret `CRON_SECRET`, the Google Sheet's Apps Script (Script Properties) |
| `RESEND_API_KEY` | Resend: delete the old key, create a new one | Vercel, local `.env` |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Google Cloud: delete the service account key, create a new one | Vercel, local `.env` (also `GOOGLE_SERVICE_ACCOUNT_EMAIL` if the account changes) |
| `GOOGLE_PLACES_API_KEY` | Google Cloud: regenerate the API key | Vercel, local `.env` |
| `MAPBOX_TOKEN`, `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox: rotate the tokens | Vercel, local `.env` |

(`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SITE_URL`, `EMAIL_FROM_ADDRESS`, and
`GOOGLE_SHEETS_SPREADSHEET_ID` are identifiers, not secrets.)

**Gmail "Send mail as" key:** a separate Resend API key ("Gmail send-as",
sending access only) lets Gmail send as hello@ and other domain addresses.
It isn't used by the site. If the Gmail account may be compromised, delete
that key in Resend, create a new one, and update the password under Gmail →
Settings → Accounts and Import → Send mail as → edit info, for each address.
Deleting it doesn't affect the site's lead emails.

**Stop the forms temporarily**, if form submissions are part of the
problem: in the Vercel Firewall, add a custom rule "Request Method equals
POST" → **Deny**, placed **below** the `/api/` Bypass rule
(`docs/anti-scraping.md`), and publish. It takes effect within seconds,
with no deploy. The site's forms stop accepting submissions, while pages
and the `/api/` jobs (which the bypass rule lets through) keep working. On
the Hobby plan's 3-rule limit, temporarily turn off the rate-limit rule to
make room. Remove the rule once the problem is fixed.

**A lost laptop:** change the database password and every key above, and
all account passwords saved on it.

## 3. Assess it

Work out, as precisely as possible:
- **What data:** which forms or tables (consumer inquiries, practice
  leads, About messages), and which fields. `docs/legal-facts.md` lists
  what each form collects.
- **Whose, and how many people.**
- **Where they live.** This decides which state laws apply. Leads don't
  record a consumer's state, but the practice they contacted, and any
  searched zip in the page path, are good indicators.
- **When it started and ended**, and whether the data was actually seen or
  taken, or only exposed.
- **Which practices** received the inquiries involved.

Keep the evidence: vendor logs, Vercel firewall and request logs, and
screenshots. Don't delete records or logs to "clean up".

## 4. Notify

With the attorney deciding who, when, and how:
- **Affected people**, as state laws require.
- **State attorneys general** where required (California, for example,
  when more than 500 residents are affected).
- **Practices** whose consumer inquiries were involved, and anyone OAAN's
  practice agreements require notifying.
- **Vendors** involved, if the incident started on their side or they can
  help.

## 5. Record and fix

Keep a short written record in a private place (not this public repo):
- What happened, when it was noticed, and when it was contained
- What data and how many people were affected
- Every key and password changed
- Who was notified, and when
- What was fixed so it can't happen the same way again

Then update `docs/data-protection.md` and this plan with anything learned.

## Contacts

| Who | How |
|---|---|
| Attorney | To add once engaged |
| Vercel support | vercel.com/help |
| Neon support | Neon console → Support |
| Resend support | resend.com/help |
| Google Workspace/Gmail account recovery | accounts.google.com/signin/recovery |
