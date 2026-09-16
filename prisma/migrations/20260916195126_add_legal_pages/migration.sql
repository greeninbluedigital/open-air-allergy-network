-- DropIndex
DROP INDEX "Provider_geog_idx";

-- CreateTable
CREATE TABLE "LegalPage" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalPage_pkey" PRIMARY KEY ("slug")
);
