const VARIANTS = {
  verified: "bg-badge-verified-bg text-badge-verified-text",
  founder: "bg-badge-founder-bg text-badge-founder-text",
  geo: "bg-badge-geo-bg text-badge-geo-text",
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
