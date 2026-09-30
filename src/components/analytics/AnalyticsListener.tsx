"use client";

import { useEffect } from "react";
import { pushDataLayer } from "@/lib/track";
import { ATTRIBUTION_COOKIE, ATTRIBUTION_MAX_AGE_DAYS } from "@/lib/attribution";
import { getConsentApi } from "@/lib/consent";

/** Paid-click ids and the source/medium they imply when no UTM tags came with them. */
const CLICK_IDS = [
  { param: "gclid", source: "google", medium: "cpc" },
  { param: "gbraid", source: "google", medium: "cpc" },
  { param: "wbraid", source: "google", medium: "cpc" },
  { param: "msclkid", source: "bing", medium: "cpc" },
];

/**
 * Saves campaign details from the landing URL (see src/lib/attribution.ts).
 * Needs analytics consent; the ad click id also needs advertising consent.
 */
function captureAttribution() {
  const consent = getConsentApi()?.current;
  if (!consent?.analytics) return;
  const params = new URLSearchParams(window.location.search);
  const clickId = CLICK_IDS.find((c) => params.get(c.param));
  const utm = (name: string) => params.get(`utm_${name}`) || undefined;
  if (!utm("source") && !utm("campaign") && !clickId) return;

  const value = {
    source: utm("source") ?? clickId?.source,
    medium: utm("medium") ?? clickId?.medium,
    campaign: utm("campaign"),
    term: utm("term"),
    content: utm("content"),
    gclid: clickId && consent.ads ? params.get(clickId.param) ?? undefined : undefined,
    landingPage: window.location.pathname,
  };
  try {
    document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${
      ATTRIBUTION_MAX_AGE_DAYS * 86400
    }; SameSite=Lax`;
  } catch {}
}

/**
 * One listener for the whole site, mounted once in the root layout:
 * - Clicks on anything with `data-cta` send `oaan_cta_click` (which button,
 *   its text, and where it goes; the page is GA4's own page_location).
 * - Provider searches (forms with `data-search-origin`) send
 *   `oaan_provider_search` with where the search started.
 * Tagging a new button or form is just adding the data attribute.
 */
export function AnalyticsListener() {
  useEffect(() => {
    captureAttribution();

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-cta]");
      if (!(el instanceof HTMLElement)) return;
      // Provider cards: the practice name, not the card's run-together badge
      // text, and the page link without its long "back to search" parameter.
      const provider = el.dataset.ctaProvider;
      pushDataLayer("oaan_cta_click", {
        cta_id: el.dataset.cta,
        cta_text: (provider ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 100),
        link_url: el.getAttribute("href")?.split("?back=")[0],
        provider_name: provider,
      });
    };

    const onSubmit = (e: SubmitEvent) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement) || !form.dataset.searchOrigin) return;
      const data = new FormData(form);
      pushDataLayer("oaan_provider_search", {
        search_origin: form.dataset.searchOrigin,
        search_zip: String(data.get("zip") ?? ""),
        search_radius: data.get("radius") ? String(data.get("radius")) : undefined,
      });
    };

    // Capture phase, so the event is recorded before any navigation starts.
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}
