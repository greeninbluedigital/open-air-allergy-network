/**
 * Adds a Cloudinary transformation to an upload URL, after any the URL
 * already has. Cloudinary applies chained steps in order, so a crop baked
 * into the link (e.g. `c_crop,w_720,…` from docs/image-guide.md) has to run
 * before our resize, not after: resizing first shrank the original and then
 * cropped a sliver of it (the Tampa cypress photo, 2026-10-29). The new step
 * goes just before the version segment (`/v123…/`); a URL without one gets it
 * right after `/upload/`, as before.
 */
export function withCloudinaryTransform(url: string, transform: string): string {
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const head = url.slice(0, at + marker.length);
  const parts = url.slice(at + marker.length).split("/");
  const version = parts.findIndex((p) => /^v\d+$/.test(p));
  if (version === -1) return `${head}${transform}/${parts.join("/")}`;
  parts.splice(version, 0, transform);
  return head + parts.join("/");
}

/**
 * Inserts a Cloudinary face-detection crop transformation into an existing
 * Cloudinary URL. Fixes a real problem, not just this one photo: a circular
 * avatar crop defaults to a plain center-crop, which can cut through the
 * chin/neck instead of the face on a source image composed for a taller
 * box (e.g. a PDP portrait photo reused for a small circular byline). This
 * asks Cloudinary to auto-detect the face and center on it instead —
 * general-purpose, works for any future author photo with no separate
 * upload needed.
 */
export function cloudinaryFaceCrop(url: string, size = 200): string {
  return withCloudinaryTransform(url, `c_thumb,g_face,w_${size},h_${size}`);
}

/** Caps a full-size upload's width and lets Cloudinary pick the quality. */
export function cloudinaryLimitWidth(url: string, width: number): string {
  return withCloudinaryTransform(url, `c_limit,w_${width},q_auto`);
}
