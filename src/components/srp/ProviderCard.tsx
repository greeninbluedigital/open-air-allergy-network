import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/Badge";
import type { SrpProvider } from "@/lib/srp";

const TIER_LABEL: Record<SrpProvider["tier"], string | null> = {
  FEATURED: "Featured",
  FULL_PROFILE: "Full Profile",
  VERIFIED: null,
  FREE_CLAIMED: null,
};

export function ProviderCard({
  provider,
  backHref,
}: {
  provider: SrpProvider;
  /** Preserves zip/radius/view so the PDP's back button can reconstruct this exact search. */
  backHref: string;
}) {
  const isFree = provider.tier === "FREE_CLAIMED";
  const tierTag = TIER_LABEL[provider.tier];

  return (
    <Link
      href={`/find-a-provider/${provider.slug}?back=${encodeURIComponent(backHref)}`}
      className={`flex gap-3 rounded border p-3.5 ${
        isFree ? "border-dashed border-line bg-bg-alt" : "border-line bg-white"
      }`}
    >
      {!isFree && provider.srpPhotoUrl && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-bg-alt">
          <Image src={provider.srpPhotoUrl} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {provider.foundingMember && <Badge variant="founder">Founding Member</Badge>}
          {provider.tier !== "FREE_CLAIMED" && <Badge variant="verified">Verified</Badge>}
          {provider.geoExtension && <Badge variant="geo">Sees Out-of-Area Patients</Badge>}
          {(provider.offersVideoConsult || provider.offersPhoneConsult) && (
            <Badge variant="consult">Remote Consults</Badge>
          )}
        </div>
        <div className="truncate text-sm font-bold">
          {provider.practiceName}
          {tierTag && (
            <span className="ml-1.5 text-[10px] font-normal text-muted uppercase">
              {tierTag}
            </span>
          )}
        </div>
        <div className="truncate text-xs text-muted">
          {provider.city}, {provider.state}
        </div>
      </div>
      <div className="shrink-0 text-xs whitespace-nowrap text-muted">
        {provider.distanceMiles.toFixed(1)} mi
      </div>
    </Link>
  );
}
