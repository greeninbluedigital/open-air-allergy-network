/**
 * Shared static content used across multiple pages (Homepage, Learn About
 * ILIT, SEM Landing Page) — kept in one place so the copy stays consistent
 * everywhere it appears, per the content tone guardrail in
 * PROJECT_SPEC.md Section 4: these read as "common triggers addressed
 * through allergy immunotherapy including ILIT," never a promise of relief.
 */
// Shared by the Learn page, SEM landing pages, Freemium PDPs, and the homepage. Opens with the
// allergy-shots comparison most readers already know, while keeping the
// "ILIT is an allergy treatment…" form AI answers extract definitions from.
export const ILIT_DEFINITION =
  "ILIT (intralymphatic immunotherapy) is an allergy treatment that works like allergy shots, but faster. Instead of going under the skin, the allergen is injected directly into a lymph node, so treatment usually takes a few monthly visits rather than years.";

// The LEARN article that owns "allergy shots vs. allergy drops". If this slug
// ever changes, also update the Page Slug on the Learn Page Credits sheet tab.
export const COMPARISON_ARTICLE_SLUG = "allergy-shots-vs-allergy-drops-vs-ilit";

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
 * IMPORTANT: the /learn-about-ilit/allergy-shots-vs-allergy-drops-vs-ilit
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
 * Rendered by ComparingIlit (src/components/ilit/IlitModules.tsx) on both
 * Learn About ILIT and the SEM landing pages.
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
