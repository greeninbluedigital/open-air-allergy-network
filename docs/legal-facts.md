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
  Profile, Featured). Paid tiers get more on their listing page (photos, a
  contact form, reviews, badges) and **higher placement**: Full Profile and
  Featured practices appear first in search results ("Featured ILIT
  Providers"), on the homepage, and on free listings' pages. Practices can
  also pay for SEM landing pages (ad landing pages for their practice) and
  for a "Medically reviewed by" credit on Learn articles.
- **Patients pay nothing.** OAAN does not provide medical care, book
  appointments, or process payments from patients.
- **OAAN is not the practice.** A patient's message goes to the practice
  they chose, and treatment happens entirely between them.

## Information visitors give us (forms)

| Form | Where | What it collects | What happens to it |
|---|---|---|---|
| Patient contact form | Paid provider pages (Full Profile and up) and SEM landing pages | First and last name, email, phone (optional), message (free text, **may include health details**), campaign data (below) | Stored by OAAN. A confirmation email goes to the patient. The lead is forwarded by email to **that practice only**, either when the patient confirms or after about 60 minutes unconfirmed. Never sent to competing practices. |
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

| Name | Set by | Purpose | Lasts |
|---|---|---|---|
| `oaan_zip` | OAAN (first party, not readable by scripts) | Remembers the last zip searched so the search and homepage can reuse it | 1 year |
| `oaan_attr` | OAAN (first party) | Remembers campaign data (source, medium, campaign, keyword, ad variant, ad click id, landing page) so leads can be attributed to ads | 30 days |
| `_ga`, `_ga_<id>` | Google Analytics | Distinguishes visitors and sessions for analytics | Up to 2 years |
| `oaan_consent` | OAAN (first party) | Remembers the visitor's analytics and advertising choices | 1 year |
| Session storage key `oaan_sent:…` | OAAN | Stops a reloaded form-success page from counting a lead twice | Until the tab closes |

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
- **Who receives a patient's inquiry:** the practice they contacted, plus
  the service providers above. Suggested wording: "We never sell your
  information. Your message goes only to the practice you contact and to
  the service providers who help us run this site."
- **Never:** a practice's leads given to a competing practice.
- **Follow-up emails (planned):** OAAN wants to email people who used a
  contact form, to follow up on their experience with the site or remind
  them about the practice they contacted. Not built yet. Needs: a mention
  in the Privacy Notice, an unsubscribe link and a postal address in every
  email (CAN-SPAM), and likely an optional, unchecked consent checkbox on
  the patient form (see question 3).
- **Planned:** Google Ads campaigns, with conversions (such as lead form
  submissions) possibly imported into Google Ads for ad optimization. Under
  the CCPA, "sharing" includes cross-context behavioral advertising, so the
  no-sale promise also rules out remarketing audiences built from site
  visitors (see question 2).

## Open questions for the attorney

1. **Consumer health data.** Patient inquiries (and possibly the fact that
   someone searched for or contacted an allergy practice) may be "consumer
   health data" under Washington's My Health My Data Act, and similar laws
   in Nevada and Connecticut, and "sensitive personal information" under
   California's CPRA. Washington requires a separate consumer health data
   privacy policy, consent to collect and share, and signed authorization
   to sell. Does the site need a consent checkbox on the patient contact
   form, a separate health data policy, or both?
2. **Analytics and ads on health-related actions.** GA4 receives events
   like "lead form submitted to [practice]" and zip searches. Is that
   allowed without opt-in consent? Should those events stay out of Google
   Ads conversion imports? (The FTC's GoodRx and BetterHelp cases involved
   health-related events shared with ad platforms.)
3. **Follow-up emails and the no-sale promise.** OAAN won't sell visitor
   data (decided 2026-09-29) but wants to email form users to follow up on
   their site experience or remind them about the practice they contacted.
   Using the fact that someone contacted an allergy practice for those
   emails is arguably a use of consumer health data beyond the service
   requested. Is an optional, unchecked consent checkbox on the patient
   form ("Email me occasional follow-ups from Open Air Allergy Network")
   the right approach? And what exact "we never sell your information"
   wording is safe for the Privacy Notice and the site (given leads go to
   the practice and to service providers, and planned Google Ads
   measurement)? Specifically, confirm that forwarding a patient's message
   to the practice they chose isn't a "sale" (under the CCPA, a disclosure
   the consumer intentionally directs isn't one; confirm Washington's
   definition too), given practices pay a flat listing subscription, not a
   per-lead fee. Pay-per-lead pricing would likely change the answer.
4. **HIPAA.** Confirm OAAN is not a covered entity or business associate
   (it isn't a provider, health plan, or clearinghouse, and receives
   inquiries directly from the public, not from practices).
5. **Paid placement disclosure.** Paid tiers get higher placement and the
   "Featured" label, and "Medically reviewed by" credits are a paid perk.
   What disclosure is needed (FTC endorsement and advertising rules)?
6. **Reviews.** Featured pages show selected Google and Yelp review
   excerpts. Anything required under the FTC's rule on consumer reviews?
7. **Privacy choices and cookie banner.** Which opt-outs are required
   (California "Do Not Sell or Share", Global Privacy Control signals,
   "Limit the Use of My Sensitive Personal Information"), and is opt-in
   consent needed anywhere?
8. **Retention.** How long to keep patient inquiries, practice leads, and
   contact messages.
9. **Privacy request contact.** Which email address handles privacy
   requests (access, deletion, opt-out)? The plan is email only, no phone
   number: the CCPA lets businesses that operate exclusively online and
   deal with consumers directly use an email address instead of a
   toll-free number. Also confirm which state privacy laws apply at OAAN's
   current size (the CCPA's thresholds may not be met yet).
10. **Terms for practices.** A separate listing or advertising agreement
    for paying practices (tiers, billing, cancellation, content accuracy,
    lead delivery, no guarantee of results).
11. **Anti-scraping clause** in the Terms of Use (see
    `docs/anti-scraping.md`).
12. **A note under the patient message box?** Some health directories add
    a line like "Please don't include detailed medical information. The
    practice will ask for what they need." That would reduce the sensitive
    health data OAAN collects and stores. The trade-off: patients
    describing their allergies helps practices judge fit, which is part of
    OAAN's lead-quality pitch to practices. Is the note recommended, and
    does it change what the Privacy Notice or a consent checkbox needs to
    say?
