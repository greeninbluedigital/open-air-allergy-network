"use client";

import { useState } from "react";
import type { ConsentChoices } from "@/lib/consent";
import { useConsent } from "@/components/consent/useConsent";

/**
 * The working controls on the My Privacy Choices page (docs/consent.md).
 * The page's written content comes from the LegalPage table as usual.
 */
export function PrivacyChoicesPanel() {
  const consent = useConsent();
  // Unsaved checkbox edits; null means "show what's currently in effect".
  const [draft, setDraft] = useState<ConsentChoices | null>(null);
  const [saved, setSaved] = useState(false);

  if (!consent) {
    return (
      <p className="mb-8 rounded border border-line bg-bg-alt p-4 text-sm">
        Privacy controls need JavaScript. Without it, this site doesn&apos;t load analytics or advertising cookies.
      </p>
    );
  }

  const { api } = consent;
  const choices = draft ?? consent.current;
  const edit = (next: ConsentChoices) => {
    setDraft(next);
    setSaved(false);
  };
  const save = (next: ConsentChoices) => {
    api.update(next);
    setDraft(null);
    setSaved(true);
  };

  return (
    <section className="mb-8 rounded border border-line bg-bg-alt p-5 text-sm" aria-labelledby="privacy-controls">
      <h2 id="privacy-controls" className="mb-3 text-base font-bold">
        Your settings
      </h2>
      <label className="mb-3 flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={choices.analytics}
          onChange={(e) => edit({ ...choices, analytics: e.target.checked })}
        />
        <span>
          <strong>Analytics cookies.</strong> Help us see how visitors use the site (Google Analytics).
        </span>
      </label>
      <label className="mb-4 flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={choices.ads && !api.gpc}
          disabled={api.gpc}
          onChange={(e) => edit({ ...choices, ads: e.target.checked })}
        />
        <span>
          <strong>Advertising cookies.</strong> Help us measure our advertising. Turning this off opts you out of
          the sale or sharing of your personal information for advertising.
          {api.gpc && " Your browser's Global Privacy Control signal is on, so this is off."}
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save(choices)}
          className="rounded bg-action px-4 py-2 font-semibold text-white hover:bg-action-hover"
        >
          Save choices
        </button>
        <button
          type="button"
          onClick={() => save({ analytics: false, ads: false })}
          className="rounded border border-foreground/30 bg-white px-4 py-2 font-semibold hover:border-foreground/60"
        >
          Opt out of all
        </button>
      </div>
      {saved && (
        <p role="status" className="mt-3 font-semibold text-sage">
          Saved. Your choices apply in this browser.
        </p>
      )}
    </section>
  );
}
