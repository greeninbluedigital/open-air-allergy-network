/**
 * Shared static content used across multiple pages (Homepage, Learn About
 * ILIT, SEM Landing Page) — kept in one place so the copy stays consistent
 * everywhere it appears, per the content tone guardrail in
 * PROJECT_SPEC.md Section 4: these read as "common triggers addressed
 * through allergy immunotherapy including ILIT," never a promise of relief.
 */
export const SYMPTOMS = [
  { icon: "🤧", label: "Sneezing & nasal congestion" },
  { icon: "👁️", label: "Itchy, watery eyes" },
  { icon: "🌳", label: "Seasonal pollen reactions" },
  { icon: "🐾", label: "Pet dander sensitivity" },
  { icon: "🏡", label: "Dust & mold sensitivity" },
] as const;

/**
 * Comparison guardrail (Section 4): duration/visit-count/administration
 * differences only — never efficacy or outcome claims. Tone stays positive
 * and objective toward SCIT/SLIT; all three are valid options.
 */
export const TREATMENT_COMPARISON = [
  { label: "Treatment timeframe", ilit: "Months", scit: "Years", slit: "Years (varies by formulation)" },
  {
    label: "Administration",
    ilit: "Lymph node injection",
    scit: "Under-skin injection",
    slit: "Under-tongue drops or tablets",
  },
  { label: "Typical visit frequency", ilit: "A handful of visits", scit: "Regular ongoing visits", slit: "Regular ongoing dosing, often at home" },
] as const;
