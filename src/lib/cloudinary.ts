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
  return url.replace("/upload/", `/upload/c_thumb,g_face,w_${size},h_${size}/`);
}
