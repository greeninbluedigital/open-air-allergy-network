import Link from "next/link";
import { ScraperTrapLink } from "@/components/ScraperTrapLink";
import type { Metadata } from "next";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ProviderCard } from "@/components/srp/ProviderCard";
import { ProviderMap } from "@/components/srp/ProviderMap";import { lookupZip } from "@/lib/zip";
import { searchProviders } from "@/lib/srp";

export const metadata: Metadata = {
  title: "Find an ILIT Provider",
  description:
    "Search ILIT (intralymphatic immunotherapy) providers near you by zip code. Every listed practice is confirmed to offer ILIT.",
  alternates: { canonical: "/find-an-ilit-provider" },
};

const RADIUS_VALUES = new Set<number>([20, 30, 40, 50, 75, 100, 150, 200]);

function buildQuery(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) usp.set(k, v);
  return `?${usp.toString()}`;
}

export default async function FindAProviderPage({
  searchParams,
}: PageProps<"/find-an-ilit-provider">) {
  const params = await searchParams;
  const zip = typeof params.zip === "string" ? params.zip : undefined;
  const radiusParam = typeof params.radius === "string" ? parseInt(params.radius, 10) : 50;
  const radius = RADIUS_VALUES.has(radiusParam) ? radiusParam : 50;
  // List by default: its cards show each practice's badges, which the
  // map's pins don't. Only matters below md.
  const view = params.view === "map" ? "map" : "list";

  const location = zip ? lookupZip(zip) : null;
  const result = location ? await searchProviders(location.lat, location.lng, radius) : null;
  // One list, nearest first, whatever a practice's listing level: a
  // neutral consumer information site ranks by distance only (2026-10-09).
  const providers = result
    ? [...result.buckets.premium, ...result.buckets.verified, ...result.buckets.free].sort(
        (a, b) => a.distanceMiles - b.distanceMiles,
      )
    : [];
  const backHref = zip
    ? `/find-an-ilit-provider${buildQuery({ zip, radius: String(radius), view })}`
    : "/find-an-ilit-provider";

  return (
    <>
      {/* No natural spot for a visible headline in this compact,
          form-first header bar (and the user doesn't want its look
          changed) — sr-only keeps a real H1 in the DOM for SEO/a11y
          without touching the visual design. */}
      <h1 className="sr-only">Find an ILIT Provider Near You</h1>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-bg-alt px-6 py-4 sm:px-10">
        <div className="flex-1">
          <ZipSearchForm action="/find-an-ilit-provider" origin="srp_header" showRadius defaultRadius={radius} defaultZip={zip ?? ""} />
        </div>
        {zip && (
          // Map and list already render side by side at md+ (both columns
          // are md:block unconditionally below) — this toggle only changes
          // anything below that breakpoint, where there's only room for
          // one at a time. Hidden at md+ since it's inert there.
          <div className="flex overflow-hidden rounded border border-line text-xs md:hidden">
            <Link
              href={buildQuery({ zip, radius: String(radius), view: "list" })}
              data-cta="srp_view_list"
              className={`px-3.5 py-2 ${view === "list" ? "bg-foreground text-background" : "bg-white hover:bg-line"}`}
            >
              List
            </Link>
            <Link
              href={buildQuery({ zip, radius: String(radius), view: "map" })}
              data-cta="srp_view_map"
              className={`px-3.5 py-2 ${view === "map" ? "bg-foreground text-background" : "bg-white hover:bg-line"}`}
            >
              Map
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
                ILIT is still a growing treatment, and not every area has a
                provider yet. Many ILIT specialists see patients traveling
                from farther away, and some offer remote consultations —
                here&apos;s what we found within 600 miles.
              </p>
              <p className="text-sm text-muted">
                No ILIT providers found within 200 miles of {zip}.
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
                  providers={providers}
                  outOfArea={result.outOfArea}
                  mode={result.mode}
                  backHref={backHref}
                />
              </div>
              <div
                className={`flex-1 space-y-3 overflow-y-auto p-4 md:block ${view === "list" ? "block" : "hidden"}`}
              >
                {providers.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">ILIT Providers</div>
                    <div className="space-y-3">
                      {providers.map((p) => (
                        <ProviderCard key={p.id} provider={p} backHref={backHref} impressionType="SRP_IMPRESSION" />
                      ))}
                    </div>
                  </div>
                )}
                {result.outOfArea.length > 0 && (
                  <div>
                    <div className="mb-0.5 text-xs font-bold tracking-wide text-muted uppercase">
                      Out-of-area practices welcoming traveling patients
                    </div>
                    <p className="mb-2 text-xs text-muted">
                      Beyond your {result.effectiveRadius}-mile search. ILIT takes only a few visits, so some
                      patients travel for it.
                    </p>
                    <div className="space-y-3">
                      {result.outOfArea.map((p) => (
                        <ProviderCard key={p.id} provider={p} backHref={backHref} impressionType="SRP_IMPRESSION" />
                      ))}
                    </div>
                  </div>
                )}
                <ScraperTrapLink />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
