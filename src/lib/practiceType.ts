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

const TITLE_MAX = 62;

/**
 * Practice page title, keyword first (2026-10-30): searchers type
 * "allergist sugar land tx", and "ILIT Allergist" keeps ILIT in front of
 * them too. "ILIT" next to "Allergist" also can't be read as the life
 * insurance trust. An office suffix that only repeats the city is dropped
 * ("Aspire Allergy & Sinus - Sugar Land" in Sugar Land); one that names a
 * different place ("- The Woodlands") stays, since people search it. Past 62
 * characters "ILIT" comes off; past that Google trims the practice name end.
 */
export function practiceTitle(p: { practiceName: string; practiceType: string | null }, where: string, city: string) {
  const [brand, office] = p.practiceName.split(" - ");
  const name = office && office.toLowerCase() === city.toLowerCase() ? brand : p.practiceName;
  const type = practiceTypeLabel(p.practiceType);
  const full = `ILIT ${type} in ${where} | ${name}`;
  return full.length <= TITLE_MAX ? full : `${type} in ${where} | ${name}`;
}

/** The small line under the practice name in the H1, e.g. "ILIT Allergist in Henrico, VA". */
export function practiceHeadingLine(p: { practiceType: string | null }, where: string) {
  return `ILIT ${practiceTypeLabel(p.practiceType)} in ${where}`;
}

/** State page title and H1: "& Allergy Clinics" only where the state has one. */
export function stateHeading(stateName: string, hasClinic: boolean) {
  return `ILIT Allergists${hasClinic ? " & Allergy Clinics" : ""} in ${stateName}`;
}
