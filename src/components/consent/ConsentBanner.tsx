"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIVACY_CHOICES_PATH } from "@/lib/consent";
import { useConsent } from "@/components/consent/useConsent";

/**
 * First-visit notice (docs/consent.md). Shows until the visitor makes a
 * choice. In opt-out mode it's a notice with an OK; in opt-in mode it asks.
 * Hidden on the choices page itself, which has the full controls.
 */
export function ConsentBanner() {
  const pathname = usePathname();
  const consent = useConsent();

  if (!consent || consent.saved || pathname === PRIVACY_CHOICES_PATH) return null;

  const { api } = consent;
  const optIn = api.mode === "opt-in";

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[1100] border-t border-line bg-white px-6 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] sm:px-10"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-foreground/80">
          {optIn
            ? "May we use cookies to see how visitors use the site and to measure our advertising?"
            : "We use cookies to see how visitors use the site and to measure our advertising. You can change this anytime."}
          {api.gpc && " Your browser's Global Privacy Control signal is on, so advertising cookies are off."}{" "}
          <Link href={PRIVACY_CHOICES_PATH} className="font-semibold text-sage hover:underline">
            Privacy choices
          </Link>
        </p>
        <div className="flex shrink-0 justify-end gap-2">
          {optIn && (
            <button
              type="button"
              onClick={() => api.update({ analytics: false, ads: false })}
              className="rounded border border-foreground/30 bg-white px-4 py-2 font-semibold hover:border-foreground/60"
            >
              Decline
            </button>
          )}
          <button
            type="button"
            onClick={() => api.update({ analytics: true, ads: true })}
            className="rounded bg-action px-4 py-2 font-semibold text-white hover:bg-action-hover"
          >
            {optIn ? "Accept" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
