import { isInternalDevice } from "@/lib/internalTraffic";

/**
 * Pushes an event to GTM's dataLayer. Every site event is named `oaan_*` and
 * uses GA4-style snake_case parameters, so one GTM trigger and one GA4 tag
 * forward them all (docs/gtm-ga4-setup.md). Never throws: analytics failing
 * shouldn't break the page.
 */
export function pushDataLayer(event: `oaan_${string}`, params: Record<string, string | number | undefined>) {
  if (typeof window === "undefined" || isInternalDevice()) return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
}

/**
 * Provider-scoped events go to both destinations at once: GTM's dataLayer
 * (GA4) and our own /api/events (the AnalyticsEvent log behind practice
 * reports, docs/analytics.md).
 */
export function trackEvent(
  type: "PAGE_VIEW" | "PHONE_CLICK" | "WEBSITE_CLICK" | "ADDRESS_CLICK" | "EMAIL_CLICK" | "PROFILE_CLICK",
  data: {
    providerId: string;
    providerName?: string;
    path: string;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  },
) {
  if (typeof window === "undefined" || isInternalDevice()) return;

  const { providerName, ...eventData } = data;
  pushDataLayer(`oaan_${type.toLowerCase()}`, {
    provider_id: data.providerId,
    provider_name: providerName,
  });

  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...eventData }),
    keepalive: true,
  }).catch(() => {});
}
