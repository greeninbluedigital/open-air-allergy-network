# Accounts used by this project

Every external account/service this project depends on, which login it's
under (where known), and how to get to it. **No passwords are stored here**
— only which email/identity owns each account, so you know which login to
try. Fill in the `?` cells yourself; I don't have visibility into which
Google/email account you used for each signup unless you've told me.

| Service | Used for | Account / login | Access |
|---|---|---|---|
| **Prisma Studio** | Browsing/editing the database directly | **No account exists** — it's a local tool (`npx prisma studio`), not a hosted service. It connects using the `DATABASE_URL` already in `.env`. Nothing to sign up for. | Run `npx prisma studio` from the project folder, opens at `http://localhost:5555` |
| **Neon** | Postgres database hosting | ? | [console.neon.tech](https://console.neon.tech) |
| **GitHub** | Source code repo | `greeninbluedigital` account | [github.com/greeninbluedigital/open-air-allergy-network](https://github.com/greeninbluedigital/open-air-allergy-network) |
| **Vercel** | Site hosting — live at `openairallergynetwork.com` since 2026-10-02 (`www` and the old `open-air-allergy-network.vercel.app` redirect there) | ? | [vercel.com](https://vercel.com) |
| **Google Cloud Console** | Places API key + the Sheets sync service account. Billing account attached (required for the Places API); a $300 promotional credit expires 2026-12-15. Reviews use the legacy Place Details call, billed as Places Details (5,000 free a month) plus Atmosphere Data (1,000 free a month, then $5 per 1,000), so the cap that matters is about 1,000 calls a month. The weekly Monday refresh is capped at 190 practices for that reason (5 Mondays x 190 = 950, leaving room for a few hand runs; `REFRESH_LIMIT` in `src/app/api/reviews/refresh/route.ts`, set 2026-10-30, explains it too) | ? — project ID `infinite-mantis-508700-c1` | [console.cloud.google.com](https://console.cloud.google.com) |
| **Google Sheets** ("OAAN data sync") | Source data for the provider sync job | `greeninbluedigital@gmail.com` (owner) | [The sheet itself](https://docs.google.com/spreadsheets/d/1a4GVISoL_Q-QcRpjis60yAKxBGrSGVPg0i04BrbqEHs) |
| **Google Analytics (GA4)** | Site analytics | ? | [analytics.google.com](https://analytics.google.com) |
| **Google Tag Manager** | Manages the GA4/Ads tags on the site | ? | [tagmanager.google.com](https://tagmanager.google.com) |
| **Google Search Console** | Indexing status, search queries, sitemap submission | `greeninbluedigital@gmail.com`. Domain property for `openairallergynetwork.com`, verified 2026-09-24 via a `google-site-verification=` TXT record in Cloudflare DNS. **Don't delete that TXT record** — removing it un-verifies the property. | [search.google.com/search-console](https://search.google.com/search-console) |
| **Mapbox** | Geocoding (sync job) + SRP map tiles | `greeninbluedigital` account | [account.mapbox.com](https://account.mapbox.com) |
| **Resend** | Transactional email (lead confirmation/forwarding), plus outgoing mail for Gmail "Send mail as" on every @openairallergynetwork.com address and the Green in Blue Digital domain (set up 2026-09-30). Keys: the site's `RESEND_API_KEY`, an OAAN "Gmail send-as" key, and a Green in Blue Digital send-as key, each limited to its domain. **Free plan limits are shared across everything on the account:** 3,000 emails a month, 100 a day, 3 domains (2 in use). Hitting the daily cap would also block the site's lead emails | Possibly `leads@openairallergynetwork.com`, which forwards to `openairallergynetwork@gmail.com`. That Gmail was frozen by Google 2026-09-16 and reactivated after appeal 2026-09-24, so Resend's recovery emails are reachable again. | [resend.com](https://resend.com) |
| **Cloudflare** | DNS + email routing for openairallergynetwork.com | ? | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **LinkedIn company page** | Brand profile (also in the homepage's Organization `sameAs`) | Owner's personal LinkedIn (page admin) | [linkedin.com/company/open-air-allergy-network](https://www.linkedin.com/company/open-air-allergy-network/) |
| **Facebook page** | Brand profile (`sameAs`) | ? | [facebook.com/openairallergynetwork](https://www.facebook.com/openairallergynetwork) |
| **Pinterest business account** | Brand profile and article pins (`sameAs`). Website claimed via the `p:domain_verify` meta tag in `src/app/layout.tsx` | ? | [pinterest.com/openairallergynetwork](https://www.pinterest.com/openairallergynetwork/) |
| **Crunchbase** | Company entry and founder profile (`sameAs`), set up 2026-10-20 | Owner | [crunchbase.com/organization/open-air-allergy-network](https://www.crunchbase.com/organization/open-air-allergy-network) |
| **Qwoted** | Journalist source requests (owner's personal profile, set up 2026-10-19) | Owner | [qwoted.com](https://www.qwoted.com) |
| **Cloudinary** | Provider/article photo hosting | `greeninbluedigital@gmail.com` (created under this account while `openairallergynetwork@gmail.com` was frozen, 2026-09-16 to 2026-09-24) | [console.cloudinary.com](https://console.cloudinary.com) |

**Not yet set up:** Yelp Fusion API (deferred — see Yelp roadmap notes), Google Ads (no account yet), Stripe (billing handled manually, off-site, for now).
