# Legal fact sheet: what the site collects, shares, and stores

Facts about how openairallergynetwork.com handles information, for filling
out the Rocket Lawyer questionnaires and for the attorney's review. Not
legal advice. It describes what the site does today, verified against the
code on 2026-09-29. Update it whenever data handling changes.

## The business

- **Legal entity:** Green in Blue Digital LLC, doing business as Open Air
  Allergy Network (a registered fictitious business name). Legal documents
  should name the LLC as the party, with the DBA defined once, e.g.
  "Green in Blue Digital LLC, doing business as Open Air Allergy Network
  ("Open Air Allergy Network," "we," "us")". To confirm with counsel: the
  FBN is registered to the LLC, not to an individual.

- **What it is:** a free directory of allergy practices confirmed (by phone)
  to offer ILIT (intralymphatic immunotherapy), plus educational content
  (Learn articles, Blog).
- **Who uses it:** adults in the United States looking for allergy
  treatment. Not directed at children.
- **How it earns money:** practices pay for listing tiers (Verified, Full
  Profile, Featured, plus an Academic package for academic medical
  centers). Paid tiers get more on their listing page (photos, a
  contact form, reviews, badges) and **higher placement**: Full Profile and
  Featured practices appear first in search results ("Featured ILIT
  Providers"), on the homepage, and on free listings' pages. Practices can
  also pay for SEM landing pages (ad landing pages for their practice) and
  for a "Medically reviewed by" credit on Learn articles.
- **Terminology (owner's policy, 2026-09-29):** legal and privacy documents
  call the people who use the site **consumers** (or visitors), not
  patients. OAAN is not a healthcare provider and has no care relationship
  with anyone. Public documents should say so plainly. They should still
  note, in a neutral line, that a message may include health information
  the consumer chooses to share: the data's legal status depends on what
  it is, not on what it's called, and an understated privacy policy is its
  own risk.
- **Consumers pay nothing.** OAAN does not provide medical care, book
  appointments, or process payments from consumers.
- **OAAN is not the practice.** A consumer's message goes to the practice
  they chose, and treatment happens entirely between them.

## Information visitors give us (forms)

| Form | Where | What it collects | What happens to it |
|---|---|---|---|
| Consumer contact form | Paid provider pages (Verified and up, since 2026-10-01) and SEM landing pages | First and last name, email, phone (optional), message (free text, **may include health details**), campaign data (below) | Stored by OAAN. A confirmation email goes to the consumer. The lead is forwarded by email to **that practice only**, either when the consumer confirms or after about 60 minutes unconfirmed. Never sent to competing practices. |
| For Practices form | /for-practices | Name, practice name, practice website, email, phone, city, state, reason, comments, campaign data | Stored by OAAN and emailed to OAAN's leads inbox. Used for sales follow-up. |
| About page form | /about | Name, email, reason, message, campaign data | Stored by OAAN and emailed to OAAN's leads inbox. |

On all three forms:
- The email address's domain is checked for a working mail server (a DNS
  lookup, nothing sent) before accepting the form.
- Messages containing links are rejected, and a hidden spam-trap field
  catches bots.
- **Campaign data** saved with each form: the ad or campaign source,
  medium, campaign name, keyword, ad variant, ad click id, and first page
  visited, if the visitor arrived from a tagged campaign link within the
  last 30 days.
- **Retention: no deletion policy yet.** Form submissions are kept
  indefinitely today. A retention period needs deciding (see open
  questions).

## Information collected automatically

- **Approximate location from IP address.** The hosting provider (Vercel)
  derives an approximate city and zip code from each visitor's IP address.
  The site uses it to pre-fill the zip search box and show nearby featured
  practices on the homepage. OAAN does not store it.
- **Server and firewall logs** (Vercel): IP address, browser user agent,
  pages requested. Used for security, bot blocking, and debugging. Kept per
  Vercel's retention.
- **OAAN's practice-report log:** counts of provider page views, practice
  cards shown in lists, and clicks on a practice's phone, website, and
  address. Stores only the event type, the practice, the page path
  (which can include a searched zip code), campaign tags, and a timestamp.
  **No visitor identifiers**: no IP, cookie id, name, or email.
- **Google Analytics 4** (through Google Tag Manager, live site only,
  subject to the visitor's consent choices, see "Consent" below):
  page views, traffic sources, campaign data, clicks on site buttons, zip
  searches (including the zip entered), and form-submission events that
  name the practice contacted (no name or contact details). Identifies
  browsers with a pseudonymous cookie id, and Google receives the visitor's
  IP address.

## Cookies and browser storage

| Name | Category | Set by | Purpose | Lasts |
|---|---|---|---|---|
| `oaan_consent` | Strictly necessary | OAAN (first party) | Remembers the visitor's analytics and advertising choices | 1 year |
| `_vcrcs` | Strictly necessary | Vercel (hosting) | Security: set only when Vercel's bot protection challenges a visitor, once Bot Protection is switched to Challenge mode (after launch) | 1 hour (Vercel's challenge session length) |
| `_ga`, `_ga_<id>` | Analytical / performance; 3rd party | Google Analytics (stored under OAAN's domain, controlled by Google) | Distinguishes visitors and sessions for analytics | Persistent: 2 years, renewed on each visit |
| `oaan_zip` | Functionality | OAAN (first party, not readable by scripts) | Remembers the last zip searched so the search and homepage can reuse it | 1 year |
| `oaan_attr` | Advertising / tracking | OAAN (first party) | Remembers campaign data (source, medium, campaign, keyword, ad variant, ad click id, landing page) so leads can be attributed to ads | 30 days |
| Google Ads cookies, e.g. `_gcl_au` | Advertising / tracking; 3rd party | Google | **Not active yet, but included in the Cookie Policy now** (owner's decision, 2026-09-30) so it won't need changing when Google Ads is connected. Described as measurement ("we may use advertising cookies from Google to measure how well our ads work"), not targeting, to stay consistent with the no-sale promise, which rules out remarketing audiences built from visitors | Up to 90 days |
| Session storage key `oaan_sent:…` | Similar technology (not a cookie) | OAAN | Stops a reloaded form-success page from counting a lead twice | Until the tab closes |

**Rocket Lawyer answers:** the strictly necessary cookies' purpose is
"Other": remembering visitors' privacy and cookie choices, and protecting
the site from bots and abuse (hosting provider security checks). The zip
code cookie belongs under functionality, not strictly necessary.

No cookies from the map (Mapbox), images (Cloudinary), or Yelp review
excerpts (plain text and links, no Yelp script). Fonts are self-hosted.
Visitors can turn off analytics and advertising cookies on My Privacy
Choices, and Global Privacy Control turns advertising off automatically.

## Consent

A banner on the first visit, and a working My Privacy Choices page, let
visitors turn analytics and advertising cookies off. The site is set to
**opt-out** today (on until the visitor opts out) and can switch to
**opt-in** with a one-line change. A browser's **Global Privacy Control**
signal always turns advertising off. If a visitor turns both off, Google
Tag Manager never loads. Details: `docs/consent.md`.

## Service providers (vendors)

| Vendor | What it does | Visitor data it receives |
|---|---|---|
| Vercel | Hosting, firewall, IP geolocation | Every request (IP, user agent, pages) |
| Neon | Database | Everything stored (forms, logs) |
| Resend | Sends email (confirmations, lead forwarding, internal notifications) | Form contents in the emails it sends |
| Google (Tag Manager, Analytics) | Site analytics | See "Google Analytics 4" above |
| Mapbox | Map on the search results page, and geocoding practice addresses | The visitor's browser loads map tiles from Mapbox (IP, the map area viewed) |
| Cloudinary | Image hosting | The visitor's browser loads images (IP) |
| Google Places API | Fetches Google reviews for Featured practices, server to server | None |
| Yelp | Review excerpts shown as embedded text and links on some Featured pages | Only if the visitor clicks through to Yelp |
| Cloudflare | DNS and email forwarding for the domain | Emails to @openairallergynetwork.com |
| Google Workspace/Gmail | Receives forwarded lead and contact emails | Form contents |

Practice data (not visitor data) is managed in Google Sheets and synced to
the site by a scheduled job.

## Sharing and selling

- **Commitment (decided 2026-09-29): OAAN will not sell visitor data.**
  The owner dropped an earlier idea of selling lead data (e.g. through
  LiveRamp) and wants "we never sell your information" as a selling point.
- **Who receives a consumer's inquiry:** the practice they contacted, plus
  the service providers above. Suggested wording: "We never sell your
  information. Your message goes only to the practice you contact and to
  the service providers who help us run this site."
- **Never:** a practice's leads given to a competing practice.
- **No marketing or follow-up emails (decided 2026-09-29).** OAAN only
  emails a consumer to confirm their inquiry. Following up is the practice's
  job once it has the lead. If that ever changes, it needs a Privacy Notice
  update and likely opt-in consent first.
- **On the form (2026-09-30):** under the consumer contact form's Send
  button: "We never sell your information. By sending, you agree to our
  Terms and Privacy Notice." (Terms and Privacy Notice are links that open
  in a new tab.) No separate consent for the practice to call back: the
  form itself is a request to be contacted about the inquiry, and the
  Privacy Notice discloses that messages go to the chosen practice.
- **Marketing emails to practices:** OAAN's sales outreach to practices
  (following up For Practices inquiries, pitching listings) counts as
  commercial email under CAN-SPAM, even one-to-one and business to
  business. Every such email needs an opt-out (e.g. "Reply 'unsubscribe'
  and I won't email you again", honored within 10 business days), OAAN's
  physical postal address, and an honest sender and subject line. An email
  signature covers it. Privacy Notice answer: marketing emails can be
  unsubscribed from; consumers receive none, only their inquiry
  confirmation (a transactional email).
- **Planned:** Google Ads campaigns, with conversions (such as lead form
  submissions) possibly imported into Google Ads for ad optimization. Under
  the CCPA, "sharing" includes cross-context behavioral advertising, so the
  no-sale promise also rules out remarketing audiences built from site
  visitors (see question 2).

## Security

The full list of protections, known weak spots, and gaps being closed is
in `docs/data-protection.md`. In short: HTTPS everywhere (with HSTS),
encrypted database connections and storage, minimal data collection, and
consent controls. Email is the weakest link, since confirmation emails and
forwarded leads travel as ordinary email.

For the Privacy Notice, a short general statement is the norm, e.g. "We
use reasonable administrative, technical, and physical safeguards to
protect personal information, including encryption in transit and at
rest. No method of transmission or storage is completely secure, so we
can't guarantee absolute security." Listing specific controls publicly
turns each one into a promise.

## Open questions for the attorney

1. **Consumer health data.** Consumer inquiries (and possibly the fact that
   someone searched for or contacted an allergy practice) may be "consumer
   health data" under Washington's My Health My Data Act, and similar laws
   in Nevada and Connecticut, and "sensitive personal information" under
   California's CPRA. Washington requires a separate consumer health data
   privacy policy, consent to collect and share, and signed authorization
   to sell. Does the site need a consent checkbox on the consumer contact
   form, a separate health data policy, or both?
2. **Analytics and ads on health-related actions.** GA4 receives events
   like "lead form submitted to [practice]" and zip searches. Is that
   allowed without opt-in consent? Should those events stay out of Google
   Ads conversion imports? (The FTC's GoodRx and BetterHelp cases involved
   health-related events shared with ad platforms.)
3. **The no-sale promise.** OAAN won't sell visitor data (decided
   2026-09-29), and the consumer form says "We never sell your
   information." What exact wording is safe there and in the Privacy
   Notice, given leads go to the practice and to service providers, and
   Google Ads measurement is planned? Confirm that forwarding a consumer's
   message to the practice they chose isn't a "sale" (under the CCPA, a
   disclosure the consumer intentionally directs isn't one; confirm
   Washington's definition too), given practices pay a flat listing
   subscription, not a per-lead fee. Pay-per-lead pricing would likely
   change the answer.
4. **HIPAA.** Confirm OAAN is not a covered entity or business associate
   (it isn't a provider, health plan, or clearinghouse, and receives
   inquiries directly from the public, not from practices).
5. **Paid placement disclosure.** Paid tiers get higher placement and the
   "Featured" label, and "Medically reviewed by" credits are a paid perk.
   What disclosure is needed (FTC endorsement and advertising rules)?
6. **The "Verified" badge.** Paid listings (Verified tier and up) show a
   "Verified" badge, but its meaning has never been defined on the site.
   The draft Terms say OAAN doesn't verify practices' qualifications,
   licensing, or quality of care, so consumers could read the badge as
   more than it means. What should "Verified" be defined as (for example,
   "this practice confirmed its listing details with us and has an active
   listing subscription"), where should that definition appear, and should
   the badge be renamed? Same question for the "Founding Member" badge,
   and for the "Academic" badge (added 2026-10-01 for academic medical
   centers; proposed meaning: the practice is part of a university or
   academic medical center, confirmed by OAAN before the badge is turned
   on). The Academic badge is also part of a paid package.
6b. **Reviews.** Featured pages show selected Google and Yelp review
   excerpts. Anything required under the FTC's rule on consumer reviews?
   Google's reviews and rating arrive automatically through its official
   feed (Google chooses which reviews), and OAAN hand-picks the Yelp
   excerpts. Visitors can't post anything on the site, so the Terms
   answer "no" to user posting. They should instead carry a third-party
   content clause, e.g. "The Site displays content from third parties,
   including reviews from Google and Yelp and information provided by
   listed practices. We don't write, verify, or endorse this content, and
   it may not reflect all reviews of a practice. Reviews belong to their
   authors and are subject to the terms of the platform where they were
   posted."
7. **Privacy choices and cookie banner.** Which opt-outs are required
   (California "Do Not Sell or Share", Global Privacy Control signals,
   "Limit the Use of My Sensitive Personal Information"), and is opt-in
   consent needed anywhere?
8. **Retention.** How long to keep consumer inquiries, practice leads, and
   contact messages.
9. **Privacy request contact.** Which email address handles privacy
   requests (access, deletion, opt-out)? The plan is email only, no phone
   number: the CCPA lets businesses that operate exclusively online and
   deal with consumers directly use an email address instead of a
   toll-free number. Also confirm which state privacy laws apply at OAAN's
   current size (the CCPA's thresholds may not be met yet).
10. **Terms for practices.** A separate listing or advertising agreement
    for paying practices (tiers, billing, cancellation, content accuracy,
    lead delivery, no guarantee of results). Cancellation and refunds
    belong here, not in the website Terms of Use (consumers pay nothing).
    The owner plans to draft it on Rocket Lawyer (2026-10-01). Business
    terms to include: minimum terms (Verified 6 months; Full Profile and
    Featured 3 or 4 months; Academic billed yearly), no guarantee of leads,
    clicks or traffic, and search advertising for Featured practices run at
    OAAN's discretion with no committed amount or share of spend.
    The Terms of Use should say that practices buying listings are also
    bound by this separate agreement. Cancellation points to cover:
    - Term and renewal (monthly or annual, automatic renewal, and any
      auto-renewal notice rules that apply to business contracts)
    - Notice required to cancel (e.g. 30 days before the next billing date)
    - Refunds: none for partial periods, prorated, or case by case
    - What happens to the listing: it drops to a free basic listing, losing
      photos, the contact form (no more leads through the site), badges,
      reviews, and Featured placement
    - Founding Member status: lost for good, or restored on resubscribing
    - SEM landing pages: turned off at cancellation
    - Learn article review credits: reassigned when a practice lapses (the
      owner's existing policy)
11. **Breach response.** Review `docs/incident-response.md`. Which
    notification laws would apply to a leak of consumer inquiries, and what
    should the Privacy Notice say about breach notification?
11b. **Arbitration and class action waiver.** The owner leans toward
    including individual arbitration with a class action waiver in the
    Terms of Use, given privacy class actions against websites (e.g. CIPA
    claims over analytics) and Washington's private right of action for
    health data. Questions: clause design (small-claims carve-out,
    informal-resolution step, mass-arbitration batching, a 30-day opt-out),
    and how consumers agree to it. Footer-only Terms may not bind anyone.
    Added 2026-09-30 under the contact form's Send button (see "Sharing and
    selling"). Please review the wording, and whether OAAN should also
    record which version of the Terms each sender agreed to. Today only the
    submission time is stored. Should the For Practices and About forms
    carry the same line?
12. **Anti-scraping clause** in the Terms of Use (see
    `docs/anti-scraping.md`).
13. **A note under the consumer message box?** Some health directories add
    a line like "Please don't include detailed medical information. The
    practice will ask for what they need." That would reduce the sensitive
    health data OAAN collects and stores. The trade-off: consumers
    describing their allergies helps practices judge fit, which is part of
    OAAN's lead-quality pitch to practices. Is the note recommended, and
    does it change what the Privacy Notice or a consent checkbox needs to
    say?
14. **Network Member logo license (added 2026-10-01).** OAAN plans a
    "Network Member" logo and wants to give every paying member a free
    license to use it in their digital and print marketing and
    communications, linked to their OAAN page where online. What should the
    license say (scope, approved uses, ending the license when a membership
    lapses, removing the logo after cancellation), and what are the risks?
    For example: the logo being read as OAAN endorsing or vouching for the
    practice's care (the Terms say OAAN doesn't), health-care advertising
    rules for practices that use it, misuse by former members, and keeping
    enough control over its use to protect the trademark.
15. **Practice custom messages (added 2026-10-02).** Featured practices can
    show a short "custom message" badge (30 characters) they write
    themselves, entered by OAAN on their behalf. It was renamed from "special
    offer", and OAAN's rule is informational messages only (for example "Now
    accepting new patients"), with no prices, discounts, free services or
    results claims. Is that rule enough, given federal and state rules on
    inducements to patients (especially Medicare or Medicaid patients) and
    state medical-advertising rules? What should OAAN check before
    publishing a message, and should the practice agreement make the
    practice responsible for its message's accuracy and legality?
16. **ILIT brand names and trademarks (added 2026-10-06).** Practices market
    ILIT under their own names, some marked ® or ℠ (QUICK-LI®, ExACT
    Immunoplasty℠), and WashU Medicine writes "ILIT™". OAAN uses "ILIT"
    throughout the site as the standard medical abbreviation for
    intralymphatic immunotherapy, used in the research literature since 2008.
    Is that use safe given the ™? And can a planned article name and compare
    the branded programs, linking to the practices that use them, as
    descriptive (nominative) use? Owner's view: "ILIT" is becoming
    the generic name for the treatment, like Kleenex or Xerox, and a
    university is unlikely to pursue ordinary descriptive use. Low priority.
