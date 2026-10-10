"use client";

import { useEffect, useRef } from "react";
import { isInternalDevice } from "@/lib/internalTraffic";

export type ImpressionType = "HOMEPAGE_IMPRESSION" | "SRP_IMPRESSION" | "PDP_NEARBY_IMPRESSION";

// Viewable-impression standard (IAB/MRC display): at least half of the card on
// screen for one continuous second. Definitions live in docs/analytics.md.
const VISIBLE_RATIO = 0.5;
const VISIBLE_MS = 1000;
const FLUSH_MS = 2000;

// Module-level, so it spans every card on the page and survives in-site
// navigation: a practice counts once per list (type + URL) until a full reload.
const counted = new Set<string>();
const pending = new Map<string, { type: ImpressionType; path: string; ids: Set<string> }>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let unloadHooked = false;

function flush(useBeacon = false) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  if (isInternalDevice()) {
    pending.clear();
    return;
  }
  for (const { type, path, ids } of pending.values()) {
    const body = JSON.stringify({ type, path, providerIds: [...ids] });
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }
  pending.clear();
}

function record(type: ImpressionType, providerId: string) {
  const path = window.location.pathname + window.location.search;
  const key = `${type}|${path}|${providerId}`;
  if (counted.has(key)) return;
  counted.add(key);

  const batchKey = `${type}|${path}`;
  const batch = pending.get(batchKey) ?? { type, path, ids: new Set<string>() };
  batch.ids.add(providerId);
  pending.set(batchKey, batch);

  if (!unloadHooked) {
    unloadHooked = true;
    // Send whatever's queued if the visitor leaves before the next flush.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true);
    });
  }
  if (!flushTimer) flushTimer = setTimeout(() => flush(), FLUSH_MS);
}

/**
 * Wraps one provider card and records a viewable impression for it. Runs in
 * the browser only, so crawlers that don't execute JS aren't counted, and
 * self-identified automated browsers are skipped.
 */
export function ViewableImpression({
  type,
  providerId,
  children,
}: {
  type: ImpressionType;
  providerId: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || navigator.webdriver || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= VISIBLE_RATIO) {
          timer ??= setTimeout(() => {
            record(type, providerId);
            observer.disconnect();
          }, VISIBLE_MS);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, VISIBLE_RATIO] },
    );
    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [type, providerId]);

  return <div ref={ref}>{children}</div>;
}
