# Launch checklist

Everything that has to happen before or at public launch, in order. Check
items off here as they're done. Details live in the linked docs. Last
updated 2026-10-02.

## Before launch

- [ ] **Upgrade Vercel to Pro** ($20/month per team member). The free Hobby
      plan is for non-commercial use only, so this has to happen before any
      practice pays for a listing.
- [x] **Delete the two fake blog stubs** (done 2026-09-30).
- [ ] **Hide the example practices:** set Demo/Example Listing (column AP)
      to `Y` on all six example rows, then sync. They stay reachable by
      direct link for sales demos.
- [ ] **Remove the example author credits:** Dr. Helen Seuss on the
      comparison article (Learn Page Credits tab) and on the
      ilit-vs-traditional-allergy-shots blog article (ask Claude).
- [ ] **Delete test leads and messages:** the "Rivera Allergy Clinic" For
      Practices lead (2026-09-15), the About page inquiry, and the test
      contact-form lead to Avant Allergy (ask Claude).
- [ ] **Every paid practice has a Notification Email** in the sheet (the
      sync warns when one is missing).
- [x] **privacy@openairallergynetwork.com created** and working (2026-09-30).
      It's the privacy contact on the Privacy Policy, Cookie Policy, and My
      Privacy Choices page.
- [ ] **Attorney review of all six published legal pages** (Privacy Policy,
      Terms, Cookie Policy, My Privacy Choices, Medical Disclaimer,
      Accessibility Statement). Every change from the Rocket Lawyer drafts,
      and what to check on the two pages written for the site, is in
      [legal-pages/README.md](legal-pages/README.md).
- [ ] **Practice agreement** (drafted on Rocket Lawyer, then counsel):
      minimum terms, no lead or traffic guarantees, SEM at OAAN's
      discretion, cancellation terms, custom message responsibility
      ([legal-facts.md](legal-facts.md) questions 10 and 15).
- [ ] **Legal pages with counsel:** start from the facts and open questions
      in [legal-facts.md](legal-facts.md) (15 questions, including what the
      Verified, Founding Member and Academic badges mean, and the Network
      Member logo license). Privacy Notice (lead-data language,
      possible consent checkbox) and Terms of Use, including a clause
      prohibiting scraping and bulk copying ([anti-scraping.md](anti-scraping.md)).
      The Cookie Policy should list GA4's cookies and the site's `oaan_attr`
      campaign cookie ([gtm-ga4-setup.md](gtm-ga4-setup.md), section 5).
- [ ] **Consent mode decided with counsel:** opt-out (current) or opt-in,
      plus the banner and My Privacy Choices wording
      ([consent.md](consent.md)). The banner and controls are built.
- [x] **GA4 and Google Tag Manager installed** (GTM-P3J8T24W → GA4
      G-S8P8XYEGMP, confirmed receiving data 2026-09-29).
- [ ] **Tag Manager and GA4 setup** (step by step in
      [gtm-ga4-setup.md](gtm-ga4-setup.md)): 9 data layer variables, one
      trigger, one GA4 event tag, preview, publish. Then in GA4: custom
      dimensions, key events, 14-month data retention, internal traffic
      filter, Search Console link, and a Google Ads link once that account
      exists.

## Brand and sales

- [ ] **Site logo and Network Member logo** from the graphic designer
      (sizes in [image-guide.md](image-guide.md)). Then Claude adds the site
      logo to the header and structured data.
- [ ] **Pitch deck v3:** add the phone number on the Contact slide.

## Account and data security (can be done now)

- [ ] **Two-factor authentication on every account** that can reach
      visitor data or the site: Vercel, Neon, GitHub, Resend, Cloudflare,
      Cloudinary, Mapbox, and both Google accounts (Gmail receives leads).
- [ ] **Encrypt the laptop that holds the site's `.env` file** (Windows:
      Settings → Privacy & security → Device encryption, or BitLocker). It
      contains the production database password.
- [ ] **Incident response plan reviewed by counsel**
      ([incident-response.md](incident-response.md)), and the attorney's
      contact added to it.
- [ ] **Decide a retention period** for patient inquiries and contact
      messages with counsel ([legal-facts.md](legal-facts.md), question 8),
      then have the old ones deleted automatically.

## Vercel Firewall (can be done now, in Log mode)

Rules belong to the Vercel project, so anything set up before the domain
move carries over. Full settings in [anti-scraping.md](anti-scraping.md).

- [ ] **Rule 1, at the top: Bypass for `/api/`.** Keeps the sheet sync,
      reviews refresh, lead-forwarding job, and sheet sync button from being
      blocked once Bot Protection is on Challenge.
- [ ] **Rule 2: rate limit** on `/find-an-ilit-provider` (60 seconds, 120
      requests, by IP), action **Log**.
- [ ] **Rule 3: scraper trap** on the Quillmoor page path, action **Log**
      (never Deny).
- [ ] **Bot Protection** (Bot Management section): **Log**.
- [ ] **AI Bots:** leave on **Allow** (protects GEO).
- [ ] **Google Alerts** for `"Quillmoor Allergy"` and `"555-0142"`.

## Domain migration (launch day)

- [ ] Connect openairallergynetwork.com in Vercel. In Cloudflare, set the
      records pointing to Vercel to **DNS only (gray cloud)**. The orange
      cloud proxy breaks Vercel Bot Protection.
- [ ] Change `NEXT_PUBLIC_SITE_URL` in Vercel to
      `https://openairallergynetwork.com`, then **redeploy** (it's built
      into the site at deploy time).
- [ ] Update the GitHub repo variable `SITE_URL` (Settings → Secrets and
      variables → Actions → Variables) for the lead-forwarding job.
- [ ] In `src/app/robots.ts`, remove the blanket `/` disallow. **Keep the
      scraper-trap disallow.**
- [ ] Submit `sitemap.xml` in Google Search Console. Don't delete the
      `google-site-verification` TXT record in Cloudflare.
- [ ] Run a Core Web Vitals check (PageSpeed Insights) on the live domain.

## About a week after launch

- [ ] **Switch Bot Protection to Challenge mode.** Vercel dashboard →
      project → Firewall → Rules → Bot Management → Bot Protection →
      **Challenge** → Review Changes → Publish. First check the Firewall
      overview: if a week of Log mode shows real visitors being flagged,
      hold off and investigate. This is what turns on the 1-hour security
      cookie the Cookie Policy already lists
      ([legal-facts.md](legal-facts.md), cookie table).
- [ ] Check what real visitors' request rates look like, adjust the rate
      limit if needed, then switch it to **Challenge**.
- [ ] Link Search Console to the GA4 property.
- [ ] From then on, run the hero-photo warm-up through a real browser.
      Bot Protection challenges command-line requests.
