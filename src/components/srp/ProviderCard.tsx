import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/Badge";
import type { SrpProvider } from "@/lib/srp";
import { isFullProfilePlus, isVerifiedPlus } from "@/lib/tiers";
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
  const paid = isVerifiedPlus(provider.tier);
  const premium = isFullProfilePlus(provider.tier);

  return (
    <ViewableImpression type={impressionType} providerId={provider.id}>
      <Link
        href={`/find-an-ilit-provider/${provider.slug}?back=${encodeURIComponent(backHref)}`}
        data-cta={CARD_CTA[impressionType]}
        data-cta-provider={provider.practiceName}
        className={`flex gap-3 rounded border border-line p-3.5 transition-colors hover:border-muted hover:shadow-sm ${paid ? "bg-white" : "bg-bg-alt"}`}
      >
        {premium && provider.srpPhotoUrl && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-bg-alt">
            <Image src={provider.srpPhotoUrl} alt="" fill sizes="64px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {paid && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {premium && provider.foundingMember && <Badge variant="founder">Founding Member</Badge>}
              <Badge variant={premium ? "featured" : "verified"}>Verified</Badge>
              {provider.geoExtension && <Badge variant="info">Sees Out-of-Area Patients</Badge>}
              {provider.pdpRemoteConsultBadge && <Badge variant="info">Remote Consults</Badge>}
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
