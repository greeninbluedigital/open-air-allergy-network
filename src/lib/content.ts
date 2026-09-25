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
  { icon: "🫁", label: "Allergy-induced asthma" },
] as const;

/**
 * Column headers — simple consumer name alongside the acronym, for both
 * keyword coverage and readability. No plain-English synonym exists for
 * ILIT itself (unlike "Allergy Shots"/"Allergy Drops" for SCIT/SLIT), so
 * that column stays acronym-only.
 *
 * IMPORTANT: the /learn-about-ilit/ilit-vs-scit-vs-slit-a-full-comparison
 * article's own "Side by Side" table is hand-typed Markdown living in the
 * database (Article.body), not code — it can't import this constant. If
 * you change this, update that article's table to match by hand, or the
 * two will drift out of sync again (2026-09-23: user explicitly asked for
 * them to always match).
 */
export const TREATMENT_COMPARISON_HEADERS = {
  ilit: "ILIT",
  scit: "SCIT (Allergy Shots)",
  slit: "SLIT (Allergy Drops/Tablets)",
  // "OTC"/"Rx" spelled out in the cells instead — not every reader knows them.
  medicine: "Allergy Medicine",
} as const;

/**
 * Comparison guardrail (Section 4): duration/visit-count/administration
 * differences only — never efficacy or outcome claims. Tone stays positive
 * and objective toward SCIT/SLIT; all three are valid options.
 *
 * `medicine` only renders on Learn About ILIT; the SEM landing page table
 * shows the three immunotherapy columns.
 */
export const TREATMENT_COMPARISON = [
  {
    label: "Treatment timeframe",
    ilit: "Months",
    scit: "Years",
    slit: "Years (varies by formulation)",
    medicine: "Daily or as needed, indefinitely",
  },
  {
    label: "Administration",
    ilit: "Lymph node injection",
    scit: "Under-skin injection",
    slit: "Under-tongue drops or tablets",
    medicine: "Pills, sprays, or eye drops, over the counter or by prescription",
  },
  {
    label: "Typical visit frequency",
    ilit: "A handful of visits",
    scit: "Regular ongoing visits",
    slit: "At-home dosing, plus periodic in-office visits",
    medicine: "None for over-the-counter options, checkups for prescriptions",
  },
] as const;

/**
 * Only meaningful next to the medicine column (identical across the three
 * immunotherapies), so it's kept out of TREATMENT_COMPARISON. A category
 * distinction, not an efficacy claim — consistent with the guardrail above.
 */
export const TREATMENT_TARGETS_ROW = {
  label: "What it targets",
  ilit: "The underlying allergy",
  scit: "The underlying allergy",
  slit: "The underlying allergy",
  medicine: "Symptoms",
} as const;
