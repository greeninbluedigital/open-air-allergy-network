import { PhoneLink } from "@/components/PhoneLink";
import { DataLayerEvent } from "@/components/analytics/DataLayerEvent";
import { LINKS_ERROR_MESSAGE, type FormError } from "@/lib/forms";

/**
 * Post-submission / confirmation copy for the PDP + SEM landing page lead
 * forms (Section 4). Shared so the exact wording stays identical between
 * both surfaces rather than drifting. Also sends the GA4 lead events
 * (oaan_lead_submit, oaan_lead_confirm; docs/gtm-ga4-setup.md).
 */
export function LeadStatusMessage({
  status,
  practiceName,
  providerId,
  formLocation,
}: {
  status: "sent" | "confirmed";
  practiceName: string;
  providerId: string;
  formLocation: "provider_page" | "sem_landing_page";
}) {
  const leadEvent = (
    <DataLayerEvent
      event={status === "confirmed" ? "oaan_lead_confirm" : "oaan_lead_submit"}
      params={{ provider_id: providerId, provider_name: practiceName, form_location: formLocation }}
    />
  );
  if (status === "confirmed") {
    return (
      <p className="text-sm font-semibold text-sage">
        {leadEvent}✓ Thanks for confirming — your message to {practiceName} is on its way.
      </p>
    );
  }
  return (
    <p className="text-sm font-semibold text-sage">
      {leadEvent}Message sent! Check your email to confirm your inquiry — this helps {practiceName} know
      it&apos;s really you.
    </p>
  );
}

export function LeadErrorMessage({
  error,
  practiceName,
  phone,
  providerId,
}: {
  error: FormError;
  practiceName: string;
  phone: string | null;
  providerId?: string;
}) {
  return (
    <p className="mb-3 rounded border border-warning-bg bg-warning-bg/40 px-3 py-2 text-xs text-warning-text">
      {error === "has_links" ? (
        LINKS_ERROR_MESSAGE
      ) : error === "invalid_email" ? (
        <>
          That email address doesn&apos;t look right — please double-check it.
          {phone && (
            <>
              {" "}
              You can also call {practiceName} at <PhoneLink phone={phone} providerId={providerId} providerName={practiceName} />.
            </>
          )}
        </>
      ) : (
        "Please fill in all required fields and try again."
      )}
    </p>
  );
}
