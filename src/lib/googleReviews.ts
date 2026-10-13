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
 * GOOGLE_PLACES_API_KEY: without it this returns an empty result (logged,
 * not thrown). API errors do throw; the only caller is the refresh cron,
 * which catches them per practice.
 */
export async function getGoogleReviews(placeId: string): Promise<GooglePlaceReviews> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY is not set — skipping live Google reviews.");
    return EMPTY;
  }

  // Google answers HTTP 200 even for a bad Place ID, with the problem in
  // `status`. Those throw, so /api/reviews/refresh reports the error and
  // leaves the practice unstamped to retry, rather than caching "no
  // reviews" for a week (2026-10-13: 16 IDs pasted with a trailing line
  // break all came back empty that way).
  const id = placeId.trim();
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(id)}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Google Place Details HTTP ${res.status} for ${id}`);

  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    result?: {
      reviews?: { author_name: string; rating: number; text: string }[];
      rating?: number;
      user_ratings_total?: number;
    };
  };
  if (data.status !== "OK") {
    throw new Error(`Google Place Details ${data.status ?? "no status"} for ${id}${data.error_message ? `: ${data.error_message}` : ""}`);
  }

  return {
    reviews: (data.result?.reviews ?? []).slice(0, 3).map((r) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
    })),
    aggregateRating: data.result?.rating ?? null,
    aggregateCount: data.result?.user_ratings_total ?? null,
  };
}
