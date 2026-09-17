"use client";

import { useEffect, useRef } from "react";

/**
 * Yelp's "Embed Review" snippet: a <span class="yelp-review"> with fallback
 * "Read X's review on Yelp" links, plus a <script src=".../widgets.js"> that
 * Yelp intends to upgrade it into their richer review widget. That script
 * tag is inert here on purpose — React's dangerouslySetInnerHTML never
 * executes injected <script> tags, and actually loading Yelp's real script
 * turned out to be unsafe to rely on: in testing it cleared the fallback
 * content expecting to replace it with a live-fetched review, then didn't
 * reliably render anything in its place. The fallback link Yelp already
 * gives us is what's proven to display reliably, so this only fixes the one
 * real problem with it: it doesn't open in a new tab on its own. A
 * MutationObserver (not just a one-time patch) covers both the initial
 * fallback links and anything a future re-render might add.
 */
export function YelpEmbed({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const cleanHtml = html.replace(/<script[^>]*><\/script>/gi, "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function openInNewTab(root: ParentNode) {
      root.querySelectorAll("a").forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });
    }

    openInNewTab(el);

    const observer = new MutationObserver(() => openInNewTab(el));
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
