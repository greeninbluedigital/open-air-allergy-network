import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGoogleReviews } from "@/lib/googleReviews";
import { getYelpBusiness } from "@/lib/yelpReviews";

/**
 * Refreshes cached review data (Section 4/6) for every Featured provider
 * with reviews on. Both APIs are billed per call (Google always; Yelp once
 * YELP_API_KEY is eventually set), so this runs once a day rather than live
 * per-request, and each run only refreshes practices whose reviews are more
 * than a week old or were never fetched (2026-10-09: weekly per practice to
 * keep Google calls down as every practice goes on a trial, while a newly
 * added Place ID still shows reviews the next morning), oldest first, at
 * most REFRESH_LIMIT per run — PatientReviews and getAggregateRatingSchema read straight
 * off the cached columns this writes. The Yelp branch is a no-op today
 * (getYelpBusiness returns empty without a key) — it exists so turning that
 * on later is just setting the env var, not new code. Same shared-secret
 * auth pattern as /api/sync and /api/leads/process-pending.
 */
const REFRESH_INTERVAL_DAYS = 7;
const REFRESH_LIMIT = 60;

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

  for (const provider of providers) {
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

  return NextResponse.json({ refreshed, total: providers.length, errors });
}

export async function POST(request: Request) {
  return GET(request);
}
