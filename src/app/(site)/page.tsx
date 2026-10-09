import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { cloudinaryLimitWidth } from "@/lib/cloudinary";
import { ILIT_DEFINITION, SYMPTOMS } from "@/lib/content";
import { countProvidersNear, nearbyProviders } from "@/lib/srp";
import { getVisitorLocation } from "@/lib/visitorLocation";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ProviderCard } from "@/components/srp/ProviderCard";
import { FindOrJoinRow } from "@/components/FindOrJoinRow";
// Owner-chosen title, 63 characters: one over the usual 62 budget
// (docs/metadata-rules.md), accepted since any truncation only trims the
// brand at the end. Description inherits the root layout default.
export const metadata: Metadata = {
  title: { absolute: "Find ILIT Allergy Treatment Near You | Open Air Allergy Network" },
  alternates: { canonical: "/" },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const OAAN_DESCRIPTION =
  "Open Air Allergy Network is a free directory of allergy practices confirmed to offer ILIT (intralymphatic immunotherapy).";

// WebSite.name is what Google uses for the site name in results. No email:
// anything in page source gets scraped, so contact goes to the About form.
// Add `logo` to the Organization once the designed logo exists.
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: "Open Air Allergy Network", url: SITE_URL },
    {
      "@type": "Organization",
      name: "Open Air Allergy Network",
      url: SITE_URL,
      description: OAAN_DESCRIPTION,
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: `${SITE_URL}/about#contact` },
    },
  ],
};

// Every request gets its own random hero photo and visitor-location lookup,
// and DB-only changes (a new hero photo, a newly featured practice) must show
// up without a redeploy.
export const dynamic = "force-dynamic";

// Shown until the "Homepage Hero Images" sheet tab has at least one active photo.
const FALLBACK_HERO = {
  imageUrl: "https://res.cloudinary.com/qruprn0t/image/upload/v1790318756/learn-about-ilit-hero.jpg",
  altText: "Open green field under a clear blue sky",
};

async function pickHeroImage() {
  const images = await db.homepageHeroImage.findMany();
  return images.length > 0 ? images[Math.floor(Math.random() * images.length)] : FALLBACK_HERO;
}

// Every claim here is already stated (and sourced) on Learn About ILIT.
const FACTS = [
  { title: "Typically 3 visits", caption: "Spaced about a month apart" },
  { title: "Months, not years", caption: "Compared with years of traditional allergy shots" },
  { title: "Often HSA/FSA eligible", caption: "How HSA and FSA funds work", href: "/learn-about-ilit#faq-hsa-fsa" },
];

// How to use the directory, deliberately not the Learn page's treatment steps.
const HOW_IT_WORKS = [
  { title: "Search by zip", text: "Enter your zip code to see ILIT providers near you." },
  { title: "Compare providers", text: "Browse nearby practices, each confirmed to offer ILIT." },
  { title: "Contact a practice", text: "Reach out to a practice directly. Our directory is always free to use." },
];

export default async function HomePage() {
  const [hero, visitor] = await Promise.all([pickHeroImage(), getVisitorLocation()]);
  // The nearest practices to the visitor, whatever their listing level.
  const featured = visitor ? await nearbyProviders(visitor.lat, visitor.lng) : [];
  // Only needed when there's no nearby section: keeps the homepage useful
  // when no listing is within reach of the visitor.
  const nearbyCount = visitor && featured.length === 0 ? await countProvidersNear(visitor.lat, visitor.lng) : 0;
  const nearbySearch = visitor?.zip ? `/find-an-ilit-provider?zip=${visitor.zip}` : "/find-an-ilit-provider";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
      <section className="relative border-b border-line">
        {/* 3:1 from laptop width up, matching the 2400x800 crops the hero
            photos are prepared at (see docs/sheet-columns.md). w-full keeps
            the height cap from shrinking the width to hold the ratio. */}
        <div className="relative h-64 w-full overflow-hidden bg-bg-alt sm:h-80 lg:aspect-[3/1] lg:h-auto lg:max-h-[600px]">
          <Image
            src={cloudinaryLimitWidth(hero.imageUrl, 2400)}
            alt={hero.altText}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          id="find"
          className="relative z-10 mx-6 -mt-16 max-w-sm scroll-mt-4 rounded border border-line bg-white p-5 shadow-lg sm:absolute sm:bottom-6 sm:left-10 sm:mx-0 sm:mt-0"
        >
          <h1 className="mb-1 text-lg font-bold">Allergy treatment in months, not years.</h1>
          <p className="mb-3.5 text-xs text-muted">Find an ILIT provider near you.</p>
          <ZipSearchForm origin="homepage_hero" />
          <p className="mt-3 text-xs text-muted">✓ Every practice listed is confirmed to offer ILIT.</p>
        </div>
      </section>

      <section className="border-b border-line px-6 py-8 sm:px-10">
        <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.title}>
              <div className="text-lg font-bold">{fact.title}</div>
              {fact.href ? (
                <Link href={fact.href} className="text-sm text-sage hover:underline">
                  {fact.caption} →
                </Link>
              ) : (
                <div className="text-sm text-foreground/80">{fact.caption}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line bg-bg-alt px-6 py-10 sm:px-10">
        <h2 className="mb-3 text-2xl font-bold">What is ILIT?</h2>
        <p className="max-w-3xl text-base text-foreground">{ILIT_DEFINITION}</p>
        <Link href="/learn-about-ilit" data-cta="homepage_what_is_ilit" className="mt-4 inline-block text-sm font-semibold text-sage hover:underline">
          Learn more about ILIT →
        </Link>
      </section>

      <section className="border-b border-line px-6 py-10 sm:px-10">
        <h2 className="mb-2 text-2xl font-bold">How It Works</h2>
        <p className="mb-5 max-w-3xl text-base text-foreground/80">{OAAN_DESCRIPTION}</p>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-4 rounded border border-line p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action text-sm font-bold text-white">
                {i + 1}
              </div>
              <div>
                <h3 className="mb-1 font-bold">{step.title}</h3>
                <p className="text-sm text-foreground/80">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {visitor && featured.length > 0 && (
        // data-nosnippet: the city comes from the visitor (or Google's own
        // crawler location), so keep it out of search result snippets.
        <section data-nosnippet className="border-b border-line bg-bg-alt px-6 py-10 sm:px-10">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-2xl font-bold">ILIT Providers Near {visitor.city}</h2>
            <Link href="#find" data-cta="homepage_change_location" className="text-sm text-muted hover:underline">
              Not near {visitor.city}? Change location
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProviderCard key={p.id} provider={p} backHref={nearbySearch} impressionType="HOMEPAGE_IMPRESSION" />
            ))}
          </div>
          <Link href={nearbySearch} data-cta="homepage_featured_see_all" className="mt-5 inline-block text-sm font-semibold text-sage hover:underline">
            See all ILIT providers near {visitor.city} →
          </Link>
        </section>
      )}

      {visitor && nearbyCount > 0 && (
        <section data-nosnippet className="border-b border-line bg-bg-alt px-6 py-8 text-center sm:px-10">
          <p className="text-base">
            {nearbyCount} ILIT {nearbyCount === 1 ? "provider" : "providers"} within 200 miles of {visitor.city}.{" "}
            <Link href={nearbySearch} data-cta="homepage_nearby_count" className="font-semibold text-sage hover:underline">
              See {nearbyCount === 1 ? "it" : "them"} →
            </Link>
          </p>
        </section>
      )}

      <section className="border-b border-line px-6 py-10 text-center sm:px-10">
        <h2 className="mb-4 text-2xl font-bold">Does This Sound Familiar?</h2>
        <ul className="mx-auto mb-5 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
          {SYMPTOMS.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-base">
                {s.icon}
              </span>
              {s.label}
            </li>
          ))}
        </ul>
        <Link href="/learn-about-ilit#is-ilit-right-for-me" data-cta="homepage_symptoms" className="text-sm font-semibold text-sage hover:underline">
          Is ILIT right for me? →
        </Link>
      </section>

      <section className="border-b border-line bg-bg-alt px-6 py-8 text-center sm:px-10">
        <p className="text-base">
          Get answers to{" "}
          <Link href="/learn-about-ilit#faq" className="font-semibold text-sage hover:underline">
            common questions
          </Link>{" "}
          and read our{" "}
          <Link href="/learn-about-ilit#guides" className="font-semibold text-sage hover:underline">
            allergy treatment guides
          </Link>{" "}
          on Learn About ILIT.
        </p>
      </section>

      <FindOrJoinRow searchHeading="Ready to find an ILIT provider?" origin="homepage_bottom" />
    </>
  );
}
