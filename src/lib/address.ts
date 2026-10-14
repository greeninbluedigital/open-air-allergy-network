/** The street of an address without the house number or a trailing period:
 * "4200 4th St. N." -> "4th St. N", "4965 Central Ave" -> "Central Ave".
 * Tells apart two offices of one practice in the same city (practice page
 * titles, search cards, state pages). */
export function streetName(address: string): string | null {
  return address.replace(/^\s*\d+[A-Za-z-]*\s+/, "").replace(/\.$/, "").trim() || null;
}
