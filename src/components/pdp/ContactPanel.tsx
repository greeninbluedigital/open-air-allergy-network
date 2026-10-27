import { Icon } from "@/components/Icon";
import { PhoneLink } from "@/components/PhoneLink";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ContactForm } from "@/components/pdp/ContactForm";
import { EmailPracticeButton } from "@/components/pdp/EmailPracticeButton";
import { LeadStatusMessage, LeadErrorMessage } from "@/components/pdp/LeadStatusMessage";
import { displayAddress, hasStreetAddress } from "@/lib/address";
import type { FormError } from "@/lib/forms";
import type { ContactMode } from "@/lib/tiers";

/**
 * "Contact {practice}" panel shared by the provider page and SEM landing
 * pages, so the two stay identical: the contact form (or its success
 * message) or the email button, per contactMode (src/lib/tiers.ts), then
 * phone and website, then the address linking to Google Maps (just the area,
 * unlinked, for a practice with no public street address). Every lead
 * action is tracked (docs/analytics.md).
 */
export function ContactPanel({
  provider,
  mode,
  publicEmail,
  sent,
  confirmed,
  error,
  utm,
  returnPath,
  formLocation,
  className = "",
}: {
  provider: {
    id: string;
    slug: string;
    practiceName: string;
    phone: string | null;
    website: string | null;
    address: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zip: string;
  };
  /** Form, email button or neither (contactMode). */
  mode: ContactMode;
  /** The Notification Email only when the practice publishes it (tiers.ts
   * publicEmail), for the email button. Never a private address. */
  publicEmail: string | null;
  sent: boolean;
  confirmed: boolean;
  error: FormError | null;
  utm: { source?: string; medium?: string; campaign?: string };
  returnPath: string;
  formLocation: "provider_page" | "sem_landing_page";
  /** Extra classes, e.g. the provider page's sticky positioning. */
  className?: string;
}) {
  const fullAddress = displayAddress(provider);

  return (
    <div className={`rounded border border-line border-t-4 border-t-action bg-background p-4.5 ${className}`}>
      <h2 className="mb-3 text-base font-bold">Contact {provider.practiceName}</h2>

      {sent || confirmed ? (
        <LeadStatusMessage
          status={sent ? "sent" : "confirmed"}
          practiceName={provider.practiceName}
          providerId={provider.id}
          formLocation={formLocation}
        />
      ) : (
        mode === "form" && (
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
              practiceName={provider.practiceName}
              email={publicEmail}
              utm={utm}
              returnPath={returnPath}
            />
          </>
        )
      )}
      {mode === "email" && publicEmail && !sent && !confirmed && (
        <EmailPracticeButton email={publicEmail} practiceName={provider.practiceName} providerId={provider.id} />
      )}

      {(provider.phone || provider.website) && (
        <div className="mt-3.5 border-t border-line pt-3.5">
          {provider.phone && (
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Icon name="phone" className="h-4 w-4 text-muted" />
              <PhoneLink
                phone={provider.phone}
                className="text-[#1c5ea8]"
                providerId={provider.id}
                providerName={provider.practiceName}
              />
            </div>
          )}
          {provider.website && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="globe" className="h-4 w-4 text-muted" />
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

      <div className="mt-3.5 flex items-start gap-2 border-t border-line pt-3.5 text-sm">
        <Icon name="map-pin" className="mt-0.5 h-4 w-4 text-muted" />
        {hasStreetAddress(provider) ? (
          <TrackedLink
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
            type="ADDRESS_CLICK"
            providerId={provider.id}
            providerName={provider.practiceName}
            className="text-[#1c5ea8] hover:underline"
          >
            {fullAddress}
          </TrackedLink>
        ) : (
          <span>{fullAddress}</span>
        )}
      </div>
    </div>
  );
}
