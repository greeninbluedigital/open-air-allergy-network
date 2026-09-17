import type { GoogleReview } from "@/lib/googleReviews";
import type { Prisma } from "@/generated/prisma/client";

type ReviewsProvider = {
  tier: "FREE_CLAIMED" | "VERIFIED" | "FULL_PROFILE" | "FEATURED";
  showReviews: boolean;
  googlePlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleReviewsJson: Prisma.JsonValue | null;
  yelpEmbedCode1: string | null;
  yelpEmbedCode2: string | null;
  yelpEmbedCode3: string | null;
  yelpRatingBadgeEmbed: string | null;
  yelpRating: number | null;
  yelpReviewCount: number | null;
};

function stars(rating: number) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/**
 * Sync, DB-free gate check so a caller (the SEM landing page specifically)
 * can decide whether to render its own wrapping section — <PatientReviews>
 * itself does the same check internally and returns null, but a caller that
 * wraps it in a bordered/padded section div needs to know *before*
 * rendering, or it ends up with an empty styled block when reviews are off.
 */
export function reviewsWouldShow(provider: ReviewsProvider): boolean {
  if (provider.tier !== "FEATURED" || !provider.showReviews) return false;
  const hasYelp = Boolean(
    provider.yelpEmbedCode1 ||
      provider.yelpEmbedCode2 ||
      provider.yelpEmbedCode3 ||
      provider.yelpRatingBadgeEmbed ||
      provider.yelpRating != null,
  );
  return hasYelp || Boolean(provider.googlePlaceId);
}

/**
 * aggregateRating schema (Section 6) — prefers Google's cached aggregate
 * when available, falls back to the manually-entered Yelp figures. Reads
 * straight off the provider row (populated by the daily /api/reviews/refresh
 * cron), no live API call at request time.
 */
export function getAggregateRatingSchema(provider: ReviewsProvider) {
  if (provider.tier !== "FEATURED" || !provider.showReviews) return null;

  if (provider.googleRating != null) {
    return {
      "@type": "AggregateRating",
      ratingValue: provider.googleRating,
      reviewCount: provider.googleReviewCount ?? undefined,
    };
  }

  if (provider.yelpRating != null) {
    return {
      "@type": "AggregateRating",
      ratingValue: provider.yelpRating,
      reviewCount: provider.yelpReviewCount ?? undefined,
    };
  }

  return null;
}

/**
 * Patient Reviews module — Featured tier only, shared verbatim between the
 * PDP and the SEM landing page (Section 3). Capped at 3 reviews per
 * platform, independently (up to 6 total). Google excerpts come from
 * googleReviewsJson, refreshed daily by /api/reviews/refresh rather than
 * fetched live per-request (Place Details is billed per call). Yelp
 * excerpts are pre-formatted embed HTML a practice/admin pastes in via the
 * Sheet — that embed code is trusted admin-entered content (same trust
 * boundary as photoUrl/extendedBio), not end-user input, which is why
 * rendering it as-is is safe here.
 */
export function PatientReviews({ provider }: { provider: ReviewsProvider }) {
  if (provider.tier !== "FEATURED" || !provider.showReviews) return null;

  const yelpEmbeds = [provider.yelpEmbedCode1, provider.yelpEmbedCode2, provider.yelpEmbedCode3].filter(
    (c): c is string => Boolean(c),
  );
  const hasYelp = yelpEmbeds.length > 0 || Boolean(provider.yelpRatingBadgeEmbed) || provider.yelpRating != null;
  const hasGoogle = Boolean(provider.googlePlaceId);

  if (!hasYelp && !hasGoogle) return null;

  const googleReviews = (provider.googleReviewsJson as GoogleReview[] | null) ?? [];

  return (
    <div>
      <h3 className="mb-2 text-base font-bold">Patient Reviews</h3>

      {hasGoogle && provider.googleRating != null && (
        <div className="mb-2 text-xs text-muted">
          Google: <span className="font-semibold text-foreground">{stars(provider.googleRating)}</span>{" "}
          <span className="font-semibold text-foreground">{provider.googleRating.toFixed(1)}</span> (
          {provider.googleReviewCount ?? 0} reviews)
        </div>
      )}

      {provider.yelpRating != null ? (
        // API-sourced (Section 4 future state) — takes priority over the
        // badge embed below once yelpBusinessId + YELP_API_KEY are active.
        <div className="mb-3 text-xs text-muted">
          Yelp: <span className="font-semibold text-foreground">{provider.yelpRating.toFixed(1)}</span> (
          {provider.yelpReviewCount ?? 0} reviews)
        </div>
      ) : (
        provider.yelpRatingBadgeEmbed && (
          // Free Yelp (or third-party) rating-badge widget, trusted
          // admin-entered content — same trust boundary as the review
          // embeds below.
          <div className="mb-3" dangerouslySetInnerHTML={{ __html: provider.yelpRatingBadgeEmbed }} />
        )
      )}

      {googleReviews.map((r, i) => (
        <div key={`g-${i}`} className="mb-2.5 rounded border border-line p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold">{r.authorName}</span>
            <span className="text-xs text-[#e0a11c]">{stars(r.rating)}</span>
          </div>
          <p className="text-xs text-muted">{r.text}</p>
          <div className="mt-1.5 text-[10.5px] text-muted/70">via Google</div>
        </div>
      ))}

      {yelpEmbeds.map((embed, i) => (
        // Trusted admin-entered embed HTML from Yelp's own "Embed Review"
        // feature (same trust boundary as photoUrl/extendedBio), not
        // end-user input — safe to render as-is.
        <div key={`y-${i}`} className="mb-2.5" dangerouslySetInnerHTML={{ __html: embed }} />
      ))}
    </div>
  );
}
