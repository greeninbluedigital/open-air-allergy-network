-- Hand-written: `prisma migrate dev` also tries to drop the PostGIS geog
-- index it doesn't know about (see the restore_geog_index migrations).
ALTER TYPE "AnalyticsEventType" ADD VALUE 'HOMEPAGE_IMPRESSION';
ALTER TYPE "AnalyticsEventType" ADD VALUE 'SRP_IMPRESSION';
ALTER TYPE "AnalyticsEventType" ADD VALUE 'PDP_NEARBY_IMPRESSION';
