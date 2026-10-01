// Practice badges follow the same tier system as the map pins (see
// ProviderMap's pinStyle), so a card's badge matches its pin:
// - featured: solid green, Full Profile and Featured practices
// - verified: light green, Verified practices
// - academic: navy, academic medical centers (navy pin with a diamond;
//   wins over Founding Member on the map)
// - founder: violet, Founding Members (the pin is violet with a star)
// - geo: cyan, "Sees Out-of-Area Patients" (badge only, no pin color)
// - consult: amber, remote consult badges (badge only)
// contrib/house are article tag colors, unrelated to practices.
const VARIANTS = {
  featured: "bg-action text-white",
  verified: "bg-badge-verified-bg text-badge-verified-text",
  academic: "bg-badge-academic-bg text-badge-academic-text",
  founder: "bg-badge-founder-bg text-badge-founder-text",
  geo: "bg-badge-geo-bg text-badge-geo-text",
  consult: "bg-badge-consult-bg text-badge-consult-text",
  contrib: "bg-badge-contrib-bg text-badge-contrib-text",
  house: "bg-badge-house-bg text-badge-house-text",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
