# New client onboarding checklist

One pass per practice, top to bottom. Column letters are the Providers tab.
Specs and limits live in [tiers-and-pricing.md](tiers-and-pricing.md)
("Content specs for onboarding") and [image-guide.md](image-guide.md).

## 1. Before anything goes live

- [ ] Practice agreement signed, minimum term noted (Featured and Full
      Profile 4 months, Verified 6, Academic 1 year, Geo-Extension 1)
- [ ] First payment set up. **Vercel is on Pro** (required before the
      first paying client)
- [ ] Founding Member? Check no one else holds it in that county or within
      about 10 miles

## 2. Collect from the practice

- [ ] **Notification Email** (where leads go, never shown) and the phone,
      website and address as they want them shown
- [ ] Photos: main 4:5 portrait. Full Profile and Featured also: square
      card photo or logo, up to 4 extra photos
- [ ] Bio material (we write or polish it), treatments, hours, ILIT
      schedule notes. Full Profile and up, plus Academic: 8 to 10 FAQ answers
- [ ] Video or phone consults offered? Show the badge on their page?
- [ ] Featured: Google Business listing (for the Place ID) and their
      **custom message** (informational only: no prices, discounts, free
      services or results claims)
- [ ] Geo-Extension: target metros and travel notes (nearest airports)

## 3. Sheet and sync

- [ ] Slug (A), typed once and never changed: `{brand}-{city}-{state}`,
      e.g. `allergenix-west-des-moines-ia`. Two offices in one city: add the
      street before the state, e.g. `bay-area-allergy-asthma-st-petersburg-central-ave-fl`
- [ ] Upload photos to Cloudinary, paste the URLs (Z, AA, AB)
- [ ] Fill the row: Tier (L), add-ons (M, N, O), bios (X, Y), hours (AC,
      AD), treatments (AE), consults (T to V), message (W), reviews (AF, AG).
      Active (Q) `Y`, Demo (AP) `N`
- [ ] Other tabs as needed: FAQs, SEM Landing Pages (Geo-Extension),
      Practitioners (if they'll write articles)
- [ ] **OAAN Sync → Run Sync Now.** Read the warnings in the result

## 4. Check it live

- [ ] Open their page: name, badges, photos, bio, hours, FAQs, contact links
- [ ] Search their zip: card, map pin, and the right placement for the tier
- [ ] Send one test message through their form (tell the practice first,
      write TEST in it). Confirm it reached them, then delete the test lead
      in Neon (production branch)
- [ ] **Google:** Search Console → URL Inspection → paste their page URL →
      **Request Indexing**
- [ ] **Bing:** automatic. The sync result's "indexing" line should list
      the page as submitted

## 5. Hand-off

- [ ] Email the practice their page link (and the Network Member logo,
      once it exists)
- [ ] Full Profile and Featured: set up SEM, and put the quarterly
      ghost-written article on the calendar
- [ ] Calendar reminders: end of the minimum term, and a check-in a month in

## Upgrades, downgrades and cancellations

- [ ] Change Tier (L), or set Active (Q) to `N`, then sync
- [ ] Remove anything the new tier doesn't include (custom message, Learn
      Page Credits tab row) so the sync warnings stay clean
- [ ] Request Indexing for their page again in Search Console
- [ ] Never change a live practice's slug. If one must change, ask Claude
      to add a redirect from the old one (`src/lib/slugRedirects.ts`)
