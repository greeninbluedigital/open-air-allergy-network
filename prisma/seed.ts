import "dotenv/config";
import { db } from "../src/lib/db";

// Deliberately minimal. The database is production, and everything real
// lives elsewhere:
// - Practices come from the Google Sheet sync (src/lib/sync.ts). The old
//   demo practices, demo author and demo SEM page were deleted for good
//   (2026-09-30); the sheet's example-allergy-practice-* rows replace them.
// - Articles are written straight to the database
//   (scripts/publish-article.ts, docs/blog-content-guide.md).
// - Legal pages are published from docs/legal-pages/
//   (scripts/publish-legal-pages.ts). Never seed them: an upsert here would
//   overwrite the live pages with placeholders.
async function main() {
  // Create-only: never overwrites an edited blurb.
  await db.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      semHeroBlurb:
        "ILIT treats allergies in a handful of visits, not years — worth a conversation with your doctor.",
    },
  });

  console.log("Seed complete: site settings present.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
