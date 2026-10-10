import { PhoneLink } from "@/components/PhoneLink";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ContactForm } from "@/components/pdp/ContactForm";
import { EmailPracticeButton } from "@/components/pdp/EmailPracticeButton";
import { LeadStatusMessage, LeadErrorMessage } from "@/components/pdp/LeadStatusMessage";
import type { FormError } from "@/lib/forms";
import type { ContactMode } from "@/lib/tiers";

export function formatAddress(provider: { address: string; addressLine2: string | null }): string {
  return provider.addressLine2 ? `${provider.address}, ${provider.addressLine2}` : provider.address;
}

/**
 * "Contact {practice}" panel shared by the provider page and SEM landing
 * pages, so the two stay identical: the contact form (or its success
 * message) or the email button, per contactMode (src/lib/tiers.ts), then
 * phone and website, then the address linking to Google Maps. Every lead
 * action is tracked (docs/analytics.md).
 */
export function ContactPanel({
  provider,
  mode,
  email,
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
  /** The practice's published address (Notification Email); set whenever mode isn't "none". */
  email: string | null;
  sent: boolean;
  confirmed: boolean;
  error: FormError | null;
  utm: { source?: string; medium?: string; campaign?: string };
  returnPath: string;
  formLocation: "provider_page" | "sem_landing_page";
  /** Extra classes, e.g. the provider page's sticky positioning. */
  className?: string;
}) {
  const fullAddress = `${formatAddress(provider)}, ${provider.city}, ${provider.state} ${provider.zip}`;

  return (
    <div className={`rounded border border-line border-t-4 border-t-action bg-background p-4.5 ${className}`}>
      <h3 className="mb-3 text-base font-bold">Contact {provider.practiceName}</h3>

      {sent || confirmed ? (
        <LeadStatusMessage
          status={sent ? "sent" : "confirmed"}
          practiceName={provider.practiceName}
          providerId={provider.id}
          formLocation={formLocation}
        />
      ) : (
        mode === "form" &&
        email && (
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
              email={email}
              utm={utm}
              returnPath={returnPath}
            />
          </>
        )
      )}
      {mode === "email" && email && !sent && !confirmed && (
        <EmailPracticeButton email={email} practiceName={provider.practiceName} providerId={provider.id} />
      )}

      {(provider.phone || provider.website) && (
        <div className="mt-3.5 border-t border-line pt-3.5">
          {provider.phone && (
            <div className="mb-2 text-sm">
              📞{" "}
              <PhoneLink
                phone={provider.phone}
                className="text-[#1c5ea8]"
                providerId={provider.id}
                providerName={provider.practiceName}
              />
            </div>
          )}
          {provider.website && (
            <div className="text-sm">
              🌐{" "}
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

      <div className="mt-3.5 border-t border-line pt-3.5 text-sm">
        📍{" "}
        <TrackedLink
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
          type="ADDRESS_CLICK"
          providerId={provider.id}
          providerName={provider.practiceName}
          className="text-[#1c5ea8] hover:underline"
        >
          {fullAddress}
        </TrackedLink>
      </div>
    </div>
  );
}
