export type YelpBusinessInfo = {
  rating: number | null;
  reviewCount: number | null;
};

const EMPTY: YelpBusinessInfo = { rating: null, reviewCount: null };

/**
 * Yelp's Fusion API Business Info endpoint (Section 4/6) — dormant until
 * YELP_API_KEY is set (it's a paid product, not turned on yet at this
 * scale). Returns an empty result gracefully rather than breaking the
 * refresh cron, same pattern as getGoogleReviews. Once a key is added,
 * /api/reviews/refresh starts populating Provider.yelpRating/yelpReviewCount
 * from this automatically — no other code changes needed.
 */
export async function getYelpBusiness(businessId: string): Promise<YelpBusinessInfo> {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    console.warn("YELP_API_KEY is not set — skipping Yelp rating refresh.");
    return EMPTY;
  }

  try {
    const res = await fetch(`https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      console.warn(`Yelp Business Info request failed (${res.status}) for ${businessId}`);
      return EMPTY;
    }

    const data = (await res.json()) as { rating?: number; review_count?: number };
    return {
      rating: data.rating ?? null,
      reviewCount: data.review_count ?? null,
    };
  } catch (err) {
    console.warn(`Yelp Business Info fetch error for ${businessId}:`, err);
    return EMPTY;
  }
}
