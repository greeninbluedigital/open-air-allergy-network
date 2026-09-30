# How the site protects personal information

An internal reference: what protects visitors' and practices' information
today, and the gaps still being closed. Useful for the attorney, for
practices that ask how the inquiries they receive are handled, and for any
future due diligence. Last updated 2026-09-29.

**Not for the privacy policy.** The Privacy Notice should carry only a
short, general security statement, for example: "We use reasonable
administrative, technical, and physical safeguards to protect personal
information, including encryption in transit and at rest. No method of
transmission or storage is completely secure, so we can't guarantee
absolute security." Listing specific controls publicly turns each one into
a promise the FTC can hold OAAN to, goes stale with every change, and helps
attackers more than it reassures visitors.

## Protections in place

| Protection | What it does |
|---|---|
| Encryption in transit | Every page is served over HTTPS (certificates managed and renewed by Vercel). Plain HTTP redirects to HTTPS, and a Strict-Transport-Security header (2 years, including subdomains) tells browsers never to connect unencrypted. The database connection requires SSL, and every outside service is reached over HTTPS. |
| Encryption at rest | The database provider, Neon, encrypts stored data with AES-256 and keeps backups for 30 days. |
| Collecting less | No visitor accounts or passwords, no payment details, phone optional on the consumer form, and OAAN's own analytics log stores no visitor identifiers (no IP, cookie id, name, or email). |
| Hidden practice emails | The addresses where practices receive leads are never shown on the site or in the page code. |
| Email confirmation | Consumers confirm their email address before a lead is marked verified, which cuts down on people submitting someone else's address. |
| Safe emails | Anything a visitor types is converted to plain text before it goes into an email, so no one can inject links or code. |
| Spam protections | A hidden bot field, an email domain check, and link blocking on all three forms (`docs/lead-forms.md`). |
| Privacy controls | A consent banner and a working My Privacy Choices page. A browser's Global Privacy Control signal is honored automatically, and Google Tag Manager doesn't load for visitors who opt out (`docs/consent.md`). |
| Bot and scraper defenses | A hidden trap listing that exposes scrapers, plus the Vercel Firewall rules on the launch checklist (`docs/anti-scraping.md`). Vercel also blocks denial-of-service attacks automatically on every plan. |
| Protected background jobs | The scheduled jobs (sheet sync, reviews refresh, lead forwarding) require a secret key, so outsiders can't trigger them. |
| Leads stay with the chosen practice | A consumer's message goes only to the practice they contacted (plus the service providers that run the site). Never to a competing practice, and OAAN doesn't sell visitor data. |
| No test traffic in analytics | Google Tag Manager loads only on the live production site, not on local development or preview deployments. |

## Known weak spots

- **Email.** Confirmation emails and forwarded leads travel as ordinary
  email. Mail servers usually encrypt in transit, but it isn't guaranteed
  end to end, and a forwarded lead then sits in the practice's inbox.
- **Server logs.** Vercel's request and firewall logs include visitors' IP
  addresses, kept per Vercel's retention.

## If something goes wrong

The step-by-step response plan (spot, contain, assess, notify, record) is
in `docs/incident-response.md`.

## Gaps being closed

Tracked on the launch checklist (`docs/launch-checklist.md`, "Account and
data security").

| Gap | Why it matters | Fix |
|---|---|---|
| Two-factor authentication | The biggest real-world risk: someone getting into the Vercel, Neon, GitHub, Resend, Cloudflare, Cloudinary, Mapbox, or Google accounts would see everything, however secure the site is. Gmail receives leads. | Turn on 2FA for every one of those accounts. |
| Laptop encryption | The project's `.env` file on the owner's laptop holds the production database password, and local development uses the live database. | Full-disk encryption (Windows 11: Settings → Privacy & security → Device encryption, or BitLocker). |
| No retention period | Consumer messages and contact forms are kept indefinitely. Less stored data means less exposure in a breach, and the privacy policy should state a period. | Pick a period with counsel (`docs/legal-facts.md`, question 8), then automate deletion. |
| Shared test and live database | Local testing reads and writes production data. | Later, not urgent before launch: a separate test database (Neon "branches" make this straightforward). |
