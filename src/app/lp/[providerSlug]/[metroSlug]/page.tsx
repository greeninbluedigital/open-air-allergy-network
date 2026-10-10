import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge, practiceBadges } from "@/components/Badge";
import { PhoneLink } from "@/components/PhoneLink";
import { ContactPanel } from "@/components/pdp/ContactPanel";
import { StickyContactBar } from "@/components/pdp/StickyContactBar";
import { ProfileLink } from "@/components/analytics/ProfileLink";
import { ComparingIlit, IsIlitRightForMe, WhatIsIlit } from "@/components/ilit/IlitModules";
import { PatientReviews, reviewsWouldShow } from "@/components/PatientReviews";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { parseFormError } from "@/lib/forms";
import { contactMode } from "@/lib/tiers";
import { visitorInHealthDataState } from "@/lib/visitorLocation";


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
    // `absolute` skips the site-name template — noindexed, so there's no
    // SERP truncation risk, but kept consistent with the other dynamic
    // detail pages (PDP, Article) rather than a one-off exception.
    title: { absolute: `ILIT in ${result.provider.city} for ${result.lp.targetMetroName} Patients` },
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
  // ?location=restricted: the server turned a "Yes" answer away (visitors
  // without JavaScript), so the page shows the email button.
  const visitorInHealthState = sp.location === "restricted" || (await visitorInHealthDataState());
  const confirmed = sp.confirmed === "1";
  const error = parseFormError(sp.error);
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
  // Points to the form (there's no video call on the page itself).
  const consultBy =
    offersVideoConsult && offersPhoneConsult ? "phone or video" : offersVideoConsult ? "video" : offersPhoneConsult ? "phone" : null;
  const ctaLine = consultBy
    ? `Have questions? Send a message to schedule a consult with ${provider.practiceName} by ${consultBy}.`
    : null;

  return (
    <>
      <PageViewTracker providerId={provider.id} providerName={provider.practiceName} path={returnPath} utm={utm} />
      <div className="bg-bg-alt px-6 py-9 text-center sm:px-10">
        <h1 className="mb-2 text-2xl font-extrabold sm:text-[26px]">
          A Few Trips to {provider.city} Instead of Years of Allergy Shots
        </h1>
        <p className="mx-auto mb-3.5 max-w-xl text-base font-semibold">
          ILIT (intralymphatic immunotherapy) usually takes a few monthly visits, instead of years of regular
          appointments for allergy shots.
        </p>
        {whyIlitBlurb && (
          <p className="mx-auto mb-3.5 max-w-lg text-sm text-muted">{whyIlitBlurb}</p>
        )}
        <p className="mx-auto mb-4 max-w-lg text-sm">
          {provider.practiceName} in {provider.city}, {provider.state} offers ILIT and welcomes patients traveling
          from {lp.targetMetroName}.
        </p>
        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {practiceBadges(provider).map((b) => (
            <Badge key={b.label} variant={b.variant}>
              {b.label}
            </Badge>
          ))}
          {offersVideoConsult && <Badge variant="consult">Video Consults</Badge>}
          {offersPhoneConsult && <Badge variant="consult">Phone Consults</Badge>}
        </div>
        {ctaLine && <p className="mb-3 text-sm font-semibold">{ctaLine}</p>}
        <div className="flex flex-wrap justify-center gap-2.5">
          <a
            href="#contact-form"
            data-cta="sem_hero_send_message"
            className="rounded bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
          >
            Send a Message
          </a>
          {provider.phone && (
            <span className="rounded border border-foreground px-5 py-2.5 text-sm font-semibold">
              📞 <PhoneLink phone={provider.phone} providerId={provider.id} providerName={provider.practiceName} />
            </span>
          )}
        </div>
      </div>

      {/* Same modules as Learn About ILIT (src/components/ilit/IlitModules.tsx),
          but every call to action points to this practice's contact form:
          paid traffic stays on this page rather than going to the directory. */}
      <section className="border-b border-line px-6 py-10 sm:px-10">
        <WhatIsIlit />
      </section>

      <section className="border-b border-line bg-bg-alt px-6 py-10 sm:px-10">
        <IsIlitRightForMe
          cta={
            <>
              <p className="mt-1 mb-3 text-sm font-semibold">
                Ask {provider.practiceName} whether ILIT is a good fit for your allergies.
              </p>
              <a
                href="#contact-form"
                data-cta="sem_right_for_me"
                className="inline-block rounded bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
              >
                Send a Message
              </a>
            </>
          }
        />
      </section>

      <section className="border-b border-line px-6 py-10 sm:px-10">
        <ComparingIlit
          cta={
            <>
              Discuss your treatment options with {provider.practiceName}.{" "}
              <a href="#contact-form" data-cta="sem_comparison_summary" className="font-semibold text-sage hover:underline">
                Send a message →
              </a>
            </>
          }
        />
      </section>

      <section className="border-b border-line bg-bg-alt px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden rounded bg-bg-alt sm:w-40">
            {provider.photoUrl && (
              <Image src={provider.photoUrl} alt={provider.practiceName} fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-bold">About {provider.practiceName}</h2>
            <p className="text-sm whitespace-pre-line text-foreground/80">{provider.extendedBio ?? provider.shortBio}</p>
            <ProfileLink
              href={`/find-an-ilit-provider/${provider.slug}`}
              providerId={provider.id}
              providerName={provider.practiceName}
              className="mt-3.5 inline-block text-sm font-semibold text-sage hover:underline"
            >
              View full provider profile, contact &amp; location →
            </ProfileLink>
          </div>
        </div>
      </section>

      {reviewsWouldShow(provider) && (
        <section className="border-b border-line px-6 py-10 sm:px-10">
          <PatientReviews provider={provider} />
        </section>
      )}

      {lp.travelNarrative && (
        <section className="border-b border-line px-6 py-10 sm:px-10">
          <div className="rounded border border-badge-verified-bg bg-badge-verified-bg/20 p-4.5">
            <h3 className="mb-2 text-base font-bold">Traveling from {lp.targetMetroName}</h3>
            <p className="text-sm whitespace-pre-line text-muted">{lp.travelNarrative}</p>
          </div>
        </section>
      )}

      <section id="contact-form" className="scroll-mt-4 bg-bg-alt px-6 py-10 sm:px-10">
        {/* The same panel as the provider page (form, then phone, website,
            and the tracked map link). */}
        <ContactPanel
          provider={provider}
          mode={contactMode(provider, visitorInHealthState)}
          email={provider.notificationEmail?.trim() || null}
          sent={sent}
          confirmed={confirmed}
          error={error}
          utm={utm}
          returnPath={returnPath}
          formLocation="sem_landing_page"
          className="mx-auto max-w-md"
        />
      </section>
      {!sent && !confirmed && <StickyContactBar targetId="contact-form" />}
    </>
  );
}
