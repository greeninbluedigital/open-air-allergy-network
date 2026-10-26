import type { Metadata } from "next";
import Link from "next/link";
import { DataLayerEvent } from "@/components/analytics/DataLayerEvent";
import { FindOrJoinRow } from "@/components/FindOrJoinRow";
import { submitGeneralInquiry } from "@/lib/actions";
import { HoneypotField } from "@/components/HoneypotField";
import { MessageField } from "@/components/MessageField";
import { FORM_ERROR_MESSAGES, parseFormError } from "@/lib/forms";
import { GENERAL_INQUIRY_REASONS } from "@/lib/generalInquiry";

export const metadata: Metadata = {
  title: "About",
  description: "Open Air Allergy Network connects people searching for ILIT (intralymphatic immunotherapy) with the practices that offer it.",
  alternates: { canonical: "/about" },
};

const OFFERINGS = [
  {
    title: "A directory of ILIT allergy providers",
    text: "Search by zip code or browse by state to find allergists who offer ILIT, with practice details and a way to reach them.",
    href: "/find-an-ilit-provider",
    cta: "Find a Provider",
  },
  {
    title: "Plain-language guides to ILIT allergy treatment",
    text: "How intralymphatic immunotherapy (ILIT) works, what the research shows, and how it compares with allergy shots and allergy drops.",
    href: "/learn-about-ilit",
    cta: "Learn About ILIT",
  },
  {
    title: "Allergy guides",
    text: "Articles on allergens, symptoms, allergy seasons and treatment options, each fact linked to its source.",
    href: "/blog",
    cta: "Read the Blog",
  },
];

export default async function AboutPage({ searchParams }: PageProps<"/about">) {
  const sp = await searchParams;
  const sent = sp.sent === "1";
  const error = parseFormError(sp.error);
  const utm = {
    source: typeof sp.utm_source === "string" ? sp.utm_source : "",
    medium: typeof sp.utm_medium === "string" ? sp.utm_medium : "",
    campaign: typeof sp.utm_campaign === "string" ? sp.utm_campaign : "",
  };

  return (
    <>
      <div className="px-6 pt-8 sm:px-10">
        <h1 className="mb-2.5 text-3xl font-extrabold">About Open Air Allergy Network</h1>
        <p className="max-w-xl text-sm text-muted">
          Open Air Allergy Network connects people searching for ILIT
          (intralymphatic immunotherapy) with the practices that offer it, and helps those practices reach
          patients actively looking for this specific treatment.
        </p>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-xl font-bold">Our Mission</h2>
        <p className="max-w-2xl text-sm text-foreground/80">
          ILIT is still hard to find. There&apos;s no organized way for a
          patient to know which nearby practices offer it, or for a practice
          offering it to reach the patients specifically looking for it.
          Open Air Allergy Network exists to close that gap: a directory
          built around this one treatment, with every listed practice
          confirmed to offer ILIT, so patients can find real options and
          practices can reach the patients already searching for what they
          offer.
        </p>
      </div>

      <div id="contact" className="border-b border-line px-6 py-8 sm:px-10">
        <div className="max-w-lg rounded border border-sand-line bg-sand p-6">
          <h2 className="mb-1 text-xl font-bold">Contact</h2>
          <p className="mb-5 text-sm text-muted">
            For press, partnerships, accessibility requests, or anything not
            covered elsewhere.
          </p>

          <div>
            {sent ? (
              <p className="text-sm font-semibold text-sage">
                <DataLayerEvent event="oaan_general_inquiry_submit" />
                Thanks for reaching out! We&apos;ll be in touch soon.
              </p>
            ) : (
              <form action={submitGeneralInquiry}>
                {error && (
                  <p className="mb-3.5 rounded border border-warning-bg bg-warning-bg/40 px-3 py-2 text-xs text-warning-text">
                    {FORM_ERROR_MESSAGES[error]}
                  </p>
                )}
                <input type="hidden" name="utmSource" value={utm.source} />
                <input type="hidden" name="utmMedium" value={utm.medium} />
                <input type="hidden" name="utmCampaign" value={utm.campaign} />
                <HoneypotField />

                <div className="mb-3.5 grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1 block text-xs text-muted" htmlFor="firstName">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      className="w-full rounded border border-line bg-white px-2.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted" htmlFor="lastName">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      required
                      className="w-full rounded border border-line bg-white px-2.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-3.5">
                  <label className="mb-1 block text-xs text-muted" htmlFor="email">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded border border-line bg-white px-2.5 py-2 text-sm"
                  />
                </div>

                <div className="mb-3.5">
                  <label className="mb-1 block text-xs text-muted" htmlFor="reason">
                    Reason for Contact *
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    required
                    defaultValue="General Inquiry"
                    className="w-full rounded border border-line bg-white px-2.5 py-2 text-sm"
                  >
                    {GENERAL_INQUIRY_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <MessageField label="Message *" variant="default" />

                <button
                  type="submit"
                  className="rounded bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-bg-alt px-6 py-8 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">What You&apos;ll Find Here</h2>
        <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {OFFERINGS.map((o) => (
            <div key={o.title}>
              <h3 className="mb-1.5 text-base font-bold">{o.title}</h3>
              <p className="mb-2 text-sm text-foreground/80">{o.text}</p>
              <Link href={o.href} className="text-sm font-semibold text-sage hover:underline">
                {o.cta} →
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm text-foreground/80">
          Open Air Allergy Network is a directory, not a medical practice, so
          we don&apos;t provide medical care or medical advice. Each practice
          page shows how to reach the practice and what it offers, and an
          &ldquo;ILIT Confirmed&rdquo; badge means we contacted the practice
          directly to confirm it offers ILIT.
        </p>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-xl font-bold">Your Privacy</h2>
        <p className="max-w-2xl text-sm text-foreground/80">
          We never sell visitor data. When you send a message to a practice
          through this site, it goes to that practice so they can answer you,
          and we don&apos;t send you marketing emails. The details are in our{" "}
          <Link href="/legal/privacy-notice" className="font-semibold text-sage hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">How We Create Our Content</h2>
        <div className="grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-base font-bold">Every fact has a source</h3>
            <p className="text-sm text-foreground/80">
              Our articles link each fact to a named source, such as the AAAAI,
              ACAAI, AAFA, CDC, MedlinePlus or a published study.
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold">Checked before publishing</h3>
            <p className="text-sm text-foreground/80">
              We use AI tools to help research and draft. Every article is then
              checked against its sources and reviewed by an editor before it
              goes live.
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold">Not medical advice</h3>
            <p className="text-sm text-foreground/80">
              Our content is general information. Talk with an allergist about
              your own care, and see our{" "}
              <Link href="/legal/medical-disclaimer" className="font-semibold text-sage hover:underline">
                Medical Disclaimer
              </Link>
              .
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold">Spot an error?</h3>
            <p className="text-sm text-foreground/80">
              Tell us with the{" "}
              <a href="#contact" className="font-semibold text-sage hover:underline">
                contact form
              </a>{" "}
              above and choose &ldquo;Content Correction.&rdquo; We review every
              report and update the article when we got something wrong.
            </p>
          </div>
        </div>
      </div>

      <FindOrJoinRow searchHeading="Looking for a provider instead?" origin="about_bottom" />
    </>
  );
}
