import Link from "next/link";
import type { Metadata } from "next";
import { PRACTICE_LEAD_REASONS } from "@/lib/practiceLead";
import { HoneypotField } from "@/components/HoneypotField";
import { MessageField } from "@/components/MessageField";
import { FORM_ERROR_MESSAGES, parseFormError } from "@/lib/forms";
import { submitPracticeLead } from "@/lib/actions";
import { US_STATES } from "@/lib/states";
import { US_PHONE_PATTERN, US_PHONE_TITLE } from "@/lib/phone";

export const metadata: Metadata = {
  title: "For Practices",
  description: "Join a growing network of ILIT providers. Tell us about your practice and we'll follow up.",
  alternates: { canonical: "/for-practices" },
};

export default async function ForPracticesPage({
  searchParams,
}: PageProps<"/for-practices">) {
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
      <div className="bg-sand px-6 py-11 text-center sm:px-10">
        <h1 className="mb-2.5 text-3xl font-extrabold">
          Join a Growing Network of ILIT Providers
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-foreground/80">
          Reach patients actively searching for ILIT, and connect with a
          network built around this treatment specifically. Tell us a bit
          about your practice and we&apos;ll follow up.
        </p>
      </div>

      <div id="contact-form" className="px-6 py-10 sm:px-10">
        <p className="mx-auto mb-5 max-w-lg text-center text-sm font-bold">
          Looking for ILIT allergy treatment?{" "}
          <Link href="/find-an-ilit-provider" className="text-sage hover:underline">
            Find a provider near you →
          </Link>
        </p>
        <div className="mx-auto max-w-lg rounded border border-line p-6">
          {sent ? (
            <p className="text-center text-sm font-semibold text-sage">
              Thanks for reaching out — we&apos;ll be in touch soon.
            </p>
          ) : (
            <form action={submitPracticeLead}>
              {error && (
                <p className="mb-3.5 rounded border border-badge-founder-bg bg-badge-founder-bg/40 px-3 py-2 text-xs text-badge-founder-text">
                  {FORM_ERROR_MESSAGES[error]}
                </p>
              )}
              <HoneypotField />
              <input type="hidden" name="utmSource" value={utm.source} />
              <input type="hidden" name="utmMedium" value={utm.medium} />
              <input type="hidden" name="utmCampaign" value={utm.campaign} />

              <div className="mb-3.5">
                <label className="mb-1 block text-xs text-muted" htmlFor="reason">
                  Reason for Contact *
                </label>
                <select
                  id="reason"
                  name="reason"
                  required
                  defaultValue=""
                  className="w-full rounded border border-line px-2.5 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select a reason
                  </option>
                  {PRACTICE_LEAD_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="mb-1 block text-xs text-muted" htmlFor="practiceName">
                  Practice Name *
                </label>
                <input
                  id="practiceName"
                  name="practiceName"
                  autoComplete="organization"
                  required
                  className="w-full rounded border border-line px-2.5 py-2 text-sm"
                />
              </div>

              <div className="mb-3.5">
                <label className="mb-1 block text-xs text-muted" htmlFor="website">
                  Practice Website (optional)
                </label>
                <input
                  id="website"
                  name="website"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="www.yourpractice.com"
                  maxLength={300}
                  className="w-full rounded border border-line px-2.5 py-2 text-sm"
                />
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

              <div className="mb-3.5 grid grid-cols-[2fr_1fr] gap-3.5">
                <div>
                  <label className="mb-1 block text-xs text-muted" htmlFor="phone">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    pattern={US_PHONE_PATTERN}
                    title={US_PHONE_TITLE}
                    required
                    className="w-full rounded border border-line px-2.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted" htmlFor="phoneExt">
                    Ext.
                  </label>
                  <input
                    id="phoneExt"
                    name="phoneExt"
                    autoComplete="tel-extension"
                    className="w-full rounded border border-line px-2.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mb-3.5 grid grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1 block text-xs text-muted" htmlFor="city">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    required
                    className="w-full rounded border border-line px-2.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted" htmlFor="state">
                    State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    autoComplete="address-level1"
                    required
                    defaultValue=""
                    className="w-full rounded border border-line px-2.5 py-2 text-sm"
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {US_STATES.map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <MessageField name="comments" label="Comments (optional)" required={false} variant="default" />

              <button
                type="submit"
                className="block w-full rounded bg-action py-3 text-center text-sm font-semibold text-white hover:bg-action-hover"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
