-- Restores the GiST index dropped by the previous migration
-- (20260917201318_add_provider_srp_photo) — the same recurring
-- false-positive as the five restores before it. See the CAUTION comment on
-- Provider.geog in schema.prisma.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
