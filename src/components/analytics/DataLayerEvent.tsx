"use client";

import { useEffect } from "react";
import { pushDataLayer } from "@/lib/track";

/**
 * Sends one dataLayer event when it renders, e.g. inside a form's success
 * message. A reload of the same success URL in the same browser session
 * doesn't send it again, so a refresh can't double-count a lead.
 */
export function DataLayerEvent({
  event,
  params = {},
}: {
  event: `oaan_${string}`;
  params?: Record<string, string | undefined>;
}) {
  useEffect(() => {
    const key = `oaan_sent:${event}:${window.location.pathname}${window.location.search}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    pushDataLayer(event, params);
    // Once per mount; params are fixed for a given success state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
