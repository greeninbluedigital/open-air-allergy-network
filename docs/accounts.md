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
| **Vercel** | Site hosting (not yet deployed) | ? — not created yet | [vercel.com](https://vercel.com) |
| **Google Cloud Console** | Places API key + the Sheets sync service account | ? — project ID `infinite-mantis-508700-c1` | [console.cloud.google.com](https://console.cloud.google.com) |
| **Google Sheets** ("OAAN data sync") | Source data for the provider sync job | ? — whichever Google account owns the actual spreadsheet | [The sheet itself](https://docs.google.com/spreadsheets/d/1a4GVISoL_Q-QcRpjis60yAKxBGrSGVPg0i04BrbqEHs) |
| **Google Analytics (GA4)** | Site analytics | ? | [analytics.google.com](https://analytics.google.com) |
| **Google Tag Manager** | Manages the GA4/Ads tags on the site | ? | [tagmanager.google.com](https://tagmanager.google.com) |
| **Mapbox** | Geocoding (sync job) + SRP map tiles | `greeninbluedigital` account | [account.mapbox.com](https://account.mapbox.com) |
| **Resend** | Transactional email (lead confirmation/forwarding) | ? | [resend.com](https://resend.com) |
| **Cloudflare** | DNS + email routing for openairallergynetwork.com | ? | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **Cloudinary** | Provider/article photo hosting | `greeninbluedigital@gmail.com` (switched from `openairallergynetwork@gmail.com` after Google froze that account, 2026-09-16) | [console.cloudinary.com](https://console.cloudinary.com) |

**Not yet set up:** Yelp Fusion API (deferred — see Yelp roadmap notes), Google Ads (no account yet), Stripe (billing handled manually, off-site, for now).
