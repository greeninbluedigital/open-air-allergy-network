-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it does not know about (see the restore_geog_index migrations).
-- Renamed pre-launch: the badge is a custom message, not a promotional offer.
ALTER TABLE "Provider" RENAME COLUMN "specialOffer" TO "customMessage";
