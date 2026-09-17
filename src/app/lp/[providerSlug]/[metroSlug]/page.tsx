import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/Badge";
import { PhoneLink } from "@/components/PhoneLink";
import { ContactForm } from "@/components/pdp/ContactForm";
import { LeadStatusMessage, LeadErrorMessage } from "@/components/pdp/LeadStatusMessage";
import { PatientReviews, reviewsWouldShow } from "@/components/PatientReviews";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { SYMPTOMS as ALL_SYMPTOMS, TREATMENT_COMPARISON, WHAT_IS_ILIT_COPY } from "@/lib/content";

const SYMPTOMS = ALL_SYMPTOMS.slice(0, 4);

async function getLandingPage(providerSlug: string, metroSlug: string) {
  const provider = await db.provider.findUnique({ where: { slug: providerSlug, active: true } });
  if (!provider) return null;

  const lp = await db.semLandingPage.findUnique({
    where: { providerId_urlSlug: { providerId: provider.id, urlSlug: metroSlug }, active: true },
  });
  if (!lp) return null;

  return { provider, lp };
}

export async function generateMetadata({
  params,
}: PageProps<"/lp/[providerSlug]/[metroSlug]">): Promise<Metadata> {
  const { providerSlug, metroSlug } = await params;
  const result = await getLandingPage(providerSlug, metroSlug);
  if (!result) return {};

  return {
    title: `ILIT in ${result.provider.city} — ${result.lp.targetMetroName}`,
    // Paid-traffic-only, noindex — Section 3: avoids duplicate-content risk
    // and never competes with the real PDP's ranking.
    robots: { index: false, follow: false },
  };
}

export default async function SemLandingPage({
  params,
  searchParams,
}: PageProps<"/lp/[providerSlug]/[metroSlug]">) {
  const { providerSlug, metroSlug } = await params;
  const sp = await searchParams;
  const result = await getLandingPage(providerSlug, metroSlug);
  if (!result) notFound();
  const { provider, lp } = result;

  const sent = sp.sent === "1";
  const confirmed = sp.confirmed === "1";
  const error = sp.error === "invalid_email" || sp.error === "missing_fields" ? sp.error : null;
  const returnPath = `/lp/${provider.slug}/${lp.urlSlug}`;
  // SEM pages are exclusively paid-traffic entry points (Section 3) — UTM
  // capture matters more here than anywhere else on the site, so this was a
  // real gap: ContactForm was passed an empty utm object below until now.
  const utm = {
    source: typeof sp.utm_source === "string" ? sp.utm_source : undefined,
    medium: typeof sp.utm_medium === "string" ? sp.utm_medium : undefined,
    campaign: typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined,
  };

  const settings = await db.siteSetting.findUnique({ where: { id: 1 } });
  const whyIlitBlurb = settings?.semHeroBlurb || "";

  const { offersVideoConsult, offersPhoneConsult } = provider;
  const ctaLine =
    offersVideoConsult && offersPhoneConsult
      ? `Have questions? Talk to ${provider.practiceName} by phone or video.`
      : offersVideoConsult
        ? `Have questions? Talk to ${provider.practiceName} by video consultation.`
        : offersPhoneConsult
          ? `Have questions? Talk to ${provider.practiceName} by phone.`
          : null;

  return (
    <>
      <PageViewTracker providerId={provider.id} path={returnPath} utm={utm} />
      <div className="bg-bg-alt px-6 py-9 text-center sm:px-10">
        <h1 className="mb-2 text-2xl font-extrabold sm:text-[26px]">
          ILIT Available in {provider.city} — a Short Flight from {lp.targetMetroName}
        </h1>
        <p className="mx-auto mb-3.5 max-w-xl text-base font-semibold">
          Complete allergy treatment in a few office visits, instead of the
          years of regular appointments for traditional allergy shots.
        </p>
        {whyIlitBlurb && (
          <p className="mx-auto mb-3.5 max-w-lg text-sm text-muted">{whyIlitBlurb}</p>
        )}
        <p className="mx-auto mb-4 max-w-lg text-sm">
          {provider.practiceName} in {provider.city}, {provider.state}, is a
          leading innovator in ILIT and works with patients from{" "}
          {lp.targetMetroName}.
        </p>
        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {provider.foundingMember && <Badge variant="founder">Founding Member</Badge>}
          {provider.tier !== "FREE_CLAIMED" && <Badge variant="verified">Verified</Badge>}
          {offersVideoConsult && <Badge variant="consult">Video Consults</Badge>}
          {offersPhoneConsult && <Badge variant="consult">Phone Consults</Badge>}
        </div>
        {ctaLine && <p className="mb-3 text-sm font-semibold">{ctaLine}</p>}
        <div className="flex flex-wrap justify-center gap-2.5">
          <a
            href="#contact-form"
            className="rounded bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
          >
            Contact This Practice
          </a>
          {provider.phone && (
            <span className="rounded border border-foreground px-5 py-2.5 text-sm font-semibold">
              📞 <PhoneLink phone={provider.phone} providerId={provider.id} />
            </span>
          )}
        </div>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-lg font-bold">What is ILIT?</h2>
        <p className="text-sm text-foreground/80">{WHAT_IS_ILIT_COPY}</p>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-lg font-bold">Does This Sound Familiar?</h2>
        <div className="flex flex-wrap gap-4">
          {SYMPTOMS.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span>{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-lg font-bold">
          Comparing ILIT to Other Allergy Treatments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr>
                <th></th>
                <th className="pb-2 text-left text-[11px] font-semibold text-muted uppercase">ILIT</th>
                <th className="pb-2 text-left text-[11px] font-semibold text-muted uppercase">SCIT</th>
                <th className="pb-2 text-left text-[11px] font-semibold text-muted uppercase">SLIT</th>
              </tr>
            </thead>
            <tbody>
              {TREATMENT_COMPARISON.map((row) => (
                <tr key={row.label} className="border-t border-line/60">
                  <td className="py-2 pr-4 text-muted">{row.label}</td>
                  <td className="py-2 pr-4">{row.ilit}</td>
                  <td className="py-2 pr-4">{row.scit}</td>
                  <td className="py-2">{row.slit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden rounded bg-bg-alt sm:w-40">
            {provider.photoUrl && (
              <Image src={provider.photoUrl} alt={provider.practiceName} fill className="object-cover" />
            )}
          </div>
          <div className="flex-1">
            <div className="mb-1.5 text-base font-bold">
              About {provider.practiceName}
            </div>
            <p className="text-sm text-foreground/80">{provider.extendedBio ?? provider.shortBio}</p>
          </div>
        </div>
        <Link
          href={`/find-a-provider/${provider.slug}`}
          className="mt-3.5 inline-block text-sm font-semibold"
        >
          View full provider profile, contact &amp; location →
        </Link>
      </div>

      {reviewsWouldShow(provider) && (
        <div className="border-b border-line px-6 py-8 sm:px-10">
          <PatientReviews provider={provider} />
        </div>
      )}

      {lp.travelNarrative && (
        <div className="border-b border-line px-6 py-8 sm:px-10">
          <div className="rounded border border-badge-verified-bg bg-badge-verified-bg/20 p-4.5">
            <h3 className="mb-2 text-base font-bold">
              Traveling from {lp.targetMetroName}
            </h3>
            <p className="text-sm text-muted">{lp.travelNarrative}</p>
          </div>
        </div>
      )}

      <div id="contact-form" className="px-6 py-8 sm:px-10">
        <div className="max-w-md rounded border border-line p-5">
          {sent || confirmed ? (
            <LeadStatusMessage status={sent ? "sent" : "confirmed"} practiceName={provider.practiceName} />
          ) : (
            <>
              {provider.phone && (
                <div className="mb-2 text-sm">
                  📞{" "}
                  <PhoneLink phone={provider.phone} className="text-[#1c5ea8]" providerId={provider.id} />
                </div>
              )}
              {provider.website && (
                <div className="mb-3 text-sm">
                  🌐{" "}
                  <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-[#1c5ea8]">
                    {provider.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
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
                returnPath={returnPath}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
