import Link from "next/link";
import type { Metadata } from "next";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ProviderCard } from "@/components/srp/ProviderCard";
import { ProviderMap } from "@/components/srp/ProviderMap";
import { lookupZip } from "@/lib/zip";
import { searchProviders, type SrpBucket } from "@/lib/srp";

export const metadata: Metadata = {
  title: "Find a Provider",
};

const RADIUS_VALUES = new Set<number>([20, 30, 40, 50, 75, 100, 150, 200]);

const BUCKET_LABELS: Record<SrpBucket, string> = {
  premium: "Premium (Full Profile · Featured · Founders — distance only)",
  verified: "Verified — distance only",
  // Patient-facing — deliberately not "Free/Claimed" or "Freemium" (internal
  // tier jargon a patient has no reason to parse); this bucket is the same
  // distance-sorted-last group either way.
  free: "Unverified Listings",
};

function buildQuery(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) usp.set(k, v);
  return `?${usp.toString()}`;
}

export default async function FindAProviderPage({
  searchParams,
}: PageProps<"/find-a-provider">) {
  const params = await searchParams;
  const zip = typeof params.zip === "string" ? params.zip : undefined;
  const radiusParam = typeof params.radius === "string" ? parseInt(params.radius, 10) : 50;
  const radius = RADIUS_VALUES.has(radiusParam) ? radiusParam : 50;
  const view = params.view === "list" ? "list" : "map";

  const location = zip ? lookupZip(zip) : null;
  const result = location ? await searchProviders(location.lat, location.lng, radius) : null;
  const backHref = zip
    ? `/find-a-provider${buildQuery({ zip, radius: String(radius), view })}`
    : "/find-a-provider";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-bg-alt px-6 py-4 sm:px-10">
        <div className="flex-1">
          <ZipSearchForm action="/find-a-provider" showRadius defaultRadius={radius} defaultZip={zip ?? ""} />
        </div>
        {zip && (
          <div className="flex overflow-hidden rounded border border-line text-xs">
            <Link
              href={buildQuery({ zip, radius: String(radius), view: "map" })}
              className={`px-3.5 py-2 ${view === "map" ? "bg-foreground text-background" : "bg-white"}`}
            >
              Map
            </Link>
            <Link
              href={buildQuery({ zip, radius: String(radius), view: "list" })}
              className={`px-3.5 py-2 ${view === "list" ? "bg-foreground text-background" : "bg-white"}`}
            >
              List
            </Link>
          </div>
        )}
      </div>

      {!zip && (
        <div className="px-6 py-16 text-center text-muted sm:px-10">
          Enter a zip code above to find ILIT providers near you.
        </div>
      )}

      {zip && !location && (
        <div className="px-6 py-16 text-center sm:px-10">
          <p className="font-semibold">We couldn&apos;t find that zip code.</p>
          <p className="mt-1 text-sm text-muted">Double-check it and try again.</p>
        </div>
      )}

      {location && result && (
        <>
          {result.mode !== "normal" && result.mode !== "none" && (
            <div className="border-b border-line px-6 py-5 sm:px-10">
              <p className="mb-1 font-bold">
                No ILIT providers found within 200 miles of {zip}.
              </p>
              <p className="text-sm text-muted">
                ILIT is still a growing treatment, and not every area has a
                provider yet. Many ILIT specialists see patients traveling
                from out of state — here&apos;s what we found within 600
                miles.
              </p>
            </div>
          )}

          {result.mode === "none" && (
            <div className="px-6 py-16 text-center sm:px-10">
              <p className="font-semibold">
                No providers found within 600 miles of {zip} yet.
              </p>
            </div>
          )}

          {result.totalCount > 0 && (
            <div className="flex flex-col md:h-[600px] md:flex-row">
              <div
                className={`h-96 border-line md:block md:h-full md:w-[42%] md:border-r ${
                  view === "list" ? "hidden" : "block"
                }`}
              >
                <ProviderMap
                  key={`${zip}-${result.effectiveRadius}-${result.mode}`}
                  center={location}
                  radiusMiles={result.effectiveRadius}
                  providers={[
                    ...result.buckets.premium,
                    ...result.buckets.verified,
                    ...result.buckets.free,
                  ]}
                  mode={result.mode}
                />
              </div>
              <div
                className={`flex-1 space-y-3 overflow-y-auto p-4 md:block ${view === "list" ? "block" : "hidden"}`}
              >
                {(["premium", "verified", "free"] as const).map((bucket) =>
                  result.buckets[bucket].length > 0 ? (
                    <div key={bucket}>
                      <div className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">
                        {BUCKET_LABELS[bucket]}
                      </div>
                      <div className="space-y-3">
                        {result.buckets[bucket].map((p) => (
                          <ProviderCard key={p.id} provider={p} backHref={backHref} />
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
