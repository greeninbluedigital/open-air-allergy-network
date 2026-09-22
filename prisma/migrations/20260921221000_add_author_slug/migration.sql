-- AlterTable
ALTER TABLE "Author" ADD COLUMN "slug" TEXT;

-- Backfill the 2 existing rows (checked directly before writing this
-- migration — see the Practitioners sheet tab going forward for new ones).
UPDATE "Author" SET "slug" = 'sandra-ho' WHERE "id" = 'author-sandra-ho';
UPDATE "Author" SET "slug" = 'jane-example' WHERE "id" = 'seed-author-jane-example';

-- Enforce NOT NULL now that every row has a value.
ALTER TABLE "Author" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");
