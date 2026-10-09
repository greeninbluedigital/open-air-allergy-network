import type { Tier } from "@/generated/prisma/client";

/** Verified and up: paying listings. Freemium shows no badges anywhere. */
export function isVerifiedPlus(tier: Tier): boolean {
  return tier !== "FREE_CLAIMED";
}

/** The patient contact form: Verified and up, and only when the practice has
 * a Notification Email to receive the messages (some, e.g. large health
 * systems, never give one). Without it the page keeps phone and website
 * links only, so no patient message is collected that can't be delivered.
 * Never on a free trial: those get the email button instead. */
export function showsContactForm(p: { tier: Tier; trial: boolean; notificationEmail: string | null }): boolean {
  return isVerifiedPlus(p.tier) && !p.trial && !!p.notificationEmail?.trim();
}

/** "Email this practice": on free trials, in place of the contact form. It
 * opens the visitor's own email app, so OAAN never collects or forwards the
 * message, which keeps the site clear of state consumer health data laws
 * (owner's decision, 2026-10-09). The form code stays for paid listings. */
export function showsEmailButton(p: { trial: boolean; notificationEmail: string | null }): boolean {
  return p.trial && !!p.notificationEmail?.trim();
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
