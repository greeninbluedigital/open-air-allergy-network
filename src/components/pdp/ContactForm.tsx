import { submitContactMessage } from "@/lib/actions";
import { MessageField } from "./MessageField";

export function ContactForm({
  providerId,
  providerSlug,
  utm,
}: {
  providerId: string;
  providerSlug: string;
  utm: { source?: string; medium?: string; campaign?: string };
}) {
  return (
    <form action={submitContactMessage} className="mt-1">
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="providerSlug" value={providerSlug} />
      <input type="hidden" name="utmSource" value={utm.source ?? ""} />
      <input type="hidden" name="utmMedium" value={utm.medium ?? ""} />
      <input type="hidden" name="utmCampaign" value={utm.campaign ?? ""} />

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
          className="w-full rounded border border-line px-2 py-1.5 text-xs"
        />
      </div>

      <MessageField />

      <button
        type="submit"
        className="mt-1 block w-full rounded bg-foreground py-2.5 text-center text-sm font-semibold text-background"
      >
        Send Message
      </button>
    </form>
  );
}
