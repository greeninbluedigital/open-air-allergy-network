/**
 * Practice Type (Providers column AP, 2026-10-30): whether a listing is
 * called an "Allergist" or an "Allergy Clinic" in its page title and H1.
 * "Allergist" only when the practice's own site shows a board-certified
 * allergist/immunologist seeing patients at that office; "Allergy Clinic"
 * for offices run by ENTs, family physicians, PAs or NPs. People search
 * "allergist" about five times as often, so it's the default for a blank
 * cell (the sync warns about blanks on live rows so they get checked).
 */
export const PRACTICE_TYPES = ["Allergist", "Allergy Clinic"] as const;
export type PracticeType = (typeof PRACTICE_TYPES)[number];

/** The sheet's value, matched without regard to case; null if blank or unknown. */
export function parsePracticeType(raw: string | undefined): PracticeType | null {
  const value = raw?.trim().toLowerCase();
  return PRACTICE_TYPES.find((t) => t.toLowerCase() === value) ?? null;
}

/** What the page calls the practice. */
export function practiceTypeLabel(stored: string | null): PracticeType {
  return stored === "Allergy Clinic" ? "Allergy Clinic" : "Allergist";
}
