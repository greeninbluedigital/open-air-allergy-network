-- Fingerprint of the sheet data the last sync read; the page cache is only
-- cleared when it changes (src/lib/sync.ts).
ALTER TABLE "SiteSetting" ADD COLUMN "syncFingerprint" TEXT NOT NULL DEFAULT '';
