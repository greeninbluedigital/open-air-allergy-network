/**
 * Scraper honeypot + "trap street" (docs/anti-scraping.md). A fictional
 * practice reachable only through hidden links, disallowed in robots.txt and
 * noindexed, so real visitors and well-behaved crawlers never reach it.
 * Anything that fetches it is a scraper ignoring the rules (the Vercel
 * Firewall rule on TRAP_PATH logs it), and if this practice ever appears on
 * another site, that site copied ours.
 *
 * Never add this practice to the sheet, the sitemap, or search results, and
 * never change these values: they're the fingerprint we search for.
 */
export const TRAP_PRACTICE = {
  slug: "quillmoor-allergy-sinus-center-wichita",
  name: "Quillmoor Allergy & Sinus Center",
  address: "1847 Tennyfield Pkwy, Suite 210",
  city: "Wichita",
  state: "KS",
  zip: "67206",
  // 555-01xx is reserved for fiction, so it can't ring a real person.
  phone: "(316) 555-0142",
};

export const TRAP_PATH = `/find-an-ilit-provider/${TRAP_PRACTICE.slug}`;
