import Link from "next/link";
import type { Metadata } from "next";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ArticleFeed } from "@/components/ArticleFeed";
import { SYMPTOMS, TREATMENT_COMPARISON, WHAT_IS_ILIT_COPY } from "@/lib/content";

const LAST_UPDATED = "September 2026";

export const metadata: Metadata = {
  title: "Learn About ILIT",
  description:
    "What is ILIT (intralymphatic immunotherapy)? How it compares to SCIT and SLIT, allergy symptoms it addresses, and frequently asked questions.",
  alternates: { canonical: "/learn-about-ilit" },
};

const FAQ_ITEMS = [
  {
    q: "Is ILIT painful?",
    a: "Most patients describe the injection itself as a brief pinch, similar to other lymph-node-area injections. Ask your provider about what to expect for your specific situation.",
  },
  {
    q: "How much does ILIT typically cost?",
    a: "Cost varies by provider and treatment plan. Because ILIT is typically self-pay, ask any practice you're considering for their current pricing directly.",
  },
  {
    q: "Is ILIT covered by insurance?",
    a: "ILIT is typically self-pay and not covered by most insurance plans, unlike SCIT (allergy shots), which is often covered. Confirm coverage details with your own insurer.",
  },
  {
    q: "How do I know if I'm a candidate for ILIT?",
    a: "If you experience ongoing allergy symptoms like the ones described above, a consultation with an ILIT provider is the best way to find out whether it's a fit for you.",
  },
];

export default function LearnAboutIlitPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const symptomsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SYMPTOMS.map((s, i) => ({
      "@type": "MedicalSymptom",
      position: i + 1,
      name: s.label,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(symptomsJsonLd) }}
      />

      <div className="px-6 pt-8 sm:px-10">
        <h1 className="text-3xl font-extrabold">Learn About ILIT</h1>
        <div className="mt-1 text-xs text-muted">Last updated: {LAST_UPDATED}</div>
      </div>

      <div className="mx-6 mt-5 rounded border border-line bg-bg-alt p-5 sm:mx-10">
        <p className="text-sm text-foreground/80">
          ILIT (intralymphatic immunotherapy) is a form of allergy
          immunotherapy in which small amounts of allergen are injected
          directly into a lymph node, typically over a small number of
          visits rather than the years-long course associated with
          traditional allergy shots (SCIT). It&apos;s a personal treatment
          decision best made together with your doctor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 border-b border-line px-6 py-8 sm:px-10 md:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-3 text-xl font-bold">What is ILIT?</h2>
          <p className="text-sm text-foreground/80">{WHAT_IS_ILIT_COPY}</p>
        </div>
        <div className="rounded border border-sand-line bg-sand p-4.5">
          <h3 className="mb-3 text-sm font-bold">
            Does this sound familiar?
            <span className="mt-0.5 block text-xs font-normal text-muted">
              Common Allergy Symptoms &amp; Triggers
            </span>
          </h3>
          <div className="space-y-2.5">
            {SYMPTOMS.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span>{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
          <Link
            href="/find-an-ilit-provider"
            className="mt-3.5 block border-t border-sand-line pt-3 text-sm font-semibold text-sage"
          >
            Connect with an Open Air Allergy Network provider to see if ILIT
            can help you.
          </Link>
        </div>
      </div>

      <div className="mx-6 my-7 rounded bg-dark-panel p-6 text-white sm:mx-10">
        <div className="mb-1 text-base font-semibold">
          Ready to find a provider?
        </div>
        <div className="mb-4 text-xs text-white/70">
          See ILIT providers near you — no obligation.
        </div>
        <ZipSearchForm variant="dark" />
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-xl font-bold">
          Comparing ILIT to Other Allergy Treatments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b-2 border-line py-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase"></th>
                <th className="border-b-2 border-line py-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                  ILIT
                </th>
                <th className="border-b-2 border-line py-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                  SCIT
                </th>
                <th className="border-b-2 border-line py-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                  SLIT
                </th>
              </tr>
            </thead>
            <tbody>
              {TREATMENT_COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-line/60">
                  <td className="py-2.5 pr-4 text-muted">{row.label}</td>
                  <td className="py-2.5 pr-4">{row.ilit}</td>
                  <td className="py-2.5 pr-4">{row.scit}</td>
                  <td className="py-2.5">{row.slit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          All three are valid options — choosing one is a personal decision.
          ILIT providers typically also offer SCIT and/or SLIT, and can help
          you weigh which fits your situation best.
        </p>
        <p className="mt-4 mb-4 text-sm text-foreground/80">
          Beyond visit count and administration, ILIT, SCIT, and SLIT differ
          in a few other practical ways worth discussing with your provider
          — explore the specific comparisons below.
        </p>
        {/* Navigation into the /learn-about-ilit/[slug] cluster pages —
            renders nothing until the first one is published (emptyHidden),
            then grows automatically as more are added. This is the primary
            surfacing mechanism for that content per the 2026-09 SEO
            strategy; promoting individual pages into global nav is a later,
            traffic-data-driven decision, not part of this module. */}
        <ArticleFeed section="LEARN" limit={6} emptyHidden />
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">Backed by Clinical Literature</h2>
        <ArticleFeed tag="Clinical Research" limit={3} />
      </div>

      <div id="faq" className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="border-b border-line py-3">
            <div className="text-sm font-semibold">{item.q}</div>
            <div className="mt-1 text-sm text-muted">{item.a}</div>
          </div>
        ))}
      </div>

      <div className="px-6 py-8 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">Recent from the Blog</h2>
        <ArticleFeed pinnedToSlot="learn_about_ilit_recent" limit={3} />
      </div>

      <div className="mx-6 mb-8 rounded bg-dark-panel p-6 text-white sm:mx-10">
        <div className="mb-4 text-base font-semibold">
          Still have questions? Search available providers near you.
        </div>
        <ZipSearchForm variant="dark" />
      </div>
    </>
  );
}
