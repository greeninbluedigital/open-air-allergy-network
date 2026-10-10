import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { RENAMED_SLUGS } from "@/lib/slugRedirects";
import { Badge, practiceBadges, seesOutOfArea } from "@/components/Badge";
import { ArticleFeed } from "@/components/ArticleFeed";
import { ContactPanel, formatAddress } from "@/components/pdp/ContactPanel";
import { PatientReviews, getAggregateRatingSchema } from "@/components/PatientReviews";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { PhotoGallery } from "@/components/pdp/PhotoGallery";
import { OtherLocations } from "@/components/pdp/OtherLocations";
import { truncateForMeta } from "@/lib/metadata";
import { parseFormError } from "@/lib/forms";
import { nearbyProviders } from "@/lib/srp";
import { stockPhotoFor } from "@/lib/stockPhotos";
import { visitorInHealthDataState } from "@/lib/visitorLocation";
import { COMPARISON_ARTICLE_SLUG, ILIT_DEFINITION } from "@/lib/content";
import { ProviderCard } from "@/components/srp/ProviderCard";
import {
  isFullProfilePlus as isFullProfileTier,
  isVerifiedPlus as isVerifiedTier,
  contactMode,
  showsPracticeDetails,
} from "@/lib/tiers";

// 4 or fewer FAQs render fully expanded (today's behavior, unchanged); 5+
// switches to a collapsed accordion so a practice with a lot of FAQ content
// doesn't turn the page into a long uninterrupted scroll.
const FAQ_ACCORDION_THRESHOLD = 4;

// Freemium listings are only claimed as "confirmed" once the phone
// confirmation (Verification Date) has actually happened.
function freemiumSummary(
  p: { practiceName: string; city: string; state: string; verificationDate: Date | null },
  street: string | null,
) {
  const where = `${p.practiceName}${street ? ` on ${street}` : ""} in ${p.city}, ${p.state}`;
  return p.verificationDate
    ? `${where} is confirmed to offer ILIT (intralymphatic immunotherapy).`
    : `${where} is listed as an ILIT (intralymphatic immunotherapy) provider.`;
}

const NEW_TO_ILIT_LINKS = [
  {
    label: "How does ILIT compare to allergy shots and allergy drops?",
    href: `/learn-about-ilit/${COMPARISON_ARTICLE_SLUG}`,
  },
  { label: "Is ILIT safe?", href: "/learn-about-ilit#faq-safety" },
  { label: "How do I know if I'm a candidate for ILIT?", href: "/learn-about-ilit#faq-candidate" },
  { label: "Is ILIT covered by insurance?", href: "/learn-about-ilit#faq-insurance" },
];

/**
 * The office's street (e.g. "Central Ave"), but only when the same practice
 * has another active office in the same city. Without it, both pages would
 * share one title and description, and Google may treat them as duplicates.
 * Not needed when the offices already have their own names (e.g. "Aspire
 * Allergy & Sinus - Central Austin"), so only same-named siblings count.
 * Demo listings are left out, so the sales examples keep their titles.
 */
async function sameCityStreet(p: {
  id: string;
  groupId: string | null;
  practiceName: string;
  city: string;
  state: string;
  address: string;
  isDemo: boolean;
}) {
  if (!p.groupId || p.isDemo) return null;
  const siblings = await db.provider.count({
    where: {
      groupId: p.groupId,
      practiceName: p.practiceName,
      city: p.city,
      state: p.state,
      active: true,
      isDemo: false,
      id: { not: p.id },
    },
  });
  if (siblings === 0) return null;
  // Drop the house number and a trailing period: "4200 4th St. N." -> "4th St. N".
  return p.address.replace(/^\s*\d+[A-Za-z-]*\s+/, "").replace(/\.$/, "").trim() || null;
}

async function getProvider(slug: string) {
  return db.provider.findUnique({
    where: { slug, active: true },
    include: {
      treatments: { include: { treatment: true } },
      faqItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/find-an-ilit-provider/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProvider(slug);
  if (!provider) return {};
  const street = await sameCityStreet(provider);

  // Keyword-rich for search ("ILIT provider in {city}"). Uses `absolute` to
  // skip the root layout's " | Open Air Allergy Network" template — with a
  // real practice name + city + state, the 28-char suffix alone pushed every
  // PDP well past the 62-char budget (verified against all live providers).
  const title = `${provider.practiceName} — ILIT Provider in ${provider.city}, ${provider.state}${street ? ` (${street})` : ""}`;
  // shortBio is long-form ("About This Practice"-length) copy, not written
  // to meta-description length — truncateForMeta bounds it at a clean
  // sentence/word boundary instead of showing 200-500+ raw characters.
  // Freemium pages don't display the short bio or photo (even if they're
  // stored), so the description and share image don't use them either.
  const description = truncateForMeta(
    !isVerifiedTier(provider.tier)
      ? `${freemiumSummary(provider, street)} Listed on Open Air Allergy Network.`
      : (provider.shortBio ??
          `${provider.practiceName} is a verified ILIT (intralymphatic immunotherapy) provider in ${provider.city}, ${provider.state}, listed on Open Air Allergy Network.`),
  );

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/find-an-ilit-provider/${slug}` },
    openGraph: {
      title,
      description,
      images: isVerifiedTier(provider.tier) && provider.photoUrl ? [provider.photoUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    // Sales-demo listings (Provider.isDemo) are reachable only by direct
    // link — this holds even once robots.ts's sitewide block is lifted for
    // real launch, independent of that.
    ...(provider.isDemo ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ProviderDetailPage({
  params,
  searchParams,
}: PageProps<"/find-an-ilit-provider/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const provider = await getProvider(slug);
  if (!provider) {
    // Only redirect to a page that's live. A renamed practice that was
    // later deactivated should read as gone, not redirect to a 404.
    const renamed = RENAMED_SLUGS[slug];
    if (renamed && (await db.provider.count({ where: { slug: renamed, active: true } }))) {
      permanentRedirect(`/find-an-ilit-provider/${renamed}`);
    }
    notFound();
  }
  const street = await sameCityStreet(provider);

  const backHref = typeof sp.back === "string" ? sp.back : "/find-an-ilit-provider";
  const sent = sp.sent === "1";
  // ?location=restricted: the server turned a "Yes" answer away (visitors
  // without JavaScript), so the page shows the email button.
  const visitorInHealthState = sp.location === "restricted" || (await visitorInHealthDataState());
  const confirmed = sp.confirmed === "1";
  const error = parseFormError(sp.error);
  const utm = {
    source: typeof sp.utm_source === "string" ? sp.utm_source : undefined,
    medium: typeof sp.utm_medium === "string" ? sp.utm_medium : undefined,
    campaign: typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined,
  };

  const isVerifiedPlus = isVerifiedTier(provider.tier);
  const isFullProfilePlus = isFullProfileTier(provider.tier);
  const stockPhoto = stockPhotoFor(provider.slug);
  // FAQs, treatments and hours: Full Profile+, or the Academic package.
  const showDetails = showsPracticeDetails(provider);
  const hasFaqs = showDetails && provider.faqItems.length > 0;
  // OAAN writes these profiles from the practice's own website, without the
  // practice's involvement, so every page with that copy says so (owner's
  // decision, 2026-10-09; docs/profile-writing-guide.md).
  const sourceNote = (
    <p className="mt-3 text-xs text-muted">
      Open Air Allergy Network is an independent directory and isn&apos;t affiliated with {provider.practiceName}. This
      profile summarizes information the practice publishes on its website, so please confirm details with the
      practice.
    </p>
  );

  const [siblings, articleCount] = await Promise.all([
    isVerifiedPlus && provider.groupId
      ? db.provider.findMany({
          // Live offices only: an inactive one's page is a 404. Demo pages
          // list their fellow demos; real pages never list a demo.
          where: {
            groupId: provider.groupId,
            id: { not: provider.id },
            active: true,
            ...(provider.isDemo ? {} : { isDemo: false }),
          },
          select: { slug: true, practiceName: true, city: true, state: true, latitude: true, longitude: true },
        })
      : Promise.resolve([]),
    db.article.count({ where: { providerCreditedId: provider.id, status: "PUBLISHED" } }),
  ]);

  const aggregateRating = isVerifiedPlus ? await getAggregateRatingSchema(provider) : null;

  // Structured data only describes what the page shows: Freemium pages show
  // name + address, so that's all their markup claims.
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: provider.practiceName,
    address: {
      "@type": "PostalAddress",
      streetAddress: provider.addressLine2 ? `${provider.address}, ${provider.addressLine2}` : provider.address,
      addressLocality: provider.city,
      addressRegion: provider.state,
      postalCode: provider.zip,
    },
  };
  // The same practice elsewhere on the web (its own site, Google Maps
  // listing, Yelp page), so search engines can tie this page to it.
  // Structured data only: no visible outbound links on the page.
  const sameAs = [
    provider.website,
    provider.googlePlaceId ? `https://www.google.com/maps/place/?q=place_id:${provider.googlePlaceId}` : null,
    provider.yelpBusinessId ? `https://www.yelp.com/biz/${provider.yelpBusinessId}` : null,
  ].filter((u): u is string => Boolean(u));
  if (sameAs.length > 0) Object.assign(businessJsonLd, { sameAs });
  const jsonLd = isVerifiedPlus
    ? {
        ...businessJsonLd,
        telephone: provider.phone ?? undefined,
        url: provider.website ?? undefined,
        image: provider.photoUrl ?? undefined,
        ...(seesOutOfArea(provider)
          ? { areaServed: { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: provider.latitude, longitude: provider.longitude }, geoRadius: "600 mi" } }
          : {}),
        ...(aggregateRating ? { aggregateRating } : {}),
      }
    : businessJsonLd;

  const faqJsonLd =
    showDetails && provider.faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: provider.faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  // Freemium: bare listing with a claim CTA, plus the nearest other
  // practices so a visitor isn't at a dead end.
  if (!isVerifiedPlus) {
    const nearby =
      provider.latitude != null && provider.longitude != null
        ? await nearbyProviders(provider.latitude, provider.longitude, { excludeId: provider.id })
        : [];
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <PageViewTracker providerId={provider.id} providerName={provider.practiceName} path={`/find-an-ilit-provider/${provider.slug}`} utm={utm} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Link href={backHref} className="mb-6 inline-block text-xs text-muted hover:underline">
          ← Back to Search Results
        </Link>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* A generic allergen photo (stockPhotos.ts): basic listings have none of their own. */}
          <div className="relative aspect-4/5 w-40 shrink-0 overflow-hidden rounded bg-bg-alt sm:w-44">
            <Image src={stockPhoto.url} alt={stockPhoto.alt} fill sizes="176px" className="object-cover" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="mb-2 text-2xl font-extrabold">{provider.practiceName}</h1>
            <p className="mb-3 text-sm text-muted">
              {formatAddress(provider)}, {provider.city}, {provider.state} {provider.zip}
            </p>
            <p className="mb-6 text-sm text-foreground/80">{freemiumSummary(provider, street)}</p>
            <Link href="/for-practices" data-cta="freemium_claim_listing" className="text-sm font-semibold text-sage hover:underline">
              Is this your practice? Claim this listing →
            </Link>
          </div>
        </div>
        {nearby.length > 0 && (
          <section className="mt-12 border-t border-line pt-8">
            <h2 className="mb-1 text-lg font-bold">Other ILIT Providers Near {provider.city}</h2>
            <p className="mb-4 text-xs text-muted">Distances are from {provider.practiceName}.</p>
            <div className="space-y-3">
              {nearby.map((p) => (
                <ProviderCard key={p.id} provider={p} backHref={backHref} impressionType="PDP_NEARBY_IMPRESSION" />
              ))}
            </div>
          </section>
        )}
        {/* Freemium only: these pages are the site's, not a client's, so
            they point visitors to the Learn content. Paid PDPs never link
            away like this. */}
        <section className="mt-10 rounded border border-line bg-bg-alt p-5">
          <h2 className="mb-2 text-lg font-bold">New to ILIT?</h2>
          <p className="mb-4 text-sm text-foreground/80">{ILIT_DEFINITION}</p>
          <ul className="mb-4 space-y-2 text-sm">
            {NEW_TO_ILIT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[#1c5ea8] hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/learn-about-ilit" className="text-sm font-semibold text-sage hover:underline">
            Learn more about ILIT →
          </Link>
        </section>
      </div>
    );
  }

  return (
    <>
      <PageViewTracker
        providerId={provider.id}
        providerName={provider.practiceName}
        path={`/find-an-ilit-provider/${provider.slug}`}
        utm={{ source: utm.source, medium: utm.medium, campaign: utm.campaign }}
      />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-10">
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {practiceBadges(provider).map((b) => (
              <Badge key={b.label} variant={b.variant}>
                {b.label}
              </Badge>
            ))}
            {/* pdpRemoteConsultBadge is the on/off switch for organic pages;
                the two fields still say which kind of consult to show. */}
            {provider.pdpRemoteConsultBadge && provider.offersVideoConsult && (
              <Badge variant="consult">Video Consults</Badge>
            )}
            {provider.pdpRemoteConsultBadge && provider.offersPhoneConsult && (
              <Badge variant="consult">Phone Consults</Badge>
            )}
          </div>
          {/* The actual date OAAN confirmed the practice offers ILIT. */}
          {provider.verificationDate && (
            <div className="mb-1 text-xs text-muted">
              Last confirmed{" "}
              {provider.verificationDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                // Sheet dates are stored as UTC midnight: format in UTC so
                // the day doesn't slip back in US time zones.
                timeZone: "UTC",
              })}
            </div>
          )}
          <h1 className="text-2xl font-extrabold">
            {provider.practiceName}
            {/* Matches the <title> tag's wording so the visible H1 and the
                search-result title reinforce the same keywords, without
                the practice name losing visual top billing. */}
            <span className="mt-0.5 block text-sm font-normal text-muted">
              ILIT Provider in {provider.city}, {provider.state}
              {street && ` (${street})`}
            </span>
          </h1>
        </div>
        <Link
          href={backHref}
          className="shrink-0 rounded border border-line px-3 py-1.5 text-xs whitespace-nowrap text-foreground/80 transition-colors hover:border-muted hover:bg-bg-alt"
        >
          ← Back to Search Results
        </Link>
      </div>

      {/* The practice's own photo, or a generic allergen photo (stockPhotos.ts)
          when it has none. The extra photos are Full Profile+. */}
      {provider.shortBio && (
        <PhotoGallery
          mainPhoto={provider.photoUrl ?? stockPhoto.url}
          secondaryPhotos={isFullProfilePlus ? provider.secondaryPhotoUrls : []}
          shortBio={provider.shortBio}
          alt={provider.practiceName}
          mainAlt={provider.photoUrl ? provider.practiceName : stockPhoto.alt}
        />
      )}

      <div className="flex flex-col gap-7 px-6 py-6 md:flex-row sm:px-10">
        <div className="flex-2 space-y-6.5">
          {isFullProfilePlus && provider.extendedBio && (
            <div>
              <h3 className="mb-2 text-base font-bold">About This Practice</h3>
              <p className="text-sm whitespace-pre-line text-foreground/80">{provider.extendedBio}</p>
              {sourceNote}
            </div>
          )}

          {seesOutOfArea(provider) && (
            <div>
              <h3 className="mb-2 text-base font-bold">Getting Here — Fly In</h3>
              {/* Sheet column P, written from the practice's own site; no
                  fallback text, since that would be our claim, not theirs.
                  whitespace-pre-line keeps line breaks typed in the cell. */}
              <p className="text-sm whitespace-pre-line text-muted">
                {provider.travelNotes}
              </p>
            </div>
          )}

          <PatientReviews provider={provider} />

          {showDetails && provider.faqItems.length > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold">Frequently Asked Questions</h3>
              {provider.faqItems.length > FAQ_ACCORDION_THRESHOLD
                ? // 5+ FAQs: collapsed by default (each independent — no
                  // `name` attribute, so opening one doesn't close another),
                  // native <details>/<summary> rather than a JS-driven
                  // accordion — full question/answer text stays in the
                  // initial HTML either way, so nothing is hidden from SEO,
                  // and it keeps working with JS disabled.
                  provider.faqItems.map((item) => (
                    <details key={item.id} className="border-b border-line py-2.5">
                      <summary className="cursor-pointer text-sm font-semibold">{item.question}</summary>
                      <div className="mt-1 text-sm whitespace-pre-line text-muted">{item.answer}</div>
                    </details>
                  ))
                : provider.faqItems.map((item) => (
                    <div key={item.id} className="border-b border-line py-2.5">
                      <div className="text-sm font-semibold">{item.question}</div>
                      <div className="mt-1 text-sm whitespace-pre-line text-muted">{item.answer}</div>
                    </div>
                  ))}
              <Link
                href="/learn-about-ilit#faq"
                target="_blank"
                className="mt-2.5 inline-block text-xs font-semibold hover:underline"
              >
                See general ILIT FAQ on Learn About ILIT ↗ (opens in new tab)
              </Link>
            </div>
          )}

          {/* No extended bio to sit under: the note goes here instead. */}
          {!(isFullProfilePlus && provider.extendedBio) && (provider.shortBio || hasFaqs) && sourceNote}

          {articleCount > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold">Articles From This Practice</h3>
              <ArticleFeed providerCreditedId={provider.id} section="ALL" limit={3} emptyHidden />
            </div>
          )}

          <OtherLocations from={provider} offices={siblings} />
        </div>

        {/* order-first: on mobile, the lead form appears right after the
            intro instead of at the very bottom of a long page (About,
            Treatments, Hours, Reviews, FAQ, Articles, Other Locations all
            come before it in the DOM) — reset to normal order at md+, where
            it's already visible in the sidebar. md:sticky keeps it in view
            while scrolling through the long content column on desktop. */}
        <div className="order-first flex-1 md:order-none">
          <ContactPanel
            provider={provider}
            mode={contactMode(provider, visitorInHealthState)}
          email={provider.notificationEmail?.trim() || null}
            sent={sent}
            confirmed={confirmed}
            error={error}
            utm={utm}
            returnPath={`/find-an-ilit-provider/${provider.slug}`}
            formLocation="provider_page"
            className="md:sticky md:top-6"
          />

          {/* Deliberately its own, non-sticky box rather than part of the
              card above: with Hours folded into the sticky card, the whole
              thing measured taller than a 720px viewport (a common laptop
              screen height) with nothing scrolled — meaning it could never
              be fully visible at once. Hours is useful, but it isn't the
              thing this page is trying to get someone to act on, so it
              scrolls normally instead of competing with the form for
              permanent screen space. */}
          {showDetails && (provider.businessHours || provider.ilitScheduleNotes) && (
            <div className="mt-3.5 rounded border border-line p-4.5">
              {provider.businessHours
                ?.split(";")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((segment) => (
                  <div key={segment} className="border-b border-line py-1 text-sm">
                    {segment}
                  </div>
                ))}
              {provider.ilitScheduleNotes && (
                <p className="mt-2.5 text-sm whitespace-pre-line text-muted">{provider.ilitScheduleNotes}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
