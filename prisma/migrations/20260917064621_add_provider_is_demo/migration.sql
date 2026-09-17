-- DropIndex
DROP INDEX "Provider_geog_idx";

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;
