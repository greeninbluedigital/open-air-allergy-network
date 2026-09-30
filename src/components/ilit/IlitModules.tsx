import type { ReactNode } from "react";
import {
  ILIT_DEFINITION,
  SYMPTOMS,
  TREATMENT_COMPARISON,
  TREATMENT_COMPARISON_HEADERS,
  TREATMENT_TARGETS_ROW,
} from "@/lib/content";

/**
 * The ILIT education modules shared by Learn About ILIT and the SEM landing
 * pages, so the two always show the same content. Each renders a module's
 * heading and body; the page supplies the <section> wrapper and background,
 * plus a call to action where the pages differ (Learn points to the
 * directory, an SEM page to its practice's contact form).
 */

const STEPS = [
  {
    title: "Allergy testing",
    text: "A skin or blood test pinpoints the allergens behind your symptoms.",
  },
  {
    title: "A few injections",
    text: "Typically three ultrasound-guided injections into a lymph node, about a month apart.",
  },
  {
    title: "Finished in months",
    text: "A typical course wraps up in a few months, instead of years of allergy shots or drops.",
  },
];

const TREATS = [
  {
    icon: "🏡",
    title: "Indoor Allergies",
    text: "Dust mites, pet dander, and indoor mold are common year-round triggers ILIT protocols can be built around.",
  },
  {
    icon: "🌳",
    title: "Outdoor Allergies",
    text: "Tree, grass, and weed pollen driving seasonal symptoms are among the most common allergens ILIT treats.",
  },
  {
    icon: "🫁",
    title: "Allergy-Related Asthma",
    text: "For asthma triggered by an allergen ILIT is treating, addressing that allergen may help with breathing and flare-ups alongside your asthma care.",
  },
];

const COMPARISON_COLUMNS = ["ilit", "scit", "slit", "medicine"] as const;

export function WhatIsIlit() {
  return (
    <>
      <h2 className="mb-3 text-2xl font-bold">What is ILIT?</h2>
      <p className="max-w-3xl text-base text-foreground">{ILIT_DEFINITION}</p>
      <ol className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-4 rounded border border-line p-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action text-sm font-bold text-white">
              {i + 1}
            </div>
            <div>
              <h3 className="mb-1 font-bold">{step.title}</h3>
              <p className="text-sm text-foreground/80">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

/** `cta` sits at the bottom of the symptoms card. */
export function IsIlitRightForMe({ cta }: { cta: ReactNode }) {
  return (
    <>
      <h2 className="mb-5 text-2xl font-bold">Is ILIT Right for Me?</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded border border-line bg-white p-5">
          <h3 className="text-lg font-bold">Does This Sound Familiar?</h3>
          <p className="mb-4 text-sm text-muted">Common Allergy Symptoms &amp; Triggers</p>
          <ul className="space-y-2.5 text-sm">
            {SYMPTOMS.map((s) => (
              <li key={s.label} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="text-base">
                  {s.icon}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-line pt-4">{cta}</div>
        </div>
        <div className="flex flex-col rounded border border-line bg-white p-5">
          <h3 className="text-lg font-bold">What Can ILIT Treat?</h3>
          <p className="mb-4 text-sm text-muted">Allergens &amp; Conditions ILIT Can Address</p>
          <ul className="flex flex-1 flex-col divide-y divide-line">
            {TREATS.map((t) => (
              <li key={t.title} className="flex flex-1 items-start gap-2.5 py-3 first:pt-0 last:pb-0">
                <span aria-hidden="true" className="text-base leading-5">
                  {t.icon}
                </span>
                <div className="text-sm">
                  <h4 className="font-bold">{t.title}</h4>
                  <p className="text-foreground/80">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/**
 * Heading, table, and summary. `cta` is the line after the summary;
 * `aside` sits beside the summary on wide screens (Learn's full-comparison
 * article card).
 */
export function ComparingIlit({ cta, aside }: { cta: ReactNode; aside?: ReactNode }) {
  return (
    <>
      <h2 className="mb-5 text-2xl font-bold">Comparing ILIT to Other Allergy Treatments</h2>
      <div className="overflow-x-auto rounded border border-sand-line bg-sand p-4 sm:p-5">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-[16%] border-b-2 border-sand-line py-2"></th>
              {COMPARISON_COLUMNS.map((col) => (
                <th
                  key={col}
                  className={`w-[21%] border-b-2 border-sand-line py-2 pr-4 text-left text-[11px] font-semibold tracking-wide text-muted uppercase ${col === "medicine" ? "border-l border-l-sand-line pl-4" : ""}`}
                >
                  {TREATMENT_COMPARISON_HEADERS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[TREATMENT_TARGETS_ROW, ...TREATMENT_COMPARISON].map((row) => (
              <tr key={row.label} className="border-b border-sand-line last:border-b-0">
                <td className="py-2.5 pr-4 align-top text-muted">{row.label}</td>
                {COMPARISON_COLUMNS.map((col) => (
                  <td
                    key={col}
                    className={`py-2.5 pr-4 align-top ${row === TREATMENT_TARGETS_ROW ? "font-semibold" : ""} ${col === "medicine" ? "border-l border-sand-line pl-4" : ""}`}
                  >
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`mt-7 grid grid-cols-1 items-start gap-6 ${aside ? "lg:grid-cols-[2fr_1fr]" : ""}`}>
        <div className="max-w-3xl border-l-4 border-action pl-4 text-base text-foreground">
          <p>
            All three immunotherapies are valid options, and cost and timeline are usually what decide it. SCIT and
            SLIT have the longer track record and are more likely to be covered by insurance, but both run for years.
            ILIT compresses that into a handful of visits over a few months, at the tradeoff of being newer and
            generally self-pay today. Allergy medicine works differently. It can control day-to-day symptoms well,
            but it doesn&apos;t change the underlying allergy, so most people keep taking it indefinitely.
          </p>
          <p className="mt-3">{cta}</p>
        </div>
        {aside}
      </div>
    </>
  );
}
