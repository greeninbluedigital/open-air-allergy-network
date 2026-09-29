"use client";

import { useEffect } from "react";

type ImpressionType = "HOMEPAGE_IMPRESSION" | "SRP_IMPRESSION" | "PDP_NEARBY_IMPRESSION";

// A given list (type + URL + practices) counts once while the visitor moves
// around the site: clicking back to the homepage doesn't re-count it (a full
// reload does). Keeps numbers closer to "people who saw it" than "page
// loads", and absorbs React dev Strict Mode's double effect run.
const sent = new Set<string>();

/**
 * Records one impression per listed practice when a list of providers is
 * shown (homepage featured section, SRP results, Freemium PDP "near"
 * section). Runs in the browser, so crawlers that don't execute JS aren't
 * counted, and automated browsers that identify themselves are skipped.
 */
export function ImpressionTracker({ type, providerIds }: { type: ImpressionType; providerIds: string[] }) {
  useEffect(() => {
    if (providerIds.length === 0 || navigator.webdriver) return;
    const path = window.location.pathname + window.location.search;
    const key = `${type}|${path}|${providerIds.join(",")}`;
    if (sent.has(key)) return;
    sent.add(key);

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, providerIds, path }),
      keepalive: true,
    }).catch(() => {});
  }, [type, providerIds]);

  return null;
}
