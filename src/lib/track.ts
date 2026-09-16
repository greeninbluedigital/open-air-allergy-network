/**
 * Fires an analytics event to both destinations at once: GTM's dataLayer
 * (for GA4/Ads/whatever tags get added there later — see NEXT_PUBLIC_GTM_ID
 * in layout.tsx) and our own /api/events (the internal, provider-scoped log
 * a Featured practice's reporting view will eventually read from). Never
 * throws or blocks the UI — analytics failing shouldn't break the page.
 */
export function trackEvent(
  type: "PAGE_VIEW" | "PHONE_CLICK",
  data: {
    providerId: string;
    path: string;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  },
) {
  if (typeof window === "undefined") return;

  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: `oaan_${type.toLowerCase()}`, ...data });

  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...data }),
    keepalive: true,
  }).catch(() => {});
}
