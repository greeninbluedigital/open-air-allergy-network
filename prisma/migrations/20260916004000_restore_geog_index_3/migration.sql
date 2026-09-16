-- Restores the GiST index dropped by the previous migration
-- (20260916003946_add_analytics_events) — same recurring false-positive as
-- 20260914234500_restore_geog_index and 20260915215500_restore_geog_index_2:
-- Prisma's dev-mode drift checker doesn't recognize an index on an
-- Unsupported column as schema-declared, so it proposes (and, without a
-- --create-only review pass catching it first, executes) a DROP INDEX for it
-- basically every time this schema changes. See the CAUTION comment on
-- Provider.geog in schema.prisma.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
