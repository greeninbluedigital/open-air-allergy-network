import { TRAP_PATH, TRAP_PRACTICE } from "@/lib/scraperTrap";

/**
 * Hidden from everyone but HTML scrapers: `hidden` keeps it off screen,
 * aria-hidden and tabIndex keep it away from screen readers and keyboards,
 * and a plain <a> (not next/link) means it's never prefetched.
 */
export function ScraperTrapLink() {
  return (
    <a href={TRAP_PATH} rel="nofollow" hidden aria-hidden="true" tabIndex={-1}>
      {TRAP_PRACTICE.name}, {TRAP_PRACTICE.city}, {TRAP_PRACTICE.state}
    </a>
  );
}
