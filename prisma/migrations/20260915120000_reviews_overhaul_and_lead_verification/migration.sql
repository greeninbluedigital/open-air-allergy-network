-- CreateEnum
CREATE TYPE "LeadConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNVERIFIED_FORWARDED');

-- AlterTable: ContactSubmission — lead email verification (Section 4)
ALTER TABLE "ContactSubmission"
  ADD COLUMN "confirmationStatus" "LeadConfirmationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "confirmationToken" TEXT,
  ADD COLUMN "confirmedAt" TIMESTAMP(3),
  ADD COLUMN "forwardedAt" TIMESTAMP(3);

-- Backfill: confirmationToken has no real DB-level default (Prisma's cuid()
-- default is generated client-side), so existing rows need a value before
-- the column can become NOT NULL. Only real production concern would be
-- pre-existing leads; using each row's own id (already unique) as the
-- source is enough to satisfy uniqueness for this one-time backfill.
UPDATE "ContactSubmission" SET "confirmationToken" = 'backfilled-' || "id" WHERE "confirmationToken" IS NULL;

ALTER TABLE "ContactSubmission" ALTER COLUMN "confirmationToken" SET NOT NULL;

CREATE UNIQUE INDEX "ContactSubmission_confirmationToken_key" ON "ContactSubmission"("confirmationToken");
CREATE INDEX "ContactSubmission_confirmationStatus_createdAt_idx" ON "ContactSubmission"("confirmationStatus", "createdAt");

-- AlterTable: Provider — Reviews overhaul (Section 3/4)
ALTER TABLE "Provider" ADD COLUMN "showReviews" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: fold the two old per-platform flags into the new single toggle
-- before dropping them, rather than silently losing which providers had
-- reviews enabled.
UPDATE "Provider" SET "showReviews" = "showGoogleReviews" OR "showYelpReviews";

ALTER TABLE "Provider"
  DROP COLUMN "showGoogleReviews",
  DROP COLUMN "showYelpReviews",
  DROP COLUMN "yelpPlaceId",
  ADD COLUMN "yelpEmbedCode1" TEXT,
  ADD COLUMN "yelpEmbedCode2" TEXT,
  ADD COLUMN "yelpEmbedCode3" TEXT,
  ADD COLUMN "yelpRating" DOUBLE PRECISION,
  ADD COLUMN "yelpReviewCount" INTEGER;
