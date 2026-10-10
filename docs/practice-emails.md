# Practice email addresses (Notification Email, column K)

On a free trial page the Notification Email is **public**: the page shows an
"Email {practice}" button and the address itself (see `docs/sheet-columns.md`,
column K). So a trial row only gets an address the practice already publishes
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

**No address published (column K left blank):**

| Practice | What the site offers |
|---|---|
| Prairie Allergy | Contact form only (prairieallergykc.com/contact) |
| Auni Allergy | Contact form only (auniallergy.com/contact-us) |
| Grand Rapids Allergy | Only billing@ and hiring@ on /contact, not meant for patients |

None of these sites hid an address behind Cloudflare email protection. If
one ever does, treat it like a contact form: the practice is guarding the
address, so don't publish it.

**Allergenix (row 9)** has info@allergenix.com, entered by the owner before
the practice declined (2026-10-09). It's a basic listing, so nothing shows.

## How to check a new practice

Ask Claude to scrape the practice's site (homepage, contact and about pages,
email links and page text), then add a row to this table before filling in
column K.
