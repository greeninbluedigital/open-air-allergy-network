// Practice badges state facts about the practice, the same on every page
// and at every listing level, never a business relationship with OAAN
// (neutral consumer information site since 2026-10-09). Colors match the
// map pins (ProviderMap's PIN_STYLES):
// - verified: light green, "ILIT Confirmed" (OAAN confirmed it offers ILIT)
// - academic: blue, academic medical centers (blue pin)
// - geo: rose, "Sees Out-of-Area Patients" (badge only)
// - consult: amber, remote consults (badge only)
// contrib/house are article tag colors, unrelated to practices.
const VARIANTS = {
  verified: "bg-badge-verified-bg text-badge-verified-text",
  academic: "bg-badge-academic-bg text-badge-academic-text",
  geo: "bg-badge-geo-bg text-badge-geo-text",
  consult: "bg-badge-consult-bg text-badge-consult-text",
  contrib: "bg-badge-contrib-bg text-badge-contrib-text",
  house: "bg-badge-house-bg text-badge-house-text",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

/** The full class list, also used for badges built as HTML strings (map popups). */
export function badgeClass(variant: BadgeVariant): string {
  return `inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${VARIANTS[variant]}`;
}

/** A practice's fact badges, in order. Pages add their own consult badges
 * after these (cards say "Remote Consults", provider pages say which kind). */
export function practiceBadges(p: {
  academic: boolean;
  geoExtension: boolean;
  verificationDate: Date | null;
}): { variant: BadgeVariant; label: string }[] {
  return [
    ...(p.verificationDate ? [{ variant: "verified" as const, label: "ILIT Confirmed" }] : []),
    ...(p.academic ? [{ variant: "academic" as const, label: "Academic" }] : []),
    ...(p.geoExtension ? [{ variant: "geo" as const, label: "Sees Out-of-Area Patients" }] : []),
  ];
}

/** Search result cards and map popups: the fact badges plus remote consults. */
export function cardBadges(p: {
  academic: boolean;
  geoExtension: boolean;
  verificationDate: Date | null;
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
