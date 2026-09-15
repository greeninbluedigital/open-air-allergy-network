-- DropIndex
DROP INDEX "Provider_geog_idx";

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "yelpBusinessId" TEXT,
ADD COLUMN     "yelpRatingBadgeEmbed" TEXT,
ADD COLUMN     "yelpReviewsFetchedAt" TIMESTAMP(3);
