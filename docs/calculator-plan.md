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

Owner, 2026-11-05: no source names a "typical" course, so the switch is
**3 years / 4 years / 5 years** of total treatment (matching the Learn
comparison page's 3 to 5 years), **defaulting to 3 years** so the
comparison never overstates shots. Build-up is inside the total.

| Option | Build-up | Then | Visits (rough) |
|---|---|---|---|
| 3 years | once a week, about 4 months | every 4 weeks | about 52 |
| 4 years | once a week, about 5 months | every 3 weeks | about 84 |
| 5 years | once a week, about 6 months | every 2 weeks | about 143 |

## Mockup decisions (owner review, 2026-11-05)

Mockup: <https://claude.ai/artifact/YVRv4E7JHmNmR4hgiKHg9G> (private).
- Three numbered steps (zip, Insurance / Self-pay, Gas / Electric), then
  the estimate, then closed "Fine-tune your numbers" panels. One narrow
  column so phones get the same layout. As few words as possible.
- Miles are asked **each way** (round trips confused readers). Allergy
  shot office defaults to 5 miles each way; ILIT fills from the zip.
- No average speed input. "Time spent per visit" (travel and office
  appointment time) pre-fills from distance and office time until the
  visitor edits it.
- No EV efficiency input: Electric uses a typical EV's miles per kWh.
- Travel is a small grid: miles each way and parking per visit, one column
  for allergy shots and one for ILIT, then "Other ILIT travel costs (e.g.,
  flights, hotel, rides)" as one total for the course.
- Office time defaults: 45 minutes per shot visit (including the wait
  after the shot) and 90 per ILIT visit (owner, 2026-11-05: some practice
  sites say 90; the owner's own visits ran about 60). Time sits below
  Travel.
- Step 3 shows the fuel price it uses, editable: gas $/gallon and MPG for
  Gas, or home charging cents/kWh for Electric (EIA state price). A typical
  EV's efficiency stays fixed in the background, sourced from EPA fuel
  economy data (verify the figure; the mockup uses 3.3 miles per kWh). Each time box shows "Includes about N min of driving" so
  the total explains itself.
- **Drive / Fly for ILIT** (Travel panel). Fly hides ILIT miles and
  parking ("Flying"), swaps the travel cost box for "Flights, hotel and
  rides, per trip" (times 3) and the time box for "ILIT time away per trip,
  door to door" (default 8 hours, cost default $0). When the nearest
  provider is over 250 miles each way, step 1 adds "That's a long drive.
  Flying?" as a link that switches to Fly. ILIT results say "3 trips,
  about N hours each" when flying or when a trip passes 8 hours.
- Drive time defaults use 35 mph for local trips and 55 mph past 50 miles
  each way (assumptions, not sourced; visitors can edit the minutes).
- Electric shows "Charging cost per mile is based on a typical EV." under
  the home charging price.
- Owner review 2026-11-06:
  - The page's H1 and intro text (written for SEO) define ILIT and allergy
    shots and say how to use the calculator. The calculator itself
    doesn't repeat definitions.
  - Results heading: "Your Out-of-Pocket Cost Estimate", with "How long
    would your allergy shots last?" over the 3 / 4 / 5 year buttons, which
    sit on the left over the shots card and use the shots blue.
  - Shared steps (zip, pay, drive) use a neutral dark gray, not ILIT
    green. Drive / Fly buttons are green, year buttons blue.
  - "What do you drive?" has a third button, "I don't drive" (no fuel
    cost; trips and time still count).
  - Font sizes follow the site's scale (12, 14, 16px).
  - Every number input sets `inputmode="decimal"` (zip uses `numeric`) so
    phones show the number keyboard.
- ILIT price is labeled only "Estimated self-pay price. Insurance rarely
  covers ILIT." The page never says it comes from a survey of practices
  (owner, 2026-11-05). The internal list stays on the CRM Locations tab.
- Value of your time opens with "Factor the value of your time into the
  cost comparison. Enter an hourly value, or use the U.S. average."
- Heading "What you pay the provider out of pocket", with a disclaimer
  naming the source of the estimates and pointing to the insurance company
  or provider for actual costs. No "placeholder" labels on the live page.
- Color coding: allergy shot inputs, labels and results in blue, ILIT in
  the site's green, shared inputs (zip, testing, parking, wage, MPG) in
  the standard gray.

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
| Value of your time per hour | $0, with a one-click button | FRED: CES0500000003, average hourly earnings, total private (U.S.; state series possible later). Label it "average hourly earnings" (it's a mean, not a median) |

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

As of 2026-11-05 (every listed practice's site checked; 8 publish a
price, the rest are marked "no price published" on the tab):

| Practice | Price | Notes |
|---|---|---|
| Aspire Allergy & Sinus | $2,500 | ExACT Immunoplasty, 3 injections; excludes the initial allergy test |
| St. Louis Family Allergy | $3,300 | Serums, vials and procedure, 3 monthly injections |
| Grand Rapids Allergy | $3,300 ($1,100 x 3) | Extract, vials, ultrasound guided injections |
| Allergenix | $3,500 flat | Consult, mapping, boosters where indicated, follow-ups. Testing separate |
| AllerPoint | $3,900 ($1,300 x 3) | Boosters within a year free. Consult required, billing not stated |
| Prairie Allergy | $3,900 | 3-injection series, follow-ups included |
| Avant Allergy | $4,000 flat | The owner's own treatment (direct information; the site publishes no amount) |
| Kara Wada, MD | $5,000 | Package with pre-treatment evaluation and follow-up consult |

Mean $3,675, median $3,700, range $2,500 to $5,000 (8 practices). What's
included varies (testing, consults, boosters), so the calculator's ILIT
input says the price may or may not include testing and the consult, and
testing stays a separate line shared by both paths. Use the median as the
default.

**Cash price cross-checks for other defaults** (internal, never shown by
practice name): allergy testing runs $300 to $695 self-pay (Prairie $300
for 50 allergens plus a $300 consult; Elaria $300 plus a $280 consult;
Allergenix $450 evaluation; Aspire $695 adult). Prairie lists allergy
shots (SCIT) at $200 a month during build-up and $125 a month in
maintenance. Use these to sanity check the Medicare based estimates.

## Data refresh job

**Source: the owner's macro data spreadsheet** (2026-11-05),
<https://docs.google.com/spreadsheets/d/15ouSHSSKELAAu3V8LFJgBXKA87_-wr7jpz-HL-mxY74/edit>.
Its Apps Script already ingests the data from EIA and FRED, so OAAN needs
no API keys of its own.

- **`Fuel_Prices_Monthly`**: one row per month from 2000-01 (column A is
  the month), one column per series. Rows 1 to 5 are headers: name, EIA
  series ID, level (U.S., PADD, PADD subregion, State, City), units and
  geography. Columns B to AD are the 29 regular gasoline series ($/gallon,
  monthly averages of EIA's weekly prices), AE to CD residential
  electricity for the U.S. and every state plus DC (cents per kWh). Gas
  updates on the 3rd of each month, electricity on the 28th. Electricity
  runs about two months behind gas (on 2026-11-05: gas through October,
  electricity through August), so each value carries its own "as of" month.
- **`FRED_Monthly`** column AG: CES0500000003, average hourly earnings,
  total private, U.S. National only for now. For "average hourly earnings
  in {state}", the owner could add FRED's state series
  (SMU{state FIPS}000000500000003) to the sheet later.

**How the site gets it:** the site already reads the sync sheet with a
Google service account (`src/lib/googleSheets.ts`). The owner shares the
macro data sheet with that service account's email as a Viewer. A monthly
GitHub Actions workflow (around the 4th, after the gas update) reads the
latest non-empty value of each series, writes
`src/data/calculator-defaults.json` (value plus "as of" month per series),
and commits it, which redeploys the site. The calculator maps the visitor's
state to a gas column with the owner's PADD table (state series, then PADD
1 subregion, then PADD, with West Coast less California for AK, AZ, HI, NV
and OR). CMS rates change yearly and are refreshed by hand each January.

**Find columns by series ID, never by letter (owner, 2026-11-05).**
Columns can shift when the owner adds series. The job reads the whole
header block, finds each series by its ID in row 2 (`EMM_EPMR_PTE_SCA_DPG`,
`electricity: CA / RES`, `CES0500000003`), and checks that the same column's
row 4 units match what the calculator expects ($/gallon, ¢/kWh). If an
expected ID is missing, appears twice, or has the wrong units, or a value
is outside a sane range (gas $1 to $10 a gallon, electricity 5 to 60 cents,
wages $10 to $100 an hour), the job fails without committing, so the site
keeps last month's numbers, and the failure shows in GitHub's Actions tab
and email. It also fails if the newest month is more than about 3 months
old (gas) or 5 months old (electricity), which would mean the sheet's own
updates stopped. The service account has View access (owner, 2026-11-05).

## Neon compute

No material impact. The page and its defaults are static, the math runs in
the browser, zip lookup uses the bundled zip table (`src/lib/zip.ts`), and
provider locations come from the same cached data the search pages use. The
only database cost is downstream: a zip search from the results logs
practice impressions, like every search on the site.

## Launch

Pinterest pin and Facebook post, a line in journalist pitches, and links
from the three articles above.
