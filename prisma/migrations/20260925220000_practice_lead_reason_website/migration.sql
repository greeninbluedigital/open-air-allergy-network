-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it doesn't know about (see the restore_geog_index migrations).
-- Both columns are nullable, so the currently deployed code keeps working.
ALTER TABLE "PracticeLead" ADD COLUMN "reason" TEXT;
ALTER TABLE "PracticeLead" ADD COLUMN "website" TEXT;
