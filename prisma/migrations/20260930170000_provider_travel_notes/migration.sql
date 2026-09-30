-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it doesn't know about (see the restore_geog_index migrations).
ALTER TABLE "Provider" ADD COLUMN "travelNotes" TEXT;
