import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ArticleFeed } from "@/components/ArticleFeed";
import { ArticleCard } from "@/components/ArticleCard";
import { FaqJumpLink } from "@/components/FaqJumpLink";
import {
  SYMPTOMS,
  TREATMENT_COMPARISON,
  TREATMENT_COMPARISON_HEADERS,
  TREATMENT_TARGETS_ROW,
} from "@/lib/content";

const COMPARISON_SLUG = "ilit-vs-scit-vs-slit-a-full-comparison";
const COMPARISON_COLUMNS = ["ilit", "scit", "slit", "medicine"] as const;
const HERO_IMAGE =
  "https://res.cloudinary.com/qruprn0t/image/upload/c_limit,w_2400,q_auto/v1790318756/learn-about-ilit-hero.jpg";

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

const HOW_IT_WORKS = [
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

const SAFETY_POINTS = [
  {
    title: "Guided by Ultrasound",
    text: "Your allergist uses ultrasound, the same radiation-free imaging used during pregnancy, to place each injection precisely in the lymph node.",
    faqId: "faq-ultrasound",
  },
  {
    title: "Fewer Reactions in Trials",
    text: "In the clinical trial that established ILIT, patients had fewer adverse reactions than with standard allergy shots.",
    faqId: "faq-safety",
  },
  {
    title: "Not Yet FDA-Approved",
    text: "ILIT has been studied in clinical trials since the 2000s but hasn't been reviewed for FDA approval yet. Allergy drops (SLIT) are in the same position.",
    faqId: "faq-fda",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I know if I'm a candidate for ILIT?",
    a: "Good candidates typically have confirmed allergies to a defined set of common triggers, things like pollen, dust mites, or pet dander, identified through a skin or blood allergy test. A broader or more complex allergy profile may be better suited to SCIT or SLIT instead. An allergist can review your test results and history to tell you directly whether ILIT is a fit.",
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
    q: "Can ILIT help with my asthma?",
    a: "It may, if the asthma is triggered by an allergen ILIT is treating. Reducing your body's reaction to that allergen can mean easier breathing and fewer flare-ups for some patients. Asthma needs its own management plan though, so this is worth raising with your allergist alongside whatever your asthma treatment already includes.",
  },
  {
    q: "Can I get ILIT if I'm already getting allergy drops or allergy shots?",
    a: "Yes, that's a common situation. Many allergists who offer ILIT also treat patients already on SCIT or SLIT, and switching or combining approaches is possible depending on your specific allergens and how far into your current treatment you are. It's not automatic though, so bring your current treatment history to a consultation so your allergist can advise on the best path from where you already are.",
  },
  {
    q: "Is ILIT painful?",
    a: "Most patients describe it as a brief pinch. ILIT injections go into a superficial lymph node, usually near the groin, an area with far fewer pain-sensing nerve endings than the skin or muscle tissue used for a standard allergy shot.",
  },
  {
    q: "Does ILIT hurt more or less than a standard allergy shot?",
    a: "Many patients describe it as milder than a standard allergy shot or a routine blood draw. Standard allergy shots go into fatty tissue under the skin, which carries more pain-sensing nerve endings than the lymph node ILIT targets. Pain tolerance still varies from person to person.",
  },
  {
    id: "faq-ultrasound",
    q: "Why is ultrasound used for ILIT injections?",
    a: "A lymph node is a small, specific target just under the skin, and ultrasound lets your allergist see exactly where it is before injecting instead of relying on touch alone. It's the same core technology used to monitor a pregnancy. High-frequency sound waves build a live image with no radiation involved, which makes it safe for routine, repeated use.",
  },
  {
    id: "faq-safety",
    q: "Is ILIT safe?",
    a: "Current research supports it. ILIT goes into a lymph node rather than fatty tissue, an area with far fewer of the cells that trigger allergic reactions. In the randomized controlled trial that established ILIT, patients had significantly fewer adverse reactions than with standard allergy shots, with an equivalent long-term result. Mild reactions are still possible with any immunotherapy, which is why every appointment includes an in-office monitoring period.",
  },
  {
    id: "faq-fda",
    q: "Is ILIT FDA-approved?",
    a: "Not yet. ILIT began clinical trials in the 2000s but hasn't been reviewed for FDA approval. That's not unique to it. Sublingual immunotherapy (allergy drops) has been used for decades and also isn't FDA-approved, largely because approval requires years of accumulated data a newer treatment hasn't had time to generate.",
  },
  {
    q: "How much does ILIT typically cost?",
    a: "Cost varies by provider and treatment plan. Because ILIT is typically self-pay, ask any practice you're considering for their current pricing directly.",
  },
  {
    q: "Is ILIT covered by insurance?",
    a: "ILIT is typically self-pay and not covered by most insurance plans, unlike SCIT (allergy shots), which is often covered. Confirm coverage details with your own insurer.",
  },
];

export default async function LearnAboutIlitPage() {
  const comparisonArticle = await db.article.findFirst({
    where: { slug: COMPARISON_SLUG, status: "PUBLISHED" },
    include: { author: true },
  });

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(symptomsJsonLd) }} />

      <section className="relative isolate overflow-hidden border-b border-line">
        <Image
          src={HERO_IMAGE}
          alt="Open green field under a clear blue sky"
          fill
          preload
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-black/30" />
        <div className="max-w-2xl px-6 py-14 text-white sm:px-10 sm:py-20">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Learn About ILIT (Intralymphatic Immunotherapy)
          </h1>
          <p className="mt-5 text-lg font-semibold">Imagine...</p>
          <ul className="mt-1 space-y-1 text-base sm:text-lg">
            <li>Feeling relief in a handful of visits instead of years.</li>
            <li>Skipping weekly appointments for allergy shots.</li>
            <li>Spending more time living, not managing symptoms.</li>
          </ul>
          <Link
            href="/find-an-ilit-provider"
            className="mt-7 inline-block rounded bg-action px-5 py-3 text-sm font-semibold text-white hover:bg-action-hover"
          >
            Find a Provider
          </Link>
        </div>
      </section>

      <section className="border-b border-line px-6 py-10 sm:px-10">
        <h2 className="mb-3 text-2xl font-bold">What is ILIT?</h2>
        {/* User-provided copy (2026-09-23), one edit made: "injected
            painlessly" softened to "with minimal discomfort for most
            patients". "Painlessly" is an absolute claim that contradicts
            this page's own pain FAQs, and the style guide bans it. */}
        <p className="max-w-3xl text-base text-foreground">
          ILIT (intralymphatic immunotherapy) is an allergy treatment in which small amounts of allergen are
          injected directly into a lymph node, with minimal discomfort for most patients, over a few monthly
          visits, rather than the years-long course associated with traditional allergy shots (SCIT) or allergy
          drops (SLIT).
        </p>
        <ol className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
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
      </section>

      <section className="border-b border-line bg-bg-alt px-6 py-10 sm:px-10">
        <h2 className="mb-5 text-2xl font-bold">Is ILIT Right for Me?</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded border border-line bg-white p-5">
            <h3 className="text-lg font-bold">Does This Sound Familiar?</h3>
            <p className="mb-4 text-sm text-muted">Common Allergy Symptoms &amp; Triggers</p>
            <ul className="space-y-2.5 text-sm">
              {SYMPTOMS.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5">
                  <span className="text-base">{s.icon}</span>
                  {s.label}
                </li>
              ))}
            </ul>
            <div className="mt-auto border-t border-line pt-4">
              <p className="mt-1 mb-3 text-sm font-semibold">
                Connect with an Open Air Allergy Network provider to see if ILIT can help you.
              </p>
              <Link
                href="/find-an-ilit-provider"
                className="inline-block rounded bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
              >
                Find a Provider
              </Link>
            </div>
          </div>
          <div className="flex flex-col rounded border border-line bg-white p-5">
            <h3 className="text-lg font-bold">What Can ILIT Treat?</h3>
            <p className="mb-4 text-sm text-muted">Allergens &amp; Conditions ILIT Can Address</p>
            <ul className="flex flex-1 flex-col divide-y divide-line">
              {TREATS.map((t) => (
                <li key={t.title} className="flex flex-1 items-start gap-2.5 py-3 first:pt-0 last:pb-0">
                  <span className="text-base leading-5">{t.icon}</span>
                  <div className="text-sm">
                    <h4 className="font-bold">{t.title}</h4>
                    <p className="text-foreground/80">{t.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-6 py-10 sm:px-10">
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
        <div className={`mt-7 grid grid-cols-1 items-start gap-6 ${comparisonArticle ? "lg:grid-cols-[2fr_1fr]" : ""}`}>
          <div className="max-w-3xl border-l-4 border-action pl-4 text-base text-foreground">
            <p>
              All three immunotherapies are valid options, and cost and timeline are usually what decide it. SCIT
              and SLIT have the longer track record and are more likely to be covered by insurance, but both run
              for years. ILIT compresses that into a handful of visits over a few months, at the tradeoff of
              being newer and generally self-pay today. Allergy medicine works differently. It can control
              day-to-day symptoms well, but it doesn&apos;t change the underlying allergy, so most people keep
              taking it indefinitely.
            </p>
            <p className="mt-3">
              Discuss your treatment options with a{" "}
              <Link href="/find-an-ilit-provider" className="font-semibold text-sage hover:underline">
                provider in your area →
              </Link>
            </p>
          </div>
          {comparisonArticle && (
            <div>
              <div className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                Read the full comparison
              </div>
              <ArticleCard article={comparisonArticle} />
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-line bg-bg-alt px-6 py-10 sm:px-10">
        <h2 className="mb-5 text-2xl font-bold">Is ILIT Safe?</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {SAFETY_POINTS.map((point) => (
            <div key={point.title} className="flex flex-col rounded border border-t-4 border-line border-t-action bg-white p-5">
              <h3 className="mb-2 font-bold">{point.title}</h3>
              <p className="flex-1 text-sm text-foreground/80">{point.text}</p>
              <FaqJumpLink targetId={point.faqId} className="mt-3 text-sm font-semibold text-sage">
                More in the FAQ below →
              </FaqJumpLink>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line px-6 py-10 sm:px-10">
        <h2 className="mb-5 text-2xl font-bold">More Allergy Treatment Guides</h2>
        {/* The /learn-about-ilit/[slug] cluster pages, minus the comparison
            article already featured above. Promoting individual pages into
            global nav is a later, traffic-data-driven decision. */}
        <ArticleFeed section="LEARN" limit={6} emptyHidden oldestFirst excludeArticleId={comparisonArticle?.id} />
      </section>

      <section id="faq" className="scroll-mt-4 border-b border-line bg-bg-alt px-6 py-10 sm:px-10">
        <h2 className="mb-4 text-2xl font-bold">Frequently Asked Questions</h2>
        {/* Native <details> so the full answer text stays in the initial HTML
            (crawlable, and mirrored in the FAQPage JSON-LD above). */}
        <div className="max-w-3xl">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} id={item.id} className="group scroll-mt-4 border-b border-line py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-xl leading-none text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-foreground/80">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-b border-line px-6 py-10 sm:px-10">
        <h2 className="mb-5 text-2xl font-bold">Recent Blog Articles from Our Providers</h2>
        <ArticleFeed limit={3} providerCreditedOnly emptyHidden />
        <Link href="/blog" className="mt-5 inline-block text-sm font-semibold text-sage">
          View all blog articles →
        </Link>
      </section>

      <div className="mx-6 my-8 rounded bg-action p-6 text-white sm:mx-10">
        <div className="mb-4 text-base font-semibold">Still have questions? Search available providers near you.</div>
        <ZipSearchForm variant="dark" />
      </div>
    </>
  );
}
