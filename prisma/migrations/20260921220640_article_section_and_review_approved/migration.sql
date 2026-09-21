-- CreateEnum
CREATE TYPE "ArticleSection" AS ENUM ('BLOG', 'LEARN');

-- DropIndex
DROP INDEX "Provider_geog_idx";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "reviewApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "section" "ArticleSection" NOT NULL DEFAULT 'BLOG';

-- CreateIndex
CREATE INDEX "Article_section_idx" ON "Article"("section");
