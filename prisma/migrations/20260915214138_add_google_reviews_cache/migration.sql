-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "googleRating" DOUBLE PRECISION,
ADD COLUMN     "googleReviewCount" INTEGER,
ADD COLUMN     "googleReviewsFetchedAt" TIMESTAMP(3),
ADD COLUMN     "googleReviewsJson" JSONB;
