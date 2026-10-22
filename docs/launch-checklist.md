# Launch checklist

The site has been live on openairallergynetwork.com since 2026-10-02. This
file keeps what's still open from launch, the decisions that replaced the
original plan, and a short record of what was done. Day to day open items
live in [punch-list.md](punch-list.md). Last updated 2026-10-21.

**Decisions of 2026-10-09 that changed this list:** OAAN runs as a
non-commercial consumer information site, so it **stays on Vercel's Hobby
plan** (no Pro upgrade until a practice pays) and **works without a lawyer**
(no revenue), erring on the cautious side of health data laws (Washington,
Nevada and Connecticut get an email button instead of the contact form).
Everything that depended on counsel or on charging practices moved to the
last section below.

## Still open

- [ ] **Two-factor authentication on every account** that can reach
      visitor data or the site: Vercel, Neon, GitHub, Resend, Cloudflare,
      Cloudinary, Mapbox, and both Google accounts (Gmail receives leads).
- [ ] **Encrypt the laptop that holds the site's `.env` file** (Windows:
      Settings → Privacy & security → Device encryption, or BitLocker). It
      contains the production database password.
- [ ] **Pick a retention period** for patient inquiries and contact
      messages ([legal-facts.md](legal-facts.md), question 8). Your call now
      that there's no counsel; then ask Claude to delete older ones
      automatically.
- [ ] **Tag Manager and GA4 setup** (parked; step by step in
      [gtm-ga4-setup.md](gtm-ga4-setup.md)): data layer variables, trigger,
      GA4 event tag, then in GA4 custom dimensions, key events, 14-month
      data retention, internal traffic filter and the **Search Console
      link**.
- [ ] **Google Alerts** for `"Quillmoor Allergy"` and `"555-0142"` (scraper
      trap, [anti-scraping.md](anti-scraping.md)).

## Settled

- **Legal pages:** the six published pages (Privacy Policy, Terms, Cookie
  Policy, My Privacy Choices, Medical Disclaimer, Accessibility Statement)
  stay as published, without an attorney review. What changed from the
  Rocket Lawyer drafts is in [legal-pages/README.md](legal-pages/README.md).
- **Consent mode:** stays **opt-out** (the current setting, `CONSENT_MODE`
  in `src/lib/consent.ts`); banner and My Privacy Choices are live
  ([consent.md](consent.md)).
- **Incident response:** the plan in
  [incident-response.md](incident-response.md) stands without counsel.
- **Vercel Firewall:** bypass for `/api/` at the top, **Bot Protection on
  Challenge** (2026-10-21), the provider-page **rate limit stays on Log**
  (Hobby keeps only 24 hours of firewall history, so there's nothing to
  calibrate against, 2026-10-21), scraper trap on Log (never Deny), AI bots
  allowed. Command-line requests to site pages now get challenged, so
  check pages and run the hero-photo warm-up in a real browser.
- **Core Web Vitals:** lab scores were 89 to 96 at launch; the homepage's
  mobile score was 79 on 2026-10-21. No changes until Search Console's
  real-visitor report flags pages (punch list).
- **Logo:** the site logo is in the header and the Organization structured
  data (`public/logo*.png`, `logo*.svg`).

## If OAAN starts charging practices

Not needed while every practice is on a free trial. Do these before the
first payment.

- [ ] **Upgrade Vercel to Pro** (Hobby is for non-commercial use only).
      Then ask Claude to move the 15-minute lead-forwarding job from GitHub
      Actions to a Vercel cron (Hobby only allows daily crons), which also
      removes the dependency on GitHub's runners (they failed for hours on
      2026-10-05).
- [ ] **Practice agreement:** minimum terms, no lead or traffic guarantees,
      SEM at OAAN's discretion, cancellation, custom message responsibility
      ([legal-facts.md](legal-facts.md) questions 10 and 15).
- [ ] **Revisit hiring a lawyer** for the open questions in
      [legal-facts.md](legal-facts.md): what the badges mean, the Network
      Member logo license, lead-data language in the Privacy Notice, a Terms
      clause against scraping and bulk copying, consent mode, retention,
      and the incident response plan.
- [ ] **Every paid practice has a Notification Email** (the sync warns
      when one is missing). On trial pages it's shown publicly, so only an
      address the practice publishes on its own website.
- [ ] **Network Member logo** for paying practices (sizes in
      [image-guide.md](image-guide.md)).

## Done (record)

- Fake blog stubs deleted (2026-09-30); example practices hidden with
  Demo/Example Listing `Y`; example author credits removed; test leads and
  messages deleted.
- privacy@openairallergynetwork.com live (2026-09-30).
- GA4 and Google Tag Manager installed (GTM-P3J8T24W → GA4 G-S8P8XYEGMP,
  receiving data since 2026-09-29).
- Pitch deck final in Google Slides (2026-10-06).
- Firewall rules created in Log mode (2026-10-06).
- **Domain migration (2026-10-02):** openairallergynetwork.com connected
  in Vercel with Cloudflare records on DNS only (gray cloud) and `www`
  redirecting to the bare domain; `NEXT_PUBLIC_SITE_URL`, the GitHub
  `SITE_URL` variable and the Apps Script `SITE_URL` property updated;
  first sync on the live domain; the blanket robots disallow removed
  (scraper-trap disallow kept) and the old vercel.app address redirecting
  (`/api/` excluded for the cron jobs); `sitemap.xml` read by Google Search
  Console and Bing Webmaster Tools (2026-10-03). Don't delete the
  `google-site-verification` TXT record in Cloudflare.
