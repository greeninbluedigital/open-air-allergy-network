-- Restores the GiST index dropped by the previous migration
-- (20260917064621_add_provider_is_demo) — the same recurring false-positive
-- as the four restores before it. See the CAUTION comment on Provider.geog
-- in schema.prisma.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
