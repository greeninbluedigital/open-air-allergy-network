-- Restores the GiST index dropped by the previous migration
-- (20260914233621_add_contact_submission) — Prisma's dev-mode drift checker
-- doesn't recognize an index on an Unsupported column as schema-declared, so
-- it silently proposed (and, since this was applied without --create-only
-- review, executed) a DROP INDEX for it. See the CAUTION comment on
-- Provider.geog in schema.prisma.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
