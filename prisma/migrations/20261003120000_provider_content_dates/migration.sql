-- Content-change tracking for the sitemap lastmod and IndexNow.
ALTER TABLE "Provider" ADD COLUMN "contentHash" TEXT,
ADD COLUMN "contentUpdatedAt" TIMESTAMP(3);
