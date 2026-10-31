import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGoogleReviews } from "@/lib/googleReviews";
import { getYelpBusiness } from "@/lib/yelpReviews";
import { refreshSiteCache } from "@/lib/cache";

/**
 * Refreshes cached review data (Section 4/6) for every Featured provider
 * with reviews on. Both APIs are billed per call (Google always; Yelp once
 * YELP_API_KEY is eventually set), so this runs once a week (Mondays,
 * vercel.json) rather than live per-request. Each run refreshes practices
 * whose reviews are at least six days old or were never fetched, so every
 * practice comes up each week: once a week per practice keeps Google calls
 * down (2026-10-09). It ran daily, a few practices at a time, until
 * 2026-10-31, but each run clears the page cache (src/lib/cache.ts), and
 * daily clears kept the database awake. A newly added Place ID now waits
 * for the next Monday, unless the refresh is run by hand. Oldest first, at
 * most REFRESH_LIMIT per run (51 practices on 2026-10-30) — PatientReviews reads straight
 * off the cached columns this writes. The Yelp branch is a no-op today
 * (getYelpBusiness returns empty without a key) — it exists so turning that
 * on later is just setting the env var, not new code. Same shared-secret
 * auth pattern as /api/sync and /api/leads/process-pending.
 */
// Six, not seven: last week's run finished a few seconds after this week's
// cutoff, so a seven day cutoff would skip every practice every other week.
const REFRESH_INTERVAL_DAYS = 6;
// Why 190 (owner, 2026-10-30): it's set by Google's free allowance, not by
// anything technical. Our Place Details call (legacy, with reviews and
// rating) is billed as Places Details (5,000 free calls a month) plus
// Atmosphere Data (1,000 free a month, then $5 per 1,000), so 1,000 calls a
// month is the real limit. One call per practice per Monday run, and a month
// can have five Mondays: 5 x 190 = 950, leaving about 50 calls for refreshes
// run by hand. Past 190 practices with reviews on, the oldest 190 refresh
// each week and the rest wait a week, and it's time to revisit this (or
// accept a few dollars a month). Pricing and the $300 promo credit (expires
// 2026-12-15) are in docs/accounts.md. Was 60 until 2026-10-30, a leftover
// from when the job ran daily.
const REFRESH_LIMIT = 190;
// Google calls made at once. One at a time, 190 calls could run past the
// 60 second limit below; ten at a time finishes in seconds.
const CONCURRENCY = 10;

export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staleBefore = new Date(Date.now() - REFRESH_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
  const providers = await db.provider.findMany({
    where: {
      tier: "FEATURED",
      showReviews: true,
      AND: [
        { OR: [{ googlePlaceId: { not: null } }, { yelpBusinessId: { not: null } }] },
        { OR: [{ googleReviewsFetchedAt: null }, { googleReviewsFetchedAt: { lt: staleBefore } }] },
      ],
    },
    orderBy: { googleReviewsFetchedAt: { sort: "asc", nulls: "first" } },
    take: REFRESH_LIMIT,
    select: { id: true, googlePlaceId: true, yelpBusinessId: true },
  });

  let refreshed = 0;
  const errors: string[] = [];

  async function refreshOne(provider: (typeof providers)[number]) {
    try {
      const updates: Record<string, unknown> = {};

      if (provider.googlePlaceId) {
        const { reviews, aggregateRating, aggregateCount } = await getGoogleReviews(provider.googlePlaceId);
        updates.googleReviewsJson = reviews;
        updates.googleRating = aggregateRating;
        updates.googleReviewCount = aggregateCount;
        updates.googleReviewsFetchedAt = new Date();
      }

      if (provider.yelpBusinessId) {
        const { rating, reviewCount } = await getYelpBusiness(provider.yelpBusinessId);
        if (rating != null) {
          updates.yelpRating = rating;
          updates.yelpReviewCount = reviewCount;
          updates.yelpReviewsFetchedAt = new Date();
        }
      }

      if (Object.keys(updates).length > 0) {
        await db.provider.update({ where: { id: provider.id }, data: updates });
        refreshed++;
      }
    } catch (err) {
      errors.push(`${provider.id}: ${(err as Error).message}`);
    }
  }

  for (let i = 0; i < providers.length; i += CONCURRENCY) {
    await Promise.all(providers.slice(i, i + CONCURRENCY).map(refreshOne));
  }

  // Practice pages read cached data (src/lib/cache.ts); show the new reviews.
  if (refreshed > 0) refreshSiteCache();
  return NextResponse.json({ refreshed, total: providers.length, errors });
}

export async function POST(request: Request) {
  return GET(request);
}
