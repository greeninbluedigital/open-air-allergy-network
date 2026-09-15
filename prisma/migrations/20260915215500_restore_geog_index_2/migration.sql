-- Restores the GiST index dropped by the previous migration
-- (20260915215414_add_yelp_api_readiness) — same recurring false-positive as
-- 20260914234500_restore_geog_index: Prisma's dev-mode drift checker doesn't
-- recognize an index on an Unsupported column as schema-declared, so it
-- proposes (and, when applied without a --create-only review pass, executes)
-- a DROP INDEX for it every time. See the CAUTION comment on Provider.geog
-- in schema.prisma — always review with --create-only before applying.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
