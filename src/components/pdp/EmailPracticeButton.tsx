"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track";

const SUBJECT = "ILIT question (found on Open Air Allergy Network)";
const BODY = "Hi, I found your practice on openairallergynetwork.com and have a question about ILIT:\n\n";

/**
 * Free trial pages' stand-in for the contact form (showsEmailButton): opens
 * the visitor's own email app, addressed to the practice and prefilled with a
 * subject and opening line that name OAAN. The message never touches OAAN,
 * so nothing is collected, stored or forwarded. The address is shown too,
 * with a copy button, for visitors whose browser has no email app set up.
 * Both actions log an EMAIL_CLICK lead action.
 */
export function EmailPracticeButton({
  email,
  practiceName,
  providerId,
}: {
  email: string;
  practiceName: string;
  providerId: string;
}) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const address = email.trim();
  const href = `mailto:${address}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  const track = () => trackEvent("EMAIL_CLICK", { providerId, providerName: practiceName, path: pathname });

  return (
    <div className="mt-1">
      <a
        href={href}
        onClick={track}
        className="block w-full rounded bg-action py-2.5 text-center text-sm font-semibold text-white hover:bg-action-hover"
      >
        Email {practiceName}
      </a>
      <p className="mt-2 text-center text-[11.5px] leading-snug text-muted">
        Opens your email app. Your message goes straight to the practice, and we never see it.
      </p>
      <p className="mt-1.5 text-center text-[11.5px] leading-snug text-muted">
        {address}{" "}
        <button
          type="button"
          onClick={() => {
            track();
            navigator.clipboard?.writeText(address).then(
              () => setCopied(true),
              () => {},
            );
          }}
          className="font-semibold text-sage hover:underline"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </p>
    </div>
  );
}
