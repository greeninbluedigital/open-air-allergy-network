"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/track";

/**
 * Fires one PAGE_VIEW per mount for a provider-scoped page (PDP, SEM landing
 * page). Renders nothing. Deliberately not sitewide — see the doc comment on
 * Prisma's AnalyticsEvent model for why general traffic is GA4's job, not
 * this table's.
 */
export function PageViewTracker({
  providerId,
  path,
  utm,
}: {
  providerId: string;
  path: string;
  utm?: { source?: string | null; medium?: string | null; campaign?: string | null };
}) {
  // Dev Strict Mode runs effects twice; the ref survives its remount, so
  // local testing counts one view per load, as production does.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent("PAGE_VIEW", {
      providerId,
      path,
      utmSource: utm?.source,
      utmMedium: utm?.medium,
      utmCampaign: utm?.campaign,
    });
    // Fire once per mount only — not on every prop identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
