"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_EVENT, getConsentApi, type ConsentApi } from "@/lib/consent";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

/**
 * The consent state set up by the boot script, re-rendering when the visitor
 * saves a choice. Null during server rendering and if the script didn't run.
 */
export function useConsent(): { api: ConsentApi; saved: boolean; current: ConsentApi["current"] } | null {
  const saved = useSyncExternalStore(subscribe, () => getConsentApi()?.saved ?? null, () => null);
  const current = useSyncExternalStore(subscribe, () => getConsentApi()?.current ?? null, () => null);
  const api = typeof window === "undefined" ? undefined : getConsentApi();
  if (saved === null || current === null || !api) return null;
  return { api, saved, current };
}
