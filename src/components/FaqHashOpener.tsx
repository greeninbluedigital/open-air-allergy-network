"use client";

import { useEffect } from "react";

/**
 * Opens the <details> FAQ named in the URL hash (e.g. /learn-about-ilit#faq-safety)
 * on arrival from another page, then scrolls to it now that it's expanded.
 */
export function FaqHashOpener() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView();
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  return null;
}
