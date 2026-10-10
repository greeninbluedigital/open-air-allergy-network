"use client";

import { Analytics } from "@vercel/analytics/next";
import { isInternalDevice } from "@/lib/internalTraffic";

/**
 * Vercel Web Analytics: cookieless page view counts for every visitor
 * (no consent banner involved), in the Vercel dashboard's Analytics tab.
 * The package records nothing in development. Devices the owner flagged as
 * internal are dropped before sending (src/lib/internalTraffic.ts).
 */
export function VercelAnalytics() {
  return <Analytics beforeSend={(event) => (isInternalDevice() ? null : event)} />;
}
