import { isFullProfilePlus, isVerifiedPlus, showsAcademic, specialOfferText } from "@/lib/tiers";
import type { Tier } from "@/generated/prisma/client";

// Practice badges follow the same tier system as the map pins (see
// ProviderMap's PIN_STYLES), so a card's badge matches its pin:
// - featured: solid green, Full Profile and Featured practices
// - verified: light green, Verified practices
// - academic: blue, academic medical centers (blue pin; wins over Founding
//   Member on the map)
// - founder: violet, Founding Members (the pin is violet with a star)
// - geo: rose, "Sees Out-of-Area Patients" (badge only, no pin color)
// - consult: amber, remote consult badges (badge only)
// - offer: solid red, the practice's special offer (Featured only)
// contrib/house are article tag colors, unrelated to practices.
const VARIANTS = {
  featured: "bg-action text-white",
  verified: "bg-badge-verified-bg text-badge-verified-text",
  academic: "bg-badge-academic-bg text-badge-academic-text",
  founder: "bg-badge-founder-bg text-badge-founder-text",
  geo: "bg-badge-geo-bg text-badge-geo-text",
  consult: "bg-badge-consult-bg text-badge-consult-text",
  offer: "bg-badge-offer text-white",
  contrib: "bg-badge-contrib-bg text-badge-contrib-text",
  house: "bg-badge-house-bg text-badge-house-text",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

/** The full class list, also used for badges built as HTML strings (map popups). */
export function badgeClass(variant: BadgeVariant): string {
  return `inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${VARIANTS[variant]}`;
}

/** The badges on a practice's search result card and map popup, in order.
 * Freemium practices get none. */
export function cardBadges(p: {
  tier: Tier;
  academic: boolean;
  foundingMember: boolean;
  geoExtension: boolean;
  pdpRemoteConsultBadge: boolean;
  specialOffer: string | null;
}): { variant: BadgeVariant; label: string }[] {
  if (!isVerifiedPlus(p.tier)) return [];
  const premium = isFullProfilePlus(p.tier);
  const offer = specialOfferText(p);
  return [
    ...(showsAcademic(p) ? [{ variant: "academic" as const, label: "Academic" }] : []),
    ...(premium && p.foundingMember ? [{ variant: "founder" as const, label: "Founding Member" }] : []),
    { variant: premium ? ("featured" as const) : ("verified" as const), label: "Verified" },
    ...(offer ? [{ variant: "offer" as const, label: offer }] : []),
    ...(p.geoExtension ? [{ variant: "geo" as const, label: "Sees Out-of-Area Patients" }] : []),
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
