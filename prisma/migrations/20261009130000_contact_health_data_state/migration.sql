-- The contact form's consumer health data state check: the visitor's answer
-- and the state their IP placed them in.
ALTER TABLE "ContactSubmission" ADD COLUMN "notInHealthDataState" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "ipRegion" TEXT;
