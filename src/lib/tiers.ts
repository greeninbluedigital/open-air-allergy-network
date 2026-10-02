import type { Tier } from "@/generated/prisma/client";

/** Verified and up: paying listings. Freemium shows no badges anywhere. */
export function isVerifiedPlus(tier: Tier): boolean {
  return tier !== "FREE_CLAIMED";
}

/** Full Profile and Featured. Founding Member is only ever shown at this level. */
export function isFullProfilePlus(tier: Tier): boolean {
  return tier === "FULL_PROFILE" || tier === "FEATURED";
}

/** The practice-written special offer badge: Featured only. */
export function specialOfferText(p: { tier: Tier; specialOffer: string | null }): string | null {
  return p.tier === "FEATURED" && p.specialOffer ? p.specialOffer : null;
}

/** Academic badge and pin: any paid tier (Freemium shows no badges). */
export function showsAcademic(p: { tier: Tier; academic: boolean }): boolean {
  return p.academic && isVerifiedPlus(p.tier);
}

/** FAQs, treatments and hours: Full Profile+, or the Academic package (an
 * Academic practice at the Verified tier). See docs/tiers-and-pricing.md. */
export function showsPracticeDetails(p: { tier: Tier; academic: boolean }): boolean {
  return isFullProfilePlus(p.tier) || showsAcademic(p);
}
