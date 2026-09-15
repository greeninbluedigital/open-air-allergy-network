import Link from "next/link";

/** SEM landing page header — org logo only, no main site nav (Section 3:
 * "Stripped nav ... except a deliberate link back to the full PDP" — that
 * link lives in the page body, just below the practice info block, not
 * here). */
export function StrippedHeader() {
  return (
    <header className="border-b border-line bg-bg-alt px-6 py-4 sm:px-10">
      <Link href="/" className="text-base font-bold">
        Open Air Allergy Network
      </Link>
    </header>
  );
}
