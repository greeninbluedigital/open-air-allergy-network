/**
 * Campaign attribution that survives navigation (docs/gtm-ga4-setup.md,
 * "Lead attribution"). When a visitor lands from a campaign link (UTM tags,
 * or a Google/Microsoft Ads click id), AnalyticsListener saves the campaign
 * and landing page in this cookie for 30 days. The lead form actions read it,
 * so a lead that starts on an SEM landing page and ends on the main site
 * still records its campaign and keyword. A newer campaign visit overwrites
 * an older one (last campaign touch wins).
 */
export const ATTRIBUTION_COOKIE = "oaan_attr";
export const ATTRIBUTION_MAX_AGE_DAYS = 30;

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  gclid?: string;
  landingPage?: string;
};

const MAX_LEN = 200;

/** Parses the cookie value defensively: it's client-written, so treat it as untrusted input. */
export function parseAttribution(raw: string | undefined): Attribution {
  if (!raw) return {};
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const out: Attribution = {};
    for (const key of ["source", "medium", "campaign", "term", "content", "gclid", "landingPage"] as const) {
      const v = data[key];
      if (typeof v === "string" && v.trim()) out[key] = v.trim().slice(0, MAX_LEN);
    }
    return out;
  } catch {
    return {};
  }
}
