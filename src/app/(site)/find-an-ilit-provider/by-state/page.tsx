import Link from "next/link";
import type { Metadata } from "next";
import { ILIT_DEFINITION } from "@/lib/content";
import { allStateMetroGroups, metroAnchor } from "@/lib/statePages";
import { travelArticlePath } from "@/lib/articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "ILIT Allergy Providers by State",
  description:
    "Browse ILIT (intralymphatic immunotherapy) providers by state and metro area across the U.S., with practice details and search by zip code.",
  alternates: { canonical: "/find-an-ilit-provider/by-state" },
};

// Cached page (src/lib/cache.ts): rebuilt after a sync clears the cache, so
// it stays in step with the state pages it links.
export const revalidate = 604800;

/**
 * Every state with an ILIT practice, with its metro areas linking to their
 * sections on the state page. The footer links here (one sitewide link
 * instead of one per state), so every state page is a click away from any
 * page.
 */
export default async function ProvidersByStatePage() {
  const [states, travelPath] = await Promise.all([allStateMetroGroups(), travelArticlePath()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Find an ILIT Provider", item: `${SITE_URL}/find-an-ilit-provider` },
      { "@type": "ListItem", position: 2, name: "By State", item: `${SITE_URL}/find-an-ilit-provider/by-state` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-line px-6 pt-6 pb-8 sm:px-10">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
          <Link href="/find-an-ilit-provider" className="hover:underline">
            Find an ILIT Provider
          </Link>{" "}
          / <span>By State</span>
        </nav>
        <h1 className="mb-3 text-3xl font-extrabold">ILIT Allergy Providers by State</h1>
        <p className="max-w-2xl text-sm text-foreground/80">
          Choose a state to see the practices there that offer ILIT, grouped by metro area. {ILIT_DEFINITION}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-foreground/80">
          Know your zip code?{" "}
          <Link href="/find-an-ilit-provider" className="font-semibold text-sage hover:underline">
            Search for providers near you →
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

      <div className="grid grid-cols-1 gap-x-10 gap-y-7 px-6 py-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {states.map(({ state, groups }) => {
          const metros = groups.filter((g) => g.name);
          return (
            <section key={state.code}>
              <h2 className="mb-1.5 text-base font-bold">
                <Link href={`/find-an-ilit-provider/${state.slug}`} className="hover:underline">
                  ILIT allergy providers in {state.name}
                </Link>
              </h2>
              {metros.length > 0 && (
                <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {metros.map((g) => (
                    <li key={g.name}>
                      <Link
                        href={`/find-an-ilit-provider/${state.slug}#${metroAnchor(g.name)}`}
                        className="font-semibold text-sage hover:underline"
                      >
                        {g.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
