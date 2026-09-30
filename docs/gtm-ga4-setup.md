# Google Tag Manager and GA4: setup and reporting guide

How the site's tracking reaches GA4, the one-time setup in Tag Manager and
GA4, and where to find the answer to each tracking question. Written for
someone new to Tag Manager. Last updated 2026-09-29.

Accounts: Tag Manager container `GTM-P3J8T24W`, GA4 property
`G-S8P8XYEGMP`. The container only loads on the live production site, not
on local development or Vercel preview deployments, so test traffic stays
out of GA4. It also respects each visitor's cookie choices through Google
Consent Mode (`docs/consent.md`, including one optional GA4 tag setting).
Preview mode needs a browser that hasn't opted out.

## How the pieces fit

1. **The site** sends events into the *dataLayer*, a list in the browser
   that Tag Manager watches. Every site event starts with `oaan_`, for
   example `oaan_cta_click`.
2. **Tag Manager** decides what to do with each event. On its own it does
   nothing: an event only goes anywhere if a *trigger* (a rule like "event
   name starts with oaan_") fires a *tag* (an action like "send this to
   GA4").
3. **GA4** receives what the tags send and builds the reports.

**Why you don't see the events in Tag Manager's variables screen:** Tag
Manager doesn't keep a list of the events a site sends. The built-in
variables you saw (Event, Page Hostname, Page Path, Page URL, Referrer) are
generic tools, not a list. To *see* events happen, use **Preview** mode
(step 2.4). It shows every event live as you click around the site.

GA4 also collects some things automatically, with no setup: page views,
landing pages, traffic sources and referring sites, UTM campaigns, scrolls,
and outbound link clicks.

## 1. Events the site sends

| Event | When it fires | Parameters |
|---|---|---|
| `oaan_cta_click` | Click on any tagged button or link (see the CTA list below) | `cta_id`, `cta_text`, `link_url`, `provider_name` (provider cards only) |
| `oaan_provider_search` | A zip search for providers is submitted | `search_origin`, `search_zip`, `search_radius` (search page only) |
| `oaan_page_view` | A provider page or SEM landing page loads | `provider_id`, `provider_name` |
| `oaan_phone_click` | Practice phone number clicked or tapped | `provider_id`, `provider_name` |
| `oaan_website_click` | Practice website link clicked | `provider_id`, `provider_name` |
| `oaan_address_click` | Practice address clicked (opens Google Maps) | `provider_id`, `provider_name` |
| `oaan_lead_submit` | Patient contact form sent, on a provider page or SEM landing page | `provider_id`, `provider_name`, `form_location` (`provider_page` or `sem_landing_page`) |
| `oaan_lead_confirm` | Patient clicked the confirmation link in their email | same as `oaan_lead_submit` |
| `oaan_practice_lead_submit` | For Practices form sent | none |
| `oaan_general_inquiry_submit` | About page form sent | none |

The form events fire when the success message appears. Reloading that
success page in the same browser session doesn't send the event again.

### CTA ids (`cta_id`)

| `cta_id` | Where it is |
|---|---|
| `nav_header` | Header menu links, every page (`cta_text` says which link) |
| `nav_mobile` | Phone menu links |
| `nav_header_logo` | Site name/logo in the header |
| `footer` | Footer links (Learn, Find a Provider, Blog, For Practices) |
| `learn_hero` | Learn About ILIT, "Find a Provider" button in the hero |
| `learn_right_for_me` | Learn About ILIT, "Find a Provider" button in "Is ILIT Right for Me" |
| `learn_comparison_summary` | Learn About ILIT, "provider in your area" link under the comparison table |
| `homepage_featured_see_all` | Homepage, "See all ILIT providers near {city}" |
| `homepage_nearby_count` | Homepage, "{N} ILIT providers within 200 miles … See them" |
| `homepage_change_location` | Homepage, "Not near {city}? Change location" |
| `homepage_what_is_ilit` | Homepage, "Learn more about ILIT" |
| `homepage_symptoms` | Homepage, "Is ILIT right for me?" |
| `for_practices_patient_nudge` | For Practices, "Find a provider near you" (patients who landed on the wrong page) |
| `homepage_bottom_for_practices`, `about_bottom_for_practices` | "For Practices" button in the bottom row |
| `freemium_claim_listing` | Free listing page, "Is this your practice? Claim this listing" |
| `provider_card_homepage`, `provider_card_search`, `provider_card_nearby` | A practice card clicked in the homepage featured list, search results, or a free listing's nearby list |
| `srp_view_list`, `srp_view_map` | List/Map switch on phones |
| `sem_header_logo` | Logo on an SEM landing page, the way out to the main site |
| `sem_hero_send_message` | SEM landing page, "Send a Message" button in the hero |
| `sem_right_for_me` | SEM landing page, "Send a Message" button in "Is ILIT Right for Me?" |
| `sem_comparison_summary` | SEM landing page, "Send a message" link under the comparison table |
| `sem_view_full_profile` | SEM landing page, "View full provider profile" link to the practice's main page |

### Search origins (`search_origin`)

`homepage_hero`, `homepage_bottom`, `about_bottom`, `learn_bottom`,
`srp_header` (the search bar on the results page itself).

**"Find a Provider" usage, all together:** every search box is an
`oaan_provider_search` (by `search_origin`), and every link-style "Find a
Provider" button is an `oaan_cta_click` whose `link_url` is
`/find-an-ilit-provider`.

## 2. One-time Tag Manager setup

In [tagmanager.google.com](https://tagmanager.google.com), open container
GTM-P3J8T24W. Nothing goes live until you publish in step 2.5.

### 2.1 Variables: one per parameter

**Variables** → under *User-Defined Variables*, **New** → **Variable
Configuration** → **Data Layer Variable**. Create one for each parameter.
Set *Data Layer Variable Name* to exactly the parameter name, and name the
variable `DLV - ` plus the parameter name:

`cta_id`, `cta_text`, `link_url`, `provider_id`, `provider_name`,
`search_origin`, `search_zip`, `search_radius`, `form_location`

That's 9 variables, for example "DLV - cta_id" reading `cta_id`.

### 2.2 Trigger: one for all site events

**Triggers** → **New** → **Trigger Configuration** → **Custom Event**.
- Event name: `^oaan_`
- Check **Use regex matching**
- This trigger fires on: **All Custom Events**
- Name it "All OAAN events"

`^oaan_` means "starts with oaan_", so any event added to the site later is
picked up automatically.

### 2.3 Tag: send them all to GA4

**Tags** → **New** → **Tag Configuration** → **Google Analytics** →
**Google Analytics: GA4 Event**.
- Measurement ID: `G-S8P8XYEGMP`
- Event Name: `{{Event}}` (pick it with the building-block icon; it's the
  built-in "Event" variable, so GA4 receives each event under its own name)
- **Event Parameters** → **Add parameter** once per variable: *Event
  Parameter* `cta_id`, *Value* `{{DLV - cta_id}}`, and so on for all 9
- **Triggering:** "All OAAN events"
- Name it "GA4 - OAAN events"

If the "Event" variable isn't offered, turn it on under **Variables** →
**Configure** (built-in variables) → **Event**.

### 2.4 Preview: see events live

Click **Preview** (top right) and enter
`https://open-air-allergy-network.vercel.app` (the real domain after
launch). The site opens in a new tab connected to Tag Assistant.
- Click around: a Find a Provider button, a search, a practice card.
- In Tag Assistant, each action appears in the left column as an event
  (`oaan_cta_click`, `oaan_provider_search`, …).
- Select one to see whether "GA4 - OAAN events" fired, and open
  **Variables** to see the values it sent.

GA4 has a matching live view: **Admin** → Data display → **DebugView** shows events from
the Preview session within seconds.

### 2.5 Publish

**Submit** → give the version a name ("OAAN site events") → **Publish**.

## 3. One-time GA4 setup

In [analytics.google.com](https://analytics.google.com), property
G-S8P8XYEGMP, under **Admin**.

1. **Custom dimensions** (Data display → Custom definitions → Create custom
   dimension, scope **Event**): one per parameter, named the same as the
   parameter: `cta_id`, `cta_text`, `link_url`, `provider_name`,
   `search_origin`, `search_zip`, `search_radius`, `form_location`.
   (`provider_id` can be skipped since `provider_name` is readable.) Without
   these, GA4 receives the parameters but won't show them in reports. They
   only apply to data from the day they're created on.
2. **Key events** (GA4's name for conversions): once the events have shown
   up (allow a day), go to Data display → Events and turn on **Mark as key
   event** for:
   - `oaan_lead_submit`: the main patient conversion
   - `oaan_phone_click`
   - `oaan_practice_lead_submit`: a sales lead for OAAN
   - `oaan_provider_search`: the suggested homepage conversion
   - Optionally `oaan_website_click` and `oaan_address_click`
3. **Data retention:** Data collection and modification → Data retention →
   **14 months** (the default is 2, which limits Explorations).
4. **Internal traffic:** Data streams → your web stream → Configure tag
   settings → Define internal traffic → add your home/office IP address.
   Then Data collection and modification → Data filters → "Internal Traffic"
   → set to **Active**.
5. **Page changes:** Data streams → your web stream → Enhanced measurement
   (gear icon) → Page views → Show advanced settings → confirm **Page
   changes based on browser history events** is on. The site moves between
   pages without full reloads, and this is what counts those as page views.
6. **Search Console:** Product links → Search Console links → Link, and
   pick the openairallergynetwork.com property.
7. **Google Ads** (once the account exists): Product links → Google Ads
   links → Link. Leave **auto-tagging** on in Google Ads. This brings
   campaign, ad group, and keyword into GA4 automatically, and lets Google
   Ads import the key events above for bidding.

**Hold until the attorney weighs in** (`docs/legal-facts.md`, questions 1,
2, and 7): lead and search events can count as health-related data under
some state laws. Until then, leave **Google signals** off (Data collection
and modification → Data collection), leave the optional **Data sharing
settings** off (Account settings → Account details), and don't import lead
events into Google Ads or build ad audiences from them.

## 4. Your questions, and where GA4 answers them

**Which "Find a Provider" buttons get used, and on which pages?**
Explore → Free form. Rows: `cta_id`, then "Page path and screen class".
Value: Event count. Filter: Event name exactly matches `oaan_cta_click`
and `link_url` contains `find-an-ilit-provider`. Build a second table the
same way for `oaan_provider_search` by `search_origin`. A placement that
rarely gets used is a candidate to remove.

**Where do sessions start (entry points)?** Reports → Engagement →
**Landing page**.

**Which sites send visitors (referring domains)?** Reports → Acquisition →
**Traffic acquisition**, with the dimension set to **Session source /
medium**. Rows ending in "/ referral" are other websites, by domain. For
the exact referring page, use an Exploration with the "Page referrer"
dimension.

**Learn and Blog article views, and are articles entry points?**
- Views: Reports → Engagement → **Pages and screens**, search for
  `/learn-about-ilit/` or `/blog/`.
- Entry points: the **Landing page** report with the same search. Add
  **Session default channel group** as a secondary dimension: sessions
  arriving from "Organic Search" on an article mean its keywords are
  working.
- After linking Search Console (step 3.6): Reports → Search Console →
  **Queries** shows the actual Google searches that led to each page.

**Paid campaigns: sessions per campaign.** Reports → Acquisition →
Traffic acquisition, dimension **Session campaign**. With Google Ads linked,
Reports → Advertising adds campaign and keyword detail.

**Can a lead be attributed to a paid campaign, and which keyword?**
- In GA4: the Traffic acquisition report has a **Key events** column. Pick
  `oaan_lead_submit` to see leads by Session campaign. For the keyword, use
  **Session manual term** (from `utm_term`) or, with Google Ads linked,
  **Session Google Ads keyword text**.
- In OAAN's own records: every lead saves its campaign source, medium,
  campaign, keyword, ad click id, and landing page, even when the visitor
  moved from an SEM page into the main site before sending the form. The
  For Practices and About lead emails show the campaign, keyword, and
  landing page.

**Did SEM landing page visitors go on to the main site?** Explore → **Path
exploration**, starting point Page path = the SEM page (`/lp/…`), to see
where visitors went next. Or Explore → Free form with a segment
"Session landing page begins with `/lp/`" and "Page path and screen class"
as rows. The `sem_header_logo` CTA counts clicks on the one link out of an
SEM page. In OAAN's records, a lead whose landing page starts with `/lp/`
but was sent from a provider page made that exact trip.

## 5. Campaign links (UTM tags)

Tag every paid or campaign link so GA4 and the site can attribute it:

```
https://openairallergynetwork.com/lp/example-practice/sf-bay-area?utm_source=google&utm_medium=cpc&utm_campaign=example-practice-sf&utm_term=ilit+near+me
```

- `utm_source`: where the ad runs (`google`, `bing`, `facebook`)
- `utm_medium`: `cpc` for paid search, `paid_social` for social ads,
  `email` for email
- `utm_campaign`: one consistent name per campaign, lowercase with hyphens
- `utm_term`: the keyword
- `utm_content`: optional, to tell ads within a campaign apart

In Google Ads you don't have to tag each ad by hand. Set an account-level
**Final URL suffix**:

```
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}&utm_content={creative}
```

Google fills in the braces on every click (`{keyword}` becomes the
keyword that matched). With the GA4 link, GA4 shows the campaign *names*
too.

**How the site remembers the campaign:** a visitor arriving with UTM tags
or a Google/Microsoft Ads click id gets a first-party cookie, `oaan_attr`,
holding the campaign details and landing page for 30 days. A newer
campaign visit replaces it. Lead forms read it, so a lead sent days later,
or from a different page, still carries its campaign. The cookie holds
campaign data only, no name or contact details. It (and GA4's own cookies)
should be listed in the Cookie Policy and Privacy Notice being reviewed
with counsel.

## 6. Adding tracking later

- **A new button or link:** add a `data-cta="some_id"` attribute to it in
  the code. It's sent as `oaan_cta_click` right away. No Tag Manager or GA4
  change needed.
- **A new search box:** pass `origin="some_place"` to `ZipSearchForm`.
- **A new event with a new parameter:** needs a matching Data Layer
  Variable (2.1), a row in the GA4 tag (2.3), and a custom dimension (3.1).

Code: `src/lib/track.ts` (dataLayer helper),
`src/components/analytics/AnalyticsListener.tsx` (CTA clicks, searches,
campaign cookie), `src/components/analytics/DataLayerEvent.tsx` (form
success events), `src/lib/attribution.ts` (campaign cookie),
`src/lib/actions.ts` (saves campaign data with each lead).
