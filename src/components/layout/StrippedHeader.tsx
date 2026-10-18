import Link from "next/link";

/** SEM landing page header — org logo only, no main site nav (Section 3:
 * "Stripped nav ... except a deliberate link back to the full PDP" — that
 * link lives in the page body, just below the practice info block, not
 * here). */
export function StrippedHeader() {
  return (
    <header className="border-b border-line bg-bg-alt px-6 py-4 sm:px-10">
      <Link href="/" data-cta="sem_header_logo" className="inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element -- a small static SVG needs no image optimization */}
        <img src="/logo.svg" alt="Open Air Allergy Network" width={1018} height={166} className="h-7 w-auto" />
      </Link>
    </header>
  );
}
