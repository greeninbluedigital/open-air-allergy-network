"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/actions";
import { MessageField } from "@/components/MessageField";
import { HoneypotField } from "@/components/HoneypotField";
import { US_PHONE_PATTERN, US_PHONE_TITLE } from "@/lib/phone";
import { HEALTH_DATA_STATE_LIST } from "@/lib/healthDataStates";
import { EmailPracticeButton } from "@/components/pdp/EmailPracticeButton";

/**
 * The patient contact form. It opens with one compact, required question:
 * does the visitor live in, or are they now in, a consumer health data state
 * (healthDataStates.ts)? "Yes" swaps the fields for the "Email {practice}"
 * button before anything is sent, so OAAN never collects a message from
 * there. The server checks the answer again (src/lib/actions.ts), which also
 * covers visitors without JavaScript.
 */
export function ContactForm({
  providerId,
  providerSlug,
  practiceName,
  email,
  utm,
  returnPath,
}: {
  providerId: string;
  providerSlug: string;
  practiceName: string;
  /** The practice's published address, for the email button on "Yes". */
  email: string;
  utm: { source?: string; medium?: string; campaign?: string };
  /** Where to redirect back to after submit — the PDP by default, but a SEM
   * landing page passes its own path so a paid-ad visitor isn't sent
   * somewhere else (Section 4's post-submission UX standard). */
  returnPath?: string;
}) {
  const [inHealthDataState, setInHealthDataState] = useState<"yes" | "no" | null>(null);

  return (
    <form action={submitContactMessage} className="mt-1">
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="providerSlug" value={providerSlug} />
      <input type="hidden" name="returnPath" value={returnPath ?? `/find-an-ilit-provider/${providerSlug}`} />
      <input type="hidden" name="utmSource" value={utm.source ?? ""} />
      <input type="hidden" name="utmMedium" value={utm.medium ?? ""} />
      <input type="hidden" name="utmCampaign" value={utm.campaign ?? ""} />
      <HoneypotField />

      {/* One row, so the form stays short on a phone. */}
      <fieldset className="mb-2.5 flex items-center justify-between gap-2 rounded border border-line px-2 py-1.5">
        <legend className="sr-only">Your location</legend>
        <span className="text-[11.5px] leading-tight text-muted">Do you live in or are you now in {HEALTH_DATA_STATE_LIST}?</span>
        <span className="flex shrink-0 gap-2.5 text-xs">
          {(["yes", "no"] as const).map((value) => (
            <label key={value} className="flex items-center gap-1">
              <input
                type="radio"
                name="healthDataState"
                value={value}
                required
                checked={inHealthDataState === value}
                onChange={() => setInHealthDataState(value)}
              />
              {value === "yes" ? "Yes" : "No"}
            </label>
          ))}
        </span>
      </fieldset>

      {inHealthDataState === "yes" ? (
        <>
          <p className="mb-2 text-[11.5px] leading-snug text-muted">
            Health privacy laws in those states mean we can&apos;t pass along messages from there. Email the practice
            directly instead.
          </p>
          <EmailPracticeButton email={email} practiceName={practiceName} providerId={providerId} />
        </>
      ) : (
        <ContactFields />
      )}
    </form>
  );
}

/** Name, email, phone and message, the send button and the Terms line. */
function ContactFields() {
  return (
    <>
      <div className="mb-2.5 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-0.5 block text-[11.5px] text-muted" htmlFor="firstName">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            className="w-full rounded border border-line px-2 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[11.5px] text-muted" htmlFor="lastName">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            className="w-full rounded border border-line px-2 py-1.5 text-xs"
          />
        </div>
      </div>
      <div className="mb-2.5">
        <label className="mb-0.5 block text-[11.5px] text-muted" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded border border-line px-2 py-1.5 text-xs"
        />
      </div>
      <div className="mb-2.5">
        <label className="mb-0.5 block text-[11.5px] text-muted" htmlFor="phone">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          pattern={US_PHONE_PATTERN}
          title={US_PHONE_TITLE}
          className="w-full rounded border border-line px-2 py-1.5 text-xs"
        />
      </div>

      <MessageField />

      <button
        type="submit"
        className="mt-1 block w-full rounded bg-action py-2.5 text-center text-sm font-semibold text-white hover:bg-action-hover"
      >
        Send Message
      </button>
      {/* Agreement at the point of action, so the Terms (including any
          arbitration clause) bind the sender; see docs/legal-facts.md,
          question 11b. The links open in a new tab so a half-typed message
          isn't lost. */}
      <p className="mt-1.5 text-center text-[11.5px] leading-snug text-muted">
        We never sell your information. By sending, you agree to our{" "}
        <a href="/legal/terms-and-conditions" target="_blank" rel="noopener" className="font-semibold text-sage hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/legal/privacy-notice" target="_blank" rel="noopener" className="font-semibold text-sage hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </>
  );
}
