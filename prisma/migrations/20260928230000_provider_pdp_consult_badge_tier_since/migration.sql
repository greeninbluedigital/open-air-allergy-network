-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it doesn't know about (see the restore_geog_index migrations).
ALTER TABLE "Provider" ADD COLUMN "pdpRemoteConsultBadge" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Provider" ADD COLUMN "tierSince" TIMESTAMP(3);

-- No tier history exists before this migration; creation date is the best
-- available starting point.
UPDATE "Provider" SET "tierSince" = "createdAt";
