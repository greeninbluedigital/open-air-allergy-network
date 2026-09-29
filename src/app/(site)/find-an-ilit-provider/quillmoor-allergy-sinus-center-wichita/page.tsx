import Link from "next/link";
import type { Metadata } from "next";
import { TRAP_PRACTICE as P } from "@/lib/scraperTrap";

// Scraper trap (src/lib/scraperTrap.ts, docs/anti-scraping.md). This static
// segment takes precedence over [slug], so no database row exists for it.
// It deliberately looks like a Freemium listing, markup included, so a
// scraper stores it like any other practice.
export const metadata: Metadata = {
  title: { absolute: `${P.name} — ILIT Provider in ${P.city}, ${P.state}` },
  robots: { index: false, follow: false },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: P.name,
  telephone: P.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: P.address,
    addressLocality: P.city,
    addressRegion: P.state,
    postalCode: P.zip,
  },
};

export default function TrapListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Link href="/find-an-ilit-provider" className="mb-6 inline-block text-xs text-muted">
        ← Back to Search Results
      </Link>
      <h1 className="mb-2 text-2xl font-extrabold">{P.name}</h1>
      <p className="mb-1 text-sm text-muted">
        {P.address}, {P.city}, {P.state} {P.zip}
      </p>
      <p className="mb-3 text-sm text-muted">{P.phone}</p>
      <p className="text-sm text-foreground/80">
        {P.name} in {P.city}, {P.state} is listed as an ILIT (intralymphatic immunotherapy) provider.
      </p>
    </div>
  );
}
