import Link from "next/link";
import type { Metadata } from "next";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ArticleFeed } from "@/components/ArticleFeed";
import { SYMPTOMS, TREATMENT_COMPARISON, TREATMENT_COMPARISON_HEADERS, WHAT_IS_ILIT_COPY } from "@/lib/content";

const LAST_UPDATED = "September 2026";

// Real bug found 2026-09-22: this page takes no searchParams/params (no
// Next.js "Dynamic API" usage), so it was a candidate for the full route
// cache — Vercel served whatever it looked like at the last deploy,
// meaning DB-only content changes (a new article, a photo) never showed
// up here until the next code push triggered a fresh build. force-dynamic
// makes every request re-query the database, matching how every other
// DB-driven page on the site already behaves (they're dynamic for other
// reasons — searchParams, params — this page just had neither).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learn About ILIT",
  description:
    "What is ILIT (intralymphatic immunotherapy)? How it compares to SCIT and SLIT, allergy symptoms it addresses, and frequently asked questions.",
  alternates: { canonical: "/learn-about-ilit" },
};

const FAQ_ITEMS = [
  {
    q: "Is ILIT painful?",
    a: "Most patients describe it as a brief pinch. ILIT injections go into a superficial lymph node, usually near the groin, an area with far fewer pain-sensing nerve endings than the skin or muscle tissue used for a standard allergy shot.",
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
    a: "Good candidates typically have confirmed allergies to a defined set of common triggers, things like pollen, dust mites, or pet dander, identified through a skin or blood allergy test. A broader or more complex allergy profile may be better suited to SCIT or SLIT instead. An allergist can review your test results and history to tell you directly whether ILIT is a fit.",
  },
  {
    q: "Can I get ILIT if I'm already getting allergy drops or allergy shots?",
    a: "Yes, that's a common situation. Many allergists who offer ILIT also treat patients already on SCIT or SLIT, and switching or combining approaches is possible depending on your specific allergens and how far into your current treatment you are. It's not automatic though, so bring your current treatment history to a consultation so your allergist can advise on the best path from where you already are.",
  },
  {
    q: "Does ILIT hurt more or less than a standard allergy shot?",
    a: "Many patients describe it as milder than a standard allergy shot or a routine blood draw. Standard allergy shots go into fatty tissue under the skin, which carries more pain-sensing nerve endings than the lymph node ILIT targets. Pain tolerance still varies from person to person.",
  },
  {
    q: "What allergens can ILIT treat?",
    a: "Most ILIT protocols target up to about six allergens at once, which makes it a strong fit for common triggers like tree and grass pollen, dust mites, and pet dander. A broader or more complex allergy profile may be better suited to SCIT or SLIT instead, since those approaches aren't limited the same way.",
  },
  {
    q: "Do I need allergy testing before starting ILIT?",
    a: "Yes. A skin or blood test identifies exactly which allergens you react to, which is what your provider uses to build your treatment plan, whether that ends up being ILIT, SCIT, or SLIT.",
  },
  {
    q: "Is ILIT safe?",
    a: "Current research supports it. The randomized controlled trial that established ILIT found it caused significantly fewer adverse reactions than standard subcutaneous allergy shots, while producing an equivalent long-term result. As with any immunotherapy, mild reactions are still possible, which is why every appointment includes an in-office monitoring period.",
  },
  {
    q: "Can ILIT help with my asthma?",
    a: "It may, if the asthma is triggered by an allergen ILIT is treating. Reducing your body's reaction to that allergen can mean easier breathing and fewer flare-ups for some patients. Asthma needs its own management plan though, so this is worth raising with your allergist alongside whatever your asthma treatment already includes.",
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
        <h1 className="text-3xl font-extrabold">
          Learn About ILIT (Intralymphatic Immunotherapy)
        </h1>
        <div className="mt-1 text-xs text-muted">Last updated: {LAST_UPDATED}</div>
      </div>

      {/* User-provided copy (2026-09-23), one edit made: "injected
          painlessly" softened to "with minimal discomfort for most
          patients" — "painlessly" is an absolute claim that directly
          contradicts this same page's own pain FAQ below ("many patients
          describe it as milder... your own experience may differ"), and
          the style guide bans absolute/guarantee language for exactly
          this reason. */}
      <div className="mx-6 mt-5 rounded border border-line bg-bg-alt p-5 sm:mx-10">
        <p className="text-sm text-foreground/80">
          ILIT (intralymphatic immunotherapy) is an allergy treatment in
          which small amounts of allergen are injected directly into a
          lymph node, with minimal discomfort for most patients, over a
          few monthly visits, rather than the years-long course associated
          with traditional allergy shots (SCIT) or allergy drops (SLIT).
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
          <div className="mt-3.5 border-t border-sand-line pt-3">
            <p className="mb-3 text-sm font-semibold text-sage">
              Connect with an Open Air Allergy Network provider to see if
              ILIT can help you.
            </p>
            <Link
              href="/find-an-ilit-provider"
              className="inline-block rounded bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
            >
              Find a Provider
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">What Can ILIT Treat?</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <h3 className="mb-1.5 text-sm font-bold">Indoor Allergies</h3>
            <p className="text-sm text-foreground/80">
              Dust mites, pet dander, and indoor mold are common year-round
              triggers ILIT protocols can be built around.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 text-sm font-bold">Outdoor Allergies</h3>
            <p className="text-sm text-foreground/80">
              Tree, grass, and weed pollen driving seasonal symptoms are
              among the most common allergens ILIT treats.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 text-sm font-bold">Allergy-Related Asthma</h3>
            <p className="text-sm text-foreground/80">
              For asthma triggered by an allergen ILIT is treating,
              addressing that allergen may help with breathing and
              flare-ups alongside your asthma care.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-bg-alt px-6 py-8 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">Imagine...</h2>
        <ul className="space-y-2 text-sm text-foreground/80">
          <li>Feeling relief in a handful of visits instead of years.</li>
          <li>Skipping weekly appointments for allergy shots.</li>
          <li>Spending more time living, not managing symptoms.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-7 border-b border-line px-6 py-8 sm:px-10 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-bold">Why Ultrasound Guidance Matters</h2>
          <p className="text-sm text-foreground/80">
            ILIT injections go into a lymph node, a small, specific target
            just under the skin. Ultrasound imaging lets your allergist see
            exactly where that lymph node is before delivering the
            injection, instead of relying on touch alone. That precision is
            what makes injecting directly into a lymph node practical and
            safe as a routine office visit.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-bold">Is ILIT Safe?</h2>
          <p className="text-sm text-foreground/80">
            ILIT delivers allergen into a lymph node instead of fatty
            tissue, an area with far fewer of the cells that trigger
            allergic reactions, and has shown a favorable safety profile in
            the research conducted so far. Reactions are still possible
            with any immunotherapy, which is why every injection is
            followed by a monitoring period in the office.
          </p>
          <p className="mt-3 text-sm text-foreground/80">
            Worth knowing: even though ILIT began clinical trials in the
            2000s, it hasn&apos;t yet been reviewed for FDA approval.
            That&apos;s not unique to it. Sublingual
            immunotherapy (allergy drops) has been used for decades and
            also isn&apos;t FDA-approved, largely because approval requires
            years of accumulated data a newer treatment hasn&apos;t had
            time to generate. Ask your allergist what the current research
            shows and how they weigh that when recommending it.
          </p>
        </div>
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
                  {TREATMENT_COMPARISON_HEADERS.ilit}
                </th>
                <th className="border-b-2 border-line py-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {TREATMENT_COMPARISON_HEADERS.scit}
                </th>
                <th className="border-b-2 border-line py-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {TREATMENT_COMPARISON_HEADERS.slit}
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
          Cost and timeline are usually what decide it. SCIT and SLIT have
          the longer track record and are more likely to be covered by
          insurance, but both run for years. ILIT compresses that into a
          handful of visits over a few months, at the tradeoff of being
          newer and generally self-pay today. Many providers offer more
          than one option, so a single consultation can often cover all
          three.
        </p>
        <Link
          href="/learn-about-ilit/ilit-vs-scit-vs-slit-a-full-comparison"
          className="mb-4 inline-block text-sm font-semibold text-sage"
        >
          Read the full comparison →
        </Link>
        {/* Navigation into the /learn-about-ilit/[slug] cluster pages —
            renders nothing until the first one is published (emptyHidden),
            then grows automatically as more are added. This is the primary
            surfacing mechanism for that content per the 2026-09 SEO
            strategy; promoting individual pages into global nav is a later,
            traffic-data-driven decision, not part of this module. */}
        <ArticleFeed section="LEARN" limit={6} emptyHidden oldestFirst />
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h2 className="mb-3 text-xl font-bold">
          Other Ways to Manage Allergy Symptoms
        </h2>
        <p className="text-sm text-foreground/80">
          Immunotherapy isn&apos;t the only path. Over-the-counter and
          prescription options, oral antihistamines, nasal steroid sprays,
          eye drops, decongestants, and prescription options like
          leukotriene modifiers, can meaningfully control day-to-day
          symptoms.
        </p>
        <p className="mt-3 text-sm text-foreground/80">
          The tradeoff is that these manage symptoms rather than changing
          your underlying allergic response. If the allergy itself
          doesn&apos;t change, most people find they need to keep taking
          something indefinitely. Immunotherapy, including ILIT, SCIT, and
          SLIT, is the category of treatment aimed at the underlying
          reaction instead.
        </p>
      </div>

      <div className="border-b border-line px-6 py-8 sm:px-10">
        {/* Renamed from "Backed by Clinical Literature" (2026-09-23) — that
            section depended on a "Clinical Research" tag with no real
            content behind it. This pulls the most recent provider-credited
            Blog articles instead — consumer-friendly framing, and the
            user's stated plan is for every future Blog article to be
            ghost-written for or contributed by a provider, so this stays
            fresh without needing a specific tag maintained. Replaces the
            old separate "Recent from the Blog" section below, which this
            makes redundant. */}
        <h2 className="mb-4 text-xl font-bold">From Our Provider Network</h2>
        <ArticleFeed limit={3} providerCreditedOnly emptyHidden />
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

      <div className="mx-6 mb-8 rounded bg-action p-6 text-white sm:mx-10">
        <div className="mb-4 text-base font-semibold">
          Still have questions? Search available providers near you.
        </div>
        <ZipSearchForm variant="dark" />
      </div>
    </>
  );
}
