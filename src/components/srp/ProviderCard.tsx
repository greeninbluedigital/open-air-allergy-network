import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/Badge";
import type { SrpProvider } from "@/lib/srp";
import { isFullProfilePlus, isVerifiedPlus } from "@/lib/tiers";

export function ProviderCard({
  provider,
  backHref,
}: {
  provider: SrpProvider;
  /** Preserves zip/radius/view so the PDP's back button can reconstruct this exact search. */
  backHref: string;
}) {
  const paid = isVerifiedPlus(provider.tier);
  const premium = isFullProfilePlus(provider.tier);

  return (
    <Link
      href={`/find-an-ilit-provider/${provider.slug}?back=${encodeURIComponent(backHref)}`}
      className={`flex gap-3 rounded border border-line p-3.5 ${paid ? "bg-white" : "bg-bg-alt"}`}
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
            <Badge variant="verified">Verified</Badge>
            {provider.geoExtension && <Badge variant="geo">Sees Out-of-Area Patients</Badge>}
            {provider.pdpRemoteConsultBadge && <Badge variant="consult">Remote Consults</Badge>}
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
  );
}
