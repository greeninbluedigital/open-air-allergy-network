-- Per-article credit type: "Contributed by" (author) or "Medically reviewed
-- by" (reviewer). Optional: blank keeps each section's default.
CREATE TYPE "ArticleCreditType" AS ENUM ('CONTRIBUTED', 'MEDICALLY_REVIEWED');
ALTER TABLE "Article" ADD COLUMN "creditType" "ArticleCreditType";
