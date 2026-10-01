-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it does not know about (see the restore_geog_index migrations).
ALTER TABLE "Article" ADD COLUMN "metaDescription" TEXT, ADD COLUMN "featureImageAlt" TEXT;
