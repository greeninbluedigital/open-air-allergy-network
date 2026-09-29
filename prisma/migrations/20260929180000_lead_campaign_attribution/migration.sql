-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it doesn't know about (see the restore_geog_index migrations).
ALTER TABLE "ContactSubmission" ADD COLUMN "utmTerm" TEXT, ADD COLUMN "utmContent" TEXT, ADD COLUMN "gclid" TEXT, ADD COLUMN "landingPage" TEXT;
ALTER TABLE "PracticeLead" ADD COLUMN "utmTerm" TEXT, ADD COLUMN "utmContent" TEXT, ADD COLUMN "gclid" TEXT, ADD COLUMN "landingPage" TEXT;
ALTER TABLE "GeneralInquiry" ADD COLUMN "utmTerm" TEXT, ADD COLUMN "utmContent" TEXT, ADD COLUMN "gclid" TEXT, ADD COLUMN "landingPage" TEXT;
