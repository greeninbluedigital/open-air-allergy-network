import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("Seeding sample data...");

  const featuredData = {
    practiceName: "Example ILIT & Allergy Center",
    address: "123 Main St",
    addressLine2: "Suite 200",
    city: "Beverly Hills",
    state: "CA",
    zip: "90210",
    latitude: 34.0736,
    longitude: -118.4004,
    phone: "(310) 555-0134",
    website: "https://example.com",
    notificationEmail: "leads@example.com",
    showReviews: true,
    googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    // Stands in for what /api/reviews/refresh would populate — lets the
    // Reviews module render fully in local dev without a live API key.
    googleRating: 4.8,
    googleReviewCount: 63,
    googleReviewsJson: [
      { authorName: "Priya S.", rating: 5, text: "The ILIT protocol here got my seasonal allergies under control in a handful of visits. Wish I'd found them years ago." },
      { authorName: "Marcus T.", rating: 5, text: "Friendly staff, clear explanations, and the treatment actually worked. Highly recommend for anyone tired of daily allergy meds." },
      { authorName: "Dana K.", rating: 4, text: "Good experience overall. Scheduling ILIT appointments around their Tue/Thu slots took some planning, but worth it." },
    ],
    googleReviewsFetchedAt: new Date(),
    // Today's state: free badge widget, manually pasted (no YELP_API_KEY
    // yet). yelpBusinessId is filled in now so switching to the paid API
    // later needs no sheet/data changes, just the env var.
    yelpRatingBadgeEmbed:
      '<div style="font:12px sans-serif;border:1px solid #ccc;padding:8px;border-radius:4px;display:inline-block;">★★★★☆ 4.5 (128 reviews) on Yelp</div>',
    yelpBusinessId: "example-ilit-allergy-center-beverly-hills",
    // Explicit nulls: upsert's `update` only touches listed fields, and an
    // earlier seed run set these directly — without this they'd never clear
    // back to the real "API not active yet" state this demo data represents.
    yelpRating: null,
    yelpReviewCount: null,
    tier: "FEATURED" as const,
    foundingMember: true,
    active: true,
    subscriptionStatus: "ACTIVE" as const,
    verifiedAsOf: new Date(),
    offersVideoConsult: true,
    offersPhoneConsult: true,
    shortBio: "Leading ILIT and allergy care in the Los Angeles area.",
    extendedBio:
      "Example ILIT & Allergy Center has provided comprehensive allergy care to the Los Angeles community for over a decade.\n\nWe have a dedicated focus on intralymphatic immunotherapy (ILIT) alongside traditional treatment options, and our team works closely with each patient to find the right fit.",
    businessHours: "Tue-Fri: 8am-5pm; Sat: 9am-1pm",
    ilitScheduleNotes: "ILIT administered Tuesdays and Thursdays only.",
  };
  const featured = await db.provider.upsert({
    where: { slug: "example-ilit-allergy-center" },
    update: featuredData,
    create: { slug: "example-ilit-allergy-center", ...featuredData },
  });

  const verifiedData = {
    practiceName: "Example Verified Practice",
    address: "45 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    zip: "90024",
    latitude: 34.0669,
    longitude: -118.4453,
    phone: "(310) 555-0198",
    tier: "VERIFIED" as const,
    active: true,
    subscriptionStatus: "ACTIVE" as const,
    verifiedAsOf: new Date(),
    shortBio: "Allergy and immunology care serving West LA.\n\nCall to schedule a consultation.",
  };
  const verified = await db.provider.upsert({
    where: { slug: "example-verified-practice" },
    update: verifiedData,
    create: { slug: "example-verified-practice", ...verifiedData },
  });

  const freeData = {
    practiceName: "Example Free-Listed Practice",
    address: "210 Pine Rd",
    city: "Inglewood",
    state: "CA",
    zip: "90301",
    latitude: 33.9617,
    longitude: -118.3531,
    tier: "FREE_CLAIMED" as const,
    active: true,
  };
  await db.provider.upsert({
    where: { slug: "example-free-listed-practice" },
    update: freeData,
    create: { slug: "example-free-listed-practice", ...freeData },
  });

  const authorData = {
    name: "Dr. Jane Example",
    bio: "Board-certified allergist practicing at Example ILIT & Allergy Center.",
  };
  const author = await db.author.upsert({
    where: { id: "seed-author-jane-example" },
    update: authorData,
    create: {
      id: "seed-author-jane-example",
      ...authorData,
      providers: { create: { providerId: featured.id } },
    },
  });

  const article1Data = {
    status: "PUBLISHED" as const,
    authorId: author.id,
    providerCreditedId: featured.id,
    tags: ["Practice Spotlight", "ILIT Basics"],
    title: "5 Things to Know Before Starting ILIT",
    body: "If you're considering intralymphatic immunotherapy, here are five things your allergist wants you to know before your first visit...",
    publishedDate: new Date("2026-08-12"),
  };
  await db.article.upsert({
    where: { slug: "5-things-to-know-before-starting-ilit" },
    update: article1Data,
    create: { slug: "5-things-to-know-before-starting-ilit", ...article1Data },
  });

  const article2Data = {
    status: "PUBLISHED" as const,
    tags: ["Clinical Research"],
    title: "ILIT Growth in U.S. Allergy Practices",
    body: "A growing number of allergy practices across the United States are adding intralymphatic immunotherapy to their treatment offerings...",
    publishedDate: new Date("2026-09-02"),
    pinnedTo: "blog_featured",
  };
  await db.article.upsert({
    where: { slug: "ilit-growth-in-us-allergy-practices" },
    update: article2Data,
    create: { slug: "ilit-growth-in-us-allergy-practices", ...article2Data },
  });

  const article3Data = {
    status: "PUBLISHED" as const,
    tags: ["House", "Comparisons"],
    title: "ILIT vs. SCIT vs. SLIT: A Full Comparison",
    body: "Choosing an allergy immunotherapy option is a personal decision best made with your doctor. Here's how ILIT, SCIT, and SLIT compare on duration, visit count, and administration...",
    publishedDate: new Date("2026-08-20"),
  };
  await db.article.upsert({
    where: { slug: "ilit-vs-scit-vs-slit-a-full-comparison" },
    update: article3Data,
    create: { slug: "ilit-vs-scit-vs-slit-a-full-comparison", ...article3Data },
  });

  await db.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      semHeroBlurb:
        "ILIT treats allergies in a handful of visits, not years — worth a conversation with your doctor.",
    },
  });

  // Legal page shells (footer's LEGAL_LINKS) — deliberately placeholder text,
  // clearly marked as such. Not legal advice, not a substitute for counsel
  // review; the site owner plans to publish with this draft copy and revise
  // it as their lawyer reviews the live site. Edit directly via Prisma
  // Studio (or SQL) — no code change or redeploy needed.
  const draftNotice =
    '<p><em>Draft — pending legal review. This page is a placeholder and has not been reviewed by an attorney.</em></p>';
  const legalPages: { slug: string; title: string; bodyHtml: string }[] = [
    {
      slug: "privacy-notice",
      title: "Privacy Notice",
      bodyHtml: `${draftNotice}<h2>Information We Collect</h2><p>Placeholder — describe what's collected (contact form fields, UTM/analytics data, etc.).</p><h2>How We Use It</h2><p>Placeholder — describe use (forwarding inquiries to providers, site analytics).</p><h2>Contact Us</h2><p>Placeholder — contact email for privacy questions.</p>`,
    },
    {
      slug: "terms-and-conditions",
      title: "Terms & Conditions",
      bodyHtml: `${draftNotice}<h2>Use of This Site</h2><p>Placeholder — general terms of use.</p><h2>No Medical Advice</h2><p>Placeholder — this site is a directory, not a medical provider.</p><h2>Limitation of Liability</h2><p>Placeholder.</p>`,
    },
    {
      slug: "cookie-policy",
      title: "Cookie Policy",
      bodyHtml: `${draftNotice}<h2>Cookies We Use</h2><p>Placeholder — describe analytics/tracking cookies (GA4/GTM).</p><h2>Managing Cookies</h2><p>Placeholder.</p>`,
    },
    {
      slug: "privacy-choices",
      title: "My Privacy Choices",
      bodyHtml: `${draftNotice}<h2>Your Choices</h2><p>Placeholder — opt-out mechanisms, state-privacy-law disclosures (e.g. CCPA) if applicable.</p>`,
    },
    {
      slug: "medical-disclaimer",
      title: "Medical Disclaimer",
      bodyHtml: `${draftNotice}<h2>Not Medical Advice</h2><p>Placeholder — this site does not provide medical advice; consult a licensed provider for treatment decisions.</p>`,
    },
    {
      slug: "accessibility-statement",
      title: "Accessibility Statement",
      bodyHtml: `${draftNotice}<h2>Our Commitment</h2><p>Placeholder — accessibility standards targeted (e.g. WCAG 2.1 AA) and contact info for accessibility requests.</p>`,
    },
  ];
  for (const page of legalPages) {
    await db.legalPage.upsert({ where: { slug: page.slug }, update: page, create: page });
  }

  const lpData = {
    targetMetroName: "SF Bay Area",
    travelNarrative:
      "SFO → Burbank, ~1hr 15min flight. Many patients fly in for same-day appointments.",
    active: true,
  };
  await db.semLandingPage.upsert({
    where: { providerId_urlSlug: { providerId: featured.id, urlSlug: "sf-bay-area" } },
    update: lpData,
    create: { providerId: featured.id, urlSlug: "sf-bay-area", ...lpData },
  });

  console.log("Seed complete:", {
    providers: [featured.slug, verified.slug],
    author: author.name,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
