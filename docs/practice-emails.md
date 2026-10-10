# Practice email addresses (Notification Email, column K)

The Notification Email can be **public**: visitors in a consumer health data
state (WA, NV, CT) and every visitor to a practice located in one get an
"Email {practice}" button showing the address instead of the contact form
(see `docs/sheet-columns.md`, column K, and `src/lib/healthDataStates.ts`). So a row only gets an address the practice already publishes
on its own website. A practice that only offers a contact form keeps column K
blank, and its page shows phone and website only.

This table records where each address came from, so it can be rechecked if a
practice asks.

## Trial practices (scraped 2026-10-09)

| Row | Practice | Address | Where it's published |
|---|---|---|---|
| 10–12 | AllerPoint (Henrico, Arlington, Philadelphia) | info@allerpoint.com | allerpoint.com homepage, as an email link |
| 14 | Columbia Allergy, Fremont | fr-front@aa-clinic.com | columbiaallergy.com/contact, listed under the Fremont office (each office has its own "-front" address on aa-clinic.com) |
| 22 | AASC, Bolingbrook | info@aascmed.com | aascmed.com homepage and /contact page text |
| 31 | Shepherd Allergy | allergy@shepherdallergy.com | shepherdallergy.com homepage, as an email link |
| 32 | Integrative Allergy & Immunology Care | hello@integrativecarenc.com | integrativecarenc.com/contact page text |
| 35 | Bay Area Allergy and Asthma, 4th St | office@bayallergy.com | bayallergy.com/contact and site footer, listed for both offices |
| 26–27 | St. Louis Family Allergy (St. Peters, St. Louis) | info@stlfamilyallergy.com | stlouisallergyasthma.com homepage contact details (added 2026-10-09) |
| 98 | Premier Allergy & Asthma, Dublin | appt@ohallergy.com | premierallergyohio.com/locations/dublin (added 2026-10-09) |

**No address published (column K left blank):**

| Practice | What the site offers |
|---|---|
| Prairie Allergy | Contact form only (prairieallergykc.com/contact) |
| Auni Allergy | Contact form only (auniallergy.com/contact-us) |
| Grand Rapids Allergy | Only billing@ and hiring@ on /contact, not meant for patients |
| Aspire Allergy & Sinus (31 offices) | Phone and online scheduling only. None of the 31 clinic pages publishes an email (checked 2026-10-09) |
| AIR Care, Plano | Phone only, no email on the site (checked 2026-10-09) |

None of these sites hid an address behind Cloudflare email protection. If
one ever does, treat it like a contact form: the practice is guarding the
address, so don't publish it.

**Allergenix (row 9)** has info@allergenix.com, entered by the owner before
the practice declined (2026-10-09). It's a basic listing, so nothing shows.

## How to check a new practice

Ask Claude to scrape the practice's site (homepage, contact and about pages,
email links and page text), then add a row to this table before filling in
column K.
