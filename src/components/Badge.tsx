// Practice badges follow the same tier system as the map pins (see
// ProviderMap's pinStyle), so a card's badge matches its pin:
// - featured: solid green, Full Profile and Featured practices
// - verified: light green, Verified practices
// - founder: amber, Founding Members
// - info: neutral outline for plain facts (remote consults, out-of-area
//   patients), so they don't compete with the tier colors
// contrib/house are article tag colors, unrelated to practices.
const VARIANTS = {
  featured: "bg-action text-white",
  verified: "bg-badge-verified-bg text-badge-verified-text",
  founder: "bg-badge-founder-bg text-badge-founder-text",
  info: "bg-white text-foreground/70 ring-1 ring-line ring-inset",
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
