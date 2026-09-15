export type GoogleReview = {
  authorName: string;
  rating: number;
  text: string;
};

export type GooglePlaceReviews = {
  reviews: GoogleReview[];
  aggregateRating: number | null;
  aggregateCount: number | null;
};

const EMPTY: GooglePlaceReviews = { reviews: [], aggregateRating: null, aggregateCount: null };

/**
 * Live Google review excerpts + aggregate rating (Section 4/6) — one Place
 * Details API call covers both the review objects and the aggregate
 * rating/count needed for aggregateRating schema, so this is "use more of
 * the existing response," not two integrations. Needs
 * GOOGLE_PLACES_API_KEY, which isn't configured yet — returns an empty
 * result gracefully (logged, not thrown) rather than breaking the page
 * until that's set up.
 */
export async function getGoogleReviews(placeId: string): Promise<GooglePlaceReviews> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY is not set — skipping live Google reviews.");
    return EMPTY;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) {
      console.warn(`Google Place Details request failed (${res.status}) for ${placeId}`);
      return EMPTY;
    }

    const data = (await res.json()) as {
      result?: {
        reviews?: { author_name: string; rating: number; text: string }[];
        rating?: number;
        user_ratings_total?: number;
      };
    };

    return {
      reviews: (data.result?.reviews ?? []).slice(0, 3).map((r) => ({
        authorName: r.author_name,
        rating: r.rating,
        text: r.text,
      })),
      aggregateRating: data.result?.rating ?? null,
      aggregateCount: data.result?.user_ratings_total ?? null,
    };
  } catch (err) {
    console.warn(`Google Place Details fetch error for ${placeId}:`, err);
    return EMPTY;
  }
}
