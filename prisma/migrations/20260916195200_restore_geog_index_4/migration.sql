-- Restores the GiST index dropped by the previous migration
-- (20260916195126_add_legal_pages) — the same recurring false-positive as
-- the three restores before it. See the CAUTION comment on Provider.geog in
-- schema.prisma; this keeps happening because Prisma's dev-mode drift
-- checker doesn't recognize an index on an Unsupported column as
-- schema-declared, so every schema change proposes dropping it again.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
