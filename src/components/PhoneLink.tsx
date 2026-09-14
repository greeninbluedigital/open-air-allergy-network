"use client";

import { useId } from "react";

/**
 * Site-wide click-to-call requirement (PROJECT_SPEC.md Section 4): on a touch
 * device, tapping dials directly (native `tel:` behavior, no JS needed). On a
 * non-touch device, clicking reveals/scrolls to the number instead of
 * attempting to dial — desktops usually have no sensible `tel:` handler.
 */
export function PhoneLink({ phone, className }: { phone: string; className?: string }) {
  const id = useId();
  const digits = phone.replace(/[^\d+]/g, "");

  return (
    <a
      id={id}
      href={`tel:${digits}`}
      className={className}
      onClick={(e) => {
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
