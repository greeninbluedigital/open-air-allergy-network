import Link from "next/link";
import Image from "next/image";
import { Badge, cardBadges } from "@/components/Badge";
import type { SrpProvider } from "@/lib/srp";
import { ViewableImpression, type ImpressionType } from "@/components/analytics/ViewableImpression";

/** Card clicks (oaan_cta_click) are named after the list the card sat in. */
const CARD_CTA: Record<ImpressionType, string> = {
  HOMEPAGE_IMPRESSION: "provider_card_homepage",
  SRP_IMPRESSION: "provider_card_search",
  PDP_NEARBY_IMPRESSION: "provider_card_nearby",
};

export function ProviderCard({
  provider,
  backHref,
  impressionType,
}: {
  provider: SrpProvider;
  /** Preserves zip/radius/view so the PDP's back button can reconstruct this exact search. */
  backHref: string;
  /** Records a viewable impression for this card (see docs/analytics.md). */
  impressionType: ImpressionType;
}) {
  // Every listing gets the same card: no tier styling on a neutral site.
  const badges = cardBadges(provider);

  return (
    <ViewableImpression type={impressionType} providerId={provider.id}>
      <Link
        href={`/find-an-ilit-provider/${provider.slug}?back=${encodeURIComponent(backHref)}`}
        data-cta={CARD_CTA[impressionType]}
        // Links the card to its map pin on the search page (ProviderMap).
        data-map-id={provider.id}
        data-cta-provider={provider.practiceName}
        className="flex gap-3 rounded border border-line bg-white p-3.5 transition-colors hover:border-muted hover:shadow-sm"
      >
        {provider.srpPhotoUrl && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-bg-alt">
            <Image src={provider.srpPhotoUrl} alt="" fill sizes="64px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {badges.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Badge key={b.label} variant={b.variant}>
                  {b.label}
                </Badge>
              ))}
            </div>
          )}
          <div className="truncate text-sm font-bold">{provider.practiceName}</div>
          <div className="truncate text-xs text-muted">
            {provider.city}, {provider.state}
          </div>
        </div>
        <div className="shrink-0 text-xs whitespace-nowrap text-muted">
          {provider.distanceMiles.toFixed(1)} mi
        </div>
      </Link>
    </ViewableImpression>
  );
}
