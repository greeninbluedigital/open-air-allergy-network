-- DropIndex
DROP INDEX "Provider_geog_idx";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "summaryPoints" TEXT[] DEFAULT ARRAY[]::TEXT[];
