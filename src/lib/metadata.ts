const META_DESCRIPTION_MAX = 155;

/**
 * Trims arbitrary copy (e.g. a provider's long-form shortBio) down to a
 * search-snippet-length meta description. Prefers cutting at the last
 * sentence boundary within budget so it doesn't end mid-thought; falls back
 * to the last word boundary + an ellipsis. Never returns something already
 * short enough unmodified without checking — always normalizes whitespace
 * first so newline-heavy source text doesn't blow the budget on line breaks
 * alone.
 */
export function truncateForMeta(text: string, max: number = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max);
  const lastSentenceEnd = window.lastIndexOf(". ");
  if (lastSentenceEnd > max * 0.5) return window.slice(0, lastSentenceEnd + 1);

  const lastSpace = window.lastIndexOf(" ");
  return `${window.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}
