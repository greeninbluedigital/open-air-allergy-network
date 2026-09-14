import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("Seeding sample data...");

  const featured = await db.provider.upsert({
    where: { slug: "example-ilit-allergy-center" },
    update: {},
    create: {
      slug: "example-ilit-allergy-center",
      practiceName: "Example ILIT & Allergy Center",
      address: "123 Main St",
      city: "Beverly Hills",
      state: "CA",
      zip: "90210",
      latitude: 34.0736,
      longitude: -118.4004,
      phone: "(310) 555-0134",
      website: "https://example.com",
      tier: "FEATURED",
      foundingMember: true,
      active: true,
      subscriptionStatus: "ACTIVE",
      verifiedAsOf: new Date(),
      offersVideoConsult: true,
      offersPhoneConsult: true,
      shortBio: "Leading ILIT and allergy care in the Los Angeles area.",
      extendedBio:
        "Example ILIT & Allergy Center has provided comprehensive allergy care to the Los Angeles community for over a decade, with a dedicated focus on intralymphatic immunotherapy (ILIT) alongside traditional treatment options.",
      businessHours: "Tue-Fri: 8am-5pm; Sat: 9am-1pm",
      ilitScheduleNotes: "ILIT administered Tuesdays and Thursdays only.",
    },
  });

  const verified = await db.provider.upsert({
    where: { slug: "example-verified-practice" },
    update: {},
    create: {
      slug: "example-verified-practice",
      practiceName: "Example Verified Practice",
      address: "45 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90024",
      latitude: 34.0669,
      longitude: -118.4453,
      phone: "(310) 555-0198",
      tier: "VERIFIED",
      active: true,
      subscriptionStatus: "ACTIVE",
      verifiedAsOf: new Date(),
      shortBio: "Allergy and immunology care serving West LA.",
    },
  });

  await db.provider.upsert({
    where: { slug: "example-free-listed-practice" },
    update: {},
    create: {
      slug: "example-free-listed-practice",
      practiceName: "Example Free-Listed Practice",
      address: "210 Pine Rd",
      city: "Inglewood",
      state: "CA",
      zip: "90301",
      latitude: 33.9617,
      longitude: -118.3531,
      tier: "FREE_CLAIMED",
      active: true,
    },
  });

  const author = await db.author.upsert({
    where: { id: "seed-author-jane-example" },
    update: {},
    create: {
      id: "seed-author-jane-example",
      name: "Dr. Jane Example",
      bio: "Board-certified allergist practicing at Example ILIT & Allergy Center.",
      providers: {
        create: { providerId: featured.id },
      },
    },
  });

  await db.article.upsert({
    where: { slug: "5-things-to-know-before-starting-ilit" },
    update: {},
    create: {
      slug: "5-things-to-know-before-starting-ilit",
      status: "PUBLISHED",
      authorId: author.id,
      providerCreditedId: featured.id,
      tags: ["Practice Spotlight", "ILIT Basics"],
      title: "5 Things to Know Before Starting ILIT",
      body: "If you're considering intralymphatic immunotherapy, here are five things your allergist wants you to know before your first visit...",
      publishedDate: new Date("2026-08-12"),
    },
  });

  await db.article.upsert({
    where: { slug: "ilit-growth-in-us-allergy-practices" },
    update: {},
    create: {
      slug: "ilit-growth-in-us-allergy-practices",
      status: "PUBLISHED",
      tags: ["Clinical Research"],
      title: "ILIT Growth in U.S. Allergy Practices",
      body: "A growing number of allergy practices across the United States are adding intralymphatic immunotherapy to their treatment offerings...",
      publishedDate: new Date("2026-09-02"),
      pinnedTo: "blog_featured",
    },
  });

  await db.article.upsert({
    where: { slug: "ilit-vs-scit-vs-slit-a-full-comparison" },
    update: {},
    create: {
      slug: "ilit-vs-scit-vs-slit-a-full-comparison",
      status: "PUBLISHED",
      tags: ["House", "Comparisons"],
      title: "ILIT vs. SCIT vs. SLIT: A Full Comparison",
      body: "Choosing an allergy immunotherapy option is a personal decision best made with your doctor. Here's how ILIT, SCIT, and SLIT compare on duration, visit count, and administration...",
      publishedDate: new Date("2026-08-20"),
    },
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
