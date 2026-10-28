/**
 * The standard names for the Treatments Offered column (Providers tab, AH),
 * so the same service reads the same way on every practice page
 * (owner, 2026-10-28). Each name has a type, which decides which row of
 * pills it shows in, and the list order is the order the pills appear in.
 *
 * The sync maps the common variants in `aliases` to the standard name and
 * warns about anything it doesn't recognize, which still shows, as typed, at
 * the end of the treatments row. To add a name, add it here; the sheet's
 * Treatments tab is a reference copy of this list for whoever fills in rows.
 */
export type TreatmentType = "treatment" | "test" | "condition";

type TreatmentEntry = { name: string; type: TreatmentType; aliases?: string[] };

export const TREATMENTS: TreatmentEntry[] = [
  // Treatments (immunotherapy first: ILIT is what the directory is for)
  { name: "Intralymphatic Immunotherapy (ILIT)", type: "treatment", aliases: ["ILIT", "Intralymphatic Immunotherapy"] },
  { name: "RapImmune™ (ILIT)", type: "treatment", aliases: ["RapImmune (ILIT)", "RapImmune"] },
  { name: "Allergy Shots (SCIT)", type: "treatment", aliases: ["SCIT", "Allergy Shots", "Allergen Immunotherapy"] },
  { name: "Allergy Drops (SLIT)", type: "treatment", aliases: ["SLIT", "Allergy Drops", "Allergy Drops and Tablets (SLIT)", "Allergy Drops & Tablets (SLIT)"] },
  { name: "Venom Immunotherapy", type: "treatment" },
  { name: "Food Allergy Desensitization (SLIT)", type: "treatment" },
  // Testing
  { name: "Allergy Testing", type: "test", aliases: ["Allergy Skin Testing", "Skin Testing", "Skin Prick Testing"] },
  { name: "Food Allergy Testing", type: "test" },
  { name: "Drug Allergy Testing", type: "test", aliases: ["Medication Allergy Testing"] },
  { name: "Penicillin Allergy Testing", type: "test" },
  { name: "Patch Testing", type: "test" },
  { name: "Oral Food Challenges", type: "test", aliases: ["Oral Food Challenge"] },
  { name: "Drug Challenges", type: "test", aliases: ["Oral Medication Challenge", "Oral Medication Challenges", "Medication Challenges"] },
  { name: "Pulmonary Function Testing", type: "test", aliases: ["Spirometry", "Lung Function Testing"] },
  // Conditions treated
  { name: "Hay Fever (Allergic Rhinitis)", type: "condition", aliases: ["Hay Fever", "Allergic Rhinitis", "Seasonal Allergies"] },
  { name: "Asthma", type: "condition" },
  { name: "Eczema", type: "condition", aliases: ["Atopic Dermatitis"] },
  { name: "Hives (Urticaria)", type: "condition", aliases: ["Hives", "Urticaria"] },
  { name: "Angioedema", type: "condition" },
  { name: "Food Allergy", type: "condition", aliases: ["Food Allergies"] },
  { name: "Drug Allergy", type: "condition", aliases: ["Medication Allergy", "Medication Allergies", "Drug Allergies"] },
  { name: "Contact Dermatitis", type: "condition" },
  { name: "Chronic Sinusitis", type: "condition" },
  { name: "Chronic Cough", type: "condition" },
  { name: "Immune Deficiency", type: "condition", aliases: ["Immunodeficiency"] },
  { name: "Mast Cell Activation Syndrome (MCAS)", type: "condition", aliases: ["MCAS"] },
  { name: "Autoimmune Conditions", type: "condition" },
];

const key = (s: string) => s.toLowerCase().replace(/[™®℠]/g, "").replace(/\s+/g, " ").trim();

const BY_KEY = new Map<string, TreatmentEntry>();
for (const t of TREATMENTS) {
  BY_KEY.set(key(t.name), t);
  for (const a of t.aliases ?? []) BY_KEY.set(key(a), t);
}

/** The standard name for a sheet entry, or null when it isn't on the list. */
export function standardTreatmentName(raw: string): string | null {
  return BY_KEY.get(key(raw))?.name ?? null;
}

/** Splits a practice's treatments into the page's pill rows, in list order.
 * A name not on the list goes at the end of the treatments row. */
export function groupTreatments(names: string[]) {
  const order = (n: string) => {
    const i = TREATMENTS.findIndex((t) => t.name === n);
    return i === -1 ? TREATMENTS.length : i;
  };
  const sorted = [...names].sort((a, b) => order(a) - order(b));
  const typeOf = (n: string): TreatmentType => BY_KEY.get(key(n))?.type ?? "treatment";
  return {
    treatments: sorted.filter((n) => typeOf(n) !== "condition"),
    conditions: sorted.filter((n) => typeOf(n) === "condition"),
  };
}
