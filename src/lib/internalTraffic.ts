/**
 * "Don't count this device": the owner's own computer and phone, excluded
 * from every traffic count (GA4, Vercel Web Analytics and the site's own
 * AnalyticsEvent log). Open any page with ?oaan_internal=on once on each
 * device to switch it on, or ?oaan_internal=off to switch it back. It's a
 * localStorage flag in that browser only (no cookie, nothing sent anywhere),
 * set by the consent boot script before any analytics loads
 * (src/lib/consent.ts), which also skips Tag Manager for flagged devices.
 * docs/analytics.md has the how-to.
 */
export const INTERNAL_FLAG = "oaan_internal";
export const INTERNAL_PARAM = "oaan_internal";

/** True in a browser the owner has flagged. Safe to call on the server (false). */
export function isInternalDevice(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { oaanInternal?: boolean };
  if (typeof w.oaanInternal === "boolean") return w.oaanInternal;
  try {
    return window.localStorage.getItem(INTERNAL_FLAG) === "1";
  } catch {
    return false;
  }
}

/** Boot script fragment (plain ES5): reads ?oaan_internal=on|off, saves it,
 * and sets window.oaanInternal for everything that runs after. */
export function internalBootSnippet(): string {
  return `var INTERNAL=false;try{var qi=(location.search.match(/[?&]${INTERNAL_PARAM}=(on|off)/)||[])[1];if(qi==="on"){localStorage.setItem(${JSON.stringify(INTERNAL_FLAG)},"1");}if(qi==="off"){localStorage.removeItem(${JSON.stringify(INTERNAL_FLAG)});}INTERNAL=localStorage.getItem(${JSON.stringify(INTERNAL_FLAG)})==="1";}catch(e){}window.oaanInternal=INTERNAL;`;
}
