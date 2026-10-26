/** The street of an address without the house number or a trailing period:
 * "4200 4th St. N." -> "4th St. N", "4965 Central Ave" -> "Central Ave".
 * Tells apart two offices of one practice in the same city (practice page
 * titles, search cards, state pages). */
export function streetName(address: string): string | null {
  return address.replace(/^\s*\d+[A-Za-z-]*\s+/, "").replace(/\.$/, "").trim() || null;
}

type PostalFields = { address: string; addressLine2: string | null; city: string; state: string; zip: string };

/** False for a practice with no public street address (the sheet's Address
 * left blank, e.g. a concierge practice that sees patients at home). Its
 * listing is placed by zip centroid and shows only the area. */
export function hasStreetAddress(p: { address: string }): boolean {
  return p.address.trim() !== "";
}

/** "123 Main St, Suite 200, Columbus, OH 43221", or "Columbus, OH area"
 * when there's no public street address. */
export function displayAddress(p: PostalFields): string {
  if (!hasStreetAddress(p)) return `${p.city}, ${p.state} area`;
  const street = p.addressLine2 ? `${p.address}, ${p.addressLine2}` : p.address;
  return `${street}, ${p.city}, ${p.state} ${p.zip}`;
}
