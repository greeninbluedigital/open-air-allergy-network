import Link from "next/link";
import type { Metadata } from "next";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { submitGeneralInquiry } from "@/lib/actions";
import { HoneypotField } from "@/components/HoneypotField";
import { MessageField } from "@/components/MessageField";
import { FORM_ERROR_MESSAGES, parseFormError } from "@/lib/forms";
import { GENERAL_INQUIRY_REASONS } from "@/lib/generalInquiry";

export const metadata: Metadata = {
  title: "About",
  description: "Open Air Allergy Network connects patients searching for ILIT with practices that offer it.",
  alternates: { canonical: "/about" },
};

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
          Open Air Allergy Network connects patients searching for ILIT with
          the practices that offer it — and helps those practices reach
          patients actively looking for this specific treatment.
        </p>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-xl font-bold">Our Mission</h2>
        <p className="max-w-2xl text-sm text-foreground/80">
          ILIT is a fast-growing treatment, but it&apos;s still hard to find
          — there&apos;s no organized way for a patient to know which nearby
          practices offer it, or for a practice offering it to reach the
          patients specifically looking for it. Open Air Allergy Network
          exists to close that gap: a directory built around this one
          treatment, with every listed practice personally verified, so
          patients can find real options and practices can reach the
          patients already searching for what they offer.
        </p>
      </div>

      <div id="contact" className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-1 text-xl font-bold">Contact</h2>
        <p className="mb-5 text-sm text-muted">
          For press, partnerships, accessibility requests, or anything not
          covered elsewhere.
        </p>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="max-w-md flex-1">
            {sent ? (
              <p className="text-sm font-semibold text-sage">
                Thanks for reaching out — we&apos;ll be in touch soon.
              </p>
            ) : (
              <form action={submitGeneralInquiry}>
                {error && (
                  <p className="mb-3.5 rounded border border-badge-founder-bg bg-badge-founder-bg/40 px-3 py-2 text-xs text-badge-founder-text">
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
                      className="w-full rounded border border-line px-2.5 py-2 text-sm"
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
                      className="w-full rounded border border-line px-2.5 py-2 text-sm"
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
                    className="w-full rounded border border-line px-2.5 py-2 text-sm"
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
                    className="w-full rounded border border-line px-2.5 py-2 text-sm"
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

          <div className="text-sm text-muted md:w-64 md:shrink-0">
            <span className="font-semibold text-foreground">
              Not what you&apos;re looking for?
            </span>
            <br />
            Practices interested in joining should use the{" "}
            <Link href="/for-practices" className="font-semibold text-foreground/80">
              For Practices
            </Link>{" "}
            page instead. Patients looking to contact a specific provider can
            do so directly from that provider&apos;s profile.
          </div>
        </div>
      </div>

      <div className="mx-6 my-7 grid grid-cols-1 gap-5 sm:mx-10 md:grid-cols-[2fr_1fr]">
        <div className="rounded bg-action p-6 text-white">
          <div className="mb-4 text-base font-semibold">
            Looking for a provider instead?
          </div>
          <ZipSearchForm variant="dark" />
        </div>
        <div className="flex flex-col items-start justify-between gap-4 rounded bg-dark-panel p-6 text-white">
          <div className="text-base font-semibold">
            Are you a provider? Join the network.
          </div>
          <Link
            href="/for-practices"
            className="rounded border border-white px-4 py-2.5 text-sm whitespace-nowrap"
          >
            For Practices →
          </Link>
        </div>
      </div>
    </>
  );
}
