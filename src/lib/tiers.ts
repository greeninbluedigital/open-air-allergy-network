import type { Tier } from "@/generated/prisma/client";
import { isHealthDataState } from "@/lib/healthDataStates";

/** Verified and up: paying listings. Freemium shows no badges anywhere. */
export function isVerifiedPlus(tier: Tier): boolean {
  return tier !== "FREE_CLAIMED";
}

export type ContactMode = "form" | "email" | "none";

/**
 * How a patient contacts the practice from its page (Verified and up,
 * free trials included, and only with a Notification Email to send to):
 * - "form": the contact form, which asks first whether the visitor lives in
 *   or is in a consumer health data state (healthDataStates.ts). "Yes"
 *   swaps it for the email button in the browser.
 * - "email": the "Email {practice}" button, which opens the visitor's own
 *   email app so OAAN never collects the message. Used whenever the
 *   practice is in one of those states, or the visitor's IP or searched zip
 *   is (owner's decision, 2026-10-09). The address is shown, so column K
 *   only ever holds an address the practice publishes (docs/practice-emails.md).
 * - "none": phone and website only.
 */
export function contactMode(
  p: { tier: Tier; state: string; notificationEmail: string | null },
  visitorInHealthDataState: boolean,
): ContactMode {
  if (!isVerifiedPlus(p.tier) || !p.notificationEmail?.trim()) return "none";
  return visitorInHealthDataState || isHealthDataState(p.state) ? "email" : "form";
}

/** Full Profile and Featured. Founding Member is only ever shown at this level. */
export function isFullProfilePlus(tier: Tier): boolean {
  return tier === "FULL_PROFILE" || tier === "FEATURED";
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
