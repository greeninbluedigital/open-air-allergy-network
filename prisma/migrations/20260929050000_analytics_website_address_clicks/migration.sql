-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it doesn't know about (see the restore_geog_index migrations).
ALTER TYPE "AnalyticsEventType" ADD VALUE 'WEBSITE_CLICK';
ALTER TYPE "AnalyticsEventType" ADD VALUE 'ADDRESS_CLICK';
