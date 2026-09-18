-- Restores the GiST index dropped by the previous migration
-- (20260918080335_add_article_summary_points) — the same recurring
-- false-positive as the six restores before it. See the CAUTION comment on
-- Provider.geog in schema.prisma.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
