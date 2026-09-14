-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE_CLAIMED', 'VERIFIED', 'FULL_PROFILE', 'FEATURED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'SUBMITTED');

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT,
    "practiceName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "website" TEXT,
    "tier" "Tier" NOT NULL DEFAULT 'FREE_CLAIMED',
    "foundingMember" BOOLEAN NOT NULL DEFAULT false,
    "geoExtension" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "verifiedAsOf" TIMESTAMP(3),
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "billingReference" TEXT,
    "nextBillingDate" TIMESTAMP(3),
    "searchRadiusMiles" INTEGER NOT NULL DEFAULT 200,
    "offersVideoConsult" BOOLEAN NOT NULL DEFAULT false,
    "offersPhoneConsult" BOOLEAN NOT NULL DEFAULT false,
    "shortBio" TEXT,
    "extendedBio" TEXT,
    "photoUrl" TEXT,
    "secondaryPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "businessHours" TEXT,
    "ilitScheduleNotes" TEXT,
    "vertical" TEXT NOT NULL DEFAULT 'ILIT/Allergy',
    "showGoogleReviews" BOOLEAN NOT NULL DEFAULT false,
    "googlePlaceId" TEXT,
    "showYelpReviews" BOOLEAN NOT NULL DEFAULT false,
    "yelpPlaceId" TEXT,
    "showFacebookReviews" BOOLEAN NOT NULL DEFAULT false,
    "facebookPageId" TEXT,
    "customField1" TEXT,
    "customField2" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "vertical" TEXT NOT NULL DEFAULT 'ILIT/Allergy',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderTreatment" (
    "providerId" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,

    CONSTRAINT "ProviderTreatment_pkey" PRIMARY KEY ("providerId","treatmentId")
);

-- CreateTable
CREATE TABLE "ProviderBadge" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderFaqItem" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProviderFaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorProvider" (
    "authorId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "AuthorProvider_pkey" PRIMARY KEY ("authorId","providerId")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "slug" TEXT NOT NULL,
    "authorId" TEXT,
    "providerCreditedId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "featureImageUrl" TEXT,
    "authorPhotoUrl" TEXT,
    "pinnedTo" TEXT,
    "publishedDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleFaqItem" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArticleFaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemLandingPage" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "targetMetroName" TEXT NOT NULL,
    "travelNarrative" TEXT,
    "urlSlug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemLandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "semHeroBlurb" TEXT NOT NULL DEFAULT '',
    "excludeHouseArticlesWhenPafActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- CreateIndex
CREATE INDEX "Provider_groupId_idx" ON "Provider"("groupId");

-- CreateIndex
CREATE INDEX "Provider_tier_idx" ON "Provider"("tier");

-- CreateIndex
CREATE INDEX "Provider_active_idx" ON "Provider"("active");

-- CreateIndex
CREATE INDEX "Provider_city_state_idx" ON "Provider"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Treatment_vertical_slug_key" ON "Treatment"("vertical", "slug");

-- CreateIndex
CREATE INDEX "ProviderTreatment_treatmentId_idx" ON "ProviderTreatment"("treatmentId");

-- CreateIndex
CREATE INDEX "ProviderBadge_providerId_idx" ON "ProviderBadge"("providerId");

-- CreateIndex
CREATE INDEX "ProviderFaqItem_providerId_idx" ON "ProviderFaqItem"("providerId");

-- CreateIndex
CREATE INDEX "AuthorProvider_providerId_idx" ON "AuthorProvider"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_providerCreditedId_idx" ON "Article"("providerCreditedId");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_publishedDate_idx" ON "Article"("publishedDate");

-- CreateIndex
CREATE INDEX "ArticleFaqItem_articleId_idx" ON "ArticleFaqItem"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "SemLandingPage_urlSlug_key" ON "SemLandingPage"("urlSlug");

-- CreateIndex
CREATE INDEX "SemLandingPage_providerId_idx" ON "SemLandingPage"("providerId");

-- AddForeignKey
ALTER TABLE "ProviderTreatment" ADD CONSTRAINT "ProviderTreatment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderTreatment" ADD CONSTRAINT "ProviderTreatment_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderBadge" ADD CONSTRAINT "ProviderBadge_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderFaqItem" ADD CONSTRAINT "ProviderFaqItem_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorProvider" ADD CONSTRAINT "AuthorProvider_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorProvider" ADD CONSTRAINT "AuthorProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_providerCreditedId_fkey" FOREIGN KEY ("providerCreditedId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleFaqItem" ADD CONSTRAINT "ArticleFaqItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemLandingPage" ADD CONSTRAINT "SemLandingPage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PostGIS: radius/distance search support for the SRP.
-- Prisma's schema language has no PostGIS type, so this column is managed by raw
-- SQL only (declared as Unsupported() in schema.prisma for introspection sanity).
-- A trigger keeps it in sync whenever latitude/longitude change, so the app only
-- ever writes the plain lat/long columns; geog is derived, never written directly.
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "Provider" ADD COLUMN "geog" geography(Point, 4326);

CREATE OR REPLACE FUNCTION provider_set_geog() RETURNS trigger AS $$
BEGIN
  IF NEW."latitude" IS NOT NULL AND NEW."longitude" IS NOT NULL THEN
    NEW."geog" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  ELSE
    NEW."geog" := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_geog_trigger
  BEFORE INSERT OR UPDATE OF "latitude", "longitude" ON "Provider"
  FOR EACH ROW EXECUTE FUNCTION provider_set_geog();

CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
