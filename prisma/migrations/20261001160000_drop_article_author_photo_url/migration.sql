-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it does not know about (see the restore_geog_index migrations).
-- The credit box headshot now comes from Author.photoUrl (Practitioners tab).
ALTER TABLE "Article" DROP COLUMN "authorPhotoUrl";
