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
type PlaceDetails = {
  reviews?: { author_name: string; author_url?: string; rating: number; text: string }[];
  rating?: number;
  user_ratings_total?: number;
};

async function placeDetails(id: string, apiKey: string, sort: "most_relevant" | "newest"): Promise<PlaceDetails> {
  // Google answers HTTP 200 even for a bad Place ID, with the problem in
  // `status`. Those throw, so /api/reviews/refresh reports the error and
  // leaves the practice unstamped to retry, rather than caching "no
  // reviews" for a week (2026-10-13: 16 IDs pasted with a trailing line
  // break all came back empty that way).
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(id)}&fields=reviews,rating,user_ratings_total&reviews_sort=${sort}&key=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Google Place Details HTTP ${res.status} for ${id}`);

  const data = (await res.json()) as { status?: string; error_message?: string; result?: PlaceDetails };
  if (data.status !== "OK") {
    throw new Error(`Google Place Details ${data.status ?? "no status"} for ${id}${data.error_message ? `: ${data.error_message}` : ""}`);
  }
  return data.result ?? {};
}

/**
 * Every practice shows Google's three "most relevant" reviews. A practice can
 * also name one reviewer in the sheet's Pinned Google Review column, optionally
 * followed by "| words from the review" (owner,
 * 2026-11-11, first for Grand Rapids Allergy's ILIT review): that practice
 * gets a second call for Google's five newest reviews, and the named
 * reviewer's review goes first, followed by the most relevant ones. Google's
 * text is never changed. If the named review isn't in either set of five
 * (newer reviews have pushed it out), the practice falls back to the usual
 * three. Pinning costs one extra call per practice per weekly refresh.
 */
export async function getGoogleReviews(placeId: string, pinnedAuthor?: string | null): Promise<GooglePlaceReviews> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY is not set — skipping live Google reviews.");
    return EMPTY;
  }

  const id = placeId.trim();
  const relevant = await placeDetails(id, apiKey, "most_relevant");
  let list = relevant.reviews ?? [];

  // Three forms: the reviewer's Google profile link (".../maps/contrib/<id>",
  // unique to that person), "Name", or "Name | words from the review". The
  // phrase tells apart two reviewers with the same name; a bare name that
  // matches more than one review pins nothing rather than guessing.
  const pinValue = (pinnedAuthor ?? "").trim();
  const contribId = pinValue.match(/\/contrib\/(\d+)/)?.[1];
  const [pinName, pinPhrase] = contribId ? [] : pinValue.split("|").map((s) => s.trim().toLowerCase());
  if (contribId || pinName) {
    const newest = (await placeDetails(id, apiKey, "newest")).reviews ?? [];
    const same = (a: { author_name: string; text: string }, b: { author_name: string; text: string }) =>
      a.author_name === b.author_name && a.text === b.text;
    const candidates = [...list, ...newest]
      .filter((r, i, all) => all.findIndex((o) => same(o, r)) === i)
      .filter((r) =>
        contribId
          ? (r.author_url ?? "").includes(`/contrib/${contribId}/`)
          : r.author_name.trim().toLowerCase() === pinName && (!pinPhrase || r.text.toLowerCase().includes(pinPhrase)),
      );
    if (candidates.length === 1) {
      const pinned = candidates[0];
      list = [pinned, ...list.filter((r) => !same(r, pinned))];
    }
  }

  return {
    reviews: list.slice(0, 3).map((r) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
    })),
    aggregateRating: relevant.rating ?? null,
    aggregateCount: relevant.user_ratings_total ?? null,
  };
}
