# Consent banner and privacy choices

How the site asks for, stores, and applies visitors' analytics and
advertising choices. The legal decisions (which mode, the wording) belong
to counsel; this doc covers the machinery. Last updated 2026-09-29.

## What visitors see

- **Banner:** on the first visit, a bar along the bottom of every page
  until the visitor makes a choice. Hidden on the My Privacy Choices page,
  which has the full controls.
- **My Privacy Choices** (`/legal/privacy-choices`, linked from the footer
  and the banner): checkboxes for **Analytics cookies** and **Advertising
  cookies**, plus **Save choices** and **Opt out of all**. The written text
  on that page comes from the LegalPage table like the other legal pages.
  The controls sit above it.

## The one switch: `CONSENT_MODE`

In `src/lib/consent.ts`. Changing it takes a one-line code change and a
deploy.

| Mode | Before a choice is made | Banner |
|---|---|---|
| `"opt-out"` (current) | Analytics and advertising on | Notice: "We use cookies … You can change this anytime." with **OK** and a Privacy choices link |
| `"opt-in"` | Both off | Question: "May we use cookies …?" with **Accept** and **Decline** |

In both modes:
- A **saved choice always wins** over the default.
- A **Global Privacy Control** signal from the visitor's browser always
  turns advertising off, even if they click OK or Accept. California law
  requires honoring it. The banner and the choices page say so when it's
  detected.

## What each choice controls

| | Analytics on | Analytics off |
|---|---|---|
| Google Tag Manager / GA4 | Loads; GA4 may set its cookies | GA4 is told consent is denied. If advertising is off too, **Tag Manager doesn't load at all**, so the browser never contacts Google. |
| `oaan_attr` campaign cookie | Saved when arriving from a campaign link | Not saved; opting out deletes it |

| | Advertising on | Advertising off (or GPC) |
|---|---|---|
| Google Consent Mode `ad_storage`, `ad_user_data`, `ad_personalization` | granted | denied |
| Ad click id (gclid) in `oaan_attr` | Saved | Not saved |

Opting out of analytics also deletes existing `_ga` cookies.

**Not affected by these choices** (no visitor identifiers, or needed for
the site to work): OAAN's own practice-report event log, the `oaan_zip`
cookie that remembers a searched zip, and the campaign tags in the URL of a
form a visitor submits.

## How it works

1. A small script runs before anything else on every page (the root
   layout, `beforeInteractive`). It reads the `oaan_consent` cookie and
   the browser's GPC signal, and sends Google Consent Mode's default state.
2. It loads Tag Manager only if analytics or advertising is allowed.
3. It exposes `window.oaanConsent`. The banner and choices page call its
   `update()`, which saves the `oaan_consent` cookie (1 year), sends a
   Consent Mode update, loads Tag Manager if newly allowed, and deletes
   analytics cookies if analytics was turned off.

Without JavaScript, nothing tracks: Tag Manager can't load, and there's no
`<noscript>` fallback.

## For the Tag Manager setup (later)

Google's own tags (GA4, Google Ads) read Consent Mode automatically. If
analytics is denied while advertising is allowed, GA4 can still send
cookieless "pings" (Google's *advanced* consent mode). If counsel wants
nothing sent to GA4 when analytics is off, add **Additional consent checks
→ Require additional consent → `analytics_storage`** to the GA4 tags in
Tag Manager (*basic* consent mode). Any non-Google tag added later (a Meta
pixel, for example) needs its consent requirement set by hand.

## Open questions for counsel

(Also in `docs/legal-facts.md`.)
- Opt-out or opt-in (and whether opt-in is needed only for some states or
  for health-related events).
- The banner and choices page wording, including whether the footer link
  should read "Your Privacy Choices" with California's opt-out icon.
- Whether the patient contact form needs its own consent checkbox, which
  is separate from this banner.

Code: `src/lib/consent.ts` (mode, boot script),
`src/components/consent/ConsentBanner.tsx`,
`src/components/consent/PrivacyChoicesPanel.tsx`,
`src/components/consent/useConsent.ts`.
