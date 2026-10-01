# Tiers, pricing and onboarding specs

The sales reference: what each package costs, what a practice gets, and what
to collect from them. Internal only (prices aren't shown on the site).
Last updated 2026-10-01. Lead-quality selling points are in
`docs/lead-forms.md`; reporting metrics are in `docs/analytics.md`; photo
sizes are in `docs/image-guide.md`.

## Pricing (draft, 2026-10-01)

| Package | Price | Sheet setup |
|---|---|---|
| Featured | $1,250/month | Tier `Featured` |
| Full Profile | $950/month | Tier `Full Profile` |
| Academic package | $400/month | Tier `Academic` |
| Verified | $300/month | Tier `Verified` |
| Freemium | Free | Tier `Freemium` |
| Geo-Extension add-on | $500/month per increment | Geo-Extension `Y`, plus SEM Landing Pages rows |

**Main differentiator, Verified vs. Featured: SEM support.** Featured
practices get SEM campaigns driving traffic to their own page. Lower tiers
only benefit from OAAN's general sitewide SEM.

**Geo-Extension** is sold in $500/month increments. It's built mostly on
paid traffic (SEM landing pages aimed at other metros), so the price is
framed as campaign support. More increments, more out-of-area patients.

## What each package includes

| Feature | Freemium | Verified | Academic package | Full Profile | Featured |
|---|---|---|---|---|---|
| Listing in search results and on the map | ✓ | ✓ | ✓ | ✓ | ✓ |
| Map pin | Small gray | Small light green | Navy with a diamond | Large green | Large green |
| Badges | none | Verified | Academic, Verified | Verified (solid) | Verified (solid) |
| Founding Member badge and violet pin | | | | ✓ if a founding member | ✓ if a founding member |
| Phone, website, address links | | ✓ | ✓ | ✓ | ✓ |
| Short Bio | | ✓ | ✓ | ✓ | ✓ |
| Main photo | | ✓ | ✓ | ✓ | ✓ |
| Patient contact form (leads emailed to the practice) | | ✓ | ✓ | ✓ | ✓ |
| Other Locations links (same Group ID) | | ✓ | ✓ | ✓ | ✓ |
| FAQs | | | ✓ | ✓ | ✓ |
| Treatments Offered | | | ✓ | ✓ | ✓ |
| Business Hours and ILIT Schedule Notes | | | ✓ | ✓ | ✓ |
| "About This Practice" (Extended Bio) | | | | ✓ | ✓ |
| Up to 4 more photos | | | | ✓ | ✓ |
| Top of search results ("Featured ILIT Providers"), homepage, and on nearby free listings' pages | | | | ✓ | ✓ |
| Photo on the search result card | | | | ✓ | ✓ |
| Google and Yelp reviews module | | | | | ✓ |
| SEM campaigns to the practice's own page | | | | | ✓ |
| "Medically reviewed by" credit on a Learn article | | | | | Sold case by case |
| Remote consult badges | | ✓ if offered | ✓ if offered | ✓ if offered | ✓ if offered |
| Tracked for practice reporting (no report screen yet; pulled on request) | Page views, search impressions | + calls, website and address clicks, leads | same as Verified | same as Verified | same as Verified |

Freemium pages also show links to Learn articles and up to 3 nearby Full
Profile or Featured practices. Paid pages never link away (the paid page is
the endpoint).

### Academic package

For academic medical centers, such as a university allergy and immunology
division (target prospects: Ohio State, Washington University). Set up as
Tier `Academic` (stored as a Verified page with the Academic flag on). For an
academic center on Full Profile or Featured, set that tier plus Academic `Y`. The Academic badge and pin show at
**any** paid tier, so an academic center that buys Full Profile or Featured
keeps them. On the map, Academic wins over Founding Member.

No SEM support beyond OAAN's general sitewide SEM. Confirm the practice
really is part of a university or academic medical center before turning on
the badge (pending counsel's definition, `docs/legal-facts.md` question 6).

## Content specs for onboarding

| Item | Limit | Notes |
|---|---|---|
| Short Bio | **600 characters** (about 100 words) | Shown beside the main photo. Its opening becomes the Google search description, so the first sentence should stand on its own in about 155 characters |
| Extended Bio | **2,000 characters** (about 330 words) | The "About This Practice" section. Paragraph breaks are kept. A short credentials list at the end works well |
| FAQs | About 8 to 10 | 5 or more collapse into an expandable list. Answers should be specific to the practice (location, scheduling, insurance, the doctor), not general ILIT facts the Learn page already covers |
| Main photo | 1200 × 1500 (4:5 portrait) | A building or team photo works better than a tight headshot |
| Extra photos | Up to 4, 1600 × 1200 (4:3) | Full Profile and Featured |
| Search result card photo | 400 × 400 square | Full Profile and Featured. A logo works well |
| Business Hours | Free text, semicolons between lines | e.g. `Tue-Fri: 8am-5pm; Sat: 9am-1pm` |
| Treatments Offered | Semicolon-separated list | Use the same names across practices so the list stays consistent |
| Notification Email | Required for every paid tier | Where leads go. Never shown publicly |

The sync flags (but doesn't block) bios over the limits, paid practices with
no Notification Email, and Academic `Y` on a Freemium row.

## Pricing considerations (notes from planning, 2026-10-01)

- **Academic budget:** the $5,000/year figure comes from one UCLA
  radiologist's discretionary fund. ILIT runs through allergy and immunology
  divisions, whose budgets may differ. $400/month is $4,800/year, nearly all
  of that fund. An annual price invoiced once (for example $4,500) fits
  university purchasing better than monthly card billing, and stays under
  common no-bid purchase limits. Large academic centers may route paid
  listings through their marketing or communications office.
- **Full Profile to Featured is a $300/month step**, and it has to cover
  reviews plus real SEM ad spend. Allergy keywords can cost several dollars
  per click, so $300 buys a limited number of clicks before any margin.
  Consider stating how much ad spend Featured includes, or widening the gap.
- **Verified to Full Profile is a $650/month step.** Verified now includes
  the contact form, so Full Profile's case rests on top placement, the
  large pin, the full content (About, FAQs, extra photos, hours, treatments)
  and the card photo.
- **SEM needs time to optimize** (typically 60 to 90 days), so a minimum
  term for Featured and Geo-Extension protects both sides.
- **Still to define:** what Founding Member status includes beyond the
  badge (e.g. a locked price), and what one Geo-Extension increment buys
  (for example one target metro and its landing page).
