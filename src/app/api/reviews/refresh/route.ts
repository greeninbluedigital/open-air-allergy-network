import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGoogleReviews } from "@/lib/googleReviews";

/**
 * Refreshes cached Google review data (Section 4/6) for every Featured
 * provider with reviews on and a Place ID set. Place Details is billed per
 * call, so this runs once a day rather than live per-request — PatientReviews
 * and getAggregateRatingSchema read straight off the cached columns this
 * writes. Same shared-secret auth pattern as /api/sync and
 * /api/leads/process-pending.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = await db.provider.findMany({
    where: { tier: "FEATURED", showReviews: true, googlePlaceId: { not: null } },
    select: { id: true, googlePlaceId: true },
  });

  let refreshed = 0;
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const { reviews, aggregateRating, aggregateCount } = await getGoogleReviews(provider.googlePlaceId!);
      await db.provider.update({
        where: { id: provider.id },
        data: {
          googleReviewsJson: reviews,
          googleRating: aggregateRating,
          googleReviewCount: aggregateCount,
          googleReviewsFetchedAt: new Date(),
        },
      });
      refreshed++;
    } catch (err) {
      errors.push(`${provider.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ refreshed, total: providers.length, errors });
}

export async function POST(request: Request) {
  return GET(request);
}
