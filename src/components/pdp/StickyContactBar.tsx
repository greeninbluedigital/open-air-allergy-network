"use client";

import { useEffect, useState } from "react";

/**
 * Phones only: a "Send a Message" bar pinned to the bottom of the screen,
 * jumping to the contact form (SEM landing pages, where the form sits at the
 * very bottom of a long page). It slides away once the form is on screen or
 * scrolled past, so it never covers the form or the footer.
 */
export function StickyContactBar({ targetId }: { targetId: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    // Hidden once the form's top edge is on screen (or scrolled past).
    const update = () => setHidden(target.getBoundingClientRect().top < window.innerHeight);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden={hidden}
      className={`fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-white/95 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] transition-transform md:hidden ${
        hidden ? "translate-y-full" : ""
      }`}
    >
      <a
        href={`#${targetId}`}
        data-cta="sem_sticky_send_message"
        tabIndex={hidden ? -1 : undefined}
        className="block rounded bg-action py-3 text-center text-sm font-semibold text-white hover:bg-action-hover"
      >
        Send a Message
      </a>
    </div>
  );
}
