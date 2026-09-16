"use client";

import { useId } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/track";

/**
 * Site-wide click-to-call requirement (PROJECT_SPEC.md Section 4): on a touch
 * device, tapping dials directly (native `tel:` behavior, no JS needed). On a
 * non-touch device, clicking reveals/scrolls to the number instead of
 * attempting to dial — desktops usually have no sensible `tel:` handler.
 * Logs a PHONE_CLICK when providerId is given (PDP/SEM usage); omitted
 * elsewhere since a phone click with no provider context isn't a KPI this
 * log tracks.
 */
export function PhoneLink({
  phone,
  className,
  providerId,
}: {
  phone: string;
  className?: string;
  providerId?: string;
}) {
  const id = useId();
  const pathname = usePathname();
  const digits = phone.replace(/[^\d+]/g, "");

  return (
    <a
      id={id}
      href={`tel:${digits}`}
      className={className}
      onClick={(e) => {
        if (providerId) {
          trackEvent("PHONE_CLICK", { providerId, path: pathname });
        }
        const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
        if (!isTouchDevice) {
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }}
    >
      {phone}
    </a>
  );
}
