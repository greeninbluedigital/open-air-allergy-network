# Allergy shot cost calculator: plan

Agreed with the owner 2026-11-04 to 2026-11-05. Not built yet. This is the
brief for the build session. Every default below gets verified against its
source during the build, before it ships.

## Goal

A calculator that shows what a full course of allergy shots really costs
(visits, hours, miles, dollars) next to a typical ILIT course, localized to
the visitor's zip code. It's the backlink plan's linkable asset
(`docs/backlink-strategy.md`): reporters and bloggers link tools that let
readers work out a real number. The owner's bar: no "lame calculator" that
hides what something really costs.

## Where it lives

`/learn-about-ilit/allergy-shot-calculator`, a page built in code (not a
database article), linked from the Learn page's comparison module and from
`/blog/how-often-do-you-get-allergy-shots`, `/blog/ilit-vs-traditional-allergy-shots`
and `/blog/traveling-for-ilit`. Check the keywords the shots frequency
article already targets before choosing this page's FAQs (one page per
keyword).

## Page layout

1. **Lead answer** above the tool: the typical range of visits for a full
   course of allergy shots, so search and AI answers can quote the page
   without running it.
2. **Quick start:** zip code (prefilled from the `oaan_zip` cookie when the
   visitor has searched before), Insured / Self-pay toggle, Gas / Electric
   vehicle toggle. Everything else starts from a localized default.
3. **Adjust the assumptions** panel (open on desktop, collapsed on phones).
   Every input shows its default, a small source link and a reset button.
4. **Results:** summary cards (visits, hours, total cost), shots vs. ILIT
   bars, and an itemized table (testing, provider payments, gas or
   electricity, parking, value of time). Allergy shots show **low, typical
   and high** scenarios over 3 to 5 years; ILIT shows one typical course.
5. **Shareable link:** inputs go in the URL (read in the browser, so the
   page stays static).
6. **Where these numbers come from:** every default, linked to its source
   with an "as of" date.
7. **Honest caveats, once:** an estimate, not a quote. Insurance may cover
   testing and shots and rarely covers ILIT today. ILIT uses FDA approved
   extracts by an off label route, its research base is smaller than for
   allergy shots, and the provider and patient decide together whether it
   fits (wording matches the Learn page).
8. **3 to 5 FAQs** (autocomplete checked), a related card to the shots vs.
   drops vs. ILIT comparison, and a "Cite this calculator" plain link. No
   embeddable widget (Google's spam policy lists links spread through
   widgets).

The calculator must be honest when the numbers favor shots: an insured
visitor with a low copay may pay less in dollars for shots than for
self-pay ILIT. Show it. The time difference stays large either way.

## The action after using it

Right under the results: the existing zip search box (`ZipSearchForm`,
origin tagged `calculator`) with a line built from the visitor's own
numbers, e.g. "Allergy shots could mean about 140 visits. ILIT is
typically 3. Find an allergist near you who offers it." It goes to the
normal results page, where the contact forms are. Secondary: a text link to
the comparison article. Calculator use is a GA4 event through GTM, never the
site's `/api/events` log.

## Allergy shot scenarios (AAAAI schedule, verify)

| Scenario | Build-up | Maintenance | Visits (rough) |
|---|---|---|---|
| Low | once a week, about 4 months | every 4 weeks, 3 years | about 55 |
| Typical | once a week, about 6 months | every 3 weeks, 4 years | about 95 |
| High | twice a week, about 6 months | every 2 weeks, 5 years | about 180 |

Cleveland Clinic's longer build-up (6 to 10 months) can be an advanced
setting. Each visit adds the post-shot wait (AAAAI, about 30 minutes,
verify). ILIT: typically three injection visits, per the Learn page.

## Inputs and default sources

| Input | Default | Source |
|---|---|---|
| Round-trip miles to the allergy shot office | Example value, labeled "change this" | No national source |
| Distance to the nearest ILIT provider | From the visitor's zip to the closest active practice, straight line times a modest road factor, labeled "about" | OAAN's own provider list (cached data the search pages already use) |
| Drive time | From miles at an assumed average speed, editable | |
| Gas price, regular | Visitor's area | EIA weekly retail gasoline prices (see "Gas price mapping") |
| MPG | National average | EPA real-world fuel economy (Automotive Trends report) |
| EV electricity price | Visitor's state | EIA average residential price by state (monthly) |
| EV efficiency | Typical miles per kWh | fueleconomy.gov |
| Parking per visit | $0 | |
| Allergy testing, out of pocket | Shared by both paths | Medicare rate for the visitor's area (below); Allergenix's published $450 environmental allergy evaluation is a cash cross-check |
| Allergy shots, per visit out of pocket | Insured: copay. Self-pay: estimated cash price | KFF copay; Medicare rate times the CBO ratio (below). Help text: "Include everything you pay per visit: the injection fee, your share of the serum (the allergen extract), and any copay. An injection-only visit may cost less than a doctor visit." |
| ILIT, total out of pocket | Average of published self-pay prices | OAAN's internal price list (below) |
| Value of your time per hour | $0, with a one-click button | FRED: CES0500000003 (U.S.) or the state average hourly earnings series. Label it "average hourly earnings" (it's a mean, not a median) |

### Gas price mapping

The owner's state to PADD table:
<https://docs.google.com/spreadsheets/d/1BQ-PA429R1Syir4-QP3tlA0ML8P9I8oJfND3-vqpNJs/edit>
(state, census region and division, PADD, PADD name, PADD 1 subregions).

Use the most local EIA series available for the visitor's state:
1. EIA's own state series where one exists (EIA publishes weekly prices for
   a handful of states, including California; verify the list).
2. Otherwise the PADD 1 subregion (1A New England, 1B Central Atlantic,
   1C Lower Atlantic) for East Coast states.
3. Otherwise the PADD (Midwest, Gulf Coast, Rocky Mountain, West Coast).
   For Arizona, Nevada, Oregon, Alaska and Hawaii, use EIA's West Coast
   series excluding California if it exists (verify), so California's
   higher prices don't inflate Arizona's.

Default to the average price for regular gasoline (owner).

### Provider costs: Medicare rates for the visitor's area

- **Source:** CMS Medicare Physician Fee Schedule for the current year: the
  national relative value file, the GPCI file and the zip code to locality
  file, which together give the payment amount for each billing code in the
  visitor's area. Cite the CMS PFS look-up tool page for readers.
- **Codes to price (verify each):** 95004 (skin prick tests, per allergen),
  99203 or 99204 (new patient visit), 95115 / 95117 (one / two or more
  injections), 95165 (allergen extract, per dose). Testing = visit plus
  95004 times a typical number of allergens tested (find a source for the
  panel size).
- **Self-pay estimate:** Medicare amount times the commercial to Medicare
  ratio from the Congressional Budget Office's 2022 report on prices
  commercial insurers pay (verify the figure for physician services).
  Labeled "estimated".
- **Insured preset:** the average specialist visit copay from the KFF
  Employer Health Benefits Survey (latest edition), plus a share of the
  serum through coinsurance.
- **Link, don't use:** FAIR Health has local insured and uninsured estimates
  but needs a paid license for bulk use. Link it as "look up your area".
- **Avoid as sources:** Curex (sells a competing product) and recycled cost
  pages.
- Owner, 2026-11-05: Medicare rates are fine as long as the source is
  named; visitors can change any number.

### ILIT price list (internal)

Kept on the CRM's **Locations** tab, columns Q to T (ILIT Self-Pay Price,
Price Includes, Price Source, Price Checked), repeated on every row of a
group. Only the average and the range appear on the site, never a practice
name. Recheck quarterly and when a new practice is added.

As of 2026-11-05:

| Practice | Price | Notes |
|---|---|---|
| Avant Allergy | $4,000 flat | The owner's own treatment (direct information) |
| Allergenix | $3,500 flat | Includes consult, mapping, boosters where indicated, follow-ups. Testing separate |
| AllerPoint | $3,900 ($1,300 per injection x 3) | Boosters within a year free. Consult required, billing not stated |

Average $3,800, range $3,500 to $4,000 (three practices). Check the rest of
the listed practices' sites before launch.

## Data refresh job

A monthly GitHub Actions workflow pulls EIA gas and electricity prices and
FRED wages, writes one data file in the repo (e.g.
`src/data/calculator-defaults.json` with an "as of" date per series), and
commits it, which redeploys the site. CMS rates change yearly, so they're
refreshed by hand each January. The owner creates free EIA and FRED API
keys; they go in GitHub secrets.

## Neon compute

No material impact. The page and its defaults are static, the math runs in
the browser, zip lookup uses the bundled zip table (`src/lib/zip.ts`), and
provider locations come from the same cached data the search pages use. The
only database cost is downstream: a zip search from the results logs
practice impressions, like every search on the site.

## Launch

Pinterest pin and Facebook post, a line in journalist pitches, and links
from the three articles above.
