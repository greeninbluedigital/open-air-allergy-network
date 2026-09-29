# Anti-scraping: what's in place and how to run it

The goal is to keep a competitor from cheaply copying the practice list into
a rival directory. Anything a browser can see can be scraped eventually, so
the plan is to make bulk collection slow and detectable, and copying
provable. Last updated 2026-09-29.

## Why the list can't simply be hidden

- `sitemap.xml` lists every provider page. Google needs it to find them.
- Each Find a Provider search covers up to 200 miles (600 in the fallback),
  so a few dozen zip searches cover the country.
- Provider pages carry structured data (name, address, phone) because it
  helps search results.

None of that should change. The protections below work around it.

## Layer 1: Vercel Firewall (dashboard settings, no code)

All in the Vercel dashboard: project → **Firewall** → **Rules**. Each change
needs **Review Changes** → **Publish**, and every version can be restored
from the audit log.

**Timing.** Firewall rules belong to the Vercel project, not to a domain, so
anything set up now carries over to openairallergynetwork.com automatically.
Set up every rule now in **Log** mode (except the bypass, which is always
Bypass). Log never blocks anything, and the trap starts catching scrapers
already probing the vercel.app address. Switch Bot Protection and the rate
limit to **Challenge** only after launch plus a week of real traffic, since
there's nothing to calibrate against before then. That's 3 custom rules
(bypass, rate limit, trap), exactly Hobby's limit.

0. **Bypass rule for the site's own automated jobs** (custom rule, must sit
   above the others):
   - If: Request Path starts with `/api/`
   - Then: **Bypass**
   - Why: four jobs call the site without a browser, and Bot Protection's
     Challenge mode would block them. They are Vercel's daily sheet sync
     (`/api/sync`), the Google reviews refresh (`/api/reviews/refresh`),
     the GitHub Actions job that forwards unconfirmed leads every 15 minutes
     (`/api/leads/process-pending`), and the sheet's sync button
     (`/api/sync`). Every `/api/` route checks `CRON_SECRET`, needs a
     one-time token (the lead confirmation link), or only records analytics
     events, so skipping bot checks there is safe.
1. **Bot Protection**, under Bot Management. Set it to **Log** first.
   After a week of watching the Firewall overview for real visitors being
   flagged, switch it to **Challenge**. Google, Bing, and other verified
   crawlers are exempt automatically, so search rankings aren't affected.
   Once it's on Challenge, the hero-photo warm-up has to run through a real
   browser rather than command-line requests.
2. **Rate limit on provider pages** (custom rule, action "Rate Limit"):
   - If: Request Path starts with `/find-an-ilit-provider`
   - Fixed window, 60 seconds, 120 requests, keyed on IP
   - Then: **Log** at first
   - A real visitor can send 20+ requests from one search, because Next.js
     preloads the provider pages linked from the results. Check what real
     traffic looks like in the Firewall overview before switching the
     action to **Challenge**, and adjust the limit if real visitors come
     close to it.
3. **Scraper trap rule** (custom rule):
   - If: Request Path equals
     `/find-an-ilit-provider/quillmoor-allergy-sinus-center-wichita`
   - Then: **Log**. Keep it on Log, not Deny: the trap only proves copying
     if the scraper actually receives the fake practice. The log shows the
     IP and user agent of every visitor that ignored robots.txt. Block
     repeat offenders under **IP Blocking**.

**AI bots.** Left on **Allow** on purpose. Vercel's AI Bots rule is
all-or-nothing, and blocking it would also shut out ChatGPT, Perplexity, and
Claude search, which the GEO strategy depends on. A competitor wouldn't use
those bots to scrape anyway. If training crawlers (GPTBot, ClaudeBot, CCBot,
Google-Extended) should ever be blocked while AI search stays allowed, add
them to `src/app/robots.ts`.

**Plan limits.** Vercel's Hobby plan is for non-commercial use only, so the
site needs **Pro** before practices pay for listings. Hobby allows 3 custom
rules (only 1 of them a rate limit) and 3 blocked IPs, which fits the setup
above. Pro allows 40 rules and 100 blocked IPs, and adds persistent actions
(automatically blocking a client for a set time after it trips a rule).

**Cloudflare.** DNS for openairallergynetwork.com is on Cloudflare. When the
domain is connected, the records pointing to Vercel must be **DNS only (gray
cloud)**. Cloudflare's proxy (orange cloud) in front of Vercel breaks Bot
Protection.

## Layer 2: the scraper trap ("trap street")

A fictional practice that only a rule-breaking scraper can reach:

| Field | Value |
|---|---|
| Name | Quillmoor Allergy & Sinus Center |
| Address | 1847 Tennyfield Pkwy, Suite 210, Wichita, KS 67206 |
| Phone | (316) 555-0142 (the 555-01xx range is reserved for fiction) |
| Page | `/find-an-ilit-provider/quillmoor-allergy-sinus-center-wichita` |

How it works:
- Hidden links to it sit in the site footer and in every search results
  list. Real visitors, screen readers, and keyboards never reach them. An
  HTML scraper collecting provider links picks them up.
- `robots.txt` disallows the page and it's `noindex`, so Google and other
  well-behaved crawlers stay out. It's never in the sitemap or real search
  results, so no patient can find it or try to contact it.
- The page looks like a Freemium listing, structured data included, so a
  scraper stores it like any real practice.

**Watching for copies.** Set up Google Alerts for `"Quillmoor Allergy"` and
`"555-0142"`, and search both now and then. "Quillmoor" returned no results
anywhere when it was chosen (2026-09-29), so any hit is a copy of this site.
Screenshot and save any copy you find, with the date, and take it to
counsel.

**Rules for the trap:** never add Quillmoor to the Providers tab (or any
other synced tab) of the Google Sheet, never change its values (they're the
fingerprint), and keep its `robots.txt` disallow when the blanket
pre-launch disallow is lifted. A reference note in a tab the sync doesn't
read, such as "Scraper Trap (do not sync)", is fine: the sync only reads
the tabs listed in `docs/sheet-columns.md` and ignores the rest.

Code: `src/lib/scraperTrap.ts` (values), `src/components/ScraperTrapLink.tsx`
(hidden link), `src/app/(site)/find-an-ilit-provider/quillmoor-allergy-sinus-center-wichita/page.tsx`
(the page), `src/app/robots.ts` (disallow).

## Layer 3: legal

- **Terms of Use:** add a clause prohibiting scraping, crawling, and bulk
  copying of directory data. To be drafted with counsel alongside the other
  legal pages.
- **What's protectable:** practice names, addresses, and phone numbers are
  facts, which generally aren't copyrightable in the US. The site's original
  writing is (Learn articles, summaries, FAQs). Counsel can advise on
  enforcement, such as DMCA takedowns for copied content and Terms of Use
  claims for scraping.

## Already true

- No bulk data feed: nothing on the site returns the whole practice list in
  one request.
- Practice email addresses never appear in page source.
