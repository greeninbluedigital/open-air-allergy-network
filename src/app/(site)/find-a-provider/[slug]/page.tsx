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
import { PhotoGallery } from "@/components/pdp/PhotoGallery";

function formatAddress(provider: { address: string; addressLine2: string | null }): string {
  return provider.addressLine2 ? `${provider.address}, ${provider.addressLine2}` : provider.address;
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
}: PageProps<"/find-a-provider/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProvider(slug);
  if (!provider) return {};

  const description =
    provider.shortBio ?? `${provider.practiceName} in ${provider.city}, ${provider.state} — ILIT provider.`;

  return {
    title: provider.practiceName,
    description,
    openGraph: {
      title: provider.practiceName,
      description,
      images: provider.photoUrl ? [provider.photoUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title: provider.practiceName,
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
}: PageProps<"/find-a-provider/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const provider = await getProvider(slug);
  if (!provider) notFound();

  const backHref = typeof sp.back === "string" ? sp.back : "/find-a-provider";
  const sent = sp.sent === "1";
  const confirmed = sp.confirmed === "1";
  const error = sp.error === "invalid_email" || sp.error === "missing_fields" ? sp.error : null;
  const utm = {
    source: typeof sp.utm_source === "string" ? sp.utm_source : undefined,
    medium: typeof sp.utm_medium === "string" ? sp.utm_medium : undefined,
    campaign: typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined,
  };

  const isVerifiedPlus = provider.tier !== "FREE_CLAIMED";
  const isFullProfilePlus = provider.tier === "FULL_PROFILE" || provider.tier === "FEATURED";

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

  const jsonLd = isVerifiedPlus
    ? {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        name: provider.practiceName,
        address: {
          "@type": "PostalAddress",
          streetAddress: provider.addressLine2
            ? `${provider.address}, ${provider.addressLine2}`
            : provider.address,
          addressLocality: provider.city,
          addressRegion: provider.state,
          postalCode: provider.zip,
        },
        telephone: provider.phone ?? undefined,
        url: provider.website ?? undefined,
        image: provider.photoUrl ?? undefined,
        ...(provider.geoExtension
          ? { areaServed: { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: provider.latitude, longitude: provider.longitude }, geoRadius: "600 mi" } }
          : {}),
        ...(aggregateRating ? { aggregateRating } : {}),
      }
    : null;

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

  // Free/Claimed: bare-bones listing with a claim CTA, nothing else.
  if (!isVerifiedPlus) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-10">
        <Link href={backHref} className="mb-6 inline-block text-xs text-muted">
          ← Back to Search Results
        </Link>
        <h1 className="mb-2 text-2xl font-extrabold">{provider.practiceName}</h1>
        <p className="mb-6 text-sm text-muted">
          {formatAddress(provider)}, {provider.city}, {provider.state} {provider.zip}
        </p>
        <div className="mb-6 h-40 rounded border border-dashed border-line bg-bg-alt" />
        <Link
          href="/for-practices"
          className="text-sm font-semibold text-sage"
        >
          Is this your practice? Claim this listing →
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageViewTracker
        providerId={provider.id}
        path={`/find-a-provider/${provider.slug}`}
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
            {provider.foundingMember && <Badge variant="founder">Founding Member</Badge>}
            <Badge variant="verified">Verified</Badge>
            {provider.geoExtension && <Badge variant="geo">Sees Out-of-Area Patients</Badge>}
            {provider.offersVideoConsult && <Badge variant="consult">Video Consults</Badge>}
            {provider.offersPhoneConsult && <Badge variant="consult">Phone Consults</Badge>}
          </div>
          {isVerifiedPlus && provider.verifiedAsOf && (
            <div className="mb-1 text-xs text-muted">
              Verified as of{" "}
              {provider.verifiedAsOf.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          )}
          <h1 className="text-2xl font-extrabold">{provider.practiceName}</h1>
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

          {isFullProfilePlus && (provider.businessHours || provider.ilitScheduleNotes) && (
            <div>
              <h3 className="mb-2 text-base font-bold">Hours</h3>
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

          {provider.geoExtension && (
            <div>
              <h3 className="mb-2 text-base font-bold">Getting Here — Fly In</h3>
              <p className="text-sm text-muted">
                This practice welcomes out-of-area patients. Contact them directly for
                travel guidance.
              </p>
            </div>
          )}

          <PatientReviews provider={provider} />

          {isFullProfilePlus && provider.faqItems.length > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold">Frequently Asked Questions</h3>
              {provider.faqItems.map((item) => (
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
              <h3 className="mb-2 text-base font-bold">Articles by This Practice</h3>
              <ArticleFeed providerCreditedId={provider.id} limit={3} emptyHidden />
            </div>
          )}

          {siblings.length > 0 && (
            <div>
              <h3 className="mb-2 text-base font-bold">Other Locations</h3>
              <div className="space-y-2">
                {siblings.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/find-a-provider/${s.slug}`}
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
          <div className="rounded border border-line p-4.5 md:sticky md:top-6">
            <h3 className="mb-3 text-base font-bold">Contact {provider.practiceName}</h3>

            {sent || confirmed ? (
              <LeadStatusMessage status={sent ? "sent" : "confirmed"} practiceName={provider.practiceName} />
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
                    returnPath={`/find-a-provider/${provider.slug}`}
                  />
                </>
              )
            )}

            {(provider.phone || provider.website) && (
              <div className="mt-3.5 border-t border-line pt-3.5">
                {provider.phone && (
                  <div className="mb-2 text-sm">
                    📞{" "}
                    <PhoneLink phone={provider.phone} className="text-[#1c5ea8]" providerId={provider.id} />
                  </div>
                )}
                {provider.website && (
                  <div className="text-sm">
                    🌐{" "}
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-[#1c5ea8]">
                      {provider.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3.5 border-t border-line pt-3.5 text-sm">
              📍{" "}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${formatAddress(provider)}, ${provider.city}, ${provider.state} ${provider.zip}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1c5ea8] hover:underline"
              >
                {formatAddress(provider)}, {provider.city}, {provider.state} {provider.zip}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
