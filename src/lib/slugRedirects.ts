/**
 * Practice pages whose slug changed after going live: old slug → new slug.
 * The practice page sends a permanent redirect only once the old slug is no
 * longer an active practice (the sync deactivates it when the sheet row's
 * slug changes), so adding an entry before that sync is harmless.
 *
 * Add an entry whenever a live practice's slug changes on the sheet, and
 * never remove one: search engines and old links may still use it.
 */
export const RENAMED_SLUGS: Record<string, string> = {
  // 2026-10-04: slugs standardized to {brand}-{city}-{state}.
  "avant-allergy-los-angeles": "avant-allergy-los-angeles-ca",
  "allergenix-west-des-moines": "allergenix-west-des-moines-ia",
  "allerpoint-henrico": "allerpoint-henrico-va",
  "allerpoint-arlington": "allerpoint-arlington-va",
  "allerpoint-philadelphia": "allerpoint-philadelphia-pa",
  "columbia-allergy-fremont": "columbia-allergy-fremont-ca",
  "aircare-dallas": "aircare-dallas-tx",
  "aircare-plano": "aircare-plano-tx",
  "aascmed-bolingbrook": "allergy-asthma-sinus-centers-bolingbrook-il",
  "stlouis-family-allergy-st-peters": "st-louis-family-allergy-st-peters-mo",
  "stlouis-family-allergy-st-louis": "st-louis-family-allergy-st-louis-mo",
};
