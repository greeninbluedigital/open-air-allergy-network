# Launch checklist

Everything that has to happen before or at public launch, in order. Check
items off here as they're done. Details live in the linked docs. Last
updated 2026-09-29.

## Before launch

- [ ] **Upgrade Vercel to Pro** ($20/month per team member). The free Hobby
      plan is for non-commercial use only, so this has to happen before any
      practice pays for a listing.
- [ ] **Delete the two fake blog stubs** ("5 Things to Know Before Starting
      ILIT" and "ILIT Growth in U.S. Allergy Practices").
- [ ] **Clear test data:** test providers in the sheet, and every article
      credit (including the test "Medically reviewed by" credit on the
      comparison article) until there are paying clients.
- [ ] **Legal pages with counsel:** Privacy Notice (lead-data language,
      possible consent checkbox) and Terms of Use, including a clause
      prohibiting scraping and bulk copying ([anti-scraping.md](anti-scraping.md)).
- [ ] **GA4 and Google Tag Manager:** create the accounts and add the
      container ID as `NEXT_PUBLIC_GTM_ID` in Vercel ([analytics.md](analytics.md)).

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

- [ ] Review the Firewall overview. If real visitors aren't being flagged,
      switch **Bot Protection** to **Challenge**.
- [ ] Check what real visitors' request rates look like, adjust the rate
      limit if needed, then switch it to **Challenge**.
- [ ] Link Search Console to the GA4 property.
- [ ] From then on, run the hero-photo warm-up through a real browser.
      Bot Protection challenges command-line requests.
