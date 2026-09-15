/**
 * Shared static content used across multiple pages (Homepage, Learn About
 * ILIT, SEM Landing Page) — kept in one place so the copy stays consistent
 * everywhere it appears, per the content tone guardrail in
 * PROJECT_SPEC.md Section 4: these read as "common triggers addressed
 * through allergy immunotherapy including ILIT," never a promise of relief.
 */
/**
 * Single-sourced per Section 3 (SEM Landing Page) — "safe to duplicate
 * verbatim since these pages are noindexed," but the source of truth is
 * here, not retyped on each page.
 */
export const WHAT_IS_ILIT_COPY =
  "Intralymphatic immunotherapy (ILIT) delivers allergen extract directly into a lymph node, where the immune system processes it efficiently. Because of this targeted delivery, a typical ILIT course involves far fewer visits than conventional subcutaneous immunotherapy (SCIT, commonly known as allergy shots). ILIT is administered by trained allergists and immunologists, and — like any allergy treatment — isn't the right fit for every patient. Providers typically also offer other treatment options, and the best choice is the one you and your doctor decide on together.";

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
