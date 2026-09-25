import { submitContactMessage } from "@/lib/actions";
import { MessageField } from "@/components/MessageField";
import { HoneypotField } from "@/components/HoneypotField";
import { US_PHONE_PATTERN, US_PHONE_TITLE } from "@/lib/phone";

export function ContactForm({
  providerId,
  providerSlug,
  utm,
  returnPath,
}: {
  providerId: string;
  providerSlug: string;
  utm: { source?: string; medium?: string; campaign?: string };
  /** Where to redirect back to after submit — the PDP by default, but a SEM
   * landing page passes its own path so a paid-ad visitor isn't sent
   * somewhere else (Section 4's post-submission UX standard). */
  returnPath?: string;
}) {
  return (
    <form action={submitContactMessage} className="mt-1">
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="providerSlug" value={providerSlug} />
      <input type="hidden" name="returnPath" value={returnPath ?? `/find-an-ilit-provider/${providerSlug}`} />
      <input type="hidden" name="utmSource" value={utm.source ?? ""} />
      <input type="hidden" name="utmMedium" value={utm.medium ?? ""} />
      <input type="hidden" name="utmCampaign" value={utm.campaign ?? ""} />
      <HoneypotField />

      <div className="mb-2.5">
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
      <div className="mb-2.5">
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
    </form>
  );
}
