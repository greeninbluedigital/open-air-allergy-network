-- DropIndex
DROP INDEX "Provider_geog_idx";

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "srpPhotoUrl" TEXT;
