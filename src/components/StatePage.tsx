import Link from "next/link";
import type { Metadata } from "next";
import { ProviderCard } from "@/components/srp/ProviderCard";
import { ILIT_DEFINITION } from "@/lib/content";
import { travelArticlePath } from "@/lib/articles";
import { DEFAULT_OG_IMAGE, truncateForMeta } from "@/lib/metadata";
import { metroAnchor, stateMetroGroups, statesWithProviders, type MetroGroup, type StateInfo } from "@/lib/statePages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function groupHeading(group: MetroGroup, state: StateInfo): string {
  return group.name ? `${group.name} area` : `Other ${state.name} locations`;
}

export async function stateMetadata(state: StateInfo): Promise<Metadata> {
  const groups = await stateMetroGroups(state.code);
  const metros = groups.filter((g) => g.name).map((g) => g.name!);
  const title = `ILIT Providers in ${state.name}`;
  const description = truncateForMeta(
    metros.length > 0
      ? `Find ILIT (intralymphatic immunotherapy) providers in ${state.name} by metro area: ${metros.slice(0, 4).join(", ")}.`
      : `Find ILIT (intralymphatic immunotherapy) providers in ${state.name}, listed on Open Air Allergy Network.`,
  );
  return {
    title,
    description,
    alternates: { canonical: `/find-an-ilit-provider/${state.slug}` },
    openGraph: { title, description, images: [DEFAULT_OG_IMAGE] },
  };
}

/**
 * /find-an-ilit-provider/{state}: every active practice in the state,
 * grouped by metro area (src/lib/statePages.ts). The same cards as search,
 * without distances, plus a zip-filled search link per metro. Rendered by
 * the [slug] route when the slug is a state name.
 */
export async function StatePage({ state, groups }: { state: StateInfo; groups: MetroGroup[] }) {
  const [allStates, travelPath] = await Promise.all([statesWithProviders(), travelArticlePath()]);
  const total = groups.reduce((n, g) => n + g.providers.length, 0);
  const path = `/find-an-ilit-provider/${state.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Find an ILIT Provider", item: `${SITE_URL}/find-an-ilit-provider` },
        { "@type": "ListItem", position: 2, name: state.name, item: `${SITE_URL}${path}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `ILIT Allergy Treatment Providers in ${state.name}`,
      numberOfItems: total,
      itemListElement: groups
        .flatMap((g) => g.providers)
        .map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${p.practiceName}, ${p.city}`,
          url: `${SITE_URL}/find-an-ilit-provider/${p.slug}`,
        })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-line px-6 pt-6 pb-8 sm:px-10">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
          <Link href="/find-an-ilit-provider" className="hover:underline">
            Find an ILIT Provider
          </Link>{" "}
          / <span>{state.name}</span>
        </nav>
        <h1 className="mb-3 text-3xl font-extrabold">ILIT Allergy Treatment Providers in {state.name}</h1>
        <p className="max-w-2xl text-sm text-foreground/80">
          Open Air Allergy Network lists the practices in {state.name} that offer ILIT, grouped by metro area below.{" "}
          {ILIT_DEFINITION}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-foreground/80">
          New to ILIT?{" "}
          <Link href="/learn-about-ilit" className="font-semibold text-sage hover:underline">
            Learn how it works and who it may suit →
          </Link>
        </p>
        {travelPath && (
          <p className="mt-2 max-w-2xl text-sm text-foreground/80">
            No practice near you?{" "}
            <Link href={travelPath} className="font-semibold text-sage hover:underline">
              Why travel for ILIT? →
            </Link>
          </p>
        )}
      </div>

      {groups.map((group) => (
        <section
          key={group.name ?? "other"}
          id={metroAnchor(group.name)}
          className="scroll-mt-4 border-b border-line px-6 py-8 sm:px-10"
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">{groupHeading(group, state)}</h2>
            {group.zip && (
              <Link
                href={`/find-an-ilit-provider?zip=${group.zip}`}
                data-cta="state_page_metro_search"
                className="text-sm font-semibold text-sage hover:underline"
              >
                Search near {group.name} →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {group.providers.map((p) => (
              <ProviderCard key={p.id} provider={p} backHref={path} impressionType="SRP_IMPRESSION" hideDistance />
            ))}
          </div>
        </section>
      ))}

      {allStates.length > 1 && (
        <section className="px-6 py-8 sm:px-10">
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">ILIT allergy providers in other states</h2>
          <StateLinks states={allStates.filter((s) => s.code !== state.code)} />
        </section>
      )}
    </>
  );
}

/** A wrapping row of state links, shared with Find a Provider. No counts:
 * with only a few practices per state, they made the directory look thin
 * (owner, 2026-10-13). */
export function StateLinks({ states }: { states: StateInfo[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      {states.map((s) => (
        <Link key={s.code} href={`/find-an-ilit-provider/${s.slug}`} className="font-semibold text-sage hover:underline">
          {s.name}
        </Link>
      ))}
    </div>
  );
}

