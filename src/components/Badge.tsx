// Practice badges state facts about the practice, the same on every page
// and at every listing level, never a business relationship with OAAN
// (neutral consumer information site since 2026-10-09). Colors match the
// map pins (ProviderMap's PIN_STYLES):
// - verified: light green, "ILIT Confirmed" (OAAN confirmed it offers ILIT)
// - academic: blue, academic medical centers (blue pin)
// - geo: rose, "Sees Out-of-Area Patients" (badge only)
// - consult: amber, remote consults (badge only)
// - message: solid red, the practice's own custom message, Featured and trial
//   practices only (turned back on 2026-10-19 as an option for practices
//   that work with OAAN; it's their message, not an OAAN claim)
// contrib/house are article tag colors, unrelated to practices.
import type { Tier } from "@/generated/prisma/client";

const VARIANTS = {
  verified: "bg-badge-verified-bg text-badge-verified-text",
  academic: "bg-badge-academic-bg text-badge-academic-text",
  geo: "bg-badge-geo-bg text-badge-geo-text",
  consult: "bg-badge-consult-bg text-badge-consult-text",
  message: "bg-badge-message text-white",
  contrib: "bg-badge-contrib-bg text-badge-contrib-text",
  house: "bg-badge-house-bg text-badge-house-text",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

/** The full class list, also used for badges built as HTML strings (map popups). */
export function badgeClass(variant: BadgeVariant): string {
  return `inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${VARIANTS[variant]}`;
}

/** Geo-Extension alone only widens search reach to 600mi (every trial has
 * it). Saying the practice sees out-of-area patients is a claim about the
 * practice, so it also needs Travel Notes (sheet column Q), written from what
 * the practice's own site says (2026-10-10). */
export function seesOutOfArea(p: { geoExtension: boolean; travelNotes: string | null }): boolean {
  return p.geoExtension && !!p.travelNotes?.trim();
}

/** The practice's custom message (sheet column Z): Featured only, which
 * includes every active trial, since the sync stores trials as Featured. */
export function customMessageText(p: { tier: Tier; customMessage: string | null }): string | null {
  return p.tier === "FEATURED" && p.customMessage?.trim() ? p.customMessage.trim() : null;
}

/** A practice's badges, in order: the fact badges, then its custom message.
 * Pages add their own consult badges after these (cards say "Remote
 * Consults", provider pages say which kind). */
export function practiceBadges(p: {
  academic: boolean;
  geoExtension: boolean;
  travelNotes: string | null;
  verificationDate: Date | null;
  tier: Tier;
  customMessage: string | null;
}): { variant: BadgeVariant; label: string }[] {
  const message = customMessageText(p);
  return [
    ...(p.verificationDate ? [{ variant: "verified" as const, label: "ILIT Confirmed" }] : []),
    ...(p.academic ? [{ variant: "academic" as const, label: "Academic" }] : []),
    ...(seesOutOfArea(p) ? [{ variant: "geo" as const, label: "Sees Out-of-Area Patients" }] : []),
    ...(message ? [{ variant: "message" as const, label: message }] : []),
  ];
}

/** Search result cards and map popups: the fact badges plus remote consults. */
export function cardBadges(p: {
  academic: boolean;
  geoExtension: boolean;
  travelNotes: string | null;
  verificationDate: Date | null;
  tier: Tier;
  customMessage: string | null;
  pdpRemoteConsultBadge: boolean;
}): { variant: BadgeVariant; label: string }[] {
  return [
    ...practiceBadges(p),
    ...(p.pdpRemoteConsultBadge ? [{ variant: "consult" as const, label: "Remote Consults" }] : []),
  ];
}

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: React.ReactNode;
}) {
  return <span className={badgeClass(variant)}>{children}</span>;
}
