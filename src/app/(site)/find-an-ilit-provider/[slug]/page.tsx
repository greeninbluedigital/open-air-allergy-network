import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/Badge";
import { PhoneLink } from "@/components/PhoneLink";
import { ArticleFeed } from "@/components/ArticleFeed";
import { ContactForm } from "@/components/pdp/ContactForm";
import { LeadStatusMessage, LeadErrorMessage } from "@/components/pdp/LeadStatusMessage";
import { PatientReviews, getAggregateRatingSchema } from "@/components/PatientReviews";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { PhotoGallery } from "@/components/pdp/PhotoGallery";
import { truncateForMeta } from "@/lib/metadata";
import { parseFormError } from "@/lib/forms";
import { nearbyFeaturedProviders } from "@/lib/srp";
import { COMPARISON_ARTICLE_SLUG, ILIT_DEFINITION } from "@/lib/content";
import { ProviderCard } from "@/components/srp/ProviderCard";
import { isFullProfilePlus as isFullProfileTier, isVerifiedPlus as isVerifiedTier } from "@/lib/tiers";

// 4 or fewer FAQs render fully expanded (today's behavior, unchanged); 5+
// switches to a collapsed accordion so a practice with a lot of FAQ content
// doesn't turn the page into a long uninterrupted scroll.
const FAQ_ACCORDION_THRESHOLD = 4;

// "Getting Here — Fly In" body when the sheet's Travel Notes (column O) is blank.
const DEFAULT_TRAVEL_NOTE =
  "This practice welcomes out-of-area patients. Contact them directly for travel guidance.";

function formatAddress(provider: { address: string; addressLine2: string | null }): string {
  return provider.addressLine2 ? `${provider.address}, ${provider.addressLine2}` : provider.address;
}

// Freemium listings are only claimed as "confirmed" once the phone
// confirmation (Verification Date) has actually happened.
function freemiumSummary(p: { practiceName: string; city: string; state: string; verificationDate: Date | null }) {
  const where = `${p.practiceName} in ${p.city}, ${p.state}`;
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

  // Keyword-rich for search ("ILIT provider in {city}"). Uses `absolute` to
  // skip the root layout's " | Open Air Allergy Network" template — with a
  // real practice name + city + state, the 28-char suffix alone pushed every
  // PDP well past the 62-char budget (verified against all live providers).
  const title = `${provider.practiceName} — ILIT Provider in ${provider.city}, ${provider.state}`;
  // shortBio is long-form ("About This Practice"-length) copy, not written
  // to meta-description length — truncateForMeta bounds it at a clean
  // sentence/word boundary instead of showing 200-500+ raw characters.
  // Freemium pages don't display the short bio or photo (even if they're
  // stored), so the description and share image don't use them either.
  const description = truncateForMeta(
    !isVerifiedTier(provider.tier)
      ? `${freemiumSummary(provider)} Listed on Open Air Allergy Network.`
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
      images: isFullProfileTier(provider.tier) && provider.photoUrl ? [provider.photoUrl] : undefined,
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
  if (!provider) notFound();

  const backHref = typeof sp.back === "string" ? sp.back : "/find-an-ilit-provider";
  const sent = sp.sent === "1";
  const confirmed = sp.confirmed === "1";
  const error = parseFormError(sp.error);
  const utm = {
    source: typeof sp.utm_source === "string" ? sp.utm_source : undefined,
    medium: typeof sp.utm_medium === "string" ? sp.utm_medium : undefined,
    campaign: typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined,
  };

  const isVerifiedPlus = isVerifiedTier(provider.tier);
  const isFullProfilePlus = isFullProfileTier(provider.tier);

  const [siblings, articleCount] = await Promise.all([
    isVerifiedPlus && provider.groupId
      ? db.provider.findMany({
          where: { groupId: provider.groupId, id: { not: provider.id } },
          select: { slug: true, practiceName: true, city: true, state: true },
        })
      : Promise.resolve([]),
    db.article.count({ where: { providerCreditedId: provider.id, status: "PUBLISHED" } }),
  ]);

  const aggregateRating = isVerifiedPlus ? await getAggregateRatingSchema(provider) : null;

  // Structured data only describes what the page shows: Freemium pages show
  // name + address, so that's all their markup claims.
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: provider.practiceName,
    address: {
      "@type": "PostalAddress",
      streetAddress: provider.addressLine2 ? `${provider.address}, ${provider.addressLine2}` : provider.address,
      addressLocality: provider.city,
      addressRegion: provider.state,
      postalCode: provider.zip,
    },
  };
  const jsonLd = isVerifiedPlus
    ? {
        ...businessJsonLd,
        telephone: provider.phone ?? undefined,
        url: provider.website ?? undefined,
        image: isFullProfilePlus ? (provider.photoUrl ?? undefined) : undefined,
        ...(provider.geoExtension
          ? { areaServed: { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: provider.latitude, longitude: provider.longitude }, geoRadius: "600 mi" } }
          : {}),
        ...(aggregateRating ? { aggregateRating } : {}),
      }
    : businessJsonLd;

  const faqJsonLd =
    isFullProfilePlus && provider.faqItems.length > 0
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

  // Freemium: bare listing with a claim CTA, plus the nearest paying
  // Full Profile/Featured practices so a visitor isn't at a dead end.
  if (!isVerifiedPlus) {
    const nearby =
      provider.latitude != null && provider.longitude != null
        ? await nearbyFeaturedProviders(provider.latitude, provider.longitude, { excludeId: provider.id })
        : [];
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <PageViewTracker providerId={provider.id} providerName={provider.practiceName} path={`/find-an-ilit-provider/${provider.slug}`} utm={utm} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="text-center">
          <Link href={backHref} className="mb-6 inline-block text-xs text-muted">
            ← Back to Search Results
          </Link>
          <h1 className="mb-2 text-2xl font-extrabold">{provider.practiceName}</h1>
          <p className="mb-3 text-sm text-muted">
            {formatAddress(provider)}, {provider.city}, {provider.state} {provider.zip}
          </p>
          <p className="mb-6 text-sm text-foreground/80">{freemiumSummary(provider)}</p>
          <Link href="/for-practices" data-cta="freemium_claim_listing" className="text-sm font-semibold text-sage">
            Is this your practice? Claim this listing →
          </Link>
        </div>
        {nearby.length > 0 && (
          <section className="mt-12 border-t border-line pt-8">
            <h2 className="mb-1 text-lg font-bold">Featured ILIT Providers Near {provider.city}</h2>
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
          <Link href="/learn-about-ilit" className="text-sm font-semibold text-sage">
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
            {isFullProfilePlus && provider.foundingMember && <Badge variant="founder">Founding Member</Badge>}
            <Badge variant="verified">Verified</Badge>
            {provider.geoExtension && <Badge variant="geo">Sees Out-of-Area Patients</Badge>}
            {/* pdpRemoteConsultBadge is the on/off switch for organic pages;
                the two fields still say which kind of consult to show. */}
            {provider.pdpRemoteConsultBadge && provider.offersVideoConsult && (
              <Badge variant="consult">Video Consults</Badge>
            )}
            {provider.pdpRemoteConsultBadge && provider.offersPhoneConsult && (
              <Badge variant="consult">Phone Consults</Badge>
            )}
          </div>
          {isVerifiedPlus && provider.verifiedAsOf && (
            <div className="mb-1 text-xs text-muted">
              Verified as of{" "}
              {provider.verifiedAsOf.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
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
            </span>
          </h1>
        </div>
        <Link
          href={backHref}
          className="shrink-0 rounded border border-line px-3 py-1.5 text-xs whitespace-nowrap text-foreground/80"
        >
          ← Back to Search Results
        </Link>
      </div>

      {isFullProfilePlus ? (
        provider.shortBio && (
          <PhotoGallery
            mainPhoto={provider.photoUrl}
            secondaryPhotos={provider.secondaryPhotoUrls}
            shortBio={provider.shortBio}
            alt={provider.practiceName}
          />
        )
      ) : (
        // Verified (not Full Profile+): short bio only, no photo gallery
        // (Section 3 — photos are a Full Profile+ inclusion).
        provider.shortBio && (
          <p className="px-6 pt-5 text-sm whitespace-pre-line text-foreground/80 sm:px-10">
            {provider.shortBio}
          </p>
        )
      )}

      <div className="flex flex-col gap-7 px-6 py-6 md:flex-row sm:px-10">
        <div className="flex-2 space-y-6.5">
          {isFullProfilePlus && (
            <div>
              <h3 className="mb-2 text-base font-bold">About This Practice</h3>
              <p className="text-sm whitespace-pre-line text-foreground/80">{provider.extendedBio}</p>
            </div>
          )}

          {isFullProfilePlus && provider.treatments.length > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold">Treatments Offered</h3>
              <div className="flex flex-wrap gap-2">
                {provider.treatments.map(({ treatment }) => (
                  <span
                    key={treatment.id}
                    className="rounded-full border border-line bg-bg-alt px-3 py-1 text-xs"
                  >
                    {treatment.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {provider.geoExtension && (
            <div>
              <h3 className="mb-2 text-base font-bold">Getting Here — Fly In</h3>
              {/* Sheet column O; blank falls back to the standard line.
                  whitespace-pre-line keeps line breaks typed in the cell. */}
              <p className="text-sm whitespace-pre-line text-muted">
                {provider.travelNotes ?? DEFAULT_TRAVEL_NOTE}
              </p>
            </div>
          )}

          <PatientReviews provider={provider} />

          {isFullProfilePlus && provider.faqItems.length > 0 && (
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
                className="mt-2.5 inline-block text-xs font-semibold"
              >
                See general ILIT FAQ on Learn About ILIT ↗ (opens in new tab)
              </Link>
            </div>
          )}

          {articleCount > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold">Articles From This Practice</h3>
              <ArticleFeed providerCreditedId={provider.id} section="ALL" limit={3} emptyHidden />
            </div>
          )}

          {siblings.length > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold">Other Locations</h3>
              <div className="space-y-2">
                {siblings.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/find-an-ilit-provider/${s.slug}`}
                    className="block rounded border border-line p-2.5 text-sm hover:bg-bg-alt"
                  >
                    {s.practiceName} — {s.city}, {s.state}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* order-first: on mobile, the lead form appears right after the
            intro instead of at the very bottom of a long page (About,
            Treatments, Hours, Reviews, FAQ, Articles, Other Locations all
            come before it in the DOM) — reset to normal order at md+, where
            it's already visible in the sidebar. md:sticky keeps it in view
            while scrolling through the long content column on desktop. */}
        <div className="order-first flex-1 md:order-none">
          <div className="rounded border border-line bg-background p-4.5 md:sticky md:top-6 border-t-4 border-t-action">
            <h3 className="mb-3 text-base font-bold">Contact {provider.practiceName}</h3>

            {sent || confirmed ? (
              <LeadStatusMessage
                status={sent ? "sent" : "confirmed"}
                practiceName={provider.practiceName}
                providerId={provider.id}
                formLocation="provider_page"
              />
            ) : (
              isFullProfilePlus && (
                <>
                  {error && (
                    <LeadErrorMessage
                      error={error}
                      practiceName={provider.practiceName}
                      phone={provider.phone}
                      providerId={provider.id}
                    />
                  )}
                  <ContactForm
                    providerId={provider.id}
                    providerSlug={provider.slug}
                    utm={utm}
                    returnPath={`/find-an-ilit-provider/${provider.slug}`}
                  />
                </>
              )
            )}

            {(provider.phone || provider.website) && (
              <div className="mt-3.5 border-t border-line pt-3.5">
                {provider.phone && (
                  <div className="mb-2 text-sm">
                    📞{" "}
                    <PhoneLink phone={provider.phone} className="text-[#1c5ea8]" providerId={provider.id} providerName={provider.practiceName} />
                  </div>
                )}
                {provider.website && (
                  <div className="text-sm">
                    🌐{" "}
                    <TrackedLink
                      href={provider.website}
                      type="WEBSITE_CLICK"
                      providerId={provider.id}
                      providerName={provider.practiceName}
                      className="text-[#1c5ea8]"
                    >
                      {provider.website.replace(/^https?:\/\//, "")}
                    </TrackedLink>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3.5 border-t border-line pt-3.5 text-sm">
              📍{" "}
              <TrackedLink
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${formatAddress(provider)}, ${provider.city}, ${provider.state} ${provider.zip}`,
                )}`}
                type="ADDRESS_CLICK"
                providerId={provider.id}
                providerName={provider.practiceName}
                className="text-[#1c5ea8] hover:underline"
              >
                {formatAddress(provider)}, {provider.city}, {provider.state} {provider.zip}
              </TrackedLink>
            </div>
          </div>

          {/* Deliberately its own, non-sticky box rather than part of the
              card above: with Hours folded into the sticky card, the whole
              thing measured taller than a 720px viewport (a common laptop
              screen height) with nothing scrolled — meaning it could never
              be fully visible at once. Hours is useful, but it isn't the
              thing this page is trying to get someone to act on, so it
              scrolls normally instead of competing with the form for
              permanent screen space. */}
          {isFullProfilePlus && (provider.businessHours || provider.ilitScheduleNotes) && (
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
