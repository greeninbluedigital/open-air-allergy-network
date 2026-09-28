import type { Tier } from "@/generated/prisma/client";

/** Verified and up: paying listings. Freemium shows no badges anywhere. */
export function isVerifiedPlus(tier: Tier): boolean {
  return tier !== "FREE_CLAIMED";
}

/** Full Profile and Featured. Founding Member is only ever shown at this level. */
export function isFullProfilePlus(tier: Tier): boolean {
  return tier === "FULL_PROFILE" || tier === "FEATURED";
}
