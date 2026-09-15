import Link from "next/link";
import { ZipSearchForm } from "@/components/ZipSearchForm";
import { ArticleFeed } from "@/components/ArticleFeed";
import { SYMPTOMS as ALL_SYMPTOMS } from "@/lib/content";

// Homepage gets a compact 4-item subset — Learn About ILIT shows the fuller
// list (Section design note: "a single row, not the fuller two-column card
// treatment those pages use").
const SYMPTOMS = ALL_SYMPTOMS.slice(0, 4);

export default function HomePage() {
  return (
    <>
      {/* Hero / FAP module */}
      <section className="relative border-b border-line">
        <div className="h-64 bg-bg-alt sm:h-80" />
        <div className="mx-6 -mt-16 max-w-sm rounded border border-line bg-white p-5 shadow-lg sm:absolute sm:bottom-6 sm:left-10 sm:mx-0 sm:mt-0">
          <p className="mb-1 text-lg font-bold">
            Allergy season shouldn&apos;t mean missing yours.
          </p>
          <p className="mb-3.5 text-xs text-muted">
            See ILIT providers near you.
          </p>
          <ZipSearchForm />
        </div>
      </section>

      {/* Symptoms strip */}
      <section className="border-b border-line bg-sand px-6 py-8 text-center sm:px-10">
        <h2 className="mb-1 text-lg font-bold">Does this sound familiar?</h2>
        <p className="mb-5 text-sm text-muted">
          Sneezing, itchy eyes, and seasonal misery aren&apos;t something you
          have to just live with.
        </p>
        <div className="mb-4 flex flex-wrap justify-center gap-6">
          {SYMPTOMS.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span className="text-base">{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
        <Link
          href="/learn-about-ilit"
          className="inline-block text-sm font-semibold text-sage"
        >
          Learn about ILIT →
        </Link>
      </section>

      {/* Credibility */}
      <section className="border-b border-line px-6 py-9 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">
          Testimonials & medical reference content
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-h-36 rounded border border-line bg-bg-alt p-4" />
          ))}
        </div>
        <Link
          href="/learn-about-ilit"
          className="mt-3.5 inline-block text-sm font-semibold"
        >
          See more testimonials & research → Learn About ILIT
        </Link>
      </section>

      {/* Verification + growth */}
      <section className="border-b border-line px-6 py-9 sm:px-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase">
              Every listed practice, personally verified
            </h3>
            <p className="text-sm text-foreground/80">
              Before a practice appears in our directory, we confirm they
              actually offer ILIT — no automated listings, no guesswork.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted uppercase">
              A fast-growing treatment
            </h3>
            <p className="text-sm text-foreground/80">
              More allergy practices are adding ILIT every year as an option
              alongside traditional immunotherapy.
            </p>
          </div>
        </div>
      </section>

      {/* Recent from Blog */}
      <section className="border-b border-line px-6 py-9 sm:px-10">
        <h2 className="mb-4 text-xl font-bold">Recent from the Blog</h2>
        <ArticleFeed pinnedToSlot="homepage_recent" limit={3} />
      </section>

      {/* Bookend FAP */}
      <section className="flex flex-col items-start gap-4 border-b border-line bg-dark-panel px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="text-base font-semibold">
          Still haven&apos;t searched? Find a provider near you.
        </div>
        <div className="w-full sm:w-auto">
          <ZipSearchForm variant="dark" />
        </div>
      </section>

      {/* Practice teaser */}
      <section className="flex flex-col items-start gap-4 bg-dark-panel px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="text-base font-semibold">
          Are you a provider? Join the network.
        </div>
        <Link
          href="/for-practices"
          className="rounded border border-white px-4 py-2.5 text-sm whitespace-nowrap"
        >
          For Practices →
        </Link>
      </section>
    </>
  );
}
