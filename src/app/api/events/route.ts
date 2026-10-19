import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { AnalyticsEventType } from "@/generated/prisma/client";

const SINGLE_TYPES = new Set<AnalyticsEventType>(["PAGE_VIEW", "PHONE_CLICK", "WEBSITE_CLICK", "ADDRESS_CLICK", "EMAIL_CLICK", "PROFILE_CLICK"]);
const IMPRESSION_TYPES = new Set<AnalyticsEventType>(["HOMEPAGE_IMPRESSION", "SRP_IMPRESSION", "PDP_NEARBY_IMPRESSION"]);
const MAX_IMPRESSIONS = 50;

// Crawlers and tools that announce themselves in their user agent. Googlebot
// runs page JavaScript while rendering, so without this its renders logged
// page views and impressions against practices (Search Console showed it
// loading /api/events, 2026-10-17). Real browsers always send a user agent,
// so a missing one is treated as a bot too.
const BOT_UA =
  /bot[\/\-;+)]|bot\.htm|crawl|spider|slurp|mediapartners|google-inspectiontool|google-read-aloud|lighthouse|pagespeed|headless|phantomjs|facebookexternalhit|embedly|preview|curl|wget|python|java\/|go-http|okhttp|axios|node-fetch|undici|httpclient/i;

function isBot(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  return !ua || BOT_UA.test(ua);
}

/**
 * Internal analytics log (PROJECT_SPEC.md's Analytics section) — public,
 * unauthenticated, fire-and-forget from src/lib/track.ts. Always responds
 * 204 regardless of outcome; a malformed or spoofed request from a visitor
 * shouldn't ever surface as a page-breaking error, and there's nothing
 * sensitive being written that a bad row would put at risk.
 *
 * Page views and click events send one `providerId`; impression types send a batch
 * of `providerIds` (every practice shown in one list), filtered to real
 * providers so one bad id can't sink the whole batch.
 */
export async function POST(request: Request) {
  // Only the live site counts. Local dev and preview deployments share the
  // production database, so their test visits would otherwise land in the
  // per-practice numbers (same rule as GTM in src/app/layout.tsx).
  if (process.env.VERCEL_ENV !== "production" || isBot(request)) {
    return new NextResponse(null, { status: 204 });
  }
  try {
    const body = (await request.json()) as {
      type?: AnalyticsEventType;
      providerId?: string;
      providerIds?: unknown;
      path?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
    };
    if (!body.type || !body.path) return new NextResponse(null, { status: 204 });

    const common = {
      type: body.type,
      path: body.path.slice(0, 500),
      utmSource: body.utmSource?.slice(0, 200) || null,
      utmMedium: body.utmMedium?.slice(0, 200) || null,
      utmCampaign: body.utmCampaign?.slice(0, 200) || null,
    };

    if (SINGLE_TYPES.has(body.type) && body.providerId) {
      await db.analyticsEvent.create({ data: { ...common, providerId: body.providerId } });
    } else if (IMPRESSION_TYPES.has(body.type) && Array.isArray(body.providerIds)) {
      const requested = [...new Set(body.providerIds.filter((id): id is string => typeof id === "string"))].slice(
        0,
        MAX_IMPRESSIONS,
      );
      const real = await db.provider.findMany({ where: { id: { in: requested } }, select: { id: true } });
      await db.analyticsEvent.createMany({ data: real.map(({ id }) => ({ ...common, providerId: id })) });
    }
  } catch (err) {
    // Never surfaced to the visitor (see doc comment above), but logged so a
    // broken write shows up in server logs instead of vanishing.
    console.error("[api/events] failed to record event:", err);
  }

  return new NextResponse(null, { status: 204 });
}
