/**
 * Generic allergen photos for practice pages without a photo of their own
 * (owner's uploads, 2026-10-09). All 4:5 portraits, the PDP main photo's
 * shape. Alt text describes the photo, never the practice, since it isn't
 * theirs. Never used in structured data or social previews for the same
 * reason. Realistic, saturated, real settings (no AI look, no people's
 * faces, no clinic interiors that could pass for the practice's office).
 *
 * Left out on purpose: main-ragweed_1.jpg shows goldenrod, not ragweed.
 * Goldenrod is the plant people wrongly blame for hay fever, so it doesn't
 * belong on an allergy site until there's a real ragweed photo.
 */
const STOCK_PHOTOS = [
  {
    url: "https://res.cloudinary.com/qruprn0t/image/upload/v1791591081/main-oak_tree_1.jpg",
    alt: "An oak tree in spring beside a hiking trail",
  },
  {
    url: "https://res.cloudinary.com/qruprn0t/image/upload/v1791591081/main-oak_tree_2.jpg",
    alt: "Morning sun through oak trees along a dirt road",
  },
  {
    url: "https://res.cloudinary.com/qruprn0t/image/upload/v1791591081/main-hand-touching-dust-in-sunbeam.jpg",
    alt: "Dust floating in a sunbeam over an open hand",
  },
  {
    url: "https://res.cloudinary.com/qruprn0t/image/upload/v1791591080/main-grass_field.jpg",
    alt: "A grassy hillside under a blue sky",
  },
] as const;

export type StockPhoto = (typeof STOCK_PHOTOS)[number];

/** The same photo for a page on every visit (keyed by its slug), so it's
 * stable for caching and search engines, while neighboring practices
 * usually get different ones. */
export function stockPhotoFor(slug: string): StockPhoto {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return STOCK_PHOTOS[hash % STOCK_PHOTOS.length];
}
