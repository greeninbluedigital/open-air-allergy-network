import { PhoneLink } from "@/components/PhoneLink";
import { LINKS_ERROR_MESSAGE, type FormError } from "@/lib/forms";

/**
 * Post-submission / confirmation copy for the PDP + SEM landing page lead
 * forms (Section 4). Shared so the exact wording stays identical between
 * both surfaces rather than drifting.
 */
export function LeadStatusMessage({
  status,
  practiceName,
}: {
  status: "sent" | "confirmed";
  practiceName: string;
}) {
  if (status === "confirmed") {
    return (
      <p className="text-sm font-semibold text-sage">
        ✓ Thanks for confirming — your message to {practiceName} is on its way.
      </p>
    );
  }
  return (
    <p className="text-sm font-semibold text-sage">
      Message sent! Check your email to confirm your inquiry — this helps {practiceName} know
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
    <p className="mb-3 rounded border border-badge-founder-bg bg-badge-founder-bg/40 px-3 py-2 text-xs text-badge-founder-text">
      {error === "has_links" ? (
        LINKS_ERROR_MESSAGE
      ) : error === "invalid_email" ? (
        <>
          That email address doesn&apos;t look right — please double-check it.
          {phone && (
            <>
              {" "}
              You can also call {practiceName} at <PhoneLink phone={phone} providerId={providerId} />.
            </>
          )}
        </>
      ) : (
        "Please fill in all required fields and try again."
      )}
    </p>
  );
}
