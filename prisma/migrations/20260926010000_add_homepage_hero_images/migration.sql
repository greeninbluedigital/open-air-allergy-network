-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it doesn't know about (see the restore_geog_index migrations).
CREATE TABLE "HomepageHeroImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "HomepageHeroImage_pkey" PRIMARY KEY ("id")
);
