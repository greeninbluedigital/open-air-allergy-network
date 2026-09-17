"use client";

import { useEffect, useRef } from "react";

/**
 * Yelp's "Embed Review" snippet renders as plain text with four links —
 * "Read [Author]'s [review] of [Business] on [Yelp]" — but only the
 * "review" link actually goes anywhere useful to a visitor here; the
 * author/business/Yelp-homepage links are noise. Also, none of the four
 * are visually distinguishable from the surrounding text as clickable.
 * Fixes both: unlinks everything except the "review" link (matched by its
 * visible text, not a fragile URL pattern, since Yelp's template always
 * renders that exact word), and gives that one a real link color and
 * underline plus target="_blank" so it opens without navigating away from
 * the PDP.
 *
 * The inline <script src=".../widgets.js"> Yelp's snippet also includes is
 * stripped — it's inert anyway (dangerouslySetInnerHTML never executes
 * injected <script> tags), and loading Yelp's real widget script separately
 * was tried and reverted: it cleared this fallback content expecting to
 * replace it with a live-fetched review, then didn't reliably render
 * anything back in its place.
 */
export function YelpEmbed({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const cleanHtml = html.replace(/<script[^>]*><\/script>/gi, "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.querySelectorAll("a").forEach((link) => {
      if (link.textContent?.trim().toLowerCase() === "review") {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.classList.add("text-[#1c5ea8]", "underline");
      } else {
        const span = document.createElement("span");
        span.textContent = link.textContent;
        link.replaceWith(span);
      }
    });
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
