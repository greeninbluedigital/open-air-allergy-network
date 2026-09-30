# Legal pages

The HTML files here are the source of the site's legal pages. The live site
reads them from the `LegalPage` table. After editing a file (for example,
with the attorney's changes), publish it:

```
npx tsx scripts/publish-legal-pages.ts                 # every page with a file
npx tsx scripts/publish-legal-pages.ts cookie-policy   # one page
```

| File | Page | Source |
|---|---|---|
| `privacy-notice.html` | Privacy Policy (`/legal/privacy-notice`) | Rocket Lawyer draft "260929 privacy policy", edited as below |
| `terms-and-conditions.html` | Terms & Conditions | Rocket Lawyer draft "260930 Website Terms of Use", edited as below |
| `cookie-policy.html` | Cookie Policy | Rocket Lawyer draft "260930 website Cookie Policy", edited as below |
| `privacy-choices.html` | My Privacy Choices (text under the working controls) | Written for the site |
| `medical-disclaimer.html` | Medical Disclaimer | Written for the site (2026-09-30), consistent with the Terms and the Learn page's FDA wording |
| `accessibility-statement.html` | Accessibility Statement | Written for the site (2026-09-30), W3C statement format, WCAG 2.1 AA target |

The Rocket Lawyer originals are in the owner's Google Drive folder. **Every
page still needs the attorney's review.**

## Changes from the Rocket Lawyer drafts (2026-09-30)

Rocket Lawyer's language is kept wherever it's accurate. Changes fall into
three kinds: template boilerplate that doesn't fit the site, statements that
contradict how the site works or the owner's decisions, and blanks or
formatting glitches.

### Privacy Policy
- **Name:** kept "Privacy Policy" (the draft's term). The footer and contact
  form links were renamed from "Privacy Notice" to match. The URL is
  unchanged.
- **Section I:** removed accounts, sweepstakes, special offers from third
  parties, and credit card payment (none exist). Added what the For
  Practices form collects and the campaign data saved with messages. Fixed
  "we do not collect any personal information unless you voluntarily
  provide it", which contradicted the automatic collection in Section V.
- **Section II:** removed "notices about your account" (no accounts). Fixed
  the "director" typo. Removed "we may use your information to inform you
  of other products or services" (contradicts no marketing to consumers)
  and replaced it with: no marketing use of consumers' contact information,
  sales follow-up only for people contacting us on behalf of a practice.
- **Section III:** added "We never sell your personal information" and that
  messages go only to the chosen practice. Replaced "trusted partners to
  send you email or postal mail, provide customer support, or arrange for
  deliveries" with the actual service providers (hosting, database, email,
  analytics). Removed the biometric data line (none collected).
- **Section IV:** the draft's opt-out section was unfinished (blanks and a
  dangling "you have the right to know:"). Rewritten as "Your Privacy
  Choices and Rights": the My Privacy Choices page, Global Privacy Control,
  California rights (know, copy, correct, delete, opt out), the privacy@
  email for requests, and non-discrimination. **Attorney: please review
  closely.**
- **Section V:** added IP-based approximate location (used to suggest a zip,
  not stored) and recorded zip searches.
- **Section VI:** replaced boilerplate about registering and billing and
  shipping addresses with a summary linking to the Cookie Policy and My
  Privacy Choices.
- **Section VIII:** the draft said SSL protects "personal information (such
  as a credit card number) transmitted to other websites". Rewritten to
  describe what the site does: TLS between the browser and the site, and
  encrypted storage.
- **New Section XI, Data Retention:** a general retention statement
  (privacy laws expect one). **Attorney: set a specific period or criteria**
  (`docs/legal-facts.md`, question 8).
- **Children:** the draft said children under 13 should ask a parent's
  permission. Replaced with: the site is for adults, and we'll delete
  information from a child under 13.
- **Email Communications:** the draft's opt-out sentence was garbled
  (answer text pasted mid-sentence). Rewritten from the owner's answer.
- **Changes to This Policy:** removed "email to the primary email address in
  your account" (no accounts).
- **Contact:** removed the blank phone number (email only, per the owner's
  decision).

### Terms & Conditions
- Named the DBA alongside the LLC in the opening.
- Formatted the "About the Site" list. Linked the Privacy Policy.
- **Added an anti-scraping paragraph** under No Unlawful or Prohibited Use
  (`docs/anti-scraping.md`). **Attorney: please review.**
- **Added a line** that practices buying listings are bound by a separate
  agreement covering pricing, billing, cancellation, and refunds.
- Changed "Service" to "Site" where the draft mixed the two.
- **Contact:** filled the blank email with hello@openairallergynetwork.com
  and removed the blank phone number.
- Arbitration and class action waiver kept as drafted. **Attorney:** see
  `docs/legal-facts.md`, question 11b (small-claims carve-out, informal
  resolution step, mass-arbitration provisions, opt-out window).

### Cookie Policy
- Removed the stray "COOKPO" and retitled it "Cookie Policy", naming the LLC
  and DBA.
- Removed boilerplate about registering, billing addresses, and shipping
  addresses, and the claim that session cookies are used (the site uses
  none).
- **Functionality cookies:** the draft said they "may enable visitor
  identification across websites and over time" (the questionnaire grouped
  them with advertising cookies) and described greeting visitors by name
  and remembering language or region. Corrected: they remember the last
  zip searched and don't identify anyone.
- **Advertising cookies:** removed "make the advertising displayed on it
  more relevant to your interests" and "videos viewed". The owner's policy
  is measurement only, with no remarketing (consistent with never selling
  or sharing visitor data). Duration changed from 30 days to "up to 90
  days" to cover Google Ads cookies (the site's own campaign cookie lasts
  30).
- **Third-party cookies:** removed "social network connectors" and "maps"
  (neither sets cookies on this site).
- Removed the "legal basis" paragraph, which had the law-enforcement
  disclosure text pasted in as the answer. "Legal basis" is an EU (GDPR)
  concept.
- **Your Cookie Choices:** the draft said to withdraw consent "by contacting
  us". Now points to the My Privacy Choices page and mentions Global
  Privacy Control.
- **Contact:** removed the blank phone number.

## Open items
- **Medical Disclaimer** (attorney): it says ILIT hasn't been reviewed for
  FDA approval, that badges like "Verified" aren't endorsements, and that
  some practices pay for "medically reviewed by" credits (see
  `docs/legal-facts.md`, questions 5 and 6).
- **Accessibility Statement** (attorney): it claims partial WCAG 2.1 AA
  conformance, names the search map as a known limitation (the list view is
  the accessible alternative), and commits to responding within 5 business
  days. No formal accessibility audit has been done yet.
- Washington consumer health data policy: `docs/legal-facts.md`, question 1.
