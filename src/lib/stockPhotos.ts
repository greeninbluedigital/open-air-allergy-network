/**
 * Generic allergen photos for practice pages without a photo of their own
 * (owner's uploads, 2026-10-09). All 4:5 portraits, the PDP main photo's
 * shape. Alt text describes the photo, never the practice, since it isn't
 * theirs. Never used in structured data or social previews for the same
 * reason. Realistic, saturated, real settings (no AI look, no people's
 * faces, no clinic interiors that could pass for the practice's office).
 *
 * Check what a plant really is before adding it: an earlier "ragweed" photo
 * was goldenrod, the plant people wrongly blame for hay fever.
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
  {
    url: "https://res.cloudinary.com/qruprn0t/image/upload/v1791593428/main-ragweed_field.jpg",
    alt: "A field of ragweed in bloom at the edge of a forest",
  },
  {
    url: "https://res.cloudinary.com/qruprn0t/image/upload/v1791593427/main-pine_cone_on_tree.jpg",
    alt: "A small pine cone on a pine branch",
  },
] as const;

export type StockPhoto = (typeof STOCK_PHOTOS)[number];

/** The same photo for a page on every visit (keyed by its slug), so it's
 * stable for caching and search engines, while neighboring practices
 * usually get different ones. */
export function stockPhotoFor(slug: string): StockPhoto {
  // FNV-1a: mixes well, so practices spread evenly across the photos (a
  // simple "× 31" hash bunched them up with six photos).
  let hash = 0x811c9dc5;
  for (const ch of slug) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return STOCK_PHOTOS[hash % STOCK_PHOTOS.length];
}
